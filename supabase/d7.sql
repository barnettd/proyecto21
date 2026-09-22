-- D7 — Soundtrack of Nothing.
-- Correr en Supabase → SQL Editor. Es repetible.

update days set
  title = 'Soundtrack of Nothing',
  experience_type = 'scenarios',
  completion_text = 'Misión abierta.',
  config_json = $json${
    "response_label": "Tus canciones",
    "availability_label": "Esta página permanece disponible por",
    "opening": {
      "eyebrow": "D7",
      "title": "SOUNDTRACK OF NOTHING",
      "text": "No todo tiene que ser importante para ponerle música.\n\nHoy vamos a ponerle soundtrack a cosas que normalmente no lo tendrían.",
      "cta": "EMPEZAR"
    },
    "example": {
      "title": "ESCENA",
      "scene": "Ese momento en que abrís la heladera sin saber exactamente qué estás buscando y te quedás mirándola como si fuera a ofrecer una respuesta.\n\nPuede tardar a veces un poco, y hoy le puse un soundtrack, a ver qué te parece:",
      "track": {
        "title": "Should I Stay or Should I Go",
        "artist": "The Clash",
        "spotify_url": "https://open.spotify.com/track/0Py4Gdv5n3ZRwCcDVh1FrV"
      },
      "cta": "AHORA VOS"
    },
    "scenarios": [
      {
        "key": "elevator",
        "progress": "1 / 4",
        "title": "ESPERAR EL ASCENSOR",
        "text": "Apretaste el botón.\n\nAhora no queda nada más que mirar cómo cambia un número y actuar como si eso fuera una actividad.",
        "question": "¿Qué canción le pondrías a esos segundos de espera completamente improductivos?",
        "cta": "GUARDAR Y SEGUIR"
      },
      {
        "key": "water",
        "progress": "2 / 4",
        "title": "ESPERAR QUE HIERVA EL AGUA",
        "text": "Pusiste el agua. Ahora empieza ese intervalo misterioso en el que mirarla no la hace hervir más rápido, pero igual probablemente la mires.",
        "question": "¿Qué canción le pondrías a esos minutos en los que literalmente estás esperando que pase algo?",
        "cta": "GUARDAR Y SEGUIR"
      },
      {
        "key": "lost_object",
        "progress": "3 / 4",
        "title": "ESTABA ACÁ RECIÉN",
        "text": "Lo tenías hace cinco minutos. Estás bastante segura.\n\nRevisaste donde debería estar, donde no debería estar y probablemente algún lugar que ya habías revisado dos veces.",
        "question": "¿Qué canción acompaña la búsqueda de algo que tu propia casa decidió esconderte?",
        "cta": "GUARDAR Y SEGUIR"
      },
      {
        "key": "window",
        "progress": "4 / 4",
        "title": "VENTANA",
        "text": "No pasa nada particularmente importante afuera. Tampoco estás esperando a nadie.\n\nSimplemente te quedaste mirando y, por unos minutos, el resto quedó en pausa.",
        "question": "¿Qué canción suena mientras estás ahí, completamente absorta, mirando por la ventana sin ningún motivo?",
        "cta": "GUARDAR"
      }
    ],
    "transition": {
      "title": "UNA COSA MÁS.",
      "text": "Hasta acá, música para cosas que no necesitaban soundtrack.\n\nAhora toca hacer un poco más que elegirla.",
      "cta": "CONTINUAR"
    },
    "mission": {
      "title": "MISIÓN",
      "text": "Esta misión sí requiere un poco más de tiempo.\n\nNo mucho más del necesario, pero esta vez hay que estudiar.\n\nNo hace falta resolverla hoy. Va a completarse en diferido y podés pedir ayuda si la necesitás.",
      "cta": "ENTENDIDO"
    },
    "challenge": {
      "title": "DESAFÍO",
      "text": "Aprendé en la guitarra un loop del riff principal de «Seven Nation Army», de The White Stripes.\n\nSolo un loop.\n\nNo tiene que sonar perfecto: el objetivo es que pueda reconocerse.",
      "track_label": "El original",
      "track": {
        "title": "Seven Nation Army",
        "artist": "The White Stripes",
        "spotify_url": "https://open.spotify.com/track/3dPQuX8Gs42Y7b454ybpMR"
      },
      "video": "https://www.youtube.com/embed/1x6W7UNtMqk",
      "video_url": "https://www.youtube.com/watch?v=1x6W7UNtMqk",
      "reference": "https://www.songsterr.com/a/wsa/white-stripes-seven-nation-army-tab-s605233",
      "reference_label": "Ver la tablatura",
      "help_url": "https://www.justinguitar.com/guitar-lessons/seven-nation-army-b1-309",
      "help_label": "Otra clase, por si esa no te cierra",
      "cta": "ACEPTAR DESAFÍO"
    },
    "deadline_note": "Tenés hasta las 23:59 de hoy.",
    "closing_scene": {
      "title": "MISIÓN ABIERTA.",
      "text": "No hace falta resolverla hoy.",
      "footer": "Seguí el próximo paso cuando aparezca."
    }
  }$json$::jsonb,
  status = 'ready'
where id = 'd7';

select day_number, title, status, experience_type,
  jsonb_array_length(config_json->'scenarios') as escenas,
  (select string_agg(f->>'title', ' · ' order by ord)
     from jsonb_array_elements(config_json->'scenarios') with ordinality as x(f, ord)) as cuales,
  config_json->'example'->'track'->>'title' as ejemplo,
  config_json->'challenge'->>'video' as video
from days where id = 'd7';
