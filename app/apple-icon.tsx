import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/** Home-screen icon: the P.21 seal on carbon (iOS masks the corners itself). */
export default function AppleIcon() {
  const bars = [10, 22, 32, 16]
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#111111',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        <div style={{ color: '#F8F8F6', fontSize: 58, fontWeight: 800, letterSpacing: -2 }}>P.21</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 48, height: 3, background: '#C99745' }} />
          <div style={{ width: 9, height: 9, borderRadius: 9, background: '#C99745', marginLeft: -7 }} />
          {bars.map((h, i) => (
            <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: '#C99745' }} />
          ))}
        </div>
      </div>
    ),
    size,
  )
}
