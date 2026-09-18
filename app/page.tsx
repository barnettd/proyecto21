import { connection } from 'next/server'
import { Footer, Seal, Wordmark } from '@/components/Brand'
import { Countdown } from '@/components/Countdown'
import { DayView } from '@/components/DayView'
import { PreviewDayBar, type PreviewDay } from '@/components/PreviewDayBar'
import { getResponse, loadContent } from '@/lib/content'
import { hasContent } from '@/lib/day-content'
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

  // Dev-only day switcher: lists every day, marking the ones without a component yet.
  const preview = process.env.NODE_ENV !== 'production'
  const previewDays: PreviewDay[] = preview
    ? days.map((d) => ({
        n: d.day_number,
        title: d.title,
        built: d.experience_type === 'locked' || hasContent(d),
      }))
    : []
  const currentDay = active.kind === 'day' ? active.day.day_number : (previewDay ?? 21 - active.countdown)

  if (active.kind === 'locked') {
    return (
      <div className="shell">
        {preview && <PreviewDayBar days={previewDays} current={currentDay} />}
        <main className="shell-main locked">
          <h1 className="visually-hidden">PROYECTO 21</h1>
          <Wordmark size="lg" />
          <div className="locked-status">
            {active.opensAt ? (
              <Countdown target={active.opensAt} serverNow={Date.now()} />
            ) : (
              <p className="eyebrow">{settings.locked_text}</p>
            )}
          </div>
        </main>
        <Footer dayNumber={21 - active.countdown} />
      </div>
    )
  }

  const { day } = active
  // La escena de cierre ocupa la pantalla entera: sin sello arriba ni día abajo.
  const scene = Boolean((day.config_json.closing_scene as { text?: string } | undefined)?.text)
  const sceneOn = scene && Boolean(await getResponse(day.id))
  const nextOpensAt =
    days
      .filter((d) => d.status !== 'disabled' && new Date(d.activation_datetime) > new Date())
      .sort((a, b) => new Date(a.activation_datetime).getTime() - new Date(b.activation_datetime).getTime())[0]
      ?.activation_datetime ?? null
  return (
    <div className={`shell${sceneOn ? ' shell-scene' : ''}`}>
      {preview && <PreviewDayBar days={previewDays} current={currentDay} />}
      {!sceneOn && (
        <header className="shell-header">
          <Seal size="xs" />
        </header>
      )}
      <main className="shell-main">
        <DayView day={day} nextOpensAt={nextOpensAt} serverNow={Date.now()} />
      </main>
      {!sceneOn && <Footer dayNumber={day.day_number} />}
    </div>
  )
}
