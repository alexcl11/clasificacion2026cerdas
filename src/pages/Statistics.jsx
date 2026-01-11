import { useState, useEffect } from 'react'
import { getPlayerOfMonth, getPreviousMonthChampions, getLeaderByDrink, getUserMonthConsumptions, getUserConsumptionsByDrink, getDrinks } from '../services/statistics'
import { supabase } from '../services/supabaseClient'
import { DEFAULT_AVATAR } from '../services/profile'
import styles from './Statistics.module.css'

export default function Statistics() {
  const [playerOfMonth, setPlayerOfMonth] = useState(null)
  const [previousChampions, setPreviousChampions] = useState([])
  const [drinkLeaders, setDrinkLeaders] = useState([])
  const [drinks, setDrinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [consumptions, setConsumptions] = useState([])
  const [modalTitle, setModalTitle] = useState('')

  useEffect(() => {
    loadStatistics()
  }, [])

  async function loadStatistics() {
    setLoading(true)
    try {
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth()

      // Obtener jugador del mes actual
      const player = await getPlayerOfMonth(currentYear, currentMonth)
      setPlayerOfMonth(player)

      // Obtener campeones de meses anteriores
      const champions = await getPreviousMonthChampions()
      setPreviousChampions(champions)

      // Obtener todas las bebidas
      const drinksData = await getDrinks()
      setDrinks(drinksData)

      // Obtener líder para cada bebida
      const leadersPromises = drinksData.map(async drink => {
        const leader = await getLeaderByDrink(drink.id)
        return { drink, leader }
      })

      const leaders = await Promise.all(leadersPromises)
      setDrinkLeaders(leaders)
    } catch (err) {
      console.error('Error loading statistics:', err)
    } finally {
      setLoading(false)
    }
  }

  async function showPlayerOfMonthDetails(userId, year, month) {
    if (!userId) return
    
    try {
      const startOfMonth = new Date(year, month, 1)
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59)
      
      const { data } = await supabase
        .from('consumptions')
        .select(`
          *,
          drinks (name, points)
        `)
        .eq('user_id', userId)
        .gte('consumed_at', startOfMonth.toISOString())
        .lte('consumed_at', endOfMonth.toISOString())
        .order('consumed_at', { ascending: false })
        
      const monthName = new Date(year, month).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
      const user = year === new Date().getFullYear() && month === new Date().getMonth() 
        ? playerOfMonth 
        : previousChampions.find(c => c.year === year && c.month === month)
      
      setConsumptions(data || [])
      setSelectedUser(user)
      setModalTitle(`Consumiciones de ${user?.username} en ${monthName}`)
    } catch (err) {
      console.error('Error loading consumptions:', err)
    }
  }

  async function showDrinkLeaderDetails(drinkId, drinkName, leader) {
    if (!leader) return
    
    try {
      const data = await getUserConsumptionsByDrink(leader.user_id, drinkId)
      setConsumptions(data)
      setSelectedUser(leader)
      setModalTitle(`Consumiciones de ${drinkName} por ${leader.username}`)
    } catch (err) {
      console.error('Error loading consumptions:', err)
    }
  }

  function closeModal() {
    setSelectedUser(null)
    setConsumptions([])
    setModalTitle('')
  }

  const currentMonth = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>📊 Estadísticas</h1>

        {loading ? (
          <p className={styles.loading}>Cargando estadísticas...</p>
        ) : (
          <>
            {/* Jugador del Mes */}
            <div 
              className={`${styles.card} ${styles.playerOfMonth}`}
              onClick={showPlayerOfMonthDetails}
              style={{ cursor: playerOfMonth ? 'pointer' : 'default' }}
            >
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>🏆 Jugador del Mes</h2>
                <p className={styles.monthLabel}>{currentMonth}</p>
              </div>
              {playerOfMonth ? (
                <div className={styles.leaderInfo}>
                  <img
                    src={playerOfMonth.avatar_url || `${DEFAULT_AVATAR}${playerOfMonth.user_id}`}
                    alt={playerOfMonth.username}
                    className={styles.leaderAvatar}
                  />
                  <div className={styles.leaderData}>
                    <p className={styles.leaderName}>{playerOfMonth.username}</p>
                    <p className={styles.leaderStats}>
                      {playerOfMonth.total_points} puntos • {playerOfMonth.consumptions} consumiciones
                    </p>
                  </div>
                </div>
              ) : (
                <p className={styles.noData}>No hay datos este mes</p>
              )}
            </div>

            {/* Líderes por Bebida */}
            <div className={styles.drinkLeadersGrid}>
              {drinkLeaders.map(({ drink, leader }) => (
                <div
                  key={drink.id}
                  className={styles.card}
                  onClick={() => leader && showDrinkLeaderDetails(drink.id, drink.name, leader)}
                  style={{ cursor: leader ? 'pointer' : 'default' }}
                >
                  <div className={styles.cardHeader}>
                    <h3 className={styles.drinkTitle}>🍺 Líder en {drink.name}</h3>
                  </div>
                  {leader ? (
                    <div className={styles.leaderInfo}>
                      <img
                        src={leader.avatar_url || `${DEFAULT_AVATAR}${leader.user_id}`}
                        alt={leader.username}
                        className={styles.drinkLeaderAvatar}
                      />
                      <div className={styles.leaderData}>
                        <p className={styles.drinkLeaderName}>{leader.username}</p>
                        <p className={styles.drinkLeaderStats}>{leader.total} {drink.name}</p>
                      </div>
                    </div>
                  ) : (
                    <p className={styles.noData}>Sin consumiciones</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal de detalles */}
      {selectedUser && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{modalTitle}</h2>
              <button className={styles.closeButton} onClick={closeModal}>✕</button>
            </div>
            <div className={styles.modalContent}>
              {consumptions.length === 0 ? (
                <p className={styles.noData}>No hay consumiciones</p>
              ) : (
                <ul className={styles.consumptionsList}>
                  {consumptions.map(consumption => (
                    <li key={consumption.id} className={styles.consumptionItem}>
                      <div className={styles.consumptionInfo}>
                        <span className={styles.consumptionDrink}>{consumption.drinks.name}</span>
                        <span className={styles.consumptionQuantity}>x{consumption.quantity}</span>
                      </div>
                      <div className={styles.consumptionDetails}>
                        <span className={styles.consumptionPoints}>
                          +{consumption.drinks.points * consumption.quantity} pts
                        </span>
                        <span className={styles.consumptionDate}>
                          {new Date(consumption.consumed_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
