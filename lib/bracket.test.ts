import { test } from 'node:test'
import assert from 'node:assert/strict'
import { activeMatchup, bracketWinner, buildBracket, decisionLog, validatePicks } from './bracket.ts'

const empty = Array(7).fill(null) as Array<number | null>

test('quarterfinals pair the eight tracks in order', () => {
  const b = buildBracket(empty)
  assert.deepEqual(
    b.slice(0, 4).map((m) => [m.a, m.b]),
    [
      [0, 1],
      [2, 3],
      [4, 5],
      [6, 7],
    ],
  )
})

test('later rounds stay empty until their feeders are decided', () => {
  const b = buildBracket(empty)
  assert.deepEqual([b[4].a, b[4].b, b[6].a, b[6].b], [null, null, null, null])
})

test('winners advance into the semifinal and the final', () => {
  const picks = [1, 2, 5, 6, 1, 5, null] as Array<number | null>
  const b = buildBracket(picks)
  assert.deepEqual([b[4].a, b[4].b], [1, 2])
  assert.deepEqual([b[5].a, b[5].b], [5, 6])
  assert.deepEqual([b[6].a, b[6].b], [1, 5])
})

test('the active matchup is the first undecided one', () => {
  assert.equal(activeMatchup(empty)?.index, 0)
  assert.equal(activeMatchup([1, null, null, null, null, null, null])?.index, 1)
  assert.equal(activeMatchup([1, 2, 5, 6, null, null, null])?.index, 4)
  assert.equal(activeMatchup([1, 2, 5, 6, 1, 5, 5]), null)
})

test('the survivor is the winner of the final', () => {
  assert.equal(bracketWinner([1, 2, 5, 6, 1, 5, 5]), 5)
  assert.equal(bracketWinner([1, 2, 5, 6, 1, 5, null] as Array<number | null>), null)
})

test('rejects a winner that was not in that matchup', () => {
  const r = validatePicks([1, 2, 5, 6, 3, 5, 5])
  assert.equal(r.ok, false)
  assert.match(r.ok === false ? r.error : '', /no estaba en ese cruce/)
})

test('rejects wrong length, non-integers and unknown tracks', () => {
  assert.equal(validatePicks([1, 2, 3]).ok, false)
  assert.equal(validatePicks([1, 2, 5, 6, 1, 5, '5']).ok, false)
  assert.equal(validatePicks([1, 2, 5, 6, 1, 5, 9]).ok, false)
})

test('accepts a consistent run and logs every decision', () => {
  const r = validatePicks([0, 3, 4, 7, 3, 4, 4])
  assert.equal(r.ok, true)
  const log = decisionLog(r.ok ? r.picks : [])
  assert.equal(log.length, 7)
  assert.deepEqual(log[6], { round: 'FINAL', tag: 'D2_FINAL', matchup: 6, a: 3, b: 4, winner: 4 })
  assert.deepEqual(
    log.map((d) => d.tag),
    ['D2_QF_A', 'D2_QF_B', 'D2_QF_C', 'D2_QF_D', 'D2_SF_LEFT', 'D2_SF_RIGHT', 'D2_FINAL'],
  )
})
