'use client'

import { useRouter } from 'next/navigation'
import { Fragment, useActionState, useEffect, useRef, useState } from 'react'
import { submitBracket, type SubmitState } from '@/app/actions'
import { activeMatchup, bracketWinner, buildBracket, matchupCount, roundCount, type Matchup } from '@/lib/bracket'
import { Countdown } from '@/components/Countdown'
import { parseSpotifyTrackId } from '@/lib/spotify'

export type BracketTrack = { title: string; artist: string; spotify_url: string }
type Interstitial = { text: string; cta: string }

export type BracketConfig = {
  entry: { title?: string; text: string; rule?: string; cta: string }
  tracks: BracketTrack[]
  instructions?: string
  deadline_label?: string
  select_label: string
  locked_label?: string
  progress_label?: string
  /** One label per round; falls back to 'Ronda N'. */
  rounds?: string[]
  /** One breather per round, shown after finishing it (the final has none). */
  interstitials?: Interstitial[]
  winner: { title: string; bridge: string }
  wildcard: { title: string; prompt: string; cta: string; placeholder?: string }
  bonus: { title: string; text: string; select_label?: string }
  deadline_note?: string
}

type Step = 'entry' | 'bracket' | 'wildcard' | 'bonus'
type Picks = Array<number | null>

const emptyPicks = (count: number): Picks => Array(count).fill(null)

