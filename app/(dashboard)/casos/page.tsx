'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { Caso } from '../../../lib/types'
import { ESTADOS } from '../../../lib/constants'
import CaseTable from '../../../components/CaseTable'
import CaseModal from '../../../components/CaseModal'

const AREAS = ['Admin', 'Talent', 'Admin+Talent', 'CX']

const selStyle: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 8, border: '1.5px solid #E5E7EB',
  fontSize: 13, background: '#fff', cursor: 'pointer', outline: 'none',
}

export default function CasosPage() {
  const [casos, setCasos] = useState<Caso[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Caso | null>(null)
  const [filterArea, setFilterArea] = useState('')
  const [filterEstado, setFilterEstado] = useState('')

  useEffect(() => { fetchCasos() }, [])

  async function fetchCasos() {
    const { data } = await supabase
      .from('casos').select('*').order('created_at', { ascending: false })
    if (data) setCasos(data)
    setLoading(false)
  }

  const filtered = casos.filter(c =>
    (!filterArea || c.area === filterArea) &&
    (!filterEstado || c.estado === filterEstado)
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#264534', margin: 0 }}>Todos los casos</h1>
          <p style={{ color: '#9CA3AF', fontSize: 13, marginTop: 4, marginBottom: 0 }}>
            {filtered.length} caso{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={filterArea} onChange={e => setFilterArea(e.target.value)} style={selStyle}>
            <option value="">Todas las áreas</option>
            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} style={selStyle}>
            <option value="">Todos los estados</option>
            {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#9CA3AF', textAlign: 'center', paddingTop: 60 }}>Cargando...</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0ede8', overflow: 'hidden' }}>
          <CaseTable casos={filtered} onSelect={setSelected} />
        </div>
      )}

      {selected && (
        <CaseModal
          caso={selected}
          onClose={() => setSelected(null)}
          onUpdate={fetchCasos}
        />
      )}
    </div>
  )
}
