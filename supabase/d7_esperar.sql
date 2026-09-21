-- Retener D6: mientras D7 esté "disabled", el sitio sigue mostrando D6
-- aunque pase su hora de apertura. El día siguiente no se adelanta solo.
-- Correr HOY, antes de las 08:00 de mañana. Es repetible.

update days set status = 'disabled' where id = 'd7';

-- Control: D6 activo, D7 fuera del cronograma.
select day_number as dia, title as titulo, status as estado,
  to_char(activation_datetime at time zone 'America/Argentina/Buenos_Aires', 'DD/MM HH24:MI') as abre
from days where day_number between 6 and 8 order by day_number;
