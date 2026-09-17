import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  activeMatchup,
  bracketWinner,
  buildBracket,
  decisionLog,
  matchupCount,
  roundCount,
  validatePicks,
} from './bracket.ts'

const empty = (n: number) => Array(matchupCount(n)).fill(null) as Array<number | null>

test('field size decides rounds and decisions', () => {
  assert.deepEqual([roundCount(8), matchupCount(8)], [3, 7])
  assert.deepEqual([roundCount(16), matchupCount(16)], [4, 15])
})

test('the opening round pairs the tracks in order', () => {
  const b = buildBracket(empty(16), 16)
  assert.equal(b.filter((m) => m.round === 0).length, 8)
  assert.deepEqual(
    b.slice(0, 3).map((m) => [m.a, m.b]),
    [
      [0, 1],
      [2, 3],
      [4, 5],
    ],
  )
})

test('later rounds stay empty until their feeders are decided', () => {
  const b = buildBracket(empty(16), 16)
  assert.deepEqual([b[8].a, b[8].b, b[14].a, b[14].b], [null, null, null, null])
})

test('winners advance through every round of a 16-track bracket', () => {
  const picks = empty(16)
  // Always keep the first competitor of each matchup.
  for (let i = 0; i < 15; i++) picks[i] = buildBracket(picks, 16)[i].a
  assert.equal(bracketWinner(picks, 16), 0)
  const b = buildBracket(picks, 16)
  assert.deepEqual([b[8].a, b[8].b], [0, 2]) // first two opening winners meet
  assert.deepEqual([b[14].a, b[14].b], [0, 8]) // the two halves meet in the final
})

test('the active matchup is the first undecided one', () => {
  assert.equal(activeMatchup(empty(16), 16)?.index, 0)
  const picks = empty(16)
  picks[0] = 0
  assert.equal(activeMatchup(picks, 16)?.index, 1)
})

test('tags name the round, and the last one is the final', () => {
  const picks = empty(16)
  for (let i = 0; i < 15; i++) picks[i] = buildBracket(picks, 16)[i].a
  const tags = decisionLog(picks as number[], 16).map((d) => d.tag)
  assert.equal(tags[0], 'D2_R1_M1')
  assert.equal(tags[8], 'D2_R2_M1')
  assert.equal(tags[14], 'D2_FINAL')
  assert.equal(new Set(tags).size, 15)
})

test('rejects a winner that was not in that matchup', () => {
  const picks = empty(16)
  for (let i = 0; i < 15; i++) picks[i] = buildBracket(picks, 16)[i].a
  const bad = [...(picks as number[])]
  bad[8] = 5 // never reached that matchup
  const r = validatePicks(bad, 16)
  assert.equal(r.ok, false)
  assert.match(r.ok === false ? r.error : '', /no estaba en ese cruce/)
})

test('rejects wrong length, non-integers and unknown tracks', () => {
  assert.equal(validatePicks([1, 2, 3], 16).ok, false)
  const picks = empty(8)
  for (let i = 0; i < 7; i++) picks[i] = buildBracket(picks, 8)[i].a
  const bad = [...(picks as number[])]
  bad[0] = 9
  assert.equal(validatePicks(bad, 8).ok, false)
})

test('still works for the original eight-track field', () => {
  const picks = [0, 3, 4, 7, 3, 4, 4]
  const r = validatePicks(picks, 8)
  assert.equal(r.ok, true)
  const log = decisionLog(r.ok ? r.picks : [], 8)
  assert.equal(log.length, 7)
  assert.equal(log[6].tag, 'D2_FINAL')
  assert.equal(bracketWinner(picks, 8), 4)
})
