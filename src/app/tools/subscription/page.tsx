'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  Video,
  Check,
  Crown,
  ArrowRight,
  Star,
  Zap,
  Bot,
  TrendingUp,
  Shield,
} from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

const tools = [
  {
    id: 'leopard',
    name: '豹纹工坊（豹纹+）',
    icon: ShoppingBag,
    emoji: '🐆',
    desc: '一键生成爆款商品素材，提升电商转化率。',
    features: [
      '商品图 AI 重绘与拓款',
      '小红书/抖音/淘宝多平台尺寸',
      '爆款标题文案批量生成',
    ],
    monthly: 99,
    yearly: 988,
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    lightBg: 'from-amber-50 via-orange-50 to-rose-50',
    border: 'border-amber-200',
  },
  {
    id: 'lingxi',
    name: '灵犀 AI',
    icon: Bot,
    emoji: '🧠',
    desc: '智能内容创作助手，7×24 不间断产出。',
    features: [
      '小红书爆文 / 公众号长文 / 视频脚本',
      '行业语料库持续更新',
      '一键多平台分发',
    ],
    monthly: 79,
    yearly: 788,
    gradient: 'from-violet-500 via-purple-500 to-indigo-600',
    lightBg: 'from-violet-50 via-purple-50 to-indigo-50',
    border: 'border-violet-200',
  },
  {
    id: 'pioneer',
    name: '先锋派数字人',
    icon: Video,
    emoji: '🎙️',
    desc: 'AI 数字人视频生成，打造个人 IP 矩阵。',
    features: [
      '50+ 真人克隆数字人形象',
      'TTS 多音色 / 多语种',
      '一键成片 + 矩阵号分发',
    ],
    monthly: 199,
    yearly: 1988,
    gradient: 'from-cyan-500 via-sky-500 to-blue-600',
    lightBg: 'from-cyan-50 via-sky-50 to-blue-50',
    border: 'border-cyan-200',
  },
]

