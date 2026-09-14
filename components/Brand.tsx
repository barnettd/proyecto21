/** Line → dot → waveform: the P21 signature mark. */
export function LineDot({ className = 'line-dot', muted = false }: { className?: string; muted?: boolean }) {
  const c = muted ? 'var(--gris)' : 'var(--ambar)'
  const bars = [5, 10, 16, 8, 13, 6]
  return (
    <svg className={className} viewBox="0 0 220 24" aria-hidden="true">
      <line x1="0" y1="12" x2="150" y2="12" stroke={c} strokeWidth="1.25" />
      <circle cx="154" cy="12" r="3.5" fill={c} />
      {bars.map((h, i) => (
        <line key={i} x1={172 + i * 8} x2={172 + i * 8} y1={12 - h / 2} y2={12 + h / 2} stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      ))}
    </svg>
  )
}

export function CountdownMarker({ n }: { n: number }) {
  return (
    <span className="marker">
      P.21<span className="slash">/</span>
      {String(n).padStart(2, '0')}
    </span>
  )
}
