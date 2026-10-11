-- Todo lo que sonó en P.21, para cargar la playlist.
-- Junta dos fuentes: la tabla `tracks` (lo que mandó ella, más alguna mía) y
-- las canciones que viven dentro del config_json de cada día (casi todas las mías).

with del_config as (
  select
    d.day_number,
    'P.21'::text                  as quien,
    obj->>'title'                 as cancion,
    obj->>'artist'                as artista,
    obj->>'spotify_url'           as link
  from days d,
       lateral jsonb_path_query(d.config_json, '$.** ? (@.spotify_url != null)') as obj
  where obj->>'spotify_url' is not null
),
de_tracks as (
  select
    d.day_number,
    case t.source when 'HER' then 'ELLA' else 'P.21' end as quien,
    t.title, t.artist, t.spotify_url
  from tracks t join days d on d.id = t.day_id
  where t.spotify_url is not null
),
todo as (
  select * from del_config
  union all
  select * from de_tracks
),
-- El id de 22 caracteres es la identidad real: los links pueden venir con /intl-es/.
unicas as (
  select
    substring(link from 'track/([A-Za-z0-9]{22})') as id,
    min(day_number)                                as dia,
    string_agg(distinct quien, ' + ' order by quien) as quien,
    min(cancion)                                   as cancion,
    min(artista)                                   as artista,
    min(link)                                      as link
  from todo
  where link ~ 'track/[A-Za-z0-9]{22}'
  group by 1
)
select dia, quien, cancion, artista, link
from unicas
order by dia, quien desc, cancion;

-- Solo los links, uno por línea, para ir pegándolos en el buscador de Spotify.
with del_config as (
  select obj->>'spotify_url' as link
  from days d, lateral jsonb_path_query(d.config_json, '$.** ? (@.spotify_url != null)') as obj
),
todo as (
  select link from del_config
  union all
  select spotify_url from tracks where spotify_url is not null
)
select count(*) as total, string_agg(link, E'\n' order by link) as links
from (
  select distinct on (substring(link from 'track/([A-Za-z0-9]{22})'))
         'https://open.spotify.com/track/' || substring(link from 'track/([A-Za-z0-9]{22})') as link
  from todo
  where link ~ 'track/[A-Za-z0-9]{22}'
) x;
