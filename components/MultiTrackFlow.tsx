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
}: {
  dayId: string
  config: FlowConfig
  openingTrack: SubmittedTrack | null
}) {
  const router = useRouter()
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitMultiTrack, { ok: false })
  const [step, setStep] = useState<'entry' | 'listen' | 'modules'>('entry')
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

  if (step === 'entry') {
    const { lead, text, suggestions, suggestions_label } = config.entry
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
        <button type="button" className="submit" onClick={() => setStep('listen')}>
          {config.entry.cta}
        </button>
      </section>
    )
  }

  if (step === 'listen') {
    return (
      <section className="step">
        <p className="prose">{config.listen.text}</p>
        {openingTrack && <TrackCard track={openingTrack} label={config.track_label} showLink={false} />}
        {openingTrack?.spotify_url && (
          <a className="submit submit-link" href={openingTrack.spotify_url} target="_blank" rel="noopener noreferrer">
            {config.listen.primary_cta}
          </a>
        )}
        {config.listen.while_text && <p className="prose muted listen-note">{config.listen.while_text}</p>}
        <button type="button" className="link-button step-back" onClick={() => setStep('modules')}>
          {config.listen.secondary_cta}
        </button>
      </section>
    )
  }

  return (
    <form action={action} className="step">
      <p className="prose">{config.modules_intro}</p>

      {config.modules.map((m, i) => {
        const dup = Boolean(keys[i]) && keys.indexOf(keys[i]) !== i
        return (
          <fieldset className="module" key={m.name}>
            <legend className="module-head">
              <span className="module-n">{m.n}</span>
              <span className="module-name">{m.name}</span>
            </legend>
            <p className="prose muted">{m.guide}</p>
            <p className="prose module-question">{m.question}</p>
            <label className="field">
              <span className="field-label">Canción · link de Spotify</span>
              <input
                name={`track_${i}`}
                value={values[i]}
                onChange={(e) => setValues((v) => v.map((old, j) => (j === i ? e.target.value : old)))}
                inputMode="url"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder={m.placeholder ?? 'https://open.spotify.com/track/…'}
                aria-invalid={dup || undefined}
              />
            </label>
            {dup && <p className="form-error">Esta ya la elegiste en otro módulo.</p>}
          </fieldset>
        )
      })}

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
  )
}
