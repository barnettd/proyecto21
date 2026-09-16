import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildNotification } from './notify.ts'

const day = { day_number: 1, title: 'Escena de apertura' }

test('subject names the day, body lists track and link', () => {
  const { subject, body } = buildNotification(day, [
    { title: 'Here Comes The Sun', artist: 'The Beatles', spotify_url: 'https://open.spotify.com/track/abc' },
  ])
  assert.equal(subject, 'P.21 · D1 · Escena de apertura · respondió')
  assert.match(body, /Here Comes The Sun — The Beatles/)
  assert.match(body, /https:\/\/open\.spotify\.com\/track\/abc/)
})

test('handles a hand-typed track with no link or artist', () => {
  const { body } = buildNotification(day, [{ title: 'Una canción', artist: null, spotify_url: null }])
  assert.match(body, /• Una canción/)
  assert.doesNotMatch(body, /—/)
})

test('includes her text when the day asks for one', () => {
  const { body } = buildNotification(day, [], 'una línea que me gusta')
  assert.match(body, /"una línea que me gusta"/)
})

test('untitled day still produces a subject', () => {
  const { subject } = buildNotification({ day_number: 7, title: null }, [])
  assert.equal(subject, 'P.21 · D7 · respondió')
})
