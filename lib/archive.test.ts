import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildArchive, slotLabels, slotNotes } from './archive.ts'
import type { Day, ResponseRecord, Track } from './types.ts'

const day = (over: Partial<Day>): Day => ({
  id: 'd1',
  day_number: 1,
  countdown_number: 20,
  activation_datetime: '2026-09-16T08:00:00-03:00',
  status: 'ready',
  experience_type: 'multi_track',
  title: null,
  intro_text: null,
  instructions: null,
  completion_text: null,
  config_json: {},
  ...over,
})

const track = (over: Partial<Track>): Track => ({
  id: 't',
  day_id: 'd1',
  source: 'HER',
  source_name: null,
  title: 'Una',
  artist: 'Alguien',
  spotify_url: null,
  tag: null,
  sort_order: 0,
  playlist_status: null,
  ...over,
})

test('los módulos dan su nombre a cada etiqueta', () => {
  const d = day({ config_json: { modules: [{ name: 'RECARGA', tag: 'D1_RECARGA' }] } })
  assert.equal(slotLabels(d).get('D1_RECARGA'), 'RECARGA')
})

test('los fragmentos arman la etiqueta desde su clave', () => {
  const d = day({ id: 'd6', day_number: 6, experience_type: 'memory', config_json: { fragments: [{ key: 'place', title: 'LUGAR' }] } })
  const labels = slotLabels(d)
  assert.equal(labels.get('D6_PLACE_USER_TRACK'), 'LUGAR')
  assert.equal(labels.get('D6_CHILDHOOD_USER_TRACK'), 'LA PRIMERA')
})

test('el cuadro nombra a la que sobrevivió y al comodín', () => {
  const labels = slotLabels(day({ id: 'd2', day_number: 2, experience_type: 'bracket' }))
  assert.equal(labels.get('D2_WINNER'), 'LA QUE SOBREVIVIÓ')
  assert.equal(labels.get('D2_WILDCARD'), 'EL COMODÍN')
})

test('las notas vacías no cuentan', () => {
  const r = { payload_json: { notes: { A: ' ', B: ' algo ' } } } as unknown as ResponseRecord
  const notes = slotNotes(r)
  assert.equal(notes.has('A'), false)
  assert.equal(notes.get('B'), 'algo')
})

test('sin notas no explota', () => {
  assert.equal(slotNotes(undefined).size, 0)
  assert.equal(slotNotes({ payload_json: {} } as unknown as ResponseRecord).size, 0)
})

test('cada canción trae su ranura y su texto', () => {
  const d6 = day({
    id: 'd6',
    day_number: 6,
    experience_type: 'memory',
    config_json: { fragments: [{ key: 'place', title: 'LUGAR' }] },
  })
  const response = {
    id: 'r',
    day_id: 'd6',
    response_type: 'memory',
    payload_json: { notes: { D6_PLACE_USER_TEXT: 'La cocina de casa.' } },
    created_at: '',
  } as ResponseRecord
  const out = buildArchive(
    [d6],
    { 6: [track({ tag: 'D6_PLACE_USER_TRACK', title: 'Fix You', artist: 'Coldplay' })] },
    { d6: response },
  )
  assert.deepEqual(out[6], [{ label: 'LUGAR', title: 'Fix You', artist: 'Coldplay', note: 'La cocina de casa.' }])
})

test('una canción sin título no deja el renglón vacío', () => {
  const out = buildArchive([day({})], { 1: [track({ title: null, artist: null, tag: null })] }, {})
  assert.deepEqual(out[1], [{ label: null, title: 'Una canción', artist: null, note: null }])
})

test('un día sin canciones no aparece', () => {
  assert.deepEqual(buildArchive([day({})], {}, {}), {})
})
