/**
 * El banco de palabras de D8 y su verificación.
 *
 * El modelo propone líneas; acá se comprueban. Nunca confiamos en lo que el
 * modelo dice haber usado: la procedencia se recalcula palabra por palabra
 * contra las siete frases reales.
 */

export type Fragment = {
  id: string
  owner: 'her' | 'p21'
  excerpt: string
}

export type Mode = 'coherent' | 'unexpected' | 'absurd'

export type Contribution = { sourceId: string; words: string[] }

export type Checked =
  | { ok: true; contributions: Contribution[]; added: string[] }
  | { ok: false; reason: string }

/** Palabras de unión permitidas aunque no estén en ninguna frase. */
const CONNECTORS = new Set(
  (
    'el la los las un una unos unas lo al del de a en con por para y e o u que si no ni ' +
    'se su sus mi mis tu tus me te le les nos les ya muy mas más pero aunque porque como ' +
    'cuando donde sin sobre entre hasta desde cada todo toda todos todas es son era eran ' +
    'fue ser estar está están hay tan también tampoco aquí allá ahí'
  ).split(' '),
)

/** Sin tildes y en minúscula: solo para comparar, nunca para mostrar. */
export function fold(word: string): string {
  return word
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

/** Palabras de un texto. La puntuación no cuenta; los apóstrofos quedan dentro. */
export function tokenize(text: string): string[] {
  return (text.normalize('NFC').match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)?/gu) ?? []).filter(Boolean)
}

/**
 * Dos palabras cuentan como la misma si una es la otra con una o dos letras
 * más al final (reloj/relojes, necesita/necesitan, bailar/bailaré), o si solo
 * cambia la última letra (esconde/escondo, tuyo/tuya). Conservador a propósito:
 * "mundo" y "mundial" no son la misma palabra.
 */
export function related(a: string, b: string): boolean {
  const x = fold(a)
  const y = fold(b)
  if (x === y) return true
  const [short, long] = x.length <= y.length ? [x, y] : [y, x]
  if (short.length < 4) return false
  if (long.length - short.length <= 2 && long.startsWith(short)) return true
  if (long.length === short.length && long.slice(0, -1) === short.slice(0, -1)) return true
  // Raíz común con final distinto: necesita/necesitan ya entra arriba; esto
  // cubre esconde/escondieron sin abrir la puerta a cualquier parecido.
  if (long.length - short.length <= 3 && long.startsWith(short.slice(0, -1)) && short.length >= 5) {
    return true
  }
  return false
}

/** Qué fuentes contienen cada palabra, tal como aparecen. */
export function buildBank(sources: Fragment[]): Map<string, Set<string>> {
  const bank = new Map<string, Set<string>>()
  for (const source of sources) {
    for (const token of tokenize(source.excerpt)) {
      const key = fold(token)
      if (!bank.has(key)) bank.set(key, new Set())
      bank.get(key)!.add(source.id)
    }
  }
  return bank
}

/** Las fuentes donde vive una palabra, tolerando plural, género y conjugación. */
export function lookup(bank: Map<string, Set<string>>, word: string): string[] {
  const exact = bank.get(fold(word))
  if (exact) return [...exact]
  const ids = new Set<string>()
  for (const [key, set] of bank) {
    if (related(key, word)) for (const id of set) ids.add(id)
  }
  return [...ids]
}

export type Limits = {
  minWords: number
  maxWords: number
  /** Cuántas frases distintas tiene que tocar. */
  minSources: number
  /** Cuánto puede parecerse a una sola frase, de 0 a 1. */
  maxFromOne: number
}

export const DEFAULT_LIMITS: Limits = { minWords: 5, maxWords: 16, minSources: 3, maxFromOne: 0.7 }

/**
 * Verifica una línea contra el banco. Devuelve la procedencia recalculada, o
 * el motivo del rechazo. `allowAdded` es para lo que ella escribe a mano: ahí
 * las palabras ajenas se marcan como suyas en vez de invalidar la línea.
 */
