'use client'

import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  Rocket,
  CheckCircle2,
  CircleDashed,
  Clock,
  Sparkles,
  Target,
  Wrench,
  ArrowRight,
  Lock,
  BarChart3,
  ListTodo,
  Lightbulb,
  ShieldAlert,
} from 'lucide-react'

/**
 * 个人工作台（Workspace）
 * ------------------------------------------------------------
 * 聚合页 CTA 跳转目标。展示今日 TODO + 当前 OPC 阶段 + 工具快捷入口。
 *
 * 模式：
 *   - 正常模式（无参数或 unlocked）：全部功能
 *   - bypass 模式（?bypass=true）：仅数据看板 + 今日待办占位，核心功能锁定
 * ------------------------------------------------------------
 */

interface Task {
  id: string
  title: string
  desc: string
  stage: 'diagnosis' | 'learning' | 'operation' | 'scaling'
  priority: 'high' | 'mid' | 'low'
  done: boolean
  href?: string
  /** 是否核心功能（bypass 模式下锁定） */
  core?: boolean
}

const TODAY_TASKS: Task[] = [
  {
    id: 't1',
    title: '完成 AI 商业 IP 诊断',
    desc: '回答 4 个关键问题，定位你的 OPC 阶梯',
    stage: 'diagnosis',
    priority: 'high',
    done: false,
    href: '/diagnosis',
  },
  {
    id: 't2',
    title: '通哥 SOP · 学习入门',
    desc: '通读《智富严选选品 SOP》并做笔记',
    stage: 'learning',
    priority: 'high',
    done: false,
    href: '/market',
    core: true,
  },
  {
    id: 't3',
    title: '搭建首单 SOP 模板',
    desc: '在四库中挑选 2-3 个工具/项目，落到执行清单',
    stage: 'operation',
    priority: 'mid',
    done: false,
    href: '/market',
    core: true,
  },
  {
    id: 't4',
    title: '城市主理人申请',
    desc: '完成首单后申请成为城市合伙人',
    stage: 'scaling',
    priority: 'low',
    done: false,
    href: '/partner',
    core: true,
  },
]

const QUICK_LINKS = [
  { name: '智富严选', desc: 'AI 选品分析', icon: '🛒', href: '/tools', core: true },
  { name: '豹纹工坊（豹纹+）', desc: '一键生成素材', icon: '🛠️', href: '/tools', core: true },
  { name: '灵犀 AI', desc: '智能内容创作', icon: '✨', href: '/tools', core: true },
  { name: '先锋派数字人', desc: 'AI 数字人视频', icon: '🎬', href: '/tools', core: true },
]

const STAGE_LABEL = {
  diagnosis: '诊断',
  learning: '学习',
  operation: '实操',
  scaling: '放大',
} as const

const STAGE_COLORS = {
  diagnosis: 'text-amber-600 bg-amber-50',
  learning: 'text-blue-600 bg-blue-50',
  operation: 'text-emerald-600 bg-emerald-50',
  scaling: 'text-violet-600 bg-violet-50',
} as const

