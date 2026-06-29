'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Check,
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
} from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

const tiers = [
  {
    id: 'starter',
    name: '体验卡',
    badge: '🎫 0 风险体验',
    price: 99,
    cycle: '月',
    desc: '适合刚接触 AI 商业的个人，想先“听一次 + 看一眼”。',
    cta: '立即体验',
    accent: 'border-slate-200',
    bg: 'bg-white',
    headerBg: 'bg-gradient-to-r from-slate-100 to-slate-50',
    priceColor: 'text-slate-900',
    buttonBg: 'bg-slate-900 hover:bg-slate-800',
    benefits: [
      { icon: Calendar, text: '1 次线下沙龙体验' },
      { icon: Bot, text: '基础 AI 工具试用' },
      { icon: FileText, text: 'Dify 诊断报告 1 次' },
    ],
  },
  {
    id: 'basic',
    name: '基础会员',
    badge: '🔥 最受欢迎',
    price: 199,
    cycle: '年',
    desc: '适合想系统学习 AI 商业、跑通 SOP 的创业者。',
    cta: '立即开通',
    accent: 'border-blue-400',
    bg: 'bg-white',
    headerBg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    priceColor: 'text-blue-600',
    buttonBg: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600',
    recommended: true,
    benefits: [
      { icon: Shield, text: '工具库全年使用权' },
      { icon: Lightbulb, text: '项目库 SOP 阅读权限' },
      { icon: FileText, text: 'AI 商业诊断报告 无限次' },
      { icon: BarChart3, text: '智富日报 自动推送' },
    ],
  },
  {
    id: 'pro',
    name: '进阶会员',
    badge: '👑 高净值首选',
    price: 1980,
    cycle: '年',
    desc: '适合想锁定导师资源、跑通企业内训与分站看板的合伙人。',
    cta: '升级进阶',
    accent: 'border-amber-400',
    bg: 'bg-white',
    headerBg: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500',
    priceColor: 'text-amber-600',
    buttonBg: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
    benefits: [
      { icon: Star, text: '基础会员全部权益' },
      { icon: Users, text: '专属导师 1V1 问诊一次' },
      { icon: Briefcase, text: '企业 AI 内训 低价预约通道' },
      { icon: BarChart3, text: '分站经营数据看板' },
    ],
  },
]

