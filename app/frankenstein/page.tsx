import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import { Footer, Seal } from '@/components/Brand'
import { DayView } from '@/components/DayView'
import { getResponse, loadContent } from '@/lib/content'
import { hasContent } from '@/lib/day-content'

/**
 * Frankenstein (D8) quedó construido pero nunca se activó en el calendario.
 * El cierre entra por acá: la ruta sirve ese día sin importar su estado, y
 * vuelve al cierre cuando termina. No se anuncia en ningún lado.
 */
export default async function FrankensteinPage() {
  await connection()
  const { days } = await loadContent()
  const day = days.find((d) => d.day_number === 8)
  if (!day || !hasContent(day)) notFound()

  const response = await getResponse(day.id)
  const done = Boolean(response)

  return (
    <div className={`shell${done ? ' shell-scene' : ''}`}>
      {!done && (
        <header className="shell-header">
          <Seal size="xs" />
        </header>
      )}
      <main className="shell-main">
        <DayView day={day} nextOpensAt={null} serverNow={Date.now()} />
        <a className="submit submit-secondary back-to-closing" href="/">
          {done ? 'VOLVER AL CIERRE' : 'VOLVER'}
        </a>
      </main>
      {!done && <Footer dayNumber={day.day_number} />}
    </div>
  )
}
