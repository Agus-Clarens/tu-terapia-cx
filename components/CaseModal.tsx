'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Caso, CasoActualizacion } from '../lib/types'
import StatusBadge from './StatusBadge'
import { CARGADO_POR, ESTADOS } from '../lib/constants'

interface Props {
  caso: Caso
  onClose: () => void
  onUpdate: () => void
}

export default function CaseModal({ caso, onClose, onUpdate }: Props) {
  const [actualizaciones, setActualizaciones] = useState<CasoActualizacion[]>([])
  const [autor, setAutor] = useState(CARGADO_POR[0])
  const [texto, setTexto] = useState('')
  const [estado, setEstado] = useState(caso.estado)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchActualizaciones() }, [caso.id])

  async function fetchActualizaciones() {
    const { data } = await supabase
      .from('caso_actualizaciones')
      .select('*')
      .eq('caso_id', caso.id)
      .order('created_at', { ascending: true })
    if (data) setActualizaciones(data)
  }

  async function handleChangeEstado(newEstado: string) {
    setEstado(newEstado)
    await supabase.from('casos').update({ estado: newEstado }).eq('id', caso.id)
    onUpdate()
  }

  async function handleAddUpdate() {
    if (!texto.trim()) return
    setSaving(true)
    await supabase.from('caso_actualizaciones').insert({
      caso_id: caso.id,
      autor,
      texto: texto.trim(),
    })
    setTexto('')
    await fetchActualizaciones()
    setSaving(false)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: 16, width: '100%', maxWidth: 700,
          maxHeight: '90vh', overflow: 'auto', display: 'flex', flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid #f0ede8', flexShrink: 0,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 17, color: '#264534' }}>{caso.nro_caso}</span>
              <StatusBadge estado={estado} />
            </div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
              {caso.fecha} · {caso.cargado_por} · {caso.pais}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <select
              value={estado}
              onChange={e => handleChangeEstado(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13 }}
            >
              {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 22, color: '#9CA3AF', lineHeight: 1, padding: 4,
            }}>×</button>
          </div>
        </div>

        {/* Details grid */}
        <div style={{
          padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '14px 28px', borderBottom: '1px solid #f0ede8',
        }}>
          <Field label="Tipo de caso" value={caso.tipo_caso} />
          <Field label="Área" value={caso.area} />
          <Field label="Paciente" value={caso.pac_nombre} />
          <Field label="Email paciente" value={caso.pac_mail} />
          {caso.psi_nombre && <Field label="Psicólogo" value={caso.psi_nombre} />}
          {caso.psi_mail && <Field label="Email psicólogo" value={caso.psi_mail} />}
          {caso.requiere_descuento && caso.monto_descuento != null && (
            <Field label="Monto descuento" value={`$${caso.monto_descuento}`} />
          )}
          {caso.requiere_descuento && caso.mes_descuento && (
            <Field label="Mes descuento" value={caso.mes_descuento} />
          )}
          <div style={{ gridColumn: '1/-1' }}>
            <Field label="Descripción" value={caso.descripcion} />
          </div>
        </div>

        {/* Updates */}
        <div style={{ padding: '20px 24px', flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#264534', marginBottom: 14 }}>
            Actualizaciones ({actualizaciones.length})
          </div>

          {actualizaciones.length === 0 && (
            <div style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 16 }}>Sin actualizaciones aún.</div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {actualizaciones.map(u => (
              <div key={u.id} style={{
                background: '#FEFAF5', borderRadius: 8, padding: '12px 14px',
                borderLeft: '3px solid #75B781',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#264534' }}>{u.autor}</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                    {new Date(u.created_at).toLocaleString('es-AR', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: '#374151', whiteSpace: 'pre-wrap' }}>{u.texto}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <select
              value={autor}
              onChange={e => setAutor(e.target.value)}
              style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13 }}
            >
              {CARGADO_POR.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <textarea
              value={texto}
              onChange={e => setTexto(e.target.value)}
              placeholder="Escribir actualización..."
              rows={3}
              style={{
                padding: '10px', borderRadius: 8, border: '1.5px solid #e5e7eb',
                fontSize: 14, resize: 'vertical', fontFamily: 'inherit', outline: 'none',
              }}
            />
            <button
              onClick={handleAddUpdate}
              disabled={saving || !texto.trim()}
              style={{
                alignSelf: 'flex-end', padding: '8px 22px', borderRadius: 8, border: 'none',
                background: '#007271', color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', opacity: saving || !texto.trim() ? 0.55 : 1,
              }}
            >
              {saving ? 'Guardando...' : 'Agregar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: '#111827' }}>{value || '—'}</div>
    </div>
  )
}
