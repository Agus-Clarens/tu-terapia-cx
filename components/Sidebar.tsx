'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const NAV = [
  { href: '/casos', label: 'Todos los casos', icon: '🗂' },
  { href: '/admin', label: 'Admin', icon: '🏛' },
  { href: '/talent', label: 'Talent', icon: '🎯' },
  { href: '/cx', label: 'CX', icon: '💬' },
  { href: '/descuentos', label: 'Descuentos', icon: '💰' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: 240, height: '100vh',
      background: '#264534', display: 'flex', flexDirection: 'column',
      padding: '24px 0', zIndex: 40,
    }}>
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 8 }}>
        <div style={{
          fontSize: 20, fontWeight: 700, color: '#FEFAF5',
          mixBlendMode: 'screen', letterSpacing: -0.3,
        }}>
          🌿 Tu Terapia
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
          Gestión de Casos
        </div>
      </div>

      <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8, textDecoration: 'none',
              fontSize: 14, fontWeight: active ? 600 : 400,
              color: active ? '#fff' : 'rgba(255,255,255,0.6)',
              background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
            }}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '0 12px 12px' }}>
        <Link href="/nuevo-caso" style={{
          display: 'block', textAlign: 'center',
          padding: '11px 12px', borderRadius: 8, textDecoration: 'none',
          fontSize: 14, fontWeight: 600, color: '#fff', background: '#007271',
        }}>
          + Nuevo caso
        </Link>
      </div>

      <div style={{ padding: '0 12px' }}>
        <button onClick={handleLogout} style={{
          width: '100%', padding: '8px 12px', borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.15)', background: 'transparent',
          color: 'rgba(255,255,255,0.45)', fontSize: 13, cursor: 'pointer',
        }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
