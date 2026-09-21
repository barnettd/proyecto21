'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { submitMemory, type SubmitState } from '@/app/actions'
import { TrackCard } from '@/components/TrackCard'
import { TrackPicker } from '@/components/TrackPicker'
import { parseSpotifyTrackId } from '@/lib/spotify'
import type { SubmittedTrack } from '@/lib/types'

export type Fragment = {
  /** place | situation | person: también es la clave con la que se guarda. */
  key: string
  progress: string
  title: string
  /** Lo que dice P21 antes de mostrar la suya. */
  lead: string
  p21: { track: SubmittedTrack; note?: string }
  p21_cta: string
  /** Cuando es false, ella elige antes de ver la mía (el fragmento PERSONA). */
  p21_first?: boolean
  you: { title?: string; text: string; prompt: string; cta: string }
  reveal?: { label?: string; text?: string; cta: string }
}

export type MemoryConfig = {
  opening: { eyebrow?: string; title: string; lead: string; text?: string; cta: string; image?: string }
  intro: { title: string; text: string; cta: string }
  fragments: Fragment[]
  deadline_note?: string
  text_limit?: number
}

const LIMIT = 300

type Step = { kind: 'opening' } | { kind: 'intro' } | { kind: 'p21'; i: number } | { kind: 'you'; i: number } | { kind: 'reveal'; i: number }

const sameStep = (a: Step, b: Step) =>
  a.kind === b.kind && ('i' in a ? a.i : -1) === ('i' in b ? (b as { i: number }).i : -1)

/** El plazo, visible en todas las pantallas. */
function Deadline({ note }: { note?: string }) {
  return note ? <p className="deadline-note">{note}</p> : null
}

