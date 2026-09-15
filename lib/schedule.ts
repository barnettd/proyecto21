import type { Day } from './types.ts'

export type Resolution =
  | { kind: 'day'; day: Day }
  /** opensAt: when the next experience opens (drives the countdown), or null if we shouldn't promise a time. */
  | { kind: 'locked'; countdown: number; opensAt: string | null }

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

  if (!current) return { kind: 'locked', countdown: 21, opensAt: nextOpening(usable, now) }

  // A day whose time has come but whose content isn't ready: stay locked, promise nothing.
  if (current.status === 'draft' && forceActiveDay === null && current.experience_type !== 'locked') {
    return { kind: 'locked', countdown: current.countdown_number, opensAt: null }
  }
  if (current.experience_type === 'locked') {
    return { kind: 'locked', countdown: current.countdown_number, opensAt: nextOpening(usable, now) }
  }
  return { kind: 'day', day: current }
}

/** Earliest future activation of a real (non-locked) experience. Drafts count: the time is the promise. */
function nextOpening(days: Day[], now: Date): string | null {
  const next = days
    .filter((d) => d.experience_type !== 'locked' && new Date(d.activation_datetime).getTime() > now.getTime())
    .sort((a, b) => new Date(a.activation_datetime).getTime() - new Date(b.activation_datetime).getTime())[0]
  return next?.activation_datetime ?? null
}
