'use client'

/**
 * 良朋社 OPC · 定价页
 * ------------------------------------------------------------
 * 架构进化（演进六）：
 *   - 1 → 8+ 拆分：Hero / StickyNav / SectionBlock / PlanCard
 *     / PayButton / PlanRecommendation / PlanComparisonTable
 *     / PricingFAQ / PricingFooter 全部独立组件
 *   - 1 → 4+ 数据层：_data/plan-types.ts / plans.ts / sections.ts
 *     / matrix.ts / anchor-ids.ts / faqs.ts
 *   - 主页面只剩"装配逻辑 + 状态 + 滚动监听"
 * ------------------------------------------------------------
 * 6 档定价（重组）：
 *   区块一·破冰与连接：智富先锋卡 19.9 / 智富社群 199
 *   区块二·实战与陪跑：单店月卡 69 / 轻陪跑 598 / 深度陪跑 1980
 *   区块三·扩张与授权：城市主理人/项目授权 5980
 * ------------------------------------------------------------
 */

import { useEffect, useMemo, useState } from 'react'

import { PLANS } from './_data/plans'
import { SECTIONS } from './_data/sections'
import type { PlanKey, SectionKey } from './_data/plan-types'

import PricingHero from './_components/PricingHero'
import StickySectionNav from './_components/StickySectionNav'
import SectionBlock from './_components/SectionBlock'
import PlanRecommendation from './_components/PlanRecommendation'
import PlanComparisonTable from './_components/PlanComparisonTable'
import PricingFAQ from './_components/PricingFAQ'
import PricingFooter from './_components/PricingFooter'

export default function PricingPage() {
  // 已订阅状态（从 localStorage 读）
  const [ownedPlans, setOwnedPlans] = useState<PlanKey[]>([])
  const [activeSubscription, setActiveSubscription] = useState<{
    plan: PlanKey
    renewDate?: string
  } | null>(null)

  // 当前激活的区块（吸顶导航用）
  const [activeSection, setActiveSection] = useState<SectionKey>('ice')

  // 智富积分余额 + 抵扣开关
  const [userPoints, setUserPoints] = useState<number>(0)
  const [pointsLoaded, setPointsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const owned = JSON.parse(window.localStorage.getItem('opc_owned_plans') || '[]')
      setOwnedPlans(owned)
      const active = window.localStorage.getItem('opc_active_subscription')
      if (active) {
        const parsed = JSON.parse(active)
        setActiveSubscription(parsed)
      }
    } catch {
      // 静默
    }

    // 读取智富积分（用于 69/199 订阅抵扣）
    const deviceId =
      (typeof window !== 'undefined' &&
        (window.localStorage.getItem('opc_device_id') ||
          window.localStorage.getItem('opc_partner_device_id'))) ||
      ''
    if (deviceId) {
      fetch('/api/points?userId=' + encodeURIComponent(deviceId))
        .then((r) => r.json())
        .then((j) => {
          if (j?.success) {
            setUserPoints(j.data?.points || 0)
          }
        })
        .catch(() => {})
        .finally(() => setPointsLoaded(true))
    } else {
      setPointsLoaded(true)
    }
  }, [])

  // 滚动监听 · 吸顶导航联动
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleScroll = () => {
      const offsets = SECTIONS.map((s) => {
        const el = document.getElementById(`section-${s.key}`)
        if (!el) return { key: s.key, top: Infinity }
        return { key: s.key, top: el.getBoundingClientRect().top }
      })
      // 选第一个 top <= 120 的 section
      const current = offsets.find((o) => o.top <= 120)
      if (current && current.key !== activeSection) {
        setActiveSection(current.key as SectionKey)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeSection])

  // 每日均价映射（供 PlanCard 显示）
  const dailyCostMap = useMemo(() => {
    const map = new Map<PlanKey, string>()
    PLANS.forEach((p) => {
      const text =
        p.cycle === '/ 月'
          ? `≈ ${(p.price / 30).toFixed(1)} 元/天`
          : p.cycle === '/ 年'
            ? `≈ ${(p.price / 365).toFixed(1)} 元/天`
            : p.cycle === '一次性'
              ? '一次性付费 · 永久使用'
              : ''
      map.set(p.key, text)
    })
    return map
  }, [])

  const scrollToSection = (key: SectionKey) => {
    if (typeof window === 'undefined') return
    const el = document.getElementById(`section-${key}`)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      <PricingHero
        activePlan={activeSubscription?.plan}
        renewDate={activeSubscription?.renewDate}
      />

      <StickySectionNav
        activeSection={activeSection}
        onSectionClick={scrollToSection}
      />

      {/* 三区块 6 档 */}
      {SECTIONS.map((section) => {
        const sectionPlans = PLANS.filter((p) => p.section === section.key)
        return (
          <SectionBlock
            key={section.key}
            section={section}
            plans={sectionPlans}
            ownedPlans={ownedPlans}
            activeSubscription={activeSubscription?.plan ?? null}
            dailyCostMap={dailyCostMap}
            userPoints={userPoints}
            pointsLoaded={pointsLoaded}
          />
        )
      })}

      <PlanRecommendation onSectionClick={scrollToSection} />
      <PlanComparisonTable />
      <PricingFAQ />
      <PricingFooter />
    </div>
  )
}
