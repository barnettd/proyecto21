import { LineDot, Seal } from '@/components/Brand'
import { MultiTrackFlow, type FlowConfig } from '@/components/MultiTrackFlow'
import { SingleTrackForm } from '@/components/SingleTrackForm'
import { TrackCard } from '@/components/TrackCard'
import { getResponse, getTracks } from '@/lib/content'
import type { Day, SubmittedTrack } from '@/lib/types'

const str = (v: unknown) => (typeof v === 'string' ? v : undefined)

export async function DayView({ day }: { day: Day }) {
  const [tracks, response] = await Promise.all([getTracks(day.id), getResponse(day.id)])
  const cfg = day.config_json
  const given = tracks.filter((t) => t.source === 'P21')

  if (response) {
    return (
      <Completion
        text={day.completion_text}
        countdown={day.countdown_number}
        label={str(cfg.response_label)}
        tracks={(response.payload_json.tracks as SubmittedTrack[] | undefined) ?? []}
      />
    )
  }

  // Multi-step days carry all of their copy in config_json and render their own track card.
  if (day.experience_type === 'multi_track') {
    return <MultiTrackFlow dayId={day.id} config={cfg as unknown as FlowConfig} openingTrack={given[0] ?? null} />
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
  countdown,
  label,
  tracks,
}: {
  text: string | null
  countdown: number
  label?: string
  tracks: SubmittedTrack[]
}) {
  const [first, ...rest] = (text ?? 'Recibido.').split('\n')
  return (
    <section className="completion" aria-live="polite">
      <div className="completion-head">
        <Seal size="sm" />
        <p className="completion-title">{first}</p>
      </div>
      <p className="eyebrow completion-marker">
        P.21 <span className="slash">/</span> {String(countdown).padStart(2, '0')} ✓
      </p>
      {rest.length > 0 && <p className="prose">{rest.join('\n')}</p>}
      {tracks.map((t, i) => (
        <TrackCard key={i} track={t} label={i === 0 ? label : undefined} showLink={false} />
      ))}
    </section>
  )
}
