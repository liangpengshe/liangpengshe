'use client'

/**
 * 良朋社 OPC · 加入 199 元/年 智富会员价值说明页
 * ------------------------------------------------------------
 * 设计目标：用"全球顶流社群标准"展示 199 元/年 智富会员的 6 大核心权益
 * 设计语言：与现有 pricing / member / partner 页保持一致
 *   - 底色：bg-slate-50
 *   - 主色：text-blue-600（科技蓝）+ text-amber-500（创富金）
 *   - Hero：深蓝/紫渐变 from-slate-900 to-slate-800
 *   - 容器：max-w-lg md:max-w-6xl mx-auto（移动端 1 列，PC 撑开）
 *   - 卡片：bg-white rounded-2xl shadow-sm hover:shadow-md transition
 * ------------------------------------------------------------
 */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Shield,
  Zap,
  Bot,
  GraduationCap,
  BookOpen,
  Users,
  TrendingUp,
  Award,
  MapPin,
  MessageCircle,
  CheckCircle2,
  Star,
  Crown,
  Wallet,
  Rocket,
  Network,
  Calendar,
  HelpCircle,
  Gift,
  Heart,
  Coffee,
} from 'lucide-react'

// ════════════════════════════════════════════════════════════════
// 1. 数据看板 · Mock 数据（与系统其他页面口径一致）
// ════════════════════════════════════════════════════════════════
const DASHBOARD_STATS = [
  {
    icon: MapPin,
    emoji: '📍',
    value: '4 城',
    label: '已覆盖城市',
    desc: '深圳 · 东莞 · 柳州 · 乌海',
    tone: 'amber',
  },
  {
    icon: Users,
    emoji: '👥',
    value: '300+',
    label: '活跃创业会员',
    desc: '主理人私域 · 周更活跃',
    tone: 'blue',
  },
  {
    icon: Bot,
    emoji: '🤖',
    value: '9 个',
    label: 'AI 智能体',
    desc: '诊断 / 教练 / 日报 · 7×24 在线',
    tone: 'purple',
  },
]

// ════════════════════════════════════════════════════════════════
// 2. 6 大核心权益 · Bento 网格
// ════════════════════════════════════════════════════════════════
const CORE_BENEFITS = [
  {
    icon: BookOpen,
    emoji: '🧠',
    title: 'AI 智富日报',
    subtitle: '每天早晨 8 点 · 你的专属商业晨刊',
    desc: '每天早晨 8 点，AI 为你生成一份专属的《OPC 行业风向标》与《城市本地化商业周报》，洞察先机，不再闭门造车。',
    bullets: ['行业风向标', '城市本地化周报', 'AI 推送至微信 / App'],
    color: 'blue',
    cta: '查看示例日报',
  },
  {
    icon: GraduationCap,
    emoji: '🎓',
    title: 'AI 智富教练',
    subtitle: '99% 的问题 · 不再等主理人回复',
    desc: '99% 的问题不需要等社群主理人回复。点击右下角的 AI 教练，直接获取针对你 OPC 类型的实战操作指引。',
    bullets: ['7×24 即时响应', '按 OPC 阶段个性化', '上下文感知·懂你的城市和赛道'],
    color: 'purple',
    cta: '体验 AI 教练',
  },
  {
    icon: BookOpen,
    emoji: '📚',
    title: 'OPC 智富四库',
    subtitle: '工具 · 项目 · 服务 · 资源 全开放',
    desc: '开放"工具库、项目库、服务库、资源库"的基础核心内容。你将获得严选的 AI 工具包与全套的标准作业 SOP。',
    bullets: ['工具库 5+ 严选 AI', '项目库 SOP 全套', '服务库 / 资源库 基础权限'],
    color: 'emerald',
    cta: '查看四库',
  },
  {
    icon: MapPin,
    emoji: '🤝',
    title: '全国城市分站活动',
    subtitle: '4 城线下沙龙 · 优先报名权',
    desc: '会员享受全国 4 座城市（深圳、东莞、柳州、乌海）的线下沙龙优先报名权，你不再是孤军奋战，有真实的本地伙伴。',
    bullets: ['深圳/东莞/柳州/乌海', '每月 1-2 场线下', '主理人面对面交流'],
    color: 'rose',
    cta: '查看近期沙龙',
  },
  {
    icon: TrendingUp,
    emoji: '📈',
    title: '资源对接与供需撮合',
    subtitle: '内部供需广场 · AI 智能匹配',
    desc: '加入 OPC 内部供需广场，发布你的"找货源、找渠道、找合作"需求，由 AI 和社群为你匹配同频资源。',
    bullets: ['找货源 / 渠道 / 合作', 'AI + 人工双向匹配', '每周供需速递'],
    color: 'indigo',
    cta: '进入供需广场',
  },
  {
    icon: Award,
    emoji: '🏅',
    title: '会员专属身份与分润',
    subtitle: 'OPC 徽章 + 智富积分 · 可抵现金',
    desc: '获得"OPC 智富会员"徽章及专属积分系统，积分可直接抵扣后续 1980 / 5980 高阶服务的现金。',
    bullets: ['OPC 智富会员徽章', '智富积分体系（50+ / 任务）', '积分抵扣 1980/5980 现金'],
    color: 'amber',
    cta: '了解积分规则',
  },
]

