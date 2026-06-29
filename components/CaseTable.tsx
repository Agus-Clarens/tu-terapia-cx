'use client'
import { Caso } from '../lib/types'
import StatusBadge from './StatusBadge'

interface Props {
  casos: Caso[]
  onSelect: (caso: Caso) => void
}

export default function CaseTable({ casos, onSelect }: Props) {
  if (casos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF', fontSize: 14 }}>
        No hay casos para mostrar.
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #f0ede8', background: '#faf8f4' }}>
            {['N° Caso', 'Fecha', 'Paciente', 'Psicólogo', 'Tipo', 'Área', 'Estado', 'Cargado por'].map(h => (
              <th key={h} style={{
                padding: '10px 14px', textAlign: 'left', fontWeight: 600,
                fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5,
                whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {casos.map(caso => (
            <tr
              key={caso.id}
              onClick={() => onSelect(caso)}
              style={{ borderBottom: '1px solid #f0ede8', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#faf8f4')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <td style={{ padding: '12px 14px', fontWeight: 700, color: '#264534', whiteSpace: 'nowrap' }}>{caso.nro_caso}</td>
              <td style={{ padding: '12px 14px', color: '#6B7280', whiteSpace: 'nowrap' }}>{caso.fecha}</td>
              <td style={{ padding: '12px 14px' }}>{caso.pac_nombre}</td>
              <td style={{ padding: '12px 14px', color: '#6B7280' }}>{caso.psi_nombre || '—'}</td>
              <td style={{ padding: '12px 14px', maxWidth: 200 }}>{caso.tipo_caso}</td>
              <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                <span style={{
                  display: 'inline-block', padding: '2px 9px', borderRadius: 20,
                  fontSize: 11, fontWeight: 600, background: '#e3ede3', color: '#264534',
                }}>{caso.area}</span>
              </td>
              <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                <StatusBadge estado={caso.estado} />
              </td>
              <td style={{ padding: '12px 14px', color: '#6B7280', whiteSpace: 'nowrap' }}>{caso.cargado_por}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
