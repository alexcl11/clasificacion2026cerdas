import { useState, useEffect } from 'react'
import { signOut } from '../services/auth'
import { useAuth } from '../context/AuthContext'
import { uploadProfileImage, getProfile, DEFAULT_AVATAR } from '../services/profile'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile(user.id)
        setProfile(data)
      } catch (err) {
        console.error('Error loading profile:', err)
      }
    }

    if (user) {
      loadProfile()
    }
  }, [user])

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida')
      return
    }

    // Validar tamaño (máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen debe ser menor a 2MB')
      return
    }

    setError(null)
    setUploading(true)

    try {
      const publicUrl = await uploadProfileImage(user.id, file)
      setProfile({ ...profile, avatar_url: publicUrl })
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const avatarUrl = profile?.avatar_url || `${DEFAULT_AVATAR}${user?.id}`

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Bienvenido 🍻</h1>
        
        <div className={styles.avatarSection}>
          <img 
            src={avatarUrl} 
            alt="Avatar" 
            className={styles.avatar}
          />
          <label className={styles.uploadLabel}>
            {uploading ? 'Subiendo...' : 'Cambiar foto'}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className={styles.fileInput}
            />
          </label>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.userInfo}>
          <p className={styles.username}>{profile?.username}</p>
          <p className={styles.email}>{user?.email}</p>
        </div>
        
        <button onClick={signOut} className={styles.button}>Cerrar sesión</button>
      </div>
    </div>
  )
}
