'use client'

import { useState } from 'react'
import { Folder, Calendar, Eye, X, FileText, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DiagnosisRecord } from '@/lib/member-dashboard'

/**
 * 历史档案区 · AI 诊断 / 咨询报告
 *
 *  - 卡片列表展示（按时间倒序）
 *  - 每条含：日期、类型、摘要、查看完整报告按钮
 *  - 点击按钮弹窗显示完整 Markdown 报告
 */
export interface DiagnosisHistoryListProps {
  records: DiagnosisRecord[]
  loading?: boolean
  className?: string
}

export function DiagnosisHistoryList({
  records,
  loading,
  className,
}: DiagnosisHistoryListProps) {
  const [activeRecord, setActiveRecord] = useState<DiagnosisRecord | null>(null)

  return (
    <section className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm md:text-base font-bold text-slate-900 flex items-center gap-1.5">
          <Folder size={14} className="text-blue-600" />
          我的商业档案
        </h2>
        <span className="text-[10px] text-slate-400">
          共 {records.length} 条
        </span>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-100 p-6 text-center text-xs text-slate-400">
          加载中…
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-6 text-center">
          <FileText size={24} className="mx-auto text-slate-300 mb-2" />
          <p className="text-xs text-slate-500">还没有诊断记录</p>
          <p className="text-[10px] text-slate-400 mt-1">
            完成 AI 商业诊断后，报告会存档在这里
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {records.map((r) => (
            <div
              key={r.id}
              className={cn(
                'bg-white rounded-xl border border-slate-100 p-3.5 md:p-4',
                'shadow-sm hover:shadow-md hover:border-blue-200 transition-all'
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{r.typeEmoji}</span>
                  <span className="text-xs md:text-sm font-bold text-slate-800">
                    {r.typeLabel}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 flex-shrink-0">
                  <Calendar size={10} />
                  <span>{r.date}</span>
                </div>
              </div>
              <p className="text-[11px] md:text-xs text-slate-600 leading-relaxed line-clamp-2 mb-2.5">
                {r.summary}
              </p>
              <button
                type="button"
                onClick={() => setActiveRecord(r)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                  'bg-blue-50 hover:bg-blue-100 text-blue-700',
                  'text-[11px] md:text-xs font-bold transition-colors',
                  'border border-blue-100'
                )}
              >
                <Eye size={12} />
                查看完整诊断报告
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 弹窗：完整报告 */}
      {activeRecord && (
        <ReportModal
          record={activeRecord}
          onClose={() => setActiveRecord(null)}
        />
      )}
    </section>
  )
}

// ════════════════════════════════════════════════════════════════
// 弹窗组件
// ════════════════════════════════════════════════════════════════

function ReportModal({
  record,
  onClose,
}: {
  record: DiagnosisRecord
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          'relative w-full md:max-w-2xl max-h-[90vh] md:max-h-[85vh]',
          'bg-white rounded-t-2xl md:rounded-2xl shadow-2xl',
          'flex flex-col overflow-hidden',
          'animate-in slide-in-from-bottom md:fade-in md:zoom-in-95 duration-200'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">{record.typeEmoji}</span>
              <h3 className="text-sm md:text-base font-extrabold text-slate-900 truncate">
                {record.typeLabel} · 完整报告
              </h3>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              报告日期：{record.date}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="flex-shrink-0 ml-2 w-8 h-8 rounded-full bg-white/80 hover:bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* 内容：Markdown 简易渲染 */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <MarkdownView source={record.fullReport} />
        </div>

        {/* 底部 */}
        <div className="flex items-center justify-between p-3 md:p-4 border-t border-slate-100 bg-slate-50">
          <span className="text-[10px] text-slate-400">报告 ID：{record.id}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                try {
                  const blob = new Blob([record.fullReport], { type: 'text/markdown;charset=utf-8' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${record.id}.md`
                  a.click()
                  URL.revokeObjectURL(url)
                } catch (e) {
                  console.warn('下载失败', e)
                }
              }}
              className={cn(
                'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg',
                'bg-white border border-slate-200 text-slate-700',
                'text-xs font-bold hover:bg-slate-50 transition-colors'
              )}
            >
              <Download size={12} />
              下载 Markdown
            </button>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg',
                'bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors'
              )}
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// 极简 Markdown 渲染（标题/列表/粗体/段落）
// 避免引入额外依赖
// ════════════════════════════════════════════════════════════════

function MarkdownView({ source }: { source: string }) {
  const blocks = parseMarkdown(source)
  return (
    <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed">
      {blocks.map((b, i) => renderBlock(b, i))}
    </div>
  )
}

type MdBlock =
  | { type: 'h1' | 'h2' | 'h3' | 'h4'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'code'; text: string }
  | { type: 'hr' }

function parseMarkdown(src: string): MdBlock[] {
  const lines = src.split('\n')
  const blocks: MdBlock[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()
    if (!trimmed) {
      i++
      continue
    }
    if (trimmed.startsWith('#### ')) {
      blocks.push({ type: 'h4', text: trimmed.slice(5) })
      i++
      continue
    }
    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', text: trimmed.slice(4) })
      i++
      continue
    }
    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', text: trimmed.slice(3) })
      i++
      continue
    }
    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'h1', text: trimmed.slice(2) })
      i++
      continue
    }
    if (trimmed === '---' || trimmed === '***') {
      blocks.push({ type: 'hr' })
      i++
      continue
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''))
        i++
      }
      blocks.push({ type: 'ul', items })
      continue
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''))
        i++
      }
      blocks.push({ type: 'ol', items })
      continue
    }
    if (trimmed.startsWith('```')) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      blocks.push({ type: 'code', text: codeLines.join('\n') })
      continue
    }
    // 普通段落：合并连续行
    const para: string[] = [line]
    i++
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^#{1,4}\s/.test(lines[i].trim()) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !lines[i].trim().startsWith('```')
    ) {
      para.push(lines[i])
      i++
    }
    blocks.push({ type: 'p', text: para.join(' ') })
  }
  return blocks
}

function renderBlock(b: MdBlock, i: number) {
  switch (b.type) {
    case 'h1':
      return (
        <h1 key={i} className="text-xl font-extrabold text-slate-900 mt-4 mb-2">
          {renderInline(b.text)}
        </h1>
      )
    case 'h2':
      return (
        <h2 key={i} className="text-base font-extrabold text-slate-900 mt-4 mb-1.5 border-b border-slate-100 pb-1">
          {renderInline(b.text)}
        </h2>
      )
    case 'h3':
      return (
        <h3 key={i} className="text-sm font-bold text-slate-800 mt-3 mb-1">
          {renderInline(b.text)}
        </h3>
      )
    case 'h4':
      return (
        <h4 key={i} className="text-xs font-bold text-slate-700 mt-2 mb-0.5">
          {renderInline(b.text)}
        </h4>
      )
    case 'p':
      return (
        <p key={i} className="text-xs md:text-sm text-slate-700 my-1.5 leading-relaxed">
          {renderInline(b.text)}
        </p>
      )
    case 'ul':
      return (
        <ul key={i} className="list-disc pl-5 my-1.5 space-y-0.5">
          {b.items.map((it, k) => (
            <li key={k} className="text-xs md:text-sm text-slate-700 leading-relaxed">
              {renderInline(it)}
            </li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol key={i} className="list-decimal pl-5 my-1.5 space-y-0.5">
          {b.items.map((it, k) => (
            <li key={i} className="text-xs md:text-sm text-slate-700 leading-relaxed">
              {renderInline(it)}
            </li>
          ))}
        </ol>
      )
    case 'code':
      return (
        <pre
          key={i}
          className="bg-slate-900 text-slate-100 text-[11px] md:text-xs rounded-lg p-3 my-2 overflow-x-auto"
        >
          <code>{b.text}</code>
        </pre>
      )
    case 'hr':
      return <hr key={i} className="my-3 border-slate-200" />
  }
}

/** 行内元素渲染：粗体 + 行内代码 + emoji 直通 */
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let rest = text
  let key = 0

  // 处理 **粗体**
  const boldRe = /\*\*([^*]+)\*\*/
  while (rest.length > 0) {
    const m = rest.match(boldRe)
    if (!m) {
      parts.push(rest)
      break
    }
    if (m.index && m.index > 0) {
      parts.push(rest.slice(0, m.index))
    }
    parts.push(
      <strong key={`b${key++}`} className="font-extrabold text-slate-900">
        {m[1]}
      </strong>
    )
    rest = rest.slice(m.index! + m[0].length)
  }
  return <>{parts}</>
}

export default DiagnosisHistoryList
