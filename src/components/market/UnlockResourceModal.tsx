'use client'

/**
 * 资源库 · 解锁资源弹窗（任务 3 · 复用组件）
 * ------------------------------------------------------------
 * 触发场景：用户点击资源卡片的"解锁资源 →"按钮
 *
 * 双模式分支（按 resource.unlockMode 区分）：
 *   - 'practice-or-member'（数字产品库等）：
 *       标题：📄 需要先解锁运营实操
 *       内容：此数字产品库专为进入【运营实操】阶段的用户准备
 *       按钮：左侧"去升级会员" + 右侧"去完成学习任务"
 *
 *   - 'member-only'（OPC 生态资源库等）：
 *       标题：🔒 会员专享
 *       内容：此教程库仅限 199 良朋社会员 及 1980 陪跑会员专享
 *       按钮：左侧"去升级会员"
 *
 * 引用方：
 *   - src/components/market/MarketContent.tsx （资源库 ResourceCard）
 * ------------------------------------------------------------
 */

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Sparkles,
  Lock,
  Crown,
  GraduationCap,
  Compass,
  Target,
  CheckCircle2,
  BookOpen,
  ArrowRight,
} from 'lucide-react'
import type { ResourceItem, UnlockMode } from '@/data/resource-items'
import { MEMBERSHIP_TIER_META, type MembershipTier } from '@/lib/user-membership'

interface UnlockResourceModalProps {
  resource: ResourceItem
  /** 用户当前 OPC 等级（用于决定右侧按钮跳哪个 guide 子页） */
  opcLevel: 'TRADER' | 'FLOW' | 'SYSTEM' | 'ASSET' | null
  /** 用户当前会员等级（用于显示文案"您已开通 XX 会员"） */
  currentTier: MembershipTier
  onClose: () => void
}

