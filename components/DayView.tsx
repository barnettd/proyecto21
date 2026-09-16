import { BracketFlow, type BracketConfig } from '@/components/BracketFlow'
import { LineDot, Seal, Wordmark } from '@/components/Brand'
import { Countdown } from '@/components/Countdown'
import { MultiTrackFlow, type FlowConfig } from '@/components/MultiTrackFlow'
import { PreviewReset } from '@/components/PreviewReset'
import { SingleTrackForm } from '@/components/SingleTrackForm'
import { TrackCard } from '@/components/TrackCard'
import { getResponse, getTracks } from '@/lib/content'
import { hasContent } from '@/lib/day-content'
import type { Day, SubmittedTrack } from '@/lib/types'

const str = (v: unknown) => (typeof v === 'string' ? v : undefined)
export async function DayView({
  day,
  nextOpensAt,
  serverNow,
}: {
  day: Day
  /** When the next experience opens: drives the "esta página permanece disponible" line. */
  nextOpensAt: string | null
  serverNow: number
}) {
  const [tracks, response] = await Promise.all([getTracks(day.id), getResponse(day.id)])
  // D1 shipped with its image hardcoded; keep it until its config carries `image`.
  const cfg = day.id === 'd1' ? { image: '/d1-mundo.png', ...day.config_json } : day.config_json
  const given = tracks.filter((t) => t.source === 'P21')

  const preview = process.env.NODE_ENV !== 'production'

  if (response) {
    const closing = cfg.closing as
      | { title?: string; text?: string; label_final?: string; label_track?: string; track?: SubmittedTrack }
      | undefined
    if (closing) {
      return (
        <>
          <Closing
            closing={closing}
            finalTrack={(response.payload_json.final_track as SubmittedTrack | undefined) ?? null}
            nextOpensAt={nextOpensAt}
            serverNow={serverNow}
            availabilityLabel={str(cfg.availability_label) ?? 'Esta página permanece disponible por'}
          />
          {preview && <PreviewReset dayId={day.id} />}
        </>
      )
    }
    return (
      <>
        <Completion
          text={day.completion_text}
          label={str(cfg.response_label)}
          tracks={(response.payload_json.tracks as SubmittedTrack[] | undefined) ?? []}
          nextOpensAt={nextOpensAt}
          serverNow={serverNow}
          availabilityLabel={str(cfg.availability_label) ?? 'Esta página permanece disponible por'}
        />
        {preview && <PreviewReset dayId={day.id} />}
      </>
    )
  }

  if (!hasContent(day)) {
    return preview ? (
      <section className="step">
        <h1 className="day-title">{day.title}</h1>
        <p className="prose muted">
          Este día todavía no tiene contenido cargado. Tipo previsto: {day.experience_type}.
        </p>
      </section>
    ) : null
  }

  if (day.experience_type === 'bracket') {
    return <BracketFlow dayId={day.id} config={cfg as unknown as BracketConfig} preview={preview} />
  }

  // Multi-step days carry all of their copy in config_json and render their own track card.
  if (day.experience_type === 'multi_track') {
    return (
      <MultiTrackFlow
        dayId={day.id}
        config={cfg as unknown as FlowConfig}
        openingTrack={given[0] ?? null}
        preview={preview}
      />
    )
  }

  return (
    <>
      {day.title && <h1 className="day-title">{day.title}</h1>}
      {day.intro_text && <p className="prose">{day.intro_text}</p>}
      {given.map((t) => (
        <TrackCard key={t.id} track={t} label={str(cfg.track_label)} />
      ))}

      <LineDot />

      {day.instructions && <p className="prose">{day.instructions}</p>}
      {day.experience_type === 'single_track' && (
        <SingleTrackForm
          inputLabel={str(cfg.input_label) ?? 'Link de Spotify'}
          submitLabel={str(cfg.submit_label) ?? 'Enviar'}
        />
      )}
    </>
  )
}

function Completion({
  text,
  label,
  tracks,
  nextOpensAt,
  serverNow,
  availabilityLabel,
}: {
  text: string | null
  label?: string
  tracks: SubmittedTrack[]
  nextOpensAt: string | null
  serverNow: number
  availabilityLabel: string
}) {
  const [first, ...rest] = (text ?? 'Recibido.').split('\n')
  return (
    <section className="completion" aria-live="polite">
      <div className="completion-head">
        <Seal size="sm" />
        <p className="completion-title">{first}</p>
      </div>
      {rest.length > 0 && <p className="prose">{rest.join('\n')}</p>}
      {tracks.map((t, i) => (
        <TrackCard key={i} track={t} label={i === 0 ? label : undefined} showLink={false} />
      ))}
      {nextOpensAt && (
        <Countdown target={nextOpensAt} serverNow={serverNow} label={availabilityLabel} variant="inline" />
      )}
    </section>
  )
}

/** Closing screen: her final pick, one track from P21, and nothing about what comes next. */
function Closing({
  closing,
  finalTrack,
  nextOpensAt,
  serverNow,
  availabilityLabel,
}: {
  closing: { title?: string; text?: string; label_final?: string; label_track?: string; track?: SubmittedTrack }
  finalTrack: SubmittedTrack | null
  nextOpensAt: string | null
  serverNow: number
  availabilityLabel: string
}) {
  return (
    <section className="step closing" aria-live="polite">
      <Wordmark size="lg" live />
      {closing.title && <h2 className="bracket-title">{closing.title}</h2>}
      {closing.text && <p className="prose">{closing.text}</p>}
      {finalTrack && (
        <>
          <p className="round-label">{closing.label_final ?? 'Tu elección'}</p>
          <TrackCard track={finalTrack} showLink={false} />
        </>
      )}
      {closing.track && (
        <>
          <p className="round-label">{closing.label_track ?? 'De mi lado'}</p>
          <TrackCard track={closing.track} showLink={false} />
        </>
      )}
      {nextOpensAt && (
        <Countdown target={nextOpensAt} serverNow={serverNow} label={availabilityLabel} variant="inline" />
      )}
    </section>
  )
}
