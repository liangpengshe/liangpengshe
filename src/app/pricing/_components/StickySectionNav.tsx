'use client'

/**
 * 定价页 · 吸顶分区导航
 * - 滚动联动激活态
 * - 平滑滚动到对应区块（offset 80px 避开吸顶栏）
 */

import { SECTIONS } from '../_data/sections'
import type { SectionKey } from '../_data/plan-types'

interface StickySectionNavProps {
  activeSection: SectionKey
  onSectionClick: (key: SectionKey) => void
}

export default function StickySectionNav({
  activeSection,
  onSectionClick,
}: StickySectionNavProps) {
  return (
    <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-lg md:max-w-6xl mx-auto px-3 py-2 flex overflow-x-auto scrollbar-hide gap-2">
        {SECTIONS.map((s) => {
          const isActive = activeSection === s.key
          return (
            <button
              key={s.key}
              onClick={() => onSectionClick(s.key)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                isActive
                  ? s.dark
                    ? 'bg-slate-900 text-amber-300 ring-2 ring-amber-400/50'
                    : 'bg-blue-600 text-white ring-2 ring-blue-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className="text-sm">{s.emoji}</span>
              <span>
                {s.index} · {s.title}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
