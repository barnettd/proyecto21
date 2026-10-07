-- Lo que la pantalla "LO QUE SÍ PASÓ" va a mostrar, tal cual lo arma el sitio:
-- las canciones que mandó ella, por día. Un día sin filas sale como «Sin registro».

select
  d.day_number as dia,
  (21 - d.day_number) as cuenta,
  d.title as mision,
  t.sort_order as orden,
  t.title as cancion,
  t.artist as artista,
  t.tag as etiqueta
from days d
left join tracks t on t.day_id = d.id and t.source = 'HER'
where d.day_number between 1 and 7
order by d.day_number, t.sort_order;

-- Resumen: cuántas quedan por día.
select d.day_number as dia, d.title as mision, count(t.id) as canciones
from days d
left join tracks t on t.day_id = d.id and t.source = 'HER'
where d.day_number between 1 and 7
group by d.day_number, d.title
order by d.day_number;
