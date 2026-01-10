import { signOut } from '../services/auth'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div>
      <h1>Bienvenido 🍻</h1>
      <p>{user?.email}</p>
      <button onClick={signOut}>Cerrar sesión</button>
    </div>
  )
}
