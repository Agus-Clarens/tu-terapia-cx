'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { Caso } from '../../../lib/types'
import CasoCard from '../../../components/CasoCard'

const ordenEstado = (e: string) => ({ 'Nuevo': 0, 'En curso': 1, 'Cerrado': 3 }[e] ?? 2)

export default function TalentPage() {
  const [casos, setCasos] = useState<Caso[]>([])
  const [loading, setLoading] = useState(true)

  async function loadCasos() {
    const { data } = await supabase.from('casos').select('*').order('created_at', { ascending: false })
    if (data) setCasos(data.filter(c => c.area === 'Talent' || c.area === 'Admin+Talent'))
    setLoading(false)
  }

  useEffect(() => { loadCasos() }, [])

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#264534', marginBottom: 16 }}>Talent</h1>
      {loading ? <p>Cargando...</p> : [...casos].sort((a, b) => ordenEstado(a.estado) - ordenEstado(b.estado)).map(c => (
        <CasoCard key={c.id} caso={c} sector="talent" onUpdate={loadCasos} />
      ))}
    </div>
  )
}
