'use client'

/**
 * 轻量 Markdown 渲染器（无 react-markdown 依赖）
 * 支持：# 标题 / **加粗** / [文字](url) / 列表 / > 引用 / --- 分割线 / `代码`
 * 风格统一：白底灰字，蓝紫强调
 */

import React from 'react'

type Props = {
  source: string
  className?: string
}

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  // 处理 [text](url) 和 **bold**
  const re = /(\[([^\]]+)\]\(([^)\s]+)\))|(\*\*([^*]+)\*\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let i = 0
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }
    if (match[1]) {
      // 链接
      const label = match[2]
      const url = match[3]
      const isInternal = url.startsWith('/') || url.startsWith('#')
      nodes.push(
        <a
          key={`${keyPrefix}-l-${i++}`}
          href={url}
          target={isInternal ? '_self' : '_blank'}
          rel={isInternal ? undefined : 'noopener noreferrer'}
          className="text-blue-600 hover:text-blue-700 underline decoration-blue-300 hover:decoration-blue-500 underline-offset-2 font-medium"
        >
          {label}
        </a>
      )
    } else if (match[4]) {
      // 加粗
      nodes.push(
        <strong key={`${keyPrefix}-b-${i++}`} className="font-bold text-slate-900">
          {match[5]}
        </strong>
      )
    }
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes
}

export function MarkdownLite({ source, className = '' }: Props) {
  const lines = source.split(/\r?\n/)
  const out: React.ReactNode[] = []
  let listBuffer: string[] = []
  let keyCounter = 0
  const flushList = () => {
    if (listBuffer.length === 0) return
    const items = listBuffer.map((t, i) => (
      <li key={`li-${keyCounter}-${i}`} className="leading-relaxed">
        {renderInline(t, `k${keyCounter}-li${i}`)}
      </li>
    ))
    out.push(
      <ul key={`ul-${keyCounter}`} className="list-disc list-outside ml-5 space-y-1.5 my-2 text-slate-700">
        {items}
      </ul>
    )
    listBuffer = []
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    if (!trimmed) {
      flushList()
      continue
    }
    if (trimmed === '---' || trimmed === '***') {
      flushList()
      out.push(<hr key={`hr-${i}`} className="my-4 border-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />)
      continue
    }
    // 标题：## / ###
    const h2 = /^##\s+(.+)$/.exec(trimmed)
    const h3 = /^###\s+(.+)$/.exec(trimmed)
    if (h2) {
      flushList()
      out.push(
        <h2 key={`h2-${i}`} className="text-base md:text-lg font-bold text-slate-900 mt-4 mb-2 flex items-center gap-1.5">
          {renderInline(h2[1], `h2-${i}`)}
        </h2>
      )
      continue
    }
    if (h3) {
      flushList()
      out.push(
        <h3 key={`h3-${i}`} className="text-sm md:text-base font-bold text-slate-800 mt-3 mb-1.5">
          {renderInline(h3[1], `h3-${i}`)}
        </h3>
      )
      continue
    }
    // 引用 >
    if (/^>\s+/.test(trimmed)) {
      flushList()
      const txt = trimmed.replace(/^>\s+/, '')
      out.push(
        <blockquote
          key={`bq-${i}`}
          className="border-l-4 border-blue-400 bg-blue-50/50 pl-3 pr-2 py-2 my-2 text-slate-700 italic rounded-r"
        >
          {renderInline(txt, `bq-${i}`)}
        </blockquote>
      )
      continue
    }
    // 列表
    if (/^[-*]\s+/.test(trimmed)) {
      listBuffer.push(trimmed.replace(/^[-*]\s+/, ''))
      continue
    }
    // 普通段落
    flushList()
    out.push(
      <p key={`p-${i}`} className="leading-relaxed my-1.5 text-slate-700">
        {renderInline(trimmed, `p-${i}`)}
      </p>
    )
  }
  flushList()
  return <div className={`markdown-lite text-sm ${className}`}>{out}</div>
}

export default MarkdownLite
