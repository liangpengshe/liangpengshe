'use client'

/**
 * 良朋社 OPC · 定价页（三区块分层 + 权益矩阵）
 * ------------------------------------------------------------
 * 进化一：固定文案 → 动态价格配置数组（Mock 数据驱动）
 * 进化二：3 区块视觉分层（破冰与连接 / 实战与陪跑 / 扩张与授权）
 * 进化三：权益权限矩阵（4 维度 ✅/❌ 显性对比）
 * 进化四：个人中心上下文感知（在会员中心显示当前权益与升级引导）
 * 进化五：移动优先 + 吸顶分区导航
 *
 * 6 档定价（重组）：
 *   区块一·破冰与连接：
 *     TIER 1 · 19.9 元   智富先锋卡（一次性）
 *     TIER 2 · 199 元/年 智富社群（年度社群）
 *   区块二·实战与陪跑：
 *     TIER 3 · 69 元/月  单店月卡（订阅）
 *     TIER 4 · 599 元/年 3个月轻陪跑
 *     TIER 5 · 1980 元   深度矩阵陪跑
 *   区块三·扩张与授权（深色背景）：
 *     TIER 6 · 5980 元   城市主理人/项目授权
 * ------------------------------------------------------------
 */

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Check,
  X,
  Sparkles,
  Crown,
  Wallet,
  Star,
  Shield,
  Bot,
  FileText,
  Lightbulb,
  Users,
  Target,
  BarChart3,
  Calendar,
  GraduationCap,
  Briefcase,
  ArrowRight,
  Award,
  TrendingUp,
  Flame,
  Clock,
  Gift,
  AlertCircle,
  ChevronDown,
  Lock,
  Building2,
  Rocket,
  Network,
} from 'lucide-react'

// ════════════════════════════════════════════════════════════════
// 1. 价格档配置 · 含 4 维权益矩阵
// ════════════════════════════════════════════════════════════════
type PlanKey =
  | 'PIONEER_19'
  | 'COMMUNITY_199'
  | 'MONTHLY_69'
  | 'LIGHT_599'
  | 'DEEP_1980'
  | 'CITY_5980'

type SectionKey = 'ice' | 'battle' | 'expansion'

interface PricePlan {
  key: PlanKey
  tier: number
  name: string
  tagline: string
  /** 主价格（元） */
  price: number
  /** 主价格单位（"月" / "次" / "年"） */
  cycle: string
  /** 划线原价 */
  originalPrice?: number
  /** 锚点横幅（消除订单恐惧） */
  anchor: {
    emoji: string
    text: string
    /** 强调色：red / amber / blue / purple */
    tone: 'red' | 'amber' | 'blue' | 'purple' | 'emerald'
  }
  /** 卡片顶部配色 */
  theme: {
    accent: string // 边框
    bg: string
    headerBg: string
    priceColor: string
    buttonBg: string
    iconBg: string
    badgeBg: string
  }
  /** 适合人群 */
  target: string
  /** 权益（图标 + 文字） */
  benefits: Array<{ icon: any; text: string; highlight?: boolean }>
  /** CTA 文案 */
  cta: string
  /** 推荐标记 */
  recommended?: boolean
  /** 标签 */
  badges: string[]
  /** 订阅奖励说明（仅订阅制显示，例：100 积分） */
  bonusNote?: string
  /** 所属区块 */
  section: SectionKey
  /** 4 维权益权限矩阵（单店/矩阵/陪跑/分站） */
  matrix: {
    singleStore: boolean
    matrix: boolean
    coach: boolean
    cityAgent: boolean
  }
}

// ═══════ 4 维权益矩阵定义（用于卡片底部显性对比）═══════
const MATRIX_DIMS = [
  { key: 'singleStore', label: '单店/单号实操', Icon: Rocket },
  { key: 'matrix', label: '矩阵放大与多店', Icon: Network },
  { key: 'coach', label: '专家陪跑', Icon: GraduationCap },
  { key: 'cityAgent', label: '本地分站代理', Icon: Building2 },
] as const

