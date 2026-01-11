import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { signOut } from '../services/auth'
import styles from './Menu.module.css'

export default function Menu() {
  const { user } = useAuth()

  return (
    <nav className={styles.nav}>
      <h3 className={styles.logo}> Contador Borrachos</h3>

      <div className={styles.links}>
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Registro</Link>
          </>
        )}

        {user && (
          <>
            <Link to="/dashboard">Perfil</Link>
            <Link to="/consumption">Consumir</Link>
            <Link to="/ranking">Ranking</Link>
            <Link to="/statistics">Estadísticas</Link>
            <Link to="/add-drink">Añadir Bebida</Link>
            <button onClick={signOut} className={styles.logout}>
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