function WorkspaceInner() {
  const [tasks, setTasks] = useState<Task[]>(TODAY_TASKS)
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()

  // 从 URL 读取 ?bypass=true
  const bypass = searchParams?.get('bypass') === 'true'
  // 进化二：?bypass=simplify 简化任务清单（仅显示 3 项基础打卡）
  const simplified = searchParams?.get('bypass') === 'simplify'

  useEffect(() => {
    setMounted(true)
  }, [])

  /**
   * 进化二：简化任务模式
   *  - 仅保留 3 项基础打卡：t1 诊断 / t2 学习 / t3 实操
   *  - 隐藏高难度任务（t4 城市主理人申请）
   *  - 显示"已简化"提示横幅 + "恢复完整"按钮
   */
  const visibleTasks = simplified
    ? TODAY_TASKS.filter((t) => t.id === 't1' || t.id === 't2' || t.id === 't3')
    : tasks

  const completedCount = visibleTasks.filter((t) => t.done).length
  const progressPct = Math.round((completedCount / Math.max(1, visibleTasks.length)) * 100)

  const toggleTask = (id: string) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
      const target = next.find((t) => t.id === id)
      // 进化四：任务打卡成功 → 触发连胜 + 高光动画
      if (target?.done && typeof window !== 'undefined') {
        // 同步调用 streak store 的 punch（避免依赖跨页事件）
        import('@/lib/streak-store').then(({ punch }) => {
          const phone = window.localStorage.getItem('opc_device_id') || ''
          if (phone) punch(phone, target.title)
        })
        // 通知 /member 页面的 StreakCard 同步刷新
        window.dispatchEvent(new CustomEvent('opc:punch'))
      }
      return next
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12" suppressHydrationWarning>
      {/* ════════ 顶部 Hero ════════ */}
      <section
        className={`${
          bypass
            ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900'
            : 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900'
        } text-white px-5 pt-6 pb-8 md:pt-10 md:pb-12 relative overflow-hidden`}
      >
        <div aria-hidden className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-blue-400/20 blur-3xl" />
        <div aria-hidden className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-purple-400/20 blur-3xl" />

        <div className="max-w-lg md:max-w-6xl md:mx-auto relative">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-white/90 hover:text-white text-xs md:text-sm bg-white/15 hover:bg-white/25 backdrop-blur px-3 py-1.5 rounded-full transition-colors"
            >
              <ArrowLeft size={14} />
              返回首页
            </Link>
            <span className="text-[10px] md:text-xs font-bold tracking-widest text-white/70 uppercase">
              Workspace · 工作台 {bypass && '· 预览模式'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-widest text-yellow-300 uppercase mb-2 flex-wrap">
            <Sparkles size={12} className="md:w-3.5 md:h-3.5" />
            个人专属工作台
            {bypass && (
              <span className="ml-1 inline-flex items-center gap-1 bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded-full text-[9px] font-extrabold">
                <Lock size={9} />
                BYPASS · 核心功能未解锁
              </span>
            )}
            {simplified && (
              <span className="ml-1 inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded-full text-[9px] font-extrabold">
                <Sparkles size={9} />
                简化模式 · 仅基础打卡
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold leading-tight">
            <span className="mr-2">{bypass ? '👀' : '🚀'}</span>
            {bypass ? '工作台预览（基础版）' : '今日的 OPC 行动清单'}
          </h1>
          <p className="mt-2 text-sm md:text-base text-white/85 leading-relaxed max-w-2xl">
            {bypass
              ? '您正在使用「跳过模式」浏览基础页面。要解锁完整 AI 任务卡与精准 SOP，请先完成诊断 + 新手启航任务。'
              : '把方案落到每一步。今天搞定这 4 件事，离你的 OPC 商业闭环就更近一步。'}
          </p>

          {/* 进度条 */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-white/80 mb-1.5">
              <span>今日完成度</span>
              <span className="font-bold text-white">
                {completedCount} / {tasks.length} · {progressPct}%
              </span>
            </div>
            <div className="h-2 bg-white/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-300 to-amber-400 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ════════ Bypass 模式：醒目的解锁引导横幅 ═══════ */}
      {bypass && (
        <section className="px-5 -mt-2 mb-2">
          <div className="max-w-lg md:max-w-6xl md:mx-auto">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white p-4 md:p-5 shadow-lg">
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/15 blur-2xl" />
              <div className="relative flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <ShieldAlert size={20} className="md:w-6 md:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] md:text-xs font-bold tracking-wider uppercase text-white/85 mb-0.5">
                    核心功能未解锁
                  </div>
                  <div className="text-sm md:text-base font-extrabold leading-tight">
                    完整工作台需要：诊断 + 新手启航 ≥ 80 分
                  </div>
                  <p className="text-[10px] md:text-xs text-white/85 mt-0.5">
                    现在看到的只是占位符，所有 AI 工具、SOP 任务、精准推荐均被锁定
                  </p>
                  <Link
                    href="/diagnosis"
                    className="mt-2 inline-flex items-center gap-1.5 text-[11px] md:text-xs font-extrabold bg-white text-amber-700 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    🎯 立即解锁 · 去诊断
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ════════ 数据看板（bypass 友好：始终展示）══════ */}
      <section className="px-5 py-4 md:py-5">
        <div className="max-w-lg md:max-w-6xl md:mx-auto">
          <h2 className="text-base md:text-xl font-bold text-slate-900 flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-blue-500" />
            数据看板
            <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-wider">
              Overview
            </span>
          </h2>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-3 md:p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">完成率</div>
              <div className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1">{progressPct}%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{completedCount}/{tasks.length} 任务</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-3 md:p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">学习分</div>
              <div className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1">
                {bypass ? '🔒' : '80'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{bypass ? '需解锁' : '满分 100'}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-3 md:p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">连续</div>
              <div className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1">
                {bypass ? '0' : '7'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{bypass ? '天 (未启动)' : '天活跃'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ 今日任务 ═══════ */}
      <section className="px-5 py-3">
        <div className="max-w-lg md:max-w-6xl md:mx-auto">
          {/* 进化二：简化模式提示 + 恢复完整清单按钮 */}
          {simplified && (
            <div className="mb-3 flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles size={14} className="text-emerald-600 flex-shrink-0" />
                <span className="text-xs text-emerald-800 leading-snug">
                  <strong>简化模式已启用</strong>，仅显示 3 项基础打卡。完成 3 项后可恢复完整清单。
                </span>
              </div>
              <Link
                href="/workspace"
                className="flex-shrink-0 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-white border border-emerald-200 px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                恢复完整
              </Link>
            </div>
          )}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg md:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Target size={18} className="text-amber-500" />
              今日 TODO
            </h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Today
            </span>
          </div>

          <ul className="space-y-2.5">
            {visibleTasks.map((t) => {
              const StageIcon = t.done ? CheckCircle2 : CircleDashed
              const locked = bypass && t.core
              return (
                <li
                  key={t.id}
                  className={`group flex items-center gap-3 border rounded-2xl p-3 md:p-4 transition-all ${
                    locked
                      ? 'bg-slate-50 border-slate-200 opacity-70'
                      : t.done
                      ? 'bg-white border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:shadow-md hover:border-blue-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => !locked && toggleTask(t.id)}
                    disabled={locked}
                    aria-label={t.done ? '标记未完成' : '标记完成'}
                    className={`flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      locked
                        ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                        : t.done
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-slate-300 hover:border-blue-500 text-transparent hover:text-blue-200'
                    }`}
                  >
                    {locked ? <Lock size={14} /> : <StageIcon size={16} className="md:w-[18px] md:h-[18px]" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-sm md:text-base font-bold leading-tight ${
                          locked
                            ? 'text-slate-400'
                            : t.done
                            ? 'line-through text-slate-400'
                            : 'text-slate-800'
                        }`}
                      >
                        {t.title}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${STAGE_COLORS[t.stage]}`}
                      >
                        {STAGE_LABEL[t.stage]}
                      </span>
                      {t.priority === 'high' && !locked && (
                        <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                          优先
                        </span>
                      )}
                      {locked && (
                        <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                          <Lock size={8} />
                          未解锁
                        </span>
                      )}
                    </div>
                    <p className={`mt-0.5 text-[11px] leading-snug ${locked ? 'text-slate-400' : 'text-slate-500'}`}>
                      {locked ? '🔒 完成诊断 + 新手启航任务后解锁' : t.desc}
                    </p>
                  </div>

                  {t.href && !locked && (
                    <Link
                      href={t.href}
                      className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] md:text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      前往
                      <ArrowRight size={12} />
                    </Link>
                  )}
                  {locked && (
                    <Link
                      href="/diagnosis"
                      className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] md:text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      解锁
                      <Lock size={11} />
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* ════════ 工具快捷入口（bypass 下全部锁定）══════ */}
      <section className="px-5 py-3">
        <div className="max-w-lg md:max-w-6xl md:mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg md:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Wrench size={18} className="text-blue-500" />
              工具快捷入口
            </h2>
            <Link
              href="/market"
              className="text-[10px] font-bold text-blue-600 hover:underline"
            >
              查看全部 →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {QUICK_LINKS.map((q) => {
              const locked = bypass && q.core
              if (locked) {
                return (
                  <div
                    key={q.name}
                    className="relative bg-slate-50 border border-slate-200 rounded-2xl p-3 opacity-60 cursor-not-allowed"
                  >
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center">
                      <Lock size={10} className="text-amber-600" />
                    </div>
                    <div className="text-2xl mb-1 grayscale">{q.icon}</div>
                    <div className="text-xs md:text-sm font-bold text-slate-500">{q.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">🔒 未解锁</div>
                  </div>
                )
              }
              return (
                <Link
                  key={q.name}
                  href={q.href}
                  className="group bg-white border border-slate-200 rounded-2xl p-3 hover:shadow-md hover:border-blue-200 transition-all"
                >
                  <div className="text-2xl mb-1">{q.icon}</div>
                  <div className="text-xs md:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {q.name}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{q.desc}</div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════ 底部激励 / 引导 ═══════ */}
      <section className="px-5 mt-6">
        <div className="max-w-lg md:max-w-6xl md:mx-auto">
          {bypass ? (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 md:p-5 flex items-start gap-3">
              <Lightbulb size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm md:text-base font-bold text-amber-900">
                  提示：解锁完整工作台只需 2 步
                </div>
                <ol className="mt-2 space-y-1.5 text-[11px] md:text-xs text-amber-800">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold flex items-center justify-center">1</span>
                    <span>完成《OPC 智富入局诊断》（4 个关键问题，约 2 分钟）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold flex items-center justify-center">2</span>
                    <span>完成新手 3 任务（浏览 / 注册 / 下载）累计 ≥ 80 分</span>
                  </li>
                </ol>
                <Link
                  href="/diagnosis"
                  className="mt-3 inline-flex items-center gap-1.5 text-[11px] md:text-xs font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-shadow"
                >
                  🎯 立即开始诊断
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 md:p-5 flex items-start gap-3">
              <Clock size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm md:text-base font-bold text-amber-900">
                  提示：每完成一个 TODO，OPC 全流程进度 +25%
                </div>
                <p className="mt-1 text-[11px] md:text-xs text-amber-700/80 leading-relaxed">
                  工作台会根据你今天的完成情况，自动同步到「个人中心 → 商业作战地图」，
                  让通哥和你的城市主理人看见你的进度。
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <WorkspaceInner />
    </Suspense>
  )
}
