import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

export default function Ranking() {
  const [ranking, setRanking] = useState([])

  useEffect(() => {
    fetchRanking()
  }, [])

  async function fetchRanking() {
    const { data, error } = await supabase
      .from('user_points')
      .select('*')
      .order('total_points', { ascending: false })

    if (!error) setRanking(data)
  }

  return (
    <div>
      <h1>🏆 Ranking</h1>
      <ol>
        {ranking.map(user => (
          <li key={user.user_id}>
            {user.username} — {user.total_points} puntos
          </li>
        ))}
      </ol>
    </div>
  )
}
