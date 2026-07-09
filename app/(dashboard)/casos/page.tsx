'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { STATUS_COLORS, calcularEstadoGlobal, CARGADO_POR } from '../../../lib/constants'

interface Caso {
  id: string; nro_caso: string; fecha: string; cargado_por: string; pais: string
  pac_nombre: string; psi_nombre: string; tipo_caso: string; area: string
  descripcion: string; estado: string; estado_admin: string; estado_talent: string; estado_cx: string
}
interface Actualizacion { id: string; autor: string; texto: string; created_at: string }

const ordenEstado = (e: string) => ({ 'Nuevo': 0, 'En curso': 1, 'Requiere atención': 2, 'Cerrado': 3 }[e] ?? 4)

function SectorBadge({ label, estado }: { label: string; estado: string }) {
  const color = estado === 'Cerrado' ? '#9CA3AF' : estado === 'En curso' ? '#F29683' : '#75B781'
  return <span style={{ background: color, color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600, marginRight: 4 }}>{label}: {estado || 'Pendiente'}</span>
}

const ACCIONES = ['Actualización', 'En curso', 'Cerrar para Admin', 'Cerrar para Talent', 'Cerrar para CX']

function getAccionesPorArea(area: string) {
  const base = ['Actualización', 'En curso']
  if (area === 'Admin') return [...base, 'Cerrar para Admin']
  if (area === 'Talent') return [...base, 'Cerrar para Talent']
  if (area === 'CX') return [...base, 'Cerrar para CX']
  if (area === 'Admin+Talent') return [...base, 'Cerrar para Admin', 'Cerrar para Talent']
  return base
}