const PLANS: PricePlan[] = [
  // ═══════ 区块一·破冰与连接 ═══════
  {
    key: 'PIONEER_19',
    tier: 1,
    name: '智富先锋卡',
    tagline: '一杯奶茶钱 · 开启 AI 商业启蒙',
    price: 19.9,
    cycle: '一次性',
    originalPrice: 99,
    anchor: {
      emoji: '🎁',
      text: '限新人首次专享 · 不订阅不续费 · 7 天内可全额退',
      tone: 'amber',
    },
    theme: {
      accent: 'border-amber-300',
      bg: 'bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40',
      headerBg: 'bg-gradient-to-r from-amber-100 to-orange-100',
      priceColor: 'text-amber-600',
      buttonBg: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
      iconBg: 'bg-amber-100',
      badgeBg: 'bg-amber-100 text-amber-700',
    },
    target: '适合：刚接触 AI 商业、想先体验一次的创业者',
    badges: ['🎫 尝鲜', '💎 入门'],
    section: 'ice',
    matrix: {
      singleStore: false,
      matrix: false,
      coach: false,
      cityAgent: false,
    },
    benefits: [
      { icon: Bot, text: '解锁 AI 商业诊断报告 1 次' },
      { icon: FileText, text: 'Dify 工具体验卡（自研 5 个 AI）' },
      { icon: Calendar, text: '1 次线下沙龙入场名额' },
      { icon: Gift, text: '送 50 智富积分（可在下次续费时抵扣）' },
    ],
    cta: '🎯 19.9 元立即体验',
  },
  {
    key: 'COMMUNITY_199',
    tier: 2,
    name: '智富社群',
    tagline: '199 元/年 · 主理人圈子 + 每周闭门会',
    price: 199,
    cycle: '/ 年',
    originalPrice: 599,
    anchor: {
      emoji: '🤝',
      text: '新人首年 199 元 · 次年自动续 599 元 · 随时可退群',
      tone: 'emerald',
    },
    theme: {
      accent: 'border-emerald-300',
      bg: 'bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40',
      headerBg: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500',
      priceColor: 'text-emerald-600',
      buttonBg: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
      iconBg: 'bg-emerald-100',
      badgeBg: 'bg-emerald-100 text-emerald-700',
    },
    target: '适合：想进入 OPC 圈子、与同行交流连接的创业者',
    badges: ['🤝 圈子', '💬 周会'],
    section: 'ice',
    matrix: {
      singleStore: false,
      matrix: false,
      coach: false,
      cityAgent: false,
    },
    benefits: [
      { icon: Users, text: '4 城主理人私域圈子（深圳/东莞/柳州/乌海）' },
      { icon: Calendar, text: '每周三 1V1 直播答疑 · 一年 48 场' },
      { icon: FileText, text: '智富日报 + 闭门会录播永久回看' },
      { icon: Gift, text: '社群专属资源包（4 城 SOP 文档）' },
    ],
    cta: '🤝 199 元加入圈子',
  },

  // ═══════ 区块二·实战与陪跑 ═══════
  {
    key: 'MONTHLY_69',
    tier: 3,
    name: '单店实操月卡',
    tagline: '首月 9.9 元，次月 69 元自动续费',
    price: 69,
    cycle: '/ 月',
    originalPrice: 199,
    anchor: {
      emoji: '🔥',
      text: '首月仅需 9.9 元，次月 69 元自动续费，随时可取消',
      tone: 'red',
    },
    theme: {
      accent: 'border-rose-400 ring-2 ring-rose-200/50',
      bg: 'bg-gradient-to-br from-rose-50/90 via-white to-pink-50/60',
      headerBg: 'bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500',
      priceColor: 'text-rose-600',
      buttonBg: 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600',
      iconBg: 'bg-rose-100',
      badgeBg: 'bg-rose-100 text-rose-700',
    },
    target: '适合：想跑通单店/单号 SOP、边学边干',
    badges: ['🔥 最受欢迎', '🎯 订阅首选'],
    recommended: true,
    section: 'battle',
    matrix: {
      singleStore: true,
      matrix: false,
      coach: false,
      cityAgent: false,
    },
    bonusNote: '💎 首月 9.9 元，次月 69 元。订阅即送 100 积分，积分可在下次续费时抵扣现金。',
    benefits: [
      { icon: Shield, text: '工具库 + 项目库 + 服务库 + 资源库 · 全年无限访问' },
      { icon: Lightbulb, text: 'AI 商业诊断报告 无限次', highlight: true },
      { icon: BarChart3, text: '每日智富日报 自动推送' },
      { icon: GraduationCap, text: '学习中心 · 80 分自动解锁工作台' },
      { icon: X, text: '随时取消 · 不收任何手续费' },
    ],
    cta: '🚀 9.9 元开通月度',
  },
  {
    key: 'LIGHT_599',
    tier: 4,
    name: '3 个月轻陪跑',
    tagline: '导师 1V1 陪跑 90 天 · 跑通单店 SOP',
    price: 599,
    cycle: '一次性',
    originalPrice: 1980,
    anchor: {
      emoji: '🎓',
      text: '导师 1V1 陪跑 90 天 · 7 天未启动 SOP 全额退款',
      tone: 'blue',
    },
    theme: {
      accent: 'border-blue-400',
      bg: 'bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/40',
      headerBg: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500',
      priceColor: 'text-blue-600',
      buttonBg: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600',
      iconBg: 'bg-blue-100',
      badgeBg: 'bg-blue-100 text-blue-700',
    },
    target: '适合：已跑通基础 SOP、想深挖单店的主理人',
    badges: ['🥇 高性价比', '🎓 1V1 陪跑'],
    section: 'battle',
    matrix: {
      singleStore: true,
      matrix: false,
      coach: true,
      cityAgent: false,
    },
    benefits: [
      { icon: Users, text: '导师 1V1 陪跑 90 天（每周 1 次 1 小时）' },
      { icon: Target, text: '专属单店 SOP 定制（从选品到落地）' },
      { icon: Star, text: '月度会员全部权益 × 1 年' },
      { icon: Briefcase, text: '城市分站资源对接通道' },
    ],
    cta: '🎯 599 元加入陪跑',
  },
  {
    key: 'DEEP_1980',
    tier: 5,
    name: '深度矩阵陪跑',
    tagline: '1V1 陪跑 6 个月 · 矩阵放大 + 团队搭建',
    price: 1980,
    cycle: '一次性',
    originalPrice: 5980,
    anchor: {
      emoji: '🚀',
      text: '导师 1V1 陪跑 180 天 · 矩阵放大 SOP 定制 · 30 天无效果全额退',
      tone: 'blue',
    },
    theme: {
      accent: 'border-indigo-400',
      bg: 'bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/40',
      headerBg: 'bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700',
      priceColor: 'text-indigo-700',
      buttonBg: 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700',
      iconBg: 'bg-indigo-100',
      badgeBg: 'bg-indigo-100 text-indigo-700',
    },
    target: '适合：单店已盈利 · 想矩阵放大到 3-5 店的进阶主理人',
    badges: ['🚀 进阶', '🏗️ 团队搭建'],
    section: 'battle',
    matrix: {
      singleStore: true,
      matrix: true,
      coach: true,
      cityAgent: false,
    },
    benefits: [
      { icon: Network, text: '1V1 陪跑 180 天（每周 1 次 × 2 小时）' },
      { icon: TrendingUp, text: '矩阵放大 SOP（多店/多号批量管理）' },
      { icon: Users, text: '团队搭建（招人/分钱/OKR）' },
      { icon: Award, text: '轻陪跑全部权益 + 2 个城市分站考察名额' },
    ],
    cta: '🚀 1980 元深度陪跑',
  },

  // ═══════ 区块三·扩张与授权 ═══════
  {
    key: 'CITY_5980',
    tier: 6,
    name: '城市主理人/项目授权',
    tagline: '锁定分站经营 + 总部导师 + 团队搭建',
    price: 5980,
    cycle: '一次性',
    originalPrice: 19800,
    anchor: {
      emoji: '👑',
      text: '签约后 30 天内未启动运营 · 全额退款',
      tone: 'purple',
    },
    theme: {
      accent: 'border-amber-400',
      bg: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950',
      headerBg: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600',
      priceColor: 'text-amber-300',
      buttonBg: 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600',
      iconBg: 'bg-amber-500/20',
      badgeBg: 'bg-amber-500/20 text-amber-200',
    },
    target: '适合：锁定城市分站、想长期经营的高净值合伙人',
    badges: ['👑 高净值首选', '🏙️ 城市合伙人'],
    section: 'expansion',
    matrix: {
      singleStore: true,
      matrix: true,
      coach: true,
      cityAgent: true,
    },
    benefits: [
      { icon: Crown, text: '城市主理人认证 + City 表关联', highlight: true },
      { icon: Users, text: '总部导师轮值（弓老师/卢老师/于老师/吕老师）' },
      { icon: Briefcase, text: '企业 AI 内训 5 折通道（市场价）' },
      { icon: BarChart3, text: '分站经营数据看板 · 永久使用' },
      { icon: Award, text: 'OPC 全球合伙人峰会入场名额 1 张' },
    ],
    cta: '👑 锁定主理人名额',
  },
]

