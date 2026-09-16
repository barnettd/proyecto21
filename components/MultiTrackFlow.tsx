'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { submitMultiTrack, type SubmitState } from '@/app/actions'
import { Seal } from '@/components/Brand'
import { TrackCard } from '@/components/TrackCard'
import { parseSpotifyTrackId } from '@/lib/spotify'
import type { SubmittedTrack } from '@/lib/types'

export type FlowModule = { n: string; name: string; guide: string; question: string; placeholder?: string }
export type FlowConfig = {
  entry: {
    /** Opening line, set larger. Falls back to `text` when absent. */
    lead?: string
    text: string
    suggestions_label?: string
    suggestions?: string[]
    cta: string
  }
  listen: { text: string; primary_cta: string; secondary_cta: string; while_text?: string }
  modules_intro: string
  modules: FlowModule[]
  deadline_note?: string
  submit_label: string
  track_label?: string
}

type Step = 'entry' | 'listen' | 'modules'
const SHORT_LINK = /^https:\/\/spotify\.(link|app\.link)\//

/** Client-side identity of a pasted value: track id, or the short link itself (server resolves it). */
function trackKey(value: string): string | null {
  const v = value.trim()
  if (!v) return null
  return parseSpotifyTrackId(v) ?? (SHORT_LINK.test(v) ? v : null)
}

export function MultiTrackFlow({
  dayId,
  config,
  openingTrack,
  preview = false,
}: {
  dayId: string
  config: FlowConfig
  openingTrack: SubmittedTrack | null
  /** Shows the step switcher. Never enabled in production. */
  preview?: boolean
}) {
  const router = useRouter()
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitMultiTrack, { ok: false })
  const [step, setStep] = useState<Step>('entry')
  const [values, setValues] = useState<string[]>(() => config.modules.map(() => ''))

  const draftKey = `p21-draft-${dayId}`

  // Restore draft after mount, so the server and client render the same first pass.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey)
      if (!saved) return
      const parsed = JSON.parse(saved) as { step?: string; values?: string[] }
      if (Array.isArray(parsed.values) && parsed.values.length === config.modules.length) setValues(parsed.values)
      if (parsed.step === 'listen' || parsed.step === 'modules') setStep(parsed.step)
    } catch {
      /* private mode or cleared storage: start fresh */
    }
  }, [draftKey, config.modules.length])

  useEffect(() => {
    try {
      localStorage.setItem(draftKey, JSON.stringify({ step, values }))
    } catch {
      /* storage unavailable: drafts just won't persist */
    }
  }, [draftKey, step, values])

  useEffect(() => {
    if (!state.ok) return
    try {
      localStorage.removeItem(draftKey)
    } catch {
      /* ignore */
    }
    router.refresh()
  }, [state.ok, draftKey, router])

  const keys = values.map(trackKey)
  const filled = keys.every(Boolean)
  const unique = new Set(keys.filter(Boolean)).size === keys.length
  const canSubmit = filled && unique && !pending && !state.ok

  const reset = () => {
    setValues(config.modules.map(() => ''))
    setStep('entry')
    try {
      localStorage.removeItem(draftKey)
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {step === 'entry' && <Entry config={config} onNext={() => setStep('listen')} />}
      {step === 'listen' && <Listen config={config} track={openingTrack} onNext={() => setStep('modules')} />}
      {step === 'modules' && (
        <form action={action} className="step">
          <p className="modules-intro">{config.modules_intro}</p>

          {config.modules.map((m, i) => (
            <Module
              key={m.name}
              module={m}
              value={values[i]}
              trackId={keys[i] && parseSpotifyTrackId(values[i]) ? parseSpotifyTrackId(values[i]) : null}
              duplicate={Boolean(keys[i]) && keys.indexOf(keys[i]) !== i}
              index={i}
              onChange={(v) => setValues((old) => old.map((prev, j) => (j === i ? v : prev)))}
            />
          ))}

          {config.deadline_note && <p className="eyebrow deadline">{config.deadline_note}</p>}
          {state.error && (
            <p className="form-error" role="alert">
              {state.error}
            </p>
          )}
          <button type="submit" className="submit" disabled={!canSubmit}>
            {pending || state.ok ? 'Enviando…' : config.submit_label}
          </button>
        </form>
      )}

      {preview && <PreviewBar step={step} onStep={setStep} onReset={reset} />}
    </>
  )
}

