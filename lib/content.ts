import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { seedDays, seedSettings, seedTracks } from '../content/seed.ts'
import type { Day, ResponseRecord, Settings, TaggedTrack, Track } from './types.ts'

// Server-only. The service role key must never reach the browser.
let client: SupabaseClient | null | undefined
function supabase() {
  if (client !== undefined) return client
  // Vercel's Supabase integration may use the legacy or newer key name, with or without a custom
  // prefix. Empty vars count as absent: a blank placeholder must not shadow a real value.
  const url = firstSet('SUPABASE_URL', 'STORAGE_SUPABASE_URL')
  const key = firstSet(
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_SECRET_KEY',
    'STORAGE_SUPABASE_SERVICE_ROLE_KEY',
    'STORAGE_SUPABASE_SECRET_KEY',
  )
  client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null
  return client
}

/** First env var that is set to a non-blank value. */
function firstSet(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]?.trim()
    if (value) return value
  }
  return undefined
}

function envForce(): number | null {
  const raw = process.env.FORCE_ACTIVE_DAY?.trim()
  return raw && /^\d+$/.test(raw) ? Number(raw) : null
}

const fallback = () => ({ days: seedDays, settings: { ...seedSettings, force_active_day: envForce() } })

/**
 * Never throws: if Supabase is missing, empty (schema not run yet) or down,
 * falls back to the seed, where every real day is draft → the locked state.
 */
export async function loadContent(): Promise<{ days: Day[]; settings: Settings }> {
  const db = supabase()
  if (!db) return fallback()
  try {
    const result = await fromSupabase(db)
    return result.days.length ? result : fallback()
  } catch (err) {
    console.error('[p21] Supabase unavailable, serving seed content', err)
    return fallback()
  }
}

async function fromSupabase(db: SupabaseClient) {
  const [daysRes, settingsRes] = await Promise.all([
    db.from('days').select('*').order('day_number'),
    db.from('settings').select('*').eq('id', 1).maybeSingle(),
  ])
  if (daysRes.error) throw daysRes.error
  if (settingsRes.error) throw settingsRes.error

  return {
    days: daysRes.data as Day[],
    settings: {
      force_active_day: settingsRes.data?.force_active_day ?? envForce(),
      locked_text: settingsRes.data?.locked_text ?? seedSettings.locked_text,
    },
  }
}

/** For /api/health: is the database configured and are the tables reachable? Reveals no content. */
export async function storageStatus(): Promise<'ok' | 'not_configured' | 'error'> {
  const db = supabase()
  if (!db) return 'not_configured'
  const { error, count } = await db.from('days').select('id', { count: 'exact', head: true })
  if (error) {
    console.error('[p21] health check failed', error)
    return 'error'
  }
  return count ? 'ok' : 'error'
}

export async function getTracks(dayId: string): Promise<Track[]> {
  const db = supabase()
  if (db) {
    const { data, error } = await db.from('tracks').select('*').eq('day_id', dayId).order('sort_order')
    if (!error) return data as Track[]
    console.error('[p21] tracks unavailable, serving seed tracks', error)
  }
  return seedTracks.filter((t) => t.day_id === dayId)
}

export async function getResponse(dayId: string): Promise<ResponseRecord | null> {
  const db = supabase()
  if (db) {
    const { data, error } = await db.from('responses').select('*').eq('day_id', dayId).maybeSingle()
    if (error) console.error('[p21] response lookup failed', error)
    return (data as ResponseRecord | null) ?? null
  }
  if (!localStoreAllowed()) return null
  return (await readLocal()).responses.find((r) => r.day_id === dayId) ?? null
}

/**
 * Stores the day's response plus any tracks she gave (source HER) for the playlist.
 * The response insert goes first: its unique index on day_id is the duplicate guard.
 */
export async function saveResponse(
  dayId: string,
  responseType: string,
  payload: Record<string, unknown>,
  tracks: TaggedTrack[],
): Promise<'saved' | 'duplicate'> {
  const rows = tracks.map((t, i) => ({
    day_id: dayId,
    source_name: null,
    sort_order: i,
    playlist_status: 'candidate',
    ...t,
    source: t.source ?? ('HER' as const),
    tag: t.tag ?? null,
  }))

  const db = supabase()
  if (db) {
    const res = await db.from('responses').insert({ day_id: dayId, response_type: responseType, payload_json: payload })
    if (res.error?.code === '23505') return 'duplicate'
    if (res.error) throw res.error
    if (rows.length) {
      const tr = await db.from('tracks').insert(rows)
      if (tr.error) console.error('[p21] response saved but tracks insert failed', tr.error)
    }
    return 'saved'
  }

  if (!localStoreAllowed()) throw new Error('No response storage configured (set Supabase env vars).')
  const store = await readLocal()
  if (store.responses.some((r) => r.day_id === dayId)) return 'duplicate'
  const now = new Date().toISOString()
  store.responses.push({ id: crypto.randomUUID(), day_id: dayId, response_type: responseType, payload_json: payload, created_at: now })
  store.tracks.push(...rows.map((r) => ({ id: crypto.randomUUID(), ...r })))
  await writeLocal(store)
  return 'saved'
}

/** Dev-only: wipes the local preview response so the flow can be walked again. Never touches Supabase. */
export async function deleteLocalResponse(dayId: string): Promise<void> {
  if (!localStoreAllowed()) return
  const store = await readLocal()
  store.responses = store.responses.filter((r) => r.day_id !== dayId)
  store.tracks = store.tracks.filter((t) => t.day_id !== dayId || t.source !== 'HER')
  await writeLocal(store)
}

// Local JSON store: development only, so previews work without Supabase.
const LOCAL_PATH = path.join(process.cwd(), '.data', 'p21-local.json')
type LocalStore = { responses: ResponseRecord[]; tracks: Track[] }
const localStoreAllowed = () => process.env.NODE_ENV !== 'production'

async function readLocal(): Promise<LocalStore> {
  try {
    return JSON.parse(await readFile(LOCAL_PATH, 'utf8')) as LocalStore
  } catch {
    return { responses: [], tracks: [] }
  }
}

async function writeLocal(store: LocalStore) {
  await mkdir(path.dirname(LOCAL_PATH), { recursive: true })
  await writeFile(LOCAL_PATH, JSON.stringify(store, null, 2))
}

/**
 * Tope de llamadas al modelo por día. El sitio es público: sin esto, cualquiera
 * que encuentre la URL podría quemar la cuota. Sin Supabase (desarrollo) no limita.
 */
export async function allowAiCall(max: number): Promise<boolean> {
  const db = supabase()
  if (!db) return true
  const id = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  try {
    const { data } = await db.from('ai_usage').select('calls').eq('id', id).maybeSingle()
    const calls = data?.calls ?? 0
    if (calls >= max) return false
    await db.from('ai_usage').upsert({ id, calls: calls + 1, updated_at: new Date().toISOString() })
    return true
  } catch (err) {
    console.error('[p21] ai_usage', err)
    return true
  }
}
