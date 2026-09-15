import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseSpotifyTrackId } from './spotify.ts'

const ID = '6dGnYIeXmHdcikdzNNDMm2'

test('parses the common track link shapes', () => {
  for (const input of [
    `https://open.spotify.com/track/${ID}`,
    `https://open.spotify.com/track/${ID}?si=abc123`,
    `https://open.spotify.com/intl-es/track/${ID}?si=abc`,
    `https://open.spotify.com/embed/track/${ID}`,
    `spotify:track:${ID}`,
    `  mirá esta: https://open.spotify.com/track/${ID}  `,
  ]) {
    assert.equal(parseSpotifyTrackId(input), ID, input)
  }
})

test('rejects non-track links', () => {
  for (const input of [
    `https://open.spotify.com/album/${ID}`,
    `https://open.spotify.com/playlist/${ID}`,
    'https://youtu.be/dQw4w9WgXcQ',
    'Here Comes the Sun',
    '',
  ]) {
    assert.equal(parseSpotifyTrackId(input), null, input)
  }
})
