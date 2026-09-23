'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { submitScenarios, type SubmitState } from '@/app/actions'
import { TrackCard } from '@/components/TrackCard'
import { TrackPicker } from '@/components/TrackPicker'
import { parseSpotifyTrackId } from '@/lib/spotify'
import type { SubmittedTrack } from '@/lib/types'

export type Scenario = { key: string; progress: string; title: string; text: string; question: string; cta: string }

export type ScenariosConfig = {
  opening: { eyebrow?: string; title: string; text: string; cta: string }
  example: { title?: string; label?: string; scene: string; track_label?: string; track: SubmittedTrack; cta: string }
  scenarios: Scenario[]
  transition: { title: string; text: string; cta: string }
  mission: { title: string; text: string; cta: string }
  challenge: {
    title: string
    text: string
    /** La canción original, para tenerla presente. */
    track?: SubmittedTrack
    track_label?: string
    /** Materiales para aprender el loop; cualquiera puede faltar. */
    video?: string
    /** El mismo video en YouTube, por si el reproductor incrustado falla. */
    video_url?: string
    video_note?: string
    audio?: string
    audio_label?: string
    reference?: string
    reference_label?: string
    /** Material opcional, para quien quiera seguir más allá del loop. */
    extra?: string
    extra_label?: string
    help_url?: string
    help_label?: string
    cta: string
  }
  deadline_note?: string
}

type Step =
  | { kind: 'opening' }
  | { kind: 'example' }
  | { kind: 'scenario'; i: number }
  | { kind: 'transition' }
  | { kind: 'mission' }
  | { kind: 'challenge' }

const same = (a: Step, b: Step) => a.kind === b.kind && ('i' in a ? a.i : -1) === ('i' in b ? (b as { i: number }).i : -1)