// ════════════════════════════════════════════════════════════════
// 2. 区块元数据
// ════════════════════════════════════════════════════════════════
const SECTIONS: Array<{
  key: SectionKey
  index: '01' | '02' | '03'
  emoji: string
  title: string
  subtitle: string
  hint: string
  /** 深色背景 */
  dark?: boolean
  /** 区块引导色（左侧细条） */
  ribbon: string
}> = [
  {
    key: 'ice',
    index: '01',
    emoji: '🧊',
    title: '破冰与连接',
    subtitle: '从「看见」到「入门」',
    hint: '低门槛体验，找到方向后再深入',
    ribbon: 'from-amber-400 to-orange-500',
  },
  {
    key: 'battle',
    index: '02',
    emoji: '⚔️',
    title: '实战与陪跑',
    subtitle: '从「订阅」到「跑通 SOP」',
    hint: '3 档按深度递进 · 卡片高度统一便于对比',
    ribbon: 'from-blue-500 to-indigo-600',
  },
  {
    key: 'expansion',
    index: '03',
    emoji: '👑',
    title: '扩张与授权',
    subtitle: '从「单店」到「城市合伙人」',
    hint: '锁定分站经营 + 总部导师全程支持',
    dark: true,
    ribbon: 'from-amber-400 to-yellow-500',
  },
]