const faqs = [
  {
    q: '付费后多久可以使用权益？',
    a: '会员权益在支付完成后立即生效；线下沙龙预约在 1 个工作日内由运营对接。',
  },
  {
    q: '会员可以退款吗？',
    a: '体验卡 7 天内未使用可全额退款；基础/进阶会员按已使用月份按比例扣除，未使用部分全额退还。',
  },
  {
    q: '进阶会员的 1V1 导师是谁？',
    a: '由良朋社总部的弓老师、卢老师、于老师、吕老师等 10 年+ 实战派导师轮值，可在会员中心自主预约。',
  },
  {
    q: '企业内训低价预约通道是怎么收费的？',
    a: '进阶会员可按市场价 5 折预约城市合伙人提供的企业 AI 内训服务。',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Hero */}
      <section className="px-5 pt-10 pb-8 bg-gradient-to-b from-slate-900 to-slate-50">
        <div className="max-w-lg md:max-w-5xl mx-auto">
          <Link
            href="/pitch"
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={14} />
            返回商业全景
          </Link>

          <motion.div {...fadeUp} className="text-center">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <Wallet size={12} />
              <span>💰 OPC 智富会员计划</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-3">
              三档会员，对应三种
              <br className="md:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400">
                AI 商业进阶路径
              </span>
              。
            </h1>
            <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto">
              从“先听一次” → “系统跑通” → “锁定导师 + 企业订单”，
              一路打通你与 AI 商业的距离。
            </p>
          </motion.div>
        </div>
      </section>

      {/* 三档会员卡片 */}
      <section className="px-5 -mt-4 relative z-10">
        <div className="max-w-lg md:max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.id}
                {...fadeUp}
                transition={{ delay: i * 0.08 }}
                className={`relative ${tier.bg} ${tier.accent} border-2 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300`}
              >
                {tier.recommended && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-500 to-indigo-500 text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl">
                    ★ 推荐
                  </div>
                )}

                {/* 头部 */}
                <div className={`${tier.headerBg} px-5 py-4`}>
                  <div className="flex items-center justify-between mb-1">
                    <h3
                      className={`font-bold text-lg ${
                        tier.recommended ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {tier.name}
                    </h3>
                    {tier.id === 'pro' && (
                      <Crown size={18} className="text-white drop-shadow" />
                    )}
                    {tier.id === 'basic' && (
                      <Sparkles size={18} className="text-white drop-shadow" />
                    )}
                  </div>
                  <div
                    className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      tier.recommended
                        ? 'bg-white/25 text-white backdrop-blur-sm'
                        : 'bg-slate-900/10 text-slate-700'
                    }`}
                  >
                    {tier.badge}
                  </div>
                </div>

                {/* 价格 */}
                <div className="px-5 py-4 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-slate-500">¥</span>
                    <span
                      className={`text-4xl font-bold leading-none ${tier.priceColor}`}
                    >
                      {tier.price}
                    </span>
                    <span className="text-sm text-slate-500">/ {tier.cycle}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {tier.id === 'starter' && '≈ 3.3 元/天 · 可随时取消'}
                    {tier.id === 'basic' && '≈ 0.5 元/天 · 超值入门'}
                    {tier.id === 'pro' && '≈ 5.4 元/天 · 锁定导师资源'}
                  </p>
                </div>

                {/* 权益列表 */}
                <div className="px-5 py-4 space-y-2.5 min-h-[180px]">
                  {tier.benefits.map((b, j) => (
                    <div key={j} className="flex items-start gap-2 text-sm">
                      <div
                        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                          tier.recommended ? 'bg-blue-100' : 'bg-amber-100'
                        }`}
                      >
                        <Check
                          size={12}
                          className={
                            tier.recommended ? 'text-blue-600' : 'text-amber-600'
                          }
                        />
                      </div>
                      <span className="text-slate-700 leading-snug">{b.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="px-5 pb-5">
                  <button
                    className={`w-full ${tier.buttonBg} text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all text-sm flex items-center justify-center gap-1`}
                  >
                    <span>{tier.cta}</span>
                    <ArrowRight size={14} />
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    支持微信 / 支付宝 · 企业支付请联系客服
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 推荐组合说明 */}
          <motion.div
            {...fadeUp}
            className="mt-8 relative bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 md:p-6 overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Award size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-bold mb-1">
                  🎁 进阶会员 + 自研工具订阅 = 黄金组合
                </h3>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  进阶会员订阅豹纹工坊 / 灵犀 AI / 先锋派数字人，享 8 折优惠，
                  一年最高省 ¥1,200。
                </p>
              </div>
              <Link
                href="/tools/subscription"
                className="flex-shrink-0 w-full md:w-auto inline-flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-4 py-2.5 rounded-full text-sm transition-colors"
              >
                <span>查看工具订阅</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 权益对比 / 选择建议 */}
      <section className="px-5 py-10">
        <div className="max-w-lg md:max-w-5xl mx-auto">
          <motion.div {...fadeUp}>
            <h2 className="text-lg md:text-2xl font-bold text-slate-900 text-center mb-6">
              🤔 我该选哪一档？
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  tag: '我是新手',
                  advice: '先买体验卡，1 次沙龙 + 1 份诊断报告，让你看清方向。',
                  color: 'from-slate-100 to-slate-50',
                  border: 'border-slate-200',
                  textColor: 'text-slate-700',
                },
                {
                  tag: '我在创业',
                  advice: '基础会员最划算，工具库 + SOP 全年可看，诊断无限次。',
                  color: 'from-blue-100 to-indigo-50',
                  border: 'border-blue-200',
                  textColor: 'text-blue-700',
                },
                {
                  tag: '我是合伙人',
                  advice: '直接进阶会员，锁定 1V1 导师和企业内训通道，长期回报高。',
                  color: 'from-amber-100 to-orange-50',
                  border: 'border-amber-200',
                  textColor: 'text-amber-700',
                },
              ].map((c, i) => (
                <div
                  key={i}
                  className={`bg-gradient-to-br ${c.color} ${c.border} border rounded-2xl p-4`}
                >
                  <div className={`text-xs font-bold mb-1.5 ${c.textColor}`}>
                    📌 {c.tag}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{c.advice}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 py-6">
        <div className="max-w-lg md:max-w-3xl mx-auto">
          <motion.div {...fadeUp}>
            <h2 className="text-lg md:text-2xl font-bold text-slate-900 text-center mb-6">
              常见问题
            </h2>
            <div className="space-y-3">
              {faqs.map((f, i) => (
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
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">
                      ▾
                    </span>
                  </summary>
                  <div className="px-4 pb-4 pt-1 text-sm text-slate-600 leading-relaxed">
                    {f.a}
                  </div>
                </details>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 底部兜底 CTA */}
      <section className="px-5 py-6">
        <div className="max-w-lg md:max-w-3xl mx-auto text-center">
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
