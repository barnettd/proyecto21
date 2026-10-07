'use client'

import { useActionState, useEffect, useState } from 'react'
import { submitRiff, type SubmitState } from '@/app/actions'
import type { ArchiveEntry } from '@/lib/archive'
import { Wordmark } from '@/components/Brand'
import { TrackCard } from '@/components/TrackCard'
import type { SubmittedTrack } from '@/lib/types'

export type ArchiveDay = { n: number; label: string; title: string; line: string }
export type PendingItem = { title: string; text: string; status?: string }
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
  mission: {
    title: string
    text: string
    track?: SubmittedTrack
    track_label?: string
    link_label?: string
    link_placeholder?: string
    link_hint?: string
    cta: string
    skip?: string
  }
  pending: { title: string; text: string; cta: string; status_label?: string; items: PendingItem[] }
  voices: {
    title: string
    text: string
    question_label?: string
    question?: string
    note?: string
    hint?: string
    cta: string
    children: VoiceCard[]
  }
  gift: { title: string; text: string; clue: string; cta: string }
  track21: {
    eyebrow?: string
    title: string
    text: string
    emphasis?: string
    track: SubmittedTrack
    track_cta?: string
    cta: string
  }
  plus: { title: string; text: string; cta: string }
  finale: { text: string; signoff: string; playlist_label?: string; playlist_url?: string; mark: string }
}

type Step =
  | { kind: 'opening' }
  | { kind: 'archive' }
  | { kind: 'frankenstein' }
  | { kind: 'mission' }
  | { kind: 'pending' }
  | { kind: 'voices' }
  | { kind: 'gift' }
  | { kind: 'track21' }
  | { kind: 'plus' }
  | { kind: 'finale' }

const ORDER: Step[] = [
  { kind: 'opening' },
  { kind: 'archive' },
  { kind: 'frankenstein' },
  { kind: 'mission' },
  { kind: 'pending' },
  { kind: 'voices' },
  { kind: 'gift' },
  { kind: 'track21' },
  { kind: 'plus' },
  { kind: 'finale' },
]

const at = (s: Step) => ORDER.findIndex((o) => o.kind === s.kind)
/** Una vez que suena Track 21, el reproductor no se vuelve a montar. */
const WITH_PLAYER = new Set(['track21', 'plus', 'finale'])

