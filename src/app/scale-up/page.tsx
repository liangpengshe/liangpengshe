/**
 * 矩阵放大综合控制台 · STEP 04（任务 5 部分）
 * ------------------------------------------------------------
 * 路由: /scale-up
 *
 * 板块（5 大模块）：
 *   ① 顶部 Hero：深色科技风 + 主标题 + 状态条（已解锁/未解锁 二态）
 *   ② 解锁任务清单：仅在未解锁时显示，引导用户完成 STEP 01~03
 *   ③ 高阶 OPC 引擎：系统型 / 资产型 双卡 → 跳 /guide/{system|asset}
 *   ④ 高阶服务与资源：OPC 陪跑 / AI 代运营 / 城市主理人 三卡
 *   ⑤ 多平台矩阵管理入口：玻璃态卡片 → 跳 /market/tools 并锚定 highlight
 *
 * 视觉层级修复（2026-07-14）：
 *   - 删除原 Hero 外部的冗余"降级提示块"（与 Hero 内 status banner 重复）
 *   - 将引导按钮（返回首页/去完成 STEP 03）整合到 Hero 内的状态条中
 *   - 未解锁时整页加一个"解锁任务清单"区块，明确告知前置条件
 *   - 6 大核心卡片在未解锁时加半透明遮罩 + 锁角标
 *
 * 与首页 STEP 04 联动：
 *   - src/app/page.tsx 中 learningPath[3].href = '/scale-up'
 *   - 首页 handleClick 中已加 STEP 04 拦截（未解锁 → alert）
 * ------------------------------------------------------------
 */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Rocket,
  ArrowRight,
  Sparkles,
  Settings2,
  Gem,
  Layers,
  MapPin,
  Bot,
  CheckCircle2,
  Lock,
  Crown,
  Target,
  Loader2,
  Building2,
  TrendingUp,
  Briefcase,
  Wrench,
  Compass,
  BookOpen,
  Wrench as WrenchIcon,
  HeartHandshake,
  ShieldCheck,
  Circle,
} from 'lucide-react'

// ════════════════════════════════════════════════════════════════
// 类型定义
// ════════════════════════════════════════════════════════════════

interface LiveProgress {
  opcLevel?: string
  learning_score: number
  can_unlock_practice: boolean
  step_practice_done: boolean
  step_scaleup_done: boolean
}

const LEVEL_HINT: Record<string, string> = {
  TRADER: '交易型',
  FLOW: '流量型',
  SYSTEM: '系统型',
  ASSET: '资产型',
}

// ════════════════════════════════════════════════════════════════
// 工具函数
// ════════════════════════════════════════════════════════════════

function getDeviceId(): string {
  if (typeof window === 'undefined') return 'ssr-device'
  let id = window.localStorage.getItem('opc_device_id')
  if (!id) {
    id = `dev-${Date.now()}-${Math.floor(Math.random() * 100000)}`
    window.localStorage.setItem('opc_device_id', id)
  }
  return id
}

// ════════════════════════════════════════════════════════════════
// 主页面
// ════════════════════════════════════════════════════════════════

