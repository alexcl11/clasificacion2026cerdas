import { supabase } from './supabaseClient'

export async function signUp(email, password, username) {
  // 1. Crear cuenta en Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username }
    }
  })

  if (authError) throw authError

  // 2. Guardar usuario en tabla 'users'
  if (authData.user) {
    const { error: dbError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: username
      })

    if (dbError) throw dbError
  }

  return authData
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