function CasoCard({ caso, onUpdate, showDelete }: { caso: Caso; onUpdate: () => void; showDelete?: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const [acts, setActs] = useState<Actualizacion[]>([])
  const [texto, setTexto] = useState('')
  const [autor, setAutor] = useState(CARGADO_POR[0])
  const [accion, setAccion] = useState('Actualización')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isCerrado = caso.estado === 'Cerrado'
  const bg = STATUS_COLORS[caso.estado] || '#9CA3AF'
  const acciones = getAccionesPorArea(caso.area)

  async function loadActs() {
    const { data } = await supabase.from('caso_actualizaciones').select('*').eq('caso_id', caso.id).order('created_at', { ascending: true })
    if (data) setActs(data)
  }

  async function handleAgregar() {
    if (!texto.trim()) return
    await supabase.from('caso_actualizaciones').insert({ caso_id: caso.id, autor, texto: `[${accion}] ${texto}` })

    if (accion === 'En curso' || accion.startsWith('Cerrar')) {
      const updates: Record<string, string> = {}
      if (accion === 'En curso') {
        if (caso.area.includes('Admin')) updates.estado_admin = 'En curso'
        if (caso.area.includes('Talent')) updates.estado_talent = 'En curso'
        if (caso.area === 'CX') updates.estado_cx = 'En curso'
      }
      if (accion === 'Cerrar para Admin') updates.estado_admin = 'Cerrado'
      if (accion === 'Cerrar para Talent') updates.estado_talent = 'Cerrado'
      if (accion === 'Cerrar para CX') updates.estado_cx = 'Cerrado'
      const ea = updates.estado_admin ?? caso.estado_admin ?? 'Pendiente'
      const et = updates.estado_talent ?? caso.estado_talent ?? 'Pendiente'
      const ec = updates.estado_cx ?? caso.estado_cx ?? 'Pendiente'
      updates.estado = calcularEstadoGlobal(caso.area, ea, et, ec)
      await supabase.from('casos').update(updates).eq('id', caso.id)
      onUpdate()
    }

    setTexto('')
    loadActs()
  }

  async function deleteCaso() {
    await supabase.from('descuentos_psicologo').delete().eq('caso_id', caso.id)
    await supabase.from('caso_actualizaciones').delete().eq('caso_id', caso.id)
    await supabase.from('casos').delete().eq('id', caso.id)
    onUpdate()
  }

  useEffect(() => { if (expanded) loadActs() }, [expanded])

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', opacity: isCerrado ? 0.7 : 1, borderLeft: `4px solid ${bg}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <span style={{ fontWeight: 700, color: '#264534', fontSize: 15 }}>{caso.nro_caso}</span>
          <span style={{ marginLeft: 8, fontSize: 12, color: '#6B7280' }}>{caso.fecha}</span>
          <span style={{ marginLeft: 8, fontSize: 12, background: '#F3F4F6', borderRadius: 4, padding: '2px 6px' }}>{caso.area}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {caso.area.includes('Admin') && <SectorBadge label="Admin" estado={caso.estado_admin || 'Pendiente'} />}
          {caso.area.includes('Talent') && <SectorBadge label="Talent" estado={caso.estado_talent || 'Pendiente'} />}
          {caso.area === 'CX' && <SectorBadge label="CX" estado={caso.estado_cx || 'Pendiente'} />}
          {showDelete && (confirmDelete
            ? <><button onClick={deleteCaso} style={{ background: '#EF4444', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Confirmar</button><button onClick={() => setConfirmDelete(false)} style={{ background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Cancelar</button></>
            : <button onClick={() => setConfirmDelete(true)} style={{ background: 'transparent', color: '#9CA3AF', border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Eliminar</button>
          )}
        </div>
      </div>

      <div style={{ marginTop: 8, fontSize: 13, color: '#374151' }}><strong>{caso.tipo_caso}</strong> · {caso.pac_nombre} · {caso.pais}</div>
      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{caso.descripcion}</div>
      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Cargado por {caso.cargado_por} · Psicólogo: {caso.psi_nombre || '—'}</div>

      <button onClick={() => setExpanded(!expanded)} style={{ marginTop: 12, background: 'transparent', border: 'none', color: '#007271', fontSize: 12, cursor: 'pointer', fontWeight: 600, padding: 0 }}>
        {expanded ? '▲ Ocultar hilo' : '▼ Ver actualizaciones'}
      </button>

      {expanded && (
        <div style={{ marginTop: 12, borderTop: '1px solid #F3F4F6', paddingTop: 12 }}>
          {acts.length === 0
            ? <p style={{ fontSize: 12, color: '#9CA3AF' }}>Sin actualizaciones aún.</p>
            : acts.map(a => (
              <div key={a.id} style={{ marginBottom: 8, fontSize: 12, padding: '8px 10px', background: '#F9FAFB', borderRadius: 6 }}>
                <span style={{ fontWeight: 600, color: '#264534' }}>{a.autor}</span>
                <span style={{ color: '#9CA3AF', marginLeft: 6 }}>{new Date(a.created_at).toLocaleString('es-AR')}</span>
                <p style={{ margin: '2px 0 0', color: '#374151' }}>{a.texto}</p>
              </div>
            ))
          }
          {!isCerrado && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>Quién actúa</label>
                  <select value={autor} onChange={e => setAutor(e.target.value)} style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 10px', fontSize: 12, marginTop: 2 }}>
                    {CARGADO_POR.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>Acción</label>
                  <select value={accion} onChange={e => setAccion(e.target.value)} style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 10px', fontSize: 12, marginTop: 2 }}>
                    {acciones.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <textarea value={texto} onChange={e => setTexto(e.target.value)} placeholder="Describir la acción tomada..." rows={2} style={{ border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 10px', fontSize: 12, resize: 'vertical' }} />
              <button onClick={handleAgregar} style={{ background: '#007271', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 12, cursor: 'pointer', fontWeight: 600, alignSelf: 'flex-start' }}>
                Agregar
              </button>
            </div>
          )}
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
      {loading ? <p>Cargando...</p> : filtered.length === 0
        ? <p style={{ color: '#9CA3AF' }}>No hay casos.</p>
        : filtered.map(c => <CasoCard key={c.id} caso={c} onUpdate={loadCasos} showDelete={true} />)
      }
    </div>
  )
}
