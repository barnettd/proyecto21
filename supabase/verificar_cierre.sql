-- Control antes de mandarle el link. Todo tiene que decir OK.

select
  'D21 listo'                                                as control,
  case when status = 'ready' and experience_type = 'closing'
       then 'OK' else 'MAL: ' || status || ' / ' || experience_type end as resultado
from days where day_number = 21
union all
select 'D21 copy nueva',
  case when config_json->'opening'->>'cta' = 'EMPECEMOS' then 'OK' else 'MAL: falta correr d21.sql' end
from days where day_number = 21
union all
select 'D21 reabre Frankenstein',
  case when config_json->>'opens_day' = '8' then 'OK' else 'MAL: sin opens_day' end
from days where day_number = 21
union all
select 'D21 pantallas',
  case when config_json ? 'archive' and config_json ? 'mission' and config_json ? 'gift'
        and config_json ? 'plus' and config_json ? 'finale' then 'OK' else 'MAL: faltan bloques' end
from days where day_number = 21
union all
select 'D8 fuera del calendario',
  case when status = 'disabled' then 'OK' else 'MAL: ' || status || ' (aparecería solo)' end
from days where day_number = 8
union all
select 'D8 tres frases reales',
  case when jsonb_array_length(config_json->'reveal_fragments') = 3
        and config_json->'reveal_fragments'->0->'track'->>'artist' = 'Jarabe De Palo'
       then 'OK' else 'MAL: falta correr d8.sql' end
from days where day_number = 8
union all
select 'D8 sin pantalla de elegir',
  case when not (config_json ? 'choose') then 'OK' else 'MAL: falta correr d8.sql' end
from days where day_number = 8
union all
select 'Ningún día suelto después del 8',
  case when count(*) = 0 then 'OK' else 'MAL: ' || count(*) || ' día(s) encendidos' end
from days where day_number between 9 and 20 and status <> 'disabled'
union all
select 'Archivo con contenido',
  case when count(*) = 7 then 'OK' else 'MAL: solo ' || count(*) || ' de 7 días' end
from (select d.day_number from days d join tracks t on t.day_id = d.id
      where t.source = 'HER' and d.day_number between 1 and 7
      group by d.day_number) x
union all
select 'Cierre sin responder todavía',
  case when count(*) = 0 then 'OK' else 'OJO: ya hay una respuesta guardada' end
from responses r join days d on d.id = r.day_id where d.day_number = 21
union all
select 'Tabla ai_usage',
  case when to_regclass('public.ai_usage') is not null then 'OK' else 'MAL: correr d8_schema.sql' end;
