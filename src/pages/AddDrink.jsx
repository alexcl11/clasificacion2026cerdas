import { useState, useEffect } from 'react'
import { createDrink, getDrinks, deleteDrink } from '../services/drinks'
import styles from './AddDrink.module.css'

export default function AddDrink() {
  const [name, setName] = useState('')
  const [points, setPoints] = useState('')
  const [drinks, setDrinks] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadDrinks()
  }, [])

  async function loadDrinks() {
    try {
      const data = await getDrinks()
      setDrinks(data)
    } catch (err) {
      console.error('Error loading drinks:', err)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      await createDrink(name, parseInt(points))
      setSuccess('¡Bebida añadida correctamente!')
      setName('')
      setPoints('')
      loadDrinks()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Estás seguro de eliminar esta bebida?')) return

    try {
      await deleteDrink(id)
      setSuccess('Bebida eliminada correctamente')
      loadDrinks()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.formCard}>
          <h1 className={styles.title}>🍺 Añadir Bebida</h1>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Nombre de la bebida</label>
              <input
                type="text"
                placeholder="Ej: Cerveza, Vino, Ron..."
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Puntos</label>
              <input
                type="number"
                placeholder="Ej: 1, 2, 3..."
                value={points}
                onChange={e => setPoints(e.target.value)}
                required
                min="0"
                className={styles.input}
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}

            <button 
              type="submit" 
              className={styles.button}
              disabled={loading}
            >
              {loading ? 'Añadiendo...' : 'Añadir Bebida'}
            </button>
          </form>
        </div>

        <div className={styles.listCard}>
          <h2 className={styles.subtitle}>📋 Lista de Bebidas</h2>
          
          {drinks.length === 0 ? (
            <p className={styles.empty}>No hay bebidas registradas</p>
          ) : (
            <ul className={styles.drinksList}>
              {drinks.map(drink => (
                <li key={drink.id} className={styles.drinkItem}>
                  <div className={styles.drinkInfo}>
                    <span className={styles.drinkName}>{drink.name}</span>
                    <span className={styles.drinkPoints}>{drink.points} pts</span>
                  </div>
                  <button
                    onClick={() => handleDelete(drink.id)}
                    className={styles.deleteButton}
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
