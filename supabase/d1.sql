-- D1 — Escena de apertura. Carga el contenido y deja el día listo para salir.
-- Correr en Supabase → SQL Editor. Es repetible: se puede correr más de una vez.

update days set
  title = 'Escena de apertura',
  experience_type = 'multi_track',
  completion_text = 'Gracias.
Ya tenemos por dónde empezar.
Seguí cada paso cuando aparezca.',
  config_json = $json${
    "track_label": "Canción de apertura",
    "response_label": "Tus canciones",
    "entry": {
      "lead": "Algunas cosas empiezan antes de entenderse.",
      "text": "No busques la respuesta correcta; pensá y elegí siempre lo que realmente te represente.",
      "suggestions_label": "Dos sugerencias",
      "suggestions": ["Guardá la llave.", "Llevá tus auriculares con vos."],
      "cta": "EMPEZAR"
    },
    "listen": {
      "text": "Esto funciona mejor si no intentás adivinar qué estoy buscando.\nElegí siempre lo que realmente elegirías, aunque todavía no sepas por qué te lo estoy preguntando.\n\nPara empezar, una canción de mi lado.\nPonete los auriculares. Escuchala completa.",
      "primary_cta": "ESCUCHAR EN SPOTIFY",
      "secondary_cta": "Ya la escuché",
      "while_text": "Escuchá. Después seguimos."
    },
    "modules_intro": "Ahora vos. Tres canciones. Tres razones distintas.",
    "modules": [
      {
        "n": "01",
        "name": "RECARGA",
        "tag": "D1_RECARGA",
        "guide": "Fito dice que el mundo cabe en una canción, y a veces alcanza una sola para cambiar el aire de un momento.",
        "question": "¿Qué canción es tu recarga de energía instantánea, esa que ponés cuando necesitás que el día tome otro rumbo?"
      },
      {
        "n": "02",
        "name": "ANTÍDOTO",
        "tag": "D1_ANTIDOTO",
        "guide": "Hay días en que la gravedad, la torpeza y la Ley de Murphy parecen trabajar en equipo. Y en tu caso, a veces hasta con horas extra.",
        "question": "¿Qué canción absurda, divertida o descontracturante elegirías como soundtrack para esos días en que todo se cae, chocás con algo o el universo decide hacer comedia con vos?"
      },
      {
        "n": "03",
        "name": "ARRANQUE",
        "tag": "D1_ARRANQUE",
        "guide": "Hay un momento muy preciso justo antes de empezar algo nuevo: cerrás la puerta, arrancás el motor y el camino todavía está completamente abierto delante tuyo. Todavía no pasó nada, pero por unos segundos todo parece posible.",
        "question": "Tenés la ruta libre por delante y esa sensación de que algo bueno está por empezar. ¿Qué canción suena primero en el estéreo?"
      }
    ],
    "deadline_note": "Podés pensarlas. Tenés hasta las 23:59 de hoy.",
    "submit_label": "ELEGÍ ESTAS"
  }$json$::jsonb
where id = 'd1';

-- Canción de apertura de P21 (Fito Paez, álbum 2006).
delete from tracks where day_id = 'd1' and source = 'P21';
insert into tracks (day_id, source, source_name, title, artist, spotify_url, tag, sort_order, playlist_status)
values ('d1', 'P21', 'PROYECTO 21', 'El Mundo Cabe En Una Canción', 'Fito Paez',
        'https://open.spotify.com/track/5fpoGUETUlpC45OUUjXvJu', 'OPENING', 0, 'candidate');

-- Último paso: publicar el día. Comentá esta línea si querés cargar el contenido sin abrirlo.
update days set status = 'ready' where id = 'd1';

select day_number, title, status, experience_type,
  to_char(activation_datetime at time zone 'America/Argentina/Buenos_Aires', 'DD/MM HH24:MI') as abre,
  jsonb_array_length(config_json->'modules') as modulos
from days where id = 'd1';