export function BracketFlow({
  dayId,
  config,
  deadlineAt,
  serverNow,
  preview = false,
}: {
  dayId: string
  config: BracketConfig
  /** 23:59:59 of today: shown as a live countdown while she decides. */
  deadlineAt: string
  serverNow: number
  preview?: boolean
}) {
  const router = useRouter()
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitBracket, { ok: false })
  const [step, setStep] = useState<Step>('entry')
  const trackCount = config.tracks.length
  const total = matchupCount(trackCount)
  const rounds = roundCount(trackCount)
  const [picks, setPicks] = useState<Picks>(() => emptyPicks(total))
  const [wildcard, setWildcard] = useState('')
  const [bonusPick, setBonusPick] = useState<'survivor' | 'wildcard' | null>(null)
  const [pause, setPause] = useState<number | null>(null)
  const activeRef = useRef<HTMLDivElement | null>(null)

  const draftKey = `p21-draft-${dayId}`
  // Until the saved draft has been read, saving would overwrite it with the initial state.
  const [restored, setRestored] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey)
      if (!saved) return
      const p = JSON.parse(saved) as { step?: Step; picks?: Picks; wildcard?: string }
      if (Array.isArray(p.picks) && p.picks.length === total) setPicks(p.picks)
      if (typeof p.wildcard === 'string') setWildcard(p.wildcard)
      if (p.step === 'bracket' || p.step === 'wildcard' || p.step === 'bonus') setStep(p.step)
    } catch {
      /* start fresh */
    } finally {
      setRestored(true)
    }
  }, [draftKey, total])

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

  const active = activeMatchup(picks, trackCount)
  const survivorIndex = bracketWinner(picks, trackCount)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step])

  useEffect(() => {
    // The first matchup is already at the top; only later ones need bringing into view.
    if (step !== 'bracket' || pause || !active || active.index === 0) return
    activeRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [active, step, pause])

  useEffect(() => {
    if (step === 'bracket' && survivorIndex != null && !pause) setStep('wildcard')
  }, [survivorIndex, step, pause])

  const choose = (matchup: number, track: number) => {
    setPicks((prev) => prev.map((p, i) => (i === matchup ? track : i > matchup ? null : p)))
    // Closing a round earns a breather, except after the final.
    const bracket = buildBracket(picks, trackCount)
    const round = bracket[matchup].round
    const lastOfRound = bracket.filter((m) => m.round === round).at(-1)?.index
    if (matchup === lastOfRound && round < rounds - 1 && config.interstitials?.[round]) setPause(round)
  }

  const reopen = () => {
    setPicks(emptyPicks(total))
    setWildcard('')
    setBonusPick(null)
    setPause(null)
    setStep('bracket')
  }

  /** Preview shortcut: resolve every matchup in favour of the first slot, and stub a wildcard. */
  const DEMO_WILDCARD = 'https://open.spotify.com/track/1TfqLAPs4K3s2rJMoCokcS'
  const skipToEnd = (target: Step) => {
    const filled: Picks = emptyPicks(total)
    for (let i = 0; i < total; i++) filled[i] = buildBracket(filled, trackCount)[i].a
    setPicks(filled)
    setPause(null)
    if (target === 'bonus' && !parseSpotifyTrackId(wildcard)) setWildcard(DEMO_WILDCARD)
    setStep(target)
  }

  const bar = preview ? (
    <nav className="preview-bar" aria-label="Pantallas (vista previa)">
      <button type="button" className={step === 'entry' ? 'is-on' : ''} onClick={() => setStep('entry')}>
        1 Inicio
      </button>
      <button type="button" className={step === 'bracket' ? 'is-on' : ''} onClick={reopen}>
        2 Llave
      </button>
      <button type="button" className={step === 'wildcard' ? 'is-on' : ''} onClick={() => skipToEnd('wildcard')}>
        3 Wildcard
      </button>
      <button type="button" className={step === 'bonus' ? 'is-on' : ''} onClick={() => skipToEnd('bonus')}>
        4 Bonus
      </button>
    </nav>
  ) : null

  if (step === 'entry') {
    return (
      <>
        <section className="step step-entry">
          {config.entry.title && <h1 className="bracket-title">{config.entry.title}</h1>}
          <p className="entry-lead">{config.entry.text}</p>
          {config.entry.rule && <p className="prose muted">{config.entry.rule}</p>}
          <button type="button" className="submit" onClick={() => setStep('bracket')}>
            {config.entry.cta}
          </button>
        </section>
        {bar}
      </>
    )
  }

  if (step === 'bracket') {
    const decided = picks.filter((p) => p != null).length
    const bracket = buildBracket(picks, trackCount)
    const byRound: Array<[string, Matchup[]]> = Array.from({ length: rounds }, (_, r) => [
      config.rounds?.[r] ?? `Ronda ${r + 1}`,
      bracket.filter((m) => m.round === r),
    ])
    const breather = pause != null ? config.interstitials?.[pause] : null

    return (
      <>
        <section className="step step-bracket">
          <div className="bracket-hud">
            <span className="hud-progress">
              {(config.progress_label ?? 'Decisión {n} / {total}')
                .replace('{n}', String(Math.min(decided + 1, total)))
                .replace('{total}', String(total))}
            </span>
            <Countdown
              target={deadlineAt}
              serverNow={serverNow}
              label={config.deadline_label ?? 'Cierra en'}
              variant="inline"
              refreshOnZero={false}
            />
          </div>

          {breather ? (
            <div className="breather">
              <p className="entry-lead">{breather.text}</p>
              <button type="button" className="submit" onClick={() => setPause(null)}>
                {breather.cta}
              </button>
            </div>
          ) : (
            <>
              {config.instructions && <p className="bracket-instructions">{config.instructions}</p>}
              {byRound.map(([label, matchups]) => (
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
                      lockedLabel={config.locked_label ?? 'Se revela al avanzar'}
                      onChoose={(track) => choose(m.index, track)}
                      ref={active?.index === m.index ? activeRef : undefined}
                    />
                  ))}
                </div>
              ))}
            </>
          )}
        </section>
        {bar}
      </>
    )
  }

  const survivor = survivorIndex != null ? config.tracks[survivorIndex] : null
  const wildcardId = parseSpotifyTrackId(wildcard)
  const duplicate = Boolean(
    wildcardId && config.tracks.some((t) => parseSpotifyTrackId(t.spotify_url) === wildcardId),
  )

  if (step === 'wildcard') {
    return (
      <>
        <section className="step">
          <h2 className="bracket-title">{config.winner.title}</h2>
          {survivor && <TrackEmbed track={survivor} />}
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

          {config.deadline_note && <p className="deadline-note">{config.deadline_note}</p>}
          <button
            type="button"
            className="submit"
            disabled={!wildcardId || duplicate}
            onClick={() => setStep('bonus')}
          >
            {config.wildcard.cta}
          </button>
        </section>
        {bar}
      </>
    )
  }

  // Bonus: the survivor faces the song she just added. One last decision.
  const canSubmit = Boolean(wildcardId) && !duplicate && bonusPick != null && !pending && !state.ok

  return (
    <>
      <form action={action} className="step">
        <input type="hidden" name="picks" value={JSON.stringify(picks)} />
        <input type="hidden" name="wildcard" value={wildcard} />
        <input type="hidden" name="bonus" value={bonusPick ?? ''} />
        {preview && <input type="hidden" name="preview_day" value={dayId} />}

        <h2 className="bracket-title">{config.bonus.title}</h2>
        <p className="entry-lead">{config.bonus.text}</p>

        <div className="mu is-active bonus-duel">
          {survivor && (
            <BonusSlot
              track={survivor}
              picked={bonusPick === 'survivor'}
              dimmed={bonusPick === 'wildcard'}
              label={config.bonus.select_label ?? config.select_label}
              onChoose={() => setBonusPick('survivor')}
            />
          )}
          {wildcardId && (
            <BonusSlot
              track={{ title: 'Tu wildcard', artist: '', spotify_url: `https://open.spotify.com/track/${wildcardId}` }}
              picked={bonusPick === 'wildcard'}
              dimmed={bonusPick === 'survivor'}
              label={config.bonus.select_label ?? config.select_label}
              onChoose={() => setBonusPick('wildcard')}
            />
          )}
        </div>

        {config.deadline_note && <p className="deadline-note">{config.deadline_note}</p>}
        {state.error && (
          <p className="form-error" role="alert">
            {state.error}
          </p>
        )}
        <button type="submit" className="submit" disabled={!canSubmit}>
          {pending || state.ok ? 'Enviando…' : 'CONFIRMAR'}
        </button>
      </form>
      {bar}
    </>
  )
}

