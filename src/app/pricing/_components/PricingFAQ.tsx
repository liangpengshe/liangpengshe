'use client'

/**
 * 定价页 · FAQ 折叠列表
 */

import { ChevronDown } from 'lucide-react'
import { FAQS } from '../_data/faqs'

export default function PricingFAQ() {
  return (
    <section className="px-4 py-6">
      <div className="max-w-lg md:max-w-3xl mx-auto">
        <h2 className="text-lg md:text-2xl font-bold text-slate-900 text-center mb-6">
          常见问题
        </h2>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <details
              key={i}
              className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors"
            >
              <summary className="cursor-pointer list-none p-4 flex items-center justify-between gap-2 font-medium text-slate-900 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                    Q
                  </span>
                  <span>{f.q}</span>
                </span>
                <ChevronDown
                  size={16}
                  className="text-slate-400 group-open:rotate-180 transition-transform"
                />
              </summary>
              <div className="px-4 pb-4 pt-1 text-sm text-slate-600 leading-relaxed">{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