export default function ToolSubscriptionPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Hero */}
      <section className="px-5 pt-10 pb-8 bg-gradient-to-b from-slate-900 to-slate-50">
        <div className="max-w-lg md:max-w-5xl mx-auto">
          <Link
            href="/tools"
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={14} />
            返回工具库
          </Link>

          <motion.div {...fadeUp} className="text-center">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <Sparkles size={12} />
              <span>🛠️ OPC 独家自研工具订阅</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-3">
              一套 OPC 自研 AI 工具，
              <br className="md:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400">
                把你的变现路径跑通。
              </span>
            </h1>
            <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto">
              豹纹工坊（豹纹+） · 灵犀 AI · 先锋派数字人 —— 三款核心 SaaS，
              独立订阅或组合包年灵活选择。
            </p>
          </motion.div>
        </div>
      </section>

      {/* 💎 199 会员折扣横幅 */}
      <section className="px-5 -mt-2 relative z-10">
        <div className="max-w-lg md:max-w-5xl mx-auto">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-2xl p-5 md:p-6 shadow-xl"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/15 rounded-full blur-3xl" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                <Crown size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-1 bg-white/25 backdrop-blur text-white text-[11px] font-bold px-2 py-0.5 rounded-full mb-1.5">
                  <Zap size={11} />
                  <span>会员专享</span>
                </div>
                <h3 className="text-base md:text-lg font-bold leading-tight">
                  🎁 加入 199 元基础会员，工具订阅直接 8 折
                </h3>
                <p className="text-xs md:text-sm text-white/90 mt-1">
                  豹纹工坊（豹纹+）年费 ¥988 → ¥790；灵犀 AI 年费 ¥788 → ¥630；先锋派年费 ¥1,988 → ¥1,590
                </p>
              </div>
              <Link
                href="/pricing"
                className="flex-shrink-0 w-full md:w-auto inline-flex items-center justify-center gap-1 bg-white text-orange-600 font-bold px-4 py-2.5 rounded-full text-sm shadow-md hover:scale-105 transition-transform"
              >
                <span>开通会员</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 三款工具订阅卡 */}
      <section className="px-5 py-8">
        <div className="max-w-lg md:max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tools.map((tool, i) => (
              <motion.div
                key={tool.id}
                {...fadeUp}
                transition={{ delay: i * 0.08 }}
                className={`group relative overflow-hidden bg-gradient-to-br ${tool.lightBg} ${tool.border} border-2 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col`}
              >
                <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${tool.gradient} opacity-10 rounded-full blur-2xl`} />

                <div className="relative p-5 flex flex-col h-full">
                  {/* 头部 */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-md`}
                    >
                      <tool.icon size={22} className="text-white" />
                    </div>
                    <div>
                      <div className="text-xl">{tool.emoji}</div>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight">
                        {tool.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {tool.desc}
                  </p>

                  {/* 功能 */}
                  <div className="space-y-1.5 mb-4">
                    {tool.features.map((f, j) => (
                      <div key={j} className="flex items-start gap-1.5 text-xs text-slate-700">
                        <Check size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* 价格 */}
                  <div className="mt-auto border-t border-slate-200/60 pt-3">
                    <div className="flex items-end justify-between mb-1">
                      <div>
                        <div className="text-[10px] text-slate-500">月费</div>
                        <div className="text-base font-bold text-slate-900">
                          ¥{tool.monthly}
                          <span className="text-xs text-slate-500 font-normal">/月</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-emerald-600 font-medium">年付立省</div>
                        <div className="text-base font-bold text-emerald-600">
                          ¥{tool.yearly}
                          <span className="text-xs text-slate-500 font-normal">/年</span>
                        </div>
                      </div>
                    </div>

                    <button
                      className={`w-full mt-2 inline-flex items-center justify-center gap-1 bg-gradient-to-r ${tool.gradient} text-white font-bold py-2.5 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all text-sm`}
                    >
                      <span>立即订阅</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 组合包年 */}
      <section className="px-5 py-6">
        <div className="max-w-lg md:max-w-5xl mx-auto">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white rounded-3xl p-6 md:p-8 shadow-2xl"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-cyan-400/20 rounded-full blur-3xl" />

            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-5">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <Star size={26} className="text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-full mb-1.5">
                  <Sparkles size={11} />
                  <span>组合包年 · 超值之选</span>
                </div>
                <h3 className="text-lg md:text-2xl font-bold leading-tight mb-1.5">
                  三件套包年 <span className="text-amber-300">¥2,980</span>
                  <span className="text-sm text-slate-300 line-through ml-2">¥3,764</span>
                </h3>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  豹纹工坊（豹纹+） + 灵犀 AI + 先锋派数字人，一次性打包，
                  折合每天仅 ¥8.16。基础会员叠加再享 8 折。
                </p>
              </div>
              <button className="flex-shrink-0 w-full md:w-auto inline-flex items-center justify-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold px-5 py-3 rounded-full text-sm shadow-lg hover:scale-105 active:scale-95 transition-transform">
                <span>🚀 立即组合订阅</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 服务保障 */}
      <section className="px-5 py-6">
        <div className="max-w-lg md:max-w-5xl mx-auto">
          <motion.div {...fadeUp}>
            <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
              {[
                { icon: Shield, label: '7 天无理由退款' },
                { icon: TrendingUp, label: '月度功能免费升级' },
                { icon: Sparkles, label: '会员 8 折长期有效' },
              ].map((s, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-2xl p-3 md:p-4"
                >
                  <s.icon
                    size={20}
                    className="mx-auto mb-1.5 text-amber-500"
                  />
                  <div className="text-[11px] md:text-xs text-slate-600 font-medium leading-tight">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 底部咨询 */}
      <section className="px-5 py-6 text-center">
        <Link
          href="/contact"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          需要企业团购 / API 接入？联系顾问 1V1 咨询 →
        </Link>
      </section>
    </div>
  )
}
