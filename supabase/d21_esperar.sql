-- Freno de mano: el cierre vuelve a estar apagado.
-- Mientras D21 esté 'disabled', el sitio sigue mostrando D7 como hasta ayer.
-- Para encenderlo de nuevo: correr d21.sql (que lo deja 'ready').

update days set status = 'disabled' where day_number = 21;

select day_number as dia, title as titulo, status as estado,
  to_char(activation_datetime at time zone 'America/Argentina/Buenos_Aires', 'DD/MM HH24:MI') as abre
from days where day_number >= 6 order by day_number;
