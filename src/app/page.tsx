'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ClientLayout from '@/components/ClientLayout'
import ThreeAvatar from '@/components/ThreeAvatar'
import { ArrowRight, Sparkles, Rocket, Compass, BookOpen, Wrench, Briefcase, TrendingUp, CheckCircle2, Clock, Lock, ShoppingCart, Megaphone, Settings2, Gem } from 'lucide-react'
import { toast } from '@/components/Toast'
import { cn } from '@/lib/utils'

/**
 * 良朋社 OPC 首页（移动端优先 · 简化版）
 * - 移除 framer-motion 避免 hydration 报错
 * - 保留所有核心功能模块
 * - SSR 安全的 mounted 模式
 */

const stats = [
  { label: '内测企业', value: 20, suffix: '+', unit: '家' },
  { label: '内部实战轮', value: 3, suffix: '', unit: '期' },
  { label: '在线学员', value: 80, suffix: '+', unit: '位' },
  { label: '实操案例', value: 10, suffix: '+', unit: '' },
]

const learningPath = [
  {
    step: '01',
    title: '咨询诊断',
    coreValue: '测方向 · 解决"我适合做什么"',
    icon: Compass,
    deliverables: [
      '专属《OPC智富蓝皮书》',
      '15 分钟专家咨询',
      '免费社群',
    ],
  },
  {
    step: '02',
    title: '学习入门',
    coreValue: '练技能 · 解决"我第一步应该干什么"',
    icon: BookOpen,
    deliverables: [
      '解锁 8 步 SOP 沉浸式任务',
      '24 小时 AI 智富私教',
      '每日积分签到',
    ],
  },
  {
    step: '03',
    title: '运营实操',
    coreValue: '打胜仗 · 解决"怎么干才能成"',
    icon: Wrench,
    deliverables: [
      '3 个月陪跑指导',
      'AI 生成方案',
      '解锁矩阵放大功能',
      '导师 1V1 复盘',
    ],
  },
  {
    step: '04',
    title: '矩阵放大',
    coreValue: '拓版图 · 怎么把生意做成资产',
    icon: TrendingUp,
    deliverables: [
      '城市独家经营与品牌授权',
      '总部线下沙龙 SOP 物料包',
      '分站系统与本地化管理',
    ],
  },
]

const entrepreneurLadder = [
  {
    layer: '第一层',
    title: '🛒 交易型 OPC',
    desc: 'AI 网店群、智富严选、跑通首单',
    href: '/guide/trader',
    color: 'bg-gradient-to-r from-orange-400 to-amber-500',
    level: 'trader' as const,
    tooltip: '专注 AI 网店群的变现模式，适合直接卖货的创业者。',
  },
  {
    layer: '第二层',
    title: '📢 流量型 OPC',
    desc: '内容获客、自媒体矩阵',
    href: '/guide/flow',
    color: 'bg-gradient-to-r from-pink-500 to-rose-500',
    level: 'flow' as const,
    tooltip: '专注 AI 自媒体矩阵的流量增长，适合做内容的创作者。',
  },
  {
    layer: '第三层',
    title: '⚙️ 系统型 OPC',
    desc: '企业流程改造、高客单',
    href: '/guide/system',
    color: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    level: 'system' as const,
    tooltip: '为 B 端企业提供 AI 系统开发与流程改造，适合有技术/项目背景的操盘手。',
  },
  {
    layer: '第四层',
    title: '💎 资产型 OPC',
    desc: '数字资产、全球外包',
    href: '/guide/asset',
    color: 'bg-gradient-to-r from-purple-500 to-indigo-700',
    level: 'asset' as const,
    tooltip: '专注数字资产与全球化外包，实现被动收入和资产放大。',
  },
]

