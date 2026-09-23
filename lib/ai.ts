/**
 * El laboratorio de D8 contra Gemini. El modelo propone; lib/mixer.ts verifica.
 * La clave vive solo en el servidor y nunca se manda al navegador.
 */
import { checkLine, normalizeLine, type Contribution, type Fragment, type Mode } from './mixer.ts'

export type Line = { mode: Mode; text: string; contributions: Contribution[]; source: 'gemini' | 'local' }

/** Para el diagnóstico: cuántas propuso, cuántas quedaron y por qué se cayeron. */
export type Stats = { raw: number; kept: number; rejected: Record<string, number>; samples: string[] }

const MODES: Mode[] = ['coherent', 'unexpected', 'absurd']
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'
/**
 * En orden de preferencia. Los modelos gratuitos devuelven 503 cuando están
 * cargados, así que se prueba el siguiente antes de caer al combinador local.
 */
const DEFAULT_MODELS = ['gemini-flash-lite-latest', 'gemini-3.1-flash-lite', 'gemini-3.6-flash']

export const aiModels = (): string[] => {
  const configured = process.env.GEMINI_MODEL?.trim()
  return configured ? configured.split(',').map((m) => m.trim()).filter(Boolean) : DEFAULT_MODELS
}

export const aiModel = () => aiModels()[0]
const aiKey = () => process.env.GEMINI_API_KEY?.trim()

const SCHEMA = {
  type: 'object',
  properties: {
    lines: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          mode: { type: 'string', enum: MODES },
          text: { type: 'string' },
        },
        required: ['mode', 'text'],
      },
    },
  },
  required: ['lines'],
}

function prompt(sources: Fragment[], avoid: string[], sets: number): string {
  const bank = sources.map((s, i) => `${i + 1}. [${s.id}] «${s.excerpt}»`).join('\n')
  return [
    'Sos un taller de collage poético en castellano rioplatense.',
    '',
    `Tenés ${sources.length} fragmentos de letras de canciones:`,
    bank,
    '',
    `Escribí ${sets * 3} frases nuevas: ${sets} grupos de tres, uno por cada modo.`,
    '- coherent: se lee bien y dice algo inesperadamente con sentido.',
    '- unexpected: imagen rara o surrealista, pero con algo que engancha.',
    '- absurd: ridícula a propósito, con gracia; no una bolsa de palabras.',
    '',
    'Reglas que se verifican después, una por una:',
    '- Cada frase usa entre 6 y 15 palabras.',
    '- Todas las palabras salen de los fragmentos de arriba. Podés cambiar número,',
    '  género y conjugación, y agregar solo conectores comunes (artículos,',
    '  preposiciones, pronombres, y/o/que/si, ser/estar/haber).',
    '- Cada frase mezcla palabras de al menos TRES fragmentos distintos, y entre',
    '  ellos tiene que haber al menos uno de [u1..u4] y al menos uno de [p1..p3].',
    '- Nunca repitas un fragmento casi entero ni cambies una sola palabra.',
    '- Sin nombres propios nuevos, sin insultos, sin nada dirigido a una persona real.',
    '',
    avoid.length ? `No repitas estas, ni parecidas:\n${avoid.slice(-40).map((a) => `- ${a}`).join('\n')}` : '',
    '',
    'Respondé solo el JSON pedido.',
  ]
    .filter(Boolean)
    .join('\n')
}

/** Le pide líneas al modelo y devuelve solo las que pasan la verificación. */
export async function generate(
  sources: Fragment[],
  avoid: string[],
  sets = 5,
  timeoutMs = 12000,
  models = aiModels(),
): Promise<{ lines: Line[]; error?: string; stats?: Stats; model?: string }> {
  const key = aiKey()
  if (!key) return { lines: [], error: 'sin GEMINI_API_KEY' }

  let lastError = 'sin respuesta'
  for (const model of models) {
    const attempt = await askOnce(key, model, sources, avoid, sets, timeoutMs)
    if (attempt.lines.length) return { ...attempt, model }
    lastError = attempt.error ?? 'sin líneas válidas'
    // Un modelo saturado o inexistente: probamos el siguiente. Si respondió
    // bien pero nada pasó la verificación, tampoco insistimos con ese.
  }
  return { lines: [], error: lastError }
}

async function askOnce(
  key: string,
  model: string,
  sources: Fragment[],
  avoid: string[],
  sets: number,
  timeoutMs: number,
): Promise<{ lines: Line[]; error?: string; stats?: Stats }> {
  let payload: { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
  try {
    const res = await fetch(`${ENDPOINT}/${model}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt(sources, avoid, sets) }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: SCHEMA,
          temperature: 1.2,
        },
      }),
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!res.ok) return { lines: [], error: `${model} → ${res.status}` }
    payload = await res.json()
  } catch (err) {
    return { lines: [], error: `${model} → ${String(err).slice(0, 120)}` }
  }

  const raw = payload.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
  let parsed: { lines?: Array<{ mode?: string; text?: string }> }
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { lines: [], error: `${model} → no devolvió JSON` }
  }

  const seen = [...avoid]
  const lines: Line[] = []
  const stats: Stats = { raw: (parsed.lines ?? []).length, kept: 0, rejected: {}, samples: [] }
  for (const item of parsed.lines ?? []) {
    const mode = MODES.includes(item.mode as Mode) ? (item.mode as Mode) : 'unexpected'
    const text = String(item.text ?? '').trim()
    const check = checkLine(text, sources, { seen })
    if (!check.ok) {
      const reason = check.reason.replace(/:.*/, '')
      stats.rejected[reason] = (stats.rejected[reason] ?? 0) + 1
      if (stats.samples.length < 5) stats.samples.push(`${check.reason} → ${text}`)
      continue
    }
    seen.push(normalizeLine(text))
    lines.push({ mode, text, contributions: check.contributions, source: 'gemini' })
  }
  stats.kept = lines.length
  return { lines, stats }
}

/** Tercias completas: una de cada modo. Lo que consume la pantalla. */
export function intoSets(lines: Line[]): Line[][] {
  const pools = new Map<Mode, Line[]>(MODES.map((m) => [m, lines.filter((l) => l.mode === m)]))
  const sets: Line[][] = []
  while (MODES.every((m) => (pools.get(m) ?? []).length > 0)) {
    sets.push(MODES.map((m) => pools.get(m)!.shift()!))
  }
  return sets
}
