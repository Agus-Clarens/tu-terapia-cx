'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { STATUS_COLORS, calcularEstadoGlobal } from '../../../lib/constants'

interface Caso {
  id: string; nro_caso: string; fecha: string; cargado_por: string; pais: string
  pac_nombre: string; pac_mail: string; psi_nombre: string; psi_mail: string
  tipo_caso: string; area: string; descripcion: string; estado: string
  estado_admin: string; estado_talent: string; estado_cx: string
}

interface Actualizacion {
  id: string; autor: string; texto: string; created_at: string
}

const ordenEstado = (e: string) => ({ 'Nuevo': 0, 'En curso': 1, 'Requiere atención': 2, 'Cerrado': 3 }[e] ?? 4)

function SectorBadge({ label, estado }: { label: string; estado: string }) {
  const color = estado === 'Cerrado' ? '#9CA3AF' : estado === 'En curso' ? '#F29683' : '#75B781'
  return (
    <span style={{ background: color, color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600, marginRight: 4 }}>
      {label}: {estado || 'Pendiente'}
    </span>
  )
}

function CasoCard({ caso, onUpdate, showDelete, sector }: { caso: Caso; onUpdate: () => void; showDelete?: boolean; sector?: string }) {
  const [expanded, setExpanded] = useState(false)
  const [actualizaciones, setActualizaciones] = useState<Actualizacion[]>([])
  const [nuevoTexto, setNuevoTexto] = useState('')
  const [autor, setAutor] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isCerrado = caso.estado === 'Cerrado'
  const bg = STATUS_COLORS[caso.estado] || '#9CA3AF'

  async function loadActualizaciones() {
    const { data } = await supabase.from('caso_actualizaciones').select('*').eq('caso_id', caso.id).order('created_at', { ascending: true })
    if (data) setActualizaciones(data)
  }

  async function addActualizacion() {
    if (!nuevoTexto.trim() || !autor.trim()) return
    await supabase.from('caso_actualizaciones').insert({ caso_id: caso.id, autor, texto: nuevoTexto })
    setNuevoTexto('')
    loadActualizaciones()
  }

  async function updateSector(nuevoEstado: string) {
    const updates: Record<string, string> = {}
    if (sector === 'admin') updates.estado_admin = nuevoEstado
    if (sector === 'talent') updates.estado_talent = nuevoEstado
    if (sector === 'cx') updates.estado_cx = nuevoEstado
    const estadoAdmin = sector === 'admin' ? nuevoEstado : (caso.estado_admin || 'Pendiente')
    const estadoTalent = sector === 'talent' ? nuevoEstado : (caso.estado_talent || 'Pendiente')
    const estadoCX = sector === 'cx' ? nuevoEstado : (caso.estado_cx || 'Pendiente')
    updates.estado = calcularEstadoGlobal(caso.area, estadoAdmin, estadoTalent, estadoCX)
    await supabase.from('casos').update(updates).eq('id', caso.id)
    onUpdate()
  }

  async function deleteCaso() {
    await supabase.from('descuentos_psicologo').delete().eq('caso_id', caso.id)
    await supabase.from('caso_actualizaciones').delete().eq('caso_id', caso.id)
    await supabase.from('casos').delete().eq('id', caso.id)
    onUpdate()
  }

  useEffect(() => { if (expanded) loadActualizaciones() }, [expanded])

  const estadoSector = sector === 'admin' ? (caso.estado_admin || 'Pendiente') : sector === 'talent' ? (caso.estado_talent || 'Pendiente') : (caso.estado_cx || 'Pendiente')

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', opacity: isCerrado ? 0.7 : 1, borderLeft: `4px solid ${bg}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <span style={{ fontWeight: 700, color: '#264534', fontSize: 15 }}>{caso.nro_caso}</span>
          <span style={{ marginLeft: 8, fontSize: 12, color: '#6B7280' }}>{caso.fecha}</span>
          <span style={{ marginLeft: 8, fontSize: 12, background: '#F3F4F6', borderRadius: 4, padding: '2px 6px' }}>{caso.area}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {caso.area.includes('Admin') && <SectorBadge label="Admin" estado={caso.estado_admin || 'Pendiente'} />}
          {caso.area.includes('Talent') && <SectorBadge label="Talent" estado={caso.estado_talent || 'Pendiente'} />}
          {caso.area === 'CX' && <SectorBadge label="CX" estado={caso.estado_cx || 'Pendiente'} />}
          {showDelete && (
            confirmDelete ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={deleteCaso} style={{ background: '#EF4444', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Confirmar</button>
                <button onClick={() => setConfirmDelete(false)} style={{ background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Cancelar</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} style={{ background: 'transparent', color: '#9CA3AF', border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Eliminar</button>
            )
          )}
        </div>
      </div>

      <div style={{ marginTop: 8, fontSize: 13, color: '#374151' }}>
        <strong>{caso.tipo_caso}</strong> · {caso.pac_nombre} · {caso.pais}
      </div>
      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{caso.descripcion}</div>
      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Cargado por {caso.cargado_por} · Psicólogo: {caso.psi_nombre || '—'}</div>

      {sector && !isCerrado && (
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          {estadoSector !== 'En curso' && (
            <button onClick={() => updateSector('En curso')} style={{ background: '#F29683', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
              Marcar en curso
            </button>
          )}
          {estadoSector !== 'Cerrado' && (
            <button onClick={() => updateSector('Cerrado')} style={{ background: '#9CA3AF', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
              Cerrar para {sector === 'admin' ? 'Admin' : sector === 'talent' ? 'Talent' : 'CX'}
            </button>
          )}
        </div>
      )}

      <button onClick={() => setExpanded(!expanded)} style={{ marginTop: 12, background: 'transparent', border: 'none', color: '#007271', fontSize: 12, cursor: 'pointer', fontWeight: 600, padding: 0 }}>
        {expanded ? '▲ Ocultar hilo' : '▼ Ver actualizaciones'}
      </button>

      {expanded && (
        <div style={{ marginTop: 12, borderTop: '1px solid #F3F4F6', paddingTop: 12 }}>
          {actualizaciones.length === 0 ? <p style={{ fontSize: 12, color: '#9CA3AF' }}>Sin actualizaciones aún.</p> : actualizaciones.map(a => (
            <div key={a.id} style={{ marginBottom: 8, fontSize: 12 }}>
              <span style={{ fontWeight: 600, color: '#264534' }}>{a.autor}</span>
              <span style={{ color: '#9CA3AF', marginLeft: 6 }}>{new Date(a.created_at).toLocaleString('es-AR')}</span>
              <p style={{ margin: '2px 0 0', color: '#374151' }}>{a.texto}</p>
            </div>
          ))}
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={autor} onChange={e => setAutor(e.target.value)} placeholder="Tu nombre..." style={{ border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 10px', fontSize: 12 }} />
            <textarea value={nuevoTexto} onChange={e => setNuevoTexto(e.target.value)} placeholder="Escribir actualización..." rows={2} style={{ border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 10px', fontSize: 12, resize: 'vertical' }} />
            <button onClick={addActualizacion} style={{ background: '#007271', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 12, cursor: 'pointer', fontWeight: 600, alignSelf: 'flex-start' }}>
              Agregar
            </button>
          </div>
        </div>
      )}
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
      {loading ? <p>Cargando...</p> : filtered.length === 0 ? <p style={{ color: '#9CA3AF' }}>No hay casos.</p> :
        filtered.map(c => <CasoCard key={c.id} caso={c} onUpdate={loadCasos} showDelete={true} />)
      }
    </div>
  )
}
