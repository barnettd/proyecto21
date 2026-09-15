import type { Day, ExperienceType, Track } from '../lib/types.ts'

/**
 * Local fallback content, used when Supabase isn't configured.
 * Mirrors supabase/schema.sql. All times are America/Argentina/Buenos_Aires (-03:00).
 * Every day starts as `draft` → renders locked on the schedule until marked `ready`.
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

/** Participant-facing copy, per day. Draft until approved. */
const copy: Record<number, Partial<Day>> = {
  1: {
    title: 'Escena de apertura',
    intro_text: 'Toda película arranca con una canción.\nEsta es la de PROYECTO 21. Dale play.',
    instructions:
      'Ahora te toca a vos.\n\nImaginá la primera escena de una película sobre vos. No el tráiler: la escena de verdad. ¿Qué canción suena?',
    completion_text: 'Recibida.\nLa escena ya tiene música.',
    config_json: {
      track_label: 'Canción de apertura',
      input_label: 'Tu canción · link de Spotify',
      submit_label: 'Enviar',
      response_label: 'Tu escena',
      response_tag: 'OPENING',
    },
  },
}

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
    ...copy[n],
  }
})

export const seedTracks: Track[] = [
  {
    // PLACEHOLDER — replace with the real P21 Opening Track.
    id: 't-d1-p21',
    day_id: 'd1',
    source: 'P21',
    source_name: 'PROYECTO 21',
    title: 'Here Comes The Sun',
    artist: 'The Beatles',
    spotify_url: 'https://open.spotify.com/track/6dGnYIeXmHdcikdzNNDMm2',
    tag: 'OPENING',
    sort_order: 0,
    playlist_status: 'candidate',
  },
]

export const seedSettings = {
  force_active_day: null,
  locked_text: 'TODAVÍA NO.',
}