// ════════════════════════════════════════════════════════════════
// 3. FAQ 数据
// ════════════════════════════════════════════════════════════════
const FAQS = [
  {
    q: '199 元/年 与 69 元/月 有什么区别？',
    a: '199 元/年是"智富社群"档（年度社群会员），侧重"圈子连接 + 资源对接 + 基础四库 + AI 教练"。69 元/月是"单店实操月卡"（月度订阅），侧重"单店/单号 SOP + 工具库无限访问 + 智富日报 + 工作台"。前者适合"想进入圈子、与同行连接的创业者"；后者适合"想跑通单店 SOP、边学边干"的主理人。两者可叠加：先 199 入社群，再 69 跑 SOP。',
  },
  {
    q: '我加了社群，如果不做生意了可以退款吗？',
    a: '完全可以。加入后 7 天内觉得不适合（即使你已经听了 10 场闭门会、用了 AI 教练），直接找小助手，100% 全额退款，绝不扯皮。7 天后如果你仍想退出，可按"剩余天数 × 平均日成本"折算退款。我们的原则是：你没有任何试错成本，但可能会错过一个踩准 AI 时代的红利。',
  },
  {
    q: '199 元包含线下沙龙报名费吗？',
    a: '包含 1 次主城分站沙龙的免费入场名额（价值 ¥199 起）。深圳 / 东莞 / 柳州 / 乌海 主理人沙龙均适用。如需参加其他城市或专项闭门会，可使用智富积分抵扣或享会员专属折扣价。',
  },
  {
    q: '我不在 4 个城市，能加入吗？',
    a: '完全可以。社群价值 80% 在线上（AI 教练 / 智富日报 / 四库 / 供需广场），20% 在线下沙龙。异地会员可参加每月 1 场线上闭门会 + 1 次到任意城市的差旅沙龙（差旅费自担，本地沙龙免门票）。同时，199 会员可申请成为"你的城市"的发起人，运营满 3 个月后免费升级为月度会员。',
  },
  {
    q: '199 会员可以升级到 69 月卡或 1980 陪跑吗？',
    a: '可以。199 → 69：剩余社群天数可按比例抵扣月卡首月价格（首月 9.9 元起）。199 → 1980：智富积分可抵扣 1980 陪跑 30% 现金（最高 ¥594）。所有升级动作在 /pricing 页面一键完成。',
  },
]

// ════════════════════════════════════════════════════════════════
// 4. 颜色 token 工具（按 color 字段返回 Tailwind class）
// ════════════════════════════════════════════════════════════════
const TONE_MAP: Record<
  string,
  { iconBg: string; iconColor: string; ringColor: string; tagBg: string; tagText: string; ctaColor: string; glow: string }