/**
 * El cierre: lo que pasó, lo que no, y una canción que empieza hoy.
 * Lo único que recoge es el link al audio del riff, y es opcional.
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
  /** Lo que ella mandó cada día, con la ranura que llenó y lo que escribió. */
  archive: Record<number, ArchiveEntry[]>
  /** Si Frankenstein ya está respondido, la pantalla invita a seguir en vez de a entrar. */
  frankensteinDone?: boolean
  preview?: boolean
}) {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitRiff, { ok: false })
  const [step, setStep] = useState<Step>({ kind: 'opening' })
  const [riff, setRiff] = useState('')
  const [restored, setRestored] = useState(false)
  const draftKey = `p21-draft-${dayId}`

  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey)
      if (saved) {
        const p = JSON.parse(saved) as { step?: Step; riff?: string }
        if (typeof p.riff === 'string') setRiff(p.riff)
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
      localStorage.setItem(draftKey, JSON.stringify({ step, riff }))
    } catch {
      /* sin guardado */
    }
  }, [restored, draftKey, step, riff])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step])

  const next = () => setStep(ORDER[Math.min(at(step) + 1, ORDER.length - 1)])

  // Guardado el audio, la misión se cierra sola y el recorrido sigue.
  useEffect(() => {
    if (state.ok) setStep((s) => (s.kind === 'mission' ? { kind: 'pending' } : s))
  }, [state.ok])

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
                        {t.label && <span className="archive-slot">{t.label}</span>}
                        <span className="archive-track-title">{t.title}</span>
                        {t.artist && <span className="archive-track-artist">{t.artist}</span>}
                        {t.note && <span className="archive-note">«{t.note}»</span>}
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
          <a className="submit submit-link" href={f.url ?? '/frankenstein'}>
            {f.cta}
          </a>
        )}
      </section>
    )
  }

  if (step.kind === 'mission') {
    const m = config.mission
    content = (
      <form action={action} className="step">
        {preview && <input type="hidden" name="preview_day" value={dayId} />}
        <h2 className="bracket-title">{m.title}</h2>
        <p className="prose">{m.text}</p>
        {m.track && <TrackCard track={m.track} label={m.track_label} showLink={false} />}
        <label className="field field-boxed">
          <span className="visually-hidden">{m.link_label ?? 'Link al audio'}</span>
          <input
            name="riff_url"
            value={riff}
            onChange={(e) => setRiff(e.target.value)}
            inputMode="url"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={m.link_placeholder ?? 'Pegá acá el link al audio'}
          />
        </label>
        {m.link_hint && <p className="field-hint">{m.link_hint}</p>}
        {state.error && (
          <p className="form-error" role="alert">
            {state.error}
          </p>
        )}
        <button type="submit" className="submit" disabled={pending}>
          {pending ? 'Guardando…' : m.cta}
        </button>
        {state.error && m.skip && (
          <button type="button" className="link-button step-back" onClick={next}>
            {m.skip}
          </button>
        )}
      </form>
    )
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
    const v = config.voices
    content = (
      <section className="step">
        <h2 className="bracket-title">{v.title}</h2>
        <p className="prose">{v.text}</p>
        {v.question && (
          <div className="voices-question">
            {v.question_label && <p className="round-label">{v.question_label}</p>}
            <p className="voices-ask">{v.question}</p>
            {v.note && <p className="prose muted">{v.note}</p>}
          </div>
        )}
        {v.hint && <p className="prose">{v.hint}</p>}
        <ul className="voices-list">
          {v.children.map((c) => (
            <li key={c.name} className="voice-card">
              <p className="round-label">{c.name}</p>
              <TrackCard track={c.track} showLink={false} />
              {c.track.spotify_url && (
                <a
                  className="submit submit-link"
                  href={c.track.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ESCUCHAR EN SPOTIFY
                </a>
              )}
              {c.reason && <p className="voice-reason">{c.reason}</p>}
            </li>
          ))}
        </ul>
        <button type="button" className="submit" onClick={next}>
          {v.cta}
        </button>
      </section>
    )
  }

  if (step.kind === 'gift') {
    content = (
      <section className="step step-entry">
        <h2 className="bracket-title">{config.gift.title}</h2>
        <p className="prose">{config.gift.text}</p>
        <p className="gift-clue">{config.gift.clue}</p>
        <button type="button" className="submit" onClick={next}>
          {config.gift.cta}
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

  if (step.kind === 'plus') {
    content = (
      <section className="step final-plus">
        <h2 className="plus-title">{config.plus.title}</h2>
        <p className="prose">{config.plus.text}</p>
        <button type="button" className="submit" onClick={next}>
          {config.plus.cta}
        </button>
      </section>
    )
  }

  if (step.kind === 'finale') {
    content = (
      <section className="step step-entry final-end">
        <Wordmark size="lg" live />
        <p className="final-signoff">{config.finale.signoff}</p>
        <p className="prose">{config.finale.text}</p>
        {config.finale.playlist_url && (
          <a
            className="submit submit-link"
            href={config.finale.playlist_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {config.finale.playlist_label ?? 'ABRIR LA P.21 PLAYLIST'}
          </a>
        )}
        <p className="final-mark">{config.finale.mark}</p>
      </section>
    )
  }

  const bar = preview ? (
    <nav className="preview-bar" aria-label="Pantallas (vista previa)">
      {ORDER.map((s, n) => (
        <button key={n} type="button" className={at(s) === at(step) ? 'is-on' : ''} onClick={() => setStep(s)}>
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
