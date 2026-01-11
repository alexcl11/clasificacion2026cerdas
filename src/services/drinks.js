import { supabase } from './supabaseClient'

// Crear una nueva bebida
export async function createDrink(name, points) {
  const { data, error } = await supabase
    .from('drinks')
    .insert({
      name,
      points
    })
    .select()
    .single()

  if (error) throw error
  return data
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

// Eliminar una bebida
export async function deleteDrink(id) {
  const { error } = await supabase
    .from('drinks')
    .delete()
    .eq('id', id)

  if (error) throw error
}
