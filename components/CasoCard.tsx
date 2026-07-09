'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Caso, CasoActualizacion } from '../lib/types'
import { CARGADO_POR, STATUS_COLORS, calcularEstadoGlobal } from '../lib/constants'

export type Sector = 'todos' | 'admin' | 'talent' | 'cx'

interface Props {
  caso: Caso
  sector: Sector
  onUpdate: () => void
  showDelete?: boolean
}

function SectorBadge({ label, estado }: { label: string; estado: string }) {
  const color = estado === 'Cerrado' ? '#9CA3AF' : estado === 'En curso' ? '#F29683' : '#75B781'
  return (
    <span style={{ background: color, color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600, marginRight: 4, whiteSpace: 'nowrap' }}>
      {label}: {estado || 'Pendiente'}
    </span>
  )
}

function Pill({ tone, children }: { tone: 'autor' | 'accion'; children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, marginRight: 6,
      background: tone === 'autor' ? '#E3EDE3' : '#FEF3C7',
      color: tone === 'autor' ? '#264534' : '#92400E',
    }}>{children}</span>
  )
}

function parseActualizacion(texto: string): { accion: string; mensaje: string } {
  const match = texto.match(/^\[(.+?)\]\s*([\s\S]*)$/)
  if (match) return { accion: match[1], mensaje: match[2] }
  return { accion: 'Actualización', mensaje: texto }
}

function formatRelativeTime(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diffMin < 1) return 'ahora'
  if (diffMin < 60) return `hace ${diffMin}m`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `hace ${diffH}h`
  return `hace ${Math.floor(diffH / 24)}d`
}

function getAcciones(sector: Sector, quienActua: string): string[] {
  if (sector === 'admin') return ['Actualización', 'En curso', 'Cerrar para Admin']
  if (sector === 'talent') return ['Actualización', 'En curso', 'Cerrar para Talent']
  if (sector === 'cx') {
    if (quienActua === 'Sol CX') return ['Actualización']
    return ['Actualización', 'En curso', 'Cerrar para CX']
  }
  return ['Actualización', 'En curso', 'Cerrar para Admin', 'Cerrar para Talent', 'Cerrar para CX']
}

