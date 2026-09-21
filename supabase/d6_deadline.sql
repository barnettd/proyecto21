-- D6 — Solo el cartel del plazo: hoy admite prórroga.
-- No toca nada más. Es repetible.

update days
set config_json = jsonb_set(
  config_json,
  '{deadline_note}',
  $json$"Tenés hasta las 23:59 de hoy.\nHay prórroga de ser necesario."$json$::jsonb
)
where id = 'd6';

-- Control.
select config_json->>'deadline_note' as plazo from days where id = 'd6';
