'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { submitKit, type SubmitState } from '@/app/actions'
import { TrackCard } from '@/components/TrackCard'
import { TrackPicker } from '@/components/TrackPicker'
import { parseSpotifyTrackId } from '@/lib/spotify'
import type { SubmittedTrack } from '@/lib/types'

export type Compartment = { label?: string; tag?: string; title: string; guide: string; cta?: string; track: SubmittedTrack }
export type KitConfig = {
  entry: { title: string; text: string; cta: string; image?: string }
  progress_label?: string
  compartments: Compartment[]
  contribution: {
    title: string
    text: string
    cta: string
    /** Invita a sumar más de una. */
    more_text?: string
    more_cta?: string
    /** Cuántas acepta en total, contando la obligatoria. */
    max?: number
  }
  deadline_note?: string
}

const DEFAULT_MAX = 5

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
  // La primera es obligatoria; las demás aparecen de a una, si ella quiere.
  const [tracks, setTracks] = useState<string[]>([''])
  const draftKey = `p21-draft-${dayId}`
  const [restored, setRestored] = useState(false)
  const last = config.compartments.length

  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey)
      if (saved) {
        const p = JSON.parse(saved) as { index?: number; track?: string; tracks?: string[] }
        if (typeof p.index === 'number' && p.index >= -1 && p.index <= last) setIndex(p.index)
        if (Array.isArray(p.tracks) && p.tracks.length) setTracks(p.tracks.map(String))
        else if (typeof p.track === 'string' && p.track) setTracks([p.track])
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
      localStorage.setItem(draftKey, JSON.stringify({ index, tracks }))
    } catch {
      /* ignore */
    }
  }, [restored, draftKey, index, tracks])

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
          {config.entry.image && (
            <div className="banner">
              <Image src={config.entry.image} alt="" width={1086} height={1448} sizes="(max-width: 40rem) 100vw, 34rem" />
            </div>
          )}
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

  const max = config.contribution.max ?? DEFAULT_MAX
  const ids = tracks.map((t) => (t.trim() ? parseSpotifyTrackId(t) : null))
  // La primera tiene que estar; las que estén escritas tienen que ser válidas y distintas.
  const firstOk = Boolean(ids[0])
  const restOk = tracks.every((t, i) => i === 0 || !t.trim() || Boolean(ids[i]))
  const repeated = ids.map((id, i) => Boolean(id) && ids.indexOf(id) !== i)
  const ready = firstOk && restOk && !repeated.some(Boolean)

  const change = (i: number, v: string) => setTracks((old) => old.map((t, j) => (j === i ? v : t)))
  const remove = (i: number) => setTracks((old) => old.filter((_, j) => j !== i))

  return (
    <>
      <form action={action} className="step">
        {preview && <input type="hidden" name="preview_day" value={dayId} />}
        <h2 className="bracket-title">{config.contribution.title}</h2>
        <p className="prose">{config.contribution.text}</p>

        {tracks.map((value, i) => (
          <div className="kit-track" key={i}>
            <TrackPicker
              name={`track_${i}`}
              value={value}
              onChange={(v) => change(i, v)}
              label={i === 0 ? 'Link de Spotify de tu canción' : `Link de Spotify de tu canción ${i + 1}`}
              hint={i === 0 ? undefined : ' '}
              error={
                repeated[i]
                  ? 'Esta ya la elegiste.'
                  : i > 0 && value.trim() && !ids[i]
                    ? 'Ese link no parece de una canción.'
                    : null
              }
            />
            {i > 0 && (
              <button type="button" className="link-button kit-remove" onClick={() => remove(i)}>
                Quitar
              </button>
            )}
          </div>
        ))}

        {tracks.length < max && (
          <div className="kit-more">
            {config.contribution.more_text && tracks.length === 1 && (
              <p className="prose muted kit-more-text">{config.contribution.more_text}</p>
            )}
            <button
              type="button"
              className="submit submit-secondary"
              onClick={() => setTracks((old) => [...old, ''])}
            >
              {config.contribution.more_cta ?? 'AGREGAR OTRA'}
            </button>
          </div>
        )}

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