export function checkLine(
  text: string,
  sources: Fragment[],
  options: { seen?: string[]; limits?: Partial<Limits>; allowAdded?: boolean } = {},
): Checked {
  const limits = { ...DEFAULT_LIMITS, ...options.limits }
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return { ok: false, reason: 'vacía' }
  if (/[<>{}]|https?:/i.test(clean)) return { ok: false, reason: 'contiene marcado' }

  const words = tokenize(clean)
  if (words.length < limits.minWords) return { ok: false, reason: 'demasiado corta' }
  if (words.length > limits.maxWords) return { ok: false, reason: 'demasiado larga' }

  if ((options.seen ?? []).some((s) => normalizeLine(s) === normalizeLine(clean))) {
    return { ok: false, reason: 'repetida' }
  }

  const bank = buildBank(sources)
  const byId = new Map<string, string[]>()
  const added: string[] = []
  const perSourceCount = new Map<string, number>()

  for (const word of words) {
    const found = lookup(bank, word)
    if (found.length) {
      // Una palabra puede estar en varias frases: cuenta para todas, pero se
      // atribuye a la primera para no inflar la procedencia.
      const [first] = found
      byId.set(first, [...(byId.get(first) ?? []), word])
      for (const id of found) perSourceCount.set(id, (perSourceCount.get(id) ?? 0) + 1)
      continue
    }
    if (CONNECTORS.has(fold(word))) continue
    if (options.allowAdded) {
      added.push(word)
      continue
    }
    return { ok: false, reason: `palabra sin origen: ${word}` }
  }

  const ids = [...byId.keys()]
  if (ids.length < limits.minSources) return { ok: false, reason: 'usa muy pocas frases' }

  const owners = new Set(ids.map((id) => sources.find((s) => s.id === id)?.owner))
  if (!owners.has('her') || !owners.has('p21')) return { ok: false, reason: 'falta un lado' }

  // Que no sea una frase original con dos palabras cambiadas.
  const top = Math.max(...[...perSourceCount.values()])
  if (top / words.length > limits.maxFromOne) return { ok: false, reason: 'calca una sola frase' }

  return {
    ok: true,
    contributions: ids.map((id) => ({ sourceId: id, words: byId.get(id)! })),
    added,
  }
}

export function normalizeLine(text: string): string {
  return tokenize(text).map(fold).join(' ')
}

/**
 * El combinador propio, para cuando no hay modelo: corta dos frases y las
 * cose, más una palabra de una tercera. Tosco, pero honesto y siempre válido.
 */
export function localMix(sources: Fragment[], seen: string[] = [], count = 3): string[] {
  const halves = sources.map((s) => {
    const words = tokenize(s.excerpt)
    const cut = Math.max(1, Math.round(words.length / 2))
    return { id: s.id, owner: s.owner, head: words.slice(0, cut), tail: words.slice(cut) }
  })
  const her = halves.filter((h) => h.owner === 'her')
  const p21 = halves.filter((h) => h.owner === 'p21')
  if (!her.length || !p21.length) return []

  const out: string[] = []
  const tried = new Set<string>()
  for (let i = 0; i < count * 12 && out.length < count; i++) {
    const a = pick(i % 2 ? her : p21, i)
    const b = pick(i % 2 ? p21 : her, i * 7 + 3)
    const c = pick(halves.filter((h) => h.id !== a.id && h.id !== b.id), i * 13 + 5)
    if (!a || !b || !c) break
    const words = [...a.head, ...b.tail]
    // Una palabra de una tercera frase, para que toque tres.
    const extra = c.tail[0] ?? c.head[0]
    if (extra) words.splice(Math.min(words.length, a.head.length), 0, extra)
    const line = words.join(' ')
    if (tried.has(normalizeLine(line))) continue
    tried.add(normalizeLine(line))
    if (checkLine(line, sources, { seen: [...seen, ...out] }).ok) out.push(line)
  }
  return out
}

function pick<T>(list: T[], seed: number): T {
  return list[Math.abs(seed) % list.length]
}
