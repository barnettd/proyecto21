-- D2 — Reemplazo de canciones (las ocho de la llave + la de cierre).
-- Solo toca las canciones: textos, mecánica y estado quedan intactos.
-- Correr en Supabase → SQL Editor. Es repetible.
--
-- Las ocho van en orden de entrada a la llave:
--   Ronda 1: 1 vs 2 · 3 vs 4 · 5 vs 6 · 7 vs 8

update days
set config_json = jsonb_set(
  config_json,
  '{tracks}',
  $json$[
    { "title": "Here Comes The Sun", "artist": "The Beatles", "spotify_url": "https://open.spotify.com/track/6dGnYIeXmHdcikdzNNDMm2" },
    { "title": "El Mundo Cabe En Una Canción", "artist": "Fito Paez", "spotify_url": "https://open.spotify.com/track/5fpoGUETUlpC45OUUjXvJu" },
    { "title": "Margarita", "artist": "Fito Paez", "spotify_url": "https://open.spotify.com/track/44fpTaUuSFvwzeJe4yEDDe" },
    { "title": "Normal 1", "artist": "Fito Paez", "spotify_url": "https://open.spotify.com/track/4FZwazC4ne86nEBD6i6ZdR" },
    { "title": "El Otro Cambio, Los Que Se Fueron", "artist": "Fito Paez", "spotify_url": "https://open.spotify.com/track/0jOCJkMvYzutcNTX9WtAVp" },
    { "title": "Tiempo Al Tiempo", "artist": "Fito Paez", "spotify_url": "https://open.spotify.com/track/2vUrrcNMrSQnjFu6dE1yrg" },
    { "title": "Tengo una Muñeca Que Regala Besos", "artist": "Fito Paez, Joaquín Sabina", "spotify_url": "https://open.spotify.com/track/0udM4azyzvy8lQXl5tHP1d" },
    { "title": "El Mundo Entero", "artist": "Ruben Rada, Fito Paez", "spotify_url": "https://open.spotify.com/track/4LYffEwKS6i6peurdkR3c9" }
  ]$json$::jsonb
)
where id = 'd2';

-- Canción de cierre (la que suena en la última pantalla, "Propuesta P.21").
update days
set config_json = jsonb_set(
  config_json,
  '{closing,track}',
  $json${ "title": "El Mundo Entero", "artist": "Ruben Rada, Fito Paez", "spotify_url": "https://open.spotify.com/track/4LYffEwKS6i6peurdkR3c9" }$json$::jsonb
)
where id = 'd2';

-- Control: deben aparecer las ocho, en orden, y la de cierre.
select
  jsonb_array_length(config_json->'tracks') as cuantas,
  (select string_agg(t->>'title', ' · ' order by ord)
     from jsonb_array_elements(config_json->'tracks') with ordinality as x(t, ord)) as llave,
  config_json->'closing'->'track'->>'title' as cierre
from days where id = 'd2';
