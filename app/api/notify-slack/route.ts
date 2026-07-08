import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { nro_caso, area, tipo_caso, pac_nombre, cargado_por, pais } = await req.json()
  const webhook = process.env.SLACK_WEBHOOK_URL
  if (!webhook) return NextResponse.json({ ok: false })
  const mensaje = `🆕 *Nuevo caso ${nro_caso}*\n*Área:* ${area}\n*Tipo:* ${tipo_caso}\n*Paciente:* ${pac_nombre}\n*País:* ${pais}\n*Cargado por:* ${cargado_por}`
  await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: mensaje }) })
  return NextResponse.json({ ok: true })
}
