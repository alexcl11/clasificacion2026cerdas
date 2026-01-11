import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { createConsumption, getDrinks, getUserConsumptions } from '../services/consumptions'
import styles from './Consumption.module.css'

export default function Consumption() {
  const { user } = useAuth()
  const [drinks, setDrinks] = useState([])
  const [selectedDrink, setSelectedDrink] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [consumptions, setConsumptions] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function init() {
      if (user) {
        await loadDrinks()
        await loadConsumptions()
      }
    }
    init()
  }, [user])

  async function loadDrinks() {
    try {
      const data = await getDrinks()
      setDrinks(data)
      if (data.length > 0) {
        setSelectedDrink(data[0].id.toString())
      }
    } catch (err) {
      setError('Error al cargar las bebidas: ' + err.message)
    }
  }

  async function loadConsumptions() {
    try {
      const data = await getUserConsumptions(user.id)
      setConsumptions(data)
    } catch (err) {
      console.error('Error loading consumptions:', err)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!selectedDrink || !quantity) {
      setError('Por favor completa todos los campos')
      return
    }

    setLoading(true)

    try {
      const points = await createConsumption(
        user.id,
        parseInt(selectedDrink),
        parseInt(quantity)
      )
      setSuccess(`¡Consumición registrada! +${points} puntos`)
      setQuantity('1')
      loadConsumptions()
    } catch (err) {
      setError('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedDrinkData = drinks.find(d => d.id.toString() === selectedDrink)
  const estimatedPoints = selectedDrinkData ? selectedDrinkData.points * (parseInt(quantity) || 0) : 0

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.formCard}>
          <h1 className={styles.title}>🍻 Registrar Consumición</h1>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Selecciona una bebida</label>
              <select
                value={selectedDrink}
                onChange={e => setSelectedDrink(e.target.value)}
                required
                className={styles.select}
              >
                <option value="">-- Elige una bebida --</option>
                {drinks.map(drink => (
                  <option key={drink.id} value={drink.id.toString()}>
                    {drink.name} ({drink.points} pts)
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Cantidad</label>
              <div className={styles.quantityControl}>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, parseInt(quantity) - 1).toString())}
                  className={styles.quantityButton}
                >
                  −
                </button>
                <input
                  type="number"
                  placeholder="1"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  required
                  min="1"
                  className={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setQuantity((parseInt(quantity) + 1).toString())}
                  className={styles.quantityButton}
                >
                  +
                </button>
              </div>
            </div>

            {selectedDrinkData && (
              <div className={styles.pointsPreview}>
                <p className={styles.previewText}>
                  Puntos a obtener: <span className={styles.pointsValue}>{estimatedPoints}</span>
                </p>
              </div>
            )}

            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}

            <button
              type="submit"
              className={styles.button}
              disabled={loading || !selectedDrink}
            >
              {loading ? 'Registrando...' : '✓ Registrar Consumición'}
            </button>
          </form>
        </div>

        <div className={styles.historyCard}>
          <h2 className={styles.subtitle}>📊 Tu Historial</h2>

          {consumptions.length === 0 ? (
            <p className={styles.empty}>Aún no has registrado consumiciones</p>
          ) : (
            <ul className={styles.consumptionsList}>
              {consumptions.map(consumption => (
                <li key={consumption.id} className={styles.consumptionItem}>
                  <div className={styles.consumptionInfo}>
                    <span className={styles.drinkName}>{consumption.drinks.name}</span>
                    <span className={styles.quantity}>x{consumption.quantity}</span>
                  </div>
                  <div className={styles.consumptionPoints}>
                    <p className={styles.points}>
                      +{consumption.drinks.points * consumption.quantity} pts
                    </p>
                    <p className={styles.date}>
                      {new Date(consumption.consumed_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
