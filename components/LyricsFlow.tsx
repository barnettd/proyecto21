'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState, useTransition } from 'react'
import { mixLines, submitLyrics, type SubmitState } from '@/app/actions'
import { TrackCard } from '@/components/TrackCard'
import { TrackPicker } from '@/components/TrackPicker'
import type { Line } from '@/lib/ai'
import { normalizeLine } from '@/lib/mixer'
import { parseSpotifyTrackId } from '@/lib/spotify'
import type { SubmittedTrack } from '@/lib/types'

export type Category = { key: string; progress: string; title: string; text: string; cta: string }

export type LyricsConfig = {
  opening: { eyebrow?: string; title: string; text: string; cta: string }
  categories: Category[]
  excerpt: { prompt: string; placeholder?: string; max_chars?: number }
  reveal: { title: string; text: string; cta: string }
  reveal_fragments: Array<{ track: SubmittedTrack; excerpt: string }>
  lab: { title: string; text: string; note?: string; cta: string; loading?: string }
  mix: {
    labels: { coherent: string; unexpected: string; absurd: string }
    again: string
    save: string
    saved: string
    unsave: string
    edit: string
    provenance: string
    added_note: string
    go_finalists: string
    need_more: string
  }
  finalists: {
    title: string
    text: string
    favorite: string
    accident: string
    title_label?: string
    cta: string
    pick: string
  }
  deadline_note?: string
}

type Step =
  | { kind: 'opening' }
  | { kind: 'category'; i: number }
  | { kind: 'reveal' }
  | { kind: 'lab' }
  | { kind: 'mix' }
  | { kind: 'finalists' }

type Draft = { link: string; excerpt: string }
type Saved = Line & { id: string; edited?: boolean }

const same = (a: Step, b: Step) => a.kind === b.kind && ('i' in a ? a.i : -1) === ('i' in b ? (b as { i: number }).i : -1)

