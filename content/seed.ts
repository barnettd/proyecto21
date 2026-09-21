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
  [4, 'Crucigrama', 'printable'],
  [5, 'Recovery Kit', 'track_list'],
  [6, 'Memory Recovery', 'memory'],
  [7, 'Memory Recovery II', 'multi_track'],
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
  4: {
    title: 'Crucigrama',
    completion_text: 'Recibida.\nA veces alcanza con elegir la canción correcta.',
    config_json: {
      response_tag: 'D4_WHEN_WORDS_FAIL',
      response_label: 'Tu canción',
      availability_label: 'Esta página permanece disponible por',
      entry: {
        title: 'HOY HAY QUE IMPRIMIR.',
        text: 'Descargá el crucigrama, imprimilo y resolvelo a mano.\nNo necesitás nada más que unos minutos y algo para escribir.',
        cta: 'DESCARGAR',
        fine_print: 'Imprimí en tamaño real (100%).',
        note: 'Cuando lo tengas resuelto, volvé acá.',
        continue_cta: 'YA LO RESOLVÍ',
      },
      printable: { url: '/d4-crucigrama.pdf', filename: 'P21-crucigrama.pdf' },
      phrase: {
        title: 'LA FRASE',
        text: 'El crucigrama esconde una frase. Escribila acá.',
        placeholder: 'La frase',
        cta: 'ES ESTA',
        errors: [
          'No. Y eso que la escribiste con mucha seguridad.',
          'Tampoco. Por ahora gana el crucigrama.',
          'No es esa. Volvé a mirar las casillas marcadas.',
        ],
        hint: 'Está en inglés.',
        skip: 'Seguir sin resolverlo',
        answer: 'when words fail, music speaks',
      },
      solved: {
        title: 'WHEN WORDS FAIL, MUSIC SPEAKS',
        text: 'Es, más o menos, la premisa. Hay cosas que no salen en una conversación y sí salen en una canción: alcanza con mandarla en el momento justo para que la otra persona entienda.\n\nA veces la canción llega antes que la conversación. Y funciona incluso cuando del otro lado no saben qué estabas pensando.',
        cta: 'OK',
      },
      reveal: {
        title: 'ESA CANCIÓN',
        text: 'Ahora te toca a vos.',
        prompt: 'Elegí una canción que alguna vez hayas usado —o usarías— para decir algo que cuesta decir con palabras.',
        cta: 'ESTA DICE ALGO POR MÍ',
      },
      deadline_note: 'Tenés hasta las 23:59 de hoy.',
      closing: {
        title: 'RECIBIDA.',
        // Primero la de ella, sin rótulo; después la de P21 con su texto.
        hers_first: true,
        label_track: 'P.21',
        text: 'A veces alcanza con elegir la canción correcta.\n\nHoy quiero dejarte una de mi lado.\nY sí, otra vez Fito Páez.',
        emphasis: 'Escuchala con auriculares.',
        track_cta: 'ESCUCHAR EN SPOTIFY',
        footer_note: 'Seguí el siguiente paso cuando aparezca.',
        track: {
          title: 'Música para Camaleones',
          artist: 'Fito Paez',
          spotify_url: 'https://open.spotify.com/track/0AFnEocOUB6yPQTGeFhOye',
        },
      },
    },
  },
  6: {
    title: 'Memory Recovery',
    completion_text: 'Recuperado.',
    config_json: {
      response_label: 'Lo que mandaste',
      availability_label: 'Esta página permanece disponible por',
      text_limit: 80,
      opening: {
        eyebrow: 'D6',
        title: 'MEMORY RECOVERY',
        lead: 'Empecemos por el principio.',
        text: '¿Cuál es la canción que creés conocer desde hace más años?\n\nNo necesariamente la más vieja. La primera que sentís que ya estaba ahí desde siempre.',
        cta: 'GUARDAR Y SEGUIR',
        image: '/d6-apertura.jpg',
      },
      intro: {
        title: 'MEMORY RECOVERY',
        text: 'Hoy sí, miramos para atrás, desde adentro.\n\nMenos poético y más específico: esos lugares, situaciones y personas que merecen su propia retrospectiva.\n\nTres y tres.',
        cta: 'EMPEZAR',
      },
      fragments: [
        {
          key: 'place',
          progress: '1 / 3',
          title: 'LUGAR',
          lead: 'Hay lugares que una canción puede traer de vuelta con una precisión bastante injusta.\n\nPrimero yo.',
          p21: {
            track: { title: 'Crazy', artist: 'Aerosmith', spotify_url: 'https://open.spotify.com/track/3QxKpdTB8ZSFn8MGeCCpsQ' },
            note: 'Esto me recuerda cuando tuve oportunidad de conocer Turquía.',
          },
          p21_cta: 'AHORA VOS',
          you: {
            title: 'TU LUGAR',
            text: 'Elegí una canción que te devuelva a un lugar.\n\nPuede ser una casa, una ciudad, una ruta, un cuarto, una playa o cualquier lugar que exista distinto en tu memoria.',
            prompt: '¿A qué lugar te trajo?',
            cta: 'GUARDAR',
          },
        },
        {
          key: 'situation',
          progress: '2 / 3',
          title: 'SITUACIÓN',
          lead: 'A veces no vuelve a un lugar.\n\nVuelve una escena completa: algo que pasaba, una rutina, una noche, un viaje, una etapa.',
          p21: {
            track: { title: 'La Isla del Sol', artist: 'El Símbolo', spotify_url: 'https://open.spotify.com/track/1sZFIMGmKUYycerZSZb99O' },
            note: 'Majané 1998 y con él, una época y un ciclo.',
          },
          p21_cta: 'AHORA VOS',
          you: {
            title: 'TU SITUACIÓN',
            text: 'Elegí una canción que te devuelva a una escena o momento concreto.\n\nAlgo que, cuando suena, no recordás solamente: casi podés volver a verlo.',
            prompt: '¿Qué vuelve cuando suena?',
            cta: 'GUARDAR',
          },
        },
        {
          key: 'person',
          progress: '3 / 3',
          title: 'PERSONA',
          p21_first: false,
          lead: 'Hay personas que terminan viviendo dentro de una canción sin haberlo decidido.',
          p21: {
            track: { title: 'Contamíname', artist: 'Pedro Guerra', spotify_url: 'https://open.spotify.com/track/7Cd7umUyXCf7xWCVzgKlnZ' },
            note: 'A mi tía.',
          },
          p21_cta: 'AHORA VOS',
          you: {
            text: 'Hay personas que terminan viviendo dentro de una canción sin haberlo decidido.\n\nElegí una canción que inevitablemente te lleve a alguien.',
            prompt: '¿Quién aparece cuando suena?',
            cta: 'GUARDAR Y ESCUCHAR TU PERSONA',
          },
          reveal: {
            label: 'P.21',
            text: 'Ahora la mía.',
            cta: 'CERRAR RECUPERACIÓN',
            bonus: {
              label: 'Bonus Track',
              text: 'Y esta, muchas veces, me recuerda a vos.\n\nGracias.',
              track: {
                title: 'Wonderwall',
                artist: 'Oasis',
                spotify_url: 'https://open.spotify.com/track/5qqabIl2vWzo9ApSC317sa',
              },
            },
          },
        },
      ],
      deadline_note: 'Tenés hasta las 23:59 de hoy.\nHay prórroga de ser necesario.',
      closing_scene: {
        image: '/d6-cierre.jpg',
        title: 'RECUPERADO.',
        text: 'Algunas cosas quedan atrás.\nOtras solo estaban esperando la canción correcta.',
        footer: 'Seguí el próximo paso cuando aparezca.',
      },
    },
  },
  5: {
    title: 'Recovery Kit',
    completion_text: 'Kit completo.\nGuardalo para cuando haga falta.',
    config_json: {
      response_tag: 'D5_RECOVERY_USER',
      response_label: 'Tu aporte',
      availability_label: 'Esta página permanece disponible por',
      progress_label: '{n} / {total}',
      entry: {
        title: 'RECOVERY KIT',
        text: 'No todos los días necesitan empuje.\nAlgunos necesitan bajar el ruido, quedarse quietos o simplemente dejar de exigir un poco.\n\nPreparé tres.',
        cta: 'ABRIR KIT',
        image: '/d5-inicio.jpg',
      },
      compartments: [
        {
          label: 'Compartimento 01',
          tag: 'D5_RECOVERY_01',
          title: 'PARA BAJAR EL RUIDO',
          guide: 'Para cuando todo está un poco demasiado fuerte y lo único que ordena es acordarse de que nada se queda quieto.',
          cta: 'SIGUIENTE',
          track: { title: 'Todo Cambia', artist: 'Mercedes Sosa', spotify_url: 'https://open.spotify.com/track/0njOsb3y8TnwIJC7GnlWwD' },
        },
        {
          label: 'Compartimento 02',
          tag: 'D5_RECOVERY_02',
          title: 'PARA MIRAR EL CAMINO',
          guide: 'Para cuando la cabeza se pone a repasar el viaje sin pedir permiso, y conviene dejarla.',
          cta: 'SIGUIENTE',
          track: { title: 'Al Final de Este Viaje en la Vida', artist: 'Silvio Rodríguez', spotify_url: 'https://open.spotify.com/track/6kKiwIng125tpfiFGwhvXh' },
        },
        {
          label: 'Compartimento 03',
          tag: 'D5_RECOVERY_03',
          title: 'PARA CUANDO EL DÍA YA FUE SUFICIENTE',
          guide: 'Para cuando no querés resolver nada más y alcanza con mirar a los demás un rato.',
          cta: 'SIGUIENTE',
          track: { title: 'Piano Man', artist: 'Billy Joel', spotify_url: 'https://open.spotify.com/track/70C4NyhjD5OZUMzvWZ3njJ' },
        },
      ],
      contribution: {
        title: 'FALTA UNA.',
        text: 'Si este kit fuera tuyo, ¿qué canción debería estar acá?',
        more_text: 'Si tenés más, mejor.',
        more_cta: 'AGREGAR OTRA',
        max: 5,
        cta: 'COMPLETAR',
      },
      deadline_note: 'Tenés hasta las 23:59 de hoy.',
      closing_scene: {
        image: '/d5-cierre.jpg',
        text: 'Seguí el próximo paso cuando aparezca.',
        track_note: 'Antes de irte: escuchá esta y seguí la letra.',
        track_cta: 'ESCUCHAR EN SPOTIFY',
        track_hint: 'En Spotify, tocá «Letra» para seguirla mientras suena.',
        track: {
          title: 'Silencio',
          artist: 'Jorge Drexler',
          spotify_url: 'https://open.spotify.com/track/2gjB9GgSZFlj0YwItEACpQ',
        },
      },
    },
  },
  3: {
    title: 'Shower Songs',
    completion_text: 'Set registrado.\nEl shampoo queda oficialmente habilitado como micrófono.',
    config_json: {
      sequential: true,
      progress_label: '{n} / {total}',
      track_label: 'De mi lado',
      response_label: 'Tu set',
      availability_label: 'Esta página permanece disponible por',
      entry: {
        title: 'SHOWER SONGS',
        lead: 'Hay canciones que funcionan mejor con agua corriendo.',
        text: 'Algunas se escuchan.\nOtras inevitablemente terminan siendo interpretadas con shampoo en mano.\n\nHoy necesito tu set.',
        cta: 'EMPEZAR',
      },
      listen: {
        text: 'Primero, una de mi lado.',
        primary_cta: 'ESCUCHAR EN SPOTIFY',
        secondary_cta: 'ARMAR MI SET',
        while_text: 'Sí. Esta entra en la categoría.',
      },
      modules_intro: '',
      modules: [
        {
          n: '01',
          name: 'ABRIR EL SHOW',
          tag: 'D3_SHOWER_OPENING',
          guide: 'La primera cambia la acústica del baño y avisa que oficialmente empezó el show.',
          question: '¿Qué canción abre tu set de ducha?',
          cta: 'SIGUIENTE',
        },
        {
          n: '02',
          name: 'MICRÓFONO DE SHAMPOO',
          tag: 'D3_SHOWER_MIC',
          guide: 'Hay canciones que no se escuchan: se interpretan. Aunque nadie lo haya pedido.',
          question: '¿Cuál es esa que inevitablemente terminás cantando como si el shampoo fuera un micrófono?',
          cta: 'SIGUIENTE',
        },
        {
          n: '03',
          name: 'ENCORE',
          tag: 'D3_SHOWER_ENCORE',
          guide: 'La ducha ya terminó. Técnicamente deberías salir. Pero todavía queda una canción.',
          question: '¿Cuál merece quedarse hasta el final?',
          cta: 'ESTE ES MI SET',
        },
      ],
      deadline_note: 'Tenés hasta las 23:59 de hoy.',
      submit_label: 'ESTE ES MI SET',
    },
  },
  2: {
    title: 'Solo una sobrevive',
    completion_text: 'Sobreviviente registrada.\nWildcard adentro.\nSeguimos.',
    config_json: {
      response_label: 'Lo que queda',
      availability_label: 'Esta página permanece disponible por',
      entry: {
        title: 'Knock-Outs: Una Sobrevivirá',
        text: 'Hoy no necesito explicaciones.\nSolo decisiones.',
        rule: 'Si dudás, elegí la que pondrías ahora.',
        cta: 'EMPEZAR',
      },
      rounds: ['Ronda 1', 'Ronda 2', 'Ronda 3', 'Ronda 4'],
      instructions: 'Vas a recibir las canciones de a pares. Escuchá cada preview y elegí una de las dos.',
      deadline_label: 'Cierra en',
      select_label: 'ELEGIR',
      locked_label: 'Se revela al avanzar',
      interstitials: [
        { text: 'Fácil, ¿no? La primera ronda lo es. Veamos la segunda.', cta: 'CONTINUAR' },
        // PROVISORIOS: textos entre rondas, a confirmar.
        { text: 'Quedan cuatro. Acá ya no hay dónde esconderse.', cta: 'CONTINUAR' },
        { text: 'Dos. Nada más que dos.', cta: 'CONTINUAR' },
      ],
      progress_label: 'Decisión {n} / {total}',
      winner: {
        title: '¡Es oficial: tu top 1!',
        bridge: 'Aunque sabemos que es injusto para tu top 1, porque de seguro faltó una que nunca estuvo en la selección.',
      },
      wildcard: {
        title: 'TU WILDCARD',
        prompt: 'Elegí una canción que debería haber estado en esta competencia y seguramente llegaba a la final.',
        cta: 'BIG MISS!',
      },
      bonus: {
        title: 'Bonus Track',
        text: 'Para ser más justos, elegí una de las siguientes:',
        select_label: 'ELEGIR',
      },
      closing: {
        title: 'Bonus Track',
        text: 'Gracias por tu contribución en P.21.\nPara cerrar la misión, te regalo la escucha de otra canción y te propongo que pienses cuál sería tu próxima elección. No tenés que decidir.',
        label_final: 'Tu Top 1',
        label_track: 'Escuchala con auriculares',
        track_cta: 'ESCUCHAR EN SPOTIFY',
        footer_note: 'Seguí cada paso cuando aparezca.',
        track: {
          title: 'Wish You Were Here',
          artist: 'Pink Floyd',
          spotify_url: 'https://open.spotify.com/track/6mFkJmJqdDVQ1REhVfGgd1',
        },
      },
      deadline_note: 'Tenés hasta las 23:59 de hoy.',
      // Las 16 de la llave, en el orden de los cruces: 1v2, 3v4, 5v6…
      tracks: [
        { title: 'Ojos de Café', artist: 'BALTA', spotify_url: 'https://open.spotify.com/track/4Kr8Ci4zBhvCNbGrGXCbAm' },
        { title: 'No Es Mi Primera Vez', artist: 'Alfonsina', spotify_url: 'https://open.spotify.com/track/2J2PdM4LtvR96pkGQrpJFi' },
        { title: 'Tu misterioso alguien', artist: 'Miranda!', spotify_url: 'https://open.spotify.com/track/3OfS5conn3s0mlzgVTG1Sf' },
        { title: 'Obsesionario en la Mayor', artist: 'Tan Bionica', spotify_url: 'https://open.spotify.com/track/5yI4trOBy1XAiAFWTX1LGg' },
        { title: 'Don\'t Speak', artist: 'No Doubt', spotify_url: 'https://open.spotify.com/track/6urCAbunOQI4bLhmGpX7iS' },
        { title: 'Zombie', artist: 'The Cranberries', spotify_url: 'https://open.spotify.com/track/2IZZqH4K02UIYg5EohpNHF' },
        { title: 'Todo se transforma', artist: 'Jorge Drexler', spotify_url: 'https://open.spotify.com/track/4YEU9N2XAE0DfUwxWI5ijA' },
        { title: 'Depende', artist: 'Jarabe De Palo', spotify_url: 'https://open.spotify.com/track/6aaPUBUFw9KEW1p1inVQv9' },
        { title: 'Don\'t Look Back In Anger', artist: 'Oasis', spotify_url: 'https://open.spotify.com/track/7ppPZa3TRUSGKaks9wH7VT' },
        { title: 'Angie', artist: 'The Rolling Stones', spotify_url: 'https://open.spotify.com/track/07OxAhTrD4gIOuxzB2E1QD' },
        { title: 'Cuando nadie me ve (Unplugged)', artist: 'Alejandro Sanz', spotify_url: 'https://open.spotify.com/track/6iaw07BTiLrHVT2OQDgqiD' },
        { title: 'Brillante Sobre El Mic (En Vivo)', artist: 'Fito Paez', spotify_url: 'https://open.spotify.com/track/47byqeud1VrnxcKZkPSu4M' },
        { title: 'Corazón partío', artist: 'Alejandro Sanz', spotify_url: 'https://open.spotify.com/track/0wQCKR9OFjYu5Kzrk7WivJ' },
        { title: 'Y, ¿Si fuera ella?', artist: 'Alejandro Sanz', spotify_url: 'https://open.spotify.com/track/0mL5t2lk3Wo9SZanWGVrKx' },
        { title: 'Wake Me Up When September Ends', artist: 'Green Day', spotify_url: 'https://open.spotify.com/track/3ZffCQKLFLUvYM59XKLbVm' },
        { title: 'I Belong To You', artist: 'Lenny Kravitz', spotify_url: 'https://open.spotify.com/track/2zee8Zcesqwnnwliw2Jy8M' },
      ],
    },
  },
  1: {
    title: 'Escena de apertura',
    completion_text:
      'Gracias por ser parte de P.21.\nSeguí el siguiente paso cuando aparezca.',
    config_json: {
      image: '/d1-mundo.png',
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

// Canción de ducha de P21.
seedTracks.push({
  id: 't-d3-p21',
  day_id: 'd3',
  source: 'P21',
  source_name: 'PROYECTO 21',
  title: 'Locuras Contigo',
  artist: 'Rombai',
  spotify_url: 'https://open.spotify.com/track/7LrrGFdnRwEwOSS59qF05G',
  tag: 'SHOWER',
  sort_order: 0,
  playlist_status: 'candidate',
})

export const seedSettings = {
  force_active_day: null,
  locked_text: 'TODAVÍA NO.',
}
