'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { STATUS_COLORS, calcularEstadoGlobal } from '../../../lib/constants'

interface Caso {
  id: string; nro_caso: string; fecha: string; cargado_por: string; pais: string
  pac_nombre: string; psi_nombre: string; tipo_caso: string; area: string
  descripcion: string; estado: string; estado_admin: string; estado_talent: string; estado_cx: string
}

const ordenEstado = (e: string) => ({ 'Nuevo': 0, 'En curso': 1, 'Cerrado': 3 }[e] ?? 2)

function SectorBadge({ label, estado }: { label: string; estado: string }) {
  const color = estado === 'Cerrado' ? '#9CA3AF' : estado === 'En curso' ? '#F29683' : '#75B781'
  return (
    <span style={{ background: color, color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600, marginRight: 4 }}>
      {label}: {estado || 'Pendiente'}
    </span>
  )
}

export default function AdminPage() {
  const [casos, setCasos] = useState<Caso[]>([])
  const [loading, setLoading] = useState(true)

  async function loadCasos() {
    const { data } = await supabase.from('casos').select('*').order('created_at', { ascending: false })
    if (data) setCasos(data.filter(c => c.area === 'Admin' || c.area === 'Admin+Talent'))
    setLoading(false)
  }

  async function updateEstado(caso: Caso, nuevoEstadoAdmin: string) {
    const nuevoGlobal = calcularEstadoGlobal(caso.area, nuevoEstadoAdmin, caso.estado_talent, caso.estado_cx)
    await supabase.from('casos').update({ estado_admin: nuevoEstadoAdmin, estado: nuevoGlobal }).eq('id', caso.id)
    loadCasos()
  }

  useEffect(() => { loadCasos() }, [])

  const sorted = [...casos].sort((a, b) => ordenEstado(a.estado) - ordenEstado(b.estado))

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#264534', marginBottom: 16 }}>Admin</h1>
      {loading ? <p>Cargando...</p> : sorted.length === 0 ? <p style={{ color: '#9CA3AF' }}>No hay casos.</p> : sorted.map(c => {
        const isCerrado = c.estado === 'Cerrado'
        const bg = STATUS_COLORS[c.estado] || '#9CA3AF'
        const estadoAdmin = c.estado_admin || 'Pendiente'
        return (
          <div key={c.id} style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', opacity: isCerrado ? 0.6 : 1, borderLeft: `4px solid ${bg}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <span style={{ fontWeight: 700, color: '#264534', fontSize: 15 }}>{c.nro_caso}</span>
                <span style={{ marginLeft: 8, fontSize: 12, color: '#6B7280' }}>{c.fecha}</span>
                <span style={{ marginLeft: 8, fontSize: 12, background: '#F3F4F6', borderRadius: 4, padding: '2px 6px' }}>{c.area}</span>
              </div>
              <div>
                <SectorBadge label="Admin" estado={estadoAdmin} />
                {c.area === 'Admin+Talent' && <SectorBadge label="Talent" estado={c.estado_talent || 'Pendiente'} />}
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 13, color: '#374151' }}>
              <strong>{c.tipo_caso}</strong> · {c.pac_nombre} · {c.pais}
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{c.descripcion}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Cargado por {c.cargado_por} · Psicólogo: {c.psi_nombre || '—'}</div>
            {!isCerrado && (
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                {estadoAdmin !== 'En curso' && (
                  <button onClick={() => updateEstado(c, 'En curso')} style={{ background: '#F29683', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                    Marcar en curso
                  </button>
                )}
                {estadoAdmin !== 'Cerrado' && (
                  <button onClick={() => updateEstado(c, 'Cerrado')} style={{ background: '#9CA3AF', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                    Cerrar para Admin
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