export function LyricsFlow({ dayId, config, preview = false }: { dayId: string; config: LyricsConfig; preview?: boolean }) {
  const router = useRouter()
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitLyrics, { ok: false })
  const [step, setStep] = useState<Step>({ kind: 'opening' })
  const [drafts, setDrafts] = useState<Draft[]>(() => config.categories.map(() => ({ link: '', excerpt: '' })))
  const [sets, setSets] = useState<Line[][]>([])
  const [shown, setShown] = useState(0)
  const [saved, setSaved] = useState<Saved[]>([])
  const [favorite, setFavorite] = useState<Saved | null>(null)
  const [accident, setAccident] = useState<Saved | null>(null)
  const [titles, setTitles] = useState<{ favorite: string; accident: string }>({ favorite: '', accident: '' })
  const [editing, setEditing] = useState<string | null>(null)
  const [openProvenance, setOpenProvenance] = useState<string | null>(null)
  const [showSaved, setShowSaved] = useState(false)
  const [mixError, setMixError] = useState<string | null>(null)
  const [mixing, startMix] = useTransition()
  const [restored, setRestored] = useState(false)
  const draftKey = `p21-draft-${dayId}`

  const maxChars = config.excerpt.max_chars ?? 200

  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey)
      if (raw) {
        const p = JSON.parse(raw) as Partial<{
          step: Step
          drafts: Draft[]
          sets: Line[][]
          shown: number
          saved: Saved[]
          favorite: Saved | null
          accident: Saved | null
          titles: { favorite: string; accident: string }
        }>
        if (Array.isArray(p.drafts) && p.drafts.length === config.categories.length) setDrafts(p.drafts)
        if (Array.isArray(p.sets)) setSets(p.sets)
        if (typeof p.shown === 'number') setShown(p.shown)
        if (Array.isArray(p.saved)) setSaved(p.saved)
        if (p.favorite) setFavorite(p.favorite)
        if (p.accident) setAccident(p.accident)
        if (p.titles) setTitles(p.titles)
        if (p.step?.kind) setStep(p.step)
      }
    } catch {
      /* de cero */
    } finally {
      setRestored(true)
    }
  }, [draftKey, config.categories.length])

  useEffect(() => {
    if (!restored) return
    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify({ step, drafts, sets, shown, saved, favorite, accident, titles }),
      )
    } catch {
      /* sin guardado */
    }
  }, [restored, draftKey, step, drafts, sets, shown, saved, favorite, accident, titles])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step])

  useEffect(() => {
    if (!state.ok) return
    try {
      localStorage.removeItem(draftKey)
    } catch {
      /* ignore */
    }
    router.refresh()
  }, [state.ok, draftKey, router])

  const ready = (i: number) => {
    const d = drafts[i]
    return Boolean(parseSpotifyTrackId(d.link)) && d.excerpt.trim().length > 0 && d.excerpt.length <= maxChars
  }
  const missing = config.categories.findIndex((_, i) => !ready(i))

  const hers = drafts.map((d, i) => ({
    id: `u${i + 1}`,
    owner: 'her' as const,
    link: d.link,
    excerpt: d.excerpt.trim(),
  }))
  const current = sets[shown] ?? []
  const avoid = [...sets.flat().map((l) => normalizeLine(l.text)), ...saved.map((l) => normalizeLine(l.text))]

  function mix(next: boolean) {
    setMixError(null)
    if (next && shown + 1 < sets.length) {
      setShown(shown + 1)
      return
    }
    startMix(async () => {
      const result = await mixLines(hers, avoid, preview ? dayId : undefined)
      if (result.error || !result.sets?.length) {
        setMixError(result.error ?? 'No salió nada. Probá de nuevo.')
        return
      }
      setSets((old) => [...old, ...result.sets!])
      setShown(next ? sets.length : 0)
      if (!next) setStep({ kind: 'mix' })
    })
  }

  const keyOf = (line: Line) => normalizeLine(line.text)
  const isSaved = (line: Line) => saved.some((s) => keyOf(s) === keyOf(line))
  const toggleSave = (line: Line) =>
    setSaved((old) =>
      old.some((s) => keyOf(s) === keyOf(line))
        ? old.filter((s) => keyOf(s) !== keyOf(line))
        : [...old, { ...line, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }],
    )

  const editSaved = (id: string, text: string) =>
    setSaved((old) => old.map((s) => (s.id === id ? { ...s, text, edited: true } : s)))

  const screens: Step[] = [
    { kind: 'opening' },
    ...config.categories.map((_, i): Step => ({ kind: 'category', i })),
    { kind: 'reveal' },
    { kind: 'lab' },
    { kind: 'mix' },
    { kind: 'finalists' },
  ]

  const bar = preview ? (
    <nav className="preview-bar" aria-label="Pantallas (vista previa)">
      {screens.map((s, n) => (
        <button key={n} type="button" className={same(s, step) ? 'is-on' : ''} onClick={() => setStep(s)}>
          {n + 1}
        </button>
      ))}
    </nav>
  ) : null

  const deadline = config.deadline_note ? <p className="deadline-note">{config.deadline_note}</p> : null

  if (step.kind === 'opening') {
    return (
      <>
        <section className="step step-entry">
          {config.opening.eyebrow && <p className="eyebrow">{config.opening.eyebrow}</p>}
          <h1 className="bracket-title">{config.opening.title}</h1>
          <p className="prose">{config.opening.text}</p>
          <button type="button" className="submit" onClick={() => setStep({ kind: 'category', i: 0 })}>
            {config.opening.cta}
          </button>
          {deadline}
        </section>
        {bar}
      </>
    )
  }

  if (step.kind === 'category') {
    const i = step.i
    const c = config.categories[i]
    const d = drafts[i]
    const last = i === config.categories.length - 1
    const set = (patch: Partial<Draft>) => setDrafts((old) => old.map((x, j) => (j === i ? { ...x, ...patch } : x)))
    return (
      <>
        <section className="step">
          <p className="bracket-progress">{c.progress}</p>
          <h2 className="bracket-title">{c.title}</h2>
          <p className="prose">{c.text}</p>
          <TrackPicker
            name={`track_${c.key}`}
            value={d.link}
            onChange={(v) => set({ link: v })}
            label={`Link de Spotify para ${c.title.toLowerCase()}`}
          />
          <label className="field memory-field">
            <span className="module-question">{config.excerpt.prompt}</span>
            <textarea
              value={d.excerpt}
              onChange={(e) => set({ excerpt: e.target.value.slice(0, maxChars) })}
              rows={3}
              placeholder={config.excerpt.placeholder ?? 'Escribí la frase, tal cual suena.'}
            />
            <span className="field-hint memory-count">
              {d.excerpt.length}/{maxChars}
            </span>
          </label>
          <button
            type="button"
            className="submit"
            disabled={!ready(i)}
            onClick={() => setStep(last ? { kind: 'reveal' } : { kind: 'category', i: i + 1 })}
          >
            {c.cta}
          </button>
          {i > 0 && (
            <button type="button" className="link-button step-back" onClick={() => setStep({ kind: 'category', i: i - 1 })}>
              Volver
            </button>
          )}
          {deadline}
        </section>
        {bar}
      </>
    )
  }

  if (step.kind === 'reveal') {
    return (
      <>
        <section className="step">
          <h2 className="bracket-title">{config.reveal.title}</h2>
          <p className="prose">{config.reveal.text}</p>
          {config.reveal_fragments.map((f, i) => (
            <div className="lyric-card" key={i}>
              <p className="lyric-text">«{f.excerpt}»</p>
              <TrackCard track={f.track} showLink={false} />
            </div>
          ))}
          <button type="button" className="submit" onClick={() => setStep({ kind: 'lab' })}>
            {config.reveal.cta}
          </button>
          {deadline}
        </section>
        {bar}
      </>
    )
  }

  if (step.kind === 'lab') {
    return (
      <>
        <section className="step step-entry">
          <h2 className="bracket-title">{config.lab.title}</h2>
          <p className="prose">{config.lab.text}</p>
          {config.lab.note && <p className="field-hint">{config.lab.note}</p>}
          {mixError && (
            <p className="form-error" role="alert">
              {mixError}
            </p>
          )}
          <button type="button" className="submit" disabled={mixing || missing >= 0} onClick={() => mix(false)}>
            {mixing ? (config.lab.loading ?? 'Buscando combinaciones improbables…') : config.lab.cta}
          </button>
          {missing >= 0 && (
            <p className="form-error">
              Falta la frase de {config.categories[missing].title}.{' '}
              <button type="button" className="link-button" onClick={() => setStep({ kind: 'category', i: missing })}>
                Ir ahí
              </button>
            </p>
          )}
          {deadline}
        </section>
        {bar}
      </>
    )
  }

  if (step.kind === 'mix') {
    return (
      <>
        <section className="step">
          {current.map((line) => {
            const key = keyOf(line)
            const savedLine = saved.find((s) => keyOf(s) === key)
            return (
              <div className="lyric-card" key={key}>
                <p className="round-label">{config.mix.labels[line.mode]}</p>
                <p className="lyric-text">{line.text}</p>
                <div className="lyric-actions">
                  <button type="button" className="link-button" onClick={() => toggleSave(line)}>
                    {isSaved(line) ? config.mix.unsave : config.mix.save}
                  </button>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => setOpenProvenance(openProvenance === key ? null : key)}
                  >
                    {config.mix.provenance}
                  </button>
                </div>
                {openProvenance === key && (
                  <ul className="lyric-origin">
                    {line.contributions.map((c) => (
                      <li key={c.sourceId}>
                        <span className="lyric-origin-id">{sourceName(c.sourceId, config)}</span> {c.words.join(', ')}
                      </li>
                    ))}
                  </ul>
                )}
                {savedLine && editing === savedLine.id && (
                  <textarea
                    className="lyric-edit"
                    value={savedLine.text}
                    rows={2}
                    onChange={(e) => editSaved(savedLine.id, e.target.value)}
                  />
                )}
                {savedLine && (
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => setEditing(editing === savedLine.id ? null : savedLine.id)}
                  >
                    {editing === savedLine.id ? 'Listo' : config.mix.edit}
                  </button>
                )}
              </div>
            )
          })}

          {mixError && (
            <p className="form-error" role="alert">
              {mixError}
            </p>
          )}

          <button type="button" className="submit submit-secondary" disabled={mixing} onClick={() => mix(true)}>
            {mixing ? (config.lab.loading ?? 'Mezclando…') : config.mix.again}
          </button>

          <button type="button" className="link-button" onClick={() => setShowSaved(!showSaved)}>
            {config.mix.saved.replace('{n}', String(saved.length))}
          </button>

          {showSaved && (
            <ul className="lyric-saved">
              {saved.length === 0 && <li className="field-hint">Todavía no guardaste ninguna.</li>}
              {saved.map((s) => (
                <li key={s.id}>
                  <span>{s.text}</span>
                  <button type="button" className="link-button" onClick={() => toggleSave(s)}>
                    {config.mix.unsave}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            className="submit"
            disabled={saved.length < 2}
            onClick={() => setStep({ kind: 'finalists' })}
          >
            {config.mix.go_finalists}
          </button>
          {saved.length < 2 && <p className="field-hint">{config.mix.need_more}</p>}
          {deadline}
        </section>
        {bar}
      </>
    )
  }

  // step.kind === 'finalists'
  const canSubmit = Boolean(favorite && accident && keyOf(favorite) !== keyOf(accident))
  return (
    <>
      <form action={action} className="step">
        {preview && <input type="hidden" name="preview_day" value={dayId} />}
        <input type="hidden" name="fragments" value={JSON.stringify(hers.map((h) => ({ link: h.link, excerpt: h.excerpt })))} />
        <input
          type="hidden"
          name="finalists"
          value={JSON.stringify({
            favorite: favorite ? { text: favorite.text, title: titles.favorite || null } : null,
            accident: accident ? { text: accident.text, title: titles.accident || null } : null,
          })}
        />

        <h2 className="bracket-title">{config.finalists.title}</h2>
        <p className="prose">{config.finalists.text}</p>

        {(['favorite', 'accident'] as const).map((slot) => {
          const chosen = slot === 'favorite' ? favorite : accident
          const choose = slot === 'favorite' ? setFavorite : setAccident
          const other = slot === 'favorite' ? accident : favorite
          return (
            <div className="finalist" key={slot}>
              <p className="round-label">{config.finalists[slot]}</p>
              {chosen ? (
                <>
                  <p className="lyric-text">{chosen.text}</p>
                  <button type="button" className="link-button" onClick={() => choose(null)}>
                    Cambiar
                  </button>
                </>
              ) : (
                <ul className="lyric-saved">
                  {saved
                    .filter((s) => !other || keyOf(s) !== keyOf(other))
                    .map((s) => (
                      <li key={s.id}>
                        <span>{s.text}</span>
                        <button type="button" className="link-button" onClick={() => choose(s)}>
                          {config.finalists.pick}
                        </button>
                      </li>
                    ))}
                </ul>
              )}
              {chosen && config.finalists.title_label && (
                <label className="field field-boxed">
                  <span className="visually-hidden">{config.finalists.title_label}</span>
                  <input
                    value={titles[slot]}
                    onChange={(e) => setTitles({ ...titles, [slot]: e.target.value.slice(0, 60) })}
                    placeholder={config.finalists.title_label}
                    autoComplete="off"
                  />
                </label>
              )}
            </div>
          )
        })}

        {state.error && (
          <p className="form-error" role="alert">
            {state.error}
          </p>
        )}
        <button type="submit" className="submit" disabled={!canSubmit || pending || state.ok}>
          {pending || state.ok ? 'Guardando…' : config.finalists.cta}
        </button>
        <button type="button" className="link-button step-back" onClick={() => setStep({ kind: 'mix' })}>
          Volver a mezclar
        </button>
        {deadline}
      </form>
      {bar}
    </>
  )
}

/** De dónde salió cada palabra, en nombres que ella entienda. */
function sourceName(id: string, config: LyricsConfig): string {
  if (id.startsWith('u')) {
    const i = Number(id.slice(1)) - 1
    return config.categories[i]?.title ?? 'Tuya'
  }
  const i = Number(id.slice(1)) - 1
  const f = config.reveal_fragments[i]
  return f?.track.title ? `P.21 · ${f.track.title}` : 'P.21'
}