// [Task: 四库顺序] 固定为：项目 → 工具 → 服务 → 资源（与 /market/layout.tsx Tab 顺序对齐）
const libraryCards = [
  { title: 'AI智富项目库', subtitle: 'AI 数字店群、无货源店群、跨境电商', href: '/market/projects', icon: Rocket, iconColor: 'text-amber-600', iconBg: 'bg-amber-50', tag: '落地案例' },
  { title: 'AI智富工具库', subtitle: 'AI 自研工具、电商工作台、运营插件', href: '/market/tools', icon: Wrench, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', tag: '自研' },
  { title: 'AI智富服务库', subtitle: 'OPC 工具/内训/陪跑/社群、企业 GEO', href: '/market/services', icon: Briefcase, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50', tag: '陪跑' },
  { title: 'AI智富资源库', subtitle: 'AI 智能硬件、AI 招商加盟、OPC 生态', href: '/market/resources', icon: BookOpen, iconColor: 'text-rose-600', iconBg: 'bg-rose-50', tag: '链接' },
]

const statusConfig = {
  done: { bg: 'bg-gradient-to-br from-emerald-400 to-green-600', text: 'text-emerald-600', label: '已完成' },
  active: { bg: 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600', text: 'text-blue-600', label: '进行中' },
  locked: { bg: 'bg-slate-200', text: 'text-slate-400', label: '待解锁' },
} as const

// 实时动态（ActivityTicker 使用）
interface Activity {
  id: string
  city: string
  user: string
  action: string
  createdAt: string
}

// 兜底活动数据（API 失败时使用）
// 注：createdAt 必须用静态字符串，禁止 new Date()，否则会导致 SSR/CSR 时间戳不一致触发 hydration 报错
// 内测初期 · 去身份化文案
const STATIC_DATE = '2026-07-15T10:00:00.000Z'
const fallbackActivities: Activity[] = [
  { id: 'f1', city: '内测', user: '首批内测用户', action: '已开启 AI 数字网店实操', createdAt: STATIC_DATE },
  { id: 'f2', city: '内测', user: 'AI 创业者', action: '加入了第 3 期实战营招募', createdAt: STATIC_DATE },
  { id: 'f3', city: '直播', user: '首期 AI 商业直播课', action: '即将开播（扫码预约）', createdAt: STATIC_DATE },
  { id: 'f4', city: '内测', user: 'AI 数字店主', action: '跑通了 AI 选品 → 上架 → 复购闭环', createdAt: STATIC_DATE },
  { id: 'f5', city: '内测', user: 'AI 自媒体创作者', action: '用 AI 写脚本 3 天涨粉 800+', createdAt: STATIC_DATE },
  { id: 'f6', city: '直播', user: '本周公开课', action: '主题：用 AI 把生意做成资产（免费）', createdAt: STATIC_DATE },
  { id: 'f7', city: '内测', user: '城市主理人', action: '正在本地招募 OPC 合伙人', createdAt: STATIC_DATE },
  { id: 'f8', city: '直播', user: '回放已上线', action: '《AI 数字店群从 0 到 1》', createdAt: STATIC_DATE },
]

export default function HomePage() {
  const router = useRouter()
  const [activeCount, setActiveCount] = useState(238)
  // 初始化为 fallbackActivities，确保 ActivityTicker 在挂载后立即可见
  const [activities, setActivities] = useState<Activity[]>(fallbackActivities)

  // ──────────────────────────────────────────────────────────
  // 学习路径 · 用户状态（从 localStorage 读取，挂在后才生效避免 hydration 报错）
  // ──────────────────────────────────────────────────────────
  const [opcLevel, setOpcLevel] = useState<string | null>(null)
  const [learningScore, setLearningScore] = useState<number>(0)
  const [canUnlockPractice, setCanUnlockPractice] = useState<boolean>(false)

  // ──────────────────────────────────────────────────────────
  // OPC 四层智富阶梯 · 智能访问判定
  // ──────────────────────────────────────────────────────────
  //
  // 智能分级规则（覆盖诊断 / 学习 / 实操 / 放大 4 阶段）：
  //
  // 【基础层：交易型 / 流量型】
  //   只要满足以下任一条件，即视为"已过诊断门槛"，可正常打开：
  //     ① is_registered === 'true'        已完成注册
  //     ② diagnosis_accepted === 'true'   已接受诊断时间线
  //     ③ localStorage['opc_level'] 已设  诊断后已选定 OPC 路径
  //     ④ task_browse === 'true'          已开始浏览学习任务
  //     ⑤ learning_score > 0             学习阶段已获得任意积分
  //     ⑥ can_unlock_practice === 'true'  实操已解锁
  //
  // 【高阶层：系统型 / 资产型】
  //   需同时满足"已选路径 + 基础闭环"或"付费会员"：
  //     ① membership_level >= 1980        1980 / 5980 付费会员
  //     ② opc_level 已设 且 can_unlock_practice === 'true'
  //     ③ learning_score >= 80            学习阶段高分（视作已跑通基础闭环）
  // ──────────────────────────────────────────────────────────
  const canAccessBasicLadder = (): boolean => {
    if (typeof window === 'undefined') return false
    try {
      if (window.localStorage.getItem('is_registered') === 'true') return true
      if (window.localStorage.getItem('diagnosis_accepted') === 'true') return true
      if (window.localStorage.getItem('opc_level')) return true
      if (window.localStorage.getItem('task_browse') === 'true') return true
      const score = parseInt(window.localStorage.getItem('learning_score') || '0', 10)
      if (Number.isFinite(score) && score > 0) return true
      if (window.localStorage.getItem('can_unlock_practice') === 'true') return true
      return false
    } catch {
      return false
    }
  }

  const canAccessAdvancedLadder = (): boolean => {
    if (typeof window === 'undefined') return false
    try {
      const level = parseInt(window.localStorage.getItem('membership_level') || '0', 10)
      if (Number.isFinite(level) && level >= 1980) return true
      if (
        window.localStorage.getItem('opc_level') &&
        window.localStorage.getItem('can_unlock_practice') === 'true'
      )
        return true
      const score = parseInt(window.localStorage.getItem('learning_score') || '0', 10)
      if (Number.isFinite(score) && score >= 80) return true
      return false
    } catch {
      return false
    }
  }

  const [blocker, setBlocker] = useState<{
    open: boolean
    message: string
    ctaLabel: string
    ctaHref: string
  }>({ open: false, message: '', ctaLabel: '', ctaHref: '' })

  // 四层智富阶梯点击拦截（智能判断：基于诊断 / 学习 / 实操多维状态）
  const handleLadderClick = (
    e: React.MouseEvent,
    item: (typeof entrepreneurLadder)[number]
  ) => {
    // 基础层：交易型 / 流量型 → 只要过了诊断门槛即可
    if (item.level === 'trader' || item.level === 'flow') {
      if (!canAccessBasicLadder()) {
        e.preventDefault()
        setBlocker({
          open: true,
          message:
            '🔒 尚未开启诊断。您尚未完成 OPC 智富入局诊断。建议您先完成诊断，找到最适合您的起点。',
          ctaLabel: '去完成诊断 →',
          ctaHref: '/diagnosis',
        })
      }
      return
    }

    // 高阶层：系统型 / 资产型 → 需付费会员或基础闭环
    if (item.level === 'system' || item.level === 'asset') {
      if (!canAccessAdvancedLadder()) {
        e.preventDefault()
        setBlocker({
          open: true,
          message:
            '🔒 需先跑通基础版图。高阶商业版图需要您在【运营实操】阶段完成单店/单号的基础闭环后，方可解锁。您可以先专注于基础层 OPC。',
          ctaLabel: '了解进阶路径 →',
          ctaHref: '/member',
        })
      }
      return
    }
  }

  useEffect(() => {
    // 简单心跳（避免服务端阻塞）
    fetch('/api/community/heartbeat')
      .then(r => r.json())
      .then(data => {
        if (data?.success && typeof data?.data?.activeCount === 'number') {
          setActiveCount(data.data.activeCount)
        }
      })
      .catch(() => {/* 静默降级 */})

    // 拉取实时活动（失败则保留兜底数据）
    fetch('/api/activities')
      .then(r => r.json())
      .then(data => {
        if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
          setActivities(data.data)
        }
      })
      .catch(() => {/* 静默降级，保留 fallbackActivities */})
  }, [])

  // ──────────────────────────────────────────────────────────
  // 学习路径状态读取（localStorage → state）
  //   - 初次挂载：读取一次
  //   - focus / visibilitychange / storage 事件触发：重新读取并 forceUpdate
  //   - 依赖项 [learningScore]：状态变化即重新计算（与渲染同步）
  // ──────────────────────────────────────────────────────────
  const readLearningStateFromStorage = () => {
    if (typeof window === 'undefined') return
    try {
      const level = localStorage.getItem('opc_level')
      const scoreRaw = localStorage.getItem('learning_score') || '0'
      const score = parseInt(scoreRaw, 10)
      const unlock = localStorage.getItem('can_unlock_practice') === 'true'
      // 兼容：guide 页写入的 step_learning_done 标志
      const stepLearningDone = localStorage.getItem('step_learning_done') === 'true'
      setOpcLevel(level)
      setLearningScore(Number.isFinite(score) ? score : 0)
      setCanUnlockPractice(unlock || stepLearningDone)
    } catch {}
  }

  useEffect(() => {
    // 初次挂载
    readLearningStateFromStorage()

    // 权威源：拉服务端 LearningProgress（覆盖本地可能的脏数据）
    try {
      const phone =
        (typeof window !== 'undefined' && localStorage.getItem('opc_device_id')) || ''
      if (phone) {
        fetch(`/api/user/learning-progress?phone=${encodeURIComponent(phone)}`)
          .then((r) => r.json())
          .then((resp) => {
            if (resp?.success && resp.data) {
              const d = resp.data
              const score = Number(d.learning_score) || 0
              const unlock = d.can_unlock_practice === true
              const learningDone = score >= 80 || unlock || d.step_learning_done === true
              // 同步回 localStorage（兜底）
              // 注意：只有 API 返回非空 opcLevel 时才覆盖 localStorage，
              //      避免"新 phone 但 localStorage 已有 opcLevel"被 API 默认值 null 覆盖
              try {
                if (d.opcLevel) {
                  localStorage.setItem('opc_level', d.opcLevel)
                  setOpcLevel(d.opcLevel)
                }
                localStorage.setItem('learning_score', String(score))
                localStorage.setItem('can_unlock_practice', unlock ? 'true' : 'false')
                if (learningDone) localStorage.setItem('step_learning_done', 'true')
              } catch {}
              // 学习分数始终以 API 为准（score 是关键指标）
              setLearningScore(score)
              setCanUnlockPractice(unlock || learningDone)
            }
          })
          .catch(() => {/* 静默降级 */})
      }
    } catch {}

    // 监听：跨标签页 storage 事件
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === 'opc_level' ||
        e.key === 'learning_score' ||
        e.key === 'can_unlock_practice' ||
        e.key === 'step_learning_done'
      ) {
        readLearningStateFromStorage()
      }
    }
    // 监听：回到当前标签 / 页面重新可见
    const onFocus = () => readLearningStateFromStorage()
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        readLearningStateFromStorage()
      }
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 故意空依赖：事件订阅一次，state 更新由事件回调触发

  // ──────────────────────────────────────────────────────────
  // 学习路径 · 四个步骤的精准分流与拦截逻辑
  // ──────────────────────────────────────────────────────────
  const handleStep1 = () => {
    // STEP 01 咨询诊断：直达诊断页
    router.push('/diagnosis')
  }

  const handleStep2 = () => {
    // STEP 02 学习入门：基于 localStorage 多源状态动态分流
    if (typeof window === 'undefined') return
    const level = (localStorage.getItem('opc_level') || opcLevel || '').toLowerCase()
    const scoreRaw = localStorage.getItem('learning_score') || '0'
    const score = parseInt(scoreRaw, 10)
    const unlock =
      localStorage.getItem('can_unlock_practice') === 'true' || canUnlockPractice
    const stepLearningDone = localStorage.getItem('step_learning_done') === 'true'
    const step2Done =
      (Number.isFinite(score) && score >= 80) || unlock || stepLearningDone

    // 🛡️ { scroll: false } 避免 Next.js 在 sticky/fixed header 页面上的
    //   "Skipping auto-scroll behavior" 警告（dev 模式会累计计入错误数）
    const noScroll = { scroll: false } as const

    if (step2Done) {
      // ✅ 已完成：直接进入运营实操的项目库（带 recommend 透传用户类型）
      const recommend = level || 'trader'
      router.push(`/market/projects?recommend=${recommend}`, noScroll)
    } else if (level) {
      // 进行中：去学习页
      router.push(`/guide/${level}`, noScroll)
    } else {
      // 未诊断：先引导到 /market 浏览
      router.push('/market', noScroll)
    }
  }

  const handleStep3 = () => {
    // STEP 03 运营实操：积分拦截
    const scoreRaw = typeof window !== 'undefined'
      ? (localStorage.getItem('learning_score') || '0')
      : String(learningScore)
    const score = parseInt(scoreRaw, 10)
    const level = typeof window !== 'undefined' ? localStorage.getItem('opc_level') : opcLevel

    if (Number.isFinite(score) && score >= 80) {
      router.push(`/market/projects?recommend=${level || 'trader'}`)
    } else {
      // 弹出拦截提示
      toast.warn(
        `您当前学习进度为 ${Number.isFinite(score) ? score : 0} 分，需达到 80 分才可解锁运营实操。请先返回【学习入门】完成新手任务。`
      )
    }
  }

  const handleStep4 = () => {
    // STEP 04 矩阵放大：闭环解锁拦截
    const isUnlocked = typeof window !== 'undefined'
      ? localStorage.getItem('can_unlock_practice') === 'true'
      : canUnlockPractice

    if (isUnlocked) {
      router.push('/scale-up')
    } else {
      toast.warn('您尚未完成运营实操的闭环。请先前往【项目库】完成单个项目的 SOP 执行，才能开启矩阵放大阶段。')
    }
  }

  return (
    <ClientLayout>
      <div className="min-h-screen bg-slate-50">
        {/* 1. HERO — 图四风格：左文 + 右数字人 */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 pt-8 md:pt-10 pb-12 md:pb-16 px-5">
          {/* 背景光斑 */}
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute top-32 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" />

          <div className="relative max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
            {/* 左：文案 */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/15 via-yellow-400/15 to-amber-500/15 backdrop-blur-md border border-amber-400/40 rounded-full px-4 py-1.5 mb-4 shadow-lg">
                <span className="text-base">🏆</span>
                <span className="text-xs md:text-sm text-amber-100 font-semibold tracking-wide">
                  良朋社<span className="text-amber-300">OPC</span> 智富生态系统
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-3">
                <span className="text-white">一人公司 ×</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  OPC 智富操作系统
                </span>
              </h1>

              {/* 智·富 标语行 */}
              <p className="text-sm md:text-base text-slate-200 mb-3 leading-relaxed">
                <span className="font-extrabold text-amber-300 mr-2">智·富</span>
                以智生财，富在当下
                <span className="mx-1.5 text-slate-500">|</span>
                用 AI 武装你的生意
              </p>

              <p className="text-slate-400 mb-6 text-xs md:text-sm">
                汇聚全国 AI 从業者与企业，共同探索 AI 智富路径在实际落地中的应用与商业价值
              </p>

              <div className="flex flex-col md:flex-row gap-3">
                <Link
                  href="/live"
                  className="w-full md:w-auto inline-flex items-center justify-center bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold py-3 px-5 rounded-xl shadow-lg shadow-amber-500/30 active:scale-95 transition-transform text-sm md:text-base"
                  data-testid="hero-live-btn"
                >
                  <span className="mr-1.5 text-base">📺</span>
                  线上直播公开课
                  <ArrowRight size={16} className="ml-2" />
                </Link>
                <Link
                  href="/partner"
                  className="w-full md:w-auto inline-flex items-center justify-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold py-3 px-5 rounded-xl shadow-lg active:scale-95 transition-transform text-sm md:text-base"
                >
                  <Rocket size={18} className="mr-2" />
                  智富主理人·城市招募
                </Link>
              </div>
            </div>

            {/* 右：数字人形象（ThreeAvatar 组件 · 移动端自动跳过） */}
            <div className="relative hidden md:flex items-center justify-center">
              <ThreeAvatar />
            </div>
          </div>
        </section>

        {/* 1.5 实时动态滚动条（Hero 正下方 · 重叠上移 10px） */}
        <section className="relative -mt-10 px-5 z-10 mb-8 md:mb-12">
          <div className="max-w-lg md:max-w-6xl mx-auto">
            <ActivityTicker activities={activities} />
          </div>
        </section>

        {/* 2. 数据条 */}
        <section className="px-5 pt-5 pb-3">
          <div className="max-w-lg mx-auto md:max-w-6xl">
            <div className="bg-gradient-to-r from-slate-800/60 to-slate-900/60 backdrop-blur-md border border-white/20 rounded-3xl px-4 py-4">
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {stats.map((stat, index) => (
                  <div key={index} className="flex-shrink-0 w-24 text-center">
                    <div className="text-2xl font-bold text-white">
                      {stat.value}{stat.suffix}
                    </div>
                    <div className="text-[10px] text-white/70 mt-0.5">
                      {stat.label}{stat.unit}
                    </div>
                    {/* 副标题（仅内测企业展示信任感） */}
                    {stat.label === '内测企业' && (
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        内测即实力，我们已跑通真实商业模型。
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex-shrink-0 flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-2.5 py-1.5 ml-auto">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  <span className="text-[10px] text-white/70">活跃 {activeCount}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 诊断 CTA */}
        <section className="px-5 pt-3 pb-2">
          <div className="max-w-lg mx-auto md:max-w-6xl">
            <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-4 md:p-5 shadow-xl overflow-hidden">
              <div className="relative flex items-center gap-3 text-white">
                <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-3 ring-white/30">
                  <span className="text-xl">🎁</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-amber-100 tracking-wider mb-0.5">
                    🎯 1v1 诊断 · 平均 5 分钟出报告
                  </div>
                  <h3 className="text-sm md:text-base font-extrabold leading-tight">
                    19.9 元，让 AI 帮你算出最适合你的赚钱赛道。
                  </h3>
                </div>
                <Link
                  href="/diagnosis"
                  className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-2 bg-white text-orange-600 text-xs font-bold rounded-lg shadow-md active:scale-95 transition-transform"
                >
                  <Sparkles size={12} />
                  立即咨询
                </Link>
              </div>
              {/* 右上角：老手跳过诊断 · 极简文字链接 */}
              <Link
                href="/market"
                className="absolute top-2 right-3 text-xs text-white/70 hover:text-white flex items-center gap-0.5 transition-colors"
              >
                <Wrench size={10} />
                老手跳过诊断 →
              </Link>
            </div>
          </div>
        </section>

        {/* 4. OPC 学习智富路径（STEP 01-04 卡片） */}
        <section className="px-5 pt-5 pb-3">
          <div className="max-w-lg mx-auto md:max-w-6xl">
            <h2 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
              <span className="text-xl">🏆</span>
              你的 OPC 学习智富路径
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {learningPath.map((item) => {
                const Icon = item.icon

                // ──────────────────────────────────────────────
                // 根据 localStorage 状态动态计算本步状态
                //   'done'    = ✅ 已完成（绿色）
                //   'active'  = ⏳ 进行中（蓝色脉冲）
                //   'locked'  = 🔒 待解锁（灰色）
                // ──────────────────────────────────────────────
                const hasAnyProgress = opcLevel || learningScore > 0 || canUnlockPractice
                let status: 'done' | 'active' | 'locked' = 'locked'

                if (item.step === '01') {
                  status = hasAnyProgress ? 'done' : 'active'
                } else if (item.step === '02') {
                  // ✅ 已完成判定（多源融合，按权威性递减）：
                  //   1. learning_score >= 80
                  //   2. can_unlock_practice === true（useEffect 已将 step_learning_done 合并到此 state）
                  // 🛡️ SSR 安全：不再直接读 window.localStorage，避免 hydration mismatch
                  //    （step_learning_done 在 useEffect 中已合并到 canUnlockPractice）
                  if (learningScore >= 80 || canUnlockPractice) status = 'done'
                  else status = opcLevel ? 'active' : 'locked'
                } else if (item.step === '03') {
                  if (canUnlockPractice) status = 'done'
                  else status = learningScore >= 80 ? 'active' : 'locked'
                } else if (item.step === '04') {
                  if (canUnlockPractice) status = 'done'
                  else status = learningScore >= 80 ? 'active' : 'locked'
                }

                const badgeConfig = {
                  done:   { bg: 'bg-green-100', text: 'text-green-700', border: 'border border-green-200', label: '✅ 已完成' },
                  active: { bg: 'bg-blue-100',  text: 'text-blue-700',  border: '',                              label: '⏳ 进行中' },
                  locked: { bg: 'bg-slate-100', text: 'text-slate-500', border: '',                              label: '🔒 待解锁' },
                }[status]

                // 当前步骤对应点击处理
                const onClick =
                  item.step === '01' ? handleStep1 :
                  item.step === '02' ? handleStep2 :
                  item.step === '03' ? handleStep3 :
                  handleStep4

                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={onClick}
                    className="relative block w-full text-left bg-white border border-slate-200 rounded-2xl p-3 hover:shadow-md transition-shadow active:scale-[0.98]"
                  >
                    {/* 右上角状态徽章 */}
                    <span
                      className={cn(
                        'absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap z-10',
                        badgeConfig.bg,
                        badgeConfig.text,
                        badgeConfig.border,
                        status === 'active' && 'animate-pulse'
                      )}
                    >
                      {badgeConfig.label}
                    </span>

                    {/* STEP 编号 + 图标 + 标题 */}
                    <div className="flex items-center gap-2 mb-1.5 pr-16">
                      <div className={cn('w-8 h-8 rounded-full ring-2 ring-white shadow flex items-center justify-center text-white', statusConfig[status].bg, 'ring-blue-100')}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] font-bold text-slate-400 tracking-wider">STEP {item.step}</div>
                        <div className="text-xs font-bold text-slate-800 leading-tight">{item.title}</div>
                      </div>
                    </div>

                    {/* 核心价值（已移除价格标签，改为下方统一引导横幅） */}
                    <p className="text-[10px] text-slate-600 leading-snug mb-1.5 line-clamp-2">
                      {item.coreValue}
                    </p>

                    {/* 交付物清单（极简浅色胶囊 · flex-wrap 保证移动端不挤压） */}
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.deliverables.map((d, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center text-[9px] leading-tight bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full whitespace-nowrap"
                        >
                          {d}
                        </span>
                      ))}
                    </div>

                    <div className="mt-1.5 flex items-center justify-end">
                      <ArrowRight size={10} className="text-slate-300" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* 5. OPC四层智富阶梯 */}
        <section className="px-5 pt-5 pb-3">
          <div className="max-w-lg mx-auto md:max-w-6xl">
            <div className="mb-3">
              <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-xl">📈</span>
                OPC四层智富阶梯
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {entrepreneurLadder.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  title={item.tooltip}
                  onClick={(e) => handleLadderClick(e, item)}
                  className={cn('relative rounded-2xl p-4 text-white min-h-[120px] flex flex-col justify-between active:scale-[0.98] transition-transform shadow-md', item.color)}
                >
                  {/* 高阶层（系统型/资产型）右上角小锁标识，不影响卡片整体样式 */}
                  {(item.level === 'system' || item.level === 'asset') && (
                    <Lock className="absolute top-2 right-2 w-3 h-3 text-slate-400" />
                  )}
                  <div>
                    <div className="text-[9px] font-bold text-white/80 tracking-widest mb-0.5">{item.layer}</div>
                    <h3 className="text-base font-extrabold leading-tight">{item.title}</h3>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/90 leading-relaxed">{item.desc}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold">
                      了解详情 <ArrowRight size={10} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 6. 四库全胜系统 */}
        <section className="px-5 pt-5 pb-3">
          <div className="max-w-lg mx-auto md:max-w-6xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-xl">🏆</span>
                AI四库全胜系统
              </h2>
              <Link href="/market/projects" className="text-xs text-blue-600 hover:text-blue-700">查看全部 →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {libraryCards.map((card) => {
                const Icon = card.icon
                return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group block rounded-2xl bg-white border border-slate-200 p-4 min-h-[110px] hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                      <Icon size={18} className={card.iconColor} strokeWidth={2.2} />
                    </div>
                    <span className="bg-slate-100 text-slate-500 text-[9px] px-1.5 py-0.5 rounded-full font-medium">
                      {card.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">{card.title}</h3>
                  <p className="mt-1 text-[10px] text-slate-500 leading-relaxed line-clamp-2">{card.subtitle}</p>
                  <div className="mt-2 flex items-center justify-end">
                    <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-medium">
                      前往进入 <ArrowRight size={10} />
                    </span>
                  </div>
                </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* 7. 城市主理人横幅 */}
        <section className="px-5 pt-3 pb-3">
          <div className="max-w-lg mx-auto md:max-w-6xl">
            <Link
              href="/partner"
              className="group block bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-5 text-white overflow-hidden active:scale-[0.99] transition-transform shadow-xl"
            >
              <div className="relative flex items-center gap-3">
                <div className="text-4xl flex-shrink-0">🚀</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                      <Rocket size={10} />
                      🔥 招募中
                    </span>
                  </div>
                  <h2 className="text-lg font-bold mb-0.5">OPC 城市主理人生态圈</h2>
                  <p className="text-[11px] text-white/90 leading-relaxed">
                    全国 4 座城市已联动 · 深圳 / 东莞 / 柳州 / 乌海
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* 8. CTA */}
        <section className="px-5 pt-3 pb-10">
          <div className="max-w-lg mx-auto md:max-w-6xl">
            <div className="bg-gradient-to-br from-blue-600/90 via-indigo-600/90 to-purple-700/90 rounded-3xl p-5 text-center">
              <h3 className="text-lg font-bold text-white mb-1.5">加入良朋社OPC</h3>
              <p className="text-white/80 mb-4 text-xs">与全国顶尖 AI 从业者一起，开启企业智能化转型之旅</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Link href="/auth/signup" className="inline-flex items-center justify-center bg-white text-slate-900 font-semibold py-2.5 px-5 rounded-xl text-sm shadow-lg active:scale-95 transition-transform">
                  免费注册
                </Link>
                <Link
                  href="/join"
                  className="group relative inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white font-extrabold py-2.5 px-5 rounded-xl text-sm shadow-lg shadow-orange-500/40 hover:shadow-orange-500/60 ring-2 ring-amber-300/50 active:scale-95 transition-all whitespace-nowrap"
                >
                  <Sparkles size={14} className="text-amber-100" />
                  <span>查看 199 会员价值</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link href="/contact" className="inline-flex items-center justify-center bg-white/10 border border-white/30 text-white font-semibold py-2.5 px-5 rounded-xl text-sm active:scale-95 transition-transform">
                  联系我们
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ═══ OPC 四层智富阶梯 · 拦截弹窗（任务 1/2 改造）═══ */}
      {blocker.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setBlocker({ open: false, message: '', ctaLabel: '', ctaHref: '' })}
        >
          <div
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 md:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setBlocker({ open: false, message: '', ctaLabel: '', ctaHref: '' })}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              aria-label="关闭"
            >
              ✕
            </button>
            <div className="text-sm md:text-base text-slate-800 leading-relaxed font-medium pr-6">
              {blocker.message}
            </div>
            <div className="mt-5 flex justify-end">
              <Link
                href={blocker.ctaHref}
                onClick={() => setBlocker({ open: false, message: '', ctaLabel: '', ctaHref: '' })}
                className="inline-flex items-center gap-1 h-11 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl shadow-md hover:scale-105 active:scale-95 transition-transform"
              >
                {blocker.ctaLabel}
              </Link>
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  )
}

// ════════════════════════════════════════════════════════════════
// 实时动态滚动条（恢复原始版本：含左右渐变蒙版）
// ════════════════════════════════════════════════════════════════
function ActivityTicker({ activities }: { activities: Activity[] }) {
  if (!activities || activities.length === 0) return null

  return (
    <div className="relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-2.5">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...activities, ...activities].map((activity, idx) => (
          <div
            key={`${activity.id}-${idx}`}
            className="flex items-center gap-2 px-5 text-sm text-white/90 flex-shrink-0"
          >
            <span className="text-yellow-300">📍</span>
            <span className="font-semibold text-white">{activity.city}</span>
            <span className="text-white/80">
              {activity.user} {activity.action}
            </span>
            <span className="text-white/40 mx-3">|</span>
          </div>
        ))}
      </div>
      {/* 左右渐变蒙版（边缘淡出） */}
      <div className="absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-slate-900/80 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-slate-900/80 to-transparent pointer-events-none" />
    </div>
  )
}
