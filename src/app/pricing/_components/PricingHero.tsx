'use client'

/**
 * 定价页 · Hero 区
 * - 返回商业全景链接
 * - 核心标题（9.9 起步 → 5980 主理人）
 * - 当前订阅提示（如有）
 */

import Link from 'next/link'
import { ArrowLeft, Wallet, Check } from 'lucide-react'
import { PLANS } from '../_data/plans'
import type { PlanKey } from '../_data/plan-types'

interface PricingHeroProps {
  activePlan?: PlanKey | null
  renewDate?: string
}

export default function PricingHero({ activePlan, renewDate }: PricingHeroProps) {
  return (
    <section className="px-5 pt-8 pb-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-lg md:max-w-6xl mx-auto">
        <Link
          href="/pitch"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={14} />
          返回商业全景
        </Link>

        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <Wallet size={12} />
            <span>💰 OPC 阶梯式订阅与轻量级付费</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-3">
            从 <span className="text-amber-300">9.9 元</span> 起步，
            <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400">
              一路升级到 5980 元
            </span>
            主理人
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto">
            3 区块 6 档 · 从破冰到城市合伙人 · 适合「先体验 → 再订阅 → 后锁定分站」的渐进式消费。
          </p>

          {/* 当前订阅提示 */}
          {activePlan && (
            <div className="mt-5 inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-semibold px-4 py-2 rounded-full">
              <Check size={12} />
              <span>当前订阅：{PLANS.find((p) => p.key === activePlan)?.name}</span>
              {renewDate && (
                <span className="text-emerald-300/80">· 下次续费 {renewDate}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
