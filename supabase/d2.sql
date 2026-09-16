-- D2 — Solo una sobrevive (llave de 8 canciones).
-- También corrige el orden: la spec nueva pone la llave en D2 y Shower Songs en D3.
-- Correr en Supabase → SQL Editor. Es repetible.

update days set title = 'Shower Songs', experience_type = 'multi_track' where id = 'd3';

update days set
  title = 'Solo una sobrevive',
  experience_type = 'bracket',
  completion_text = 'Bonus Track
Gracias por tu contribución en P.21.',
  config_json = $json${
  "response_label": "Lo que queda",
  "availability_label": "Esta página permanece disponible por",
  "entry": {
    "title": "Knock-Outs: Una Sobrevivirá",
    "text": "Hoy no necesito explicaciones.\nSolo decisiones.\n\nNo hay que pensar, hay que elegir y decidir: 1v1",
    "rule": "Si dudás, elegí la que pondrías ahora.",
    "cta": "EMPEZAR"
  },
  "rounds": {
    "qf": "Cuartos",
    "sf": "Semis",
    "final": "Final"
  },
  "select_label": "ELEGIR",
  "progress_label": "Decisión {n} / {total}",
  "winner": {
    "title": "Es oficial: tu top 1.",
    "bridge": "Pero faltaba una que nunca estuvo en la llave."
  },
  "wildcard": {
    "title": "TU WILDCARD",
    "prompt": "Elegí una canción que debería haber estado en esta competencia y podría haber llegado a la final.",
    "cta": "BIG MISS!"
  },
  "deadline_note": "Tenés hasta las 23:59 de hoy.",
  "tracks": [
    {
      "title": "Here Comes The Sun",
      "artist": "The Beatles",
      "spotify_url": "https://open.spotify.com/track/6dGnYIeXmHdcikdzNNDMm2"
    },
    {
      "title": "El Mundo Cabe En Una Canción",
      "artist": "Fito Paez",
      "spotify_url": "https://open.spotify.com/track/5fpoGUETUlpC45OUUjXvJu"
    },
    {
      "title": "Margarita",
      "artist": "Fito Paez",
      "spotify_url": "https://open.spotify.com/track/44fpTaUuSFvwzeJe4yEDDe"
    },
    {
      "title": "Normal 1",
      "artist": "Fito Paez",
      "spotify_url": "https://open.spotify.com/track/4FZwazC4ne86nEBD6i6ZdR"
    },
    {
      "title": "El Otro Cambio, Los Que Se Fueron",
      "artist": "Fito Paez",
      "spotify_url": "https://open.spotify.com/track/0jOCJkMvYzutcNTX9WtAVp"
    },
    {
      "title": "Tiempo Al Tiempo",
      "artist": "Fito Paez",
      "spotify_url": "https://open.spotify.com/track/2vUrrcNMrSQnjFu6dE1yrg"
    },
    {
      "title": "Tengo una Muñeca Que Regala Besos",
      "artist": "Fito Paez, Joaquín Sabina",
      "spotify_url": "https://open.spotify.com/track/0udM4azyzvy8lQXl5tHP1d"
    },
    {
      "title": "El Mundo Entero",
      "artist": "Ruben Rada, Fito Paez",
      "spotify_url": "https://open.spotify.com/track/4LYffEwKS6i6peurdkR3c9"
    }
  ],
  "instructions": "Escuchá ambos previews. Elegí uno.",
  "locked_label": "Se revela al avanzar",
  "interstitials": {
    "after_qf": {
      "text": "Fácil, ¿no? La primera ronda lo es. Veamos la segunda.",
      "cta": "CONTINUAR"
    },
    "after_sf": {
      "text": "Quedan dos. Acá ya no hay dónde esconderse.",
      "cta": "CONTINUAR"
    }
  },
  "bonus": {
    "title": "Bonus Track",
    "text": "Lo pediste, elegí una.",
    "select_label": "ELEGIR"
  },
  "closing": {
    "title": "Bonus Track",
    "text": "Gracias por tu contribución en P.21.\nPara cerrar, propongo que pienses cuál sería tu próxima elección; no tenés que elegir.",
    "label_final": "Tu elección",
    "label_track": "De mi lado",
    "track": {
      "title": "El Mundo Entero",
      "artist": "Ruben Rada, Fito Paez",
      "spotify_url": "https://open.spotify.com/track/4LYffEwKS6i6peurdkR3c9"
    }
  }
}$json$::jsonb,
  status = 'ready'
where id = 'd2';

select day_number, title, status, experience_type,
  to_char(activation_datetime at time zone 'America/Argentina/Buenos_Aires', 'DD/MM HH24:MI') as abre,
  jsonb_array_length(config_json->'tracks') as canciones
from days where id in ('d2','d3') order by day_number;
