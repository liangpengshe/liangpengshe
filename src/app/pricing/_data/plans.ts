/**
 * 定价页 · 6 档价格档配置（含 4 维权益矩阵 + 锚点横幅 + 主题色）
 *
 * 数据驱动整个 pricing/page.tsx。
 * 渲染时只需：<PlanCard plan={PLANS[0]} ... />
 *
 * 区块分布：
 *   区块一·破冰与连接：
 *     TIER 1 · 19.9 元   智富先锋卡（一次性）
 *     TIER 2 · 199 元/年 智富社群（年度社群）
 *   区块二·实战与陪跑：
 *     TIER 3 · 69 元/月  单店月卡（订阅）
 *     TIER 4 · 599 元/年 3个月轻陪跑
 *     TIER 5 · 1980 元   深度矩阵陪跑
 *   区块三·扩张与授权（深色背景）：
 *     TIER 6 · 5980 元   城市主理人/项目授权
 */

import {
  Bot,
  FileText,
  Calendar,
  Gift,
  Users,
  Lightbulb,
  BarChart3,
  GraduationCap,
  X as XIcon,
  Shield,
  TrendingUp,
  Network,
  Award,
  Crown,
  Briefcase,
  Building2,
} from 'lucide-react'

import type { PricePlan } from './plan-types'

export const PLANS: PricePlan[] = [
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
    key: 'BASIC_199',
    tier: 2,
    name: '圈层与基础工具',
    tagline: '199 元/年 · 入门档权益升级 + 主理人私域',
    price: 199,
    cycle: '/ 年',
    originalPrice: 599,
    tierFlow: 'ladder',
    ladderStep: 1,
    anchor: {
      emoji: '🤝',
      text: '1 年基础会员 · 含入门档全部权益 + 主理人私域通道',
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
    target: '适合：想系统升级、与同行连接的进阶创业者',
    badges: ['🤝 进阶', '💬 周会'],
    section: 'battle',
    matrix: {
      singleStore: true,
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
    cta: '🤝 加入圈层 199',
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
    headlinePromo: '首月仅需 9.9 元，次月恢复 69 元/月',
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
    target: '适合：想跑通单店/单号 SOP、边学边干的实践者',
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
    compareNote: '9.9 元买的是动手的机会 · 19.9 元买的是方向的选择。先花 19.9 元找方向，再花 9.9 元动手试试。',
    benefits: [
      { icon: Shield, text: '工具库 + 项目库 + 服务库 + 资源库 · 全年无限访问' },
      { icon: Lightbulb, text: 'AI 商业诊断报告 无限次', highlight: true },
      { icon: BarChart3, text: '每日智富日报 自动推送' },
      { icon: GraduationCap, text: '学习中心 · 80 分自动解锁工作台' },
      { icon: XIcon, text: '随时取消 · 不收任何手续费' },
    ],
    cta: '🎁 立即体验 9.9 元首月',
  },
  {
    key: 'PRO_598',
    tier: 4,
    name: '轻陪跑会员',
    tagline: '598 元/年 · 3 个月陪跑与 SOP 实战',
    price: 598,
    cycle: '/ 年',
    originalPrice: 1280,
    tierFlow: 'ladder',
    ladderStep: 2,
    upgradeNote: '已购 199 元用户升级仅需补差价。',
    anchor: {
      emoji: '🎯',
      text: '3 个月 1v1 陪跑 + 1 年会员权益 · 7 天无理由退款',
      tone: 'blue',
    },
    theme: {
      accent: 'border-blue-300',
      bg: 'bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/40',
      headerBg: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500',
      priceColor: 'text-blue-600',
      buttonBg: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600',
      iconBg: 'bg-blue-100',
      badgeBg: 'bg-blue-100 text-blue-700',
    },
    target: '适合：想系统升级、需要 1v1 陪跑 + SOP 实战的主理人',
    coreValue: '轻陪跑 · 解决"怎么干才能成"',
    badges: ['🎯 陪跑', '📈 1V1'],
    section: 'battle',
    matrix: {
      singleStore: true,
      matrix: true,
      coach: true,
      cityAgent: false,
    },
    benefits: [
      { icon: GraduationCap, text: '90 天导师 1V1 陪跑' },
      { icon: Lightbulb, text: '基础档 + 进阶档 全部权益', highlight: true },
      { icon: BarChart3, text: '定制化 SOP 拆解' },
      { icon: Shield, text: '资源对接 + 工具模板' },
    ],
    cta: '🚀 开启陪跑 598',
  },
  {
    key: 'DEEP_1980',
    tier: 5,
    name: '深度陪跑',
    tagline: '1980 元/年 · 深度陪跑与矩阵放大',
    price: 1980,
    cycle: '一次性',
    originalPrice: 5980,
    tierFlow: 'ladder',
    ladderStep: 3,
    upgradeNote: '已购 199 元用户升级仅需补差价。',
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
    coreValue: '深度陪跑 · 解决"怎么从 1 做到 10"',
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
    cta: '🚀 解锁矩阵 1980',
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
    coreValue: '怎么把生意做成资产 · 城市主理人 / 项目授权',
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
    cta: '👑 了解主理人权益',
    ctaAction: 'goto_partner',
  },
]
