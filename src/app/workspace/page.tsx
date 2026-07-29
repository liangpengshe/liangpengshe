'use client'

import Link from 'next/link'
import { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle2,
  CircleDashed,
  Clock,
  Sparkles,
  Target,
  Wrench,
  ArrowRight,
  BarChart3,
  Calendar,
  Rocket,
} from 'lucide-react'

/**
 * 个人工作台（Workspace）
 * ------------------------------------------------------------
 * 双模式：
 *   1) 默认模式：今日 OPC 行动清单（4 项静态任务）
 *   2) 项目模式：?project=ai-digital-shop-group
 *      → 顶部改为「AI 数字店群项目 · 7 天执行清单」
 *      → 实时读取该项目 localStorage 进度（opc_sop_progress::ai-digital-shop-group）
 *      → 动态生成 4 个接下来 7 天的核心待办
 *      → 数据看板展示「第 X/9 步」+ 完成率 %
 * ------------------------------------------------------------
 */

// 全部项目 metadata（标题/总步数/进度 key）
interface ProjectMeta {
  slug: string
  title: string
  totalSteps: number
  /** 7 天情境模板：基于当前完成步数 idx，从 0..totalSteps 取 */
  scenarios: ProjectScenario[]
}

interface ProjectScenario {
  /** 触发区间：[from, to)，如 [0,3) 表示 currentStep=0,1,2 时触发 */
  range: [number, number]
  label: string
  todos: Array<{
    title: string
    desc: string
    stage: 'learning' | 'operation' | 'scaling' | 'ai'
    targetStep: number  // 点击「前往执行」时跳转到的项目步骤 idx
  }>
}

const PROJECT_REGISTRY: Record<string, ProjectMeta> = {
  'ai-digital-shop-group': {
    slug: 'ai-digital-shop-group',
    title: 'AI 数字店群项目',
    totalSteps: 9,
    scenarios: [
      {
        range: [0, 3],
        label: '起步期',
        todos: [
          { title: '核心选品', desc: '学习 AI 精准选品方法的 4 大策略', stage: 'learning', targetStep: 3 },
          { title: '工具配置', desc: '下载并安装千牛工作台与选品插件', stage: 'operation', targetStep: 1 },
          { title: '货品上架', desc: '开启第 5 步，完成首批 10-20 个 SKU 上架', stage: 'operation', targetStep: 4 },
          { title: 'AI 辅助', desc: '使用灵犀 AI 批量生成爆款标题与详情页', stage: 'ai', targetStep: 4 },
        ],
      },
      {
        range: [3, 6],
        label: '执行期',
        todos: [
          { title: '运营设置', desc: '在千牛后台配置优惠券与全店推广', stage: 'operation', targetStep: 5 },
          { title: '客服配置', desc: '配置 AI 智能客服话术与自动发货', stage: 'operation', targetStep: 6 },
          { title: '数据监测', desc: '关注店铺 UV 与转化率漏斗分析', stage: 'scaling', targetStep: 7 },
          { title: '矩阵复制', desc: '准备 SOP 标准化，为多店放大做准备', stage: 'scaling', targetStep: 8 },
        ],
      },
      {
        range: [6, 9],
        label: '放大期',
        todos: [
          { title: '矩阵搭建', desc: '开通第 2 个店铺，复用首店 SOP 模板', stage: 'scaling', targetStep: 8 },
          { title: '团队组建', desc: '招募兼职客服与运营，分工到人', stage: 'scaling', targetStep: 8 },
          { title: '利润复核', desc: '对比单店成本结构，识别降本点', stage: 'scaling', targetStep: 7 },
          { title: '进阶计划', desc: '申请深度陪跑，把 SOP 变成可卖资产', stage: 'scaling', targetStep: 8 },
        ],
      },
    ],
  },
}

