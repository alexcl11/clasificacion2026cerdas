import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Ranking from './pages/Ranking'
import AddDrink from './pages/AddDrink'
import Consumption from './pages/Consumption'
import Statistics from './pages/Statistics'
import Menu from './components/Menu'
import { useAuth } from './context/AuthContext'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <p>Cargando...</p>
  if (!user) return <Navigate to="/login" />

  return children
}

function App() {
  return (
    <>
      <Menu />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ranking"
          element={
            <ProtectedRoute>
              <Ranking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-drink"
          element={
            <ProtectedRoute>
              <AddDrink />
            </ProtectedRoute>
          }
        />

        <Route
          path="/consumption"
          element={
            <ProtectedRoute>
              <Consumption />
            </ProtectedRoute>
          }
        />

        <Route
          path="/statistics"
          element={
            <ProtectedRoute>
              <Statistics />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  )
}

export default App
