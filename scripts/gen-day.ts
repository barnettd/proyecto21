/**
 * Genera el SQL de un día a partir de content/seed.ts, que es la fuente de verdad.
 *   node --experimental-strip-types scripts/gen-day.ts 21
 * Escribe supabase/d<N>.sql. Repetible: la consulta es un update más un control.
 */
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { seedDays } from '../content/seed.ts'

const n = Number(process.argv[2])
if (!Number.isInteger(n)) {
  console.error('Uso: node --experimental-strip-types scripts/gen-day.ts <número de día>')
  process.exit(1)
}

const day = seedDays.find((d) => d.day_number === n)
if (!day) {
  console.error(`No existe el día ${n} en content/seed.ts`)
  process.exit(1)
}

/** Literal de texto para Postgres: comillas simples, duplicando las internas. */
const q = (v: string | null) => (v === null ? 'null' : `'${v.replace(/'/g, "''")}'`)

const sets = [
  `  title = ${q(day.title)}`,
  `  experience_type = ${q(day.experience_type)}`,
  `  intro_text = ${q(day.intro_text)}`,
  `  instructions = ${q(day.instructions)}`,
  `  completion_text = ${q(day.completion_text)}`,
  `  config_json = $json$${JSON.stringify(day.config_json, null, 2)}$json$::jsonb`,
  `  activation_datetime = ${q(day.activation_datetime)}`,
  `  status = ${q(day.status)}`,
]

const sql = `-- D${n} — ${day.title ?? ''}.
-- Generado por scripts/gen-day.ts a partir de content/seed.ts. No editar a mano.
-- Correr en Supabase → SQL Editor. Es repetible.

update days set
${sets.join(',\n')}
where day_number = ${n};

-- Control.
select day_number as dia, title as titulo, status as estado, experience_type as tipo,
  to_char(activation_datetime at time zone 'America/Argentina/Buenos_Aires', 'DD/MM HH24:MI') as abre
from days where day_number = ${n};
`

const out = path.join(process.cwd(), 'supabase', `d${n}.sql`)
writeFileSync(out, sql)
console.log(`${out} — ${sql.length} caracteres`)
