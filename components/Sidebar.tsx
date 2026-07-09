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
    <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', opacity: 0.28 }}>
      <circle cx="80" cy="28" r="13" fill="none" stroke="#75B781" strokeWidth="2.5"/>
      <path d="M62 52 Q80 43 98 52 L103 85 H57 Z" fill="none" stroke="#75B781" strokeWidth="2.5"/>
      <rect x="46" y="70" width="68" height="40" rx="4" fill="none" stroke="#75B781" strokeWidth="2.5"/>
      <rect x="51" y="75" width="58" height="30" rx="2" fill="none" stroke="#75B781" strokeWidth="1.5"/>
      <line x1="40" y1="110" x2="120" y2="110" stroke="#75B781" strokeWidth="2.5" strokeLinecap="round"/>
      <rect x="96" y="12" width="38" height="26" rx="6" fill="none" stroke="#75B781" strokeWidth="2"/>
      <path d="M101 38 L98 45 L110 38" fill="none" stroke="#75B781" strokeWidth="2"/>
      <circle cx="107" cy="25" r="2" fill="#75B781"/>
      <circle cx="115" cy="25" r="2" fill="#75B781"/>
      <circle cx="123" cy="25" r="2" fill="#75B781"/>
      <text x="80" y="130" textAnchor="middle" fontFamily="Georgia, serif" fontSize="9.5" fill="#75B781" fontStyle="italic" opacity="0.9">juntas llegamos</text>
      <text x="80" y="144" textAnchor="middle" fontFamily="Georgia, serif" fontSize="9.5" fill="#75B781" fontStyle="italic" opacity="0.9">más lejos 🌿</text>
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
      padding: '20px 0', zIndex: 40,
    }}>
      <div style={{ padding: '0 16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 8 }}>
        <Image
          src="/logo.png"
          alt="Tu Terapia"
          width={200}
          height={80}
          style={{ mixBlendMode: 'screen', objectFit: 'contain', width: "140px", height: "auto" }}
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

      <div style={{ padding: '0 20px 4px' }}>
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
