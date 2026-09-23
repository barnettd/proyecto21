import { connection } from 'next/server'
import { aiModel, generate, intoSets } from '@/lib/ai'
import { localMix, type Fragment } from '@/lib/mixer'

/**
 * Diagnóstico de D8: prueba el modelo con frases de juguete y cuenta cuántas
 * líneas sobreviven a la verificación. Solo responde con el token de admin.
 * `?models=1` lista los modelos que la clave tiene disponibles.
 */
const FIXTURE: Fragment[] = [
  { id: 'u1', owner: 'her', excerpt: 'los lunes tienen memoria de vidrio' },
  { id: 'u2', owner: 'her', excerpt: 'un ascensor que nunca sube al mundo' },
  { id: 'u3', owner: 'her', excerpt: 'bailaré sobre relojes rotos' },
  { id: 'u4', owner: 'her', excerpt: 'la casa esconde mis llaves otra vez' },
  { id: 'p1', owner: 'p21', excerpt: 'todo el mundo necesita vacaciones' },
  { id: 'p2', owner: 'p21', excerpt: 'perdí un astronauta sin licencia' },
  { id: 'p3', owner: 'p21', excerpt: 'la heladera guarda respuestas frías' },
]

export const maxDuration = 30

export async function GET(request: Request) {
  await connection()

  const url = new URL(request.url)
  const expected = process.env.P21_ADMIN_TOKEN?.trim()
  if (!expected || url.searchParams.get('token')?.trim() !== expected) {
    return new Response('Not found', { status: 404 })
  }

  const key = process.env.GEMINI_API_KEY?.trim()
  if (url.searchParams.get('models')) {
    if (!key) return Response.json({ error: 'sin GEMINI_API_KEY' })
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
    const body = (await res.json()) as { models?: Array<{ name: string; supportedGenerationMethods?: string[] }> }
    return Response.json({
      status: res.status,
      models: (body.models ?? [])
        .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m) => m.name.replace('models/', '')),
    })
  }

  const started = Date.now()
  const sets = Number(url.searchParams.get('sets') ?? 3)
  const model = url.searchParams.get('model')?.trim() || aiModel()
  const { lines, error } = await generate(FIXTURE, [], sets, 20000, model)
  const complete = intoSets(lines)

  return Response.json(
    {
      model,
      key: Boolean(key),
      ms: Date.now() - started,
      error,
      validas: lines.length,
      tercias: complete.length,
      ejemplos: complete[0]?.map((l) => `${l.mode}: ${l.text}`) ?? [],
      respaldo: localMix(FIXTURE, [], 3),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
