const TRACK_RE = /(?:open\.spotify\.com\/(?:intl-[a-z]{2}(?:-[a-z]{2})?\/)?(?:embed\/)?track\/|spotify:track:)([A-Za-z0-9]{22})/

/** Track id from any common Spotify track link or URI, else null. */
export function parseSpotifyTrackId(input: string): string | null {
  return input.trim().match(TRACK_RE)?.[1] ?? null
}

export const spotifyTrackUrl = (id: string) => `https://open.spotify.com/track/${id}`

/** Also follows spotify.link short links, which the mobile share sheet produces. */
export async function resolveSpotifyInput(input: string): Promise<string | null> {
  const direct = parseSpotifyTrackId(input)
  if (direct) return direct
  const url = input.trim()
  if (!/^https:\/\/spotify\.(link|app\.link)\//.test(url)) return null
  try {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(5000) })
    return parseSpotifyTrackId(res.url) ?? parseSpotifyTrackId(await res.text())
  } catch {
    return null
  }
}

const decode = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')

/** Best-effort title/artist from the public track page. No auth; nulls on any failure. */
export async function fetchTrackMeta(id: string): Promise<{ title: string | null; artist: string | null }> {
  try {
    const html = await fetch(spotifyTrackUrl(id), {
      headers: { 'user-agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000),
    }).then((r) => r.text())
    const meta = (key: string) => {
      const m = html.match(new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`))
      return m ? decode(m[1]) : null
    }
    return { title: meta('og:title'), artist: meta('music:musician_description') }
  } catch {
    return { title: null, artist: null }
  }
}