function Entry({ config, onNext }: { config: FlowConfig; onNext: () => void }) {
  const { lead, text, suggestions, suggestions_label, cta } = config.entry
  return (
    <section className="step step-entry">
      <Seal size="md" />
      {lead && <p className="entry-lead">{lead}</p>}
      <p className="prose">{text}</p>
      {suggestions && suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions_label && <p className="eyebrow">{suggestions_label}</p>}
          <ul className="suggestion-list">
            {suggestions.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      <button type="button" className="submit" onClick={onNext}>
        {cta}
      </button>
    </section>
  )
}

function Listen({
  config,
  track,
  onNext,
}: {
  config: FlowConfig
  track: SubmittedTrack | null
  onNext: () => void
}) {
  return (
    <section className="step">
      <p className="prose">{config.listen.text}</p>
      {track && <TrackCard track={track} label={config.track_label} showLink={false} />}
      {track?.spotify_url && (
        <a className="submit submit-link" href={track.spotify_url} target="_blank" rel="noopener noreferrer">
          {config.listen.primary_cta}
        </a>
      )}
      {config.listen.while_text && <p className="prose muted listen-note">{config.listen.while_text}</p>}
      <button type="button" className="link-button step-back" onClick={onNext}>
        {config.listen.secondary_cta}
      </button>
    </section>
  )
}

function Module({
  module: m,
  value,
  trackId,
  duplicate,
  index,
  onChange,
}: {
  module: FlowModule
  value: string
  trackId: string | null
  duplicate: boolean
  index: number
  onChange: (v: string) => void
}) {
  return (
    <fieldset className="module">
      <legend className="module-head">
        <span className="module-n">{m.n}</span>
        <span className="module-name">{m.name}</span>
      </legend>
      <p className="module-guide">{m.guide}</p>
      <p className="module-question">{m.question}</p>

      <label className="field field-boxed">
        <span className="visually-hidden">Link de Spotify para {m.name}</span>
        <span className="field-icon" aria-hidden="true">
          ♪
        </span>
        <input
          name={`track_${index}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="url"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={m.placeholder ?? 'Pegá acá el link de Spotify'}
          aria-invalid={duplicate || undefined}
        />
      </label>

      {duplicate ? (
        <p className="form-error">Esta ya la elegiste en otro módulo.</p>
      ) : trackId ? (
        <iframe
          className="spotify-embed spotify-embed-compact"
          src={`https://open.spotify.com/embed/track/${trackId}?theme=0`}
          title="Canción elegida"
          allow="encrypted-media"
          loading="lazy"
        />
      ) : (
        index === 0 && <p className="field-hint">En Spotify: Compartir → Copiar enlace</p>
      )}
    </fieldset>
  )
}

function PreviewBar({ step, onStep, onReset }: { step: Step; onStep: (s: Step) => void; onReset: () => void }) {
  const steps: Array<[Step, string]> = [
    ['entry', '1 Inicio'],
    ['listen', '2 Canción'],
    ['modules', '3 Preguntas'],
  ]
  return (
    <nav className="preview-bar" aria-label="Vista previa">
      {steps.map(([s, label]) => (
        <button key={s} type="button" className={s === step ? 'is-on' : ''} onClick={() => onStep(s)}>
          {label}
        </button>
      ))}
      <button type="button" onClick={onReset} title="Reiniciar la vista previa">
        ↺
      </button>
    </nav>
  )
}
