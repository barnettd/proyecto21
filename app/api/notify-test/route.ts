import { connection } from 'next/server'
import { notifyResponse } from '@/lib/notify'

/**
 * Diagnóstico: manda el mismo aviso que sale cuando ella responde, con la
 * configuración de producción, y cuenta qué pasó. Va siempre a la casilla
 * configurada —nunca a una que venga en la URL— y solo responde con el token.
 */
export async function GET(request: Request) {
  await connection()

  const expected = process.env.P21_ADMIN_TOKEN?.trim()
  const given = new URL(request.url).searchParams.get('token')?.trim()
  if (!expected || given !== expected) return new Response('Not found', { status: 404 })

  const result = await notifyResponse({ day_number: 0, title: 'Prueba de aviso' }, [
    { title: 'Prueba', artist: 'P.21', spotify_url: null },
  ])

  return Response.json(result, { headers: { 'Cache-Control': 'no-store' } })
}
