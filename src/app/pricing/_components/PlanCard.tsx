'use client'

/**
 * 定价页 · 单个价格卡片
 * - 含锚点 ID + scroll-mt-20
 * - 锚点横幅、头部、价格、权益、矩阵、CTA
 */

import Link from 'next/link'
import {
  Check,
  X,
  Sparkles,
  Crown,
  Star,
  Lightbulb,
  Target,
  ArrowRight,
  Flame,
  Clock,
  Lock,
  Building2,
  Network,
  GraduationCap,
  Rocket,
  Coins,
} from 'lucide-react'

import type { PricePlan, PlanKey } from '../_data/plan-types'
import { MATRIX_DIMS } from '../_data/matrix'
import { getPlanAnchorId } from '../_data/anchor-ids'
import PayButton from './PayButton'

interface PlanCardProps {
  plan: PricePlan
  isOwned: boolean
  isActive: boolean
  dailyCost: string
  isExpansion: boolean
  userPoints?: number
  pointsLoaded?: boolean
}

export default function PlanCard({
  plan,
  isOwned,
  isActive,
  dailyCost,
  isExpansion,
  userPoints = 0,
  pointsLoaded = false,
}: PlanCardProps) {
  return (
    <div
      id={getPlanAnchorId(plan.key)}
      data-testid={`plan-card-${plan.key}`}
      className={`relative scroll-mt-20 ${plan.theme.bg} ${plan.theme.accent} border-2 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${
        isExpansion ? 'md:max-w-3xl md:mx-auto' : ''
      }`}
    >
      {/* 推荐角标 */}
      {plan.recommended && !isExpansion && (
        <div className="absolute top-0 right-0 z-10 bg-gradient-to-l from-rose-500 to-pink-500 text-white text-[11px] font-bold px-3 py-1 rounded-bl-2xl flex items-center gap-1 shadow-lg">
          <Flame size={10} />
          推荐
        </div>
      )}
      {isActive && (
        <div className="absolute top-0 left-0 z-10 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[11px] font-bold px-3 py-1 rounded-br-2xl flex items-center gap-1 shadow-lg">
          <Check size={10} />
          当前订阅
        </div>
      )}
      {isExpansion && (
        <div className="absolute top-0 right-0 z-10 bg-gradient-to-l from-amber-500 to-yellow-400 text-slate-900 text-[11px] font-bold px-3 py-1 rounded-bl-2xl flex items-center gap-1 shadow-lg">
          <Crown size={10} />
          城市合伙人
        </div>
      )}

      {/* 锚点横幅 */}
      <div
        className={`px-4 py-2.5 text-center text-[11px] font-semibold border-b ${
          plan.anchor.tone === 'red'
            ? 'bg-rose-50/90 text-rose-700 border-rose-100'
            : plan.anchor.tone === 'amber'
              ? 'bg-amber-50/90 text-amber-700 border-amber-100'
              : plan.anchor.tone === 'blue'
                ? 'bg-blue-50/90 text-blue-700 border-blue-100'
                : plan.anchor.tone === 'emerald'
                  ? 'bg-emerald-50/90 text-emerald-700 border-emerald-100'
                  : 'bg-amber-900/40 text-amber-200 border-amber-700/40'
        }`}
      >
        <span className="mr-1">{plan.anchor.emoji}</span>
        {plan.anchor.text}
      </div>

      {/* 头部 */}
      <div className={`${plan.theme.headerBg} px-5 py-4`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`${plan.theme.badgeBg} text-[10px] font-bold px-2 py-0.5 rounded-full`}>
            TIER 0{plan.tier}
          </span>
          {plan.badges.map((b, j) => (
            <span
              key={j}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm border ${
                isExpansion
                  ? 'bg-slate-900/30 text-amber-100 border-amber-300/30'
                  : 'bg-white/25 text-white border-white/30'
              }`}
            >
              {b}
            </span>
          ))}
        </div>
        <h3
          className={`font-extrabold text-xl leading-tight drop-shadow ${
            isExpansion ? 'text-slate-900' : 'text-white'
          }`}
        >
          {plan.name}
        </h3>
        <p
          className={`text-[11px] mt-1 leading-relaxed ${
            isExpansion ? 'text-slate-700' : 'text-white/90'
          }`}
        >
          {plan.tagline}
        </p>
        {/* 首月优惠提示（仅 MONTHLY_69） */}
        {plan.headlinePromo && (
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/20 backdrop-blur-sm border border-white/30">
            <Sparkles size={10} className="text-yellow-200" />
            <span className="text-[10px] font-extrabold text-white leading-tight">
              {plan.headlinePromo}
            </span>
          </div>
        )}
        {/* 核心价值（仅 599/1980/5980 展示） */}
        {plan.coreValue && (
          <div
            className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-md border ${
              isExpansion
                ? 'bg-amber-500/15 border-amber-500/30'
                : 'bg-white/15 border-white/25 backdrop-blur-sm'
            }`}
          >
            <Target size={10} className={isExpansion ? 'text-amber-300' : 'text-amber-200'} />
            <span
              className={`text-[10px] font-extrabold leading-tight ${
                isExpansion ? 'text-amber-200' : 'text-white'
              }`}
            >
              {plan.coreValue}
            </span>
          </div>
        )}
      </div>

      {/* 价格 */}
      <div className={`px-5 py-4 ${isExpansion ? 'bg-slate-900/40' : 'bg-white/60'}`}>
        <div className="flex items-baseline gap-1.5">
          {plan.originalPrice && (
            <span
              className={`text-sm line-through ${
                isExpansion ? 'text-amber-200/50' : 'text-slate-400'
              }`}
            >
              ¥{plan.originalPrice}
            </span>
          )}
          <span className={`text-xs ${isExpansion ? 'text-amber-200' : 'text-slate-500'}`}>
            ¥
          </span>
          <span className={`text-4xl font-extrabold leading-none ${plan.theme.priceColor}`}>
            {plan.key === 'MONTHLY_69' ? (
              <>
                <span className="text-2xl">9.9</span>
                <span
                  className={`text-base mx-0.5 ${
                    isExpansion ? 'text-amber-200' : 'text-slate-500'
                  }`}
                >
                  /
                </span>
                <span className="text-2xl">69</span>
              </>
            ) : (
              plan.price
            )}
          </span>
          <span
            className={`text-sm font-medium ${
              isExpansion ? 'text-amber-100' : 'text-slate-500'
            }`}
          >
            {plan.cycle}
          </span>
        </div>
        <p
          className={`text-[10px] mt-1.5 flex items-center gap-1 ${
            isExpansion ? 'text-amber-200/70' : 'text-slate-500'
          }`}
        >
          <Clock size={10} />
          {dailyCost}
        </p>
      </div>

      {/* 权益列表 */}
      <div className="px-5 py-4 space-y-2">
        {plan.benefits.map((b, j) => {
          const Icon = b.icon
          return (
            <div key={j} className="flex items-start gap-2 text-[13px]">
              <div
                className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${plan.theme.iconBg}`}
              >
                <Icon
                  size={11}
                  className={isExpansion ? 'text-amber-300' : plan.theme.priceColor}
                />
              </div>
              <span
                className={`leading-snug ${
                  isExpansion
                    ? b.highlight
                      ? 'font-bold text-amber-100'
                      : 'text-amber-50/90'
                    : b.highlight
                      ? 'font-bold text-slate-900'
                      : 'text-slate-700'
                }`}
              >
                {b.text}
              </span>
            </div>
          )
        })}
      </div>

      {/* 适合人群 */}
      <div className="px-5 pb-3">
        <p
          className={`text-[10px] leading-relaxed rounded-lg p-2 border ${
            isExpansion
              ? 'bg-slate-900/40 text-amber-100/80 border-amber-700/30'
              : 'bg-slate-50/80 text-slate-500 border-slate-100'
          }`}
        >
          {plan.target}
        </p>
      </div>

      {/* 订阅奖励说明 */}
      {plan.bonusNote && (
        <div className="px-5 pb-3">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-200 p-2.5">
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-amber-300/30 rounded-full blur-xl" />
            <p className="relative text-[11px] font-bold text-amber-900 leading-relaxed">
              {plan.bonusNote}
            </p>
          </div>
        </div>
      )}

      {/* 9.9 vs 19.9 区别引导（仅 MONTHLY_69） */}
      {plan.compareNote && (
        <div className="px-5 pb-3">
          <div className="rounded-xl bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 border border-rose-200 p-2.5">
            <p className="text-[11px] font-semibold text-rose-900 leading-relaxed">
              {plan.compareNote}
            </p>
          </div>
        </div>
      )}

      {/* 升级补差价提示（仅 PRO_598 / DEEP_1980） */}
      {plan.upgradeNote && (
        <div className="px-5 pb-3">
          <div className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 px-2.5 py-1.5">
            <ArrowRight size={12} className="text-amber-600 flex-shrink-0" />
            <span className="text-[10px] font-semibold text-amber-800 leading-tight">
              {plan.upgradeNote}
            </span>
          </div>
        </div>
      )}

      {/* 4 维权益权限矩阵 */}
      <div
        className={`px-5 pb-3 ${
          isExpansion ? 'border-t border-amber-700/30 pt-3' : ''
        }`}
      >
        <div
          className={`text-[10px] font-extrabold tracking-widest mb-2 flex items-center gap-1 ${
            isExpansion ? 'text-amber-300' : 'text-slate-500'
          }`}
        >
          <Lock size={9} />
          权益权限矩阵
        </div>
        <div
          className={`grid grid-cols-2 gap-1.5 rounded-xl p-2 ${
            isExpansion
              ? 'bg-slate-900/60 border border-amber-700/30'
              : 'bg-slate-50 border border-slate-200'
          }`}
        >
          {MATRIX_DIMS.map((dim) => {
            const ok = plan.matrix[dim.key as keyof typeof plan.matrix]
            const DimIcon = dim.Icon
            return (
              <div
                key={dim.key}
                className={`flex items-center gap-1.5 text-[11px] font-medium ${
                  ok
                    ? isExpansion
                      ? 'text-amber-200'
                      : 'text-slate-800'
                    : isExpansion
                      ? 'text-amber-100/40'
                      : 'text-slate-400'
                }`}
              >
                <span
                  className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                    ok
                      ? isExpansion
                        ? 'bg-amber-400 text-slate-900'
                        : 'bg-emerald-500 text-white'
                      : isExpansion
                        ? 'bg-slate-700 text-slate-500'
                        : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {ok ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
                </span>
                <DimIcon size={10} className="flex-shrink-0 opacity-70" />
                <span className="truncate">{dim.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5 pt-2">
        {isActive ? (
          <>
            {pointsLoaded && userPoints > 0 && (
              <div className="mb-2.5 flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 px-3 py-2">
                <Coins size={12} className="text-amber-600 flex-shrink-0" />
                <span className="text-[10px] font-semibold text-amber-900 leading-tight">
                  您当前有{' '}
                  <strong className="text-amber-700">{userPoints.toLocaleString()}</strong>{' '}
                  积分，续费时最高可抵扣 5 元。
                </span>
              </div>
            )}
            <Link
              href="/member"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-md text-sm flex items-center justify-center gap-1"
            >
              <Check size={14} />
              查看我的会员权益
            </Link>
          </>
        ) : isOwned ? (
          <button
            disabled
            className={`w-full font-bold py-3 rounded-xl text-sm cursor-not-allowed ${
              isExpansion
                ? 'bg-amber-500/30 text-amber-200'
                : 'bg-slate-200 text-slate-500'
            }`}
          >
            ✅ 已购买
          </button>
        ) : (
          <PayButton
            plan={plan}
            isExpansion={isExpansion}
            userPoints={userPoints}
            pointsLoaded={pointsLoaded}
          />
        )}
        <p
          className={`text-[10px] text-center mt-2 ${
            isExpansion ? 'text-amber-200/60' : 'text-slate-400'
          }`}
        >
          支持微信 / 支付宝 · 企业支付请联系客服
        </p>
      </div>
    </div>
  )
}
