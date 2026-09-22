-- D6 se extendió: ocupa el 21 y el 22 de septiembre.
-- De D7 en adelante, todo el cronograma corre una jornada.
-- Correr una sola vez. NO es repetible: cada corrida suma otro día.

update days
set activation_datetime = activation_datetime + interval '1 day'
where day_number >= 7;

-- El plazo de D6 vuelve a ser el normal: hoy sin prórroga anunciada.
update days
set config_json = jsonb_set(
  config_json,
  '{deadline_note}',
  $json$"Tenés hasta las 23:59 de hoy."$json$::jsonb
)
where id = 'd6';

-- Control: D6 hoy, y el resto una jornada más adelante.
select day_number as dia, title as titulo, status as estado,
  to_char(activation_datetime at time zone 'America/Argentina/Buenos_Aires', 'DD/MM HH24:MI') as abre
from days where day_number between 5 and 9 order by day_number;

select config_json->>'deadline_note' as plazo_d6 from days where id = 'd6';
