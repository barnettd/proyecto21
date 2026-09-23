export type DayStatus = 'draft' | 'ready' | 'disabled'

export type ExperienceType =
  | 'locked'
  | 'single_track'
  | 'multi_track'
  | 'track_plus_text'
  | 'track_list'
  | 'printable'
  | 'choice'
  | 'bracket'
  | 'memory'
  | 'scenarios'
  | 'lyrics'
  | 'media_exchange'
  | 'archive'
  | 'reveal'
  | 'custom'

export type Day = {
  id: string
  day_number: number
  countdown_number: number
  /** ISO 8601 with offset, e.g. 2026-09-16T08:00:00-03:00 */
  activation_datetime: string
  status: DayStatus
  experience_type: ExperienceType
  title: string | null
  intro_text: string | null
  instructions: string | null
  completion_text: string | null
  config_json: Record<string, unknown>
}

export type Settings = {
  force_active_day: number | null
  locked_text: string
}

export type TrackSource = 'P21' | 'HER' | 'DANIEL' | 'CHILD_1' | 'CHILD_2' | 'CHILD_3' | 'FRIEND' | 'FAMILY'

export type Track = {
  id: string
  day_id: string
  source: TrackSource
  source_name: string | null
  title: string | null
  artist: string | null
  spotify_url: string | null
  tag: string | null
  sort_order: number
  playlist_status: string | null
}

/** A track as submitted by the participant, before it gets a row id. */
export type SubmittedTrack = Pick<Track, 'title' | 'artist' | 'spotify_url'>

/** A submitted track plus the semantic tag of the slot it came from (e.g. D1_RECARGA). */
export type TaggedTrack = SubmittedTrack & { tag?: string | null; source?: TrackSource; playlist_status?: string }

export type ResponseRecord = {
  id: string
  day_id: string
  response_type: string
  payload_json: Record<string, unknown>
  created_at: string
}
