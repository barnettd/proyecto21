'use server'

import { after } from 'next/server'
import { allowAiCall, deleteLocalResponse, getResponse, loadContent, saveResponse } from '@/lib/content'
import { buildSets, type Line } from '@/lib/ai'
import { checkLine, type Fragment } from '@/lib/mixer'
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

type FragmentConfig = { key?: string; title?: string; p21?: { track?: { spotify_url?: string } } }

/** D6: la canción de siempre, más tres canciones con su recuerdo escrito. */
export async function submitMemory(_prev: SubmitState, form: FormData): Promise<SubmitState> {
  const day = await activeDayOfType('memory', form)
  if (!day) return { ok: false, error: 'Esto ya no está disponible.' }
  if (await getResponse(day.id)) return { ok: true }

  const fragments = (Array.isArray(day.config_json.fragments) ? day.config_json.fragments : []) as FragmentConfig[]
  if (!fragments.length) return { ok: false, error: 'No se pudo guardar. Probá de nuevo en un rato.' }

  const limit = typeof day.config_json.text_limit === 'number' ? day.config_json.text_limit : 300
  const slots = ['childhood', ...fragments.map((f) => f.key ?? '')]
  const names = ['la primera', ...fragments.map((f) => f.title ?? f.key ?? '')]
  const links = slots.map((key) => clip(form.get(`track_${key}`)))
  const sinLink = links.findIndex((l) => !l)
  if (sinLink >= 0) return { ok: false, error: `Falta la canción de ${names[sinLink]}.` }

  const ids = await Promise.all(links.map(resolveSpotifyInput))
  if (ids.some((id) => !id)) {
    return { ok: false, error: 'Uno de los links no parece de una canción. En Spotify: Compartir → Copiar enlace.' }
  }
  if (new Set(ids).size !== ids.length) return { ok: false, error: 'Hay una canción repetida.' }

  // Tampoco puede mandar una de las mías.
  const mine = fragments
    .map((f) => (f.p21?.track?.spotify_url ? parseSpotifyTrackId(f.p21.track.spotify_url) : null))
    .filter(Boolean)
  if (ids.some((id) => mine.includes(id))) return { ok: false, error: 'Esa es una de las mías. Elegí otra.' }

  const texts = fragments.map((f) => String(form.get(`text_${f.key ?? ''}`) ?? '').trim().slice(0, limit))
  const sinTexto = texts.findIndex((t) => !t)
  if (sinTexto >= 0) {
    return { ok: false, error: `Falta lo que escribís en ${fragments[sinTexto].title ?? fragments[sinTexto].key}.` }
  }

  const metas = await Promise.all(ids.map((id) => fetchTrackMeta(id as string)))
  const tags = ['D6_CHILDHOOD_USER_TRACK', ...fragments.map((f) => `D6_${String(f.key ?? '').toUpperCase()}_USER_TRACK`)]
  const tracks: TaggedTrack[] = ids.map((id, i) => ({
    spotify_url: spotifyTrackUrl(id as string),
    ...metas[i],
    tag: tags[i],
  }))

  const notes = Object.fromEntries(
    fragments.map((f, i) => [`D6_${String(f.key ?? '').toUpperCase()}_USER_TEXT`, texts[i]]),
  )

  return persist(day, 'memory', tracks, { notes })
}

type ScenarioConfig = { key?: string; title?: string }

/** D7: cuatro escenas cotidianas con su canción, y la misión que queda abierta. */
export async function submitScenarios(_prev: SubmitState, form: FormData): Promise<SubmitState> {
  const day = await activeDayOfType('scenarios', form)
  if (!day) return { ok: false, error: 'Esto ya no está disponible.' }
  if (await getResponse(day.id)) return { ok: true }

  const scenarios = (Array.isArray(day.config_json.scenarios) ? day.config_json.scenarios : []) as ScenarioConfig[]
  if (!scenarios.length) return { ok: false, error: 'No se pudo guardar. Probá de nuevo en un rato.' }

  const links = scenarios.map((s) => clip(form.get(`track_${s.key ?? ''}`)))
  const sinLink = links.findIndex((l) => !l)
  if (sinLink >= 0) return { ok: false, error: `Falta la canción de ${scenarios[sinLink].title ?? sinLink + 1}.` }

  const ids = await Promise.all(links.map(resolveSpotifyInput))
  if (ids.some((id) => !id)) {
    return { ok: false, error: 'Uno de los links no parece de una canción. En Spotify: Compartir → Copiar enlace.' }
  }
  if (new Set(ids).size !== ids.length) return { ok: false, error: 'Hay una canción repetida.' }

  const metas = await Promise.all(ids.map((id) => fetchTrackMeta(id as string)))
  const tracks: TaggedTrack[] = ids.map((id, i) => ({
    spotify_url: spotifyTrackUrl(id as string),
    ...metas[i],
    tag: `D7_${String(scenarios[i].key ?? '').toUpperCase()}_USER_TRACK`,
  }))

  // Llegar hasta acá es aceptar el desafío: la misión queda abierta.
  return persist(day, 'scenarios', tracks, { guitar_mission_accepted: true })
}

type D8Fragment = { id: string; owner: 'her' | 'p21'; excerpt: string }

