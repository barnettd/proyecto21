-- D5 — Recovery Kit.
-- Correr en Supabase → SQL Editor. Es repetible.

update days set
  title = 'Recovery Kit',
  experience_type = 'track_list',
  completion_text = 'Kit completo.
Guardalo para cuando haga falta.',
  config_json = $json${
    "response_tag": "D5_RECOVERY_USER",
    "response_label": "Tu aporte",
    "availability_label": "Esta página permanece disponible por",
    "progress_label": "{n} / {total}",
    "entry": {
      "title": "RECOVERY KIT",
      "text": "No todos los días necesitan empuje.\nAlgunos necesitan bajar el ruido, quedarse quietos o simplemente dejar de exigir un poco.\n\nPreparé tres.",
      "cta": "ABRIR KIT"
    },
    "compartments": [
      {
        "label": "Compartimento 01",
        "tag": "D5_RECOVERY_01",
        "title": "PARA BAJAR EL RUIDO",
        "guide": "Para cuando todo está un poco demasiado fuerte.",
        "cta": "SIGUIENTE",
        "track": {
          "title": "Tiempo Al Tiempo",
          "artist": "Fito Paez",
          "spotify_url": "https://open.spotify.com/track/2vUrrcNMrSQnjFu6dE1yrg"
        }
      },
      {
        "label": "Compartimento 02",
        "tag": "D5_RECOVERY_02",
        "title": "PARA QUEDARSE QUIETA",
        "guide": "Para cuando no hace falta arreglar nada.",
        "cta": "SIGUIENTE",
        "track": {
          "title": "El Otro Cambio, Los Que Se Fueron",
          "artist": "Fito Paez",
          "spotify_url": "https://open.spotify.com/track/0jOCJkMvYzutcNTX9WtAVp"
        }
      },
      {
        "label": "Compartimento 03",
        "tag": "D5_RECOVERY_03",
        "title": "PARA CUANDO EL DÍA YA FUE SUFICIENTE",
        "guide": "Para cerrar la puerta mentalmente y dejarlo ahí.",
        "cta": "SIGUIENTE",
        "track": {
          "title": "Tengo una Muñeca Que Regala Besos",
          "artist": "Fito Paez, Joaquín Sabina",
          "spotify_url": "https://open.spotify.com/track/0udM4azyzvy8lQXl5tHP1d"
        }
      }
    ],
    "contribution": {
      "title": "FALTA UNA.",
      "text": "Si este kit fuera tuyo, ¿qué canción debería estar acá?",
      "more_text": "Si tenés más, mejor.",
      "more_cta": "AGREGAR OTRA",
      "max": 5,
      "cta": "COMPLETAR"
    },
    "deadline_note": "Tenés hasta las 23:59 de hoy.",
    "closing_scene": {
      "text": "Seguí el próximo paso cuando aparezca.",
      "audio_label": "Poner música"
    }
  }$json$::jsonb,
  status = 'ready'
where id = 'd5';

select day_number, title, status, experience_type,
  jsonb_array_length(config_json->'compartments') as compartimentos,
  (config_json->'contribution'->>'max')::int as maximo,
  config_json->'closing_scene'->>'text' as cierre,
  config_json->'closing_scene'->>'image' as imagen,
  config_json->'closing_scene'->>'audio' as audio
from days where id = 'd5';
