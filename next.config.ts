import type { NextConfig } from 'next'

const config: NextConfig = {
  poweredByHeader: false,
  // Lets the dev server hydrate when opened from a phone on the LAN (not just localhost).
  allowedDevOrigins: ['192.168.86.44', '*.local'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
    ]
  },
}

export default config
