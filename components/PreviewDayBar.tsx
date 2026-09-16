'use client'

import { useRouter } from 'next/navigation'

export type PreviewDay = {
  n: number
  title: string | null
  /** False for days whose experience type has no component yet. */
  built: boolean
}

/**
 * Dev-only: jump between days. Never rendered in production, where `?day=` is ignored too.
 */
export function PreviewDayBar({ days, current }: { days: PreviewDay[]; current: number }) {
  const router = useRouter()
  const go = (n: number) => router.push(`/?day=${n}`)
  const index = days.findIndex((d) => d.n === current)

  return (
    <nav className="preview-bar preview-days" aria-label="Días (vista previa)">
      <button type="button" onClick={() => go(days[index - 1].n)} disabled={index <= 0} aria-label="Día anterior">
        ‹
      </button>
      <select
        className="preview-select"
        value={current}
        onChange={(e) => go(Number(e.target.value))}
        aria-label="Elegir día"
      >
        {days.map((d) => (
          <option key={d.n} value={d.n}>
            {`D${d.n}${d.title ? ` · ${d.title}` : ''}${d.built ? '' : ' — sin armar'}`}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => go(days[index + 1].n)}
        disabled={index < 0 || index >= days.length - 1}
        aria-label="Día siguiente"
      >
        ›
      </button>
    </nav>
  )
}
