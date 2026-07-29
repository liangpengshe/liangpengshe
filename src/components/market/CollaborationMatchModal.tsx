'use client'

/**
 * 服务库 · 协作匹配弹窗（学习入门 → 找人合作 联动）
 * ------------------------------------------------------------
 * 触发条件：
 *   - 用户在 /guide/[level] 点击"找人合作"按钮
 *   - 跳转至 /market/services?from=guide&type=collaboration
 *   - 在服务库点击高亮的「OPC 陪跑」或「AI 网店代运营」卡片
 *
 * 功能：
 *   1. 展示与该服务 + 用户城市 + 用户 opcLevel 匹配的资深主理人 / 资产型 OPC
 *   2. 顶部"立即对接" → 展示联系方式（移动端 Toast / PC 复制）
 *   3. 底部"提交服务需求表单" → 关闭本弹窗，回到服务库的标准咨询流程
 * ------------------------------------------------------------
 * 引用方：src/components/market/MarketContent.tsx
 */

import { useEffect, useState } from 'react'
import {
  Sparkles,
  X,
  MapPin,
  CheckCircle2,
  MessageCircle,
  Send,
  Loader2,
  Award,
  Crown,
  Handshake,
  Diamond,
  Building2,
  ArrowRight,
} from 'lucide-react'
import type { ServiceItem } from '@/data/service-items'
import { toast } from '@/components/Toast'

export interface CollaborationExpert {
  id: string
  name: string
  city: string
  phone: string
  wechatMasked: string
  type: 'CITY_MAINTAINER' | 'ASSET_OPC'
  expertise_tags: string[]
  bio: string
  handledProjectCount: number
  matchScore: number
  fallback?: boolean
}

interface CollaborationMatchResponse {
  success: boolean
  message?: string
  serviceId: string
  serviceTitle: string
  cityMaintainers: CollaborationExpert[]
  assetExperts: CollaborationExpert[]
  recommend: CollaborationExpert[]
}

/** 友好的 opcLevel 中文标签 */
const OPC_LEVEL_CN: Record<string, string> = {
  TRADER: '交易型 OPC',
  FLOW: '流量型 OPC',
  SYSTEM: '系统型 OPC',
  ASSET: '资产型 OPC',
}