// ════════════════════════════════════════════════════════════════
// 3. FAQ
// ════════════════════════════════════════════════════════════════
const FAQS = [
  {
    q: '支付后多久可以使用权益？',
    a: '所有档位支付完成后立即生效；月度会员：首月 9.9 元开通后立即生效，到期前 24 小时自动续费（可取消）。',
  },
  {
    q: '月度会员如何取消？',
    a: '在「个人中心 → 我的会员权益」中点击「取消订阅」即可，取消后仍可使用至当前周期结束，不收任何手续费。',
  },
  {
    q: '9.9 元首月优惠只能用一次吗？',
    a: '是的，首月 9.9 元限新用户首次订阅；同一个账号仅可享受 1 次。',
  },
  {
    q: '1980 元深度陪跑和 5980 元主理人有什么本质区别？',
    a: '1980 元重点在「矩阵放大 SOP」+ 团队搭建（服务你自己的多店）；5980 元是「城市合伙人」身份（锁定一个城市的运营权 + 总部导师轮值 + 团队搭建）。',
  },
  {
    q: '5980 元主理人是否可以退款？',
    a: '签约后 30 天内未启动分站运营（含未提交运营计划），可全额退款；30 天后或已启动运营，扣除 30% 启动服务费后余额退还。',
  },
]

