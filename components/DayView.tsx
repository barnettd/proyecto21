import { LineDot, Seal } from '@/components/Brand'
import { SingleTrackForm } from '@/components/SingleTrackForm'
import { TrackCard } from '@/components/TrackCard'
import { getResponse, getTracks } from '@/lib/content'
import type { Day, SubmittedTrack } from '@/lib/types'

const str = (v: unknown) => (typeof v === 'string' ? v : undefined)

export async function DayView({ day }: { day: Day }) {
  const [tracks, response] = await Promise.all([getTracks(day.id), getResponse(day.id)])
  const cfg = day.config_json
  const given = tracks.filter((t) => t.source === 'P21')

  return (
    <>
      {day.title && <h1 className="day-title">{day.title}</h1>}
      {day.intro_text && <p className="prose">{day.intro_text}</p>}
      {given.map((t) => (
        <TrackCard key={t.id} track={t} label={str(cfg.track_label)} />
      ))}

      <LineDot />

      {response ? (
        <Completion
          text={day.completion_text}
          label={str(cfg.response_label)}
          tracks={(response.payload_json.tracks as SubmittedTrack[] | undefined) ?? []}
        />
      ) : (
        <>
          {day.instructions && <p className="prose">{day.instructions}</p>}
          {day.experience_type === 'single_track' && (
            <SingleTrackForm
              inputLabel={str(cfg.input_label) ?? 'Link de Spotify'}
              submitLabel={str(cfg.submit_label) ?? 'Enviar'}
            />
          )}
        </>
      )}
    </>
  )
}

function Completion({ text, label, tracks }: { text: string | null; label?: string; tracks: SubmittedTrack[] }) {
  const [first, ...rest] = (text ?? 'Recibido.').split('\n')
  return (
    <section className="completion" aria-live="polite">
      <div className="completion-head">
        <Seal size="sm" />
        <p className="completion-title">{first}</p>
      </div>
      {rest.length > 0 && <p className="prose muted">{rest.join('\n')}</p>}
      {tracks.map((t, i) => (
        <TrackCard key={i} track={t} label={label} />
      ))}
    </section>
  )
}
