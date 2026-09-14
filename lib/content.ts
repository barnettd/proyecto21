import { createClient } from '@supabase/supabase-js'
import { seedDays, seedSettings } from '../content/seed.ts'
import type { Day, Settings } from './types.ts'

// Server-only. The service role key must never reach the browser.
function supabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

function envForce(): number | null {
  const raw = process.env.FORCE_ACTIVE_DAY
  return raw && /^\d+$/.test(raw) ? Number(raw) : null
}

export async function loadContent(): Promise<{ days: Day[]; settings: Settings }> {
  const db = supabase()
  if (!db) {
    return { days: seedDays, settings: { ...seedSettings, force_active_day: envForce() } }
  }

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
