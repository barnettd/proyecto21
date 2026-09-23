/**
 * Manda (o programa) el mail de apertura de un día.
 *
 *   node --experimental-strip-types scripts/send-mail.ts --day 3 --to alguien@mail.com --at "2026-09-18T08:00:00-03:00"
 *   node --experimental-strip-types scripts/send-mail.ts --day 3 --preview        (escribe un .html y no manda nada)
 *
 * La API key sale de RESEND_API_KEY (del entorno o de .env.local).
 * Ninguna dirección de correo vive en el repo: va siempre por --to.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { buildDayEmail, type DayEmail } from '../lib/email.ts'

const FROM = 'PROYECTO 21 <contacto@proyecto21.space>'
const REPLY_TO = 'contacto@proyecto21.space'
const SITE = 'https://proyecto21.space'

/** Un mail por día. El texto se aprueba antes de programarlo. */
const mails: Record<number, DayEmail> = {
  7: {
    subject: 'Proyecto 21: disponible',
    lead: 'Tu siguiente paso ya está disponible.',
    estimate: 'Tiempo estimado: 10 min',
    cta: 'ABRIR PROYECTO 21',
    url: SITE,
  },
  6: {
    subject: 'Proyecto 21: disponible',
    lead: 'La mesa de luz guarda cosas personales.\nHoy guarda tu siguiente paso.',
    estimate: 'Tiempo estimado: N/A',
    url: SITE,
  },
  5: {
    subject: 'Proyecto 21: disponible',
    lead: 'Tu siguiente paso ya está disponible.\nHoy no hay nada que resolver.',
    estimate: 'Tiempo estimado: 10 min',
    cta: 'ABRIR PROYECTO 21',
    url: SITE,
  },
  4: {
    subject: 'Proyecto 21: disponible',
    lead: 'Tu siguiente paso ya está disponible.\nEsta vez vas a necesitar unos minutos más, y una impresora.',
    estimate: 'Tiempo estimado: 20 min',
    cta: 'ABRIR PROYECTO 21',
    url: SITE,
  },
  3: {
    subject: 'Proyecto 21: disponible',
    lead: 'No todo necesita explicación antes de empezar; tu siguiente paso ya está listo.',
    estimate: 'Tiempo estimado: 10 min',
    cta: 'ABRIR PROYECTO 21',
    url: SITE,
  },
}

const args = new Map<string, string>()
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i]
  if (!arg.startsWith('--')) continue
  const next = process.argv[i + 1]
  args.set(arg.slice(2), next && !next.startsWith('--') ? next : 'true')
}

const day = Number(args.get('day'))
const mail = mails[day]
if (!mail) fail(`No hay mail definido para el día ${args.get('day') ?? '(sin --day)'}.`)

const { subject, html, text } = buildDayEmail(mail)

if (args.has('preview')) {
  const path = `/tmp/p21-mail-d${day}.html`
  writeFileSync(path, html)
  console.log(`Asunto: ${subject}\n\n--- texto plano ---\n${text}\n\nHTML: ${path}`)
  process.exit(0)
}

const to = args.get('to')
if (!to || to === 'true') fail('Falta --to con la dirección de destino.')
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) fail(`--to no parece una dirección: ${to}`)
// Los marcadores de posición se copian y pegan sin querer; mejor que no salgan.
if (/^(ella|ejemplo|alguien|destinatari[oa]|tu-mail|su-direccion)@/i.test(to)) {
  fail(`"${to}" es el ejemplo, no una dirección real. Poné la de verdad.`)
}

const key = process.env.RESEND_API_KEY?.trim() || fromEnvFile()
if (!key) fail('Falta RESEND_API_KEY (en el entorno o en .env.local).')

const at = args.get('at')
if (at && at !== 'true' && Number.isNaN(Date.parse(at))) fail(`--at no es una fecha válida: ${at}`)

const res = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: FROM,
    to: [to],
    reply_to: REPLY_TO,
    subject,
    html,
    text,
    ...(at && at !== 'true' ? { scheduled_at: at } : {}),
  }),
})

const body = await res.json()
if (!res.ok) fail(`Resend respondió ${res.status}: ${JSON.stringify(body)}`)

console.log(at && at !== 'true' ? `Programado para ${at}` : 'Enviado')
console.log(`id: ${body.id}`)
console.log('Para cancelar o reprogramar:')
console.log(`  curl -X POST https://api.resend.com/emails/${body.id}/cancel -H "Authorization: Bearer $RESEND_API_KEY"`)

function fromEnvFile(): string | undefined {
  try {
    const line = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
      .split('\n')
      .find((l) => l.startsWith('RESEND_API_KEY='))
    return line?.slice('RESEND_API_KEY='.length).trim().replace(/^["']|["']$/g, '')
  } catch {
    return undefined
  }
}

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}
