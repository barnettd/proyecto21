/**
 * PROYECTO 21 identity, rebuilt from docs/P.21selected logo.png in HTML/CSS
 * so the type stays crisp Montserrat at any size. Styles in globals.css (.wm-*, .seal).
 */

const BARS = [0.28, 0.6, 1, 0.5, 0.85, 0.35]

/** The waveform: short vertical bars. */
export function Wave({ muted = false, live = false }: { muted?: boolean; live?: boolean }) {
  return (
    <span className={`wm-wave${muted ? ' is-muted' : ''}${live ? ' is-live' : ''}`} aria-hidden="true">
      {BARS.map((h, i) => (
        <span key={i} style={{ height: `${h * 100}%`, animationDelay: `${i * 0.18}s` }} />
      ))}
    </span>
  )
}

/** Line ending in a dot: the timeline cue. */
export function Timeline({ muted = false }: { muted?: boolean }) {
  return <span className={`wm-line${muted ? ' is-muted' : ''}`} aria-hidden="true" />
}

/** Primary logo: PROYECTO + 21, timeline under the word, waveform under the number. */
export function Wordmark({ size = 'lg', live = false }: { size?: 'sm' | 'lg'; live?: boolean }) {
  return (
    <div className={`wordmark wordmark-${size}`} role="img" aria-label="PROYECTO 21">
      <span className="wm-word">PROYECTO</span>
      <span className="wm-num">21</span>
      <Timeline />
      <Wave live={live} />
    </div>
  )
}

/** Compact seal: P.21 in a circle. */
export function Seal({ size = 'md', live = false }: { size?: 'xs' | 'sm' | 'md'; live?: boolean }) {
  return (
    <div className={`seal seal-${size}`} role="img" aria-label="P.21">
      <span className="seal-text">P.21</span>
      <span className="seal-mark">
        <Timeline />
        <Wave live={live} />
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

/** El día, con la marca chica debajo. La cuenta regresiva P.21/NN está guardada. */
export function Footer({ dayNumber }: { dayNumber: number }) {
  return (
    <footer className="shell-footer">
      <div className="marker marker-lg">
        <span className="footer-day">D{dayNumber}</span>
        <span className="marker-mark">
          <Timeline />
          <Wave />
        </span>
      </div>
    </footer>
  )
}
