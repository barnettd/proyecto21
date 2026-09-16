-- Borra la respuesta de prueba de D1 y las canciones que quedaron guardadas como suyas.
-- No toca el contenido del día: después de correrlo, D1 vuelve a estar listo para ella.

delete from tracks where day_id = 'd1' and source = 'HER';
delete from responses where day_id = 'd1';

-- Control: las dos cantidades tienen que dar 0, y la canción de apertura seguir en 1.
select
  (select count(*) from responses where day_id = 'd1') as respuestas,
  (select count(*) from tracks where day_id = 'd1' and source = 'HER') as canciones_de_ella,
  (select count(*) from tracks where day_id = 'd1' and source = 'P21') as cancion_de_apertura,
  (select status from days where id = 'd1') as estado_d1;
