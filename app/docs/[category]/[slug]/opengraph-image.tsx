import { ImageResponse } from 'next/og'
import { getDoc } from '@/lib/docs'

export const alt = 'Kernel Docs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}) {
  const { category, slug } = await params
  const doc = await getDoc(category, slug)

  if (doc?.image_url) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={doc.image_url}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* dark overlay + title */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
              alignItems: 'flex-end',
              padding: '60px 72px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ color: '#aaa', fontSize: 18, letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
                {doc.category}
              </div>
              <div style={{ color: '#fff', fontSize: 60, fontWeight: 700, lineHeight: 1.1, fontFamily: 'sans-serif' }}>
                {doc.title}
              </div>
            </div>
          </div>
        </div>
      ),
      { ...size }
    )
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: '#0a0a0a',
          padding: '80px',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            color: '#555',
            fontSize: 18,
            letterSpacing: 4,
            textTransform: 'uppercase',
            marginBottom: 24,
            fontFamily: 'sans-serif',
          }}
        >
          {doc?.category ?? category}
        </div>
        <div
          style={{
            color: '#ffffff',
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: 32,
            fontFamily: 'sans-serif',
          }}
        >
          {doc?.title ?? slug}
        </div>
        <div
          style={{
            color: '#333',
            fontSize: 20,
            fontFamily: 'sans-serif',
            marginTop: 'auto',
          }}
        >
          kernel.so
        </div>
      </div>
    ),
    { ...size }
  )
}
