import { useEffect, useState, useRef } from 'react'
import { supabase } from '../services/supabaseClient'
import { DEFAULT_AVATAR } from '../services/profile'
import styles from './Ranking.module.css'

export default function Ranking() {
  const [ranking, setRanking] = useState([])
  const [drinks, setDrinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const pollingIntervalRef = useRef(null)

  async function fetchRanking() {
    setError(null)

    try {
      // Obtener todas las bebidas
      const { data: drinksData, error: drinksErr } = await supabase
        .from('drinks')
        .select('*')
        .order('name', { ascending: true })

      if (drinksErr) {
        console.error('Error fetching drinks:', drinksErr)
        setError(drinksErr.message)
        setLoading(false)
        return
      }

      setDrinks(drinksData || [])

      // Obtener todos los usuarios de profiles
      const { data: profilesData, error: profilesErr } = await supabase
        .from('profiles')
        .select('*')
        .order('username', { ascending: true })

      if (profilesErr) {
        console.error('Error fetching profiles:', profilesErr)
        setError(profilesErr.message)
        setLoading(false)
        return
      }

      // Obtener consumiciones con detalles de bebidas
      const { data: consumptionsData, error: consumptionsErr } = await supabase
        .from('consumptions')
        .select('user_id, drink_id, quantity, drinks(id, points)')

      if (consumptionsErr) {
        console.error('Error fetching consumptions:', consumptionsErr)
      }

      // Obtener puntos totales
      const { data: userPointsData } = await supabase
        .from('user_points')
        .select('user_id, total_points')

      // Crear mapa de puntos totales
      const pointsMap = {}
      userPointsData?.forEach(u => {
        pointsMap[u.user_id] = u.total_points
      })

      // Crear mapa de consumiciones por usuario y bebida
      const consumptionsMap = {}
      consumptionsData?.forEach(c => {
        if (!consumptionsMap[c.user_id]) {
          consumptionsMap[c.user_id] = {}
        }
        consumptionsMap[c.user_id][c.drink_id] = (consumptionsMap[c.user_id][c.drink_id] || 0) + c.quantity
      })

      // Combinar datos
      const combinedData = profilesData
        .map(profile => ({
          user_id: profile.id,
          username: profile.username,
          avatar_url: profile.avatar_url,
          total_points: pointsMap[profile.id] || 0,
          consumptions: consumptionsMap[profile.id] || {}
        }))
        // Ordenar por puntos descendente, luego por nombre
        .sort((a, b) => {
          if (b.total_points !== a.total_points) {
            return b.total_points - a.total_points
          }
          return a.username.localeCompare(b.username)
        })

      setRanking(combinedData || [])
      setLoading(false)
    } catch (err) {
      console.error('Error fetching ranking:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRanking()

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('public:user_points')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_points'
        },
        () => {
          console.log('user_points changed (INSERT)')
          fetchRanking()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_points'
        },
        () => {
          console.log('user_points changed (UPDATE)')
          fetchRanking()
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
      })

    // Fallback: polling cada 5 segundos para asegurar que se actualiza
    pollingIntervalRef.current = setInterval(() => {
      fetchRanking()
    }, 5000)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      channel.unsubscribe()
    }
  }, [])

  async function handleRefresh() {
    setRefreshing(true)
    await fetchRanking()
    setRefreshing(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>🏆 Ranking</h1>
          <button 
            onClick={handleRefresh}
            className={styles.refreshButton}
            disabled={refreshing}
            title="Actualizar ranking"
          >
            {refreshing ? '⟳' : '↻'}
          </button>
        </div>
        
        {error && (
          <p className={styles.error}>Error: {error}</p>
        )}
        
        {loading ? (
          <p className={styles.empty}>Cargando...</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.rankingTable}>
              <thead>
                <tr>
                  <th className={styles.posColumn}>#</th>
                  <th className={styles.userColumn}>Usuario</th>
                  {drinks.map(drink => (
                    <th key={drink.id} className={styles.drinkColumn}>
                      <div>{drink.name}</div>
                      <div className={styles.drinkPoints}>{drink.points}pts</div>
                    </th>
                  ))}
                  <th className={styles.totalColumn}>Total</th>
                </tr>
              </thead>
              <tbody>
                {ranking.length === 0 ? (
                  <tr>
                    <td colSpan={drinks.length + 3} className={styles.emptyRow}>
                      No hay usuarios registrados todavía
                    </td>
                  </tr>
                ) : (
                  ranking.map((user, index) => (
                    <tr key={user.user_id} className={styles.userRow}>
                      <td className={styles.position}>
                        <span className={styles.medal}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </span>
                      </td>
                      <td className={styles.userCell}>
                        <img 
                          src={user.avatar_url ? user.avatar_url : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_id}`}
                          alt={user.username}
                          className={styles.userAvatar}
                        />
                        <span>{user.username}</span>
                      </td>
                      {drinks.map(drink => (
                        <td key={drink.id} className={styles.drinkCount}>
                          {user.consumptions[drink.id] || 0}
                        </td>
                      ))}
                      <td className={styles.totalPoints}>
                        {user.total_points}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
