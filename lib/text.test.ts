import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizePhrase, phraseMatches } from './text.ts'

const PHRASE = 'when words fail, music speaks'

test('acepta mayúsculas, puntuación y espacios de más', () => {
  for (const guess of [
    'When words fail, music speaks',
    'WHEN WORDS FAIL MUSIC SPEAKS',
    '  when   words fail — music speaks!  ',
    'when words fail. music, speaks',
  ]) {
    assert.ok(phraseMatches(PHRASE, guess), guess)
  }
})

test('acepta tildes de más, que en el teclado del celular pasan', () => {
  assert.ok(phraseMatches('la música habla', 'La musica habla'))
})

test('rechaza otra frase, y también la frase incompleta', () => {
  assert.ok(!phraseMatches(PHRASE, 'when words fail'))
  assert.ok(!phraseMatches(PHRASE, 'music speaks when words fail'))
  assert.ok(!phraseMatches(PHRASE, ''))
})

test('sin frase esperada no valida nada', () => {
  assert.ok(!phraseMatches('', 'lo que sea'))
})

test('normaliza a palabras separadas por un espacio', () => {
  assert.equal(normalizePhrase('  ¿Qué   pasó, ahí?  '), 'que paso ahi')
})
