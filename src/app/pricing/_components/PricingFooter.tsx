'use client'

/**
 * 定价页 · 底部兜底（退款说明 + 客服引导）
 */

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function PricingFooter() {
  return (
    <section className="px-4 py-6">
      <div className="max-w-lg md:max-w-3xl mx-auto text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-3 flex items-start gap-2 text-left">
          <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            所有套餐均支持 <strong>7 天无理由退款</strong>（深度陪跑 30 天 / 城市主理人 30 天）。
            支付即视为同意《良朋社 OPC 用户协议》与《隐私政策》。
          </p>
        </div>
        <p className="text-xs text-slate-400 mb-2">还有疑问？</p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          联系顾问 1V1 咨询 →
        </Link>
      </div>
    </section>
  )
}
