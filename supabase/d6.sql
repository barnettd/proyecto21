-- D6 — Memory Recovery.
-- Correr en Supabase → SQL Editor. Es repetible.

update days set
  title = 'Memory Recovery',
  experience_type = 'memory',
  completion_text = 'Recuperado.',
  config_json = $json${
    "response_label": "Lo que mandaste",
    "availability_label": "Esta página permanece disponible por",
    "text_limit": 300,
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
      "text": "Hoy sí, miramos para atrás, desde adentro.\n\nMenos poético y más específico: esos lugares, situaciones y personas que merecen su propia retrospectiva.\n\nTres de mi lado.\nTres del tuyo.",
      "cta": "EMPEZAR"
    },
    "fragments": [
      {
        "key": "place",
        "progress": "1 / 3",
        "title": "LUGAR",
        "lead": "Hay lugares que una canción puede traer de vuelta con una precisión bastante injusta.\n\nEmpiezo yo.",
        "p21": {
          "track": {
            "title": "Mariposa tecknicolor",
            "artist": "Fito Paez",
            "spotify_url": "https://open.spotify.com/track/2RognU2ViRdA6HxnpAITJl"
          },
          "note": "Esta me devuelve una ruta y una ventanilla baja."
        },
        "p21_cta": "AHORA VOS",
        "you": {
          "title": "TU TURNO",
          "text": "Elegí una canción que te devuelva a un lugar.\n\nPuede ser una casa, una ciudad, una ruta, un cuarto, una playa o cualquier lugar que exista distinto en tu memoria.",
          "prompt": "¿Adónde te llevó?",
          "cta": "GUARDAR"
        }
      },
      {
        "key": "situation",
        "progress": "2 / 3",
        "title": "SITUACIÓN",
        "lead": "A veces no vuelve un lugar ni una persona.\n\nVuelve una escena completa: algo que pasaba, una rutina, una noche, un viaje, una etapa.\n\nEsta es una de las mías.",
        "p21": {
          "track": {
            "title": "Un vestido y un amor",
            "artist": "Fito Paez",
            "spotify_url": "https://open.spotify.com/track/2fuN5UVkZFtak2aOpXJSln"
          },
          "note": "Toda una época entra acá adentro."
        },
        "p21_cta": "AHORA VOS",
        "you": {
          "title": "TU TURNO",
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
            "title": "Yo Vengo A Ofrecer Mi Corazon",
            "artist": "Fito Paez",
            "spotify_url": "https://open.spotify.com/track/0Qjrw4gXtqkfwfmp3GMMlW"
          },
          "note": "Esta es la mía. No hace falta que explique de quién."
        },
        "p21_cta": "AHORA VOS",
        "you": {
          "text": "Hay personas que terminan viviendo dentro de una canción sin haberlo decidido.\n\nEsta vez empezás vos.\n\nElegí una canción que inevitablemente te lleve a alguien.",
          "prompt": "¿Quién aparece cuando suena?",
          "cta": "GUARDAR Y VER LA MÍA"
        },
        "reveal": {
          "label": "P.21",
          "text": "Ahora la mía.",
          "cta": "CERRAR RECUPERACIÓN"
        }
      }
    ],
    "deadline_note": "Tenés hasta las 23:59 de hoy.",
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
