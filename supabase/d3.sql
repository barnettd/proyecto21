-- D3 — Shower Songs (tres canciones, una por pantalla).
-- Correr en Supabase → SQL Editor. Es repetible.

update days set
  title = 'Shower Songs',
  experience_type = 'multi_track',
  completion_text = 'Set registrado.
El shampoo queda oficialmente habilitado como micrófono.',
  config_json = $json${
    "sequential": true,
    "progress_label": "{n} / {total}",
    "track_label": "De mi lado",
    "response_label": "Tu set",
    "availability_label": "Esta página permanece disponible por",
    "entry": {
      "title": "SHOWER SONGS",
      "lead": "Hay canciones que funcionan mejor con agua corriendo.",
      "text": "Algunas se escuchan.\nOtras inevitablemente terminan siendo interpretadas con shampoo en mano.\n\nHoy necesito tu set.",
      "cta": "EMPEZAR"
    },
    "listen": {
      "text": "Primero, una de mi lado.",
      "primary_cta": "ESCUCHAR EN SPOTIFY",
      "secondary_cta": "ARMAR MI SET",
      "while_text": "Sí. Esta entra en la categoría."
    },
    "modules_intro": "",
    "modules": [
      {
        "n": "01",
        "name": "ABRIR EL SHOW",
        "tag": "D3_SHOWER_OPENING",
        "guide": "La primera cambia la acústica del baño y avisa que oficialmente empezó el show.",
        "question": "¿Qué canción abre tu set de ducha?",
        "cta": "SIGUIENTE"
      },
      {
        "n": "02",
        "name": "MICRÓFONO DE SHAMPOO",
        "tag": "D3_SHOWER_MIC",
        "guide": "Hay canciones que no se escuchan: se interpretan. Aunque nadie lo haya pedido.",
        "question": "¿Cuál es esa que inevitablemente terminás cantando como si el shampoo fuera un micrófono?",
        "cta": "SIGUIENTE"
      },
      {
        "n": "03",
        "name": "ENCORE",
        "tag": "D3_SHOWER_ENCORE",
        "guide": "La ducha ya terminó. Técnicamente deberías salir. Pero todavía queda una canción.",
        "question": "¿Cuál merece quedarse hasta el final?",
        "cta": "ESTE ES MI SET"
      }
    ],
    "deadline_note": "Tenés hasta las 23:59 de hoy.",
    "submit_label": "ESTE ES MI SET"
  }$json$::jsonb,
  status = 'ready'
where id = 'd3';

-- Canción de ducha de P.21.
delete from tracks where day_id = 'd3' and source = 'P21';
insert into tracks (day_id, source, source_name, title, artist, spotify_url, tag, sort_order, playlist_status)
values ('d3', 'P21', 'PROYECTO 21', 'Locuras Contigo', 'Rombai',
        'https://open.spotify.com/track/7LrrGFdnRwEwOSS59qF05G', 'SHOWER', 0, 'candidate');

select day_number, title, status, experience_type,
  to_char(activation_datetime at time zone 'America/Argentina/Buenos_Aires', 'DD/MM HH24:MI') as abre,
  jsonb_array_length(config_json->'modules') as pasos
from days where id = 'd3';
