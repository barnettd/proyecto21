'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { submitPrintable, verifyPhrase, type SubmitState } from '@/app/actions'
import { TrackPicker } from '@/components/TrackPicker'
import { parseSpotifyTrackId } from '@/lib/spotify'

export type PrintableConfig = {
  entry: { title: string; text: string; cta: string; note?: string; fine_print?: string; continue_cta: string }
  printable: { url: string; filename?: string }
  /** La frase escondida en el imprimible. `answer` nunca llega al navegador. */
  phrase?: {
    title: string
    text: string
    placeholder?: string
    cta: string
    /** Uno por intento; el último se repite. Los primeros no dan pistas. */
    errors: string[]
    /** Aparece recién después de varios intentos. */
    hint?: string
    /** Salida para que no quede trabada. Aparece más tarde todavía. */
    skip?: string
    /** Solo del lado del servidor: se quita antes de mandar la config al navegador. */
    answer?: undefined
  }
  /** Lo que ve al acertar: la frase, y el preámbulo de la pregunta que sigue. */
  solved?: { title: string; text: string; cta: string }
  reveal: { title: string; text: string; prompt: string; cta: string }
  deadline_note?: string
}

type Step = 'landing' | 'phrase' | 'solved' | 'answer'

const HINT_AFTER = 3
const SKIP_AFTER = 5

