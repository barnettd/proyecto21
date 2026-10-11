-- D21 — Cierre.
-- Generado por scripts/gen-day.ts a partir de content/seed.ts. No editar a mano.
-- Correr en Supabase → SQL Editor. Es repetible.

update days set
  title = 'Cierre',
  experience_type = 'closing',
  intro_text = null,
  instructions = null,
  completion_text = null,
  config_json = $json${
  "full_screen": true,
  "opens_day": 8,
  "response_label": "El riff",
  "opening": {
    "title": "PROYECTO 21",
    "text": "Algunas cosas pasaron exactamente como estaban planeadas.\n\nOtras quedaron abiertas.\n\nY algunas nunca llegaron a suceder.\n\nDe eso también se trata P.21. De eso se trata casi todo, en realidad.\n\nHoy no vengo a recuperar los días que faltaron. Vengo a cerrar los que hubo, y a dejarte algunas cosas más.",
    "cta": "EMPECEMOS"
  },
  "archive": {
    "title": "LO QUE SÍ PASÓ",
    "text": "Como habrás notado, durante estos veinte días —o una parte de ellos, siendo honesto— pasaron cosas en P.21. Le dedicamos algunos minutos por día a pensar cosas que normalmente no pensamos.\n\nFue un proceso distinto. A mí me trajo un sinnúmero de emociones que no te podía comunicar mientras lo estaba armando, y traté de pasarte algo de eso en tus quince minutos diarios. No sé si lo logré.\n\nLo que sí sé, y me quedó reconfirmado: P.21 es viable solo por vos.",
    "empty": "Sin registro.",
    "cta": "SEGUIR",
    "days": [
      {
        "n": 1,
        "label": "20",
        "title": "EL PRINCIPIO",
        "line": "Acá empezó todo."
      },
      {
        "n": 2,
        "label": "19",
        "title": "SOLO UNA SOBREVIVE",
        "line": "Ocho entraron. Una quedó."
      },
      {
        "n": 3,
        "label": "18",
        "title": "SHOWER SONGS",
        "line": "Algunas canciones necesitan micrófono de shampoo."
      },
      {
        "n": 4,
        "label": "17",
        "title": "WHEN WORDS FAIL",
        "line": "A veces una canción dice mejor lo que cuesta explicar."
      },
      {
        "n": 5,
        "label": "16",
        "title": "RECOVERY KIT",
        "line": "Música para bajar el ruido."
      },
      {
        "n": 6,
        "label": "15",
        "title": "MEMORY RECOVERY",
        "line": "Mirar para atrás, desde adentro."
      },
      {
        "n": 7,
        "label": "14",
        "title": "SOUNDTRACK OF NOTHING",
        "line": "Porque hasta lo completamente innecesario puede tener soundtrack."
      }
    ]
  },
  "frankenstein": {
    "title": "LO QUE QUEDÓ EN EL TINTERO",
    "text": "La idea de estos veinte días no era recorrer una historia musical ni ir a buscar recuerdos puntuales. La música fue el idioma, no el tema.\n\nHubo una tarea que me quedó en el tintero: Frankenstein. Nunca encontré las letras correctas para lo que te quería decir, así que la dejé esperando.\n\nSin más palomeadas: vamos a tus siguientes tareas. Se me acumularon algunas que ya tenía preparadas, y después te cuento las que no llegaron a suceder.\n\nY esto también es P.21.",
    "cta": "TOY READY",
    "url": "/frankenstein",
    "done_title": "ESA YA ESTÁ.",
    "done_text": "Esperó bastante para existir.\n\nAhora vamos con la que ya tenías empezada.",
    "done_cta": "CONTINUAR"
  },
  "mission": {
    "title": "MISIÓN ABIERTA",
    "text": "Hace unos días aceptaste el desafío y la misión quedó abierta.\n\nPara cerrarla alcanza con un audio: el riff de Seven Nation Army, tocado por vos. No tiene que sonar perfecto — reconocible alcanza. 🙂",
    "track_label": "El original",
    "track": {
      "title": "Seven Nation Army",
      "artist": "The White Stripes",
      "spotify_url": "https://open.spotify.com/track/3dPQuX8Gs42Y7b454ybpMR"
    },
    "link_label": "Link al audio",
    "link_placeholder": "Pegá acá el link al audio",
    "link_hint": "Si ya lo tenés grabado, pegá el link acá. Y si no, no pasa nada: mandámelo por WhatsApp cuando puedas, hoy o la semana que viene. Esto no te frena, podés seguir igual.",
    "cta": "MISIÓN CUMPLIDA",
    "cta_empty": "LO MANDO POR WHATSAPP",
    "skip": "Seguir igual"
  },
  "pending": {
    "title": "Y HABÍA MÁS.",
    "text": "Algunas cosas estaban planificadas y no llegaron a pasar. Te las comparto igual, porque también son parte.",
    "status_label": "NO LLEGÓ A SUCEDER",
    "cta": "SEGUIR",
    "items": [
      {
        "title": "GUILTY PLEASURE",
        "text": "El día de bajar la guardia: esa canción que te encanta y que cantás fuerte solo cuando no hay testigos. Sin justificarla, sin explicar el contexto, sin aclarar que era otra época. Cada uno ponía la suya y el otro no tenía derecho a opinar."
      },
      {
        "title": "CUANDO ESTÉS MÁS MAL",
        "text": "Tres compartimentos cerrados —TRISTE, FURIOSA, HARTA— para abrir el que hiciera falta el día que hiciera falta. La idea era dejarte música preparada de antemano para los días en que no se tienen ganas de elegir nada."
      },
      {
        "title": "MORNING WARM",
        "text": "Una de tus Shower Songs iba a volver sola, varios días después, a una hora rara y en otro contexto. Vos ya la habías elegido sin saber para qué."
      },
      {
        "title": "ARCHIVE",
        "text": "Mails viejos, fotos y un par de cosas que no volvimos a mirar desde que las guardamos. La idea era abrirlas de a una, sin avisar cuál seguía."
      },
      {
        "title": "AFTER DARK / HANDS",
        "text": "Una parte que se activaba a las 22:00 y que no voy a describir acá."
      },
      {
        "title": "PRIME",
        "text": "Una mini confesión mía, con una tarea cortita —y probablemente ridícula— para vos. Todo construido alrededor de una sola canción: Amor Amarillo."
      },
      {
        "title": "VOCES DE AFUERA",
        "text": "Había más gente invitada a entrar un rato: gente que te conoce desde antes que yo, y gente que nos conoce solo juntos. A cada uno le iba a pedir una canción, sin decirle para qué."
      }
    ]
  },
  "voices": {
    "title": "VOCES DESDE AFUERA",
    "text": "Hay una perspectiva que también quise traer. Quedó trunca, o a medias, pero es sin dudas la más importante de todas.",
    "question_label": "LA PREGUNTA",
    "question": "¿Qué canción te hace acordar a mamá y papá?",
    "note": "Juntos, no a uno o al otro. Por el motivo que sea y sin explicaciones.",
    "hint": "Estas son las que eligieron los krakens. Aunque las conozcas de memoria, escuchalas con auriculares y siguiendo la letra: no es lo mismo cuando sabés que las eligieron pensando en nosotros dos.",
    "cta": "SEGUIR",
    "children": [
      {
        "name": "KRAKEN 1",
        "track": {
          "title": "No Te Imaginás",
          "artist": "No Te Va Gustar",
          "spotify_url": "https://open.spotify.com/track/7x00uv5aDR0MA8eIk7xAuf"
        }
      },
      {
        "name": "KRAKEN 2",
        "track": {
          "title": "No llora",
          "artist": "El Cuarteto De Nos",
          "spotify_url": "https://open.spotify.com/track/1kEoU9Dmivr2JoOf7ramyT"
        }
      },
      {
        "name": "KRAKEN 3",
        "track": {
          "title": "Corazón Salvaje",
          "artist": "Marcela Morelo",
          "spotify_url": "https://open.spotify.com/track/3zwTjNO3wlSsLuXqIha8Sf"
        }
      }
    ]
  },
  "gift": {
    "title": "FALTA UNA COSA.",
    "text": "Algunas cosas esperan bastante tiempo para encontrar su momento.\n\nEste es un re-regalo, de hace cuatro años atrás.",
    "clue_title": "PISTA TRACK 21",
    "clue": "Para grabar un track profesional, las grabaciones maestras se solían resguardar en gabinetes oscuros y fríos. Esta caja negra no estaba a la altura de los ojos, sino en la zona ciega del estudio, donde no llega la vibración de los amplificadores.\n\nEl lugar más habitual era debajo del escenario donde ensaya tu descanso.",
    "cta": "LA ENCONTRÉ"
  },
  "track21": {
    "eyebrow": "LA ÚLTIMA",
    "title": "TRACK 21",
    "text": "Todas las canciones de estos días sirvieron para volver: a lugares, a personas, a situaciones, a versiones nuestras. A lo trivial le pusimos música, y a lo triste y nostálgico también.\n\nTodas traían un recuerdo.\n\nLa que te quiero regalar hoy no tiene ninguno. Su primer recuerdo va a ser este: nuestro 6 de octubre, festejado unos días tarde. Muy a tono con todo lo demás.\n\nMira para adelante, y además es una invitación.\n\nEscuchala con la letra, aunque no hace falta que la tomes textual. Lo que dice, más o menos, es lo que te quiero decir hoy.",
    "track": {
      "title": "Vengo Del Futuro",
      "artist": "KURT",
      "spotify_url": "https://open.spotify.com/track/4mvtqRJpySaswY75a9WfVm"
    },
    "track_cta": "ESCUCHAR ENTERA EN SPOTIFY",
    "cta": "SEGUIR"
  },
  "plus": {
    "title": "P.21+",
    "text": "Hasta acá, P.21 fueron veinte días resumidos en situaciones mínimas, pensamientos y emociones. Por mi lado, demasiadas.",
    "invite": "Desde hoy pasa a ser P.21+, y te invito.",
    "text2": "Sigamos trayendo nuestra música, poniéndosela a lo que no la tiene, buscando la que todavía no conocemos y dejando entrar la de afuera. Sobre todo la de ellos, los krakens.",
    "playlist_label": "NUESTRA P.21 PLAYLIST",
    "playlist_url": "https://open.spotify.com/playlist/3DRmcBSTanFZt6YS9YfMra",
    "closer": "Te vuelvo a elegir, como cada día.",
    "cta": "SEGUIR"
  },
  "finale": {
    "signoff": "Gracias por estos primeros veinte.\nVamos por los que siguen.",
    "text": "Esto es lo único que queda abierto.",
    "playlist_label": "PLAYLIST 21+",
    "playlist_url": "https://open.spotify.com/playlist/3DRmcBSTanFZt6YS9YfMra",
    "mark": "P.21+"
  }
}$json$::jsonb,
  activation_datetime = '2026-10-06T19:00:00-03:00',
  status = 'ready'
where day_number = 21;

-- Control.
select day_number as dia, title as titulo, status as estado, experience_type as tipo,
  to_char(activation_datetime at time zone 'America/Argentina/Buenos_Aires', 'DD/MM HH24:MI') as abre
from days where day_number = 21;
