import { BracketFlow, type BracketConfig } from '@/components/BracketFlow'
import { KitFlow, type KitConfig } from '@/components/KitFlow'
import { LineDot, Seal, Wordmark } from '@/components/Brand'
import { PrintableFlow, type PrintableConfig } from '@/components/PrintableFlow'
import { ClosingScene, type ClosingScene as Scene } from '@/components/ClosingScene'
import { Countdown } from '@/components/Countdown'
import { LyricsFlow, type LyricsConfig } from '@/components/LyricsFlow'
import { MemoryFlow, type MemoryConfig } from '@/components/MemoryFlow'
import { MultiTrackFlow, type FlowConfig } from '@/components/MultiTrackFlow'
import { PreviewReset } from '@/components/PreviewReset'
import { ScenariosFlow, type ScenariosConfig } from '@/components/ScenariosFlow'
import { SingleTrackForm } from '@/components/SingleTrackForm'
import { TrackCard } from '@/components/TrackCard'
import { getResponse, getTracks } from '@/lib/content'
import { hasContent } from '@/lib/day-content'
import { deadlineFor } from '@/lib/schedule'
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
    const scene = cfg.closing_scene as Scene | undefined
    if (scene?.text) {
      // D8 termina con dos frases: si están, la escena las muestra.
      const creations = (['favorite', 'accident'] as const)
        .map((k) => response.payload_json[k] as { text?: string; title?: string | null } | undefined)
        .filter((c): c is { text: string; title?: string | null } => Boolean(c?.text))
      return (
        <>
          <ClosingScene scene={scene} creations={creations} />
          {preview && <PreviewReset dayId={day.id} />}
        </>
      )
    }

    const closing = cfg.closing as
      | {
          title?: string
          text?: string
          label_final?: string
          label_track?: string
          track_cta?: string
          emphasis?: string
          hers_first?: boolean
          footer_note?: string
          track?: SubmittedTrack
        }
      | undefined
    if (closing) {
      return (
        <>
          <Closing
            closing={closing}
            finalTrack={
              (response.payload_json.final_track as SubmittedTrack | undefined) ??
              (response.payload_json.tracks as SubmittedTrack[] | undefined)?.[0] ??
              null
            }
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

  if (day.experience_type === 'printable') {
    // La respuesta del crucigrama se queda en el servidor: al navegador va todo menos eso.
    const printable = cfg as unknown as PrintableConfig
    const config: PrintableConfig = printable.phrase
      ? { ...printable, phrase: { ...printable.phrase, answer: undefined } }
      : printable
    return <PrintableFlow dayId={day.id} config={config} preview={preview} />
  }

  if (day.experience_type === 'lyrics') {
    return <LyricsFlow dayId={day.id} config={cfg as unknown as LyricsConfig} preview={preview} />
  }

  if (day.experience_type === 'scenarios') {
    return <ScenariosFlow dayId={day.id} config={cfg as unknown as ScenariosConfig} preview={preview} />
  }

  if (day.experience_type === 'memory') {
    return <MemoryFlow dayId={day.id} config={cfg as unknown as MemoryConfig} preview={preview} />
  }

  if (day.experience_type === 'track_list') {
    return <KitFlow dayId={day.id} config={cfg as unknown as KitConfig} preview={preview} />
  }

  if (day.experience_type === 'bracket') {
    return (
      <BracketFlow
        dayId={day.id}
        config={cfg as unknown as BracketConfig}
        deadlineAt={deadlineFor(day)}
        serverNow={serverNow}
        preview={preview}
      />
    )
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
  closing: {
    title?: string
    text?: string
    label_final?: string
    label_track?: string
    track_cta?: string
    /** Renglón destacado entre el texto y la canción. */
    emphasis?: string
    /** Primero la que mandó ella, después la de P21. */
    hers_first?: boolean
    footer_note?: string
    track?: SubmittedTrack
  }
  finalTrack: SubmittedTrack | null
  nextOpensAt: string | null
  serverNow: number
  availabilityLabel: string
}) {
  const hers = finalTrack && (
    <>
      {closing.label_final && <p className="round-label">{closing.label_final}</p>}
      <TrackCard track={finalTrack} showLink={false} />
    </>
  )

  const mine = closing.track && (
    <>
      {closing.label_track !== '' && <p className="round-label">{closing.label_track ?? 'Propuesta P.21'}</p>}
      {closing.text && <p className="prose">{closing.text}</p>}
      {closing.emphasis && <p className="prose closing-emphasis">{closing.emphasis}</p>}
      <TrackCard track={closing.track} showLink={false} />
      {closing.track.spotify_url && (
        <a className="submit submit-link" href={closing.track.spotify_url} target="_blank" rel="noopener noreferrer">
          {closing.track_cta ?? 'ESCUCHAR EN SPOTIFY'}
        </a>
      )}
    </>
  )

  return (
    <section className="step closing" aria-live="polite">
      <Wordmark size="lg" live />
      {closing.title && <h2 className="bracket-title">{closing.title}</h2>}
      {/* Sin canción de P21, el texto va suelto arriba. */}
      {closing.text && !closing.track && <p className="prose">{closing.text}</p>}
      {closing.hers_first ? (
        <>
          {hers}
          {mine}
        </>
      ) : (
        <>
          {mine}
          {hers}
        </>
      )}
      {closing.footer_note && <p className="prose muted closing-note">{closing.footer_note}</p>}
      {nextOpensAt && (
        <Countdown target={nextOpensAt} serverNow={serverNow} label={availabilityLabel} variant="inline" />
      )}
    </section>
  )
}
