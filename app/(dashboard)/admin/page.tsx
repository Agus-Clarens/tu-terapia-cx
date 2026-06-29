'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { Caso } from '../../../lib/types'
import CaseTable from '../../../components/CaseTable'
import CaseModal from '../../../components/CaseModal'

export default function AdminPage() {
  const [casos, setCasos] = useState<Caso[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Caso | null>(null)

  useEffect(() => { fetchCasos() }, [])

  async function fetchCasos() {
    const { data } = await supabase
      .from('casos').select('*')
      .in('area', ['Admin', 'Admin+Talent'])
      .order('created_at', { ascending: false })
    if (data) setCasos(data)
    setLoading(false)
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#264534', margin: 0 }}>Admin</h1>
        <p style={{ color: '#9CA3AF', fontSize: 13, marginTop: 4, marginBottom: 0 }}>
          {casos.length} caso{casos.length !== 1 ? 's' : ''}
        </p>
      </div>
      {loading ? (
        <div style={{ color: '#9CA3AF', textAlign: 'center', paddingTop: 60 }}>Cargando...</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0ede8', overflow: 'hidden' }}>
          <CaseTable casos={casos} onSelect={setSelected} />
        </div>
      )}
      {selected && (
        <CaseModal caso={selected} onClose={() => setSelected(null)} onUpdate={fetchCasos} />
      )}
    </div>
  )
}
