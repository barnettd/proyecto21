'use server'

import { after } from 'next/server'
import { deleteLocalResponse, getResponse, loadContent, saveResponse } from '@/lib/content'
import { notifyResponse } from '@/lib/notify'
import { decisionLog, validatePicks } from '@/lib/bracket'
import { resolveActiveDay } from '@/lib/schedule'
import { phraseMatches } from '@/lib/text'
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

  const survivor = configTracks[checked.picks[checked.picks.length - 1]]
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
    decisions: decisionLog(checked.picks, configTracks.length),
    bonus_duel: { survivor: survivorTrack, wildcard: wildcardTrack, winner: bonus },
    final_track: finalTrack,
  })
}

/** One track, plus whatever extra the day wants recorded (D4 printable, D5 kit). */
async function submitOneTrack(
  type: Day['experience_type'],
  responseType: string,
  form: FormData,
  extra: (day: Day) => Record<string, unknown> = () => ({}),
): Promise<SubmitState> {
  const day = await activeDayOfType(type, form)
  if (!day) return { ok: false, error: 'Esto ya no está disponible.' }
  if (await getResponse(day.id)) return { ok: true }

  const id = await resolveSpotifyInput(clip(form.get('track')))
  if (!id) {
    return { ok: false, error: 'Ese link no parece de una canción. En Spotify: Compartir → Copiar enlace.' }
  }
  const tag = typeof day.config_json.response_tag === 'string' ? day.config_json.response_tag : null
  const track: TaggedTrack = { spotify_url: spotifyTrackUrl(id), ...(await fetchTrackMeta(id)), tag }

  return persist(day, responseType, [track], extra(day))
}

/** D4: she downloads and solves on paper, then answers with one song. */
/**
 * D4: revisa la frase del crucigrama del lado del servidor, para que la
 * respuesta no viaje al navegador. Devuelve solo sí o no.
 */
export async function verifyPhrase(guess: string, previewDayId?: string): Promise<boolean> {
  const { days, settings } = await loadContent()

  let day: Day | undefined
  if (previewDayId && process.env.NODE_ENV !== 'production') {
    day = days.find((d) => d.id === previewDayId)
  } else {
    const active = resolveActiveDay(days, new Date(), settings.force_active_day)
    day = active.kind === 'day' ? active.day : undefined
  }
  if (!day || day.experience_type !== 'printable') return false

  const phrase = day.config_json.phrase as { answer?: unknown } | undefined
  return typeof phrase?.answer === 'string' && phraseMatches(phrase.answer, String(guess).slice(0, 200))
}

export async function submitPrintable(_prev: SubmitState, form: FormData): Promise<SubmitState> {
  return submitOneTrack('printable', 'printable', form, () => ({
    printable_opened: String(form.get('opened') ?? '') === 'true',
    phrase_solved: String(form.get('phrase_solved') ?? '') === 'true',
    phrase_attempts: Number(form.get('phrase_attempts') ?? 0) || 0,
  }))
}

const MAX_KIT_TRACKS = 5

/** D5: three tracks from P21, then between one and five from her. */
export async function submitKit(_prev: SubmitState, form: FormData): Promise<SubmitState> {
  const day = await activeDayOfType('track_list', form)
  if (!day) return { ok: false, error: 'Esto ya no está disponible.' }
  if (await getResponse(day.id)) return { ok: true }

  // Los campos opcionales vacíos no cuentan: se descartan antes de validar.
  const links = Array.from({ length: MAX_KIT_TRACKS }, (_, i) => clip(form.get(`track_${i}`))).filter(Boolean)
  if (!links.length) return { ok: false, error: 'Falta la canción.' }

  const ids = await Promise.all(links.map(resolveSpotifyInput))
  const missing = ids.findIndex((id) => !id)
  if (missing >= 0) {
    return { ok: false, error: 'Uno de los links no parece de una canción. En Spotify: Compartir → Copiar enlace.' }
  }
  if (new Set(ids).size !== ids.length) return { ok: false, error: 'Hay una canción repetida.' }

  const tagFor = (i: number) => `D5_RECOVERY_USER_${String(i + 1).padStart(2, '0')}`
  const metas = await Promise.all(ids.map((id) => fetchTrackMeta(id as string)))
  const tracks: TaggedTrack[] = ids.map((id, i) => ({
    spotify_url: spotifyTrackUrl(id as string),
    ...metas[i],
    tag: tagFor(i),
  }))

  return persist(day, 'track_list', tracks, {
    kit: Array.isArray(day.config_json.compartments) ? day.config_json.compartments : [],
    track_count: tracks.length,
  })
}
