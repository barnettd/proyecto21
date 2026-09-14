import { createClient } from '@supabase/supabase-js'
import { seedDays, seedSettings } from '../content/seed.ts'
import type { Day, Settings } from './types.ts'

// Server-only. The service role key must never reach the browser.
function supabase() {
  const url = process.env.SUPABASE_URL
  // Vercel's Supabase integration may inject either the legacy or the newer secret key name.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

function envForce(): number | null {
  const raw = process.env.FORCE_ACTIVE_DAY
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

async function fromSupabase(db: NonNullable<ReturnType<typeof supabase>>) {
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
