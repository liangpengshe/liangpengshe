/**
 * AI四库全胜系统 · 服务库
 *
 * 结构:
 *   1. 顶部导航（搜索 / 横幅 / 4 库导航）由 /market/layout.tsx 提供
 *   2. MarketContent 渲染 9 大服务板块（多选 + 企业需求弹窗）
 *   3. 底部新增"OPC 专家申请"横幅 + 模态框（不与原有多选提交互干扰）
 *
 * 任务 4 要求：原"企业需求弹窗"完全保留，底部模块视觉/逻辑独立。
 */
'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Sparkles, Handshake, ArrowRight, Users, Award, X } from 'lucide-react'
import { MarketContent } from '@/components/market/MarketContent'
import { ExpertApplicationModal } from '@/components/market/ExpertApplicationModal'
import { Toast } from '@/components/ui/toast'

const LEVEL_LABEL: Record<string, string> = {
  trader: '交易型 OPC',
  flow: '流量型 OPC',
  system: '系统型 OPC',
  asset: '资产型 OPC',
}

export default function ServicesPage() {
  const searchParams = useSearchParams()
  const fromParam = searchParams?.get('from') ?? ''
  const typeParam = searchParams?.get('type') ?? ''
  const levelParam = searchParams?.get('level') ?? ''

  // 来自【学习入门】页的战略抉择 → 找人合作
  const isFromGuideCollaboration = fromParam === 'guide' && typeParam === 'collaboration'
  const levelLabel = LEVEL_LABEL[levelParam] || '对应阶段'

  const [expertModalOpen, setExpertModalOpen] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [bannerVisible, setBannerVisible] = useState(true)

  return (
    <div>
      {/* ════════ 来自学习入门页的协作欢迎横幅 ═══════ */}
      {isFromGuideCollaboration && bannerVisible && (
        <div className="mb-4 relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-50 via-fuchsia-50 to-amber-50 border border-purple-200 shadow-sm">
          {/* 装饰光斑 */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-300/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-300/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative p-4 md:p-5 flex items-start gap-3">
            <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <Handshake size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] md:text-xs font-extrabold text-purple-700 tracking-wider uppercase mb-0.5">
                ✨ 欢迎回来！系统已为你精准定位
              </div>
              <h3 className="text-sm md:text-base font-extrabold text-slate-900 leading-tight">
                根据您在【{levelLabel}】阶段的选择，系统为您推荐以下资深 OPC 伙伴与代运营服务
              </h3>
              <p className="mt-1 text-[11px] md:text-xs text-slate-600 leading-relaxed">
                以下服务卡片已被高亮标记：点击 <span className="font-bold text-purple-700">OPC 陪跑</span> 或 <span className="font-bold text-purple-700">AI 网店群代运营</span>，
                即可在弹窗中查看与你所在城市匹配的 CITY_MAINTAINER 主理人/资产型 OPC 专家。
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBannerVisible(false)}
              aria-label="关闭横幅"
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-white/70 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ════════ 原服务库内容（9 大服务板块 + 多选 + 企业需求弹窗）══════ */}
      <MarketContent
        defaultTab="services"
        standalone={false}
        collaborationHighlight={isFromGuideCollaboration}
      />

      {/* ════════ 任务 1：底部 OPC 专家申请入口横幅 ═══════ */}
      <section className="mt-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-purple-50 border border-indigo-100 shadow-sm">
        {/* 装饰光斑 */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
          {/* 左侧图标 + 文案 */}
          <div className="flex items-start md:items-center gap-3 md:gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Handshake size={26} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base md:text-lg font-extrabold text-slate-900 leading-tight">
                  🤝 你是 OPC 成员？欢迎加入服务专家库！
                </h3>
              </div>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                为系统中的其他 OPC 提供你的专业服务（代运营、内训、GEO 等），
                <strong className="text-indigo-600"> 赚取服务佣金与项目分成 </strong>
                。审核通过后即可在服务库专家频道曝光。
              </p>
              {/* 信任标 */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                  <Users size={10} />
                  已有 200+ OPC 专家
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  <Award size={10} />
                  1-3 工作日审核
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full">
                  <Sparkles size={10} />
                  0 入驻费
                </span>
              </div>
            </div>
          </div>

          {/* 右侧 CTA 按钮 */}
          <div className="flex-shrink-0 flex flex-col md:flex-row gap-2">
            <button
              type="button"
              onClick={() => setExpertModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-extrabold px-5 py-3 rounded-xl shadow-md shadow-indigo-500/30 hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              申请成为专家
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ════════ 任务 2：专家申请模态框 ═══════ */}
      <ExpertApplicationModal
        open={expertModalOpen}
        onClose={() => setExpertModalOpen(false)}
        onSuccess={() => {
          setToastMsg('申请已提交，后台审核通过后将为您开通专家权限。')
          setToastOpen(true)
        }}
      />

      {/* ════════ 任务 3：成功提示 Toast ═══════ */}
      <Toast
        open={toastOpen}
        type="success"
        message={toastMsg}
        onClose={() => setToastOpen(false)}
      />
    </div>
  )
}
