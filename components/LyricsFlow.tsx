'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState, useTransition } from 'react'
import { mixLines, submitLyrics, type SubmitState } from '@/app/actions'
import { TrackCard } from '@/components/TrackCard'
import { TrackPicker } from '@/components/TrackPicker'
import type { Line } from '@/lib/ai'
import { parseSpotifyTrackId } from '@/lib/spotify'
import type { SubmittedTrack } from '@/lib/types'

export type Category = { key: string; progress: string; title: string; text: string; cta: string }

export type LyricsConfig = {
  opening: { eyebrow?: string; title: string; text: string; cta: string }
  categories: Category[]
  excerpt: { prompt: string; placeholder?: string; max_chars?: number }
  reveal: { title: string; text: string; task: string; cta: string }
  /** Las tres mías, una por categoría, en el mismo orden. */
  reveal_fragments: Array<{ track: SubmittedTrack; excerpt: string }>
  lab: { title: string; text: string; note?: string; cta: string }
  kraken: {
    title: string
    rules: string
    placeholder?: string
    max_chars?: number
    reference_label: string
    generate: string
    generating: string
    cta: string
  }
  choose: {
    title: string
    text: string
    labels: { coherent: string; unexpected: string; absurd: string }
    again: string
    title_prompt: string
    title_placeholder?: string
    cta: string
    loading: string
  }
  deadline_note?: string
}

type Step =
  | { kind: 'opening' }
  | { kind: 'category'; i: number }
  | { kind: 'reveal' }
  | { kind: 'lab' }
  | { kind: 'kraken' }
  | { kind: 'choose' }

type Draft = { link: string; excerpt: string }

const same = (a: Step, b: Step) =>
  a.kind === b.kind && ('i' in a ? a.i : -1) === ('i' in b ? (b as { i: number }).i : -1)

