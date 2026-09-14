import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Noto_Sans_JP, Shippori_Mincho } from 'next/font/google'
import './globals.css'

const sans = Noto_Sans_JP({ subsets: ['latin'], variable: '--font-body', display: 'swap' })
const serif = Shippori_Mincho({ weight: ['400', '600', '700'], subsets: ['latin'], variable: '--font-display', display: 'swap' })

export const metadata: Metadata = {
  title: 'Megliminal — 誰かのおすすめに、偶然出会う。',
  description: '本、映画、音楽、場所。ジャンルを越えて、誰かの「本当におすすめしたいもの」に巡り合える場所。',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f2eee3',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className="bg-background">
      <body className={`${sans.variable} ${serif.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
