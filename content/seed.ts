import type { Day, ExperienceType } from '../lib/types.ts'

/**
 * Local fallback content, used when Supabase isn't configured.
 * Mirrors supabase/seed.sql. All times are America/Argentina/Buenos_Aires (-03:00).
 * Every day starts as `draft` → renders locked until content is defined and marked `ready`.
 */
const plan: Array<[number, string, ExperienceType, string?]> = [
  [0, 'The Package', 'locked'],
  [1, 'Opening Scene', 'single_track'],
  [2, 'Shower Songs', 'multi_track'],
  [3, 'Solo una sobrevive', 'bracket'],
  [4, 'Word Search', 'reveal'],
  [5, 'Recovery Kit', 'track_list'],
  [6, 'Una línea', 'track_plus_text'],
  [7, 'Memory Recovery', 'multi_track'],
  [8, 'Soundtrack of Nothing', 'track_plus_text'],
  [9, 'Guest Track #1', 'media_exchange'],
  [10, 'Guilty Pleasure', 'single_track'],
  [11, 'Hands', 'single_track'],
  [12, 'Cuando estés más mal', 'choice'],
  [13, 'Morning Warm', 'single_track'],
  [14, 'Guest Track #2', 'media_exchange'],
  [15, 'Archive', 'archive'],
  [16, 'After Dark', 'single_track', '22:00'],
  [17, 'Hace cuatro años', 'reveal'],
  [18, 'PRIME', 'archive'],
  [19, 'Libertad / Voces de afuera', 'media_exchange'],
  [20, 'Future', 'single_track'],
  [21, 'Track 21', 'custom'],
]

export const seedDays: Day[] = plan.map(([n, title, type, time = '08:00']) => {
  const date = new Date(Date.UTC(2026, 8, 15 + n)).toISOString().slice(0, 10)
  return {
    id: `d${n}`,
    day_number: n,
    countdown_number: Math.max(21 - n, 0),
    activation_datetime: `${date}T${time}:00-03:00`,
    status: n === 0 ? 'ready' : 'draft',
    experience_type: type,
    title,
    intro_text: null,
    instructions: null,
    completion_text: null,
    config_json: {},
  }
})

export const seedSettings = {
  force_active_day: null,
  locked_text: 'TODAVÍA NO.',
}