export function LyricsFlow({
  dayId,
  config,
  preview = false,
}: {
  dayId: string
  config: LyricsConfig
  preview?: boolean
}) {
  const router = useRouter()
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitLyrics, { ok: false })
  const [step, setStep] = useState<Step>({ kind: 'opening' })
  const [drafts, setDrafts] = useState<Draft[]>(() => config.categories.map(() => ({ link: '', excerpt: '' })))
  const [kraken, setKraken] = useState('')
  const [options, setOptions] = useState<Line[]>([])
  const [chosen, setChosen] = useState<string | null>(null)
  const [songTitle, setSongTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, startWork] = useTransition()
  const [restored, setRestored] = useState(false)
  const draftKey = `p21-draft-${dayId}`

  const maxChars = config.excerpt.max_chars ?? 200
  const krakenMax = config.kraken.max_chars ?? 300

  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey)
      if (raw) {
        const p = JSON.parse(raw) as Partial<{
          step: Step
          drafts: Draft[]
          kraken: string
          options: Line[]
          chosen: string
          songTitle: string
        }>
        if (Array.isArray(p.drafts) && p.drafts.length === config.categories.length) setDrafts(p.drafts)
        if (typeof p.kraken === 'string') setKraken(p.kraken)
        if (Array.isArray(p.options)) setOptions(p.options)
        if (typeof p.chosen === 'string') setChosen(p.chosen)
        if (typeof p.songTitle === 'string') setSongTitle(p.songTitle)
        if (p.step?.kind) setStep(p.step)
      }
    } catch {
      /* de cero */
    } finally {
      setRestored(true)
    }
  }, [draftKey, config.categories.length])

  useEffect(() => {
    if (!restored) return
    try {
      localStorage.setItem(draftKey, JSON.stringify({ step, drafts, kraken, options, chosen, songTitle }))
    } catch {
      /* sin guardado */
    }
  }, [restored, draftKey, step, drafts, kraken, options, chosen, songTitle])

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

  const ready = (i: number) =>
    Boolean(parseSpotifyTrackId(drafts[i].link)) && drafts[i].excerpt.trim().length > 0
  const missing = config.categories.findIndex((_, i) => !ready(i))

  const hers = drafts.map((d, i) => ({
    id: `u${i + 1}`,
    owner: 'her' as const,
    link: d.link,
    excerpt: d.excerpt.trim(),
  }))

  /** Las seis frases, con el nombre de su categoría, para mostrar como referencia. */
  const six = [
    ...config.categories.map((c, i) => ({ label: c.title, excerpt: drafts[i].excerpt.trim(), mine: false })),
    ...config.reveal_fragments.map((f, i) => ({
      label: config.categories[i]?.title ?? 'P.21',
      excerpt: f.excerpt,
      mine: true,
    })),
  ].filter((f) => f.excerpt)

  /** Le pide una línea al laboratorio: para asistir, o para las tres finales. */
  function ask(what: 'assist' | 'options') {
    setError(null)
    startWork(async () => {
      // Que no repita ni lo que ella tiene escrito ni lo ya mostrado.
      const avoid = [kraken, ...options.map((o) => o.text)].filter(Boolean)
      const result = await mixLines(hers, avoid, preview ? dayId : undefined)
      const set = result.sets?.[0]
      if (result.error || !set?.length) {
        setError(result.error ?? 'No salió nada. Probá de nuevo.')
        return
      }
      if (what === 'assist') setKraken(set[0].text.slice(0, krakenMax))
      else {
        setOptions(set)
        setChosen(null)
      }
    })
  }

  const screens: Step[] = [
    { kind: 'opening' },
    ...config.categories.map((_, i): Step => ({ kind: 'category', i })),
    { kind: 'reveal' },
    { kind: 'lab' },
    { kind: 'kraken' },
    { kind: 'choose' },
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
          <button type="button" className="submit" onClick={() => setStep({ kind: 'category', i: 0 })}>
            {config.opening.cta}
          </button>
          {deadline}
        </section>
        {bar}
      </>
    )
  }

  if (step.kind === 'category') {
    const i = step.i
    const c = config.categories[i]
    const d = drafts[i]
    const last = i === config.categories.length - 1
    const set = (patch: Partial<Draft>) => setDrafts((old) => old.map((x, j) => (j === i ? { ...x, ...patch } : x)))
    return (
      <>
        <section className="step">
          <p className="bracket-progress">{c.progress}</p>
          <h2 className="bracket-title">{c.title}</h2>
          <p className="prose">{c.text}</p>
          <TrackPicker
            name={`track_${c.key}`}
            value={d.link}
            onChange={(v) => set({ link: v })}
            label={`Link de Spotify para ${c.title.toLowerCase()}`}
          />
          <label className="field memory-field">
            <span className="module-question">{config.excerpt.prompt}</span>
            <textarea
              value={d.excerpt}
              onChange={(e) => set({ excerpt: e.target.value.slice(0, maxChars) })}
              rows={3}
              placeholder={config.excerpt.placeholder ?? 'Copiala tal cual suena.'}
            />
            <span className="field-hint memory-count">
              {d.excerpt.length}/{maxChars}
            </span>
          </label>
          <button
            type="button"
            className="submit"
            disabled={!ready(i)}
            onClick={() => setStep(last ? { kind: 'reveal' } : { kind: 'category', i: i + 1 })}
          >
            {c.cta}
          </button>
          {i > 0 && (
            <button
              type="button"
              className="link-button step-back"
              onClick={() => setStep({ kind: 'category', i: i - 1 })}
            >
              Volver
            </button>
          )}
          {deadline}
        </section>
        {bar}
      </>
    )
  }

  if (step.kind === 'reveal') {
    return (
      <>
        <section className="step">
          <h2 className="bracket-title">{config.reveal.title}</h2>
          <p className="prose">{config.reveal.text}</p>
          {config.reveal_fragments.map((f, i) => (
            <div className="lyric-card" key={i}>
              <p className="round-label">{config.categories[i]?.title ?? 'P.21'}</p>
              <p className="lyric-text">«{f.excerpt}»</p>
              <TrackCard track={f.track} showLink={false} />
            </div>
          ))}
          <p className="prose lyric-task">{config.reveal.task}</p>
          <button type="button" className="submit" onClick={() => setStep({ kind: 'lab' })}>
            {config.reveal.cta}
          </button>
          {deadline}
        </section>
        {bar}
      </>
    )
  }

  if (step.kind === 'lab') {
    return (
      <>
        <section className="step step-entry">
          <h2 className="bracket-title">{config.lab.title}</h2>
          <p className="prose">{config.lab.text}</p>
          {config.lab.note && <p className="field-hint">{config.lab.note}</p>}
          <button type="button" className="submit" disabled={missing >= 0} onClick={() => setStep({ kind: 'kraken' })}>
            {config.lab.cta}
          </button>
          {missing >= 0 && (
            <p className="form-error">
              Falta la frase de {config.categories[missing].title}.{' '}
              <button type="button" className="link-button" onClick={() => setStep({ kind: 'category', i: missing })}>
                Ir ahí
              </button>
            </p>
          )}
          {deadline}
        </section>
        {bar}
      </>
    )
  }

  if (step.kind === 'kraken') {
    return (
      <>
        <section className="step">
          <h2 className="bracket-title">{config.kraken.title}</h2>
          <p className="prose">{config.kraken.rules}</p>

          <label className="field memory-field kraken-field">
            <span className="visually-hidden">{config.kraken.title}</span>
            <textarea
              value={kraken}
              onChange={(e) => setKraken(e.target.value.slice(0, krakenMax))}
              rows={4}
              placeholder={config.kraken.placeholder ?? 'Escribí la tuya.'}
            />
            <span className="kraken-tools">
              <button type="button" className="kraken-generate" disabled={busy} onClick={() => ask('assist')}>
                <span aria-hidden="true">✦</span> {busy ? config.kraken.generating : config.kraken.generate}
              </button>
              <span className="field-hint">
                {kraken.length}/{krakenMax}
              </span>
            </span>
          </label>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <p className="round-label">{config.kraken.reference_label}</p>
          <ul className="lyric-reference">
            {six.map((f, i) => (
              <li key={i} className={f.mine ? 'is-mine' : ''}>
                <span className="lyric-reference-label">{f.label}</span>
                <span>«{f.excerpt}»</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="submit"
            disabled={!kraken.trim() || busy}
            onClick={() => {
              setStep({ kind: 'choose' })
              if (!options.length) ask('options')
            }}
          >
            {config.kraken.cta}
          </button>
          {deadline}
        </section>
        {bar}
      </>
    )
  }

  // step.kind === 'choose'
  return (
    <>
      <form action={action} className="step">
        {preview && <input type="hidden" name="preview_day" value={dayId} />}
        <input
          type="hidden"
          name="fragments"
          value={JSON.stringify(hers.map((h) => ({ link: h.link, excerpt: h.excerpt })))}
        />
        <input type="hidden" name="kraken" value={kraken} />
        <input type="hidden" name="chosen" value={chosen ?? ''} />
        <input type="hidden" name="song_title" value={songTitle} />

        <h2 className="bracket-title">{config.choose.title}</h2>
        <p className="prose">{config.choose.text}</p>

        {busy && !options.length && <p className="field-hint">{config.choose.loading}</p>}

        {options.map((line) => (
          <button
            type="button"
            key={line.text}
            className={`lyric-card lyric-option${chosen === line.text ? ' is-on' : ''}`}
            onClick={() => setChosen(line.text)}
          >
            <span className="round-label">{config.choose.labels[line.mode]}</span>
            <span className="lyric-text">{line.text}</span>
          </button>
        ))}

        {options.length > 0 && (
          <button type="button" className="link-button" disabled={busy} onClick={() => ask('options')}>
            {busy ? config.choose.loading : config.choose.again}
          </button>
        )}

        {chosen && (
          <label className="field field-boxed">
            <span className="module-question">{config.choose.title_prompt}</span>
            <input
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value.slice(0, 80))}
              placeholder={config.choose.title_placeholder ?? 'El título'}
              autoComplete="off"
            />
          </label>
        )}

        {(error || state.error) && (
          <p className="form-error" role="alert">
            {error ?? state.error}
          </p>
        )}

        <button type="submit" className="submit" disabled={!chosen || pending || state.ok}>
          {pending || state.ok ? 'Guardando…' : config.choose.cta}
        </button>
        <button type="button" className="link-button step-back" onClick={() => setStep({ kind: 'kraken' })}>
          Volver
        </button>
        {deadline}
      </form>
      {bar}
    </>
  )
}
