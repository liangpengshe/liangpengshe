/**
 * 轻量 Markdown 渲染（无外部依赖）
 * ------------------------------------------------------------
 * 支持语法：
 *   - # / ## / ###        → h1/h2/h3
 *   - **粗体** / *斜体*    → <strong> / <em>
 *   - [文本](URL)          → <a>
 *   - `code`              → <code>
 *   - - / * / + 列表      → <ul><li>
 *   - 1. 2. 3. 列表       → <ol><li>
 *   - > 引用              → <blockquote>
 *   - \n\n                → 段落分隔
 * ------------------------------------------------------------
 * 安全：HTML 转义后再做转换，无 dangerouslySetInnerHTML XSS 风险
 * ------------------------------------------------------------
 */

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ESCAPE_MAP[c] || c)
}

function renderInline(text: string): string {
  let t = text
  // 行内代码
  t = t.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-rose-600 text-[12px] font-mono">$1</code>')
  // 链接
  t = t.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
  )
  // 粗体
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-extrabold text-slate-900">$1</strong>')
  // 斜体
  t = t.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
  return t
}

export function renderMarkdown(input: string): string {
  if (!input) return ''
  const escaped = escapeHtml(input)
  const lines = escaped.split('\n')
  const out: string[] = []
  let inList: 'ul' | 'ol' | null = null
  let inBlockquote = false
  let para: string[] = []

  const flushPara = () => {
    if (para.length > 0) {
      out.push(`<p class="text-sm text-slate-700 leading-relaxed mb-3">${renderInline(para.join(' '))}</p>`)
      para = []
    }
  }
  const closeList = () => {
    if (inList) {
      out.push(`</${inList}>`)
      inList = null
    }
  }
  const closeBlockquote = () => {
    if (inBlockquote) {
      out.push('</blockquote>')
      inBlockquote = false
    }
  }

  for (const raw of lines) {
    const line = raw.trim()
    // 标题
    if (line.startsWith('### ')) {
      flushPara()
      closeList()
      closeBlockquote()
      out.push(`<h3 class="text-sm font-extrabold text-slate-900 mt-4 mb-2">${renderInline(line.slice(4))}</h3>`)
      continue
    }
    if (line.startsWith('## ')) {
      flushPara()
      closeList()
      closeBlockquote()
      out.push(`<h2 class="text-base font-extrabold text-slate-900 mt-5 mb-2">${renderInline(line.slice(3))}</h2>`)
      continue
    }
    if (line.startsWith('# ')) {
      flushPara()
      closeList()
      closeBlockquote()
      out.push(`<h1 class="text-lg font-extrabold text-slate-900 mt-5 mb-2">${renderInline(line.slice(2))}</h1>`)
      continue
    }
    // 有序列表
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/)
    if (olMatch) {
      flushPara()
      closeBlockquote()
      if (inList !== 'ol') {
        closeList()
        out.push('<ol class="list-decimal list-inside space-y-1 mb-3 text-sm text-slate-700">')
        inList = 'ol'
      }
      out.push(`<li>${renderInline(olMatch[2])}</li>`)
      continue
    }
    // 无序列表
    if (/^[-*+]\s+/.test(line)) {
      flushPara()
      closeBlockquote()
      if (inList !== 'ul') {
        closeList()
        out.push('<ul class="list-disc list-inside space-y-1 mb-3 text-sm text-slate-700">')
        inList = 'ul'
      }
      out.push(`<li>${renderInline(line.replace(/^[-*+]\s+/, ''))}</li>`)
      continue
    }
    // 引用
    if (line.startsWith('> ')) {
      flushPara()
      closeList()
      if (!inBlockquote) {
        out.push('<blockquote class="border-l-4 border-blue-300 bg-blue-50/50 pl-3 pr-2 py-2 mb-3 text-sm text-slate-700 italic rounded-r">')
        inBlockquote = true
      }
      out.push(`<div>${renderInline(line.slice(2))}</div>`)
      continue
    }
    // 空行
    if (line === '') {
      flushPara()
      closeList()
      closeBlockquote()
      continue
    }
    // 普通段落
    closeList()
    closeBlockquote()
    para.push(line)
  }

  flushPara()
  closeList()
  closeBlockquote()

  return out.join('\n')
}
