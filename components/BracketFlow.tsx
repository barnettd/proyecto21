'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useRef, useState } from 'react'
import { submitBracket, type SubmitState } from '@/app/actions'
import { activeMatchup, bracketWinner, buildBracket, MATCHUP_COUNT, type Matchup } from '@/lib/bracket'
import { parseSpotifyTrackId } from '@/lib/spotify'

export type BracketTrack = { title: string; artist: string; spotify_url: string }
export type BracketConfig = {
  entry: { title?: string; text: string; rule?: string; cta: string }
  tracks: BracketTrack[]
  select_label: string
  progress_label?: string
  rounds?: { qf?: string; sf?: string; final?: string }
  winner: { title: string; bridge: string }
  wildcard: { title: string; prompt: string; cta: string; placeholder?: string }
  deadline_note?: string
}

type Step = 'entry' | 'bracket' | 'wildcard'
type Picks = Array<number | null>

const emptyPicks = (): Picks => Array(MATCHUP_COUNT).fill(null)

export function BracketFlow({
  dayId,
  config,
  preview = false,
}: {
  dayId: string
  config: BracketConfig
  preview?: boolean
}) {
  const router = useRouter()
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitBracket, { ok: false })
  const [step, setStep] = useState<Step>('entry')
  const [picks, setPicks] = useState<Picks>(emptyPicks)
  const [wildcard, setWildcard] = useState('')
  const activeRef = useRef<HTMLDivElement | null>(null)

  const draftKey = `p21-draft-${dayId}`
  // Until the saved draft has been read, saving would overwrite it with the initial state.
  const [restored, setRestored] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey)
      if (!saved) return
      const p = JSON.parse(saved) as { step?: Step; picks?: Picks; wildcard?: string }
      if (Array.isArray(p.picks) && p.picks.length === MATCHUP_COUNT) setPicks(p.picks)
      if (typeof p.wildcard === 'string') setWildcard(p.wildcard)
      if (p.step === 'bracket' || p.step === 'wildcard') setStep(p.step)
    } catch {
      /* start fresh */
    } finally {
      setRestored(true)
    }
  }, [draftKey])

  useEffect(() => {
    if (!restored) return
    try {
      localStorage.setItem(draftKey, JSON.stringify({ step, picks, wildcard }))
    } catch {
      /* drafts just won't persist */
    }
  }, [restored, draftKey, step, picks, wildcard])

  useEffect(() => {
    if (!state.ok) return
    try {
      localStorage.removeItem(draftKey)
    } catch {
      /* ignore */
    }
    router.refresh()
  }, [state.ok, draftKey, router])

  const active = activeMatchup(picks)
  const winner = bracketWinner(picks)

  // Keep the live matchup in view as she advances.
  useEffect(() => {
    if (step !== 'bracket') return
    activeRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [active?.index, step])

  useEffect(() => {
    if (step === 'bracket' && winner != null) setStep('wildcard')
  }, [winner, step])

  const choose = (matchup: number, track: number) =>
    setPicks((prev) => prev.map((p, i) => (i === matchup ? track : i > matchup ? null : p)))

  const reopen = () => {
    setPicks(emptyPicks())
    setWildcard('')
    setStep('bracket')
  }

  if (step === 'entry') {
    return (
      <section className="step step-entry">
        {config.entry.title && <h1 className="bracket-title">{config.entry.title}</h1>}
        <p className="entry-lead">{config.entry.text}</p>
        {config.entry.rule && <p className="prose muted">{config.entry.rule}</p>}
        <button type="button" className="submit" onClick={() => setStep('bracket')}>
          {config.entry.cta}
        </button>
      </section>
    )
  }

  if (step === 'bracket') {
    const decided = picks.filter((p) => p != null).length
    const bracket = buildBracket(picks)
    const rounds: Array<[string, Matchup[]]> = [
      [config.rounds?.qf ?? 'Cuartos', bracket.slice(0, 4)],
      [config.rounds?.sf ?? 'Semis', bracket.slice(4, 6)],
      [config.rounds?.final ?? 'Final', bracket.slice(6)],
    ]

    return (
      <section className="step step-bracket">
        <p className="eyebrow bracket-progress">
          {(config.progress_label ?? 'Decisión {n} / {total}')
            .replace('{n}', String(Math.min(decided + 1, MATCHUP_COUNT)))
            .replace('{total}', String(MATCHUP_COUNT))}
        </p>

        {rounds.map(([label, matchups]) => (
          <div className="round" key={label}>
            <p className="round-label">{label}</p>
            {matchups.map((m) => (
              <MatchupBlock
                key={m.index}
                matchup={m}
                tracks={config.tracks}
                picked={picks[m.index]}
                isActive={active?.index === m.index}
                selectLabel={config.select_label}
                onChoose={(track) => choose(m.index, track)}
                ref={active?.index === m.index ? activeRef : undefined}
              />
            ))}
          </div>
        ))}

        {config.deadline_note && <p className="eyebrow deadline">{config.deadline_note}</p>}
      </section>
    )
  }

  const winnerTrack = winner != null ? config.tracks[winner] : null
  const wildcardId = parseSpotifyTrackId(wildcard)
  const duplicate = Boolean(
    wildcardId && config.tracks.some((t) => parseSpotifyTrackId(t.spotify_url) === wildcardId),
  )
  const canSubmit = Boolean(wildcardId) && !duplicate && !pending && !state.ok

  return (
    <form action={action} className="step">
      <input type="hidden" name="picks" value={JSON.stringify(picks)} />
      {preview && <input type="hidden" name="preview_day" value={dayId} />}

      <h2 className="bracket-title">{config.winner.title}</h2>
      {winnerTrack && <TrackEmbed track={winnerTrack} />}
      <p className="prose">{config.winner.bridge}</p>

      <div className="wildcard">
        <p className="round-label">{config.wildcard.title}</p>
        <p className="module-question">{config.wildcard.prompt}</p>
        <label className="field field-boxed">
          <span className="visually-hidden">Link de Spotify para tu wildcard</span>
          <span className="field-icon" aria-hidden="true">
            ♪
          </span>
          <input
            name="wildcard"
            value={wildcard}
            onChange={(e) => setWildcard(e.target.value)}
            inputMode="url"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={config.wildcard.placeholder ?? 'Pegá acá el link de Spotify'}
            aria-invalid={duplicate || undefined}
          />
        </label>
        {duplicate ? (
          <p className="form-error">Esa ya estaba en la llave. Elegí una que no haya competido.</p>
        ) : wildcardId ? (
          <iframe
            className="spotify-embed spotify-embed-compact"
            src={`https://open.spotify.com/embed/track/${wildcardId}?theme=0`}
            title="Tu wildcard"
            allow="encrypted-media"
            loading="lazy"
          />
        ) : (
          <p className="field-hint">En Spotify: Compartir → Copiar enlace</p>
        )}
      </div>

      {config.deadline_note && <p className="eyebrow deadline">{config.deadline_note}</p>}
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" className="submit" disabled={!canSubmit}>
        {pending || state.ok ? 'Enviando…' : config.wildcard.cta}
      </button>

      {preview && (
        <nav className="preview-bar" aria-label="Vista previa">
          <button type="button" onClick={() => setStep('entry')}>
            1 Inicio
          </button>
          <button type="button" onClick={reopen}>
            ↺ Llave
          </button>
        </nav>
      )}
    </form>
  )
}

