'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const NAV = [
  { href: '/casos', label: 'Todos los casos' },
  { href: '/admin', label: 'Admin' },
  { href: '/talent', label: 'Talent' },
  { href: '/cx', label: 'CX' },
  { href: '/descuentos', label: 'Descuentos' },
]

function Ilustracion() {
  return (
    <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', opacity: 0.25 }}>
      {/* Persona sentada con laptop */}
      <circle cx="80" cy="30" r="14" fill="none" stroke="#75B781" strokeWidth="2.5"/>
      <path d="M60 55 Q80 45 100 55 L105 90 H55 Z" fill="none" stroke="#75B781" strokeWidth="2.5"/>
      <rect x="45" y="72" width="70" height="42" rx="4" fill="none" stroke="#75B781" strokeWidth="2.5"/>
      <rect x="50" y="77" width="60" height="32" rx="2" fill="none" stroke="#75B781" strokeWidth="1.5"/>
      <line x1="40" y1="114" x2="120" y2="114" stroke="#75B781" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Burbuja de dialogo */}
      <rect x="95" y="15" width="40" height="28" rx="6" fill="none" stroke="#75B781" strokeWidth="2"/>
      <path d="M100 43 L96 50 L108 43" fill="none" stroke="#75B781" strokeWidth="2"/>
      <circle cx="107" cy="29" r="2" fill="#75B781"/>
      <circle cx="115" cy="29" r="2" fill="#75B781"/>
      <circle cx="123" cy="29" r="2" fill="#75B781"/>
    </svg>
  )
}

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
      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 8 }}>
        <Image
          src="/logo.png"
          alt="Tu Terapia"
          width={160}
          height={64}
          style={{ mixBlendMode: 'screen', objectFit: 'contain' }}
        />
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
          Gestión de Casos Internos
        </div>
      </div>

      <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ href, label }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center',
              padding: '10px 12px', borderRadius: 8, textDecoration: 'none',
              fontSize: 14, fontWeight: active ? 600 : 400,
              color: active ? '#fff' : 'rgba(255,255,255,0.6)',
              background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
            }}>
              {label}
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '0 20px 8px' }}>
        <Ilustracion />
      </div>

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