/** D7: cuatro escenas cotidianas con su canción, y una misión que queda abierta. */
export function ScenariosFlow({
  dayId,
  config,
  preview = false,
}: {
  dayId: string
  config: ScenariosConfig
  preview?: boolean
}) {
  const router = useRouter()
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitScenarios, { ok: false })
  const [step, setStep] = useState<Step>({ kind: 'opening' })
  const [tracks, setTracks] = useState<string[]>(() => config.scenarios.map(() => ''))
  const [restored, setRestored] = useState(false)
  const draftKey = `p21-draft-${dayId}`

  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey)
      if (saved) {
        const p = JSON.parse(saved) as { step?: Step; tracks?: string[] }
        if (Array.isArray(p.tracks) && p.tracks.length === config.scenarios.length) setTracks(p.tracks.map(String))
        if (p.step?.kind) setStep(p.step)
      }
    } catch {
      /* de cero */
    } finally {
      setRestored(true)
    }
  }, [draftKey, config.scenarios.length])

  useEffect(() => {
    if (!restored) return
    try {
      localStorage.setItem(draftKey, JSON.stringify({ step, tracks }))
    } catch {
      /* sin guardado */
    }
  }, [restored, draftKey, step, tracks])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step])

  useEffect(() => {
    if (!state.ok) return
    try {
      localStorage.removeItem(draftKey)
    } catch {
      /* ignore */
    }
    router.refresh()
  }, [state.ok, draftKey, router])

  const ids = tracks.map((v) => (v.trim() ? parseSpotifyTrackId(v) : null))
  const exampleId = config.example.track.spotify_url ? parseSpotifyTrackId(config.example.track.spotify_url) : null
  const repeated = (i: number) => Boolean(ids[i]) && (ids.indexOf(ids[i]) !== i || ids[i] === exampleId)
  const ready = (i: number) => Boolean(ids[i]) && !repeated(i)
  const missing = config.scenarios.findIndex((_, i) => !ready(i))

  const screens: Step[] = [
    { kind: 'opening' },
    { kind: 'example' },
    ...config.scenarios.map((_, i): Step => ({ kind: 'scenario', i })),
    { kind: 'transition' },
    { kind: 'mission' },
    { kind: 'challenge' },
  ]

  const bar = preview ? (
    <nav className="preview-bar" aria-label="Pantallas (vista previa)">
      {screens.map((s, n) => (
        <button key={n} type="button" className={same(s, step) ? 'is-on' : ''} onClick={() => setStep(s)}>
          {n + 1}
        </button>
      ))}
    </nav>
  ) : null

  const deadline = config.deadline_note ? <p className="deadline-note">{config.deadline_note}</p> : null

  if (step.kind === 'opening') {
    return (
      <>
        <section className="step step-entry">
          {config.opening.eyebrow && <p className="eyebrow">{config.opening.eyebrow}</p>}
          <h1 className="bracket-title">{config.opening.title}</h1>
          <p className="prose">{config.opening.text}</p>
          <button type="button" className="submit" onClick={() => setStep({ kind: 'example' })}>
            {config.opening.cta}
          </button>
          {deadline}
        </section>
        {bar}
      </>
    )
  }

  if (step.kind === 'example') {
    return (
      <>
        <section className="step">
          {config.example.label && <p className="round-label">{config.example.label}</p>}
          {config.example.title && <h2 className="bracket-title">{config.example.title}</h2>}
          <p className="prose">{config.example.scene}</p>
          <TrackCard track={config.example.track} label={config.example.track_label} showLink={false} />
          {config.example.track.spotify_url && (
            <a className="submit submit-link" href={config.example.track.spotify_url} target="_blank" rel="noopener noreferrer">
              ESCUCHAR EN SPOTIFY
            </a>
          )}
          <button type="button" className="submit submit-secondary" onClick={() => setStep({ kind: 'scenario', i: 0 })}>
            {config.example.cta}
          </button>
          {deadline}
        </section>
        {bar}
      </>
    )
  }

  if (step.kind === 'scenario') {
    const i = step.i
    const s = config.scenarios[i]
    const next: Step = i + 1 < config.scenarios.length ? { kind: 'scenario', i: i + 1 } : { kind: 'transition' }
    return (
      <>
        <section className="step">
          <p className="bracket-progress">{s.progress}</p>
          <h2 className="bracket-title">{s.title}</h2>
          <p className="prose">{s.text}</p>
          <p className="module-question">{s.question}</p>
          <TrackPicker
            name={`visible_${s.key}`}
            value={tracks[i]}
            onChange={(v) => setTracks((old) => old.map((t, n) => (n === i ? v : t)))}
            label={`Link de Spotify para ${s.title.toLowerCase()}`}
            error={repeated(i) ? (ids[i] === exampleId ? 'Esa es la mía. Elegí otra.' : 'Esta ya la elegiste hoy.') : null}
          />
          <button type="button" className="submit" disabled={!ready(i)} onClick={() => setStep(next)}>
            {s.cta}
          </button>
          {i > 0 && (
            <button type="button" className="link-button step-back" onClick={() => setStep({ kind: 'scenario', i: i - 1 })}>
              Volver
            </button>
          )}
          {deadline}
        </section>
        {bar}
      </>
    )
  }

  if (step.kind === 'transition' || step.kind === 'mission') {
    const block = step.kind === 'transition' ? config.transition : config.mission
    const next: Step = step.kind === 'transition' ? { kind: 'mission' } : { kind: 'challenge' }
    return (
      <>
        <section className="step step-entry">
          <h2 className="bracket-title">{block.title}</h2>
          <p className="prose">{block.text}</p>
          <button type="button" className="submit" onClick={() => setStep(next)}>
            {block.cta}
          </button>
          {deadline}
        </section>
        {bar}
      </>
    )
  }

  // step.kind === 'challenge': acá se guarda todo.
  const c = config.challenge
  return (
    <>
      <form action={action} className="step">
        {preview && <input type="hidden" name="preview_day" value={dayId} />}
        {config.scenarios.map((s, n) => (
          <input type="hidden" name={`track_${s.key}`} value={tracks[n]} key={s.key} />
        ))}

        <h2 className="bracket-title">{c.title}</h2>
        <p className="prose">{c.text}</p>

        {c.track && <TrackCard track={c.track} label={c.track_label} showLink={false} />}

        {c.video && (
          <div className="riff-video">
            <iframe src={c.video} title="El riff" allow="encrypted-media; picture-in-picture" allowFullScreen loading="lazy" />
          </div>
        )}
        {c.video_url && (
          <a className="link-button riff-link" href={c.video_url} target="_blank" rel="noopener noreferrer">
            {c.video_note ?? 'Si el video no carga, abrilo en YouTube'}
          </a>
        )}
        {c.audio && (
          <div className="riff-audio">
            {c.audio_label && <p className="field-hint">{c.audio_label}</p>}
            <audio src={c.audio} controls loop preload="none" />
          </div>
        )}
        {c.reference && (
          <a className="link-button riff-link" href={c.reference} target="_blank" rel="noopener noreferrer">
            {c.reference_label ?? 'Ver la digitación'}
          </a>
        )}
        {c.extra && (
          <a className="link-button riff-link" href={c.extra} target="_blank" rel="noopener noreferrer">
            {c.extra_label ?? 'El riff completo'}
          </a>
        )}
        {c.help_url && (
          <a className="link-button riff-link" href={c.help_url} target="_blank" rel="noopener noreferrer">
            {c.help_label ?? 'Si necesitás ayuda'}
          </a>
        )}

        {missing >= 0 && (
          <p className="form-error">
            Falta la canción de {config.scenarios[missing].title}.{' '}
            <button type="button" className="link-button" onClick={() => setStep({ kind: 'scenario', i: missing })}>
              Ir ahí
            </button>
          </p>
        )}
        {state.error && (
          <p className="form-error" role="alert">
            {state.error}
          </p>
        )}
        <button type="submit" className="submit" disabled={missing >= 0 || pending || state.ok}>
          {pending || state.ok ? 'Guardando…' : c.cta}
        </button>
        {deadline}
      </form>
      {bar}
    </>
  )
}
