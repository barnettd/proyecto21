'use client'

import { useEffect, useState } from 'react'
import { Seal, Wordmark } from '@/components/Brand'
import { TrackCard } from '@/components/TrackCard'
import type { SubmittedTrack } from '@/lib/types'

export type ArchiveDay = { n: number; label: string; title: string; line: string }
export type PendingItem = { title: string; text: string; status?: string; note?: string }
export type VoiceCard = { name: string; reason?: string; track: SubmittedTrack }

export type FinalConfig = {
  opening: { title: string; text: string; cta: string }
  archive: { title: string; text?: string; cta: string; empty?: string; days: ArchiveDay[] }
  frankenstein: {
    title: string
    text: string
    cta: string
    url?: string
    done_title?: string
    done_text?: string
    done_cta: string
  }
  guitar: {
    intro: { title: string; text: string; cta: string }
    challenge: { title: string; text: string; track?: SubmittedTrack; track_label?: string; cta: string }
    done: { title: string; text?: string; cta: string }
  }
  pending: { title: string; text: string; cta: string; status_label?: string; items: PendingItem[] }
  voices: { title: string; text: string; cta: string; children: VoiceCard[] }
  key: { title: string; text: string; cta: string; reveal: { text: string; note?: string; cta: string } }
  track21: {
    eyebrow?: string
    title: string
    text: string
    emphasis?: string
    track: SubmittedTrack
    track_cta?: string
    cta: string
  }
  finale: { title: string; text: string; signoff: string; mark: string; cta: string }
  plus: { title: string; text: string }
}

type Step =
  | { kind: 'opening' }
  | { kind: 'archive' }
  | { kind: 'frankenstein' }
  | { kind: 'guitar'; i: number }
  | { kind: 'pending' }
  | { kind: 'voices' }
  | { kind: 'key' }
  | { kind: 'key_open' }
  | { kind: 'track21' }
  | { kind: 'finale' }
  | { kind: 'plus' }

const ORDER: Step[] = [
  { kind: 'opening' },
  { kind: 'archive' },
  { kind: 'frankenstein' },
  { kind: 'guitar', i: 0 },
  { kind: 'guitar', i: 1 },
  { kind: 'guitar', i: 2 },
  { kind: 'pending' },
  { kind: 'voices' },
  { kind: 'key' },
  { kind: 'key_open' },
  { kind: 'track21' },
  { kind: 'finale' },
  { kind: 'plus' },
]

const at = (s: Step) => ORDER.findIndex((o) => o.kind === s.kind && ('i' in o ? o.i : -1) === ('i' in s ? s.i : -1))
const same = (a: Step, b: Step) => at(a) === at(b)
/** Una vez que suena Track 21, el reproductor no se vuelve a montar. */
const WITH_PLAYER = new Set(['track21', 'finale', 'plus'])

/**
 * El cierre: lo que pasó, lo que quedó abierto, lo que no llegó a pasar,
 * y una canción que empieza hoy. No pide nada: se camina de a una pantalla.
 */
