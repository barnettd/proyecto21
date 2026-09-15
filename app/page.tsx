import { connection } from 'next/server'
import { CountdownMarker, Footer, Wordmark } from '@/components/Brand'
import { Countdown } from '@/components/Countdown'
import { DayView } from '@/components/DayView'
import { loadContent } from '@/lib/content'
import { resolveActiveDay } from '@/lib/schedule'

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection()
  const [{ days, settings }, params] = await Promise.all([loadContent(), searchParams])

  // Local preview only: /?day=N forces a day. Never honored in production.
  const previewDay =
    process.env.NODE_ENV !== 'production' && typeof params.day === 'string' && /^\d+$/.test(params.day)
      ? Number(params.day)
      : null
  const active = resolveActiveDay(days, new Date(), previewDay ?? settings.force_active_day)

  if (active.kind === 'locked') {
    return (
      <div className="shell">
        <main className="shell-main locked">
          <h1 className="visually-hidden">PROYECTO 21</h1>
          <Wordmark size="lg" />
          <div className="locked-status">
            <CountdownMarker n={active.countdown} mark />
            {active.opensAt ? (
              <Countdown target={active.opensAt} serverNow={Date.now()} />
            ) : (
              <p className="eyebrow">{settings.locked_text}</p>
            )}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const { day } = active
  return (
    <div className="shell">
      <header className="shell-header">
        <Wordmark size="sm" />
        <CountdownMarker n={day.countdown_number} />
      </header>
      <main className="shell-main">
        <DayView day={day} />
      </main>
      <Footer />
    </div>
  )
}
