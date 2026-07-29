'use client'

/**
 * 定价页 · 全档权益对比表
 * 6 档 × (4 维矩阵 + 7 项权益) 的横向对比
 */

import { PLANS } from '../_data/plans'
import { MATRIX_DIMS } from '../_data/matrix'

export default function PlanComparisonTable() {
  return (
    <section className="px-4 py-10">
      <div className="max-w-lg md:max-w-6xl mx-auto">
        <h2 className="text-lg md:text-2xl font-bold text-slate-900 text-center mb-6">
          📊 6 档权益对比
        </h2>
        <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left p-3 font-bold text-slate-700 sticky left-0 bg-slate-50 z-10">
                  权益项
                </th>
                {PLANS.map((p) => (
                  <th
                    key={p.key}
                    className={`text-center p-3 font-bold text-slate-700 min-w-[80px] ${
                      p.section === 'expansion' ? 'bg-slate-900/5' : ''
                    }`}
                  >
                    <div className="text-[10px] text-slate-400 mb-0.5">TIER 0{p.tier}</div>
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MATRIX_DIMS.map((dim) => (
                <tr key={dim.key} className="hover:bg-slate-50/50">
                  <td className="p-3 font-medium text-slate-700 sticky left-0 bg-white">
                    {dim.label}
                  </td>
                  {PLANS.map((p) => {
                    const ok = p.matrix[dim.key as keyof typeof p.matrix]
                    return (
                      <td
                        key={p.key}
                        className={`p-3 text-center text-base ${
                          p.section === 'expansion' ? 'bg-slate-900/5' : ''
                        }`}
                      >
                        {ok ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600">
                            ✓
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400">
                            ×
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
              {[
                { label: 'AI 商业诊断', values: ['1 次', '社群', '无限', '无限', '无限', '无限'] },
                { label: '工具库访问', values: ['试用', '社群', '✓', '✓', '✓', '✓'] },
                { label: '项目库 SOP', values: ['—', '社群', '✓', '✓', '✓', '✓'] },
                { label: '智富日报', values: ['—', '✓', '✓', '✓', '✓', '✓'] },
                { label: '导师 1V1 陪跑', values: ['—', '—', '—', '90 天', '180 天', '永久'] },
                { label: '城市分站', values: ['—', '—', '—', '申请', '考察', '主理人'] },
                { label: '可退款', values: ['7 天', '随时', '随时', '7 天', '30 天', '30 天'] },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="p-3 font-medium text-slate-700 sticky left-0 bg-white">
                    {row.label}
                  </td>
                  {row.values.map((v, j) => (
                    <td
                      key={j}
                      className={`p-3 text-center ${
                        j === 2
                          ? 'bg-rose-50/50 font-bold text-rose-700'
                          : 'text-slate-600'
                      } ${PLANS[j]?.section === 'expansion' ? 'bg-slate-900/5' : ''}`}
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