export function PrintableFlow({
  dayId,
  config,
  preview = false,
}: {
  dayId: string
  config: PrintableConfig
  preview?: boolean
}) {
  const router = useRouter()
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitPrintable, { ok: false })
  const [step, setStep] = useState<Step>('landing')
  const [opened, setOpened] = useState(false)
  const [track, setTrack] = useState('')
  const [guess, setGuess] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [solved, setSolved] = useState(false)
  const [wrong, setWrong] = useState(false)
  const [checking, setChecking] = useState(false)
  const draftKey = `p21-draft-${dayId}`
  const [restored, setRestored] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey)
      if (saved) {
        const p = JSON.parse(saved) as {
          step?: string
          track?: string
          opened?: boolean
          solved?: boolean
          attempts?: number
        }
        if (typeof p.track === 'string') setTrack(p.track)
        if (p.opened) setOpened(true)
        if (p.solved) setSolved(true)
        if (typeof p.attempts === 'number') setAttempts(p.attempts)
        if (p.step === 'phrase' || p.step === 'solved' || p.step === 'answer') setStep(p.step)
      }
    } catch {
      /* start fresh */
    } finally {
      setRestored(true)
    }
  }, [draftKey])

  useEffect(() => {
    if (!restored) return
    try {
      localStorage.setItem(draftKey, JSON.stringify({ step, track, opened, solved, attempts }))
    } catch {
      /* ignore */
    }
  }, [restored, draftKey, step, track, opened, solved, attempts])

  useEffect(() => {
    if (!state.ok) return
    try {
      localStorage.removeItem(draftKey)
    } catch {
      /* ignore */
    }
    router.refresh()
  }, [state.ok, draftKey, router])

  const screens: Array<[Step, string]> = [
    ['landing', '1 Imprimir'],
    ...(config.phrase ? ([['phrase', '2 Frase']] as Array<[Step, string]>) : []),
    ...(config.solved ? ([['solved', '3 Sentido']] as Array<[Step, string]>) : []),
    ['answer', `${config.phrase ? 4 : 2} Canción`],
  ]

  const bar = preview ? (
    <nav className="preview-bar" aria-label="Pantallas (vista previa)">
      {screens.map(([s, label]) => (
        <button key={s} type="button" className={s === step ? 'is-on' : ''} onClick={() => setStep(s)}>
          {label}
        </button>
      ))}
    </nav>
  ) : null

  const next = config.phrase ? 'phrase' : 'answer'

  async function check() {
    if (!guess.trim() || checking) return
    setChecking(true)
    setWrong(false)
    try {
      const ok = await verifyPhrase(guess, preview ? dayId : undefined)
      if (ok) {
        setSolved(true)
        setStep(config.solved ? 'solved' : 'answer')
      } else {
        setAttempts((n) => n + 1)
        setWrong(true)
      }
    } catch {
      setWrong(true)
    } finally {
      setChecking(false)
    }
  }

  if (step === 'landing') {
    return (
      <>
        <section className="step step-entry">
          <h1 className="bracket-title">{config.entry.title}</h1>
          <p className="prose">{config.entry.text}</p>
          <a
            className="submit submit-link"
            href={config.printable.url}
            download={config.printable.filename}
            onClick={() => setOpened(true)}
          >
            {config.entry.cta}
          </a>
          {config.entry.fine_print && <p className="field-hint">{config.entry.fine_print}</p>}
          {config.entry.note && <p className="prose muted">{config.entry.note}</p>}
          <button type="button" className="submit submit-secondary" onClick={() => setStep(next)}>
            {config.entry.continue_cta}
          </button>
        </section>
        {bar}
      </>
    )
  }

  if (step === 'phrase' && config.phrase) {
    return (
      <>
        <section className="step step-entry">
          <h2 className="bracket-title">{config.phrase.title}</h2>
          <p className="prose">{config.phrase.text}</p>

          <label className="field field-boxed">
            <span className="visually-hidden">{config.phrase.title}</span>
            <input
              value={guess}
              onChange={(e) => {
                setGuess(e.target.value)
                setWrong(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void check()
                }
              }}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder={config.phrase.placeholder ?? 'Escribí la frase'}
              aria-invalid={wrong || undefined}
            />
          </label>

          {wrong && attempts > 0 && (
            <p className="form-error" role="alert">
              {config.phrase.errors[Math.min(attempts - 1, config.phrase.errors.length - 1)]}
            </p>
          )}
          {config.phrase.hint && attempts >= HINT_AFTER && <p className="field-hint">{config.phrase.hint}</p>}

          <button type="button" className="submit" disabled={!guess.trim() || checking} onClick={() => void check()}>
            {checking ? 'Viendo…' : config.phrase.cta}
          </button>

          {config.phrase.skip && attempts >= SKIP_AFTER && (
            <button type="button" className="link-button step-back" onClick={() => setStep(config.solved ? 'solved' : 'answer')}>
              {config.phrase.skip}
            </button>
          )}
        </section>
        {bar}
      </>
    )
  }

  if (step === 'solved' && config.solved) {
    return (
      <>
        <section className="step step-entry">
          <h2 className="bracket-title">{config.solved.title}</h2>
          <p className="prose">{config.solved.text}</p>
          <button type="button" className="submit" onClick={() => setStep('answer')}>
            {config.solved.cta}
          </button>
        </section>
        {bar}
      </>
    )
  }

  const ready = Boolean(parseSpotifyTrackId(track))

  return (
    <>
      <form action={action} className="step">
        {preview && <input type="hidden" name="preview_day" value={dayId} />}
        <input type="hidden" name="opened" value={String(opened)} />
        <input type="hidden" name="phrase_solved" value={String(solved)} />
        <input type="hidden" name="phrase_attempts" value={String(attempts)} />

        <h2 className="bracket-title">{config.reveal.title}</h2>
        <p className="prose">{config.reveal.text}</p>
        <p className="module-question">{config.reveal.prompt}</p>

        <TrackPicker name="track" value={track} onChange={setTrack} label="Link de Spotify de tu canción" />

        {config.deadline_note && <p className="deadline-note">{config.deadline_note}</p>}
        {state.error && (
          <p className="form-error" role="alert">
            {state.error}
          </p>
        )}
        <button type="submit" className="submit" disabled={!ready || pending || state.ok}>
          {pending || state.ok ? 'Enviando…' : config.reveal.cta}
        </button>
        <a className="link-button step-back" href={config.printable.url} download={config.printable.filename}>
          Descargar de nuevo
        </a>
      </form>
      {bar}
    </>
  )
}
