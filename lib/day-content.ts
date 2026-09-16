import type { Day } from './types.ts'

const list = (v: unknown) => (Array.isArray(v) ? v : [])

/** A day is walkable when its type has a component AND its config carries what that component needs. */
export function hasContent(day: Day): boolean {
  const cfg = day.config_json
  switch (day.experience_type) {
    case 'single_track':
      return Boolean(day.intro_text || day.instructions)
    case 'multi_track':
      return list(cfg.modules).length > 0 && Boolean(cfg.entry) && Boolean(cfg.listen)
    case 'bracket':
      return list(cfg.tracks).length >= 2 && Boolean(cfg.entry) && Boolean(cfg.wildcard)
    default:
      return false
  }
}
