-- D2 — Solo una sobrevive (llave de 8 canciones).
-- También corrige el orden: la spec nueva pone la llave en D2 y Shower Songs en D3.
-- Correr en Supabase → SQL Editor. Es repetible.

update days set title = 'Shower Songs', experience_type = 'multi_track' where id = 'd3';

update days set
  title = 'Solo una sobrevive',
  experience_type = 'bracket',
  completion_text = 'Sobreviviente registrada.
Wildcard adentro.
Seguimos.',
  config_json = $json${
    "response_label": "Lo que queda",
    "availability_label": "Esta página permanece disponible por",
    "entry": {
      "title": "SOLO UNA SOBREVIVE",
      "text": "Hoy no necesito explicaciones.\nSolo decisiones.\n\nOcho entran. Una queda.",
      "rule": "Si dudás, elegí la que pondrías ahora.",
      "cta": "EMPEZAR"
    },
    "rounds": { "qf": "Cuartos", "sf": "Semis", "final": "Final" },
    "select_label": "SE QUEDA",
    "progress_label": "Decisión {n} / {total}",
    "winner": {
      "title": "UNA SOBREVIVIÓ.",
      "bridge": "Pero faltaba una que nunca estuvo en la llave."
    },
    "wildcard": {
      "title": "TU WILDCARD",
      "prompt": "Elegí una canción que debería haber estado en esta competencia.",
      "cta": "SUMAR WILDCARD"
    },
    "deadline_note": "Tenés hasta las 23:59 de hoy.",
    "tracks": [
      { "title": "Here Comes The Sun", "artist": "The Beatles", "spotify_url": "https://open.spotify.com/track/6dGnYIeXmHdcikdzNNDMm2" },
      { "title": "El Mundo Cabe En Una Canción", "artist": "Fito Paez", "spotify_url": "https://open.spotify.com/track/5fpoGUETUlpC45OUUjXvJu" },
      { "title": "Margarita", "artist": "Fito Paez", "spotify_url": "https://open.spotify.com/track/44fpTaUuSFvwzeJe4yEDDe" },
      { "title": "Normal 1", "artist": "Fito Paez", "spotify_url": "https://open.spotify.com/track/4FZwazC4ne86nEBD6i6ZdR" },
      { "title": "El Otro Cambio, Los Que Se Fueron", "artist": "Fito Paez", "spotify_url": "https://open.spotify.com/track/0jOCJkMvYzutcNTX9WtAVp" },
      { "title": "Tiempo Al Tiempo", "artist": "Fito Paez", "spotify_url": "https://open.spotify.com/track/2vUrrcNMrSQnjFu6dE1yrg" },
      { "title": "Tengo una Muñeca Que Regala Besos", "artist": "Fito Paez, Joaquín Sabina", "spotify_url": "https://open.spotify.com/track/0udM4azyzvy8lQXl5tHP1d" },
      { "title": "El Mundo Entero", "artist": "Ruben Rada, Fito Paez", "spotify_url": "https://open.spotify.com/track/4LYffEwKS6i6peurdkR3c9" }
    ]
  }$json$::jsonb,
  status = 'ready'
where id = 'd2';

select day_number, title, status, experience_type,
  to_char(activation_datetime at time zone 'America/Argentina/Buenos_Aires', 'DD/MM HH24:MI') as abre,
  jsonb_array_length(config_json->'tracks') as canciones
from days where id in ('d2','d3') order by day_number;
