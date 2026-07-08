'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { STATUS_COLORS, calcularEstadoGlobal } from '../../../lib/constants'

interface Caso {
  id: string; nro_caso: string; fecha: string; cargado_por: string; pais: string
  pac_nombre: string; pac_mail: string; psi_nombre: string; psi_mail: string
  tipo_caso: string; area: string; descripcion: string; estado: string
  requiere_descuento: boolean; monto_descuento: number; mes_descuento: string
  estado_admin: string; estado_talent: string; estado_cx: string
}

const ordenEstado = (e: string) => ({ 'Nuevo': 0, 'En curso': 1, 'Requiere atención': 2, 'Cerrado': 3 }[e] ?? 4)

function SectorBadge({ label, estado }: { label: string; estado: string }) {
  const color = estado === 'Cerrado' ? '#9CA3AF' : estado === 'En curso' ? '#F29683' : '#75B781'
  return (
    <span style={{ background: color, color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600, marginRight: 4, opacity: estado === 'Cerrado' ? 0.7 : 1 }}>
      {label}: {estado}
    </span>
  )
}

function CasoCard({ caso, onUpdate }: { caso: Caso; onUpdate: () => void }) {
  const isCerrado = caso.estado === 'Cerrado'
  const bg = STATUS_COLORS[caso.estado] || '#9CA3AF'

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', opacity: isCerrado ? 0.6 : 1, borderLeft: `4px solid ${bg}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <span style={{ fontWeight: 700, color: '#264534', fontSize: 15 }}>{caso.nro_caso}</span>
          <span style={{ marginLeft: 8, fontSize: 12, color: '#6B7280' }}>{caso.fecha}</span>
          <span style={{ marginLeft: 8, fontSize: 12, background: '#F3F4F6', borderRadius: 4, padding: '2px 6px' }}>{caso.area}</span>
        </div>
        <div>
          {caso.area.includes('Admin') && <SectorBadge label="Admin" estado={caso.estado_admin || 'Pendiente'} />}
          {caso.area.includes('Talent') && <SectorBadge label="Talent" estado={caso.estado_talent || 'Pendiente'} />}
          {caso.area === 'CX' && <SectorBadge label="CX" estado={caso.estado_cx || 'Pendiente'} />}
        </div>
      </div>
      <div style={{ marginTop: 8, fontSize: 13, color: '#374151' }}>
        <strong>{caso.tipo_caso}</strong> · {caso.pac_nombre} · {caso.pais}
      </div>
      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{caso.descripcion}</div>
      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Cargado por {caso.cargado_por} · Psicólogo: {caso.psi_nombre || '—'}</div>
    </div>
  )
}

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
      {loading ? <p>Cargando...</p> : filtered.length === 0 ? <p style={{ color: '#9CA3AF' }}>No hay casos.</p> : filtered.map(c => <CasoCard key={c.id} caso={c} onUpdate={loadCasos} />)}
    </div>
  )
}