export default function CasoCard({ caso, sector, onUpdate, showDelete }: Props) {
  const [acts, setActs] = useState<CasoActualizacion[]>([])
  const [quienActua, setQuienActua] = useState(CARGADO_POR[0])
  const [accion, setAccion] = useState('Actualización')
  const [texto, setTexto] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const acciones = getAcciones(sector, quienActua)
  const isCerrado = caso.estado === 'Cerrado'
  const borderColor = STATUS_COLORS[caso.estado] || '#9CA3AF'

  useEffect(() => { loadActs() }, [caso.id])
  useEffect(() => { if (!acciones.includes(accion)) setAccion('Actualización') }, [quienActua, sector])

  async function loadActs() {
    const { data } = await supabase.from('caso_actualizaciones').select('*').eq('caso_id', caso.id).order('created_at', { ascending: true })
    if (data) setActs(data)
  }

  async function handleAgregar() {
    if (!texto.trim()) return
    await supabase.from('caso_actualizaciones').insert({ caso_id: caso.id, autor: quienActua, texto: `[${accion}] ${texto.trim()}` })

    if (accion !== 'Actualización') {
      const updates: Record<string, string> = {}
      if (accion === 'En curso') {
        if (sector === 'admin') updates.estado_admin = 'En curso'
        else if (sector === 'talent') updates.estado_talent = 'En curso'
        else if (sector === 'cx') updates.estado_cx = 'En curso'
        else {
          if (caso.area.includes('Admin')) updates.estado_admin = 'En curso'
          if (caso.area.includes('Talent')) updates.estado_talent = 'En curso'
          if (caso.area === 'CX') updates.estado_cx = 'En curso'
        }
      } else if (accion === 'Cerrar para Admin') updates.estado_admin = 'Cerrado'
      else if (accion === 'Cerrar para Talent') updates.estado_talent = 'Cerrado'
      else if (accion === 'Cerrar para CX') updates.estado_cx = 'Cerrado'

      const ea = updates.estado_admin ?? caso.estado_admin ?? 'Pendiente'
      const et = updates.estado_talent ?? caso.estado_talent ?? 'Pendiente'
      const ec = updates.estado_cx ?? caso.estado_cx ?? 'Pendiente'
      updates.estado = calcularEstadoGlobal(caso.area, ea, et, ec)

      await supabase.from('casos').update(updates).eq('id', caso.id)
    }

    setTexto('')
    setAccion('Actualización')
    await loadActs()
    onUpdate()
  }

  async function deleteCaso() {
    await supabase.from('descuentos_psicologo').delete().eq('caso_id', caso.id)
    await supabase.from('caso_actualizaciones').delete().eq('caso_id', caso.id)
    await supabase.from('casos').delete().eq('id', caso.id)
    onUpdate()
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)', opacity: isCerrado ? 0.6 : 1,
      borderLeft: `4px solid ${borderColor}`,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <span style={{ fontWeight: 700, color: '#264534', fontSize: 15 }}>{caso.nro_caso}</span>
          <span style={{ marginLeft: 8, fontSize: 12, background: '#F3F4F6', borderRadius: 4, padding: '2px 6px' }}>{caso.area}</span>
          <span style={{ marginLeft: 8, fontSize: 12, color: '#6B7280' }}>{caso.fecha}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {caso.area.includes('Admin') && <SectorBadge label="Admin" estado={caso.estado_admin || 'Pendiente'} />}
          {caso.area.includes('Talent') && <SectorBadge label="Talent" estado={caso.estado_talent || 'Pendiente'} />}
          {caso.area === 'CX' && <SectorBadge label="CX" estado={caso.estado_cx || 'Pendiente'} />}
          {showDelete && (confirmDelete ? (
            <>
              <button onClick={deleteCaso} style={{ background: '#EF4444', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Confirmar</button>
              <button onClick={() => setConfirmDelete(false)} style={{ background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Cancelar</button>
            </>
          ) : (
            <button onClick={() => setConfirmDelete(true)} style={{ background: 'transparent', color: '#9CA3AF', border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Eliminar</button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 3, fontSize: 13, color: '#374151' }}>
        <div><strong>Tipo:</strong> {caso.tipo_caso}</div>
        <div><strong>Paciente:</strong> {caso.pac_nombre} ({caso.pac_mail})</div>
        <div><strong>Psicólogo:</strong> {caso.psi_nombre ? `${caso.psi_nombre} (${caso.psi_mail})` : '—'}</div>
        <div><strong>País:</strong> {caso.pais}</div>
        <div><strong>Descripción:</strong> {caso.descripcion}</div>
        <div><strong>Cargado por:</strong> {caso.cargado_por}</div>
      </div>

      {/* Hilo */}
      <div style={{ marginTop: 14, borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', padding: '10px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Hilo</div>
        {acts.length === 0 ? (
          <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>Sin actualizaciones aún.</p>
        ) : acts.map(a => {
          const { accion: acc, mensaje } = parseActualizacion(a.texto)
          return (
            <div key={a.id} style={{ padding: '6px 0' }}>
              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 3 }}>
                <Pill tone="autor">{a.autor}</Pill>
                <Pill tone="accion">{acc}</Pill>
                <span>· {formatRelativeTime(a.created_at)}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#374151' }}>&quot;{mensaje}&quot;</p>
            </div>
          )
        })}
      </div>

      {/* Formulario */}
      {!isCerrado && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>Quién actúa</label>
              <select value={quienActua} onChange={e => setQuienActua(e.target.value)} style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 10px', fontSize: 12, marginTop: 2 }}>
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
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="Describir la actualización..."
            rows={2}
            style={{ border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 10px', fontSize: 12, resize: 'vertical', fontFamily: 'inherit' }}
          />
          <button
            onClick={handleAgregar}
            disabled={!texto.trim()}
            style={{
              background: '#007271', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px',
              fontSize: 12, cursor: texto.trim() ? 'pointer' : 'not-allowed', fontWeight: 600,
              alignSelf: 'flex-start', opacity: texto.trim() ? 1 : 0.55,
            }}
          >
            Agregar
          </button>
        </div>
      )}
    </div>
  )
}
