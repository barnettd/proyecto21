'use server'

import { getResponse, loadContent, saveResponse } from '@/lib/content'
import { resolveActiveDay } from '@/lib/schedule'
import { fetchTrackMeta, resolveSpotifyInput, spotifyTrackUrl } from '@/lib/spotify'
import type { SubmittedTrack } from '@/lib/types'

export type SubmitState = { ok: boolean; error?: string }

const clip = (v: FormDataEntryValue | null) => String(v ?? '').trim().slice(0, 200)

/**
 * The day is resolved on the server, never taken from the form, so a stale
 * tab can't write into a day that is no longer active.
 */
export async function submitSingleTrack(_prev: SubmitState, form: FormData): Promise<SubmitState> {
  const { days, settings } = await loadContent()
  const active = resolveActiveDay(days, new Date(), settings.force_active_day)
  if (active.kind !== 'day' || active.day.experience_type !== 'single_track') {
    return { ok: false, error: 'Esto ya no está disponible.' }
  }
  const { day } = active
  if (await getResponse(day.id)) return { ok: true }

  let track: SubmittedTrack
  const link = clip(form.get('spotify_url'))
  if (link) {
    const id = await resolveSpotifyInput(link)
    if (!id) {
      return { ok: false, error: 'Ese link no parece de una canción. En Spotify: Compartir → Copiar enlace.' }
    }
    track = { spotify_url: spotifyTrackUrl(id), ...(await fetchTrackMeta(id)) }
  } else {
    const title = clip(form.get('title'))
    if (!title) return { ok: false, error: 'Falta la canción.' }
    track = { spotify_url: null, title, artist: clip(form.get('artist')) || null }
  }

  const tag = typeof day.config_json.response_tag === 'string' ? day.config_json.response_tag : null
  try {
    await saveResponse(day.id, 'single_track', { tracks: [track] }, [track], tag)
    return { ok: true }
  } catch (err) {
    console.error('[p21] save failed', err)
    return { ok: false, error: 'No se pudo guardar. Probá de nuevo en un rato.' }
  }
}
