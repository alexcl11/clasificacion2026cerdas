import { supabase } from './supabaseClient'

// Obtener jugador de un mes específico (más puntos en ese mes)
export async function getPlayerOfMonth(year, month) {
  const startOfMonth = new Date(year, month, 1)
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59)
  
  const { data, error } = await supabase
    .from('consumptions')
    .select(`
      user_id,
      quantity,
      drinks (points),
      profiles (username, avatar_url)
    `)
    .gte('consumed_at', startOfMonth.toISOString())
    .lte('consumed_at', endOfMonth.toISOString())

  if (error) throw error

  // Agrupar por usuario y calcular puntos
  const userPoints = {}
  data?.forEach(c => {
    if (!userPoints[c.user_id]) {
      userPoints[c.user_id] = {
        user_id: c.user_id,
        username: c.profiles.username,
        avatar_url: c.profiles.avatar_url,
        total_points: 0,
        consumptions: 0
      }
    }
    userPoints[c.user_id].total_points += c.drinks.points * c.quantity
    userPoints[c.user_id].consumptions += c.quantity
  })

  // Obtener el usuario con más puntos
  const leader = Object.values(userPoints).sort((a, b) => b.total_points - a.total_points)[0]
  
  return leader || null
}

// Obtener campeones de meses anteriores
export async function getPreviousMonthChampions() {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  
  const champions = []
  
  // Obtener campeones de los últimos 6 meses (sin incluir el actual)
  for (let i = 1; i <= 6; i++) {
    let month = currentMonth - i
    let year = currentYear
    
    // Ajustar año si el mes es negativo
    while (month < 0) {
      month += 12
      year -= 1
    }
    
    const champion = await getPlayerOfMonth(year, month)
    if (champion) {
      champions.push({
        ...champion,
        year,
        month,
        monthName: new Date(year, month).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
      })
    }
  }
  
  return champions
}

// Obtener líder en una bebida específica
export async function getLeaderByDrink(drinkId) {
  const { data, error } = await supabase
    .from('consumptions')
    .select(`
      user_id,
      quantity,
      profiles (username, avatar_url)
    `)
    .eq('drink_id', drinkId)

  if (error) throw error

  // Agrupar por usuario y contar cantidad
  const userCounts = {}
  data?.forEach(c => {
    if (!userCounts[c.user_id]) {
      userCounts[c.user_id] = {
        user_id: c.user_id,
        username: c.profiles.username,
        avatar_url: c.profiles.avatar_url,
        total: 0
      }
    }
    userCounts[c.user_id].total += c.quantity
  })

  // Obtener el usuario con más consumiciones
  const leader = Object.values(userCounts).sort((a, b) => b.total - a.total)[0]
  
  return leader || null
}

// Obtener todas las consumiciones de un usuario para una bebida
export async function getUserConsumptionsByDrink(userId, drinkId) {
  const { data, error } = await supabase
    .from('consumptions')
    .select(`
      *,
      drinks (name, points)
    `)
    .eq('user_id', userId)
    .eq('drink_id', drinkId)
    .order('consumed_at', { ascending: false })

  if (error) throw error
  return data
}

// Obtener todas las consumiciones del mes de un usuario
export async function getUserMonthConsumptions(userId) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const { data, error } = await supabase
    .from('consumptions')
    .select(`
      *,
      drinks (name, points)
    `)
    .eq('user_id', userId)
    .gte('consumed_at', startOfMonth.toISOString())
    .order('consumed_at', { ascending: false })

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
