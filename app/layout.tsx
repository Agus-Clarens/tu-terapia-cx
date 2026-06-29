import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tu Terapia · Casos',
  description: 'Sistema de gestión de casos Tu Terapia',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ background: '#FEFAF5' }}>{children}</body>
    </html>
  )
}
