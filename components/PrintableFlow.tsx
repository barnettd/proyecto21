'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { submitPrintable, type SubmitState } from '@/app/actions'
import { TrackPicker } from '@/components/TrackPicker'
import { parseSpotifyTrackId } from '@/lib/spotify'

export type PrintableConfig = {
  entry: { title: string; text: string; cta: string; note?: string; fine_print?: string; continue_cta: string }
  printable: { url: string; filename?: string }
  reveal: { title: string; text: string; prompt: string; cta: string }
  deadline_note?: string
}

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
  const [step, setStep] = useState<'landing' | 'answer'>('landing')
  const [opened, setOpened] = useState(false)
  const [track, setTrack] = useState('')
  const draftKey = `p21-draft-${dayId}`
  const [restored, setRestored] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey)
      if (saved) {
        const p = JSON.parse(saved) as { step?: string; track?: string; opened?: boolean }
        if (typeof p.track === 'string') setTrack(p.track)
        if (p.opened) setOpened(true)
        if (p.step === 'answer') setStep('answer')
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
      localStorage.setItem(draftKey, JSON.stringify({ step, track, opened }))
    } catch {
      /* ignore */
    }
  }, [restored, draftKey, step, track, opened])

  useEffect(() => {
    if (!state.ok) return
    try {
      localStorage.removeItem(draftKey)
    } catch {
      /* ignore */
    }
    router.refresh()
  }, [state.ok, draftKey, router])

  const bar = preview ? (
    <nav className="preview-bar" aria-label="Pantallas (vista previa)">
      <button type="button" className={step === 'landing' ? 'is-on' : ''} onClick={() => setStep('landing')}>
        1 Imprimir
      </button>
      <button type="button" className={step === 'answer' ? 'is-on' : ''} onClick={() => setStep('answer')}>
        2 Canción
      </button>
    </nav>
  ) : null

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
          <button type="button" className="submit submit-secondary" onClick={() => setStep('answer')}>
            {config.entry.continue_cta}
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
