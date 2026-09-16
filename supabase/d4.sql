-- D4 — Sopa de letras / When words fail.
-- Correr en Supabase → SQL Editor. Es repetible.

update days set
  title = 'Sopa de letras',
  experience_type = 'printable',
  completion_text = 'Recibida.
A veces alcanza con elegir la canción correcta.',
  config_json = $json${
    "response_tag": "D4_WHEN_WORDS_FAIL",
    "response_label": "Tu canción",
    "availability_label": "Esta página permanece disponible por",
    "entry": {
      "title": "HOY HAY QUE IMPRIMIR.",
      "text": "Hoy P21 sale un rato de la pantalla.\nDescargá el archivo, imprimilo y resolvelo a mano.\nNo necesitás nada más que unos minutos y algo para marcar.",
      "cta": "DESCARGAR",
      "fine_print": "Imprimí en tamaño real (100%).",
      "note": "Cuando termines, volvé acá.",
      "continue_cta": "YA LO RESOLVÍ"
    },
    "printable": { "url": "/d4-sopa-de-letras.pdf", "filename": "P21-sopa-de-letras.pdf" },
    "reveal": {
      "title": "WHEN WORDS FAIL, MUSIC SPEAKS",
      "text": "Hay cosas que una canción puede decir mejor que una explicación.",
      "prompt": "Elegí una canción que alguna vez hayas usado —o usarías— para decir algo que cuesta decir con palabras.",
      "cta": "ESTA DICE ALGO POR MÍ"
    },
    "deadline_note": "Tenés hasta las 23:59 de hoy."
  }$json$::jsonb,
  status = 'ready'
where id = 'd4';

select day_number, title, status, experience_type,
  config_json->'printable'->>'url' as imprimible
from days where id = 'd4';
