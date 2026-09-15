'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { submitSingleTrack, type SubmitState } from '@/app/actions'

export function SingleTrackForm({ inputLabel, submitLabel }: { inputLabel: string; submitLabel: string }) {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitSingleTrack, { ok: false })
  const [manual, setManual] = useState(false)
  // Controlled values: React resets forms after an action, which would wipe her input on an error.
  const [values, setValues] = useState({ spotify_url: '', title: '', artist: '' })
  const bind = (name: keyof typeof values) => ({
    name,
    value: values[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, [name]: e.target.value })),
  })
  const router = useRouter()

  // Success → re-render on the server, which now shows the completion state.
  useEffect(() => {
    if (state.ok) router.refresh()
  }, [state.ok, router])

  return (
    <form action={action} className="track-form">
      {manual ? (
        <>
          <label className="field">
            <span className="field-label">Canción</span>
            <input {...bind('title')} required maxLength={200} autoComplete="off" />
          </label>
          <label className="field">
            <span className="field-label">Artista</span>
            <input {...bind('artist')} maxLength={200} autoComplete="off" />
          </label>
        </>
      ) : (
        <label className="field">
          <span className="field-label">{inputLabel}</span>
          <input
            {...bind('spotify_url')}
            required
            inputMode="url"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="https://open.spotify.com/track/…"
          />
        </label>
      )}

      <button type="button" className="link-button" onClick={() => setManual((m) => !m)}>
        {manual ? 'Tengo el link de Spotify' : '¿No está en Spotify?'}
      </button>

      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" className="submit" disabled={pending || state.ok}>
        {pending || state.ok ? 'Enviando…' : submitLabel}
      </button>
    </form>
  )
}