> = {
  blue: {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    ringColor: 'ring-blue-100',
    tagBg: 'bg-blue-50',
    tagText: 'text-blue-700',
    ctaColor: 'text-blue-600 hover:text-blue-700',
    glow: 'from-blue-400/20 to-indigo-500/20',
  },
  purple: {
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    ringColor: 'ring-purple-100',
    tagBg: 'bg-purple-50',
    tagText: 'text-purple-700',
    ctaColor: 'text-purple-600 hover:text-purple-700',
    glow: 'from-purple-400/20 to-fuchsia-500/20',
  },
  emerald: {
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    ringColor: 'ring-emerald-100',
    tagBg: 'bg-emerald-50',
    tagText: 'text-emerald-700',
    ctaColor: 'text-emerald-600 hover:text-emerald-700',
    glow: 'from-emerald-400/20 to-teal-500/20',
  },
  rose: {
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    ringColor: 'ring-rose-100',
    tagBg: 'bg-rose-50',
    tagText: 'text-rose-700',
    ctaColor: 'text-rose-600 hover:text-rose-700',
    glow: 'from-rose-400/20 to-pink-500/20',
  },
  indigo: {
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    ringColor: 'ring-indigo-100',
    tagBg: 'bg-indigo-50',
    tagText: 'text-indigo-700',
    ctaColor: 'text-indigo-600 hover:text-indigo-700',
    glow: 'from-indigo-400/20 to-violet-500/20',
  },
  amber: {
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    ringColor: 'ring-amber-100',
    tagBg: 'bg-amber-50',
    tagText: 'text-amber-700',
    ctaColor: 'text-amber-600 hover:text-amber-700',
    glow: 'from-amber-400/20 to-orange-500/20',
  },
}

