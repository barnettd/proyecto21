import { connection } from 'next/server'
import { storageStatus } from '@/lib/content'

export async function GET() {
  await connection()
  return Response.json({ db: await storageStatus() }, { headers: { 'Cache-Control': 'no-store' } })
}