const STAGE_COLORS: Record<string, string> = {
  learning: 'text-blue-600 bg-blue-50',
  operation: 'text-emerald-600 bg-emerald-50',
  scaling: 'text-violet-600 bg-violet-50',
  ai: 'text-amber-600 bg-amber-50',
}
const STAGE_LABEL: Record<string, string> = {
  learning: '学习',
  operation: '实操',
  scaling: '放大',
  ai: 'AI',
}

// 原有：4 个静态 OPC 任务（默认模式）
const DEFAULT_TODOS = [
  { id: 't1', title: '完成 AI 商业 IP 诊断', desc: '回答 4 个关键问题，定位你的 OPC 阶梯', href: '/diagnosis' },
  { id: 't2', title: '良朋社 SOP · 学习入门', desc: '梳理四库严选选品 SOP，做好执行笔记', href: '/market' },
  { id: 't3', title: '搭建首单 SOP 模板', desc: '在四库中挑选 2-3 个工具/项目，落到执行清单', href: '/market' },
  { id: 't4', title: '城市主理人申请', desc: '完成首单后申请成为城市合伙人', href: '/partner' },
]

const QUICK_LINKS = [
  { name: '智富严选', desc: 'AI 选品分析', icon: '🛒', href: '/tools' },
  { name: '豹纹工坊（豹纹+）', desc: '一键生成素材', icon: '🛠️', href: '/tools' },
  { name: '灵犀 AI', desc: '智能内容创作', icon: '✨', href: '/tools' },
  { name: '先锋派数字人', desc: 'AI 数字人视频', icon: '🎬', href: '/tools' },
]

