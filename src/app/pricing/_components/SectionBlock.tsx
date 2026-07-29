'use client'

/**
 * 定价页 · 单个区块（区块标题 + 卡片网格）
 * 包含 3 种布局：
 *   - ice（破冰）：md:grid-cols-2
 *   - battle（实战）：md:grid-cols-3 md:items-stretch（高度统一）
 *   - expansion（扩张）：md:grid-cols-1（单卡 md:max-w-3xl 居中）
 */

import type { PricePlan, PlanKey } from '../_data/plan-types'
import type { SectionMeta } from '../_data/sections'
import PlanCard from './PlanCard'

interface SectionBlockProps {
  section: SectionMeta
  plans: PricePlan[]
  ownedPlans: PlanKey[]
  activeSubscription: PlanKey | null
  dailyCostMap: Map<PlanKey, string>
  userPoints: number
  pointsLoaded: boolean
}

export default function SectionBlock({
  section,
  plans,
  ownedPlans,
  activeSubscription,
  dailyCostMap,
  userPoints,
  pointsLoaded,
}: SectionBlockProps) {
  const isBattle = section.key === 'battle'
  const isExpansion = section.key === 'expansion'

  return (
    <section
      id={`section-${section.key}`}
      className={`scroll-mt-20 px-4 py-8 md:py-12 ${
        isExpansion ? 'bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white' : ''
      }`}
    >
      <div className="max-w-lg md:max-w-6xl mx-auto">
        {/* 区块标题 */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-1 h-10 rounded-full bg-gradient-to-b ${section.ribbon}`} />
            <div className="flex-1">
              <div
                className={`text-[10px] font-extrabold tracking-widest mb-0.5 ${
                  isExpansion ? 'text-amber-300' : 'text-slate-400'
                }`}
              >
                BLOCK {section.index}
              </div>
              <h2
                className={`text-xl md:text-3xl font-extrabold leading-tight ${
                  isExpansion ? 'text-white' : 'text-slate-900'
                }`}
              >
                {section.emoji} {section.title}
              </h2>
            </div>
          </div>
          <p
            className={`text-sm md:text-base ml-4 leading-relaxed ${
              isExpansion ? 'text-amber-100/80' : 'text-slate-500'
            }`}
          >
            {section.subtitle} · {section.hint}
          </p>
        </div>

        {/* 卡片网格 */}
        <div
          className={`grid grid-cols-1 ${
            isBattle
              ? 'md:grid-cols-3 md:items-stretch'
              : isExpansion
                ? 'md:grid-cols-1'
                : 'md:grid-cols-2'
          } gap-4`}
        >
          {plans.map((plan) => {
            const isOwned = ownedPlans.includes(plan.key)
            const isActive = activeSubscription === plan.key
            return (
              <PlanCard
                key={plan.key}
                plan={plan}
                isOwned={isOwned}
                isActive={isActive}
                dailyCost={dailyCostMap.get(plan.key) || ''}
                isExpansion={isExpansion}
                userPoints={userPoints}
                pointsLoaded={pointsLoaded}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