function TrackEmbed({ track }: { track: BracketTrack }) {
  const id = parseSpotifyTrackId(track.spotify_url)
  if (!id) {
    return (
      <p className="track-text">
        <strong>{track.title}</strong> <span>— {track.artist}</span>
      </p>
    )
  }
  return (
    <iframe
      className="spotify-embed spotify-embed-compact"
      src={`https://open.spotify.com/embed/track/${id}?theme=0`}
      title={`${track.title} — ${track.artist}`}
      allow="encrypted-media"
      loading="lazy"
    />
  )
}

function MatchupBlock({
  matchup,
  tracks,
  picked,
  isActive,
  selectLabel,
  onChoose,
  ref,
}: {
  matchup: Matchup
  tracks: BracketTrack[]
  picked: number | null
  isActive: boolean
  selectLabel: string
  onChoose: (track: number) => void
  ref?: React.Ref<HTMLDivElement>
}) {
  const locked = matchup.a == null || matchup.b == null
  const state = picked != null ? 'is-done' : isActive ? 'is-active' : locked ? 'is-locked' : 'is-pending'

  return (
    <div className={`mu ${state}`} ref={ref}>
      {[matchup.a, matchup.b].map((slot, i) => {
        if (slot == null) {
          return (
            <div className="slot is-empty" key={i}>
              <span className="slot-dash">—</span>
            </div>
          )
        }
        const track = tracks[slot]
        const isWinner = picked === slot
        const isLoser = picked != null && picked !== slot
        return (
          <div className={`slot${isWinner ? ' is-winner' : ''}${isLoser ? ' is-loser' : ''}`} key={i}>
            <div className="slot-head">
              <span className="slot-title">{track.title}</span>
              <span className="slot-artist">{track.artist}</span>
            </div>
            {isActive && <TrackEmbed track={track} />}
            {isActive && (
              <button type="button" className="submit submit-secondary slot-pick" onClick={() => onChoose(slot)}>
                {selectLabel}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
