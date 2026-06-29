'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight,
  TrendingUp,
  MapPin,
  Users,
  Building2,
  Handshake,
  Award,
  Coins,
  Banknote,
  Wallet,
  Sparkles,
  Link2,
  Briefcase,
  Wrench,
  Target,
  CheckCircle2,
} from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

// ─── 模块一：核心数据（Mock）───
const heroStats = [
  { icon: Coins, value: '¥2,100,000+', label: '平台累计撮合额', gold: true },
  { icon: MapPin, value: '5 城', label: '全国签约城市' },
  { icon: Users, value: '12+ 位', label: '活跃主理人' },
]

// ─── 模块二：三方分润 ───
const roles = [
  {
    icon: Briefcase,
    emoji: '🏢',
    role: '资源方',
    roleSubtitle: '工具商 · 项目方 · 服务商',
    path: '通过 OPC 平台卖出工具/服务',
    income: '拿 85%',
    incomeNote: '平台抽成 15%',
    cardBg: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50',
    cardBorder: 'border-amber-200',
    incomeBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
    textAccent: 'text-amber-700',
  },
  {
    icon: Handshake,
    emoji: '🤝',
    role: '城市主理人',
    roleSubtitle: '落地运营商',
    path: '向本地企业推荐 OPC 工具与陪跑服务',
    income: '10% - 20%',
    incomeNote: '推荐成交佣金',
    cardBg: 'bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50',
    cardBorder: 'border-violet-200',
    incomeBg: 'bg-gradient-to-r from-violet-500 to-purple-500',
    textAccent: 'text-violet-700',
  },
  {
    icon: Award,
    emoji: '🏛️',
    role: '良朋社总部',
    roleSubtitle: '平台方',
    path: '提供 SaaS 系统、AI 诊断工具、全国客户池',
    income: '5% - 15%',
    incomeNote: '平台服务费',
    cardBg: 'bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900',
    cardBorder: 'border-slate-700',
    incomeBg: 'bg-gradient-to-r from-amber-400 to-yellow-500',
    textAccent: 'text-amber-300',
    dark: true,
  },
]

