'use server'

import { after } from 'next/server'
import { deleteLocalResponse, getResponse, loadContent, saveResponse } from '@/lib/content'
import { notifyResponse } from '@/lib/notify'
import { decisionLog, validatePicks } from '@/lib/bracket'
import { resolveActiveDay } from '@/lib/schedule'
import { fetchTrackMeta, parseSpotifyTrackId, resolveSpotifyInput, spotifyTrackUrl } from '@/lib/spotify'
import type { Day, TaggedTrack } from '@/lib/types'

export type SubmitState = { ok: boolean; error?: string }

const clip = (v: FormDataEntryValue | null) => String(v ?? '').trim().slice(0, 200)

/**
 * The active day, resolved server-side so a stale tab can't write into a day that has passed.
 * Outside production, a local preview may name the day it is showing, so days that are not
 * yet active can be walked end to end. The hidden field is ignored in production.
 */
async function activeDayOfType(type: Day['experience_type'], form?: FormData): Promise<Day | null> {
  const { days, settings } = await loadContent()

  if (process.env.NODE_ENV !== 'production') {
    const previewId = String(form?.get('preview_day') ?? '')
    if (previewId) {
      const day = days.find((d) => d.id === previewId)
      return day?.experience_type === type ? day : null
    }
  }

  const active = resolveActiveDay(days, new Date(), settings.force_active_day)
  return active.kind === 'day' && active.day.experience_type === type ? active.day : null
}

async function persist(
  day: Day,
  responseType: string,
  tracks: TaggedTrack[],
  extra: Record<string, unknown> = {},
): Promise<SubmitState> {
  try {
    const result = await saveResponse(day.id, responseType, { tracks, ...extra }, tracks)
    // Email after the response is sent, so a slow mail server never delays her.
    if (result === 'saved') after(() => notifyResponse(day, tracks))
    return { ok: true }
  } catch (err) {
    console.error('[p21] save failed', err)
    return { ok: false, error: 'No se pudo guardar. Probá de nuevo en un rato.' }
  }
}

export async function submitSingleTrack(_prev: SubmitState, form: FormData): Promise<SubmitState> {
  const day = await activeDayOfType('single_track', form)
  if (!day) return { ok: false, error: 'Esto ya no está disponible.' }
  if (await getResponse(day.id)) return { ok: true }

  let track: TaggedTrack
  const link = clip(form.get('spotify_url'))
  const tag = typeof day.config_json.response_tag === 'string' ? day.config_json.response_tag : null
  if (link) {
    const id = await resolveSpotifyInput(link)
    if (!id) {
      return { ok: false, error: 'Ese link no parece de una canción. En Spotify: Compartir → Copiar enlace.' }
    }
    track = { spotify_url: spotifyTrackUrl(id), ...(await fetchTrackMeta(id)), tag }
  } else {
    const title = clip(form.get('title'))
    if (!title) return { ok: false, error: 'Falta la canción.' }
    track = { spotify_url: null, title, artist: clip(form.get('artist')) || null, tag }
  }

  return persist(day, 'single_track', [track])
}

type ModuleConfig = { name?: string; tag?: string }

/** N tracks, one per configured module, each with its own tag. All required, no repeats. */
export async function submitMultiTrack(_prev: SubmitState, form: FormData): Promise<SubmitState> {
  const day = await activeDayOfType('multi_track', form)
  if (!day) return { ok: false, error: 'Esto ya no está disponible.' }
  if (await getResponse(day.id)) return { ok: true }

  const modules = (Array.isArray(day.config_json.modules) ? day.config_json.modules : []) as ModuleConfig[]
  if (!modules.length) return { ok: false, error: 'No se pudo guardar. Probá de nuevo en un rato.' }

  const links = modules.map((_, i) => clip(form.get(`track_${i}`)))
  if (links.some((l) => !l)) return { ok: false, error: 'Faltan canciones: son tres.' }

  const ids = await Promise.all(links.map(resolveSpotifyInput))
  const missing = ids.findIndex((id) => !id)
  if (missing >= 0) {
    const name = modules[missing]?.name ?? String(missing + 1)
    return { ok: false, error: `El link de ${name} no parece de una canción. En Spotify: Compartir → Copiar enlace.` }
  }
  if (new Set(ids).size !== ids.length) {
    return { ok: false, error: 'Hay una canción repetida. Elegí tres distintas.' }
  }

  const metas = await Promise.all(ids.map((id) => fetchTrackMeta(id as string)))
  const tracks: TaggedTrack[] = ids.map((id, i) => ({
    spotify_url: spotifyTrackUrl(id as string),
    ...metas[i],
    tag: modules[i]?.tag ?? null,
  }))

  return persist(day, 'multi_track', tracks)
}

/** Dev-only: clears the local preview response. In production it does nothing. */
export async function resetPreview(dayId: string): Promise<void> {
  if (process.env.NODE_ENV === 'production') return
  await deleteLocalResponse(dayId)
}

type ConfigTrack = { title?: string; artist?: string; spotify_url?: string }

/** Seven decisions plus a wildcard that never competed. */
export async function submitBracket(_prev: SubmitState, form: FormData): Promise<SubmitState> {
  const day = await activeDayOfType('bracket', form)
  if (!day) return { ok: false, error: 'Esto ya no está disponible.' }
  if (await getResponse(day.id)) return { ok: true }

  const configTracks = (Array.isArray(day.config_json.tracks) ? day.config_json.tracks : []) as ConfigTrack[]
  if (configTracks.length < 2) return { ok: false, error: 'No se pudo guardar. Probá de nuevo en un rato.' }

  let raw: unknown
  try {
    raw = JSON.parse(String(form.get('picks') ?? ''))
  } catch {
    return { ok: false, error: 'Faltan decisiones.' }
  }
  const checked = validatePicks(raw, configTracks.length)
  if (!checked.ok) return { ok: false, error: checked.error }

  const wildcardId = await resolveSpotifyInput(clip(form.get('wildcard')))
  if (!wildcardId) {
    return { ok: false, error: 'Ese link no parece de una canción. En Spotify: Compartir → Copiar enlace.' }
  }
  if (configTracks.some((t) => t.spotify_url && parseSpotifyTrackId(t.spotify_url) === wildcardId)) {
    return { ok: false, error: 'Esa ya estaba en la llave. Elegí una que no haya competido.' }
  }

  const bonus = String(form.get('bonus') ?? '')
  if (bonus !== 'survivor' && bonus !== 'wildcard') return { ok: false, error: 'Falta la elección final.' }

  const survivor = configTracks[checked.picks[6]]
  const survivorTrack: TaggedTrack = {
    spotify_url: survivor.spotify_url ?? null,
    title: survivor.title ?? null,
    artist: survivor.artist ?? null,
    tag: 'D2_WINNER',
    source: 'P21',
    playlist_status: bonus === 'survivor' ? 'winner' : 'candidate',
  }
  const wildcardTrack: TaggedTrack = {
    spotify_url: spotifyTrackUrl(wildcardId),
    ...(await fetchTrackMeta(wildcardId)),
    tag: 'D2_WILDCARD',
    playlist_status: bonus === 'wildcard' ? 'winner' : 'candidate',
  }
  const finalTrack = bonus === 'survivor' ? survivorTrack : wildcardTrack

  return persist(day, 'bracket', [survivorTrack, wildcardTrack], {
    decisions: decisionLog(checked.picks),
    bonus_duel: { survivor: survivorTrack, wildcard: wildcardTrack, winner: bonus },
    final_track: finalTrack,
  })
}
