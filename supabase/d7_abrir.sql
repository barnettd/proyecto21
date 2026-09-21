-- Encender D7. Correr cuando D6 esté cerrado y le toque a D7.
-- Si su hora de apertura ya pasó, D7 queda activo en el momento de correr esto.

update days set status = 'ready' where id = 'd7';

select day_number as dia, title as titulo, status as estado,
  to_char(activation_datetime at time zone 'America/Argentina/Buenos_Aires', 'DD/MM HH24:MI') as abre
from days where day_number between 6 and 8 order by day_number;
