-- D8 necesita una tabla chiquita: cuántas veces por día se llamó al modelo.
-- El sitio es público, así que esto es el freno de mano de la cuota.
-- Correr una vez, antes de publicar D8.

create table if not exists ai_usage (
  id text primary key,            -- fecha en Buenos Aires, AAAA-MM-DD
  calls integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table ai_usage enable row level security;

select * from ai_usage order by id desc limit 5;
