'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
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
} from 'lucide-react'

/**
 * 个人工作台（Workspace）
 * ------------------------------------------------------------
 * 聚合页 CTA 跳转目标。展示今日 TODO + 当前 OPC 阶段 + 工具快捷入口。
 * 后续可接入真实任务系统、Supabase 持久化。
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
  },
  {
    id: 't3',
    title: '搭建首单 SOP 模板',
    desc: '在四库中挑选 2-3 个工具/项目，落到执行清单',
    stage: 'operation',
    priority: 'mid',
    done: false,
    href: '/market',
  },
  {
    id: 't4',
    title: '城市主理人申请',
    desc: '完成首单后申请成为城市合伙人',
    stage: 'scaling',
    priority: 'low',
    done: false,
    href: '/partner',
  },
]

const QUICK_LINKS = [
  { name: '智富严选', desc: 'AI 选品分析', icon: '🛒', href: '/tools' },
  { name: '豹纹工坊', desc: '一键生成素材', icon: '🛠️', href: '/tools' },
  { name: '灵犀 AI', desc: '智能内容创作', icon: '✨', href: '/tools' },
  { name: '先锋派数字人', desc: 'AI 数字人视频', icon: '🎬', href: '/tools' },
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

export default function WorkspacePage() {
  const [tasks, setTasks] = useState<Task[]>(TODAY_TASKS)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const completedCount = tasks.filter((t) => t.done).length
  const progressPct = Math.round((completedCount / tasks.length) * 100)

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12" suppressHydrationWarning>
      {/* ════════ 顶部 Hero ════════ */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white px-5 pt-6 pb-8 md:pt-10 md:pb-12 relative overflow-hidden">
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
              Workspace · 工作台
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-widest text-yellow-300 uppercase mb-2">
            <Sparkles size={12} className="md:w-3.5 md:h-3.5" />
            个人专属工作台
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold leading-tight">
            <span className="mr-2">🚀</span>
            今日的 OPC 行动清单
          </h1>
          <p className="mt-2 text-sm md:text-base text-white/85 leading-relaxed max-w-2xl">
            把方案落到每一步。今天搞定这 4 件事，离你的 OPC 商业闭环就更近一步。
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

      {/* ════════ 今日任务 ════════ */}
      <section className="px-5 py-6">
        <div className="max-w-lg md:max-w-6xl md:mx-auto">
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
            {tasks.map((t) => {
              const StageIcon = t.done ? CheckCircle2 : CircleDashed
              return (
                <li
                  key={t.id}
                  className={`group flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-3 md:p-4 hover:shadow-md hover:border-blue-200 transition-all ${
                    t.done ? 'opacity-60' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(t.id)}
                    aria-label={t.done ? '标记未完成' : '标记完成'}
                    className={`flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      t.done
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-slate-300 hover:border-blue-500 text-transparent hover:text-blue-200'
                    }`}
                  >
                    <StageIcon size={16} className="md:w-[18px] md:h-[18px]" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-sm md:text-base font-bold leading-tight ${
                          t.done ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {t.title}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${STAGE_COLORS[t.stage]}`}
                      >
                        {STAGE_LABEL[t.stage]}
                      </span>
                      {t.priority === 'high' && (
                        <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                          优先
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">{t.desc}</p>
                  </div>

                  {t.href && (
                    <Link
                      href={t.href}
                      className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] md:text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      前往
                      <ArrowRight size={12} />
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* ════════ 快捷工具入口 ════════ */}
      <section className="px-5 py-2">
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
            {QUICK_LINKS.map((q) => (
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
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 底部激励 ════════ */}
      <section className="px-5 mt-6">
        <div className="max-w-lg md:max-w-6xl md:mx-auto">
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
        </div>
      </section>
    </div>
  )
}
