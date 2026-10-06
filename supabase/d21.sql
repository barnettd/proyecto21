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
  "opening": {
    "title": "PROYECTO 21",
    "text": "Algunas cosas pasaron exactamente como estaban planeadas.\n\nOtras quedaron abiertas.\n\nY algunas nunca llegaron a suceder.\n\nHoy no vamos a recuperar los días perdidos.\n\nVamos a cerrar lo que quedó.",
    "cta": "EMPEZAR EL CIERRE"
  },
  "archive": {
    "title": "LO QUE SÍ PASÓ",
    "text": "Siete días, y todo lo que mandaste en cada uno.",
    "empty": "Sin registro.",
    "cta": "SEGUIR",
    "days": [
      {
        "n": 1,
        "label": "D1",
        "title": "EL PRINCIPIO",
        "line": "Acá empezó todo."
      },
      {
        "n": 2,
        "label": "D2",
        "title": "SOLO UNA SOBREVIVE",
        "line": "Ocho entraron. Una quedó."
      },
      {
        "n": 3,
        "label": "D3",
        "title": "SHOWER SONGS",
        "line": "Algunas canciones necesitan micrófono de shampoo."
      },
      {
        "n": 4,
        "label": "D4",
        "title": "WHEN WORDS FAIL",
        "line": "A veces una canción dice mejor lo que cuesta explicar."
      },
      {
        "n": 5,
        "label": "D5",
        "title": "RECOVERY KIT",
        "line": "Música para bajar el ruido."
      },
      {
        "n": 6,
        "label": "D6",
        "title": "MEMORY RECOVERY",
        "line": "Mirar para atrás, desde adentro."
      },
      {
        "n": 7,
        "label": "D7",
        "title": "SOUNDTRACK OF NOTHING",
        "line": "Porque hasta lo completamente innecesario puede tener soundtrack."
      }
    ]
  },
  "frankenstein": {
    "title": "UNA COSA QUEDÓ LISTA.",
    "text": "Nunca llegó a aparecer.\n\nPero estaba esperando.",
    "cta": "ABRIR FRANKENSTEIN",
    "url": "/frankenstein",
    "done_title": "ESO YA EXISTE.",
    "done_text": "Esta mañana no existía. Ahora sí, y nadie más lo tiene.",
    "done_cta": "CONTINUAR"
  },
  "guitar": {
    "intro": {
      "title": "MISIÓN ABIERTA",
      "text": "Esta sí llegó a empezar.\n\nY hubo práctica.",
      "cta": "VER DESAFÍO"
    },
    "challenge": {
      "title": "DESAFÍO FINAL",
      "text": "Un loop.\n\nReconocible alcanza.",
      "track_label": "El original",
      "track": {
        "title": "Seven Nation Army",
        "artist": "The White Stripes",
        "spotify_url": "https://open.spotify.com/track/3dPQuX8Gs42Y7b454ybpMR"
      },
      "cta": "MISIÓN CUMPLIDA"
    },
    "done": {
      "title": "MISIÓN CUMPLIDA.",
      "cta": "SEGUIR"
    }
  },
  "pending": {
    "title": "Y HABÍA MÁS.",
    "text": "Algunas cosas estaban escritas. Otras diseñadas.\n\nAlgunas dependían de cosas que habías respondido varios días antes.\n\nNo llegaron a suceder.",
    "status_label": "NO LLEGÓ A SUCEDER",
    "cta": "SEGUIR",
    "items": [
      {
        "title": "GUILTY PLEASURE",
        "text": "Canciones que nos gustan aunque quizás no deberían."
      },
      {
        "title": "CUANDO ESTÉS MÁS MAL",
        "text": "Música preparada para días tristes, furiosos o simplemente hartos."
      },
      {
        "title": "MORNING WARM",
        "text": "Hacer reaparecer una de tus Shower Songs varios días después, en otro contexto."
      },
      {
        "title": "ARCHIVE",
        "text": "Historias, mails, objetos y cosas viejas que nunca habíamos vuelto a mirar."
      },
      {
        "title": "AFTER DARK / HANDS",
        "text": "Música, cercanía, contacto y una parte más íntima de la historia."
      },
      {
        "title": "PRIME",
        "text": "Una historia alrededor de una versión nuestra en plenitud.",
        "note": "Candidata: Amor Amarillo — Gustavo Cerati"
      }
    ]
  },
  "voices": {
    "title": "VOCES DE AFUERA",
    "text": "Hay una parte de nuestra historia que nosotros no podemos contar desde afuera.\n\nEllos sí.",
    "cta": "SEGUIR",
    "children": [
      {
        "name": "HIJO 1",
        "track": {
          "title": "No Te Imaginás",
          "artist": "No Te Va Gustar",
          "spotify_url": "https://open.spotify.com/track/7x00uv5aDR0MA8eIk7xAuf"
        }
      },
      {
        "name": "HIJO 2",
        "track": {
          "title": "A definir",
          "artist": "El Cuarteto de Nos",
          "spotify_url": null
        }
      },
      {
        "name": "HIJO 3",
        "track": {
          "title": "Corazón Salvaje",
          "artist": "Marcela Morelo",
          "spotify_url": "https://open.spotify.com/track/3zwTjNO3wlSsLuXqIha8Sf"
        }
      }
    ]
  },
  "key": {
    "title": "FALTA UNA COSA.",
    "text": "Hace 21 días te pedí que guardaras una llave.\n\nSi todavía la tenés, llegó el momento.",
    "cta": "LA TENGO",
    "reveal": {
      "text": "Entonces ya sabés para qué era.",
      "note": "Algunas cosas esperan bastante tiempo para encontrar su momento.",
      "cta": "SEGUIR"
    }
  },
  "track21": {
    "eyebrow": "LA ÚLTIMA",
    "title": "TRACK 21",
    "text": "Durante estas semanas usamos canciones para volver a lugares, personas, situaciones y versiones nuestras.\n\nCasi todas ya traían recuerdos.\n\nEsta no.",
    "emphasis": "Esta empieza hoy.",
    "track": {
      "title": "Vengo Del Futuro",
      "artist": "KURT",
      "spotify_url": "https://open.spotify.com/track/4mvtqRJpySaswY75a9WfVm"
    },
    "track_cta": "ESCUCHAR ENTERA EN SPOTIFY",
    "cta": "SEGUIR"
  },
  "finale": {
    "title": "PROYECTO 21",
    "text": "Empezó con una llave.\n\nDespués hubo canciones, preguntas, recuerdos, cosas absurdas, cosas que salieron bien y otras que quedaron por el camino.\n\nBastante parecido a veinte años.\n\nNo quería resumirlos.\n\nQuería hacer algo nuevo con ellos.",
    "signoff": "Feliz 20.",
    "mark": "P.21 / 20 ✓",
    "cta": "·"
  },
  "plus": {
    "title": "P.21+",
    "text": "Continuará."
  }
}$json$::jsonb,
  activation_datetime = '2026-10-06T19:00:00-03:00',
  status = 'ready'
where day_number = 21;

-- Control.
select day_number as dia, title as titulo, status as estado, experience_type as tipo,
  to_char(activation_datetime at time zone 'America/Argentina/Buenos_Aires', 'DD/MM HH24:MI') as abre
from days where day_number = 21;
