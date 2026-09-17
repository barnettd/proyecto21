-- D2 — Solo una sobrevive (llave de 16 canciones, octavos).
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
    "text": "Hoy no necesito explicaciones.\nSolo decisiones.",
    "rule": "Si dudás, elegí la que pondrías ahora.",
    "cta": "EMPEZAR"
  },
  "rounds": [
    "Ronda 1",
    "Ronda 2",
    "Ronda 3",
    "Ronda 4"
  ],
  "select_label": "ELEGIR",
  "progress_label": "Decisión {n} / {total}",
  "winner": {
    "title": "¡Es oficial: tu top 1!",
    "bridge": "Aunque sabemos que es injusto para tu top 1, porque de seguro faltó una que nunca estuvo en la selección."
  },
  "wildcard": {
    "title": "TU WILDCARD",
    "prompt": "Elegí una canción que debería haber estado en esta competencia y seguramente llegaba a la final.",
    "cta": "BIG MISS!"
  },
  "deadline_note": "Tenés hasta las 23:59 de hoy.",
  "tracks": [
    {
      "title": "Ojos de Café",
      "artist": "BALTA",
      "spotify_url": "https://open.spotify.com/track/4Kr8Ci4zBhvCNbGrGXCbAm"
    },
    {
      "title": "No Es Mi Primera Vez",
      "artist": "Alfonsina",
      "spotify_url": "https://open.spotify.com/track/2J2PdM4LtvR96pkGQrpJFi"
    },
    {
      "title": "Don't Speak",
      "artist": "No Doubt",
      "spotify_url": "https://open.spotify.com/track/6urCAbunOQI4bLhmGpX7iS"
    },
    {
      "title": "Zombie",
      "artist": "The Cranberries",
      "spotify_url": "https://open.spotify.com/track/2IZZqH4K02UIYg5EohpNHF"
    },
    {
      "title": "Todo se transforma",
      "artist": "Jorge Drexler",
      "spotify_url": "https://open.spotify.com/track/4YEU9N2XAE0DfUwxWI5ijA"
    },
    {
      "title": "Depende",
      "artist": "Jarabe De Palo",
      "spotify_url": "https://open.spotify.com/track/6aaPUBUFw9KEW1p1inVQv9"
    },
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
  ],
  "instructions": "Vas a recibir las canciones de a pares. Escuchá cada preview y elegí una de las dos.",
  "locked_label": "Se revela al avanzar",
  "interstitials": [
    {
      "text": "Fácil, ¿no? La primera ronda lo es. Veamos la segunda.",
      "cta": "CONTINUAR"
    },
    {
      "text": "Quedan cuatro. Acá ya no hay dónde esconderse.",
      "cta": "CONTINUAR"
    },
    {
      "text": "Dos. Nada más que dos.",
      "cta": "CONTINUAR"
    }
  ],
  "bonus": {
    "title": "Bonus Track",
    "text": "Para ser más justos, elegí una de las siguientes:",
    "select_label": "ELEGIR"
  },
  "closing": {
    "title": "Bonus Track",
    "text": "Gracias por tu contribución en P.21.\nPara cerrar la misión, te regalo la escucha de otra canción y te propongo que pienses cuál sería tu próxima elección. No tenés que decidir.",
    "label_final": "Tu Top 1",
    "label_track": "Propuesta P.21",
    "track": {
      "title": "El Mundo Entero",
      "artist": "Ruben Rada, Fito Paez",
      "spotify_url": "https://open.spotify.com/track/4LYffEwKS6i6peurdkR3c9"
    },
    "footer_note": "Seguí cada paso cuando aparezca."
  },
  "deadline_label": "Cierra en"
}$json$::jsonb,
  status = 'ready'
where id = 'd2';

select day_number, title, status, experience_type,
  to_char(activation_datetime at time zone 'America/Argentina/Buenos_Aires', 'DD/MM HH24:MI') as abre,
  jsonb_array_length(config_json->'tracks') as canciones
from days where id in ('d2','d3') order by day_number;