// ════════════════════════════════════════════════════════════════
// 4. 主组件
// ════════════════════════════════════════════════════════════════
export default function PricingPage() {
  // 已订阅状态（从 localStorage 读）
  const [ownedPlans, setOwnedPlans] = useState<PlanKey[]>([])
  const [activeSubscription, setActiveSubscription] = useState<{
    plan: PlanKey
    renewDate?: string
  } | null>(null)
  const [billing] = useState<'monthly' | 'yearly'>('monthly')

  // 当前激活的区块（吸顶导航用）
  const [activeSection, setActiveSection] = useState<SectionKey>('ice')

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const owned = JSON.parse(window.localStorage.getItem('opc_owned_plans') || '[]')
      setOwnedPlans(owned)
      const active = window.localStorage.getItem('opc_active_subscription')
      if (active) {
        const parsed = JSON.parse(active)
        setActiveSubscription(parsed)
      }
    } catch {
      // 静默
    }
  }, [])

  // 滚动监听 · 吸顶导航联动
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleScroll = () => {
      const offsets = SECTIONS.map((s) => {
        const el = document.getElementById(`section-${s.key}`)
        if (!el) return { key: s.key, top: Infinity }
        return { key: s.key, top: el.getBoundingClientRect().top }
      })
      // 选第一个 top <= 120 的 section
      const current = offsets.find((o) => o.top <= 120)
      if (current && current.key !== activeSection) {
        setActiveSection(current.key as SectionKey)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeSection])

  const dailyCost = useMemo(() => {
    return PLANS.map((p) => ({
      key: p.key,
      text:
        p.cycle === '/ 月'
          ? `≈ ${(p.price / 30).toFixed(1)} 元/天`
          : p.cycle === '/ 年'
            ? `≈ ${(p.price / 365).toFixed(1)} 元/天`
            : p.cycle === '一次性'
              ? '一次性付费 · 永久使用'
              : '',
    }))
  }, [])

  const scrollToSection = (key: SectionKey) => {
    if (typeof window === 'undefined') return
    const el = document.getElementById(`section-${key}`)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      {/* ═══════ Hero ═══════ */}
      <section className="px-5 pt-8 pb-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-lg md:max-w-6xl mx-auto">
          <Link
            href="/pitch"
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={14} />
            返回商业全景
          </Link>

          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <Wallet size={12} />
              <span>💰 OPC 阶梯式订阅与轻量级付费</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-3">
              从 <span className="text-amber-300">9.9 元</span> 起步，
              <br className="md:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400">
                一路升级到 5980 元
              </span>
              主理人
            </h1>
            <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto">
              3 区块 6 档 · 从破冰到城市合伙人 · 适合「先体验 → 再订阅 → 后锁定分站」的渐进式消费。
            </p>

            {/* 当前订阅提示 */}
            {activeSubscription && (
              <div className="mt-5 inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-semibold px-4 py-2 rounded-full">
                <Check size={12} />
                <span>当前订阅：{PLANS.find((p) => p.key === activeSubscription.plan)?.name}</span>
                {activeSubscription.renewDate && (
                  <span className="text-emerald-300/80">
                    · 下次续费 {activeSubscription.renewDate}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════ 吸顶分区导航（移动端友好） ═══════ */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-lg md:max-w-6xl mx-auto px-3 py-2 flex overflow-x-auto scrollbar-hide gap-2">
          {SECTIONS.map((s) => {
            const isActive = activeSection === s.key
            return (
              <button
                key={s.key}
                onClick={() => scrollToSection(s.key)}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                  isActive
                    ? s.dark
                      ? 'bg-slate-900 text-amber-300 ring-2 ring-amber-400/50'
                      : 'bg-blue-600 text-white ring-2 ring-blue-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="text-sm">{s.emoji}</span>
                <span>
                  {s.index} · {s.title}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ═══════ 三区块 6 档 ═══════ */}
      {SECTIONS.map((section) => {
        const sectionPlans = PLANS.filter((p) => p.section === section.key)
        const isBattle = section.key === 'battle' // 中部实战区：高度统一
        const isExpansion = section.key === 'expansion'

        return (
          <section
            key={section.key}
            id={`section-${section.key}`}
            className={`scroll-mt-20 px-4 py-8 md:py-12 ${
              isExpansion
                ? 'bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white'
                : ''
            }`}
          >
            <div className="max-w-lg md:max-w-6xl mx-auto">
              {/* 区块标题 */}
              <div className="mb-6 md:mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-1 h-10 rounded-full bg-gradient-to-b ${section.ribbon}`}
                  />
                  <div className="flex-1">
                    <div
                      className={`text-[10px] font-extrabold tracking-widest mb-0.5 ${
                        isExpansion ? 'text-amber-300' : 'text-slate-400'
                      }`}
                    >
                      BLOCK {section.index}
                    </div>
                    <h2
                      className={`text-xl md:text-3xl font-extrabold leading-tight ${
                        isExpansion ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {section.emoji} {section.title}
                    </h2>
                  </div>
                </div>
                <p
                  className={`text-sm md:text-base ml-4 leading-relaxed ${
                    isExpansion ? 'text-amber-100/80' : 'text-slate-500'
                  }`}
                >
                  {section.subtitle} · {section.hint}
                </p>
              </div>

              {/* 卡片网格 */}
              <div
                className={`grid grid-cols-1 ${
                  isBattle
                    ? 'md:grid-cols-3 md:items-stretch'
                    : isExpansion
                      ? 'md:grid-cols-1'
                      : 'md:grid-cols-2'
                } gap-4`}
              >
                {sectionPlans.map((plan) => {
                  const isOwned = ownedPlans.includes(plan.key)
                  const isActive = activeSubscription?.plan === plan.key
                  return (
                    <PlanCard
                      key={plan.key}
                      plan={plan}
                      isOwned={isOwned}
                      isActive={isActive}
                      dailyCost={dailyCost.find((d) => d.key === plan.key)?.text || ''}
                      isExpansion={isExpansion}
                    />
                  )
                })}
              </div>
            </div>
          </section>
        )
      })}

      {/* ═══════ 推荐组合说明 ═══════ */}
      <section className="px-4 py-10">
        <div className="max-w-lg md:max-w-6xl mx-auto">
          <div className="mt-2 relative bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 md:p-6 overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Award size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-bold mb-1">
                  🎁 智富先锋卡 + 月度会员 = 黄金组合
                </h3>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  先花 19.9 元体验 1 次 AI 诊断 + 1 次沙龙，确认方向后再订月度会员（首月 9.9 元）。
                  一年最高省 ¥840。
                </p>
              </div>
              <button
                onClick={() => scrollToSection('ice')}
                className="flex-shrink-0 w-full md:w-auto inline-flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-4 py-2.5 rounded-full text-sm transition-colors"
              >
                <span>查看订阅方案</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ 全档权益对比表 ═══════ */}
      <section className="px-4 py-10">
        <div className="max-w-lg md:max-w-6xl mx-auto">
          <h2 className="text-lg md:text-2xl font-bold text-slate-900 text-center mb-6">
            📊 6 档权益对比
          </h2>
          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left p-3 font-bold text-slate-700 sticky left-0 bg-slate-50 z-10">
                    权益项
                  </th>
                  {PLANS.map((p) => (
                    <th
                      key={p.key}
                      className={`text-center p-3 font-bold text-slate-700 min-w-[80px] ${
                        p.section === 'expansion' ? 'bg-slate-900/5' : ''
                      }`}
                    >
                      <div className="text-[10px] text-slate-400 mb-0.5">TIER 0{p.tier}</div>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MATRIX_DIMS.map((dim) => (
                  <tr key={dim.key} className="hover:bg-slate-50/50">
                    <td className="p-3 font-medium text-slate-700 sticky left-0 bg-white">
                      {dim.label}
                    </td>
                    {PLANS.map((p) => {
                      const ok = p.matrix[dim.key as keyof typeof p.matrix]
                      return (
                        <td
                          key={p.key}
                          className={`p-3 text-center text-base ${
                            p.section === 'expansion' ? 'bg-slate-900/5' : ''
                          }`}
                        >
                          {ok ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600">
                              ✓
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400">
                              ×
                            </span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
                {[
                  { label: 'AI 商业诊断', values: ['1 次', '社群', '无限', '无限', '无限', '无限'] },
                  { label: '工具库访问', values: ['试用', '社群', '✓', '✓', '✓', '✓'] },
                  { label: '项目库 SOP', values: ['—', '社群', '✓', '✓', '✓', '✓'] },
                  { label: '智富日报', values: ['—', '✓', '✓', '✓', '✓', '✓'] },
                  { label: '导师 1V1 陪跑', values: ['—', '—', '—', '90 天', '180 天', '永久'] },
                  { label: '城市分站', values: ['—', '—', '—', '申请', '考察', '主理人'] },
                  { label: '可退款', values: ['7 天', '随时', '随时', '7 天', '30 天', '30 天'] },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="p-3 font-medium text-slate-700 sticky left-0 bg-white">
                      {row.label}
                    </td>
                    {row.values.map((v, j) => (
                      <td
                        key={j}
                        className={`p-3 text-center ${
                          j === 2
                            ? 'bg-rose-50/50 font-bold text-rose-700'
                            : 'text-slate-600'
                        } ${PLANS[j]?.section === 'expansion' ? 'bg-slate-900/5' : ''}`}
                      >
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="px-4 py-6">
        <div className="max-w-lg md:max-w-3xl mx-auto">
          <h2 className="text-lg md:text-2xl font-bold text-slate-900 text-center mb-6">
            常见问题
          </h2>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <details
                key={i}
                className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors"
              >
                <summary className="cursor-pointer list-none p-4 flex items-center justify-between gap-2 font-medium text-slate-900 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                      Q
                    </span>
                    <span>{f.q}</span>
                  </span>
                  <ChevronDown
                    size={16}
                    className="text-slate-400 group-open:rotate-180 transition-transform"
                  />
                </summary>
                <div className="px-4 pb-4 pt-1 text-sm text-slate-600 leading-relaxed">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 底部兜底 ═══════ */}
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
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// 5. 单个价格卡片（含 4 维权益矩阵）
// ════════════════════════════════════════════════════════════════
function PlanCard({
  plan,
  isOwned,
  isActive,
  dailyCost,
  isExpansion,
}: {
  plan: PricePlan
  isOwned: boolean
  isActive: boolean
  dailyCost: string
  isExpansion: boolean
}) {
  return (
    <div
      className={`relative ${plan.theme.bg} ${plan.theme.accent} border-2 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${
        isExpansion ? 'md:max-w-3xl md:mx-auto' : ''
      }`}
    >
      {/* 推荐角标 */}
      {plan.recommended && !isExpansion && (
        <div className="absolute top-0 right-0 z-10 bg-gradient-to-l from-rose-500 to-pink-500 text-white text-[11px] font-bold px-3 py-1 rounded-bl-2xl flex items-center gap-1 shadow-lg">
          <Flame size={10} />
          推荐
        </div>
      )}
      {isActive && (
        <div className="absolute top-0 left-0 z-10 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[11px] font-bold px-3 py-1 rounded-br-2xl flex items-center gap-1 shadow-lg">
          <Check size={10} />
          当前订阅
        </div>
      )}
      {isExpansion && (
        <div className="absolute top-0 right-0 z-10 bg-gradient-to-l from-amber-500 to-yellow-400 text-slate-900 text-[11px] font-bold px-3 py-1 rounded-bl-2xl flex items-center gap-1 shadow-lg">
          <Crown size={10} />
          城市合伙人
        </div>
      )}

      {/* ═══════ 锚点横幅 ═══════ */}
      <div
        className={`px-4 py-2.5 text-center text-[11px] font-semibold border-b ${
          plan.anchor.tone === 'red'
            ? 'bg-rose-50/90 text-rose-700 border-rose-100'
            : plan.anchor.tone === 'amber'
              ? 'bg-amber-50/90 text-amber-700 border-amber-100'
              : plan.anchor.tone === 'blue'
                ? 'bg-blue-50/90 text-blue-700 border-blue-100'
                : plan.anchor.tone === 'emerald'
                  ? 'bg-emerald-50/90 text-emerald-700 border-emerald-100'
                  : 'bg-amber-900/40 text-amber-200 border-amber-700/40'
        }`}
      >
        <span className="mr-1">{plan.anchor.emoji}</span>
        {plan.anchor.text}
      </div>

      {/* 头部 */}
      <div className={`${plan.theme.headerBg} px-5 py-4`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`${plan.theme.badgeBg} text-[10px] font-bold px-2 py-0.5 rounded-full`}>
            TIER 0{plan.tier}
          </span>
          {plan.badges.map((b, j) => (
            <span
              key={j}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm border ${
                isExpansion
                  ? 'bg-slate-900/30 text-amber-100 border-amber-300/30'
                  : 'bg-white/25 text-white border-white/30'
              }`}
            >
              {b}
            </span>
          ))}
        </div>
        <h3
          className={`font-extrabold text-xl leading-tight drop-shadow ${
            isExpansion ? 'text-slate-900' : 'text-white'
          }`}
        >
          {plan.name}
        </h3>
        <p
          className={`text-[11px] mt-1 leading-relaxed ${
            isExpansion ? 'text-slate-700' : 'text-white/90'
          }`}
        >
          {plan.tagline}
        </p>
      </div>

      {/* 价格 */}
      <div
        className={`px-5 py-4 ${
          isExpansion ? 'bg-slate-900/40' : 'bg-white/60'
        }`}
      >
        <div className="flex items-baseline gap-1.5">
          {plan.originalPrice && (
            <span
              className={`text-sm line-through ${
                isExpansion ? 'text-amber-200/50' : 'text-slate-400'
              }`}
            >
              ¥{plan.originalPrice}
            </span>
          )}
          <span
            className={`text-xs ${isExpansion ? 'text-amber-200' : 'text-slate-500'}`}
          >
            ¥
          </span>
          <span className={`text-4xl font-extrabold leading-none ${plan.theme.priceColor}`}>
            {plan.key === 'MONTHLY_69' ? (
              <>
                <span className="text-2xl">9.9</span>
                <span
                  className={`text-base mx-0.5 ${
                    isExpansion ? 'text-amber-200' : 'text-slate-500'
                  }`}
                >
                  /
                </span>
                <span className="text-2xl">69</span>
              </>
            ) : (
              plan.price
            )}
          </span>
          <span
            className={`text-sm font-medium ${
              isExpansion ? 'text-amber-100' : 'text-slate-500'
            }`}
          >
            {plan.cycle}
          </span>
        </div>
        <p
          className={`text-[10px] mt-1.5 flex items-center gap-1 ${
            isExpansion ? 'text-amber-200/70' : 'text-slate-500'
          }`}
        >
          <Clock size={10} />
          {dailyCost}
        </p>
      </div>

      {/* 权益列表 */}
      <div className="px-5 py-4 space-y-2">
        {plan.benefits.map((b, j) => {
          const Icon = b.icon
          return (
            <div key={j} className="flex items-start gap-2 text-[13px]">
              <div
                className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${plan.theme.iconBg}`}
              >
                <Icon
                  size={11}
                  className={
                    isExpansion ? 'text-amber-300' : plan.theme.priceColor
                  }
                />
              </div>
              <span
                className={`leading-snug ${
                  isExpansion
                    ? b.highlight
                      ? 'font-bold text-amber-100'
                      : 'text-amber-50/90'
                    : b.highlight
                      ? 'font-bold text-slate-900'
                      : 'text-slate-700'
                }`}
              >
                {b.text}
              </span>
            </div>
          )
        })}
      </div>

      {/* 适合人群 */}
      <div className="px-5 pb-3">
        <p
          className={`text-[10px] leading-relaxed rounded-lg p-2 border ${
            isExpansion
              ? 'bg-slate-900/40 text-amber-100/80 border-amber-700/30'
              : 'bg-slate-50/80 text-slate-500 border-slate-100'
          }`}
        >
          {plan.target}
        </p>
      </div>

      {/* 💎 订阅奖励说明 */}
      {plan.bonusNote && (
        <div className="px-5 pb-3">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-200 p-2.5">
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-amber-300/30 rounded-full blur-xl" />
            <p className="relative text-[11px] font-bold text-amber-900 leading-relaxed">
              {plan.bonusNote}
            </p>
          </div>
        </div>
      )}

      {/* ═══════ 任务 2：4 维权益权限矩阵（显性对比）═══════ */}
      <div
        className={`px-5 pb-3 ${
          isExpansion ? 'border-t border-amber-700/30 pt-3' : ''
        }`}
      >
        <div
          className={`text-[10px] font-extrabold tracking-widest mb-2 flex items-center gap-1 ${
            isExpansion ? 'text-amber-300' : 'text-slate-500'
          }`}
        >
          <Lock size={9} />
          权益权限矩阵
        </div>
        <div
          className={`grid grid-cols-2 gap-1.5 rounded-xl p-2 ${
            isExpansion
              ? 'bg-slate-900/60 border border-amber-700/30'
              : 'bg-slate-50 border border-slate-200'
          }`}
        >
          {MATRIX_DIMS.map((dim) => {
            const ok = plan.matrix[dim.key as keyof typeof plan.matrix]
            const DimIcon = dim.Icon
            return (
              <div
                key={dim.key}
                className={`flex items-center gap-1.5 text-[11px] font-medium ${
                  ok
                    ? isExpansion
                      ? 'text-amber-200'
                      : 'text-slate-800'
                    : isExpansion
                      ? 'text-amber-100/40'
                      : 'text-slate-400'
                }`}
              >
                <span
                  className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                    ok
                      ? isExpansion
                        ? 'bg-amber-400 text-slate-900'
                        : 'bg-emerald-500 text-white'
                      : isExpansion
                        ? 'bg-slate-700 text-slate-500'
                        : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {ok ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
                </span>
                <DimIcon size={10} className="flex-shrink-0 opacity-70" />
                <span className="truncate">{dim.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5 pt-2">
        {isActive ? (
          <Link
            href="/member"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-md text-sm flex items-center justify-center gap-1"
          >
            <Check size={14} />
            查看我的会员权益
          </Link>
        ) : isOwned ? (
          <button
            disabled
            className={`w-full font-bold py-3 rounded-xl text-sm cursor-not-allowed ${
              isExpansion
                ? 'bg-amber-500/30 text-amber-200'
                : 'bg-slate-200 text-slate-500'
            }`}
          >
            ✅ 已购买
          </button>
        ) : (
          <PayButton plan={plan} isExpansion={isExpansion} />
        )}
        <p
          className={`text-[10px] text-center mt-2 ${
            isExpansion ? 'text-amber-200/60' : 'text-slate-400'
          }`}
        >
          支持微信 / 支付宝 · 企业支付请联系客服
        </p>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// 6. 支付按钮（客户端组件 · 调用 mock-checkout API）
// ════════════════════════════════════════════════════════════════
function PayButton({
  plan,
  isExpansion,
}: {
  plan: PricePlan
  isExpansion?: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePay = async () => {
    if (loading) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/payment/mock-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.key }),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.error || '支付失败')
        return
      }

      // 写入 localStorage
      if (typeof window !== 'undefined') {
        try {
          if (plan.key === 'MONTHLY_69') {
            const renewDate = new Date()
            renewDate.setMonth(renewDate.getMonth() + 1)
            window.localStorage.setItem(
              'opc_active_subscription',
              JSON.stringify({
                plan: plan.key,
                renewDate: renewDate.toISOString().slice(0, 10),
              })
            )
          } else {
            const owned: PlanKey[] = JSON.parse(
              window.localStorage.getItem('opc_owned_plans') || '[]'
            )
            if (!owned.includes(plan.key)) {
              owned.push(plan.key)
              window.localStorage.setItem('opc_owned_plans', JSON.stringify(owned))
            }
          }
        } catch {
          // 静默
        }
      }

      // 跳转个人中心
      window.location.href = '/member?paid=' + plan.key
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
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
            <span>{plan.cta}</span>
            <ArrowRight size={14} />
          </>
        )}
      </button>
      {error && (
        <p className="text-[10px] text-rose-600 text-center mt-1.5">⚠️ {error}</p>
      )}
    </div>
  )
}
