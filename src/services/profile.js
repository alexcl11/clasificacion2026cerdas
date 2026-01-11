import { supabase } from './supabaseClient'

// Subir imagen de perfil
export async function uploadProfileImage(userId, file) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('profiles')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (uploadError) throw uploadError

  // Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('profiles')
    .getPublicUrl(filePath)

  // Actualizar perfil con la nueva URL
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', userId)

  if (updateError) throw updateError

  return publicUrl
}

// Obtener perfil del usuario
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

// Imagen por defecto
export const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed='
