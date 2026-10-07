import type { Day, ResponseRecord, Track } from './types.ts'

/** Una canción suya en el archivo del cierre, con el lugar que ocupó y lo que escribió. */
export type ArchiveEntry = {
  /** El nombre de la ranura que llenó: RECARGA, LUGAR, la escena del ascensor. */
  label: string | null
  title: string
  artist: string | null
  /** Sus propias palabras, cuando ese día pidió escribir algo. */
  note: string | null
}

const list = (v: unknown) => (Array.isArray(v) ? v : [])

/**
 * Cómo se llamaba cada ranura, leído de la configuración del propio día: así el
 * archivo dice «ANTÍDOTO» en vez de «D1_ANTIDOTO», sin repetir los textos acá.
 */
export function slotLabels(day: Day): Map<string, string> {
  const cfg = day.config_json
  const n = day.day_number
  const out = new Map<string, string>()

  for (const m of list(cfg.modules) as Array<{ name?: string; tag?: string }>) {
    if (m.tag && m.name) out.set(m.tag, m.name)
  }
  for (const f of list(cfg.fragments) as Array<{ key?: string; title?: string }>) {
    if (f.key && f.title) out.set(`D${n}_${f.key.toUpperCase()}_USER_TRACK`, f.title)
  }
  for (const s of list(cfg.scenarios) as Array<{ key?: string; title?: string }>) {
    if (s.key && s.title) out.set(`D${n}_${s.key.toUpperCase()}_USER_TRACK`, s.title)
  }
  // La de la infancia no es un fragmento: va primera y no tiene texto.
  if (day.experience_type === 'memory') out.set(`D${n}_CHILDHOOD_USER_TRACK`, 'LA PRIMERA')
  if (day.experience_type === 'bracket') {
    out.set('D2_WINNER', 'LA QUE SOBREVIVIÓ')
    out.set('D2_WILDCARD', 'EL COMODÍN')
  }
  return out
}

/** Lo que escribió ese día, por etiqueta. D6 guarda `D6_LUGAR_USER_TEXT` junto a su canción. */
export function slotNotes(response: ResponseRecord | undefined): Map<string, string> {
  const out = new Map<string, string>()
  const notes = response?.payload_json?.notes
  if (!notes || typeof notes !== 'object') return out
  for (const [key, value] of Object.entries(notes as Record<string, unknown>)) {
    if (typeof value === 'string' && value.trim()) out.set(key, value.trim())
  }
  return out
}

/** La etiqueta del texto que acompaña a una canción: `…_USER_TRACK` → `…_USER_TEXT`. */
const textTag = (tag: string) => tag.replace(/_TRACK$/, '_TEXT')

export function buildArchive(
  days: Day[],
  tracksByDay: Record<number, Track[]>,
  responsesById: Record<string, ResponseRecord>,
): Record<number, ArchiveEntry[]> {
  const out: Record<number, ArchiveEntry[]> = {}
  for (const day of days) {
    const tracks = tracksByDay[day.day_number] ?? []
    if (!tracks.length) continue
    const labels = slotLabels(day)
    const notes = slotNotes(responsesById[day.id])
    out[day.day_number] = tracks.map((t) => ({
      label: (t.tag && labels.get(t.tag)) ?? null,
      title: t.title ?? 'Una canción',
      artist: t.artist ?? null,
      note: (t.tag && notes.get(textTag(t.tag))) ?? null,
    }))
  }
  return out
}