export function UnlockResourceModal({
  resource,
  opcLevel,
  currentTier,
  onClose,
}: UnlockResourceModalProps) {
  const router = useRouter()
  const mode: UnlockMode = resource.unlockMode || 'member-only'
  const tierMeta = MEMBERSHIP_TIER_META[currentTier] || MEMBERSHIP_TIER_META.none
  const isAlreadyMember = currentTier !== 'none'

  /**
   * "去完成学习任务"按钮 → 根据 opcLevel 跳到对应 guide 子页
   * 未诊断用户兜底跳 /guide/trader
   */
  const learnTaskHref = opcLevel
    ? `/guide/${opcLevel.toLowerCase()}`
    : '/guide/trader'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 md:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部渐变 Hero */}
        <div
          className={`relative px-5 pt-5 pb-5 text-white ${
            mode === 'practice-or-member'
              ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500'
              : 'bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600'
          }`}
        >
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
            <div className="flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl">
              {resource.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-extrabold tracking-widest uppercase text-white/85 mb-0.5 flex items-center gap-1">
                <Lock size={10} />
                {mode === 'practice-or-member' ? 'PRACTICE GATE' : 'MEMBER ONLY'}
              </div>
              <h3 className="text-base md:text-lg font-extrabold leading-tight">
                {mode === 'practice-or-member'
                  ? '📄 需要先解锁运营实操'
                  : '🔒 会员专享'}
              </h3>
              <p className="text-[11px] text-white/85 mt-1">
                {resource.title} ·{' '}
                {mode === 'practice-or-member'
                  ? '为实操阶段用户准备'
                  : '199/1980 会员专享内容'}
              </p>
            </div>
          </div>
        </div>

        {/* 主体内容 */}
        <div className="p-5 space-y-4">
          {/* 引导文案（按模式分支） */}
          {mode === 'practice-or-member' ? (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center">
                    <Target size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-extrabold text-amber-900 mb-0.5">
                      此数字产品库专为进入【运营实操】阶段的用户准备
                    </div>
                    <p className="text-[11px] text-amber-800/90 leading-relaxed">
                      解锁后您可以下载 AI 提示词包、PDF 教程、设计模板等实战素材。
                    </p>
                  </div>
                </div>
              </div>

              {/* 2 条解锁路径 */}
              <div>
                <div className="text-[10px] font-extrabold tracking-widest uppercase text-slate-500 mb-2 flex items-center gap-1">
                  <Compass size={11} />
                  UNLOCK · 两条路径任选
                </div>
                <div className="space-y-2.5">
                  {/* 路径 1：升级会员 */}
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-2.5">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center">
                        <Crown size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-extrabold text-blue-900 leading-tight">
                          路径 ① · 不想等待，立即开通
                        </div>
                        <div className="text-[10px] text-blue-700 mt-0.5">
                          升级为 199 良朋社会员 或 1980 陪跑会员，立即获取所有数字资源
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 路径 2：完成学习 */}
                  <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-start gap-2.5">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center">
                        <GraduationCap size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-extrabold text-emerald-900 leading-tight">
                          路径 ② · 完成学习，自动解锁
                        </div>
                        <div className="text-[10px] text-emerald-700 mt-0.5">
                          若您已完成【学习入门】任务（≥ 80 分），可前往项目库选品，自动解锁本资源
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* member-only 模式文案（任务 4） */}
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5">
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center">
                    <Crown size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-extrabold text-rose-900 mb-0.5">
                      此教程库仅限 199 良朋社会员 及 1980 陪跑会员专享
                    </div>
                    <p className="text-[11px] text-rose-800/90 leading-relaxed">
                      解锁后您可观看从入门到精通的视频课、实操 SOP 文档、系统化商业课程。
                    </p>
                  </div>
                </div>
              </div>

              {/* 会员等级展示 */}
              <div>
                <div className="text-[10px] font-extrabold tracking-widest uppercase text-slate-500 mb-2 flex items-center gap-1">
                  <Crown size={11} />
                  MEMBER TIER · 会员等级
                </div>
                <div className="space-y-2">
                  {(['weekly_card', 'coaching'] as const).map((t) => {
                    const m = MEMBERSHIP_TIER_META[t]
                    return (
                      <div
                        key={t}
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-xl"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center">
                          <Crown size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-900">{m.label}</div>
                          <div className="text-[10px] text-slate-500">{m.price}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* 当前用户状态条 */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2">
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  isAlreadyMember
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isAlreadyMember ? <CheckCircle2 size={14} /> : <Lock size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-slate-500">您当前的会员等级</div>
                <div className="text-sm font-bold text-slate-900">{tierMeta.label}</div>
              </div>
            </div>
          </div>

          {/* 底部操作按钮（按模式分支） */}
          <div className="space-y-2 pt-1">
            {mode === 'practice-or-member' ? (
              // 双按钮布局：左 升级会员 / 右 完成学习
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Link
                  href="/member"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 text-white text-xs md:text-sm font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <Crown size={14} />
                  <span>去升级会员</span>
                  <ArrowRight size={14} />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    router.push(learnTaskHref)
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs md:text-sm font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <GraduationCap size={14} />
                  <span>去完成学习任务</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              // member-only 单按钮（统一跳 /pricing 收银台）
              <Link
                href="/pricing"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-600 text-white text-sm font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <Crown size={16} />
                <span>立即升级会员</span>
                <ArrowRight size={16} />
              </Link>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              暂不升级，继续浏览
            </button>
          </div>

          {/* 底部说明 */}
          <div className="text-[10px] text-slate-400 text-center pt-1">
            {mode === 'practice-or-member' ? (
              <>
                <Sparkles size={10} className="inline-block mr-1 -mt-0.5" />
                解锁 STEP 02 学习入门（≥ 80 分）后会自动获得本资源访问权
              </>
            ) : (
              <>
                <BookOpen size={10} className="inline-block mr-1 -mt-0.5" />
                199/1980 会员可在资源库无限制观看全部教程与 SOP
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
