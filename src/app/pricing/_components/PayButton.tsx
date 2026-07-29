'use client'

/**
 * 定价页 · PayButton 支付按钮
 * - 走统一订单生成器 /api/order/create
 * - 任务 2：69/199/598/1980 订阅支持 200 积分抵扣 2 元
 * - 合作档（CITY_5980）直接跳 /partner
 */

import { useEffect, useState } from 'react'
import { ArrowRight, Coins } from 'lucide-react'

import type { PricePlan } from '../_data/plan-types'

const POINTS_DEDUCT_AMOUNT = 200 // 抵扣所需积分
const POINTS_DEDUCT_YUAN = 2 // 抵扣金额（元）

interface PayButtonProps {
  plan: PricePlan
  isExpansion?: boolean
  userPoints?: number
  pointsLoaded?: boolean
}

export default function PayButton({
  plan,
  isExpansion,
  userPoints = 0,
  pointsLoaded = false,
}: PayButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 任务 2：69/月 + 199/598/1980/年 支持积分抵扣
  const supportsDeduct =
    plan.key === 'MONTHLY_69' ||
    plan.key === 'BASIC_199' ||
    plan.key === 'PRO_598' ||
    plan.key === 'DEEP_1980'
  const canDeduct = supportsDeduct && userPoints >= POINTS_DEDUCT_AMOUNT
  // 任务 1：积分抵扣续费 - 读取 URL 参数 applyPoints=true 自动勾选
  const [usePointsDeduct, setUsePointsDeduct] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('applyPoints') === 'true' && canDeduct) {
      setUsePointsDeduct(true)
    }
  }, [canDeduct])

  // 合作档：不走支付，跳 /partner 申请表单
  const isPartner = plan.ctaAction === 'goto_partner' || plan.key === 'CITY_5980'

  // 实际支付价格（抵扣后）
  const actualPrice =
    usePointsDeduct && canDeduct ? Math.max(0, plan.price - POINTS_DEDUCT_YUAN) : plan.price

  const handlePay = async () => {
    // 合作档直接跳 /partner 申请表单，不走支付
    if (isPartner) {
      if (typeof window !== 'undefined') {
        window.location.href = '/partner'
      }
      return
    }

    if (loading) return
    setError(null)
    setLoading(true)
    try {
      const deviceId =
        (typeof window !== 'undefined' &&
          (window.localStorage.getItem('opc_device_id') ||
            window.localStorage.getItem('opc_partner_device_id'))) ||
        ''

      // 走统一订单生成器 /api/order/create
      // 它会返回 checkout_url（mock 模式 → /api/payment/mock-checkout?orderId=xxx）
      const createRes = await fetch('/api/order/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planKey: plan.key,
          userId: deviceId || 'anon-' + Date.now(),
          usePoints: usePointsDeduct && canDeduct,
          provider: 'mock',
        }),
      })
      const createJson = await createRes.json()
      if (!createJson.success) {
        setError(createJson.error || '订单创建失败')
        return
      }

      // 写本地积分余额（仅在订单使用了积分抵扣时）
      if (typeof window !== 'undefined' && createJson.pointsUsed > 0) {
        try {
          window.localStorage.setItem(
            'opc_points_balance',
            String(createJson.userPointsAfterDiscount ?? userPoints - createJson.pointsUsed)
          )
        } catch {
          /* 静默 */
        }
      }

      // 跳转到网关（mock 模式直接 GET，Stripe/Polar 是 checkout_url）
      if (createJson.checkoutUrl) {
        if (typeof window !== 'undefined') {
          window.location.href = createJson.checkoutUrl
        }
        return
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* 积分抵扣勾选框（仅 69/199/598/1980 订阅 + 积分 >= 200） */}
      {supportsDeduct && pointsLoaded && canDeduct && (
        <label className="flex items-start gap-2 mb-2 p-2 rounded-lg bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200 cursor-pointer hover:from-amber-100 hover:to-orange-100 transition-colors">
          <input
            type="checkbox"
            checked={usePointsDeduct}
            onChange={(e) => setUsePointsDeduct(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-2 border-amber-400 text-amber-500 focus:ring-2 focus:ring-amber-300 cursor-pointer"
          />
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-extrabold text-amber-900 leading-tight">
              ✔️ 使用 {POINTS_DEDUCT_AMOUNT} 积分抵扣 ¥{POINTS_DEDUCT_YUAN}
            </div>
            <div className="text-[10px] text-amber-700/80 leading-tight mt-0.5">
              您当前有{' '}
              <span className="font-bold text-amber-800">{userPoints}</span> 积分
              {usePointsDeduct && (
                <>
                  {' '}· 实付：
                  <span className="line-through opacity-60">¥{plan.price}</span>{' '}
                  <span className="font-extrabold text-rose-600">¥{actualPrice}</span>
                </>
              )}
            </div>
          </div>
        </label>
      )}
      {/* 提示：积分不足时显示补充说明 */}
      {supportsDeduct && pointsLoaded && !canDeduct && userPoints > 0 && (
        <p className="text-[10px] text-slate-400 text-center mb-1.5">
          💎 积分不足 200（当前 {userPoints}），无法抵扣
        </p>
      )}

      <button
        onClick={handlePay}
        disabled={loading}
        className={`w-full ${plan.theme.buttonBg} text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all text-sm flex items-center justify-center gap-1 disabled:opacity-60 ${
          isExpansion ? 'text-slate-900' : ''
        }`}
      >
        {loading ? (
          <span className="animate-pulse">⏳ 支付中...</span>
        ) : (
          <>
            <span>
              {usePointsDeduct && canDeduct
                ? plan.cta.replace(/(\d+(\.\d+)?)/, String(actualPrice))
                : plan.cta}
            </span>
            <ArrowRight size={14} />
          </>
        )}
      </button>
      {error && <p className="text-[10px] text-rose-600 text-center mt-1.5">⚠️ {error}</p>}
    </div>
  )
}
