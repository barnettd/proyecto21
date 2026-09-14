export type DayStatus = 'draft' | 'ready' | 'disabled'

export type ExperienceType =
  | 'locked'
  | 'single_track'
  | 'multi_track'
  | 'track_plus_text'
  | 'track_list'
  | 'choice'
  | 'bracket'
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
