-- D7 — Soundtrack of Nothing.
-- Correr en Supabase → SQL Editor. Es repetible.
--
-- Carga el día APAGADO (status = 'disabled'): mientras siga así, el sitio
-- sigue mostrando D6 aunque pase la hora de apertura de D7. Para encenderlo:
--   update days set status = 'ready' where id = 'd7';

update days set
  title = 'Soundtrack of Nothing',
  experience_type = 'scenarios',
  completion_text = 'Misión abierta.',
  config_json = $json${
    "response_label": "Tus canciones",
    "availability_label": "Esta página permanece disponible por",
    "opening": {
      "eyebrow": "D7",
      "title": "SOUNDTRACK OF NOTHING",
      "text": "No todo necesita ser importante para necesitar música.\n\nHoy vamos a ponerle soundtrack a cosas que normalmente no lo tendrían.",
      "cta": "EMPEZAR"
    },
    "example": {
      "label": "P.21",
      "scene": "Mi escena: abrir la heladera sin saber exactamente qué estoy buscando y quedarme mirándola como si fuera a ofrecer una respuesta.",
      "track_label": "Mi soundtrack",
      "track": {
        "title": "Should I Stay or Should I Go",
        "artist": "The Clash",
        "spotify_url": "https://open.spotify.com/track/0Py4Gdv5n3ZRwCcDVh1FrV"
      },
      "cta": "AHORA VOS"
    },
    "scenarios": [
      {
        "key": "elevator",
        "progress": "1 / 4",
        "title": "ESPERAR EL ASCENSOR",
        "text": "Apretaste el botón.\n\nAhora no queda nada más que mirar cómo cambia un número y actuar como si eso fuera una actividad.",
        "question": "¿Qué canción le pondrías a esos segundos de espera completamente improductivos?",
        "cta": "GUARDAR Y SEGUIR"
      },
      {
        "key": "water",
        "progress": "2 / 4",
        "title": "ESPERAR QUE HIERVA EL AGUA",
        "text": "Pusiste el agua. Ahora empieza ese intervalo misterioso en el que mirarla no la hace hervir más rápido, pero igual probablemente la mires.",
        "question": "¿Qué canción le pondrías a esos minutos en los que literalmente estás esperando que pase algo?",
        "cta": "GUARDAR Y SEGUIR"
      },
      {
        "key": "lost_object",
        "progress": "3 / 4",
        "title": "ESTABA ACÁ RECIÉN",
        "text": "Lo tenías hace cinco minutos. Estás bastante segura.\n\nRevisaste donde debería estar, donde no debería estar y probablemente algún lugar que ya habías revisado dos veces.",
        "question": "¿Qué canción acompaña la búsqueda de algo que tu propia casa decidió esconderte?",
        "cta": "GUARDAR Y SEGUIR"
      },
      {
        "key": "window",
        "progress": "4 / 4",
        "title": "VENTANA",
        "text": "No pasa nada particularmente importante afuera. Tampoco estás esperando a nadie.\n\nSimplemente te quedaste mirando y, por unos minutos, el resto quedó en pausa.",
        "question": "¿Qué canción suena mientras estás ahí, completamente absorta, mirando por la ventana sin ningún motivo?",
        "cta": "GUARDAR"
      }
    ],
    "transition": {
      "title": "UNA COSA MÁS.",
      "text": "Hasta acá, música para cosas que no necesitaban soundtrack.\n\nAhora toca hacer un poco más que elegirla.",
      "cta": "CONTINUAR"
    },
    "mission": {
      "title": "MISIÓN",
      "text": "Esta misión sí requiere un poco más de tiempo.\n\nNo mucho más del necesario, pero esta vez hay que estudiar.\n\nNo hace falta resolverla hoy. Va a completarse en diferido y podés pedir ayuda si la necesitás.",
      "cta": "ENTENDIDO"
    },
    "challenge": {
      "title": "DESAFÍO",
      "text": "Aprendé un loop del riff principal de «Seven Nation Army», de The White Stripes.\n\nSolo un loop.\n\nNo tiene que sonar perfecto: el objetivo es que pueda reconocerse.",
      "cta": "ACEPTAR DESAFÍO"
    },
    "deadline_note": "Tenés hasta las 23:59 de hoy.",
    "closing_scene": {
      "title": "MISIÓN ABIERTA.",
      "text": "No hace falta resolverla hoy.",
      "footer": "Seguí el próximo paso cuando aparezca."
    }
  }$json$::jsonb,
  status = 'disabled'
where id = 'd7';

select day_number, title, status, experience_type,
  jsonb_array_length(config_json->'scenarios') as escenas,
  (select string_agg(f->>'title', ' · ' order by ord)
     from jsonb_array_elements(config_json->'scenarios') with ordinality as x(f, ord)) as cuales,
  config_json->'example'->'track'->>'title' as ejemplo,
  config_json->'challenge'->>'video' as video
from days where id = 'd7';