/** Las siete frases: las cuatro de ella vienen del navegador, las tres mías del día. */
async function d8Sources(day: Day, hers: unknown): Promise<Fragment[]> {
  const mine = (Array.isArray(day.config_json.reveal_fragments) ? day.config_json.reveal_fragments : []) as Array<{
    excerpt?: string
  }>
  const her = (Array.isArray(hers) ? hers : []) as Array<{ excerpt?: string }>
  return [
    ...her.map((f, i) => ({ id: `u${i + 1}`, owner: 'her' as const, excerpt: String(f?.excerpt ?? '').trim() })),
    ...mine.map((f, i) => ({ id: `p${i + 1}`, owner: 'p21' as const, excerpt: String(f?.excerpt ?? '').trim() })),
  ].filter((f) => f.excerpt.length > 0)
}

export type MixState = { sets?: Line[][]; error?: string }

/** D8: una tanda de mezclas. El modelo propone y el servidor verifica. */
export async function mixLines(
  hers: D8Fragment[],
  avoid: string[],
  previewDayId?: string,
): Promise<MixState> {
  const { days, settings } = await loadContent()
  let day: Day | undefined
  if (previewDayId && process.env.NODE_ENV !== 'production') {
    day = days.find((d) => d.id === previewDayId)
  } else {
    const active = resolveActiveDay(days, new Date(), settings.force_active_day)
    day = active.kind === 'day' ? active.day : undefined
  }
  if (!day || day.experience_type !== 'lyrics') return { error: 'Esto ya no está disponible.' }

  const sources = await d8Sources(day, hers)
  if (sources.length < 5) return { error: 'Faltan frases para mezclar.' }

  const max = Number(process.env.D8_MAX_AI_CALLS ?? 40) || 40
  if (!(await allowAiCall(max))) {
    // Sin cuota: el combinador propio igual devuelve algo válido.
    const { sets } = await buildSets(sources, avoid.slice(-60), 0)
    return { sets, error: sets.length ? undefined : 'El laboratorio está descansando. Probá de nuevo más tarde.' }
  }

  const { sets, error } = await buildSets(sources, avoid.slice(-60), 5)
  if (!sets.length) return { error: error ? 'No salió ninguna combinación. Probá de nuevo.' : 'Probá de nuevo.' }
  return { sets }
}

type Finalist = { text?: string; title?: string }

/** D8: cuatro frases de ella, y las dos criaturas finales. */
export async function submitLyrics(_prev: SubmitState, form: FormData): Promise<SubmitState> {
  const day = await activeDayOfType('lyrics', form)
  if (!day) return { ok: false, error: 'Esto ya no está disponible.' }
  if (await getResponse(day.id)) return { ok: true }

  const categories = (Array.isArray(day.config_json.categories) ? day.config_json.categories : []) as Array<{
    key?: string
    title?: string
  }>

  let hers: Array<{ link?: string; excerpt?: string }>
  let finalists: { favorite?: Finalist; accident?: Finalist }
  try {
    hers = JSON.parse(String(form.get('fragments') ?? '[]'))
    finalists = JSON.parse(String(form.get('finalists') ?? '{}'))
  } catch {
    return { ok: false, error: 'No se pudo guardar. Probá de nuevo.' }
  }

  if (hers.length !== categories.length) return { ok: false, error: 'Faltan frases.' }

  const ids = await Promise.all(hers.map((f) => resolveSpotifyInput(clip(f.link ?? null))))
  const sinLink = ids.findIndex((id) => !id)
  if (sinLink >= 0) return { ok: false, error: `Falta la canción de ${categories[sinLink]?.title ?? sinLink + 1}.` }

  const metas = await Promise.all(ids.map((id) => fetchTrackMeta(id as string)))
  const tracks: TaggedTrack[] = ids.map((id, i) => ({
    spotify_url: spotifyTrackUrl(id as string),
    ...metas[i],
    tag: `D8_${String(categories[i]?.key ?? i + 1).toUpperCase()}_USER_TRACK`,
  }))

  const favorite = String(finalists.favorite?.text ?? '').trim()
  const accident = String(finalists.accident?.text ?? '').trim()
  if (!favorite || !accident) return { ok: false, error: 'Faltan las dos criaturas.' }
  if (favorite.toLowerCase() === accident.toLowerCase()) {
    return { ok: false, error: 'Las dos criaturas tienen que ser distintas.' }
  }

  // La procedencia se recalcula acá: lo que ella escribió a mano queda marcado como suyo.
  const sources = await d8Sources(day, hers)
  const provenance = (text: string) => {
    const check = checkLine(text, sources, { allowAdded: true, limits: { minSources: 1, maxFromOne: 1 } })
    return check.ok ? { contributions: check.contributions, added: check.added } : { contributions: [], added: [] }
  }

  return persist(day, 'lyrics', tracks, {
    fragments: hers.map((f, i) => ({
      key: categories[i]?.key ?? String(i + 1),
      excerpt: String(f.excerpt ?? '').trim(),
    })),
    favorite: { text: favorite, title: finalists.favorite?.title ?? null, ...provenance(favorite) },
    accident: { text: accident, title: finalists.accident?.title ?? null, ...provenance(accident) },
  })
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
