import { supabase } from './supabaseClient'

// Crear una consumición (el trigger actualiza automáticamente user_points)
export async function createConsumption(userId, drinkId, quantity) {
  // Insertar la consumición - el trigger de Supabase se encargará de actualizar los puntos
  const { error } = await supabase
    .from('consumptions')
    .insert({
      user_id: userId,
      drink_id: drinkId,
      quantity
    })

  if (error) throw error

  // Obtener los puntos de la bebida para mostrar al usuario
  const { data: drinkData } = await supabase
    .from('drinks')
    .select('points')
    .eq('id', drinkId)
    .single()

  return drinkData.points * quantity
}

// Obtener todas las bebidas
export async function getDrinks() {
  const { data, error } = await supabase
    .from('drinks')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

// Obtener consumiciones del usuario
export async function getUserConsumptions(userId) {
  const { data, error } = await supabase
    .from('consumptions')
    .select(`
      *,
      drinks (
        name,
        points
      )
    `)
    .eq('user_id', userId)
    .order('consumed_at', { ascending: false })

  if (error) throw error
  return data
}