export function MemoryFlow({
  dayId,
  config,
  preview = false,
}: {
  dayId: string
  config: MemoryConfig
  preview?: boolean
}) {
  const router = useRouter()
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitMemory, { ok: false })
  const [step, setStep] = useState<Step>({ kind: 'opening' })
  const [childhood, setChildhood] = useState('')
  const [tracks, setTracks] = useState<string[]>(() => config.fragments.map(() => ''))
  const [texts, setTexts] = useState<string[]>(() => config.fragments.map(() => ''))
  const [restored, setRestored] = useState(false)
  const draftKey = `p21-draft-${dayId}`
  const limit = config.text_limit ?? LIMIT

  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey)
      if (saved) {
        const p = JSON.parse(saved) as { step?: Step; childhood?: string; tracks?: string[]; texts?: string[] }
        if (typeof p.childhood === 'string') setChildhood(p.childhood)
        if (Array.isArray(p.tracks) && p.tracks.length === config.fragments.length) setTracks(p.tracks.map(String))
        if (Array.isArray(p.texts) && p.texts.length === config.fragments.length) setTexts(p.texts.map(String))
        // Al volver, retoma donde quedó, pero nunca en la revelación: esa se gana.
        if (p.step && p.step.kind && p.step.kind !== 'reveal') setStep(p.step)
      }
    } catch {
      /* empieza de cero */
    } finally {
      setRestored(true)
    }
  }, [draftKey, config.fragments.length])

  useEffect(() => {
    if (!restored) return
    try {
      localStorage.setItem(draftKey, JSON.stringify({ step, childhood, tracks, texts }))
    } catch {
      /* sin guardado */
    }
  }, [restored, draftKey, step, childhood, tracks, texts])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step])

  // Al guardar, la última pantalla es la revelación; el cierre llega al refrescar.
  useEffect(() => {
    if (!state.ok) return
    try {
      localStorage.removeItem(draftKey)
    } catch {
      /* ignore */
    }
    setStep({ kind: 'reveal', i: config.fragments.length - 1 })
  }, [state.ok, draftKey, config.fragments.length])

  const ids = [childhood, ...tracks].map((v) => (v.trim() ? parseSpotifyTrackId(v) : null))
  const p21Ids = config.fragments.map((f) => (f.p21.track.spotify_url ? parseSpotifyTrackId(f.p21.track.spotify_url) : null))
  const repeated = (i: number) => {
    const id = ids[i]
    return Boolean(id) && (ids.indexOf(id) !== i || p21Ids.includes(id))
  }
  const trackReady = (i: number) => Boolean(ids[i]) && !repeated(i)
  const textReady = (i: number) => texts[i].trim().length > 0 && texts[i].length <= limit

  const errorFor = (i: number) =>
    repeated(i) ? (ids.indexOf(ids[i]) !== i ? 'Esta ya la elegiste hoy.' : 'Esa es una de las mías. Elegí otra.') : null

  const screens: Step[] = [
    { kind: 'opening' },
    { kind: 'intro' },
    ...config.fragments.flatMap((f, i): Step[] =>
      f.p21_first === false ? [{ kind: 'you', i }, { kind: 'reveal', i }] : [{ kind: 'p21', i }, { kind: 'you', i }],
    ),
  ]

  const bar = preview ? (
    <nav className="preview-bar" aria-label="Pantallas (vista previa)">
      {screens.map((s, n) => (
        <button
          key={n}
          type="button"
          className={sameStep(s, step) ? 'is-on' : ''}
          onClick={() => setStep(s)}
        >
          {n + 1}
        </button>
      ))}
    </nav>
  ) : null

  const afterYou = (i: number) => {
    const f = config.fragments[i]
    if (f.p21_first === false) return null // la última: guarda y revela
    const next = config.fragments[i + 1]
    return next ? ({ kind: next.p21_first === false ? 'you' : 'p21', i: i + 1 } as Step) : null
  }

  if (step.kind === 'opening') {
    return (
      <>
        <section className="step step-entry">
          {config.opening.eyebrow && <p className="eyebrow">{config.opening.eyebrow}</p>}
          <h1 className="bracket-title">{config.opening.title}</h1>
          <p className="prose">{config.opening.lead}</p>
          {config.opening.image && (
            <div className="banner banner-soft banner-tall">
              <Image src={config.opening.image} alt="" width={1066} height={1600} priority sizes="(max-width: 40rem) 100vw, 34rem" />
            </div>
          )}
          {config.opening.text && <p className="prose">{config.opening.text}</p>}
          <TrackPicker
            name="childhood"
            value={childhood}
            onChange={setChildhood}
            label="Link de Spotify de esa canción"
            error={errorFor(0)}
          />
          <Deadline note={config.deadline_note} />
          <button
            type="button"
            className="submit"
            disabled={!trackReady(0)}
            onClick={() => setStep({ kind: 'intro' })}
          >
            {config.opening.cta}
          </button>
        </section>
        {bar}
      </>
    )
  }

  if (step.kind === 'intro') {
    return (
      <>
        <section className="step step-entry">
          <h2 className="bracket-title">{config.intro.title}</h2>
          <p className="prose">{config.intro.text}</p>
          <Deadline note={config.deadline_note} />
          <button
            type="button"
            className="submit"
            onClick={() => setStep(config.fragments[0].p21_first === false ? { kind: 'you', i: 0 } : { kind: 'p21', i: 0 })}
          >
            {config.intro.cta}
          </button>
        </section>
        {bar}
      </>
    )
  }

  const f = config.fragments[step.i]

  if (step.kind === 'p21') {
    return (
      <>
        <section className="step">
          <p className="bracket-progress">{f.progress}</p>
          <h2 className="bracket-title">{f.title}</h2>
          <p className="prose">{f.lead}</p>
          <TrackCard track={f.p21.track} label="P.21" showLink={false} />
          {f.p21.note && <p className="prose memory-note">{f.p21.note}</p>}
          {f.p21.track.spotify_url && (
            <a className="submit submit-link" href={f.p21.track.spotify_url} target="_blank" rel="noopener noreferrer">
              ESCUCHAR EN SPOTIFY
            </a>
          )}
          <Deadline note={config.deadline_note} />
          <button type="button" className="submit submit-secondary" onClick={() => setStep({ kind: 'you', i: step.i })}>
            {f.p21_cta}
          </button>
        </section>
        {bar}
      </>
    )
  }

  if (step.kind === 'reveal') {
    return (
      <>
        <section className="step step-reveal">
          {f.reveal?.label && <p className="round-label">{f.reveal.label}</p>}
          {f.reveal?.text && <p className="prose">{f.reveal.text}</p>}
          <TrackCard track={f.p21.track} showLink={false} />
          {f.p21.note && <p className="prose memory-note">{f.p21.note}</p>}
          {f.p21.track.spotify_url && (
            <a className="submit submit-link" href={f.p21.track.spotify_url} target="_blank" rel="noopener noreferrer">
              ESCUCHAR EN SPOTIFY
            </a>
          )}
          <button type="button" className="submit submit-secondary" onClick={() => router.refresh()}>
            {f.reveal?.cta ?? 'CERRAR'}
          </button>
        </section>
        {bar}
      </>
    )
  }

  // step.kind === 'you'
  const i = step.i
  const last = i === config.fragments.length - 1
  const next = afterYou(i)
  // Al guardar viaja todo junto: si quedó algo atrás, hay que volver a buscarlo.
  const missing = last
    ? config.fragments.findIndex((_, n) => !trackReady(n + 1) || !textReady(n))
    : -1
  const ready = trackReady(i + 1) && textReady(i) && (!last || missing < 0)

  return (
    <>
      <form
        action={action}
        className="step"
        onSubmit={(e) => {
          // Solo el último fragmento guarda: los anteriores siguen de largo.
          if (next) {
            e.preventDefault()
            setStep(next)
          }
        }}
      >
        {preview && <input type="hidden" name="preview_day" value={dayId} />}
        <input type="hidden" name="track_childhood" value={childhood} />
        {config.fragments.map((fr, n) => (
          <input type="hidden" name={`track_${fr.key}`} value={tracks[n]} key={`t-${fr.key}`} />
        ))}
        {config.fragments.map((fr, n) => (
          <input type="hidden" name={`text_${fr.key}`} value={texts[n]} key={`x-${fr.key}`} />
        ))}

        <p className="bracket-progress">{f.progress}</p>
        <h2 className="bracket-title">{f.you.title ?? f.title}</h2>
        <p className="prose">{f.you.text}</p>

        <TrackPicker
          name={`visible_${f.key}`}
          value={tracks[i]}
          onChange={(v) => setTracks((old) => old.map((t, n) => (n === i ? v : t)))}
          label={`Link de Spotify para ${f.title.toLowerCase()}`}
          error={errorFor(i + 1)}
        />

        <label className="field memory-field">
          <span className="module-question">{f.you.prompt}</span>
          <textarea
            value={texts[i]}
            onChange={(e) => setTexts((old) => old.map((t, n) => (n === i ? e.target.value.slice(0, limit) : t)))}
            rows={4}
            maxLength={limit}
            placeholder="Escribí lo que te venga."
          />
          <span className="field-hint memory-count">
            {texts[i].length} / {limit}
          </span>
        </label>

        <Deadline note={config.deadline_note} />
        {missing >= 0 && missing !== i && (
          <p className="form-error">
            Falta completar {config.fragments[missing].title}.{' '}
            <button
              type="button"
              className="link-button"
              onClick={() => setStep({ kind: 'you', i: missing })}
            >
              Ir ahí
            </button>
          </p>
        )}
        {state.error && (
          <p className="form-error" role="alert">
            {state.error}
          </p>
        )}
        <button type="submit" className="submit" disabled={!ready || pending || state.ok}>
          {pending || state.ok ? 'Guardando…' : f.you.cta}
        </button>
      </form>
      {bar}
    </>
  )
}
