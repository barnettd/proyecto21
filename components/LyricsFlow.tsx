'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState, useTransition } from 'react'
import { mixLines, submitLyrics, type SubmitState } from '@/app/actions'
import { TrackCard } from '@/components/TrackCard'
import { TrackPicker } from '@/components/TrackPicker'
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
    /** Paso dos, una vez que dio por buena la suya. */
    title_prompt: string
    title_hint?: string
    title_placeholder?: string
    title_cta: string
  }
  deadline_note?: string
}

type Step =
  | { kind: 'opening' }
  | { kind: 'category'; i: number }
  | { kind: 'reveal' }
  | { kind: 'lab' }
  | { kind: 'kraken' }

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
  const [songTitle, setSongTitle] = useState('')
  const [naming, setNaming] = useState(false)
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
          songTitle: string
          naming: boolean
        }>
        if (Array.isArray(p.drafts) && p.drafts.length === config.categories.length) setDrafts(p.drafts)
        if (typeof p.kraken === 'string') setKraken(p.kraken)
        if (typeof p.songTitle === 'string') setSongTitle(p.songTitle)
        if (p.naming) setNaming(true)
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
      localStorage.setItem(draftKey, JSON.stringify({ step, drafts, kraken, songTitle, naming }))
    } catch {
      /* sin guardado */
    }
  }, [restored, draftKey, step, drafts, kraken, songTitle, naming])

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

  /** Le pide al laboratorio una base para arrancar, que ella después reescribe. */
  function assist() {
    setError(null)
    startWork(async () => {
      // Que no repita lo que ya tiene escrito.
      const result = await mixLines(hers, [kraken].filter(Boolean), preview ? dayId : undefined)
      const set = result.sets?.[0]
      if (result.error || !set?.length) {
        setError(result.error ?? 'No salió nada. Probá de nuevo.')
        return
      }
      setKraken(set[0].text.slice(0, krakenMax))
    })
  }

  const screens: Step[] = [
    { kind: 'opening' },
    ...config.categories.map((_, i): Step => ({ kind: 'category', i })),
    { kind: 'reveal' },
    { kind: 'lab' },
    { kind: 'kraken' },
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

  // step.kind === 'kraken': acá escribe la suya, le pone título y se guarda.
  {
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
          <input type="hidden" name="song_title" value={songTitle} />

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
              <button type="button" className="kraken-generate" disabled={busy} onClick={assist}>
                <span aria-hidden="true">✦</span> {busy ? config.kraken.generating : config.kraken.generate}
              </button>
              <span className="field-hint">
                {kraken.length}/{krakenMax}
              </span>
            </span>
          </label>

          {(error || state.error) && (
            <p className="form-error" role="alert">
              {error ?? state.error}
            </p>
          )}

          {naming && (
            <div className="kraken-naming">
              <label className="field field-boxed">
                <span className="module-question">{config.kraken.title_prompt}</span>
                <input
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value.slice(0, 80))}
                  placeholder={config.kraken.title_placeholder ?? 'El título'}
                  autoComplete="off"
                  autoFocus
                  // Enter en un campo suelto envía el formulario: acá cerraría el paso sin título.
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault()
                  }}
                />
              </label>
              {config.kraken.title_hint && <p className="field-hint">{config.kraken.title_hint}</p>}
            </div>
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
            type={naming ? 'submit' : 'button'}
            className="submit"
            disabled={!kraken.trim() || (naming && !songTitle.trim()) || busy || pending || state.ok}
            onClick={naming ? undefined : () => setNaming(true)}
          >
            {pending || state.ok ? 'Guardando…' : naming ? config.kraken.title_cta : config.kraken.cta}
          </button>
          {deadline}
        </form>
        {bar}
      </>
    )
  }
}


