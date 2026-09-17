/**
 * A knock-out bracket for any power-of-two field: 8 tracks (7 decisions, 3 rounds),
 * 16 tracks (15 decisions, 4 rounds), and so on.
 * Pure logic: no React, no storage — so the rules can be tested directly.
 */

export type Matchup = {
  /** Position in the decision order. */
  index: number
  /** 0-based round: 0 is the opening round, the last one is the final. */
  round: number
  tag: string
  /** Track indices competing, or null while the feeders are undecided. */
  a: number | null
  b: number | null
}

export const matchupCount = (trackCount: number) => Math.max(trackCount - 1, 0)
export const roundCount = (trackCount: number) => Math.round(Math.log2(Math.max(trackCount, 1)))

/** Round tags: D2_R1_M1 … and D2_FINAL for the last one. */
function tagFor(round: number, position: number, rounds: number): string {
  return round === rounds - 1 ? 'D2_FINAL' : `D2_R${round + 1}_M${position + 1}`
}

/**
 * The bracket as it stands for a given set of picks.
 * The opening round always knows its pairs; later rounds fill in as winners advance.
 */
export function buildBracket(picks: Array<number | null>, trackCount = 8): Matchup[] {
  const rounds = roundCount(trackCount)
  const out: Matchup[] = []
  let index = 0
  let previousRoundStart = 0

  for (let round = 0; round < rounds; round++) {
    const inRound = trackCount / 2 ** (round + 1)
    const roundStart = index
    for (let position = 0; position < inRound; position++) {
      // Round 0 pairs the tracks themselves; later rounds pair the winners that fed them.
      const a = round === 0 ? position * 2 : (picks[previousRoundStart + position * 2] ?? null)
      const b = round === 0 ? position * 2 + 1 : (picks[previousRoundStart + position * 2 + 1] ?? null)
      out.push({ index, round, tag: tagFor(round, position, rounds), a, b })
      index++
    }
    previousRoundStart = roundStart
  }
  return out
}

/** First matchup without a winner: where she should be right now. */
export function activeMatchup(picks: Array<number | null>, trackCount = 8): Matchup | null {
  return buildBracket(picks, trackCount).find((m) => picks[m.index] == null) ?? null
}

export const isComplete = (picks: Array<number | null>, trackCount = 8) =>
  picks.length === matchupCount(trackCount) && picks.every((p) => p != null)

/** The surviving track index, or null until the final is decided. */
export const bracketWinner = (picks: Array<number | null>, trackCount = 8) =>
  isComplete(picks, trackCount) ? (picks[matchupCount(trackCount) - 1] as number) : null

/**
 * Re-plays the picks and rejects anything impossible: out-of-order decisions,
 * unknown track indices, or a winner that wasn't in that matchup.
 */
export function validatePicks(
  picks: unknown,
  trackCount = 8,
): { ok: true; picks: number[] } | { ok: false; error: string } {
  const total = matchupCount(trackCount)
  if (!Array.isArray(picks) || picks.length !== total) return { ok: false, error: 'Faltan decisiones.' }

  const clean: Array<number | null> = Array(total).fill(null)
  for (let i = 0; i < total; i++) {
    const pick = picks[i]
    if (typeof pick !== 'number' || !Number.isInteger(pick) || pick < 0 || pick >= trackCount) {
      return { ok: false, error: 'Elección inválida.' }
    }
    const m = buildBracket(clean, trackCount)[i]
    if (m.a == null || m.b == null) return { ok: false, error: 'Faltan decisiones.' }
    if (pick !== m.a && pick !== m.b) return { ok: false, error: 'Esa canción no estaba en ese cruce.' }
    clean[i] = pick
  }
  return { ok: true, picks: clean as number[] }
}

/** One row per decision, for storage. */
export function decisionLog(picks: number[], trackCount = 8) {
  return buildBracket(picks, trackCount).map((m) => ({
    round: m.round + 1,
    tag: m.tag,
    matchup: m.index,
    a: m.a,
    b: m.b,
    winner: picks[m.index],
  }))
}
