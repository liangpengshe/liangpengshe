'use client'

/**
 * 项目库 · 寻找资深 OPC 弹窗（任务 3 · 复用组件）
 * ------------------------------------------------------------
 * 流程：
 *   1. 打开弹窗 → 调用 /api/projects/find-opc 拉取匹配主理人
 *   2. 展示前 3 名主理人卡片（姓名/城市/擅长/已操盘同类项目数/bio/微信号）
 *   3. 每张卡片底部 "立即对接" 按钮 → 弹窗展示微信号（移动端/PC 通用）
 * 边界：未匹配到时显示 fallback 提示，并保留主理人列表
 * ------------------------------------------------------------
 * 引用方：
 *   - src/components/market/MarketContent.tsx （项目库列表 → 卡片次按钮）
 *   - src/app/market/projects/[slug]/page.tsx （项目详情页 → 底部 CTA）
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
} from 'lucide-react'
import type { ProjectItem } from '@/data/project-items'
import { toast } from '@/components/Toast'

export interface SeniorOPCMaintainer {
  id: string
  name: string
  city: string
  phone: string
  wechatMasked: string
  expertise_tags: string[]
  handledProjectCount: number
  bio: string
  matchScore: number
  fallback?: boolean
}

interface FindOPCResponse {
  success: boolean
  message?: string
  projectId: string
  projectTitle: string
  projectCategory: string
  maintainers: SeniorOPCMaintainer[]
  total: number
}

export function FindSeniorOPCModal({
  project,
  onClose,
}: {
  project: ProjectItem
  onClose: () => void
}) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<FindOPCResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [contactingId, setContactingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('/api/projects/find-opc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: project.id, projectCategory: project.category }),
    })
      .then((r) => r.json())
      .then((resp: FindOPCResponse) => {
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
  }, [project.id, project.category])

  /**
   * 立即对接：移动端尝试 wechat:// 唤起微信，PC 显示微信号 + 复制
   */
  const handleContact = (m: SeniorOPCMaintainer) => {
    setContactingId(m.id)
    if (typeof window !== 'undefined' && /Mobi|Android|iPhone/i.test(navigator.userAgent)) {
      toast.info(
        `📱 请添加主理人微信：\n\n${m.name}（${m.city}）\n微信：${m.wechatMasked}\n电话：${m.phone}\n\n复制微信后到「微信 → 通讯录 → 添加朋友」搜索即可。`
      )
    } else {
      toast.info(
        `💻 主理人联系方式：\n\n${m.name}（${m.city}）\n微信：${m.wechatMasked}\n电话：${m.phone}\n\n点击确定后此信息已复制到剪贴板。`
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
        {/* 顶部 Hero 渐变 */}
        <div className="relative px-5 pt-5 pb-4 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
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
              <Award size={22} className="md:w-6 md:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-extrabold tracking-widest uppercase text-white/85 mb-0.5 flex items-center gap-1">
                <Sparkles size={10} />
                FIND · 寻找资深 OPC · 已自动匹配
              </div>
              <h3 className="text-base md:text-lg font-extrabold leading-tight">
                {project.categoryEmoji} {project.title} · 匹配到的资深主理人
              </h3>
              <p className="text-[11px] text-white/85 mt-1">
                按项目分类（{project.category}）匹配擅长领域，已为你筛出前 3 名
              </p>
            </div>
          </div>
        </div>

        {/* 主体内容 */}
        <div className="p-5 space-y-3">
          {loading && (
            <div className="py-10 flex flex-col items-center gap-2 text-slate-500">
              <Loader2 className="animate-spin" size={28} />
              <p className="text-sm">正在匹配擅长 {project.category} 的主理人...</p>
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
              {data.maintainers.some((m) => m.fallback) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-700 flex items-start gap-2">
                  <span className="text-base flex-shrink-0">💡</span>
                  <span>
                    未找到完全匹配的主理人，以下为相关领域最资深的 3 位主理人，您可逐一咨询。
                  </span>
                </div>
              )}

              <div className="space-y-3">
                {data.maintainers.map((m, i) => (
                  <article
                    key={m.id}
                    className="group relative bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-4 transition-all hover:shadow-md"
                  >
                    {/* 排名徽章 */}
                    <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-extrabold flex items-center justify-center shadow-md ring-2 ring-white">
                      {i + 1}
                    </div>

                    <div className="flex items-start gap-3">
                      {/* 头像占位 */}
                      <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-lg md:text-xl font-extrabold shadow-sm">
                        {m.name.charAt(0)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm md:text-base font-extrabold text-slate-900 leading-tight">
                            {m.city}主理人 · {m.name}
                          </h4>
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                            <Crown size={9} />
                            资深
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin size={10} />
                          {m.city} · 擅长：
                          {m.expertise_tags.slice(0, 2).join(' / ')}
                          {m.expertise_tags.length > 2 && ` +${m.expertise_tags.length - 2}`}
                        </p>
                        <p className="text-[11px] text-slate-600 leading-relaxed mt-1.5 line-clamp-2">
                          {m.bio}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap text-[10px] text-slate-500">
                          <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                            <CheckCircle2 size={9} />
                            已操盘 {m.handledProjectCount} 个同类项目
                          </span>
                          {m.matchScore > 0 && (
                            <span className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-bold">
                              <Sparkles size={9} />
                              领域匹配度 {m.matchScore}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 底部动作区 */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <MessageCircle size={11} />
                        微信：
                        <span className="font-mono font-bold text-slate-700">{m.wechatMasked}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleContact(m)}
                        disabled={contactingId === m.id}
                        className="flex-shrink-0 inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all"
                      >
                        {contactingId === m.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Send size={12} />
                        )}
                        立即对接
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* 底部说明 */}
              <div className="text-[10px] text-slate-400 text-center pt-2 pb-1">
                匹配数据每 5 分钟更新一次；点击"立即对接"将展示主理人完整微信号与电话
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
