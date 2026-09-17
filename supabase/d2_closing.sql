-- D2 — Pantalla de cierre: la canción propuesta y cómo se presenta.
-- D2 ya está cargado y abierto: esto solo toca el cierre. Es repetible.
--   · La canción pasa a ser Wish You Were Here (Pink Floyd).
--   · El rótulo deja de ser "Propuesta P.21".
--   · Debajo del preview aparece el botón para escucharla entera.

update days
set config_json = jsonb_set(
  jsonb_set(
    config_json,
    '{closing,track}',
    $json${
      "title": "Wish You Were Here",
      "artist": "Pink Floyd",
      "spotify_url": "https://open.spotify.com/track/6mFkJmJqdDVQ1REhVfGgd1"
    }$json$::jsonb
  ),
  '{closing,label_track}',
  $json$"Escuchala con auriculares"$json$::jsonb
)
where id = 'd2';

update days
set config_json = jsonb_set(config_json, '{closing,track_cta}', $json$"ESCUCHAR EN SPOTIFY"$json$::jsonb)
where id = 'd2';

-- Control: la canción, el rótulo y el texto del botón.
select
  config_json->'closing'->'track'->>'title' as cierre,
  config_json->'closing'->'track'->>'artist' as artista,
  config_json->'closing'->>'label_track' as rotulo,
  config_json->'closing'->>'track_cta' as boton,
  jsonb_array_length(config_json->'tracks') as canciones,
  status
from days where id = 'd2';
