import { STATUS_COLORS } from '../lib/constants'

export default function StatusBadge({ estado }: { estado: string }) {
  const color = STATUS_COLORS[estado] || '#9CA3AF'
  const isClosed = estado === 'Cerrado'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
      background: color,
      color: isClosed ? 'rgba(55,65,81,0.8)' : '#1a2e1a',
      opacity: isClosed ? 0.6 : 1,
      whiteSpace: 'nowrap',
    }}>
      {estado}
    </span>
  )
}
