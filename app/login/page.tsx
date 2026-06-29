'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 10,
  border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none',
  fontFamily: 'inherit', background: '#fff',
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    if (!email || !password) return
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    } else {
      router.replace('/casos')
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#264534',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#FEFAF5', borderRadius: 20, padding: '48px 40px',
        width: 360, boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🌿</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#264534', margin: 0 }}>Tu Terapia</h1>
          <p style={{ color: '#6B7280', fontSize: 13, marginTop: 6, marginBottom: 0 }}>
            Sistema de Gestión de Casos
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={inputStyle}
          />
          {error && <div style={{ color: '#EF4444', fontSize: 12 }}>{error}</div>}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              padding: '12px', borderRadius: 10, border: 'none',
              background: '#264534', color: '#fff', fontSize: 15, fontWeight: 600,
              cursor: 'pointer', marginTop: 4, opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>
      </div>
    </div>
  )
}
