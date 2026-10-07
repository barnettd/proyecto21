-- D8 — Una línea.
-- Generado por scripts/gen-day.ts a partir de content/seed.ts. No editar a mano.
-- Correr en Supabase → SQL Editor. Es repetible.

update days set
  title = 'Una línea',
  experience_type = 'lyrics',
  intro_text = null,
  instructions = null,
  completion_text = 'Ya tiene vida propia.',
  config_json = $json${
  "response_label": "Tu estrofa",
  "availability_label": "Esta página permanece disponible por",
  "opening": {
    "eyebrow": "D8",
    "title": "UNA LÍNEA",
    "text": "Hay canciones que te gustan enteras. Y otras de las que alcanza con rescatar una sola frase.\n\nHoy vamos a quedarnos con esas frases. No importa si la canción te gusta ni quién la canta; lo único que cuenta es la frase.\n\nUna condición: esta vez, solo canciones en castellano.",
    "cta": "EMPEZAR"
  },
  "excerpt": {
    "prompt": "LA FRASE",
    "placeholder": "Copiala tal cual suena.",
    "max_chars": 200
  },
  "categories": [
    {
      "key": "personal",
      "progress": "1 / 3",
      "title": "ESTA PODRÍA HABERLA ESCRITO YO",
      "text": "Una frase que dice algo que vos también pensás, sentís o creés, y lo dice tan bien que podría llevar tu firma. No hace falta que la canción te guste entera.",
      "cta": "GUARDAR Y SEGUIR"
    },
    {
      "key": "admired",
      "progress": "2 / 3",
      "title": "OJALÁ SE ME HUBIERA OCURRIDO",
      "text": "Una metáfora perfecta, un juego de palabras, una idea difícil dicha en pocas palabras, o la ilustración justa. De esas tan simples y tan brillantes que dan un poco de bronca: cómo no se me ocurrió antes.",
      "cta": "GUARDAR Y SEGUIR"
    },
    {
      "key": "absurd",
      "progress": "3 / 3",
      "title": "¿QUÉ ACABO DE ESCUCHAR?",
      "text": "Una frase que en su momento pasó sin que nadie dijera nada, y que hoy, mirada con lupa, no se sostiene: cursi, disparatada, incómoda o directamente indefendible. Alguien la escribió, la grabó, y todos la cantamos sin preguntar demasiado.",
      "cta": "REUNIR FRAGMENTOS"
    }
  ],
  "reveal": {
    "title": "MATERIAL NO SOLICITADO",
    "text": "Trajiste tres frases. Yo elegí otras tres, una por cada consigna, con sus canciones.",
    "task": "Tu tarea: escribir una frase nueva a partir de estas seis.",
    "cta": "SEGUIR"
  },
  "reveal_fragments": [
    {
      "excerpt": "quien quiera oír que oiga",
      "track": {
        "title": "Yo Vengo A Ofrecer Mi Corazon",
        "artist": "Fito Paez",
        "spotify_url": "https://open.spotify.com/track/0Qjrw4gXtqkfwfmp3GMMlW"
      }
    },
    {
      "excerpt": "nada se pierde, todo se transforma",
      "track": {
        "title": "Todo se transforma",
        "artist": "Jorge Drexler",
        "spotify_url": "https://open.spotify.com/track/4YEU9N2XAE0DfUwxWI5ijA"
      }
    },
    {
      "excerpt": "el mundo cabe en una canción",
      "track": {
        "title": "El Mundo Cabe En Una Canción",
        "artist": "Fito Paez",
        "spotify_url": "https://open.spotify.com/track/2HHtWyy5CgaQbC7XSoOb0e"
      }
    }
  ],
  "lab": {
    "title": "FRANKENSTEIN",
    "text": "Seis frases. Un montón de palabras que nunca pidieron estar juntas.\n\nAhora te toca a vos: armar una nueva con ese material.",
    "note": "Podés usar las palabras que quieras, en el orden que quieras.",
    "cta": "CONTINUAR"
  },
  "kraken": {
    "title": "TU CRIATURA",
    "rules": "Una frase nueva, hecha con palabras de las seis. Puede tener sentido o no tenerlo en absoluto; lo que no puede es aburrir.",
    "placeholder": "Escribí tu frase.",
    "max_chars": 300,
    "reference_label": "Las seis",
    "generate": "Generar una base",
    "generating": "Probando…",
    "cta": "ESTA ES LA MÍA",
    "title_prompt": "¿CÓMO SE LLAMA ESTA CANCIÓN?",
    "title_hint": "Ponele un título.",
    "title_placeholder": "El título",
    "title_cta": "SEGUIR"
  },
  "choose": {
    "title": "LAS CRIATURAS DE P.21",
    "text": "P.21 también hizo la tarea con las mismas seis frases. Tres veces, con distinto criterio.\n\nElegí la que se queda con vos.",
    "labels": {
      "coherent": "CASI TIENE SENTIDO",
      "unexpected": "INESPERADA",
      "absurd": "ABSURDA"
    },
    "again": "Mostrame otras tres",
    "loading": "Buscando combinaciones improbables…",
    "cta": "DARLE VIDA"
  },
  "closing_scene": {
    "title": "YA TIENE VIDA PROPIA.",
    "text": "Dos frases que no existían esta mañana.",
    "footer": "Queda una última parte."
  }
}$json$::jsonb,
  activation_datetime = '2026-09-24T08:00:00-03:00',
  status = 'disabled'
where day_number = 8;

-- Control.
select day_number as dia, title as titulo, status as estado, experience_type as tipo,
  to_char(activation_datetime at time zone 'America/Argentina/Buenos_Aires', 'DD/MM HH24:MI') as abre
from days where day_number = 8;
