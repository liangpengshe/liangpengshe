import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '良朋社OPC - 一个人+AI=一家公司',
  description: '良朋社OPC，让一个人借助AI的力量就能完成一家公司的工作',
  keywords: ['AI协作', '个人创业', 'OPC', '良朋社', 'AI工具'],
  authors: [{ name: '良朋社OPC' }],
  creator: '良朋社OPC',
  publisher: '良朋社OPC',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={inter.className}>
      <body className="min-h-screen bg-slate-50">
        {children}
      </body>
    </html>
  )
}