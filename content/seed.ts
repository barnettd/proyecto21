import type { Day, ExperienceType, Track } from '../lib/types.ts'

/**
 * Local fallback content, used when Supabase isn't configured.
 * Mirrors supabase/schema.sql. All times are America/Argentina/Buenos_Aires (-03:00).
 * Every day starts as `draft` → renders locked on the schedule until marked `ready`.
 */
const plan: Array<[number, string, ExperienceType, string?]> = [
  [0, 'The Package', 'locked'],
  [1, 'Escena de apertura', 'multi_track'],
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
    completion_text:
      'Gracias.\nYa tenemos por dónde empezar.\nSeguí cada paso cuando aparezca.',
    config_json: {
      track_label: 'Canción de apertura',
      response_label: 'Tus canciones',
      entry: {
        text: 'Algunas cosas empiezan antes de entenderse.\nNo busques la respuesta correcta; pensá y elegí siempre lo que realmente te represente.\n\nDos sugerencias:\nGuardá la llave.\nLlevá tus auriculares con vos.',
        cta: 'EMPEZAR',
      },
      listen: {
        text: 'Esto funciona mejor si no intentás adivinar qué estoy buscando.\nElegí siempre lo que realmente elegirías, aunque todavía no sepas por qué te lo estoy preguntando.\n\nPara empezar, una canción de mi lado.\nPonete los auriculares. Escuchala completa.',
        primary_cta: 'ESCUCHAR EN SPOTIFY',
        secondary_cta: 'Ya la escuché',
        while_text: 'Escuchá. Después seguimos.',
      },
      modules_intro: 'Ahora vos. Tres canciones. Tres razones distintas.',
      modules: [
        {
          n: '01',
          name: 'RECARGA',
          tag: 'D1_RECARGA',
          guide: 'Fito dice que el mundo cabe en una canción, y a veces alcanza una sola para cambiar el aire de un momento.',
          question: '¿Qué canción es tu recarga de energía instantánea, esa que ponés cuando necesitás que el día tome otro rumbo?',
        },
        {
          n: '02',
          name: 'ANTÍDOTO',
          tag: 'D1_ANTIDOTO',
          guide: 'Hay días en que la gravedad, la torpeza y la Ley de Murphy parecen trabajar en equipo. Y en tu caso, a veces hasta con horas extra.',
          question: '¿Qué canción absurda, divertida o descontracturante elegirías como soundtrack para esos días en que todo se cae, chocás con algo o el universo decide hacer comedia con vos?',
        },
        {
          n: '03',
          name: 'ARRANQUE',
          tag: 'D1_ARRANQUE',
          guide: 'Hay un momento muy preciso justo antes de empezar algo nuevo: cerrás la puerta, arrancás el motor y el camino todavía está completamente abierto delante tuyo. Todavía no pasó nada, pero por unos segundos todo parece posible.',
          question: 'Tenés la ruta libre por delante y esa sensación de que algo bueno está por empezar. ¿Qué canción suena primero en el estéreo?',
        },
      ],
      deadline_note: 'Podés pensarlas. Tenés hasta las 23:59 de hoy.',
      submit_label: 'ELEGÍ ESTAS',
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
    id: 't-d1-p21',
    day_id: 'd1',
    source: 'P21',
    source_name: 'PROYECTO 21',
    title: 'El Mundo Cabe En Una Canción',
    artist: 'Fito Paez',
    spotify_url: 'https://open.spotify.com/track/5fpoGUETUlpC45OUUjXvJu',
    tag: 'OPENING',
    sort_order: 0,
    playlist_status: 'candidate',
  },
]

export const seedSettings = {
  force_active_day: null,
  locked_text: 'TODAVÍA NO.',
}
