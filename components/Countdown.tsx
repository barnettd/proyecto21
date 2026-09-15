'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * HH:MM:SS until `target`. Ticks against the server's clock (not the phone's),
 * and refreshes the page at zero so the new experience replaces the lock.
 */
export function Countdown({ target, serverNow }: { target: string; serverNow: number }) {
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
    if (!done) return
    router.refresh()
    const id = setInterval(() => router.refresh(), 5000)
    return () => clearInterval(id)
  }, [done, router])

  const total = Math.floor(remaining / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60

  return (
    <div className="countdown" role="timer" aria-label={`Disponible en ${h} horas, ${m} minutos y ${s} segundos`}>
      <p className="eyebrow">Disponible en</p>
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