function TrackEmbed({ track }: { track: BracketTrack }) {
  const id = parseSpotifyTrackId(track.spotify_url)
  if (!id) {
    return (
      <p className="track-text">
        <strong>{track.title}</strong> {track.artist && <span>— {track.artist}</span>}
      </p>
    )
  }
  return (
    <iframe
      className="spotify-embed spotify-embed-compact"
      src={`https://open.spotify.com/embed/track/${id}?theme=0`}
      title={[track.title, track.artist].filter(Boolean).join(' — ')}
      allow="encrypted-media"
      loading="lazy"
    />
  )
}

function BonusSlot({
  track,
  picked,
  dimmed,
  label,
  onChoose,
}: {
  track: BracketTrack
  picked: boolean
  dimmed: boolean
  label: string
  onChoose: () => void
}) {
  return (
    <div className={`slot${picked ? ' is-winner' : ''}${dimmed ? ' is-loser' : ''}`}>
      <div className="slot-head">
        <span className="slot-title">{track.title}</span>
        {track.artist && <span className="slot-artist">{track.artist}</span>}
      </div>
      <TrackEmbed track={track} />
      <button type="button" className="submit submit-secondary slot-pick" onClick={onChoose}>
        {label}
      </button>
    </div>
  )
}

function MatchupBlock({
  matchup,
  tracks,
  picked,
  isActive,
  selectLabel,
  lockedLabel,
  onChoose,
  ref,
}: {
  matchup: Matchup
  tracks: BracketTrack[]
  picked: number | null
  isActive: boolean
  selectLabel: string
  lockedLabel: string
  onChoose: (track: number) => void
  ref?: React.Ref<HTMLDivElement>
}) {
  const state = picked != null ? 'is-done' : isActive ? 'is-active' : 'is-locked'

  // Nothing is revealed before its turn: songs appear when the matchup becomes active.
  if (state === 'is-locked') {
    return (
      <div className="mu is-locked" ref={ref}>
        {[0, 1].map((i) => (
          <div className="slot is-sealed" key={i}>
            <div className="skeleton" aria-hidden="true">
              <span className="skeleton-art" />
              <span className="skeleton-lines">
                <span />
                <span />
              </span>
            </div>
            <p className="sealed-note">
              <LockIcon />
              {lockedLabel}
            </p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`mu ${state}`} ref={ref}>
      {[matchup.a, matchup.b].map((slot, i) => {
        if (slot == null) return null
        const vs = isActive && i === 1 ? <span className="vs" key="vs" aria-hidden="true">VS</span> : null
        const track = tracks[slot]
        const isWinner = picked === slot
        const isLoser = picked != null && picked !== slot
        return (
          <Fragment key={i}>
          {vs}
          <div className={`slot${isWinner ? ' is-winner' : ''}${isLoser ? ' is-loser' : ''}`}>
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
          </Fragment>
        )
      })}
    </div>
  )
}

function LockIcon() {
  return (
    <svg className="lock-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 7 0v2.7" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}
