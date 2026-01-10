import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { signOut } from '../services/auth'

export default function Menu() {
  const { user } = useAuth()

  return (
    <nav style={styles.nav}>
      <h3 style={styles.logo}>🍻 Contador</h3>

      <div style={styles.links}>
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Registro</Link>
          </>
        )}

        {user && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/ranking">Ranking</Link>
            <button onClick={signOut} style={styles.logout}>
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 20px',
    background: '#222',
    color: 'white',
    alignItems: 'center'
  },
  logo: {
    margin: 0
  },
  links: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center'
  },
  logout: {
    background: 'crimson',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    cursor: 'pointer'
  }
}
