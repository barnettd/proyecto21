-- Todo lo que sonó en P.21, para armar la playlist a mano.
-- 'P.21' son las que puse yo, 'ELLA' las que mandó ella.

select
  d.day_number as dia,
  d.title as mision,
  case t.source when 'P21' then 'P.21' when 'HER' then 'ELLA' else t.source end as quien,
  t.title as cancion,
  t.artist as artista,
  t.tag as etiqueta,
  t.spotify_url as link
from tracks t
join days d on d.id = t.day_id
order by d.day_number, t.source desc, t.sort_order;

-- Solo los links, uno por línea, para pegar de a tandas en Spotify.
select string_agg(distinct t.spotify_url, E'\n') as links
from tracks t where t.spotify_url is not null;
