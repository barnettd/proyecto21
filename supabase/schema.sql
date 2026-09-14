-- PROYECTO 21 schema. Run once in the Supabase SQL editor.
-- The app reads/writes with the service role key from the server only,
-- so RLS is enabled with no policies: anon/public access is fully denied.

create table if not exists settings (
  id int primary key default 1 check (id = 1),
  force_active_day int,
  locked_text text not null default 'TODAVÍA NO.'
);
insert into settings (id) values (1) on conflict do nothing;

create table if not exists days (
  id text primary key,
  day_number int unique not null,
  countdown_number int not null,
  activation_datetime timestamptz not null,
  status text not null default 'draft' check (status in ('draft', 'ready', 'disabled')),
  experience_type text not null,
  title text,
  intro_text text,
  instructions text,
  completion_text text,
  config_json jsonb not null default '{}'
);

create table if not exists tracks (
  id uuid primary key default gen_random_uuid(),
  day_id text references days(id),
  source text not null check (source in ('P21','HER','DANIEL','CHILD_1','CHILD_2','CHILD_3','FRIEND','FAMILY')),
  source_name text,
  title text,
  artist text,
  spotify_url text,
  tag text,
  sort_order int not null default 0,
  playlist_status text
);

create table if not exists responses (
  id uuid primary key default gen_random_uuid(),
  day_id text not null references days(id),
  response_type text not null,
  payload_json jsonb not null,
  created_at timestamptz not null default now()
);
-- One submission per day: the database itself rejects duplicates.
create unique index if not exists responses_one_per_day on responses (day_id);

create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  day_id text not null references days(id),
  type text not null check (type in ('image','audio','video','document')),
  url text not null,
  caption text,
  sort_order int not null default 0
);

alter table settings enable row level security;
alter table days enable row level security;
alter table tracks enable row level security;
alter table responses enable row level security;
alter table media enable row level security;

-- Seed D0–D21 (all -03:00 Buenos Aires). Days start as draft → locked until marked ready.
insert into days (id, day_number, countdown_number, activation_datetime, status, experience_type, title)
select 'd' || n, n, greatest(21 - n, 0),
  (date '2026-09-15' + n) + (case when n = 16 then time '22:00' else time '08:00' end) at time zone 'America/Argentina/Buenos_Aires',
  case when n = 0 then 'ready' else 'draft' end,
  t.type, t.title
from (values
  (0,'locked','The Package'), (1,'single_track','Opening Scene'), (2,'multi_track','Shower Songs'),
  (3,'bracket','Solo una sobrevive'), (4,'reveal','Word Search'), (5,'track_list','Recovery Kit'),
  (6,'track_plus_text','Una línea'), (7,'multi_track','Memory Recovery'), (8,'track_plus_text','Soundtrack of Nothing'),
  (9,'media_exchange','Guest Track #1'), (10,'single_track','Guilty Pleasure'), (11,'single_track','Hands'),
  (12,'choice','Cuando estés más mal'), (13,'single_track','Morning Warm'), (14,'media_exchange','Guest Track #2'),
  (15,'archive','Archive'), (16,'single_track','After Dark'), (17,'reveal','Hace cuatro años'),
  (18,'archive','PRIME'), (19,'media_exchange','Libertad / Voces de afuera'), (20,'single_track','Future'),
  (21,'custom','Track 21')
) as t(n, type, title)
on conflict (id) do nothing;
