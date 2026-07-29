'use client'

/**
 * ════════════════════════════════════════════════════════════════
 *  会员中心 · 积分兑换卡片（PointsExchangeCard）
 * ════════════════════════════════════════════════════════════════
 *
 *  任务 P0-1：从 member/page.tsx 抽离的 Section
 *  - 原文件 2439 行 → 抽离后预计 < 2200 行
 *  - 包含：当前积分展示 + 兑换 SOP 弹窗 + 兑换成功反馈
 *  - 状态自包含（showSOPModal / redeemingId / redeemSuccess）
 *  - 数据源来自同级 _data/sopExchangeCatalog.ts（已 P1-5 抽离）
 *  - 外部 props: { points } — 当前积分余额
 *
 *  抽出后 member/page.tsx 只需：
 *    import { PointsExchangeCard } from './_components/PointsExchangeCard'
 *    <PointsExchangeCard points={points} />
 * ════════════════════════════════════════════════════════════════
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Coins, Gift, Loader2, Sparkles, X } from 'lucide-react'
import { toast } from '@/components/Toast'
import { SOP_EXCHANGE_CATALOG } from '../_data/sopExchangeCatalog'

interface PointsExchangeCardProps {
  points: number
}

export function PointsExchangeCard({ points }: PointsExchangeCardProps) {
  const router = useRouter()
  const [showSOPModal, setShowSOPModal] = useState(false)
  const [redeemingId, setRedeemingId] = useState<string | null>(null)
  const [redeemSuccess, setRedeemSuccess] = useState<{ title: string; cost: number } | null>(null)

  /** 兑换 SOP 资料 */
  const handleRedeemSOP = async (sop: (typeof SOP_EXCHANGE_CATALOG)[number]) => {
    if (points < sop.points) {
      toast.error(`积分不足，还差 ${sop.points - points} 分`)
      return
    }
    setRedeemingId(sop.id)
    try {
      const res = await fetch('/api/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'redeem-sop',
          sopId: sop.id,
          sopTitle: sop.title,
          costPoints: sop.points,
        }),
      })
      const j = await res.json().catch(() => null)
      if (j?.success) {
        setRedeemSuccess({ title: sop.title, cost: sop.points })
        toast.success(`兑换成功！已扣除 ${sop.points} 积分`)
        // 2.5s 后自动关闭
        setTimeout(() => {
          setShowSOPModal(false)
          setRedeemSuccess(null)
        }, 2500)
      } else {
        toast.error(j?.error || '兑换失败，请稍后重试')
      }
    } catch {
      toast.error('网络异常')
    } finally {
      setRedeemingId(null)
    }
  }

  return (
    <>
      <div
        data-testid="points-exchange-card"
        className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100"
      >
        {/* 顶部：当前积分 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-sm">
              <Coins size={18} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 tracking-widest">
                POINTS BALANCE · 我的积分
              </div>
              <div className="text-xl font-extrabold text-slate-900 leading-tight">
                ⭐ {points.toLocaleString()}{' '}
                <span className="text-xs font-medium text-slate-500">分</span>
              </div>
            </div>
          </div>
          {points < 200 ? (
            <Link
              href="/pricing"
              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            >
              赚积分 <ArrowRight size={10} />
            </Link>
          ) : (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              ✓ 可消费
            </span>
          )}
        </div>

        {/* 操作按钮组 */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowSOPModal(true)}
            data-testid="open-sop-modal"
            className="flex flex-col items-center justify-center gap-1 py-3 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200 rounded-xl transition-all active:scale-95"
          >
            <Gift size={16} className="text-amber-600" />
            <span className="text-[11px] font-bold text-amber-900">积分兑换 SOP 资料</span>
            <span className="text-[9px] text-amber-700/70">50-200 分/份</span>
          </button>
          <button
            onClick={() => router.push('/pricing?applyPoints=true')}
            data-testid="apply-points-to-renew"
            className="flex flex-col items-center justify-center gap-1 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-xl transition-all active:scale-95"
          >
            <Sparkles size={16} className="text-blue-600" />
            <span className="text-[11px] font-bold text-blue-900">积分抵扣续费</span>
            <span className="text-[9px] text-blue-700/70">最高抵 5 元</span>
          </button>
        </div>
      </div>

      {/* SOP 兑换弹窗 */}
      {showSOPModal && (
        <div
          data-testid="sop-exchange-modal"
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => !redeemSuccess && setShowSOPModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full md:max-w-2xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-yellow-300/30 rounded-full blur-2xl" />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-bold text-amber-100 tracking-widest mb-1 flex items-center gap-1">
                    <Gift size={10} />
                    SOP EXCHANGE · 积分兑换
                  </div>
                  <h2 className="text-xl md:text-2xl font-extrabold leading-tight">
                    🎁 兑换 SOP 资料库
                  </h2>
                  <p className="text-[11px] text-white/90 mt-1">
                    当前积分 <strong>⭐ {points.toLocaleString()}</strong>，可兑换下列精选 SOP
                  </p>
                </div>
                <button
                  onClick={() => setShowSOPModal(false)}
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  aria-label="关闭"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* 兑换成功提示 */}
            {redeemSuccess && (
              <div className="mx-6 mt-4 rounded-xl bg-emerald-50 border-2 border-emerald-200 p-3 flex items-center gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center text-lg">
                  ✓
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-emerald-900">兑换成功！</div>
                  <div className="text-[11px] text-emerald-700">
                    《{redeemSuccess.title}》已发送到您的资源中心
                    （已扣 {redeemSuccess.cost} 积分）
                  </div>
                </div>
              </div>
            )}

            {/* SOP 列表 */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-2">
              {SOP_EXCHANGE_CATALOG.map((sop) => {
                const affordable = points >= sop.points
                const isRedeeming = redeemingId === sop.id
                return (
                  <div
                    key={sop.id}
                    data-testid={`sop-item-${sop.id}`}
                    className={`relative rounded-xl border-2 p-3 transition-all ${
                      affordable
                        ? 'border-slate-200 hover:border-amber-300 bg-white'
                        : 'border-slate-100 bg-slate-50 opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              sop.category === '交易型 OPC'
                                ? 'bg-amber-100 text-amber-700'
                                : sop.category === '流量型 OPC'
                                  ? 'bg-rose-100 text-rose-700'
                                  : sop.category === '系统型 OPC'
                                    ? 'bg-blue-100 text-blue-700'
                                    : sop.category === '资产型 OPC'
                                      ? 'bg-violet-100 text-violet-700'
                                      : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {sop.category}
                          </span>
                          <span className="text-[9px] text-slate-400">📄 {sop.pages} 页</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {sop.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          {sop.desc}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRedeemSOP(sop)}
                        disabled={!affordable || isRedeeming || !!redeemSuccess}
                        data-testid={`redeem-sop-${sop.id}`}
                        className={`flex-shrink-0 inline-flex flex-col items-center justify-center px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${
                          affordable && !redeemSuccess
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white active:scale-95 shadow-sm'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {isRedeeming ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            兑换中
                          </>
                        ) : (
                          <>
                            <span className="text-base">⭐ {sop.points}</span>
                            <span className="text-[9px] mt-0.5">兑换</span>
                          </>
                        )}
                      </button>
                    </div>
                    {!affordable && (
                      <div className="mt-1.5 text-[10px] text-rose-500 font-semibold">
                        积分不足，还差 {sop.points - points} 分
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* 弹窗底部说明 */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
              <p className="text-[10px] text-slate-500 leading-relaxed text-center">
                兑换成功后，资料将自动存入「资源中心」，可在「我的资源」中查看
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
