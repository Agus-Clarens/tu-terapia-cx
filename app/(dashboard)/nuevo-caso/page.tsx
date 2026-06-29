'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { CARGADO_POR, PAISES, TIPOS_CASO, getTipoCasoInfo } from '../../../lib/constants'

interface FormData {
  cargado_por: string
  pais: string
  pac_nombre: string
  pac_mail: string
  sin_psi: boolean
  psi_nombre: string
  psi_mail: string
  tipo_caso: string
  descripcion: string
  monto_descuento: string
  mes_descuento: string
}

const INITIAL: FormData = {
  cargado_por: CARGADO_POR[0],
  pais: 'Argentina',
  pac_nombre: '',
  pac_mail: '',
  sin_psi: false,
  psi_nombre: '',
  psi_mail: '',
  tipo_caso: '',
  descripcion: '',
  monto_descuento: '',
  mes_descuento: '',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: '1.5px solid #E5E7EB', fontSize: 14, background: '#fff',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{children}</div>
}

export default function NuevoCasoPage() {
  const [form, setForm] = useState<FormData>(INITIAL)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const tipoCasoInfo = form.tipo_caso ? getTipoCasoInfo(form.tipo_caso) : null

  function set<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function getNextNroCaso(): Promise<string> {
    const { data } = await supabase
      .from('casos').select('nro_caso').order('created_at', { ascending: false }).limit(1)
    if (!data || data.length === 0) return 'TKT-001'
    const num = parseInt(data[0].nro_caso.replace('TKT-', ''), 10)
    return `TKT-${(num + 1).toString().padStart(3, '0')}`
  }

  async function handleSubmit() {
    if (!form.pac_nombre || !form.pac_mail || !form.tipo_caso || !form.descripcion) {
      setError('Completar todos los campos obligatorios.')
      return
    }
    if (tipoCasoInfo?.requiere_descuento && (!form.monto_descuento || !form.mes_descuento)) {
      setError('Este tipo de caso requiere monto y mes de descuento.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const nro_caso = await getNextNroCaso()
      const today = new Date().toISOString().split('T')[0]

      const { data: newCaso, error: err } = await supabase.from('casos').insert({
        nro_caso,
        fecha: today,
        cargado_por: form.cargado_por,
        pais: form.pais,
        pac_nombre: form.pac_nombre,
        pac_mail: form.pac_mail,
        psi_nombre: form.sin_psi ? null : (form.psi_nombre || null),
        psi_mail: form.sin_psi ? null : (form.psi_mail || null),
        tipo_caso: form.tipo_caso,
        area: tipoCasoInfo?.area,
        descripcion: form.descripcion,
        estado: 'Nuevo',
        requiere_descuento: tipoCasoInfo?.requiere_descuento ?? false,
        monto_descuento: tipoCasoInfo?.requiere_descuento ? parseFloat(form.monto_descuento) : null,
        mes_descuento: tipoCasoInfo?.requiere_descuento ? form.mes_descuento : null,
      }).select().single()

      if (err) throw err

      if (tipoCasoInfo?.requiere_descuento && newCaso) {
        await supabase.from('descuentos_psicologo').insert({
          caso_id: newCaso.id,
          nro_caso: newCaso.nro_caso,
          psi_nombre: form.psi_nombre,
          psi_mail: form.psi_mail,
          pac_nombre: form.pac_nombre,
          motivo: form.tipo_caso,
          monto: parseFloat(form.monto_descuento),
          mes: form.mes_descuento,
          estado: 'Pendiente',
        })
      }

      setSuccess(`Caso ${nro_caso} creado exitosamente.`)
      setForm(INITIAL)
      setTimeout(() => router.push('/casos'), 1800)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al crear el caso.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#264534', margin: 0 }}>Nuevo caso</h1>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0ede8', padding: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          <div>
            <Label>Cargado por</Label>
            <select value={form.cargado_por} onChange={e => set('cargado_por', e.target.value)} style={inputStyle}>
              {CARGADO_POR.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <Label>País</Label>
            <select value={form.pais} onChange={e => set('pais', e.target.value)} style={inputStyle}>
              {PAISES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <Label>Nombre paciente *</Label>
            <input type="text" value={form.pac_nombre} onChange={e => set('pac_nombre', e.target.value)} style={inputStyle} placeholder="Nombre completo" />
          </div>

          <div>
            <Label>Email paciente *</Label>
            <input type="email" value={form.pac_mail} onChange={e => set('pac_mail', e.target.value)} style={inputStyle} placeholder="paciente@mail.com" />
          </div>

          <div style={{ gridColumn: '1/-1' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#374151' }}>
              <input
                type="checkbox"
                checked={form.sin_psi}
                onChange={e => set('sin_psi', e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#007271', cursor: 'pointer' }}
              />
              No necesita datos del psicólogo
            </label>
          </div>

          {!form.sin_psi && (
            <>
              <div>
                <Label>Nombre psicólogo</Label>
                <input type="text" value={form.psi_nombre} onChange={e => set('psi_nombre', e.target.value)} style={inputStyle} placeholder="Nombre completo" />
              </div>
              <div>
                <Label>Email psicólogo</Label>
                <input type="email" value={form.psi_mail} onChange={e => set('psi_mail', e.target.value)} style={inputStyle} placeholder="psicologo@mail.com" />
              </div>
            </>
          )}

          <div style={{ gridColumn: '1/-1' }}>
            <Label>Tipo de caso *</Label>
            <select value={form.tipo_caso} onChange={e => set('tipo_caso', e.target.value)} style={inputStyle}>
              <option value="">Seleccionar tipo de caso...</option>
              {Object.entries(TIPOS_CASO).map(([group, config]) => (
                <optgroup key={group} label={group}>
                  {config.tipos.map(t => <option key={t} value={t}>{t}</option>)}
                </optgroup>
              ))}
            </select>
            {tipoCasoInfo && (
              <div style={{ fontSize: 12, color: '#007271', marginTop: 5, fontWeight: 500 }}>
                Área asignada: {tipoCasoInfo.area}
                {tipoCasoInfo.requiere_descuento && ' · Requiere descuento'}
              </div>
            )}
          </div>

          {tipoCasoInfo?.requiere_descuento && (
            <>
              <div>
                <Label>Monto descuento *</Label>
                <input
                  type="number"
                  value={form.monto_descuento}
                  onChange={e => set('monto_descuento', e.target.value)}
                  style={inputStyle}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <Label>Mes descuento *</Label>
                <input
                  type="text"
                  value={form.mes_descuento}
                  onChange={e => set('mes_descuento', e.target.value)}
                  style={inputStyle}
                  placeholder="Ej: Julio 2026"
                />
              </div>
            </>
          )}

          <div style={{ gridColumn: '1/-1' }}>
            <Label>Descripción *</Label>
            <textarea
              value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Describir el caso en detalle..."
            />
          </div>
        </div>

        {error && (
          <div style={{ color: '#EF4444', fontSize: 13, marginTop: 16, padding: '10px 14px', background: '#FEF2F2', borderRadius: 8 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ color: '#059669', fontSize: 13, marginTop: 16, padding: '10px 14px', background: '#D1FAE5', borderRadius: 8 }}>
            {success}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              padding: '12px 36px', borderRadius: 10, border: 'none',
              background: '#007271', color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Creando...' : 'Crear caso'}
          </button>
        </div>
      </div>
    </div>
  )
}