// ─── 模块三：四个钱袋子 ───
const revenues = [
  {
    icon: Wallet,
    emoji: '💰',
    title: 'C 端会员订阅',
    desc: '99 元 / 199 元 / 1980 元三级会员体系，锁定高净值用户长期复购。',
    color: 'from-amber-400 to-orange-500',
    href: '/pricing',
  },
  {
    icon: Link2,
    emoji: '🔗',
    title: 'B 端交易撮合',
    desc: '项目库、服务库成交订单，平台按比例分润，规模化复制。',
    color: 'from-blue-400 to-indigo-500',
    href: '/services',
  },
  {
    icon: MapPin,
    emoji: '🏙️',
    title: '分站加盟年费',
    desc: '城市主理人缴纳年度系统与品牌授权费，构建本地化护城河。',
    color: 'from-emerald-400 to-teal-500',
    href: '/partner',
  },
  {
    icon: Wrench,
    emoji: '🛠️',
    title: '自研工具 SaaS',
    desc: '豹纹工坊、灵犀 AI 等工具提供月度/年度订阅收入，毛利极高。',
    color: 'from-violet-400 to-fuchsia-500',
    href: '/tools/subscription',
  },
]

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* ═══ 模块一：一句话价值主张 ═══ */}
      <section className="px-5 pt-10 pb-8">
        <div className="max-w-lg md:max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full mb-5">
              <Sparkles size={12} />
              <span>🔶 良朋社OPC 智富生态</span>
            </div>

            <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900">
                我们不做培训和卖课，
              </span>
              <br className="md:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500">
                我们做 AI 商业的撮合与分润。
              </span>
            </h1>

            <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              为「资源方」「城市主理人」「实体企业」提供工具、项目、渠道与资金撮合，
              从中获取平台服务费 —— 一座云端的 AI 商业商场。
            </p>
          </motion.div>

          {/* 核心数据卡片 */}
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.1 }}
            className="mt-8 grid grid-cols-3 gap-2 md:gap-4"
          >
            {heroStats.map((s, i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-3 md:p-5 shadow-sm text-center"
              >
                <s.icon
                  size={20}
                  className={`mx-auto mb-1.5 ${s.gold ? 'text-amber-500' : 'text-slate-500'}`}
                />
                <div
                  className={`text-base md:text-2xl font-bold leading-tight ${
                    s.gold
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500'
                      : 'text-slate-900'
                  }`}
                >
                  {s.value}
                </div>
                <div className="text-[11px] md:text-xs text-slate-500 mt-1 leading-tight">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ 模块二：钱，怎么分？（最核心）═══ */}
      <section className="px-5 py-8">
        <div className="max-w-lg md:max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="mb-6 text-center md:text-left">
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 mb-2">
              <Target size={12} />
              <span>· 商业模式 ·</span>
            </div>
            <h2 className="text-xl md:text-3xl font-bold text-slate-900 leading-tight">
              一座云端的 AI 商业商场，
              <br className="md:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                三方共赢
              </span>
              的收益模型。
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {roles.map((r, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ delay: i * 0.08 }}
                className={`group relative overflow-hidden rounded-2xl p-5 border-2 ${r.cardBg} ${r.cardBorder} shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
              >
                {/* 装饰光晕（仅亮卡）*/}
                {!r.dark && (
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/40 rounded-full blur-3xl" />
                )}
                {r.dark && (
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl" />
                )}

                <div className="relative">
                  {/* 头部 */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <div
                      className={`w-11 h-11 rounded-xl ${
                        r.dark
                          ? 'bg-gradient-to-br from-amber-400 to-yellow-500'
                          : 'bg-white/70 backdrop-blur-sm'
                      } flex items-center justify-center text-2xl shadow-sm`}
                    >
                      <span>{r.emoji}</span>
                    </div>
                    <div>
                      <div
                        className={`font-bold text-base md:text-lg leading-tight ${
                          r.dark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {r.role}
                      </div>
                      <div
                        className={`text-[11px] leading-tight ${
                          r.dark ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {r.roleSubtitle}
                      </div>
                    </div>
                  </div>

                  {/* 路径 */}
                  <div
                    className={`text-xs leading-relaxed mb-3 ${
                      r.dark ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    <span className={`font-semibold ${r.dark ? 'text-amber-300' : 'text-slate-500'}`}>
                      路径：
                    </span>
                    {r.path}
                  </div>

                  {/* 收益 */}
                  <div
                    className={`${r.incomeBg} rounded-xl px-3 py-2.5 mt-2 flex items-center justify-between shadow-md`}
                  >
                    <div>
                      <div
                        className={`text-[10px] font-medium ${
                          r.dark ? 'text-slate-900/70' : 'text-white/80'
                        }`}
                      >
                        收益
                      </div>
                      <div
                        className={`text-lg md:text-xl font-bold leading-tight ${
                          r.dark ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {r.income}
                      </div>
                    </div>
                    <div
                      className={`text-[10px] leading-tight text-right max-w-[60%] ${
                        r.dark ? 'text-slate-900/70' : 'text-white/85'
                      }`}
                    >
                      {r.incomeNote}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 一句话解释 */}
          <motion.p
            {...fadeUp}
            className="text-center text-xs md:text-sm text-slate-500 mt-5"
          >
            💡 每一笔成交，三方按约定自动分润，全部留痕可查。
          </motion.p>
        </div>
      </section>

      {/* ═══ 模块三：四个稳定的"钱袋子" ═══ */}
      <section className="px-5 py-8">
        <div className="max-w-lg md:max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="mb-6 text-center md:text-left">
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 mb-2">
              <Banknote size={12} />
              <span>· 收入结构 ·</span>
            </div>
            <h2 className="text-xl md:text-3xl font-bold text-slate-900 leading-tight">
              四根支柱，构成健康的现金流。
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {revenues.map((r, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ delay: i * 0.06 }}
                className="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center text-xl shadow-md`}
                  >
                    <span>{r.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {r.href ? (
                      <Link
                        href={r.href}
                        className="group inline-flex items-center gap-1 font-bold text-slate-900 text-base md:text-lg leading-tight mb-1 hover:text-amber-600 transition-colors"
                      >
                        <span className="border-b border-transparent group-hover:border-amber-600">
                          {r.title}
                        </span>
                        <ArrowRight
                          size={14}
                          className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-amber-600"
                        />
                      </Link>
                    ) : (
                      <h3 className="font-bold text-slate-900 text-base md:text-lg leading-tight mb-1">
                        {r.title}
                      </h3>
                    )}
                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                      {r.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 模块四：深圳总部样板间数据 ═══ */}
      <section className="px-5 py-8">
        <div className="max-w-lg md:max-w-5xl mx-auto">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white rounded-3xl p-6 md:p-8 shadow-2xl"
          >
            {/* 装饰光晕 */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-500/30 rounded-full blur-3xl" />
            <div className="absolute top-4 right-4 text-xs text-amber-300/80 font-medium tracking-widest">
              SHENZHEN
            </div>

            <div className="relative">
              <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                <span>📍 深圳总部</span>
              </div>

              <h2 className="text-xl md:text-3xl font-bold leading-tight mb-2">
                深圳总部已跑通，
                <br className="md:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                  不只是构想。
                </span>
              </h2>

              <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-6">
                这套模式不是在 PPT 上，而是在深圳的讯美广场真实运转着。
              </p>

              {/* 关键数据 */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 mb-1.5">
                    <CheckCircle2 size={12} />
                    <span>线下沙龙</span>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white leading-tight">
                    5
                    <span className="text-base text-amber-300 ml-1">场</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">已成功举办</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 mb-1.5">
                    <Building2 size={12} />
                    <span>赋能企业</span>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white leading-tight">
                    70+
                    <span className="text-base text-amber-300 ml-1">家</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">深圳本地企业</div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>数据已接入 · 实时更新</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ 模块五：底部行动呼吁 ═══ */}
      <section className="px-5 py-10">
        <div className="max-w-lg md:max-w-5xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-xl md:text-3xl font-bold text-slate-900 leading-tight mb-5">
              看懂模式，加入我们，
              <br className="md:hidden" />
              成为你所在城市的
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
                OPC 主理人。
              </span>
            </h2>

            <Link
              href="/partner"
              className="group inline-flex w-full md:w-auto items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-bold px-6 py-4 rounded-full text-base shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Target size={18} />
              <span>🎯 了解城市合伙人权益</span>
              <ArrowRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>

            <div className="mt-4 text-xs text-slate-400">
              已有 <span className="font-bold text-amber-600">12+</span> 位主理人
              在 5 座城市运营中
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
