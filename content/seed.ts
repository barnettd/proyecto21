import type { Day, ExperienceType, Track } from '../lib/types.ts'

/**
 * Local fallback content, used when Supabase isn't configured.
 * Mirrors supabase/schema.sql. All times are America/Argentina/Buenos_Aires (-03:00).
 * Every day starts as `draft` → renders locked on the schedule until marked `ready`.
 */
const plan: Array<[number, string, ExperienceType, string?]> = [
  [0, 'The Package', 'locked'],
  [1, 'Escena de apertura', 'multi_track'],
  [2, 'Solo una sobrevive', 'bracket'],
  [3, 'Shower Songs', 'multi_track'],
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
  2: {
    title: 'Solo una sobrevive',
    completion_text: 'Sobreviviente registrada.\nWildcard adentro.\nSeguimos.',
    config_json: {
      response_label: 'Lo que queda',
      availability_label: 'Esta página permanece disponible por',
      entry: {
        title: 'SOLO UNA SOBREVIVE',
        text: 'Hoy no necesito explicaciones.\nSolo decisiones.\n\nOcho entran. Una queda.',
        rule: 'Si dudás, elegí la que pondrías ahora.',
        cta: 'EMPEZAR',
      },
      rounds: { qf: 'Cuartos', sf: 'Semis', final: 'Final' },
      select_label: 'SE QUEDA',
      progress_label: 'Decisión {n} / {total}',
      winner: {
        title: 'UNA SOBREVIVIÓ.',
        bridge: 'Pero faltaba una que nunca estuvo en la llave.',
      },
      wildcard: {
        title: 'TU WILDCARD',
        prompt: 'Elegí una canción que debería haber estado en esta competencia.',
        cta: 'SUMAR WILDCARD',
      },
      deadline_note: 'Tenés hasta las 23:59 de hoy.',
      // PROVISORIAS: ocho canciones de prueba hasta que lleguen las definitivas.
      tracks: [
        { title: 'Here Comes The Sun', artist: 'The Beatles', spotify_url: 'https://open.spotify.com/track/6dGnYIeXmHdcikdzNNDMm2' },
        { title: 'El Mundo Cabe En Una Canción', artist: 'Fito Paez', spotify_url: 'https://open.spotify.com/track/5fpoGUETUlpC45OUUjXvJu' },
        { title: 'Margarita', artist: 'Fito Paez', spotify_url: 'https://open.spotify.com/track/44fpTaUuSFvwzeJe4yEDDe' },
        { title: 'Normal 1', artist: 'Fito Paez', spotify_url: 'https://open.spotify.com/track/4FZwazC4ne86nEBD6i6ZdR' },
        { title: 'El Otro Cambio, Los Que Se Fueron', artist: 'Fito Paez', spotify_url: 'https://open.spotify.com/track/0jOCJkMvYzutcNTX9WtAVp' },
        { title: 'Tiempo Al Tiempo', artist: 'Fito Paez', spotify_url: 'https://open.spotify.com/track/2vUrrcNMrSQnjFu6dE1yrg' },
        { title: 'Tengo una Muñeca Que Regala Besos', artist: 'Fito Paez, Joaquín Sabina', spotify_url: 'https://open.spotify.com/track/0udM4azyzvy8lQXl5tHP1d' },
        { title: 'El Mundo Entero', artist: 'Ruben Rada, Fito Paez', spotify_url: 'https://open.spotify.com/track/4LYffEwKS6i6peurdkR3c9' },
      ],
    },
  },
  1: {
    title: 'Escena de apertura',
    completion_text:
      'Gracias por ser parte de P.21.\nSeguí el siguiente paso cuando aparezca.',
    config_json: {
      track_label: 'Canción de apertura',
      response_label: 'Tus canciones',
      entry: {
        lead: 'Algunas cosas empiezan antes de entenderse.',
        text: 'Habrá preguntas y tareas, pero no respuestas ni soluciones correctas. Pensá y elegí siempre lo que te represente.',
        suggestions_label: 'Dos sugerencias',
        suggestions: ['Guardá la llave.', 'Llevá tus auriculares con vos.'],
        cta: 'EMPEZAR',
      },
      listen: {
        text: 'Aquí comienza P.21: regalándote la escucha de esta canción (¿y cuándo no, Fito Páez?).',
        primary_cta: 'ESCUCHAR EN SPOTIFY',
        secondary_cta: 'YA LA ESCUCHÉ',
        while_text: 'Este es solo el preview. Escuchala completa en Spotify y seguí cuando termines.',
      },
      modules_intro: 'Es tu turno: tres razones, tres canciones.',
      modules: [
        {
          n: '01',
          name: 'RECARGA',
          tag: 'D1_RECARGA',
          guide: 'Fito dice que «el mundo cabe en una canción», y en alguna medida es verdad: hay temas que tienen la fuerza exacta para cambiar el aire de un lugar de un segundo a otro, y también el de la habitación interior. Son esos tres minutos donde no importa lo que pase afuera: todo se acomoda.',
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
          guide: 'Hay un instante mágico, casi magnético, justo antes de arrancar un viaje esperado: el momento en que cerrás la puerta del auto, el camino está limpio por delante y sentís ese chispazo de adrenalina, ilusión y expectativa pura por lo que viene.',
          question: 'Estás arrancando por esa carretera, con el camino libre frente a vos y la certeza de que algo bueno está por empezar. ¿Qué canción suena primero en la radio para darle play a ese momento?',
        },
      ],
      deadline_note: 'Podés pensarlas. Tenés hasta las 23:59 de hoy.',
      submit_label: 'ELEGÍ ESTAS',
      availability_label: 'Esta página permanece disponible por',
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


// Atajo de prueba: adelanta la apertura de D1 a N segundos. Solo afecta al contenido
// de respaldo, y la variable no existe en el servidor real.
if (process.env.P21_TEST_D1_IN_SECONDS) {
  const d1 = seedDays.find((d) => d.day_number === 1)
  if (d1) {
    d1.activation_datetime = new Date(Date.now() + Number(process.env.P21_TEST_D1_IN_SECONDS) * 1000).toISOString()
    d1.status = 'ready'
  }
}

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
