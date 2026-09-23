import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildBank, checkLine, localMix, normalizeLine, tokenize, type Fragment } from './mixer.ts'

const sources: Fragment[] = [
  { id: 'u1', owner: 'her', excerpt: 'los lunes tienen memoria de vidrio' },
  { id: 'u2', owner: 'her', excerpt: 'un ascensor que nunca sube al mundo' },
  { id: 'u3', owner: 'her', excerpt: 'bailaré sobre relojes rotos' },
  { id: 'u4', owner: 'her', excerpt: 'la casa esconde mis llaves otra vez' },
  { id: 'p1', owner: 'p21', excerpt: 'todo el mundo necesita vacaciones' },
  { id: 'p2', owner: 'p21', excerpt: 'perdí un astronauta sin licencia' },
  { id: 'p3', owner: 'p21', excerpt: 'la heladera guarda respuestas frías' },
]

test('parte el texto en palabras y respeta tildes y apóstrofos', () => {
  assert.deepEqual(tokenize('¿Qué pasó, ahí? ¡Nada!'), ['Qué', 'pasó', 'ahí', 'Nada'])
  assert.equal(normalizeLine('Qué  PASÓ'), 'que paso')
})

test('el banco sabe en qué frase vive cada palabra', () => {
  const bank = buildBank(sources)
  assert.ok(bank.get('lunes')?.has('u1'))
  // "mundo" está en dos frases, una de cada lado.
  assert.deepEqual([...bank.get('mundo')!].sort(), ['p1', 'u2'])
})

test('acepta una línea con tres frases y los dos lados', () => {
  const r = checkLine('los lunes necesitan vacaciones sin licencia', sources)
  assert.ok(r.ok, r.ok ? '' : r.reason)
  if (r.ok) {
    assert.ok(r.contributions.length >= 3)
    assert.equal(r.added.length, 0)
  }
})

test('rechaza palabras que no salen de ninguna frase', () => {
  const r = checkLine('los lunes necesitan helicópteros sin licencia', sources)
  assert.ok(!r.ok)
  if (!r.ok) assert.match(r.reason, /sin origen/)
})

test('pero las admite cuando ella escribe a mano, marcándolas', () => {
  const r = checkLine('los lunes necesitan helicópteros sin licencia', sources, { allowAdded: true })
  assert.ok(r.ok)
  if (r.ok) assert.deepEqual(r.added, ['helicópteros'])
})

test('rechaza si toca menos de tres frases', () => {
  const r = checkLine('los lunes tienen memoria de vacaciones', sources)
  assert.ok(!r.ok)
  if (!r.ok) assert.match(r.reason, /pocas frases/)
})

test('rechaza si las tres frases son del mismo lado', () => {
  // lunes (u1) + llaves (u4) + relojes rotos (u3): tres frases, todas de ella.
  const r = checkLine('los lunes esconden mis llaves sobre relojes rotos', sources)
  assert.ok(!r.ok)
  if (!r.ok) assert.match(r.reason, /falta un lado/)
})

test('rechaza una frase original con una palabra pegada', () => {
  const r = checkLine('todo el mundo necesita vacaciones de vidrio', sources)
  assert.ok(!r.ok)
  if (!r.ok) assert.match(r.reason, /calca/)
})

test('rechaza repetidas y fuera de rango', () => {
  const line = 'los lunes necesitan vacaciones sin licencia'
  assert.ok(!checkLine(line, sources, { seen: [line.toUpperCase()] }).ok)
  assert.ok(!checkLine('lunes vacaciones', sources).ok)
})

test('tolera plural y género al buscar el origen', () => {
  const r = checkLine('el reloj guarda las respuestas de mi ascensor', sources)
  assert.ok(r.ok, r.ok ? '' : r.reason)
})

test('el combinador local devuelve líneas que pasan la verificación', () => {
  const lines = localMix(sources, [], 3)
  assert.ok(lines.length >= 1)
  for (const line of lines) assert.ok(checkLine(line, sources, { seen: [] }).ok, line)
})
