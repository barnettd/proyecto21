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

/**
 * Fire-and-forget email via Resend. Never throws: a failed notification
 * must not affect her submission, which is already stored.
 */
export async function notifyResponse(
  day: { day_number: number; title: string | null },
  tracks: SubmittedTrack[],
  text?: string | null,
): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim()
  const to = process.env.P21_NOTIFY_EMAIL?.trim()
  if (!key || !to) return

  const from = process.env.P21_NOTIFY_FROM?.trim() || 'PROYECTO 21 <onboarding@resend.dev>'
  const { subject, body } = buildNotification(day, tracks, text)

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, text: body }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) console.error('[p21] notification failed', res.status, await res.text())
  } catch (err) {
    console.error('[p21] notification failed', err)
  }
}
