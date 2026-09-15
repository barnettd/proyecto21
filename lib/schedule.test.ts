import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveActiveDay } from './schedule.ts'
import type { Day } from './types.ts'

const day = (n: number, iso: string, extra: Partial<Day> = {}): Day => ({
  id: `d${n}`,
  day_number: n,
  countdown_number: 21 - n,
  activation_datetime: iso,
  status: 'ready',
  experience_type: n === 0 ? 'locked' : 'single_track',
  title: `D${n}`,
  intro_text: null,
  instructions: null,
  completion_text: null,
  config_json: {},
  ...extra,
})

const days = [
  day(0, '2026-09-15T08:00:00-03:00'),
  day(1, '2026-09-16T08:00:00-03:00'),
  day(2, '2026-09-17T08:00:00-03:00'),
]

test('locked before anything activates', () => {
  assert.deepEqual(resolveActiveDay(days, new Date('2026-09-14T12:00:00Z'), null), {
    kind: 'locked',
    countdown: 21,
  })
})

test('D0 shows locked with its countdown', () => {
  const r = resolveActiveDay(days, new Date('2026-09-16T07:59:00-03:00'), null)
  assert.deepEqual(r, { kind: 'locked', countdown: 21 })
})

test('D1 opens exactly at 08:00 Buenos Aires', () => {
  const r = resolveActiveDay(days, new Date('2026-09-16T11:00:00Z'), null)
  assert.equal(r.kind === 'day' && r.day.day_number, 1)
})

test('latest activated day wins; previous days disappear', () => {
  const r = resolveActiveDay(days, new Date('2026-09-18T00:00:00Z'), null)
  assert.equal(r.kind === 'day' && r.day.day_number, 2)
})

test('force override beats the schedule, including future days', () => {
  const r = resolveActiveDay(days, new Date('2026-09-14T00:00:00Z'), 2)
  assert.equal(r.kind === 'day' && r.day.day_number, 2)
})

test('draft day is never exposed by the schedule', () => {
  const drafts = [day(0, days[0].activation_datetime), day(1, days[1].activation_datetime, { status: 'draft' })]
  assert.deepEqual(resolveActiveDay(drafts, new Date('2026-09-16T12:00:00Z'), null), {
    kind: 'locked',
    countdown: 20,
  })
})

test('forcing a draft day previews it', () => {
  const drafts = [day(0, days[0].activation_datetime), day(1, days[1].activation_datetime, { status: 'draft' })]
  const r = resolveActiveDay(drafts, new Date('2026-09-14T12:00:00Z'), 1)
  assert.equal(r.kind === 'day' && r.day.day_number, 1)
})

test('disabled day is skipped in favor of the previous one', () => {
  const withDisabled = [...days.slice(0, 2), day(2, days[2].activation_datetime, { status: 'disabled' })]
  const r = resolveActiveDay(withDisabled, new Date('2026-09-18T00:00:00Z'), null)
  assert.equal(r.kind === 'day' && r.day.day_number, 1)
})
