'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { CARGADO_POR, PAISES, TIPOS_CASO, getTipoCasoInfo, MESES } from '../../../lib/constants'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: '1.5px solid #E5E7EB', fontSize: 14, background: '#fff',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
}

function Label({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{children}</label>
}

export default function NuevoCaso() {
  const router = useRouter()
  const [cargado_por, setCargadoPor] = useState(CARGADO_POR[0])
  const [pais, setPais] = useState('Argentina')
  const [pac_nombre, setPacNombre] = useState('')
  const [pac_mail, setPacMail] = useState('')
  const [sin_psi, setSinPsi] = useState(false)
  const [psi_nombre, setPsiNombre] = useState('')
  const [psi_mail, setPsiMail] = useState('')
  const [tipo_caso, setTipoCaso] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [monto_descuento, setMonto] = useState('')
  const [mes_descuento, setMes] = useState('Enero')
  const [tipo_sesion, setTipoSesion] = useState('Presencial')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const tipoCasoInfo = tipo_caso ? getTipoCasoInfo(tipo_caso) : null
  const requiere_descuento = tipoCasoInfo?.requiere_descuento || false
  const area = tipoCasoInfo?.area || ''

  async function handleSubmit() {
    if (!pac_nombre || !pac_mail || !tipo_caso || !descripcion) {
      setError('Completá todos los campos obligatorios.'); return
    }
    setLoading(true); setError('')
    try {
      const { data: last } = await supabase.from('casos').select('nro_caso').order('created_at', { ascending: false }).limit(1)
      const lastNum = last?.[0]?.nro_caso ? parseInt(last[0].nro_caso.replace('TKT-', '')) : 0
      const nro_caso = `TKT-${String(lastNum + 1).padStart(3, '0')}`

      const { error: err } = await supabase.from('casos').insert({
        nro_caso,
        fecha: new Date().toISOString().split('T')[0],
        cargado_por, pais, pac_nombre, pac_mail,
        psi_nombre: sin_psi ? null : psi_nombre,
        psi_mail: sin_psi ? null : psi_mail,
        tipo_caso, area, descripcion,
        estado: 'Nuevo',
        estado_admin: 'Pendiente',
        estado_talent: 'Pendiente',
        estado_cx: 'Pendiente',
        requiere_descuento,
        monto_descuento: requiere_descuento ? Number(monto_descuento) : null,
        mes_descuento: requiere_descuento ? mes_descuento : null,
        tipo_sesion: requiere_descuento ? tipo_sesion : null,
      })

      if (err) { setError('Error: ' + err.message); setLoading(false); return }

      if (requiere_descuento) {
        const { data: caso } = await supabase.from('casos').select('id').eq('nro_caso', nro_caso).single()
        if (caso) {
          await supabase.from('descuentos_psicologo').insert({
            caso_id: caso.id, nro_caso,
            psi_nombre, psi_mail, pac_nombre,
            motivo: tipo_caso,
            monto: Number(monto_descuento),
            mes: mes_descuento,
            estado: 'Pendiente',
            tipo_sesion,
            descripcion,
          })
        }
      }

      fetch('/api/notify-slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nro_caso, area, tipo_caso, pac_nombre, cargado_por, pais })
      })

      router.push('/casos')
    } catch (e) {
      setError('Error inesperado: ' + (e as Error).message)
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#264534', marginBottom: 24 }}>Nuevo caso</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <Label>Cargado por</Label>
          <select value={cargado_por} onChange={e => setCargadoPor(e.target.value)} style={inputStyle}>
            {CARGADO_POR.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <Label>País</Label>
          <select value={pais} onChange={e => setPais(e.target.value)} style={inputStyle}>
            {PAISES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <Label>Nombre paciente *</Label>
          <input value={pac_nombre} onChange={e => setPacNombre(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <Label>Email paciente *</Label>
          <input type="email" value={pac_mail} onChange={e => setPacMail(e.target.value)} style={inputStyle} />
        </div>
      </div>

      <div style={{ margin: '16px 0' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
          <input type="checkbox" checked={sin_psi} onChange={e => setSinPsi(e.target.checked)} />
          No necesita datos del psicólogo
        </label>
      </div>

      {!sin_psi && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <Label>Nombre psicólogo</Label>
            <input value={psi_nombre} onChange={e => setPsiNombre(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <Label>Email psicólogo</Label>
            <input type="email" value={psi_mail} onChange={e => setPsiMail(e.target.value)} style={inputStyle} />
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <Label>Tipo de caso *</Label>
        <select value={tipo_caso} onChange={e => setTipoCaso(e.target.value)} style={inputStyle}>
          <option value="">Seleccionar...</option>
          {Object.entries(TIPOS_CASO).map(([grupo, config]) => (
            <optgroup key={grupo} label={grupo}>
              {config.tipos.map(t => <option key={t} value={t}>{t}</option>)}
            </optgroup>
          ))}
        </select>
        {tipoCasoInfo && (
          <p style={{ fontSize: 12, marginTop: 4, color: '#007271', fontWeight: 600 }}>
            Área: {tipoCasoInfo.area}{tipoCasoInfo.requiere_descuento ? ' · Requiere descuento' : ''}
          </p>
        )}
      </div>

      {requiere_descuento && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <Label>Monto descuento *</Label>
            <input type="number" value={monto_descuento} onChange={e => setMonto(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <Label>Mes *</Label>
            <select value={mes_descuento} onChange={e => setMes(e.target.value)} style={inputStyle}>
              {MESES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <Label>Tipo sesión</Label>
            <select value={tipo_sesion} onChange={e => setTipoSesion(e.target.value)} style={inputStyle}>
              <option>Presencial</option>
              <option>Online</option>
            </select>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <Label>Descripción *</Label>
        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
      </div>

      {error && <p style={{ color: '#EF4444', marginBottom: 12, fontSize: 13 }}>{error}</p>}

      <button onClick={handleSubmit} disabled={loading} style={{
        width: '100%', background: '#007271', color: '#fff', border: 'none',
        borderRadius: 8, padding: '12px 0', fontSize: 15, fontWeight: 700,
        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
      }}>
        {loading ? 'Creando...' : 'Crear caso'}
      </button>
    </div>
  )
}
