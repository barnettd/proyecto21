-- Control general. No modifica nada: se puede correr cuando sea.

-- 1. Los días: estado, cuándo abren, y cuántas piezas de contenido tienen.
select
  day_number as dia,
  title as titulo,
  status as estado,
  experience_type as tipo,
  to_char(activation_datetime at time zone 'America/Argentina/Buenos_Aires', 'DD/MM HH24:MI') as abre,
  coalesce(
    jsonb_array_length(config_json->'tracks'),
    jsonb_array_length(config_json->'modules'),
    jsonb_array_length(config_json->'compartments')
  ) as piezas
from days
where day_number between 1 and 5
order by day_number;

-- 2. Las canciones que pone P.21 (las de mi lado, no las de ella).
select day_id as dia, title as cancion, artist as artista
from tracks
where source = 'P21'
order by day_id, sort_order;

-- 3. Lo que ella ya respondió.
select
  day_id as dia,
  response_type as tipo,
  to_char(created_at at time zone 'America/Argentina/Buenos_Aires', 'DD/MM HH24:MI') as cuando,
  (select count(*) from tracks t where t.day_id = r.day_id and t.source = 'HER') as canciones
from responses r
order by day_id;
