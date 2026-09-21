-- D6 — Memory Recovery.
-- Correr en Supabase → SQL Editor. Es repetible.

update days set
  title = 'Memory Recovery',
  experience_type = 'memory',
  completion_text = 'Recuperado.',
  config_json = $json${
    "response_label": "Lo que mandaste",
    "availability_label": "Esta página permanece disponible por",
    "text_limit": 80,
    "opening": {
      "eyebrow": "D6",
      "title": "MEMORY RECOVERY",
      "lead": "Empecemos por el principio.",
      "text": "¿Cuál es la canción que creés conocer desde hace más años?\n\nNo necesariamente la más vieja. La primera que sentís que ya estaba ahí desde siempre.",
      "cta": "GUARDAR Y SEGUIR",
      "image": "/d6-apertura.jpg"
    },
    "intro": {
      "title": "MEMORY RECOVERY",
      "text": "Hoy sí, miramos para atrás, desde adentro.\n\nMenos poético y más específico: esos lugares, situaciones y personas que merecen su propia retrospectiva.\n\nTres y tres.",
      "cta": "EMPEZAR"
    },
    "fragments": [
      {
        "key": "place",
        "progress": "1 / 3",
        "title": "LUGAR",
        "lead": "Hay lugares que una canción puede traer de vuelta con una precisión bastante injusta.\n\nPrimero yo.",
        "p21": {
          "track": {
            "title": "Crazy",
            "artist": "Aerosmith",
            "spotify_url": "https://open.spotify.com/track/3QxKpdTB8ZSFn8MGeCCpsQ"
          },
          "note": "Esto me recuerda cuando tuve oportunidad de conocer Turquía."
        },
        "p21_cta": "AHORA VOS",
        "you": {
          "title": "TU LUGAR",
          "text": "Elegí una canción que te devuelva a un lugar.\n\nPuede ser una casa, una ciudad, una ruta, un cuarto, una playa o cualquier lugar que exista distinto en tu memoria.",
          "prompt": "¿A qué lugar te trajo?",
          "cta": "GUARDAR"
        }
      },
      {
        "key": "situation",
        "progress": "2 / 3",
        "title": "SITUACIÓN",
        "lead": "A veces no vuelve a un lugar.\n\nVuelve una escena completa: algo que pasaba, una rutina, una noche, un viaje, una etapa.",
        "p21": {
          "track": {
            "title": "La Isla del Sol",
            "artist": "El Símbolo",
            "spotify_url": "https://open.spotify.com/track/1sZFIMGmKUYycerZSZb99O"
          },
          "note": "Majané 1998 y con él, una época y un ciclo."
        },
        "p21_cta": "AHORA VOS",
        "you": {
          "title": "TU SITUACIÓN",
          "text": "Elegí una canción que te devuelva a una escena o momento concreto.\n\nAlgo que, cuando suena, no recordás solamente: casi podés volver a verlo.",
          "prompt": "¿Qué vuelve cuando suena?",
          "cta": "GUARDAR"
        }
      },
      {
        "key": "person",
        "progress": "3 / 3",
        "title": "PERSONA",
        "p21_first": false,
        "lead": "Hay personas que terminan viviendo dentro de una canción sin haberlo decidido.",
        "p21": {
          "track": {
            "title": "Contamíname",
            "artist": "Pedro Guerra",
            "spotify_url": "https://open.spotify.com/track/7Cd7umUyXCf7xWCVzgKlnZ"
          },
          "note": "A mi tía."
        },
        "p21_cta": "AHORA VOS",
        "you": {
          "text": "Hay personas que terminan viviendo dentro de una canción sin haberlo decidido.\n\nElegí una canción que inevitablemente te lleve a alguien.",
          "prompt": "¿Quién aparece cuando suena?",
          "cta": "GUARDAR Y ESCUCHAR TU PERSONA"
        },
        "reveal": {
          "label": "P.21",
          "text": "Ahora la mía.",
          "cta": "CERRAR RECUPERACIÓN",
          "bonus": {
            "label": "Bonus Track",
            "text": "Y esta, muchas veces, me recuerda a vos.\n\nGracias.",
            "track": {
              "title": "Wonderwall",
              "artist": "Oasis",
              "spotify_url": "https://open.spotify.com/track/5qqabIl2vWzo9ApSC317sa"
            }
          }
        }
      }
    ],
    "deadline_note": "Tenés hasta las 23:59 de hoy.\nHay prórroga de ser necesario.",
    "closing_scene": {
      "image": "/d6-cierre.jpg",
      "title": "RECUPERADO.",
      "text": "Algunas cosas quedan atrás.\nOtras solo estaban esperando la canción correcta.",
      "footer": "Seguí el próximo paso cuando aparezca."
    }
  }$json$::jsonb,
  status = 'ready'
where id = 'd6';

select day_number, title, status, experience_type,
  jsonb_array_length(config_json->'fragments') as fragmentos,
  (select string_agg(f->>'title', ' · ' order by ord)
     from jsonb_array_elements(config_json->'fragments') with ordinality as x(f, ord)) as partes,
  config_json->'opening'->>'image' as imagen_inicio,
  config_json->'closing_scene'->>'image' as imagen_cierre
from days where id = 'd6';
