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
      "cta": "ABRIR KIT",
      "image": "/d5-inicio.jpg"
    },
    "compartments": [
      {
        "label": "Compartimento 01",
        "tag": "D5_RECOVERY_01",
        "title": "PARA BAJAR EL RUIDO",
        "guide": "Para cuando todo está un poco demasiado fuerte y lo único que ordena es acordarse de que nada se queda quieto.",
        "cta": "SIGUIENTE",
        "track": {
          "title": "Todo Cambia",
          "artist": "Mercedes Sosa",
          "spotify_url": "https://open.spotify.com/track/0njOsb3y8TnwIJC7GnlWwD"
        }
      },
      {
        "label": "Compartimento 02",
        "tag": "D5_RECOVERY_02",
        "title": "PARA MIRAR EL CAMINO",
        "guide": "Para cuando la cabeza se pone a repasar el viaje sin pedir permiso, y conviene dejarla.",
        "cta": "SIGUIENTE",
        "track": {
          "title": "Al Final de Este Viaje en la Vida",
          "artist": "Silvio Rodríguez",
          "spotify_url": "https://open.spotify.com/track/6kKiwIng125tpfiFGwhvXh"
        }
      },
      {
        "label": "Compartimento 03",
        "tag": "D5_RECOVERY_03",
        "title": "PARA CUANDO EL DÍA YA FUE SUFICIENTE",
        "guide": "Para cuando no querés resolver nada más y alcanza con mirar a los demás un rato.",
        "cta": "SIGUIENTE",
        "track": {
          "title": "Piano Man",
          "artist": "Billy Joel",
          "spotify_url": "https://open.spotify.com/track/70C4NyhjD5OZUMzvWZ3njJ"
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
      "image": "/d5-cierre.jpg",
      "text": "Seguí el próximo paso cuando aparezca.",
      "track_note": "Antes de irte: escuchá esta y seguí la letra.",
      "track": {
        "title": "Silencio",
        "artist": "Jorge Drexler",
        "spotify_url": "https://open.spotify.com/track/2gjB9GgSZFlj0YwItEACpQ"
      }
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
