import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import GlobalLoading from './loading'
import { ToastProvider } from '@/components/Toast'
import './globals.css'

export const metadata: Metadata = {
  title: '良朋社OPC - 一个人+AI=一家公司',
  description: '良朋社OPC，让一个人借助AI的力量就能完成一家公司的工作',
  keywords: ['AI协作', '个人创业', 'OPC', '良朋社', 'AI工具'],
  authors: [{ name: '良朋社OPC' }],
  creator: '良朋社OPC',
  publisher: '良朋社OPC',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#2563eb',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 font-sans antialiased" suppressHydrationWarning>
        <ToastProvider>
          <Suspense fallback={<GlobalLoading />}>{children}</Suspense>
        </ToastProvider>
      </body>
    </html>
  )
}