/**
 * Eight tracks, four quarterfinals, two semifinals, one final.
 * Pure logic: no React, no storage — so the rules can be tested directly.
 */

export type Round = 'QF' | 'SF' | 'FINAL'

export type Matchup = {
  /** Position in the decision order, 0-6. */
  index: number
  round: Round
  tag: string
  /** Track indices (0-7) competing, or null while the feeders are undecided. */
  a: number | null
  b: number | null
}

export const MATCHUP_COUNT = 7

const TAGS = ['D2_QF_A', 'D2_QF_B', 'D2_QF_C', 'D2_QF_D', 'D2_SF_LEFT', 'D2_SF_RIGHT', 'D2_FINAL']

/** Winner of matchup `i`, or null if it hasn't been decided yet. */
const winnerOf = (picks: Array<number | null>, i: number) => picks[i] ?? null

/**
 * The bracket as it stands for a given set of picks.
 * Quarterfinals always know their pair; later rounds fill in as winners advance.
 */
export function buildBracket(picks: Array<number | null>): Matchup[] {
  const at = (i: number) => winnerOf(picks, i)
  return [
    { index: 0, round: 'QF', tag: TAGS[0], a: 0, b: 1 },
    { index: 1, round: 'QF', tag: TAGS[1], a: 2, b: 3 },
    { index: 2, round: 'QF', tag: TAGS[2], a: 4, b: 5 },
    { index: 3, round: 'QF', tag: TAGS[3], a: 6, b: 7 },
    { index: 4, round: 'SF', tag: TAGS[4], a: at(0), b: at(1) },
    { index: 5, round: 'SF', tag: TAGS[5], a: at(2), b: at(3) },
    { index: 6, round: 'FINAL', tag: TAGS[6], a: at(4), b: at(5) },
  ]
}

/** First matchup without a winner: where she should be right now. */
export function activeMatchup(picks: Array<number | null>): Matchup | null {
  return buildBracket(picks).find((m) => picks[m.index] == null) ?? null
}

export const isComplete = (picks: Array<number | null>) =>
  picks.length === MATCHUP_COUNT && picks.every((p) => p != null)

/** The surviving track index, or null until the final is decided. */
export const bracketWinner = (picks: Array<number | null>) => (isComplete(picks) ? (picks[6] as number) : null)

/**
 * Re-plays the picks and rejects anything impossible: out-of-order decisions,
 * unknown track indices, or a winner that wasn't in that matchup.
 */
export function validatePicks(picks: unknown, trackCount = 8): { ok: true; picks: number[] } | { ok: false; error: string } {
  if (!Array.isArray(picks) || picks.length !== MATCHUP_COUNT) {
    return { ok: false, error: 'Faltan decisiones.' }
  }
  const clean: Array<number | null> = Array(MATCHUP_COUNT).fill(null)
  for (let i = 0; i < MATCHUP_COUNT; i++) {
    const pick = picks[i]
    if (typeof pick !== 'number' || !Number.isInteger(pick) || pick < 0 || pick >= trackCount) {
      return { ok: false, error: 'Elección inválida.' }
    }
    const m = buildBracket(clean)[i]
    if (m.a == null || m.b == null) return { ok: false, error: 'Faltan decisiones.' }
    if (pick !== m.a && pick !== m.b) return { ok: false, error: 'Esa canción no estaba en ese cruce.' }
    clean[i] = pick
  }
  return { ok: true, picks: clean as number[] }
}

/** One row per decision, for storage. */
export function decisionLog(picks: number[]) {
  return buildBracket(picks).map((m) => ({
    round: m.round,
    tag: m.tag,
    matchup: m.index,
    a: m.a,
    b: m.b,
    winner: picks[m.index],
  }))
}