function WorkspaceInner() {
  const searchParams = useSearchParams()
  const projectSlug = searchParams?.get('project') || null
  const project = projectSlug ? PROJECT_REGISTRY[projectSlug] : null

  const [progress, setProgress] = useState(0)
  const [subProgress, setSubProgress] = useState<number>(0)
  const [defaultDone, setDefaultDone] = useState<Record<string, boolean>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (project) {
      // 读取该项目的 localStorage 进度
      const saved = Number(window.localStorage.getItem(`opc_sop_progress::${project.slug}`) || '0')
      const subs = JSON.parse(window.localStorage.getItem(`opc_sop_subprogress::${project.slug}`) || '[]')
      setProgress(Math.min(saved, project.totalSteps))
      setSubProgress(subs.length)
    } else {
      // 默认模式：读取默认 TODO 完成状态
      const saved = window.localStorage.getItem('workspace_default_done')
      if (saved) {
        try { setDefaultDone(JSON.parse(saved)) } catch { /* ignore */ }
      }
    }
  }, [project?.slug])

  // 写入默认模式 TODO 状态
  const toggleDefault = (id: string) => {
    setDefaultDone((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('workspace_default_done', JSON.stringify(next))
      }
      return next
    })
  }

  // 计算当前情境
  const currentScenario = useMemo(() => {
    if (!project) return null
    return (
      project.scenarios.find((s) => progress >= s.range[0] && progress < s.range[1]) ||
      project.scenarios[project.scenarios.length - 1]
    )
  }, [project, progress])

  const completedPct = project ? Math.round((progress / project.totalSteps) * 100) : 0
  const doneDefaultCount = Object.values(defaultDone).filter(Boolean).length

  return (
    <div className="min-h-screen bg-slate-50 pb-12" suppressHydrationWarning>
      {/* ════════ 顶部 Hero ════════ */}
      <section
        className={`text-white px-5 pt-6 pb-8 md:pt-10 md:pb-12 relative overflow-hidden ${
          project
            ? 'bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900'
            : 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900'
        }`}
      >
        <div aria-hidden className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-blue-400/20 blur-3xl" />
        <div aria-hidden className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-purple-400/20 blur-3xl" />

        <div className="max-w-lg md:max-w-6xl md:mx-auto relative">
          <div className="flex items-center justify-between mb-6">
            <Link
              href={project ? `/projects/${project.slug}` : '/'}
              className="inline-flex items-center gap-1.5 text-white/90 hover:text-white text-xs md:text-sm bg-white/15 hover:bg-white/25 backdrop-blur px-3 py-1.5 rounded-full transition-colors"
            >
              <ArrowLeft size={14} />
              {project ? '返回项目页' : '返回首页'}
            </Link>
            <span className="text-[10px] md:text-xs font-bold tracking-widest text-white/70 uppercase">
              Workspace · 工作台
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-widest text-yellow-300 uppercase mb-2 flex-wrap">
            {project ? <Calendar size={12} className="md:w-3.5 md:h-3.5" /> : <Sparkles size={12} className="md:w-3.5 md:h-3.5" />}
            {project ? `${currentScenario?.label || '执行中'} · 7 天执行清单` : '个人专属工作台'}
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold leading-tight">
            <span className="mr-2">{project ? '🗓️' : '🚀'}</span>
            {project ? `${project.title} · 7 天执行清单` : '今日的 OPC 行动清单'}
          </h1>
          <p className="mt-2 text-sm md:text-base text-white/85 leading-relaxed max-w-2xl">
            {project
              ? '把项目拆解到每一天，离你的第一单更近一步。'
              : '把方案落到每一步。今天搞定这 4 件事，离你的 OPC 商业闭环就更近一步。'}
          </p>

          {/* 进度条 */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-white/80 mb-1.5">
              <span>{project ? '项目进度' : '今日完成度'}</span>
              <span className="font-bold text-white">
                {project
                  ? `第 ${progress}/${project.totalSteps} 步 · ${completedPct}%`
                  : `${doneDefaultCount}/${DEFAULT_TODOS.length}`}
              </span>
            </div>
            <div className="h-2 bg-white/15 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  project
                    ? 'bg-gradient-to-r from-emerald-300 to-teal-400'
                    : 'bg-gradient-to-r from-yellow-300 to-amber-400'
                }`}
                style={{ width: `${project ? completedPct : (doneDefaultCount / DEFAULT_TODOS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ════════ 数据看板 ════════ */}
      <section className="px-5 py-4 md:py-5">
        <div className="max-w-lg md:max-w-6xl md:mx-auto">
          <h2 className="text-base md:text-xl font-bold text-slate-900 flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-blue-500" />
            数据看板
            <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-wider">Overview</span>
          </h2>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-3 md:p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">完成率</div>
              <div className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1">
                {project ? `${completedPct}%` : `${Math.round((doneDefaultCount / DEFAULT_TODOS.length) * 100)}%`}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {project ? `已完成 ${progress}/${project.totalSteps} 步` : `${doneDefaultCount}/${DEFAULT_TODOS.length} 任务`}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-3 md:p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">当前进度</div>
              <div className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1">
                {project ? `第 ${progress}/${project.totalSteps} 步` : '80'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {project ? (currentScenario?.label || '执行中') : '满分 100'}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-3 md:p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">连续</div>
              <div className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1">7</div>
              <div className="text-[10px] text-slate-500 mt-0.5">天活跃</div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ 今日 / 7 天 TODO ════════ */}
      <section className="px-5 py-3">
        <div className="max-w-lg md:max-w-6xl md:mx-auto">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="text-lg md:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Target size={18} className="text-amber-500" />
              {project ? '7 天核心待办' : '今日 TODO'}
            </h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {project ? `Day 1-7 · ${currentScenario?.label || ''}` : 'Today'}
            </span>
          </div>

          {/* 项目模式：动态 4 个待办 */}
          {project && currentScenario && (
            <ul className="space-y-2.5">
              {currentScenario.todos.map((todo, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-3 md:p-4 hover:shadow-md hover:border-emerald-200 transition-all"
                >
                  <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-extrabold text-sm md:text-base flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm md:text-base font-bold text-slate-800 leading-tight">
                        {todo.title}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${STAGE_COLORS[todo.stage]}`}>
                        {STAGE_LABEL[todo.stage]}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">{todo.desc}</p>
                  </div>
                  <Link
                    href={`/projects/${project.slug}?step=${todo.targetStep}`}
                    className="flex-shrink-0 inline-flex items-center justify-center gap-1 text-[10px] md:text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-3 py-2 rounded-lg transition-colors min-h-[40px] whitespace-nowrap w-full md:w-auto mt-2 md:mt-0"
                  >
                    前往执行
                    <ArrowRight size={12} />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* 默认模式：静态 4 个任务（保留原有交互）*/}
          {!project && (
            <ul className="space-y-2.5">
              {DEFAULT_TODOS.map((t) => {
                const done = !!defaultDone[t.id]
                const StageIcon = done ? CheckCircle2 : CircleDashed
                return (
                  <li
                    key={t.id}
                    className={`group flex items-center gap-3 border rounded-2xl p-3 md:p-4 transition-all ${
                      done
                        ? 'bg-white border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:shadow-md hover:border-blue-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleDefault(t.id)}
                      aria-label={done ? '标记未完成' : '标记完成'}
                      className={`flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        done
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-slate-300 hover:border-blue-500 text-transparent hover:text-blue-200'
                      }`}
                    >
                      <StageIcon size={16} className="md:w-[18px] md:h-[18px]" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm md:text-base font-bold leading-tight ${done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {t.title}
                      </span>
                      <p className={`mt-0.5 text-[11px] leading-snug ${done ? 'text-slate-400' : 'text-slate-500'}`}>{t.desc}</p>
                    </div>
                    <Link
                      href={t.href}
                      className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] md:text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      前往 <ArrowRight size={12} />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}

          {/* 项目模式：底部操作区（返回项目页 + 进度同步提示）*/}
          {project && (
            <div className="mt-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 md:p-5 flex items-start gap-3">
              <Rocket size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-sm md:text-base font-bold text-emerald-900">
                  7 天执行清单已生成
                </div>
                <p className="mt-1 text-[11px] md:text-xs text-emerald-700/80 leading-relaxed">
                  当前情境：<strong>{currentScenario?.label}</strong> · 已完成 {progress}/{project.totalSteps} 步。
                  每完成一个待办，回到项目页继续推进 SOP，进度会自动同步到这里。
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="inline-flex items-center gap-1.5 text-[11px] md:text-xs font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-shadow min-h-[40px]"
                  >
                    📍 回到项目页继续执行
                    <ArrowRight size={12} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.localStorage.removeItem(`opc_sop_progress::${project.slug}`)
                        window.location.reload()
                      }
                    }}
                    className="inline-flex items-center gap-1.5 text-[11px] md:text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors min-h-[40px]"
                  >
                    🔄 重置项目进度
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ════════ 工具快捷入口（仅默认模式）══════ */}
      {!project && (
        <section className="px-5 py-3">
          <div className="max-w-lg md:max-w-6xl md:mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg md:text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Wrench size={18} className="text-blue-500" />
                工具快捷入口
              </h2>
              <Link href="/market" className="text-[10px] font-bold text-blue-600 hover:underline">
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
                  <div className="text-xs md:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{q.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{q.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════ 底部激励 ════════ */}
      <section className="px-5 mt-6">
        <div className="max-w-lg md:max-w-6xl md:mx-auto">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 md:p-5 flex items-start gap-3">
            <Clock size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm md:text-base font-bold text-amber-900">
                {project ? '小贴士：把大目标拆到每天 30 分钟' : '提示：每完成一个 TODO，OPC 全流程进度 +25%'}
              </div>
              <p className="mt-1 text-[11px] md:text-xs text-amber-700/80 leading-relaxed">
                {project
                  ? '7 天清单是节奏工具，不需要一次性做完。每天推进 1-2 项，第七天回头看，AI 数字店群已可独立跑通。'
                  : '工作台会根据你今天的完成情况，自动同步到「个人中心 → 商业作战地图」，让良朋社 OPC 平台和你的城市主理人看见你的进度。'}
              </p>
            </div>
          </div>
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
