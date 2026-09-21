'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Wordmark } from '@/components/Brand'
import { TrackCard } from '@/components/TrackCard'
import type { SubmittedTrack } from '@/lib/types'

export type ClosingScene = {
  /** Imagen a sangre detrás del texto. */
  image?: string
  /** Archivo de audio propio: Spotify no sirve de música de fondo. */
  audio?: string
  audio_label?: string
  /** Título grande sobre el texto. */
  title?: string
  text: string
  /** Renglón al pie, más apagado. */
  footer?: string
  /** Una canción para quedarse, con su invitación. */
  track?: SubmittedTrack
  track_note?: string
  track_cta?: string
  /** Spotify no abre la letra desde un link: hay que decirle dónde tocar. */
  track_hint?: string
}

/**
 * El cierre de D5: una imagen, música, y una sola línea. Sin número de día,
 * sin contador, sin resumen de lo que mandó.
 */
export function ClosingScene({ scene }: { scene: ClosingScene }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  // Los navegadores bloquean el audio con sonido hasta que alguien toca algo.
  const [playing, setPlaying] = useState(false)
  const [needsTap, setNeedsTap] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.6
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setNeedsTap(true))
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      void audio.play().then(() => {
        setPlaying(true)
        setNeedsTap(false)
      })
    } else {
      audio.pause()
      setPlaying(false)
    }
  }

  return (
    <section className="scene" aria-live="polite">
      {scene.image && (
        <div className="scene-image">
          <Image src={scene.image} alt="" fill priority sizes="100vw" />
        </div>
      )}
      <div className="scene-body">
        <div className="scene-words">
          <Wordmark size="sm" live />
          {scene.title && <h2 className="scene-title">{scene.title}</h2>}
          <p className="scene-text">{scene.text}</p>
          {scene.footer && <p className="scene-footer">{scene.footer}</p>}
        </div>
        {scene.track && (
          <div className="scene-track">
            {scene.track_note && <p className="scene-note">{scene.track_note}</p>}
            <TrackCard track={scene.track} showLink={false} />
            {scene.track.spotify_url && (
              <a
                className="submit submit-link"
                href={scene.track.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {scene.track_cta ?? 'ESCUCHAR EN SPOTIFY'}
              </a>
            )}
            {scene.track_hint && <p className="scene-hint">{scene.track_hint}</p>}
          </div>
        )}
        {scene.audio && (
          <>
            <audio ref={audioRef} src={scene.audio} loop preload="auto" />
            <button
              type="button"
              className={`scene-audio${needsTap ? ' is-waiting' : ''}`}
              onClick={toggle}
              aria-label={playing ? 'Pausar la música' : (scene.audio_label ?? 'Poner música')}
            >
              <span className="scene-audio-icon" aria-hidden="true">
                {playing ? '❚❚' : '▶'}
              </span>
              {needsTap && <span className="scene-audio-label">{scene.audio_label ?? 'Poner música'}</span>}
            </button>
          </>
        )}
      </div>
    </section>
  )
}
