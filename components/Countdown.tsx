'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * HH:MM:SS until `target`. Ticks against the server's clock (not the phone's),
 * and refreshes the page at zero so the new experience replaces the lock.
 */
export function Countdown({
  target,
  serverNow,
  label = 'Disponible en',
  variant = 'block',
  refreshOnZero = true,
}: {
  target: string
  serverNow: number
  label?: string
  /** 'inline' renders one quiet line instead of the big digits. */
  variant?: 'block' | 'inline'
  /** Deadlines just reach zero; only openings should reload the page. */
  refreshOnZero?: boolean
}) {
  const router = useRouter()
  // First render uses the server time on both sides, so hydration matches.
  const [now, setNow] = useState(serverNow)

  useEffect(() => {
    const offset = serverNow - Date.now()
    const tick = () => setNow(Date.now() + offset)
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [serverNow])

  const remaining = Math.max(0, Date.parse(target) - now)
  const done = remaining === 0

  // At zero, ask the server for the page; retry in case its clock lags by a few seconds.
  useEffect(() => {
    if (!done || !refreshOnZero) return
    router.refresh()
    const id = setInterval(() => router.refresh(), 5000)
    return () => clearInterval(id)
  }, [done, refreshOnZero, router])

  const total = Math.floor(remaining / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60

  if (variant === 'inline') {
    return (
      <p className="countdown-inline" role="timer">
        {label} <span>{`${pad(h)}:${pad(m)}:${pad(s)}`}</span>
      </p>
    )
  }

  return (
    <div className="countdown" role="timer" aria-label={`${label} ${h} horas, ${m} minutos y ${s} segundos`}>
      <p className="eyebrow">{label}</p>
      <div className="countdown-grid" aria-hidden="true">
        <span className="countdown-num">{pad(h)}</span>
        <span className="countdown-colon">:</span>
        <span className="countdown-num">{pad(m)}</span>
        <span className="countdown-colon">:</span>
        <span className="countdown-num">{pad(s)}</span>
        <span className="countdown-unit" style={{ gridColumn: 1 }}>horas</span>
        <span className="countdown-unit" style={{ gridColumn: 3 }}>min</span>
        <span className="countdown-unit" style={{ gridColumn: 5 }}>seg</span>
      </div>
    </div>
  )
}
