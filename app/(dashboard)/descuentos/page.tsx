'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { Descuento } from '../../../lib/types'

export default function DescuentosPage() {
  const [descuentos, setDescuentos] = useState<Descuento[]>([])
  const [loading, setLoading] = useState(true)
  const [filterMes, setFilterMes] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => { fetchDescuentos() }, [])

  async function fetchDescuentos() {
    const { data } = await supabase
      .from('descuentos_psicologo').select('*').order('created_at', { ascending: false })
    if (data) setDescuentos(data)
    setLoading(false)
  }

  async function marcarAplicado(id: string) {
    await supabase.from('descuentos_psicologo').update({ estado: 'Aplicado' }).eq('id', id)
    setDescuentos(prev => prev.map(d => d.id === id ? { ...d, estado: 'Aplicado' } : d))
  }

  function copiarMensaje(d: Descuento) {
    const msg = `Hola ${d.psi_nombre}, te informamos que se aplicó un descuento de $${d.monto} en tu liquidación del mes de ${d.mes} correspondiente al caso ${d.nro_caso}. Cualquier consulta estamos a disposición. ¡Saludos, Sofía! 🌿 Equipo Tu Terapia`
    navigator.clipboard.writeText(msg)
    setCopiedId(d.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const meses = Array.from(new Set(descuentos.map(d => d.mes))).filter(Boolean).sort()
  const filtered = filterMes ? descuentos.filter(d => d.mes === filterMes) : descuentos

  const thStyle: React.CSSProperties = {
    padding: '10px 14px', textAlign: 'left', fontWeight: 600,
    fontSize: 11, color: '#6B7280', textTransform: 'uppercase',
    letterSpacing: 0.5, whiteSpace: 'nowrap',
  }
  const tdStyle: React.CSSProperties = { padding: '12px 14px' }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#264534', margin: 0 }}>Descuentos</h1>
          <p style={{ color: '#9CA3AF', fontSize: 13, marginTop: 4, marginBottom: 0 }}>
            {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <select
          value={filterMes}
          onChange={e => setFilterMes(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 13, outline: 'none' }}
        >
          <option value="">Todos los meses</option>
          {meses.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ color: '#9CA3AF', textAlign: 'center', paddingTop: 60 }}>Cargando...</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0ede8', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0ede8', background: '#faf8f4' }}>
                  <th style={thStyle}>Mes</th>
                  <th style={thStyle}>N° Caso</th>
                  <th style={thStyle}>Psicólogo</th>
                  <th style={thStyle}>Mail Psicólogo</th>
                  <th style={thStyle}>Paciente</th>
                  <th style={thStyle}>Motivo</th>
                  <th style={thStyle}>Monto</th>
                  <th style={thStyle}>Estado</th>
                  <th style={thStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: '#9CA3AF', fontSize: 14 }}>
                      Sin descuentos registrados.
                    </td>
                  </tr>
                ) : filtered.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #f0ede8' }}>
                    <td style={tdStyle}>{d.mes}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#264534' }}>{d.nro_caso}</td>
                    <td style={tdStyle}>{d.psi_nombre}</td>
                    <td style={{ ...tdStyle, color: '#6B7280' }}>{d.psi_mail}</td>
                    <td style={tdStyle}>{d.pac_nombre}</td>
                    <td style={{ ...tdStyle, maxWidth: 180 }}>{d.motivo}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>${d.monto}</td>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                        fontSize: 12, fontWeight: 500,
                        background: d.estado === 'Aplicado' ? '#D1FAE5' : '#FEF3C7',
                        color: d.estado === 'Aplicado' ? '#065F46' : '#92400E',
                      }}>
                        {d.estado}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {d.estado !== 'Aplicado' && (
                          <button
                            onClick={() => marcarAplicado(d.id)}
                            style={{
                              padding: '5px 10px', borderRadius: 6,
                              border: '1.5px solid #007271', background: 'transparent',
                              color: '#007271', fontSize: 12, cursor: 'pointer', fontWeight: 500,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Marcar aplicado
                          </button>
                        )}
                        <button
                          onClick={() => copiarMensaje(d)}
                          style={{
                            padding: '5px 10px', borderRadius: 6,
                            border: '1.5px solid #E5E7EB',
                            background: copiedId === d.id ? '#D1FAE5' : 'transparent',
                            color: copiedId === d.id ? '#065F46' : '#6B7280',
                            fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
                          }}
                        >
                          {copiedId === d.id ? '✓ Copiado' : 'Copiar mensaje'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
