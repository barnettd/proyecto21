-- Red de seguridad: los días que todavía no están armados quedan apagados.
-- Un día 'disabled' no existe para el sitio: cuando llega su hora no pasa nada
-- y se sigue viendo el último día publicado, en vez de la pantalla bloqueada.
-- Es repetible. Cada día se enciende con su propia consulta (d8.sql, d9.sql…).

update days set status = 'disabled'
where day_number >= 8 and status <> 'ready';

-- Control: del 6 en adelante, quién está listo y quién espera.
select day_number as dia, title as titulo, status as estado,
  to_char(activation_datetime at time zone 'America/Argentina/Buenos_Aires', 'DD/MM HH24:MI') as abre
from days where day_number >= 6 order by day_number;
