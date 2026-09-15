/**
 * PROYECTO 21 identity, rebuilt from docs/P.21selected logo.png in HTML/CSS
 * so the type stays crisp Montserrat at any size. Styles in globals.css (.wm-*, .seal).
 */

const BARS = [0.28, 0.6, 1, 0.5, 0.85, 0.35]

/** The waveform: short vertical bars. */
export function Wave({ muted = false }: { muted?: boolean }) {
  return (
    <span className={`wm-wave${muted ? ' is-muted' : ''}`} aria-hidden="true">
      {BARS.map((h, i) => (
        <span key={i} style={{ height: `${h * 100}%` }} />
      ))}
    </span>
  )
}

/** Line ending in a dot: the timeline cue. */
export function Timeline({ muted = false }: { muted?: boolean }) {
  return <span className={`wm-line${muted ? ' is-muted' : ''}`} aria-hidden="true" />
}

/** Primary logo: PROYECTO + 21, timeline under the word, waveform under the number. */
export function Wordmark({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  return (
    <div className={`wordmark wordmark-${size}`} role="img" aria-label="PROYECTO 21">
      <span className="wm-word">PROYECTO</span>
      <span className="wm-num">21</span>
      <Timeline />
      <Wave />
    </div>
  )
}

/** Compact seal: P.21 in a circle. */
export function Seal({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <div className={`seal seal-${size}`} role="img" aria-label="P.21">
      <span className="seal-text">P.21</span>
      <span className="seal-mark">
        <Timeline />
        <Wave />
      </span>
    </div>
  )
}

/** System variant: P.21 / NN with the mini timeline + waveform underneath. */
export function CountdownMarker({ n, mark = false }: { n: number; mark?: boolean }) {
  return (
    <div className={`marker${mark ? ' marker-lg' : ''}`}>
      <span>
        P.21<span className="slash">/</span>
        <span className="marker-n">{String(n).padStart(2, '0')}</span>
      </span>
      {mark && (
        <span className="marker-mark">
          <Timeline />
          <Wave />
        </span>
      )}
    </div>
  )
}

/** Muted divider between what she receives and what she gives. */
export function LineDot() {
  return (
    <div className="divider" aria-hidden="true">
      <Timeline muted />
      <Wave muted />
    </div>
  )
}

export function Footer() {
  return (
    <footer className="shell-footer eyebrow">
      Música <span className="slash">/</span> Memoria <span className="slash">/</span> Continuidad
    </footer>
  )
}
