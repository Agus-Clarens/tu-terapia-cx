'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { STATUS_COLORS, calcularEstadoGlobal } from '../../../lib/constants'
interface Caso { id: string; nro_caso: string; fecha: string; cargado_por: string; pais: string; pac_nombre: string; psi_nombre: string; tipo_caso: string; area: string; descripcion: string; estado: string; estado_admin: string; estado_talent: string; estado_cx: string }
interface Actualizacion { id: string; autor: string; texto: string; created_at: string }
const ordenEstado = (e: string) => ({ 'Nuevo': 0, 'En curso': 1, 'Cerrado': 3 }[e] ?? 2)
function SectorBadge({ label, estado }: { label: string; estado: string }) { const color = estado === 'Cerrado' ? '#9CA3AF' : estado === 'En curso' ? '#F29683' : '#75B781'; return <span style={{ background: color, color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600, marginRight: 4 }}>{label}: {estado || 'Pendiente'}</span> }
function CasoCard({ caso, onUpdate }: { caso: Caso; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false); const [acts, setActs] = useState<Actualizacion[]>([]); const [texto, setTexto] = useState(''); const [autor, setAutor] = useState('')
  const estadoTalent = caso.estado_talent || 'Pendiente'; const isCerrado = caso.estado === 'Cerrado'; const bg = STATUS_COLORS[caso.estado] || '#9CA3AF'
  async function loadActs() { const { data } = await supabase.from('caso_actualizaciones').select('*').eq('caso_id', caso.id).order('created_at', { ascending: true }); if (data) setActs(data) }
  async function addAct() { if (!texto.trim() || !autor.trim()) return; await supabase.from('caso_actualizaciones').insert({ caso_id: caso.id, autor, texto }); setTexto(''); loadActs() }
  async function updateEstado(nuevoEstadoTalent: string) { const global = calcularEstadoGlobal(caso.area, caso.estado_admin, nuevoEstadoTalent, caso.estado_cx); await supabase.from('casos').update({ estado_talent: nuevoEstadoTalent, estado: global }).eq('id', caso.id); onUpdate() }
  useEffect(() => { if (expanded) loadActs() }, [expanded])
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', opacity: isCerrado ? 0.7 : 1, borderLeft: `4px solid ${bg}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div><span style={{ fontWeight: 700, color: '#264534', fontSize: 15 }}>{caso.nro_caso}</span><span style={{ marginLeft: 8, fontSize: 12, color: '#6B7280' }}>{caso.fecha}</span><span style={{ marginLeft: 8, fontSize: 12, background: '#F3F4F6', borderRadius: 4, padding: '2px 6px' }}>{caso.area}</span></div>
        <div>{caso.area === 'Admin+Talent' && <SectorBadge label="Admin" estado={caso.estado_admin || 'Pendiente'} />}<SectorBadge label="Talent" estado={estadoTalent} /></div>
      </div>
      <div style={{ marginTop: 8, fontSize: 13, color: '#374151' }}><strong>{caso.tipo_caso}</strong> · {caso.pac_nombre} · {caso.pais}</div>
      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{caso.descripcion}</div>
      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Cargado por {caso.cargado_por} · Psicólogo: {caso.psi_nombre || '—'}</div>
      {!isCerrado && <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>{estadoTalent !== 'En curso' && <button onClick={() => updateEstado('En curso')} style={{ background: '#F29683', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Marcar en curso</button>}{estadoTalent !== 'Cerrado' && <button onClick={() => updateEstado('Cerrado')} style={{ background: '#9CA3AF', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Cerrar para Talent</button>}</div>}
      <button onClick={() => setExpanded(!expanded)} style={{ marginTop: 12, background: 'transparent', border: 'none', color: '#007271', fontSize: 12, cursor: 'pointer', fontWeight: 600, padding: 0 }}>{expanded ? '▲ Ocultar hilo' : '▼ Ver actualizaciones'}</button>
      {expanded && <div style={{ marginTop: 12, borderTop: '1px solid #F3F4F6', paddingTop: 12 }}>{acts.length === 0 ? <p style={{ fontSize: 12, color: '#9CA3AF' }}>Sin actualizaciones.</p> : acts.map(a => <div key={a.id} style={{ marginBottom: 8, fontSize: 12 }}><span style={{ fontWeight: 600, color: '#264534' }}>{a.autor}</span><span style={{ color: '#9CA3AF', marginLeft: 6 }}>{new Date(a.created_at).toLocaleString('es-AR')}</span><p style={{ margin: '2px 0 0', color: '#374151' }}>{a.texto}</p></div>)}<div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}><input value={autor} onChange={e => setAutor(e.target.value)} placeholder="Tu nombre..." style={{ border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 10px', fontSize: 12 }} /><textarea value={texto} onChange={e => setTexto(e.target.value)} placeholder="Escribir actualización..." rows={2} style={{ border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 10px', fontSize: 12, resize: 'vertical' }} /><button onClick={addAct} style={{ background: '#007271', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 12, cursor: 'pointer', fontWeight: 600, alignSelf: 'flex-start' }}>Agregar</button></div></div>}
    </div>
  )
}
export default function TalentPage() {
  const [casos, setCasos] = useState<Caso[]>([])
  const [loading, setLoading] = useState(true)
  async function loadCasos() { const { data } = await supabase.from('casos').select('*').order('created_at', { ascending: false }); if (data) setCasos(data.filter(c => c.area === 'Talent' || c.area === 'Admin+Talent')); setLoading(false) }
  useEffect(() => { loadCasos() }, [])
  return <div style={{ padding: 24 }}><h1 style={{ fontSize: 22, fontWeight: 700, color: '#264534', marginBottom: 16 }}>Talent</h1>{loading ? <p>Cargando...</p> : [...casos].sort((a,b) => ordenEstado(a.estado)-ordenEstado(b.estado)).map(c => <CasoCard key={c.id} caso={c} onUpdate={loadCasos} />)}</div>
}