// ════════════════════════════════════════════════════════════════
// 5. 主组件
// ════════════════════════════════════════════════════════════════
export default function JoinPage() {
  const router = useRouter()
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0)

  const handleJoin = () => {
    // 跳转定价页并定位到 199 元/年的卡片（区块一·破冰与连接）
    router.push('/pricing#section-ice')
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      {/* ═══════ Hero ═══════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white">
        {/* 装饰光晕 */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative px-4 pt-6 pb-10 md:pt-10 md:pb-16">
          <div className="max-w-lg md:max-w-6xl mx-auto">
            {/* 返回链接 */}
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft size={14} />
              返回首页
            </Link>

            <div className="text-center">
              {/* 顶部徽标 */}
              <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full mb-5">
                <Crown size={12} />
                <span>👑 全球顶流社群标准 · 199 元/年</span>
              </div>

              {/* 主标题 */}
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
                加入{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300">
                  良朋社 OPC
                </span>
                <br className="md:hidden" />
                <span className="md:ml-2">智富会员</span>
              </h1>

              {/* 副标题 */}
              <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-2">
                不只是社群，是一套让 AI 为你打工、帮你搞钱的
                <span className="text-amber-300 font-bold mx-1">智能商业操作系统</span>。
              </p>
              <p className="text-xs md:text-sm text-slate-400 max-w-2xl mx-auto">
                一天不到 0.6 元 · 一年 365 天 · 让你踩准 AI 时代的红利
              </p>

              {/* 价格锚点 */}
              <div className="mt-6 inline-flex items-center gap-2 bg-white/5 backdrop-blur border border-white/10 rounded-2xl px-5 py-3">
                <div className="text-3xl md:text-4xl font-extrabold text-amber-300">
                  ¥199
                  <span className="text-sm text-slate-400 font-normal ml-1">/ 年</span>
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 line-through">原价 ¥599</div>
                  <div className="text-[10px] text-amber-300 font-bold">新人首年 · 限时</div>
                </div>
              </div>
            </div>

            {/* 数据看板 Bento 3 列 */}
            <div className="mt-8 md:mt-10 grid grid-cols-3 gap-2 md:gap-4">
              {DASHBOARD_STATS.map((stat, i) => {
                const tone = TONE_MAP[stat.tone]
                return (
                  <div
                    key={i}
                    className="relative overflow-hidden rounded-xl md:rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-3 md:p-4 text-center hover:bg-white/10 transition-colors"
                  >
                    <div className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${tone.glow} rounded-full blur-2xl`} />
                    <div className="relative">
                      <div className="text-2xl md:text-3xl mb-1">{stat.emoji}</div>
                      <div className="text-xl md:text-2xl font-extrabold text-white mb-0.5">
                        {stat.value}
                      </div>
                      <div className="text-[10px] md:text-xs text-slate-400 font-medium">
                        {stat.label}
                      </div>
                      <div className="text-[9px] md:text-[10px] text-slate-500 mt-0.5 leading-tight hidden md:block">
                        {stat.desc}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ 区块 2：Bento 6 大核心权益 ═══════ */}
      <section className="px-4 py-10 md:py-14">
        <div className="max-w-lg md:max-w-6xl mx-auto">
          {/* 区块标题 */}
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
              <Sparkles size={12} />
              6 大核心权益 · 一年只需 199
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
              为什么 199 元能撬动一套商业系统？
            </h2>
            <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto">
              我们把 5 年沉淀的 AI 工具、SOP、圈子、教练，浓缩到 6 张卡片。
              每一张都是「真金白银」的价值。
            </p>
          </div>

          {/* Bento 网格：移动端 1 列，PC 2-3 列 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CORE_BENEFITS.map((b, i) => (
              <BenefitCard key={i} benefit={b} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 区块 3：信任锚点 + 风险逆转 ═══════ */}
      <section className="px-4 py-6 md:py-10">
        <div className="max-w-lg md:max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 p-6 md:p-8">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-100/40 rounded-full blur-3xl" />
            <div className="relative flex flex-col md:flex-row items-start gap-4 md:gap-6">
              {/* 左侧图标 */}
              <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Shield size={28} className="text-white" />
              </div>

              {/* 右侧文案 */}
              <div className="flex-1">
                <div className="text-[10px] md:text-xs font-extrabold text-amber-700 tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Sparkles size={12} />
                  TRUST ANCHOR · 信任锚点
                </div>
                <h3 className="text-lg md:text-xl font-extrabold text-slate-900 mb-2 leading-snug">
                  7 天无理由全额退款 · 你没有任何试错成本
                </h3>
                <p className="text-sm md:text-base text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">无需任何借口</strong>。
                  加入后 7 天内觉得不适合，我们
                  <strong className="text-rose-600 mx-1">无条件退款</strong>
                  （直接找小助手，绝不会跟你扯皮）。
                </p>
                <p className="text-sm md:text-base text-slate-600 leading-relaxed mt-2">
                  你没有任何试错成本，
                  <span className="text-slate-900 font-semibold">
                    但可能会错过一个踩准 AI 时代的红利
                  </span>
                  。
                </p>

                {/* 信任徽章 3 联 */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                    <CheckCircle2 size={12} />
                    7 天无理由
                  </span>
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                    <Zap size={12} />
                    1 分钟到账
                  </span>
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                    <Heart size={12} />
                    不收任何手续费
                  </span>
                  <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                    <MessageCircle size={12} />
                    小助手 1V1 处理
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ 区块 4：底部 CTA ═══════ */}
      <section className="px-4 py-10 md:py-14">
        <div className="max-w-lg md:max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white p-6 md:p-10 text-center">
            {/* 装饰 */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

            <div className="relative">
              <div className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold px-3 py-1 rounded-full mb-4">
                <Crown size={12} />
                199 元 / 年 · 限时新人价
              </div>

              <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3">
                现在加入，<br className="md:hidden" />
                一年后你会感谢今天的自己
              </h2>
              <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto mb-6 leading-relaxed">
                300+ 创业主理人已用 199 元撬动了一套 AI 商业系统。
                下一个，是你吗？
              </p>

              {/* 超大 CTA 按钮 */}
              <button
                onClick={handleJoin}
                className="group relative inline-flex items-center justify-center gap-2 w-full md:w-auto md:min-w-[320px] h-14 px-8 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 hover:from-amber-500 hover:via-orange-500 hover:to-rose-500 text-slate-900 font-extrabold text-base md:text-lg rounded-2xl shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 active:scale-[0.98] transition-all"
              >
                <Sparkles size={18} className="text-slate-900" />
                <span>🎯 立即加入 199 元/年 智富会员</span>
                <ArrowRight
                  size={18}
                  className="text-slate-900 group-hover:translate-x-1 transition-transform"
                />
              </button>

              {/* 悬停承诺 */}
              <div className="mt-4 flex items-center justify-center gap-3 md:gap-4 text-[11px] md:text-xs text-slate-300 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Shield size={12} className="text-emerald-300" />
                  无需合约
                </span>
                <span className="text-slate-500">·</span>
                <span className="inline-flex items-center gap-1">
                  <Zap size={12} className="text-amber-300" />
                  随退随停
                </span>
                <span className="text-slate-500">·</span>
                <span className="inline-flex items-center gap-1">
                  <Coffee size={12} className="text-orange-300" />
                  仅一杯咖啡的周成本
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ 区块 5：FAQ ═══════ */}
      <section className="px-4 py-6 md:py-10">
        <div className="max-w-lg md:max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
              <HelpCircle size={12} />
              你可能还关心
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-1.5">
              常见问题 · FAQ
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              99% 的问题，都能在 1 分钟内找到答案
            </p>
          </div>

          <div className="space-y-2.5">
            {FAQS.map((faq, i) => {
              const open = openFaqIdx === i
              return (
                <div
                  key={i}
                  className={`bg-white rounded-xl border ${
                    open ? 'border-blue-200 shadow-md' : 'border-slate-200'
                  } overflow-hidden transition-all`}
                >
                  <button
                    onClick={() => setOpenFaqIdx(open ? null : i)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50/50 transition-colors"
                  >
                    <div
                      className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        open
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      Q
                    </div>
                    <div className="flex-1 text-sm md:text-base font-bold text-slate-900 leading-snug">
                      {faq.q}
                    </div>
                    <ChevronDown
                      size={16}
                      className={`flex-shrink-0 text-slate-400 transition-transform ${
                        open ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>
                  {open && (
                    <div className="px-4 pb-4 pl-14">
                      <div className="text-[13px] md:text-sm text-slate-700 leading-relaxed">
                        {faq.a}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════ 区块 6：底部辅助行动（咨询 + 比较） ═══════ */}
      <section className="px-4 py-6">
        <div className="max-w-lg md:max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link
              href="/pricing"
              className="group flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Wallet size={18} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900">查看完整定价方案</div>
                <div className="text-[11px] text-slate-500 mt-0.5">6 档权益对比 · 找到最适合你的</div>
              </div>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              href="/contact"
              className="group flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4 hover:border-amber-300 hover:shadow-md transition-all"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <MessageCircle size={18} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900">还有疑问？找小助手</div>
                <div className="text-[11px] text-slate-500 mt-0.5">1V1 咨询 · 5 分钟内回复</div>
              </div>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ 底部水印 ═══════ */}
      <footer className="px-4 py-6 text-center">
        <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
          <Star size={10} className="text-amber-400" />
          良朋社 OPC · 让 AI 时代的创业者，赢在协同
          <Star size={10} className="text-amber-400" />
        </div>
      </footer>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// 6. 权益卡片组件
// ════════════════════════════════════════════════════════════════
function BenefitCard({
  benefit,
  index,
}: {
  benefit: (typeof CORE_BENEFITS)[number]
  index: number
}) {
  const tone = TONE_MAP[benefit.color]
  const Icon = benefit.icon
  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 p-5 md:p-6 transition-all hover:-translate-y-0.5 overflow-hidden">
      {/* 角标 */}
      <div className="absolute top-3 right-3 text-[10px] font-extrabold text-slate-300">
        0{index + 1}
      </div>

      {/* 顶部：图标 + 标题 */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl ${tone.iconBg} ring-4 ${tone.ringColor} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}
        >
          <Icon size={24} className={tone.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-extrabold tracking-widest text-slate-400 mb-0.5">
            BENEFIT 0{index + 1}
          </div>
          <h3 className="text-base md:text-lg font-extrabold text-slate-900 leading-tight">
            <span className="mr-1.5">{benefit.emoji}</span>
            {benefit.title}
          </h3>
        </div>
      </div>

      {/* 副标题 */}
      <div className={`text-[11px] md:text-xs font-bold ${tone.ctaColor} mb-2`}>
        {benefit.subtitle}
      </div>

      {/* 主描述 */}
      <p className="text-[12.5px] md:text-sm text-slate-600 leading-relaxed mb-3">
        {benefit.desc}
      </p>

      {/* 子要点 */}
      <ul className="space-y-1.5 mb-3">
        {benefit.bullets.map((b, j) => (
          <li key={j} className="flex items-start gap-1.5 text-[11.5px] md:text-xs text-slate-700">
            <CheckCircle2
              size={12}
              className={`flex-shrink-0 mt-0.5 ${tone.iconColor}`}
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {/* 底部 CTA 文字 */}
      <div className={`pt-3 border-t border-slate-100 flex items-center justify-between`}>
        <span className={`text-[11px] font-bold ${tone.ctaColor} inline-flex items-center gap-1`}>
          {benefit.cta}
          <ArrowRight size={12} />
        </span>
        <div
          className={`inline-flex items-center gap-1 ${tone.tagBg} ${tone.tagText} text-[10px] font-bold px-1.5 py-0.5 rounded-full`}
        >
          <Sparkles size={9} />
          包含
        </div>
      </div>
    </div>
  )
}
