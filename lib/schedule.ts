import type { Day } from './types.ts'

export type Resolution =
  | { kind: 'day'; day: Day }
  | { kind: 'locked'; countdown: number }

/**
 * Picks the single experience the participant may see right now.
 * - force_active_day set → that day (if it exists and isn't disabled).
 * - otherwise → the latest non-disabled day whose activation has passed.
 * On the schedule, a `draft` day, D0, or nothing active yet all render as
 * locked, so unfinished content is never exposed. Forcing a day is an explicit
 * admin choice, so a forced draft IS shown (that's how drafts get previewed).
 */
export function resolveActiveDay(
  days: Day[],
  now: Date,
  forceActiveDay: number | null,
): Resolution {
  const usable = days.filter((d) => d.status !== 'disabled')

  let current: Day | undefined
  if (forceActiveDay !== null) {
    current = usable.find((d) => d.day_number === forceActiveDay)
  } else {
    current = usable
      .filter((d) => new Date(d.activation_datetime).getTime() <= now.getTime())
      .sort((a, b) => b.day_number - a.day_number)[0]
  }

  if (!current) return { kind: 'locked', countdown: 21 }
  const hiddenDraft = current.status === 'draft' && forceActiveDay === null
  if (hiddenDraft || current.experience_type === 'locked') {
    return { kind: 'locked', countdown: current.countdown_number }
  }
  return { kind: 'day', day: current }
}