export default function ScaleUpPage() {
  const router = useRouter()
  const [progress, setProgress] = useState<LiveProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)

  // 拉取学习进度
  useEffect(() => {
    const phone = getDeviceId()
    fetch(`/api/user/learning-progress?phone=${encodeURIComponent(phone)}`)
      .then((r) => r.json())
      .then((resp) => {
        if (resp.success) setProgress(resp.data)
      })
      .catch(() => {
        // 静默降级
      })
      .finally(() => setLoading(false))
  }, [])

  // 已解锁 → 自动标记 STEP 04 进入（scaleup-done）
  useEffect(() => {
    if (
      !progress ||
      progress.step_scaleup_done ||
      !progress.can_unlock_practice ||
      marking
    )
      return
    setMarking(true)
    const phone = getDeviceId()
    fetch('/api/user/learning-progress', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, action: 'scaleup-done' }),
    })
      .then((r) => r.json())
      .then((resp) => {
        if (resp.success) setProgress(resp.data)
      })
      .catch(() => {
        // 静默
      })
      .finally(() => setMarking(false))
  }, [progress, marking])

  const allowed = progress?.can_unlock_practice === true
  const levelHint = progress?.opcLevel ? LEVEL_HINT[progress.opcLevel] : null
  const practiceDone = progress?.step_practice_done === true
  const diagnosisDone = progress?.learning_score !== undefined && progress.learning_score > 0
  const learningScore = progress?.learning_score ?? 0
  const learningOk = learningScore >= 80

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ════════ ① 顶部 Hero（深色科技风）══════ */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        {/* 装饰光斑 */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />

        {/* 网格背景 */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative max-w-lg md:max-w-6xl mx-auto px-5 md:px-6 pt-10 md:pt-16 pb-10 md:pb-14">
          {/* 步骤徽章 */}
          <div className="inline-flex items-center gap-1.5 text-[10px] md:text-xs font-extrabold tracking-widest uppercase bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 px-3 py-1.5 rounded-full shadow-lg shadow-amber-500/30">
            <Rocket size={12} />
            STEP 04 · 矩阵放大
          </div>

          {/* 主标题 */}
          <h1 className="mt-4 text-3xl md:text-5xl font-black leading-tight tracking-tight">
            🚀 矩阵放大：<span className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent">从 1 到 N</span>
          </h1>

          {/* 副标题 */}
          <p className="mt-3 text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
            跨平台、跨店铺、跨形态的规模化复制与控制塔。
            <br className="hidden md:block" />
            在这里统一调度 OPC 系统型 / 资产型路线、城市主理人网络、多平台账号矩阵。
          </p>

          {/* 状态条 + 内嵌引导按钮（避免冗余卡片遮挡） */}
          <div className="mt-5 md:mt-6">
            {loading ? (
              <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 border border-slate-700 px-4 py-2.5 rounded-full">
                <Loader2 size={12} className="animate-spin" />
                正在加载您的放大阶段状态…
              </div>
            ) : allowed ? (
              <div className="inline-flex flex-wrap items-center gap-2 text-xs md:text-sm font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-400/30 backdrop-blur-md px-4 py-2.5 rounded-full">
                <Sparkles size={14} className="text-amber-300" />
                🎉 恭喜！您已解锁 OPC 矩阵放大阶段。现在，让您的商业系统开始自动繁殖。
                {levelHint && (
                  <span className="ml-1 text-amber-300/90">· {levelHint} OPC</span>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-amber-500/10 border border-amber-400/30 backdrop-blur-md p-4 md:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md">
                    <Lock size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] md:text-xs font-extrabold tracking-widest uppercase text-amber-300 mb-0.5">
                      SCALE-UP · 前置检查
                    </div>
                    <div className="text-sm md:text-base font-extrabold text-white leading-tight">
                      🔒 矩阵放大尚未解锁
                    </div>
                    <div className="text-[11px] md:text-xs text-slate-300 mt-1 leading-relaxed">
                      您正在查看控制台预览。完成「诊断 → 学习入门（≥ 80 分）→ 运营实操」即可自动解锁。
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => router.push('/market/projects')}
                        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-[10px] md:text-xs font-extrabold px-3 py-2 rounded-lg shadow-sm transition-colors whitespace-nowrap"
                      >
                        <Briefcase size={12} />
                        去完成运营实操 (STEP 03)
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push('/')}
                        className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[10px] md:text-xs font-bold px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                      >
                        ← 返回首页
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════ ② 解锁任务清单（仅未解锁时显示）══════ */}
      {!loading && !allowed && (
        <section className="max-w-lg md:max-w-6xl mx-auto px-5 md:px-6 pt-5">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 md:p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                <ShieldCheck size={16} />
              </div>
              <div>
                <div className="text-[10px] md:text-xs font-extrabold tracking-widest uppercase text-blue-700 mb-0.5">
                  UNLOCK CHECKLIST
                </div>
                <h2 className="text-base md:text-lg font-extrabold text-slate-900 leading-tight">
                  解锁矩阵放大 · 3 步走
                </h2>
              </div>
            </div>

            <ol className="space-y-2.5">
              {[
                {
                  step: '01',
                  title: '完成 OPC 智富入局诊断',
                  desc: '确定你的 OPC 层级（交易型 / 流量型 / 系统型 / 资产型）',
                  icon: Compass,
                  done: !!progress?.opcLevel,
                  href: '/diagnosis',
                  cta: '去诊断',
                },
                {
                  step: '02',
                  title: `学习入门达到 80 分（当前 ${learningScore} 分）`,
                  desc: '完成新手 3 任务：浏览 / 注册 / 下载，累计 ≥ 80 分',
                  icon: BookOpen,
                  done: learningOk,
                  href: '/market',
                  cta: '去学习',
                },
                {
                  step: '03',
                  title: '完成运营实操（首个项目 SOP）',
                  desc: '从项目库精准选品并跑通第一套商业闭环',
                  icon: WrenchIcon,
                  done: practiceDone,
                  href: '/market/projects',
                  cta: '去实操',
                },
              ].map((it) => {
                const Icon = it.icon
                const StepIcon = it.done ? CheckCircle2 : Circle
                return (
                  <li
                    key={it.step}
                    className={`flex items-start gap-3 p-3 rounded-xl border ${
                      it.done
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold ${
                        it.done
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-300 text-slate-600'
                      }`}
                    >
                      {it.done ? <CheckCircle2 size={16} /> : it.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-[12px] md:text-sm font-bold leading-tight ${
                          it.done ? 'text-emerald-800 line-through opacity-80' : 'text-slate-900'
                        }`}
                      >
                        {it.title}
                      </div>
                      <div className="text-[10px] md:text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {it.desc}
                      </div>
                    </div>
                    {!it.done && (
                      <Link
                        href={it.href}
                        className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] md:text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <Icon size={11} />
                        {it.cta}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ol>
          </div>
        </section>
      )}

      {/* ════════ ③ 高阶 OPC 引擎（系统型 / 资产型）══════ */}
      <section className="max-w-lg md:max-w-6xl mx-auto px-5 md:px-6 pt-6 md:pt-8">
        <div className="mb-4 md:mb-5">
          <div className="text-[10px] md:text-xs font-extrabold tracking-widest uppercase text-blue-700 mb-0.5 flex items-center gap-1">
            <Layers size={11} />
            {allowed ? '02 · 高阶 OPC 引擎' : '02 · 高阶 OPC 引擎 · 预览'}
          </div>
          <h2 className="text-lg md:text-2xl font-extrabold text-slate-900">
            承接四层阶梯的第三、第四层
          </h2>
          <p className="text-[11px] md:text-sm text-slate-500 mt-1">
            在交易 / 流量闭环跑通之后，从「系统化定制」与「资产化复制」两条路线升级
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 卡片一：系统型 OPC */}
          <article className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all">
            {!allowed && (
              <div className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-bold bg-white/25 backdrop-blur px-2 py-1 rounded-full">
                <Lock size={10} />
                待解锁
              </div>
            )}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/15 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center ring-2 ring-white/30">
                  <Settings2 size={22} />
                </div>
                <div>
                  <div className="text-[10px] font-extrabold tracking-widest uppercase text-white/80 mb-0.5">
                    THIRD LAYER · 第三层
                  </div>
                  <h3 className="text-lg md:text-xl font-extrabold leading-tight">
                    ⚙️ 系统型 OPC
                  </h3>
                </div>
              </div>
              <p className="text-[12px] md:text-sm text-white/90 leading-relaxed">
                企业流程改造、高客单定制、系统自动化开发。承接 KA 客户，复用既有 SOP 形成行业解决方案。
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {['企业流程改造', '高客单定制', '系统自动化', '行业 SaaS'].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center text-[10px] font-bold bg-white/20 backdrop-blur px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href="/guide/system"
                className="mt-5 inline-flex items-center gap-1.5 bg-white text-blue-700 hover:bg-blue-50 text-xs md:text-sm font-extrabold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
              >
                前往系统定制路线
                <ArrowRight size={14} />
              </Link>
            </div>
          </article>

          {/* 卡片二：资产型 OPC */}
          <article className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-indigo-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all">
            {!allowed && (
              <div className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-bold bg-white/25 backdrop-blur px-2 py-1 rounded-full">
                <Lock size={10} />
                待解锁
              </div>
            )}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/15 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center ring-2 ring-white/30">
                  <Gem size={22} />
                </div>
                <div>
                  <div className="text-[10px] font-extrabold tracking-widest uppercase text-white/80 mb-0.5">
                    FOURTH LAYER · 第四层
                  </div>
                  <h3 className="text-lg md:text-xl font-extrabold leading-tight">
                    💎 资产型 OPC
                  </h3>
                </div>
              </div>
              <p className="text-[12px] md:text-sm text-white/90 leading-relaxed">
                数字资产售卖、AI 外包、全球跨境出海。把单店 SOP 封装为可售卖、可授权、可复制的资产。
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {['数字资产售卖', 'AI 外包交付', '全球跨境出海', '品牌授权'].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center text-[10px] font-bold bg-white/20 backdrop-blur px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href="/guide/asset"
                className="mt-5 inline-flex items-center gap-1.5 bg-white text-violet-700 hover:bg-violet-50 text-xs md:text-sm font-extrabold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
              >
                前往资产放大路线
                <ArrowRight size={14} />
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* ════════ ④ 高阶服务与资源（陪跑 / 代运营 / 城市主理人）══════ */}
      <section className="max-w-lg md:max-w-6xl mx-auto px-5 md:px-6 pt-6 md:pt-8">
        <div className="mb-4 md:mb-5">
          <div className="text-[10px] md:text-xs font-extrabold tracking-widest uppercase text-violet-700 mb-0.5 flex items-center gap-1">
            <Target size={11} />
            {allowed ? '03 · 高阶服务与资源引擎' : '03 · 高阶服务与资源 · 预览'}
          </div>
          <h2 className="text-lg md:text-2xl font-extrabold text-slate-900">
            接入服务库 / 资源库的高阶选项
          </h2>
          <p className="text-[11px] md:text-sm text-slate-500 mt-1">
            从个人执行升级为团队 / 城市 / 平台级运营
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 卡片一：OPC 陪跑 */}
          <article className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg p-5 border border-slate-200 hover:border-blue-300 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-sm">
                🏃
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                  SERVICE · 1v1
                </div>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  OPC 深度陪跑
                </h3>
              </div>
            </div>
            <p className="text-[12px] text-slate-600 leading-relaxed line-clamp-3">
              从系统搭建到多平台扩张，提供 1v1 战略陪跑服务。资深主理人全程跟进，按月迭代商业节奏。
            </p>
            <ul className="mt-3 space-y-1.5 text-[11px] text-slate-500">
              {['月度战略复盘', 'SOP 个性化调优', '关键节点陪跑'].map((it) => (
                <li key={it} className="flex items-center gap-1.5">
                  <CheckCircle2 size={11} className="text-emerald-500 flex-shrink-0" />
                  {it}
                </li>
              ))}
            </ul>
            <Link
              href="/market/services?intent=coach"
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 border-2 border-blue-500 bg-white hover:bg-blue-50 text-blue-700 text-xs font-extrabold px-3 py-2.5 rounded-xl transition-colors"
            >
              了解陪跑
              <ArrowRight size={12} />
            </Link>
          </article>

          {/* 卡片二：AI 代运营 */}
          <article className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg p-5 border border-slate-200 hover:border-emerald-300 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-2xl shadow-sm">
                🤖
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                  SERVICE · AI OPS
                </div>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  AI 代运营矩阵
                </h3>
              </div>
            </div>
            <p className="text-[12px] text-slate-600 leading-relaxed line-clamp-3">
              专业团队 + AI 工具，帮你托管多平台网店与自媒体矩阵。一店多号托管，月度 GMV 透明可查。
            </p>
            <ul className="mt-3 space-y-1.5 text-[11px] text-slate-500">
              {['多平台一店多号', 'AI 客服 + 自动发货', '月度 GMV 看板'].map((it) => (
                <li key={it} className="flex items-center gap-1.5">
                  <CheckCircle2 size={11} className="text-emerald-500 flex-shrink-0" />
                  {it}
                </li>
              ))}
            </ul>
            <Link
              href="/market/services?intent=agency"
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 border-2 border-emerald-500 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-extrabold px-3 py-2.5 rounded-xl transition-colors"
            >
              咨询代运营
              <ArrowRight size={12} />
            </Link>
          </article>

          {/* 卡片三：OPC 城市主理人 */}
          <article className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg p-5 border-2 border-amber-300 hover:border-amber-400 hover:shadow-amber-200/40 transition-all">
            <div className="absolute -top-2 -right-2 inline-flex items-center gap-1 text-[9px] font-extrabold text-white bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-1 rounded-full shadow-md">
              <Crown size={10} />
              高阶权益
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-2xl shadow-sm">
                👑
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                  PARTNER · 城市独家
                </div>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  OPC 城市主理人
                </h3>
              </div>
            </div>
            <p className="text-[12px] text-slate-600 leading-relaxed line-clamp-3">
              <span className="font-bold text-amber-700">5980 元</span> 解锁城市独家经营权，复制良朋社总部模式，本地资源 + AI 工具双加持。
            </p>
            <ul className="mt-3 space-y-1.5 text-[11px] text-slate-500">
              {['城市独家授权', '本地资源对接', '总部 SOP 复制'].map((it) => (
                <li key={it} className="flex items-center gap-1.5">
                  <CheckCircle2 size={11} className="text-emerald-500 flex-shrink-0" />
                  {it}
                </li>
              ))}
            </ul>
            <Link
              href="/partner"
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white text-xs font-extrabold px-3 py-2.5 rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
            >
              申请成为主理人
              <ArrowRight size={12} />
            </Link>
          </article>
        </div>
      </section>

      {/* ════════ ⑤ 多平台矩阵管理入口（玻璃态大卡）══════ */}
      <section className="max-w-lg md:max-w-6xl mx-auto px-5 md:px-6 pt-6 md:pt-8 pb-12">
        <div className="relative overflow-hidden rounded-2xl bg-slate-50/80 backdrop-blur-sm border-2 border-slate-200 p-5 md:p-7 shadow-sm">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-200/20 rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row md:items-center gap-4">
            {/* 左侧：图标 + 文案 */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-2xl shadow-md">
                ➕
              </div>
              <div className="min-w-0">
                <div className="text-[10px] md:text-xs font-extrabold tracking-widest uppercase text-slate-500 mb-0.5 flex items-center gap-1">
                  <Building2 size={11} />
                  {allowed ? '04 · 账号扩张' : '04 · 账号扩张 · 预览'}
                </div>
                <h3 className="text-lg md:text-2xl font-extrabold text-slate-900 leading-tight">
                  申请开设更多网店 / 自媒体账号
                </h3>
                <p className="text-[12px] md:text-sm text-slate-600 mt-2 leading-relaxed">
                  系统检测到您已在交易 / 流量型 OPC 跑通闭环。为准备矩阵放大，您需要开通更多平台账号——
                  多店铺、多矩阵、多账号并行，把单店 SOP 复制成可规模化的网络。
                </p>

                {/* 标签 */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {['多店矩阵', '多平台分发', 'AI 批量托管', '一店多号'].map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 右侧：CTA 按钮 */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Link
                href="/market/tools?highlight=shop-workspace"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs md:text-sm font-extrabold px-4 py-3 rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <Wrench size={14} />
                前往申请新平台账号
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/market/tools?highlight=media-login"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-[11px] md:text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm transition-colors whitespace-nowrap"
              >
                <Sparkles size={12} />
                高亮「自媒体登录页」注册
              </Link>
            </div>
          </div>
        </div>

        {/* 底部：可重复访问的 STEP 04 状态提示 */}
        <div className="mt-5 text-center text-[10px] text-slate-400">
          <TrendingUp size={10} className="inline-block mr-1 -mt-0.5" />
          {allowed
            ? '已解锁矩阵放大阶段 · 您可随时回到这里调度多平台资源'
            : '解锁 STEP 01~03 后，回到此页开启完整多平台矩阵'}
        </div>
      </section>
    </div>
  )
}
