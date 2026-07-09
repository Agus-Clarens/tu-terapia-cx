'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { Caso } from '../../../lib/types'
import CasoCard from '../../../components/CasoCard'

const ordenEstado = (e: string) => ({ 'Nuevo': 0, 'En curso': 1, 'Requiere atención': 2, 'Cerrado': 3 }[e] ?? 4)

export default function CasosPage() {
  const [casos, setCasos] = useState<Caso[]>([])
  const [filtroArea, setFiltroArea] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadCasos() {
    const { data } = await supabase.from('casos').select('*').order('created_at', { ascending: false })
    if (data) setCasos(data)
    setLoading(false)
  }

  useEffect(() => { loadCasos() }, [])

  const filtered = casos
    .filter(c => !filtroArea || c.area === filtroArea)
    .filter(c => !filtroEstado || c.estado === filtroEstado)
    .sort((a, b) => ordenEstado(a.estado) - ordenEstado(b.estado))

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#264534', marginBottom: 16 }}>Todos los casos</h1>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <select value={filtroArea} onChange={e => setFiltroArea(e.target.value)} style={{ border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '6px 12px', fontSize: 13 }}>
          <option value="">Todas las áreas</option>
          {['Admin','Talent','CX','Admin+Talent'].map(a => <option key={a}>{a}</option>)}
        </select>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} style={{ border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '6px 12px', fontSize: 13 }}>
          <option value="">Todos los estados</option>
          {['Nuevo','En curso','Requiere atención','Cerrado'].map(e => <option key={e}>{e}</option>)}
        </select>
      </div>
      {loading ? <p>Cargando...</p> : filtered.length === 0
        ? <p style={{ color: '#9CA3AF' }}>No hay casos.</p>
        : filtered.map(c => <CasoCard key={c.id} caso={c} sector="todos" onUpdate={loadCasos} showDelete={true} />)
      }
    </div>
  )
}