export function CollaborationMatchModal({
  service,
  opcLevel,
  city,
  onClose,
  onSubmitForm,
}: {
  /** 当前点击的服务（opc-coaching / shop-group-daiyun） */
  service: ServiceItem
  /** 用户 OPC 类型（从 localStorage 'opc_level' 读取） */
  opcLevel?: 'TRADER' | 'FLOW' | 'SYSTEM' | 'ASSET' | null
  /** 用户当前城市（从 localStorage 读取，兜底 '深圳'） */
  city?: string | null
  onClose: () => void
  /** 点击"提交服务需求表单"时触发：关闭弹窗并打开标准需求表单 */
  onSubmitForm: () => void
}) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<CollaborationMatchResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [contactingId, setContactingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('/api/services/collaboration-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId: service.id,
        opcLevel: opcLevel ?? null,
        city: city ?? null,
      }),
    })
      .then((r) => r.json())
      .then((resp: CollaborationMatchResponse) => {
        if (cancelled) return
        if (resp.success) {
          setData(resp)
        } else {
          setError(resp.message || '服务异常')
        }
      })
      .catch((e) => {
        if (cancelled) return
        setError((e as Error).message || '网络异常')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [service.id, opcLevel, city])

  /**
   * 立即对接：移动端 Toast 展示完整联系方式 / PC 复制到剪贴板
   */
  const handleContact = (m: CollaborationExpert) => {
    setContactingId(m.id)
    if (typeof window !== 'undefined' && /Mobi|Android|iPhone/i.test(navigator.userAgent)) {
      toast.info(
        `📱 请添加 ${m.type === 'CITY_MAINTAINER' ? '主理人' : '资产型 OPC'} 微信：\n\n${m.name}（${m.city}）\n微信：${m.wechatMasked}\n电话：${m.phone}\n\n复制微信后到「微信 → 通讯录 → 添加朋友」搜索即可。`
      )
    } else {
      toast.info(
        `💻 ${m.type === 'CITY_MAINTAINER' ? '主理人' : '资产型 OPC'} 联系方式：\n\n${m.name}（${m.city}）\n微信：${m.wechatMasked}\n电话：${m.phone}\n\n点击确定后此信息已复制到剪贴板。`
      )
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(`微信：${m.wechatMasked} | 电话：${m.phone}`)
          .catch(() => {
            // 静默
          })
      }
    }
    setTimeout(() => setContactingId(null), 800)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 md:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full md:max-w-2xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部 Hero 渐变（紫金协作主题） */}
        <div className="relative px-5 pt-5 pb-4 bg-gradient-to-br from-purple-600 via-fuchsia-600 to-amber-500 text-white">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg"
          >
            ×
          </button>
          <div className="relative flex items-start gap-3">
            <div className="flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Handshake size={22} className="md:w-6 md:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-extrabold tracking-widest uppercase text-white/85 mb-0.5 flex items-center gap-1">
                <Sparkles size={10} />
                COLLAB · 协作匹配 · 已为你精准定位
              </div>
              <h3 className="text-base md:text-lg font-extrabold leading-tight">
                {service.icon} {service.title} · 匹配的资深 OPC 伙伴
              </h3>
              <p className="text-[11px] text-white/85 mt-1">
                {opcLevel && OPC_LEVEL_CN[opcLevel]
                  ? `基于您的【${OPC_LEVEL_CN[opcLevel]}】身份 + 城市（${city || '深圳'}）`
                  : `基于您的城市（${city || '深圳'}）`}
                ，为您筛出擅长 {service.title} 的主理人 / 资产型 OPC
              </p>
            </div>
          </div>
        </div>

        {/* 主体内容 */}
        <div className="p-5 space-y-4">
          {loading && (
            <div className="py-10 flex flex-col items-center gap-2 text-slate-500">
              <Loader2 className="animate-spin" size={28} />
              <p className="text-sm">正在匹配擅长 {service.title} 的资深主理人...</p>
            </div>
          )}

          {!loading && error && (
            <div className="py-8 text-center">
              <p className="text-sm text-rose-600 mb-3">⚠️ {error}</p>
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-blue-600 hover:underline"
              >
                稍后重试
              </button>
            </div>
          )}

          {!loading && data && (
            <>
              {data.recommend.some((m) => m.fallback) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-700 flex items-start gap-2">
                  <span className="text-base flex-shrink-0">💡</span>
                  <span>
                    未找到完全匹配的主理人，以下为相关领域最资深的 3 位伙伴，您可逐一咨询或直接提交需求表单。
                  </span>
                </div>
              )}

              {/* ════════ 城市主理人（本地落地）══════ */}
              {data.cityMaintainers.length > 0 && (
                <section>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                      <MapPin size={12} />
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-800 tracking-wide">
                      📍 城市主理人 · 本地落地
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      ({data.cityMaintainers.length})
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {data.cityMaintainers.map((m, i) => (
                      <ExpertCard
                        key={m.id}
                        expert={m}
                        rank={i + 1}
                        contactingId={contactingId}
                        onContact={handleContact}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* ════════ 资产型 OPC（系统级陪跑）══════ */}
              {data.assetExperts.length > 0 && (
                <section>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white">
                      <Diamond size={12} />
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-800 tracking-wide">
                      💎 资产型 OPC · 深度陪跑
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      ({data.assetExperts.length})
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {data.assetExperts.map((m, i) => (
                      <ExpertCard
                        key={m.id}
                        expert={m}
                        rank={data.cityMaintainers.length + i + 1}
                        contactingId={contactingId}
                        onContact={handleContact}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* ════════ 引导进入服务咨询表单（底部 CTA）══════ */}
              <div className="pt-3 border-t border-slate-200">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200">
                  <div className="flex items-start gap-2.5">
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white flex items-center justify-center">
                      <Send size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-extrabold text-slate-900 leading-tight">
                        没找到合适的主理人？直接提交您的需求表单
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        系统会根据您的【{opcLevel ? OPC_LEVEL_CN[opcLevel] : '智富身份'}】+ 城市自动派单到对应的城市主理人 / 资产型 OPC，
                        24h 内主动联系您。
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onSubmitForm}
                    className="mt-3 w-full inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 text-white text-sm font-extrabold py-3 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    <Building2 size={14} />
                    <span>提交《{service.title}》服务需求表单</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* 底部说明 */}
              <div className="text-[10px] text-slate-400 text-center pt-1 pb-1">
                点击「立即对接」将展示主理人完整微信号与电话 · 匹配数据每 5 分钟更新
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// 专家卡片（统一渲染 CITY_MAINTAINER / ASSET_OPC）
// ════════════════════════════════════════════════════════════════

function ExpertCard({
  expert,
  rank,
  contactingId,
  onContact,
}: {
  expert: CollaborationExpert
  rank: number
  contactingId: string | null
  onContact: (m: CollaborationExpert) => void
}) {
  const isAsset = expert.type === 'ASSET_OPC'
  return (
    <article
      className={`group relative bg-white border rounded-2xl p-4 transition-all hover:shadow-md ${
        isAsset
          ? 'border-purple-200 hover:border-purple-300'
          : 'border-slate-200 hover:border-blue-300'
      }`}
    >
      {/* 排名徽章 */}
      <div
        className={`absolute -top-2 -left-2 w-7 h-7 rounded-full text-white text-xs font-extrabold flex items-center justify-center shadow-md ring-2 ring-white ${
          isAsset
            ? 'bg-gradient-to-br from-purple-500 to-fuchsia-600'
            : 'bg-gradient-to-br from-amber-400 to-orange-500'
        }`}
      >
        {rank}
      </div>

      {/* 右上角色徽章 */}
      <span
        className={`absolute top-2 right-2 inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded ${
          isAsset
            ? 'text-purple-700 bg-purple-50 border border-purple-200'
            : 'text-amber-700 bg-amber-50 border border-amber-200'
        }`}
      >
        {isAsset ? <Diamond size={9} /> : <Crown size={9} />}
        {isAsset ? '资产型' : '主理人'}
      </span>

      <div className="flex items-start gap-3 mt-1">
        {/* 头像占位 */}
        <div
          className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl text-white flex items-center justify-center text-lg md:text-xl font-extrabold shadow-sm ${
            isAsset
              ? 'bg-gradient-to-br from-purple-500 to-fuchsia-600'
              : 'bg-gradient-to-br from-blue-500 to-indigo-600'
          }`}
        >
          {expert.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap pr-12">
            <h5 className="text-sm md:text-base font-extrabold text-slate-900 leading-tight">
              {expert.city} · {expert.name}
            </h5>
            {expert.fallback && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                兜底推荐
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
            <MapPin size={10} />
            {expert.city} · 擅长：
            {expert.expertise_tags.slice(0, 2).join(' / ')}
            {expert.expertise_tags.length > 2 && ` +${expert.expertise_tags.length - 2}`}
          </p>
          <p className="text-[11px] text-slate-600 leading-relaxed mt-1.5 line-clamp-2">
            {expert.bio}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap text-[10px] text-slate-500">
            <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
              <CheckCircle2 size={9} />
              已操盘 {expert.handledProjectCount} 个同类项目
            </span>
            {expert.matchScore > 0 && (
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-bold ${
                  isAsset
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                <Sparkles size={9} />
                匹配度 {expert.matchScore}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 底部动作区 */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="text-[10px] text-slate-500 flex items-center gap-1 min-w-0">
          <MessageCircle size={11} className="flex-shrink-0" />
          <span className="truncate">微信：</span>
          <span className="font-mono font-bold text-slate-700 truncate">
            {expert.wechatMasked}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onContact(expert)}
          disabled={contactingId === expert.id}
          className={`flex-shrink-0 inline-flex items-center gap-1.5 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 ${
            isAsset
              ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-700'
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
          }`}
        >
          {contactingId === expert.id ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Send size={12} />
          )}
          立即对接
        </button>
      </div>
    </article>
  )
}
