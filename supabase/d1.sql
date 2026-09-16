-- D1 — Escena de apertura. Carga el contenido y deja el día listo para salir.
-- Correr en Supabase → SQL Editor. Es repetible: se puede correr más de una vez.

update days set
  title = 'Escena de apertura',
  experience_type = 'multi_track',
  completion_text = 'Gracias por las respuestas y por ser parte de P.21.
Seguí el siguiente paso cuando aparezca.',
  config_json = $json${
    "track_label": "Canción de apertura",
    "response_label": "Tus canciones",
    "entry": {
      "lead": "Algunas cosas empiezan antes de entenderse. Gracias por ser parte de P.21.",
      "text": "Habrá preguntas y tareas, pero no respuestas ni soluciones correctas. Pensá y elegí siempre lo que te represente.",
      "suggestions_label": "Dos sugerencias",
      "suggestions": ["Guardá la llave.", "Llevá tus auriculares con vos."],
      "cta": "EMPEZAR"
    },
    "listen": {
      "text": "Es acá donde propongo empezar P.21: regalándote la escucha de esta canción.\n¿Y cuándo no, Fito Páez?",
      "primary_cta": "ESCUCHAR EN SPOTIFY",
      "secondary_cta": "SEGUIR",
      "while_text": "Este es solo el preview. Escuchala completa en Spotify y seguí cuando termines."
    },
    "modules_intro": "Es tu turno: tres razones, tres canciones.",
    "modules": [
      {
        "n": "01",
        "name": "RECARGA",
        "tag": "D1_RECARGA",
        "guide": "Fito dice que «el mundo cabe en una canción», y en alguna medida es verdad: hay temas que tienen la fuerza exacta para cambiar el aire de un lugar de un segundo a otro, y también el de la habitación interior. Son esos tres minutos donde no importa lo que pase afuera: todo se acomoda.",
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
        "guide": "Hay un instante mágico, casi magnético, justo antes de arrancar un viaje esperado: el momento en que cerrás la puerta del auto, el camino está limpio por delante y sentís ese chispazo de adrenalina, ilusión y expectativa pura por lo que viene.",
        "question": "Estás arrancando por esa carretera, con el camino libre frente a vos y la certeza de que algo bueno está por empezar. ¿Qué canción suena primero en la radio para darle play a ese momento?"
      }
    ],
    "deadline_note": "Podés pensarlas. Tenés hasta las 23:59 de hoy.",
    "submit_label": "ELEGÍ ESTAS",
    "availability_label": "Esta página permanece disponible por"
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