export function FinalFlow({
  dayId,
  config,
  archive,
  frankensteinDone = false,
  preview = false,
}: {
  dayId: string
  config: FinalConfig
  /** Lo que ella mandó cada día, por número de día. */
  archive: Record<number, SubmittedTrack[]>
  /** Si D8 ya está respondido, la pantalla invita a seguir en vez de a entrar. */
  frankensteinDone?: boolean
  preview?: boolean
}) {
  const [step, setStep] = useState<Step>({ kind: 'opening' })
  const [restored, setRestored] = useState(false)
  const draftKey = `p21-draft-${dayId}`

  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey)
      if (saved) {
        const p = JSON.parse(saved) as { step?: Step }
        if (p.step?.kind && at(p.step) >= 0) setStep(p.step)
      }
    } catch {
      /* de cero */
    } finally {
      setRestored(true)
    }
  }, [draftKey])

  useEffect(() => {
    if (!restored) return
    try {
      localStorage.setItem(draftKey, JSON.stringify({ step }))
    } catch {
      /* sin guardado */
    }
  }, [restored, draftKey, step])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step])

  const next = () => setStep(ORDER[Math.min(at(step) + 1, ORDER.length - 1)])

  let content: React.ReactNode = null

  if (step.kind === 'opening') {
    content = (
      <section className="step step-entry final-opening">
        <Wordmark size="lg" live />
        <h1 className="visually-hidden">{config.opening.title}</h1>
        <p className="prose">{config.opening.text}</p>
        <button type="button" className="submit" onClick={next}>
          {config.opening.cta}
        </button>
      </section>
    )
  }

  if (step.kind === 'archive') {
    content = (
      <section className="step">
        <h2 className="bracket-title">{config.archive.title}</h2>
        {config.archive.text && <p className="prose">{config.archive.text}</p>}
        <ol className="archive-list">
          {config.archive.days.map((d) => {
            const hers = archive[d.n] ?? []
            return (
              <li key={d.n} className="archive-item">
                <p className="archive-label">
                  <span className="archive-day">{d.label}</span>
                  <span className="archive-title">{d.title}</span>
                </p>
                <p className="archive-line">{d.line}</p>
                {hers.length > 0 ? (
                  <ul className="archive-tracks">
                    {hers.map((t, i) => (
                      <li key={i}>
                        <span className="archive-track-title">{t.title ?? 'Una canción'}</span>
                        {t.artist && <span className="archive-track-artist">{t.artist}</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  config.archive.empty && <p className="archive-empty">{config.archive.empty}</p>
                )}
              </li>
            )
          })}
        </ol>
        <button type="button" className="submit" onClick={next}>
          {config.archive.cta}
        </button>
      </section>
    )
  }

  if (step.kind === 'frankenstein') {
    const f = config.frankenstein
    content = (
      <section className="step step-entry">
        <h2 className="bracket-title">{frankensteinDone ? (f.done_title ?? f.title) : f.title}</h2>
        <p className="prose">{frankensteinDone ? (f.done_text ?? f.text) : f.text}</p>
        {frankensteinDone ? (
          <button type="button" className="submit" onClick={next}>
            {f.done_cta}
          </button>
        ) : (
          <>
            <a className="submit submit-link" href={f.url ?? '/frankenstein'}>
              {f.cta}
            </a>
            <button type="button" className="link-button step-back" onClick={next}>
              {f.done_cta}
            </button>
          </>
        )}
      </section>
    )
  }

  if (step.kind === 'guitar') {
    const g = config.guitar
    if (step.i === 0) {
      content = (
        <section className="step step-entry">
          <h2 className="bracket-title">{g.intro.title}</h2>
          <p className="prose">{g.intro.text}</p>
          <button type="button" className="submit" onClick={next}>
            {g.intro.cta}
          </button>
        </section>
      )
    } else if (step.i === 1) {
      content = (
        <section className="step">
          <h2 className="bracket-title">{g.challenge.title}</h2>
          <p className="prose">{g.challenge.text}</p>
          {g.challenge.track && (
            <TrackCard track={g.challenge.track} label={g.challenge.track_label} showLink={false} />
          )}
          <button type="button" className="submit" onClick={next}>
            {g.challenge.cta}
          </button>
        </section>
      )
    } else {
      content = (
        <section className="step step-entry">
          <Seal size="sm" />
          <h2 className="bracket-title">{g.done.title}</h2>
          {g.done.text && <p className="prose">{g.done.text}</p>}
          <button type="button" className="submit" onClick={next}>
            {g.done.cta}
          </button>
        </section>
      )
    }
  }

  if (step.kind === 'pending') {
    content = (
      <section className="step">
        <h2 className="bracket-title">{config.pending.title}</h2>
        <p className="prose">{config.pending.text}</p>
        <ul className="pending-list">
          {config.pending.items.map((item) => (
            <li key={item.title} className="pending-card">
              <p className="pending-status">{item.status ?? config.pending.status_label ?? 'NO LLEGÓ A SUCEDER'}</p>
              <p className="pending-title">{item.title}</p>
              <p className="pending-text">{item.text}</p>
              {item.note && <p className="pending-note">{item.note}</p>}
            </li>
          ))}
        </ul>
        <button type="button" className="submit" onClick={next}>
          {config.pending.cta}
        </button>
      </section>
    )
  }

  if (step.kind === 'voices') {
    content = (
      <section className="step">
        <h2 className="bracket-title">{config.voices.title}</h2>
        <p className="prose">{config.voices.text}</p>
        <ul className="voices-list">
          {config.voices.children.map((c) => (
            <li key={c.name} className="voice-card">
              <p className="round-label">{c.name}</p>
              <TrackCard track={c.track} showLink={false} />
              {c.reason && <p className="voice-reason">{c.reason}</p>}
            </li>
          ))}
        </ul>
        <button type="button" className="submit" onClick={next}>
          {config.voices.cta}
        </button>
      </section>
    )
  }

  if (step.kind === 'key') {
    content = (
      <section className="step step-entry">
        <h2 className="bracket-title">{config.key.title}</h2>
        <p className="prose">{config.key.text}</p>
        <button type="button" className="submit" onClick={next}>
          {config.key.cta}
        </button>
      </section>
    )
  }

  if (step.kind === 'key_open') {
    content = (
      <section className="step step-entry">
        <p className="prose key-line">{config.key.reveal.text}</p>
        {config.key.reveal.note && <p className="prose muted">{config.key.reveal.note}</p>}
        <button type="button" className="submit" onClick={next}>
          {config.key.reveal.cta}
        </button>
      </section>
    )
  }

  if (step.kind === 'track21') {
    const t = config.track21
    content = (
      <section className="step">
        {t.eyebrow && <p className="eyebrow">{t.eyebrow}</p>}
        <h2 className="bracket-title">{t.title}</h2>
        <p className="prose">{t.text}</p>
        {t.emphasis && <p className="prose closing-emphasis">{t.emphasis}</p>}
      </section>
    )
  }

  if (step.kind === 'finale') {
    content = (
      <section className="step step-entry final-end">
        <Wordmark size="lg" live />
        <h2 className="visually-hidden">{config.finale.title}</h2>
        <p className="prose">{config.finale.text}</p>
        <p className="final-signoff">{config.finale.signoff}</p>
        <p className="final-mark">{config.finale.mark}</p>
        <button type="button" className="link-button final-next" onClick={next}>
          {config.finale.cta}
        </button>
      </section>
    )
  }

  if (step.kind === 'plus') {
    content = (
      <section className="step step-entry final-plus">
        <h2 className="plus-title">{config.plus.title}</h2>
        <p className="plus-text">{config.plus.text}</p>
      </section>
    )
  }

  const bar = preview ? (
    <nav className="preview-bar" aria-label="Pantallas (vista previa)">
      {ORDER.map((s, n) => (
        <button key={n} type="button" className={same(s, step) ? 'is-on' : ''} onClick={() => setStep(s)}>
          {n + 1}
        </button>
      ))}
    </nav>
  ) : null

  // El reproductor vive fuera de la pantalla activa: así la canción no se corta al avanzar.
  const playing = WITH_PLAYER.has(step.kind)
  return (
    <>
      {content}
      {playing && (
        <div className={`t21-player${step.kind === 'track21' ? '' : ' is-tucked'}`}>
          <TrackCard track={config.track21.track} showLink={false} />
          {step.kind === 'track21' && (
            <>
              {config.track21.track.spotify_url && (
                <a
                  className="submit submit-link"
                  href={config.track21.track.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {config.track21.track_cta ?? 'ESCUCHAR EN SPOTIFY'}
                </a>
              )}
              <button type="button" className="submit submit-secondary" onClick={next}>
                {config.track21.cta}
              </button>
            </>
          )}
        </div>
      )}
      {bar}
    </>
  )
}
