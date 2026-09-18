/** Compara lo que ella escribe con la frase esperada, sin castigar tildes ni mayúsculas. */
export function normalizePhrase(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function phraseMatches(expected: string, guess: string): boolean {
  const target = normalizePhrase(expected)
  return target.length > 0 && normalizePhrase(guess) === target
}
