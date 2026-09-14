import { connection } from 'next/server'
import { CountdownMarker, LineDot } from '@/components/Brand'
import { loadContent } from '@/lib/content'
import { resolveActiveDay } from '@/lib/schedule'

export default async function Page() {
  await connection()
  const { days, settings } = await loadContent()
  const active = resolveActiveDay(days, new Date(), settings.force_active_day)

  if (active.kind === 'locked') {
    return (
      <div className="shell">
        <main className="shell-main locked">
          <h1 className="locked-title" aria-label="PROYECTO 21">
            <span className="wm-word">PROYECTO</span>
            <span className="wm-num">21</span>
          </h1>
          <LineDot />
          <CountdownMarker n={active.countdown} />
          <p className="eyebrow">{settings.locked_text}</p>
        </main>
      </div>
    )
  }

  const { day } = active
  return (
    <div className="shell">
      <header className="shell-header">
        <span className="eyebrow">Proyecto 21</span>
        <CountdownMarker n={day.countdown_number} />
      </header>
      <main className="shell-main">
        {day.title && <h1 className="day-title">{day.title}</h1>}
        {day.intro_text && <p className="prose">{day.intro_text}</p>}
        {day.instructions && <p className="prose muted">{day.instructions}</p>}
      </main>
    </div>
  )
}
