import type { SubmittedTrack } from './types.ts'

/** Plain-text email announcing what she just sent. No links back into the project. */
export function buildNotification(
  day: { day_number: number; title: string | null },
  tracks: SubmittedTrack[],
  text?: string | null,
): { subject: string; body: string } {
  const label = day.title ? `D${day.day_number} · ${day.title}` : `D${day.day_number}`
  const lines = tracks.map((t) => {
    const name = [t.title, t.artist].filter(Boolean).join(' — ') || '(sin título)'
    return t.spotify_url ? `• ${name}\n  ${t.spotify_url}` : `• ${name}`
  })
  if (text) lines.push('', `"${text}"`)
  if (!lines.length) lines.push('(sin canciones)')

  return {
    subject: `P.21 · ${label} · respondió`,
    body: [`${label}`, '', ...lines].join('\n'),
  }
}

/** Qué pasó con el envío. Sirve para el diagnóstico; el aviso normal lo ignora. */
export type NotifyResult = { sent: boolean; reason?: string }

/**
 * Fire-and-forget email via Resend. Never throws: a failed notification
 * must not affect her submission, which is already stored.
 */
export async function notifyResponse(
  day: { day_number: number; title: string | null },
  tracks: SubmittedTrack[],
  text?: string | null,
): Promise<NotifyResult> {
  const key = process.env.RESEND_API_KEY?.trim()
  const to = process.env.P21_NOTIFY_EMAIL?.trim()
  if (!key) return { sent: false, reason: 'falta RESEND_API_KEY' }
  if (!to) return { sent: false, reason: 'falta P21_NOTIFY_EMAIL' }

  const from = process.env.P21_NOTIFY_FROM?.trim() || 'PROYECTO 21 <onboarding@resend.dev>'
  const { subject, body } = buildNotification(day, tracks, text)

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], reply_to: replyTo(from), subject, text: body }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      const detail = await res.text()
      console.error('[p21] notification failed', res.status, detail)
      return { sent: false, reason: `Resend respondió ${res.status}: ${detail.slice(0, 200)}` }
    }
    return { sent: true }
  } catch (err) {
    console.error('[p21] notification failed', err)
    return { sent: false, reason: String(err).slice(0, 200) }
  }
}

/** La dirección de adentro de "Nombre <casilla@dominio>", para que responder funcione. */
function replyTo(from: string): string {
  const match = from.match(/<([^>]+)>/)
  return match ? match[1] : from
}
