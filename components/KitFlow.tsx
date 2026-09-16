'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { submitKit, type SubmitState } from '@/app/actions'
import { TrackCard } from '@/components/TrackCard'
import { TrackPicker } from '@/components/TrackPicker'
import { parseSpotifyTrackId } from '@/lib/spotify'
import type { SubmittedTrack } from '@/lib/types'

export type Compartment = { label?: string; title: string; guide: string; cta?: string; track: SubmittedTrack }
export type KitConfig = {
  entry: { title: string; text: string; cta: string }
  progress_label?: string
  compartments: Compartment[]
  contribution: { title: string; text: string; cta: string }
  deadline_note?: string
}

/** Three compartments from P21, opened one at a time, then one song from her. */
export function KitFlow({
  dayId,
  config,
  preview = false,
}: {
  dayId: string
  config: KitConfig
  preview?: boolean
}) {
  const router = useRouter()
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitKit, { ok: false })
  // -1 is the landing; 0..n-1 are the compartments; n is her turn.
  const [index, setIndex] = useState(-1)
  const [track, setTrack] = useState('')
  const draftKey = `p21-draft-${dayId}`
  const [restored, setRestored] = useState(false)
  const last = config.compartments.length

  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey)
      if (saved) {
        const p = JSON.parse(saved) as { index?: number; track?: string }
        if (typeof p.index === 'number' && p.index >= -1 && p.index <= last) setIndex(p.index)
        if (typeof p.track === 'string') setTrack(p.track)
      }
    } catch {
      /* start fresh */
    } finally {
      setRestored(true)
    }
  }, [draftKey, last])

  useEffect(() => {
    if (!restored) return
    try {
      localStorage.setItem(draftKey, JSON.stringify({ index, track }))
    } catch {
      /* ignore */
    }
  }, [restored, draftKey, index, track])

  useEffect(() => {
    if (!state.ok) return
    try {
      localStorage.removeItem(draftKey)
    } catch {
      /* ignore */
    }
    router.refresh()
  }, [state.ok, draftKey, router])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [index])

  const bar = preview ? (
    <nav className="preview-bar" aria-label="Pantallas (vista previa)">
      <button type="button" className={index === -1 ? 'is-on' : ''} onClick={() => setIndex(-1)}>
        1 Inicio
      </button>
      <button type="button" className={index >= 0 && index < last ? 'is-on' : ''} onClick={() => setIndex(0)}>
        2 Kit
      </button>
      <button type="button" className={index === last ? 'is-on' : ''} onClick={() => setIndex(last)}>
        3 Tu turno
      </button>
    </nav>
  ) : null

  if (index === -1) {
    return (
      <>
        <section className="step step-entry">
          <h1 className="bracket-title">{config.entry.title}</h1>
          <p className="prose">{config.entry.text}</p>
          <button type="button" className="submit" onClick={() => setIndex(0)}>
            {config.entry.cta}
          </button>
        </section>
        {bar}
      </>
    )
  }

  if (index < last) {
    const c = config.compartments[index]
    return (
      <>
        <section className="step">
          <p className="bracket-progress">
            {(config.progress_label ?? '{n} / {total}')
              .replace('{n}', String(index + 1))
              .replace('{total}', String(last))}
          </p>
          <h2 className="bracket-title">{c.title}</h2>
          <p className="prose">{c.guide}</p>
          <TrackCard track={c.track} label={c.label} showLink={false} />
          {c.track.spotify_url && (
            <a className="submit submit-link" href={c.track.spotify_url} target="_blank" rel="noopener noreferrer">
              Escuchar en Spotify
            </a>
          )}
          <button type="button" className="submit submit-secondary" onClick={() => setIndex(index + 1)}>
            {c.cta ?? 'SIGUIENTE'}
          </button>
          {index > 0 && (
            <button type="button" className="link-button step-back" onClick={() => setIndex(index - 1)}>
              Volver
            </button>
          )}
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
        <h2 className="bracket-title">{config.contribution.title}</h2>
        <p className="prose">{config.contribution.text}</p>

        <TrackPicker name="track" value={track} onChange={setTrack} label="Link de Spotify de tu canción" />

        {config.deadline_note && <p className="deadline-note">{config.deadline_note}</p>}
        {state.error && (
          <p className="form-error" role="alert">
            {state.error}
          </p>
        )}
        <button type="submit" className="submit" disabled={!ready || pending || state.ok}>
          {pending || state.ok ? 'Enviando…' : config.contribution.cta}
        </button>
        <button type="button" className="link-button step-back" onClick={() => setIndex(last - 1)}>
          Volver
        </button>
      </form>
      {bar}
    </>
  )
}
