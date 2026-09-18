'use client'

import { parseSpotifyTrackId } from '@/lib/spotify'

/** The shared way she hands a song to P21: paste a Spotify link, see it confirmed. */
export function TrackPicker({
  name,
  value,
  onChange,
  label,
  placeholder = 'Pegá acá el link de Spotify',
  hint = 'En Spotify: Compartir → Copiar enlace',
  error,
}: {
  name: string
  value: string
  onChange: (v: string) => void
  label: string
  placeholder?: string
  hint?: string
  error?: string | null
}) {
  const id = parseSpotifyTrackId(value)

  return (
    <div className="picker">
      <label className="field field-boxed">
        <span className="visually-hidden">{label}</span>
        <span className="field-icon" aria-hidden="true">
          ♪
        </span>
        <input
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="url"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={placeholder}
          aria-invalid={Boolean(error) || undefined}
        />
      </label>
      {error ? (
        <p className="form-error">{error}</p>
      ) : id ? (
        <iframe
          className="spotify-embed spotify-embed-compact"
          src={`https://open.spotify.com/embed/track/${id}?theme=0`}
          title="Canción elegida"
          allow="encrypted-media"
          loading="lazy"
        />
      ) : hint.trim() ? (
        <p className="field-hint">{hint}</p>
      ) : null}
    </div>
  )
}
