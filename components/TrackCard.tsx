import { parseSpotifyTrackId } from '@/lib/spotify'
import type { SubmittedTrack } from '@/lib/types'

export function TrackCard({
  track,
  label,
  showLink = true,
}: {
  track: SubmittedTrack
  label?: string
  /** Hide when a bigger CTA already opens Spotify. */
  showLink?: boolean
}) {
  const id = track.spotify_url ? parseSpotifyTrackId(track.spotify_url) : null
  return (
    <figure className="track-card">
      {label && <figcaption className="eyebrow">{label}</figcaption>}
      {id ? (
        <iframe
          className="spotify-embed"
          src={`https://open.spotify.com/embed/track/${id}?theme=0`}
          title={[track.title, track.artist].filter(Boolean).join(' — ') || 'Spotify'}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      ) : (
        <p className="track-text">
          <strong>{track.title}</strong>
          {track.artist && <span> — {track.artist}</span>}
        </p>
      )}
      {showLink && track.spotify_url && (
        <a className="track-link" href={track.spotify_url} target="_blank" rel="noopener noreferrer">
          Abrir en Spotify
        </a>
      )}
    </figure>
  )
}
