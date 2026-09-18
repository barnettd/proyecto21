-- D4 — Crucigrama / When words fail.
-- Correr en Supabase → SQL Editor. Es repetible.
-- La frase del crucigrama viaja en config_json.phrase.answer y se valida en el
-- servidor: nunca llega al navegador.

update days set
  title = "Crucigrama",
  experience_type = 'printable',
  completion_text = 'Recibida.
A veces alcanza con elegir la canción correcta.',
  config_json = $json${
    "response_tag": "D4_WHEN_WORDS_FAIL",
    "response_label": "Tu canción",
    "availability_label": "Esta página permanece disponible por",
    "entry": {
      "title": "HOY HAY QUE IMPRIMIR.",
      "text": "Descargá el crucigrama, imprimilo y resolvelo a mano.\nNo necesitás nada más que unos minutos y algo para escribir.",
      "cta": "DESCARGAR",
      "fine_print": "Imprimí en tamaño real (100%).",
      "note": "Cuando lo tengas resuelto, volvé acá.",
      "continue_cta": "YA LO RESOLVÍ"
    },
    "printable": {
      "url": "/d4-crucigrama.pdf",
      "filename": "P21-crucigrama.pdf"
    },
    "phrase": {
      "title": "LA FRASE",
      "text": "El crucigrama esconde una frase. Escribila acá.",
      "placeholder": "La frase",
      "cta": "ES ESTA",
      "errors": [
        "No. Y eso que la escribiste con mucha seguridad.",
        "Tampoco. Por ahora gana el crucigrama.",
        "No es esa. Volvé a mirar las casillas marcadas."
      ],
      "hint": "Está en inglés.",
      "skip": "Seguir sin resolverlo",
      "answer": "when words fail, music speaks"
    },
    "solved": {
      "title": "WHEN WORDS FAIL, MUSIC SPEAKS",
      "text": "Es, más o menos, la premisa. Hay cosas que no salen en una conversación y sí salen en una canción: alcanza con mandarla en el momento justo para que la otra persona entienda.\n\nA veces la canción llega antes que la conversación. Y funciona incluso cuando del otro lado no saben qué estabas pensando.",
      "cta": "OK"
    },
    "reveal": {
      "title": "ESA CANCIÓN",
      "text": "Ahora te toca a vos.",
      "prompt": "Elegí una canción que alguna vez hayas usado —o usarías— para decir algo que cuesta decir con palabras.",
      "cta": "ESTA DICE ALGO POR MÍ"
    },
    "deadline_note": "Tenés hasta las 23:59 de hoy.",
    "closing": {
      "title": "RECIBIDA.",
      "text": "A veces alcanza con elegir la canción correcta.\n\nVa una del otro lado: esta dice algo por mí.",
      "label_track": "De mi lado",
      "track_cta": "ESCUCHAR EN SPOTIFY",
      "label_final": "La tuya",
      "track": {
        "title": "Say Something",
        "artist": "A Great Big World, Christina Aguilera",
        "spotify_url": "https://open.spotify.com/track/6Vc5wAMmXdKIAM7WUoEb7N"
      }
    }
  }$json$::jsonb,
  status = 'ready'
where id = 'd4';

select day_number, title, status, experience_type,
  config_json->'printable'->>'url' as imprimible,
  config_json->'phrase'->>'answer' as frase
from days where id = 'd4';
