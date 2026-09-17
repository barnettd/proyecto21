-- D2 — Reemplazo de canciones (las 16 de la llave + la de cierre).
-- Solo toca las canciones: textos, mecánica y estado quedan intactos.
-- Correr en Supabase → SQL Editor. Es repetible.
--
-- Van en orden de entrada a la llave:
--   Ronda 1: 1v2 · 3v4 · 5v6 · 7v8 · 9v10 · 11v12 · 13v14 · 15v16

update days
set config_json = jsonb_set(
  config_json,
  '{tracks}',
  $json$[
    {
        "title": "Don't Look Back In Anger",
        "artist": "Oasis",
        "spotify_url": "https://open.spotify.com/track/7ppPZa3TRUSGKaks9wH7VT"
    },
    {
        "title": "Angie",
        "artist": "The Rolling Stones",
        "spotify_url": "https://open.spotify.com/track/07OxAhTrD4gIOuxzB2E1QD"
    },
    {
        "title": "Ironic",
        "artist": "Alanis Morissette",
        "spotify_url": "https://open.spotify.com/track/4oGTdOClZUxcM2H3UmXlwL"
    },
    {
        "title": "Zombie",
        "artist": "The Cranberries",
        "spotify_url": "https://open.spotify.com/track/2IZZqH4K02UIYg5EohpNHF"
    },
    {
        "title": "Wake Me Up When September Ends",
        "artist": "Green Day",
        "spotify_url": "https://open.spotify.com/track/3ZffCQKLFLUvYM59XKLbVm"
    },
    {
        "title": "I Belong To You",
        "artist": "Lenny Kravitz",
        "spotify_url": "https://open.spotify.com/track/2zee8Zcesqwnnwliw2Jy8M"
    },
    {
        "title": "No Es Mi Primera Vez",
        "artist": "Alfonsina",
        "spotify_url": "https://open.spotify.com/track/2J2PdM4LtvR96pkGQrpJFi"
    },
    {
        "title": "Ojos de Café",
        "artist": "BALTA",
        "spotify_url": "https://open.spotify.com/track/4Kr8Ci4zBhvCNbGrGXCbAm"
    },
    {
        "title": "Sea",
        "artist": "Jorge Drexler",
        "spotify_url": "https://open.spotify.com/track/6z98uNlBjkisBUnv5zMQWE"
    },
    {
        "title": "Depende",
        "artist": "Jarabe De Palo",
        "spotify_url": "https://open.spotify.com/track/6aaPUBUFw9KEW1p1inVQv9"
    },
    {
        "title": "Tu misterioso alguien",
        "artist": "Miranda!",
        "spotify_url": "https://open.spotify.com/track/3OfS5conn3s0mlzgVTG1Sf"
    },
    {
        "title": "Obsesionario en la Mayor",
        "artist": "Tan Bionica",
        "spotify_url": "https://open.spotify.com/track/5yI4trOBy1XAiAFWTX1LGg"
    },
    {
        "title": "Corazón partío",
        "artist": "Alejandro Sanz",
        "spotify_url": "https://open.spotify.com/track/0wQCKR9OFjYu5Kzrk7WivJ"
    },
    {
        "title": "Y, ¿Si fuera ella?",
        "artist": "Alejandro Sanz",
        "spotify_url": "https://open.spotify.com/track/0mL5t2lk3Wo9SZanWGVrKx"
    },
    {
        "title": "Cuando nadie me ve (Unplugged)",
        "artist": "Alejandro Sanz",
        "spotify_url": "https://open.spotify.com/track/6iaw07BTiLrHVT2OQDgqiD"
    },
    {
        "title": "Brillante Sobre El Mic (En Vivo)",
        "artist": "Fito Paez",
        "spotify_url": "https://open.spotify.com/track/47byqeud1VrnxcKZkPSu4M"
    }
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
