/**
 * 城市主理人 · 顶流商业说明页（合并 /pitch 全景 + 城市主理人权益）
 * ------------------------------------------------------------
 * 路由: /partner
 *
 * 设计目标（深色科技风 · Duolingo / Linear 风格）：
 *   1. [任务 2] 深色科技底：bg-gradient-to-b from-slate-900 to-slate-800
 *   2. [任务 2] 玻璃态卡片：bg-white/5 backdrop-blur-sm border border-white/10
 *   3. [任务 2] 主标题渐变：text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500
 *   4. [任务 3] 商业全景数据大盘 + 9 大 AI 智能体（3x3 网格）
 *   5. [任务 4] 城市主理人变现与收益闭环（2x2 Bento 网格）
 *   6. [任务 5] 4 大权益模块（深色化）+ 5980 元价格显性化 + 加盟 CTA
 *   7. [任务 6] 移动端单列折叠，padding p-4/p-5 舒适
 * ------------------------------------------------------------
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Sparkles,
  Coins,
  Users,
  MapPin,
  Cpu,
  UserCog,
  Megaphone,
  Mail,
  Headphones,
  Search,
  Target,
  DollarSign,
  Rocket,
  Server,
  BookOpen,
  Wrench,
  Phone,
  Award,
  CheckCircle2,
  User,
  Smartphone,
  Banknote,
  ShieldCheck,
  Building2,
  Briefcase,
  Crown,
  Mic,
  Loader2,
  type LucideIcon,
} from 'lucide-react'
import AIMatchmakerWidget from '@/components/AIMatchmakerWidget'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5 },
}

// ═══════════════════════════════════════════════════════════
// 数据大盘（4 大指标）
// ═══════════════════════════════════════════════════════════
const heroStats: { icon: LucideIcon; value: string; label: string; gold?: boolean }[] = [
  { icon: Coins,  value: '¥210 万+', label: '累计交易额', gold: true },
  { icon: Users,  value: '300+',     label: '活跃主理人' },
  { icon: MapPin, value: '5 城',     label: '覆盖城市' },
  { icon: Cpu,    value: '9 个',     label: 'AI 智能体' },
]

// ═══════════════════════════════════════════════════════════
// 9 大 AI 智能体（与 /pitch 全站一致）
// ═══════════════════════════════════════════════════════════
const aiAgents: { icon: LucideIcon; name: string; desc: string; color: string }[] = [
  { icon: UserCog,    name: 'CEO 智能体',   desc: '战略决策 + 业务规划',    color: 'from-blue-500 to-indigo-500' },
  { icon: Cpu,        name: '技术智能体',   desc: 'AI 工作流 + 自动化部署', color: 'from-cyan-500 to-blue-500' },
  { icon: Megaphone,  name: '营销智能体',   desc: '内容生成 + 投流优化',    color: 'from-pink-500 to-rose-500' },
  { icon: Mail,       name: '邮件智能体',   desc: 'EDM + 私域触达',         color: 'from-amber-500 to-orange-500' },
  { icon: Headphones, name: '客服智能体',   desc: '7×24 自动应答',          color: 'from-emerald-500 to-teal-500' },
  { icon: Search,     name: '研究智能体',   desc: '行业调研 + 竞品分析',    color: 'from-violet-500 to-purple-500' },
  { icon: Target,     name: '广告智能体',   desc: '多平台投放 + ROI 优化',  color: 'from-red-500 to-rose-500' },
  { icon: DollarSign, name: '财务智能体',   desc: '成本核算 + 分润计算',    color: 'from-green-500 to-emerald-500' },
  { icon: Rocket,     name: '执行智能体',   desc: '任务拆解 + 自动跟进',    color: 'from-orange-500 to-amber-500' },
]

// ═══════════════════════════════════════════════════════════
// 城市主理人商业闭环（Bento 2x2）
// ═══════════════════════════════════════════════════════════
const businessLoop: {
  no: string
  title: string
  desc: string
  icon: LucideIcon
  emoji: string
  color: string
}[] = [
  {
    no: '01',
    title: '工具与系统赋能',
    desc: '利用总部系统与 AI 工具（豹纹工坊（豹纹+）、灵犀 AI、先锋派数字人），降低本地获客与交付成本',
    icon: Wrench,
    emoji: '🛠️',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    no: '02',
    title: '本地沙龙引流',
    desc: '利用总部 60 天主理人训练营 SOP，开展本地公开课与精准客户沙龙，沉淀本地私域',
    icon: Mic,
    emoji: '🎤',
    color: 'from-pink-500 to-rose-500',
  },
  {
    no: '03',
    title: '深度陪跑与代运营',
    desc: '为本地企业提供高阶陪跑 + AI 自动化代运营，赚取 1 万 - 30 万/单 的高客单利润',
    icon: Crown,
    emoji: '👑',
    color: 'from-amber-500 to-orange-500',
  },
  {
    no: '04',
    title: '分站规模化复制',
    desc: '跑通本地样本后，在区域内扩张 3-5 个分站 / 子主理人，获取区域性资产红利',
    icon: Building2,
    emoji: '🏙️',
    color: 'from-emerald-500 to-teal-500',
  },
]

// ═══════════════════════════════════════════════════════════
// 4 大权益模块（深色玻璃态）
// ═══════════════════════════════════════════════════════════
const benefits: { icon: LucideIcon; title: string; desc: string; color: string }[] = [
  {
    icon: Server,
    title: '品牌授权与背书',
    desc: '共享良朋社 OPC 品牌，中科院中科创科学院背书资源，提升本地影响力',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: BookOpen,
    title: '标准化沙龙 SOP',
    desc: '总部提供邀约、PPT、现场流程等整套执行文档，一键复制成功经验',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Cpu,
    title: '全套 AI 工具库',
    desc: '开放内部自研工具（豹纹工坊（豹纹+）、灵犀 AI、先锋派数字人等），赋能本地企业',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: ShieldCheck,
    title: '深度陪跑与内训',
    desc: '总部提供 1v1 陪跑，协助本地第一场沙龙落地，全程保驾护航',
    color: 'from-amber-500 to-orange-500',
  },
]

// ═══════════════════════════════════════════════════════════
// 4 大权益（加盟费内含模块）
// ═══════════════════════════════════════════════════════════
const franchiseModules: { icon: LucideIcon; title: string; desc: string; color: string }[] = [
  {
    icon: Server,
    title: '分站系统租赁与定制（年费）',
    desc: '城市独立 SaaS 后台、品牌域名、客户/订单/分润数据看板，年度付费即可使用全套系统',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: Sparkles,
    title: '年度系统更新 + AI 工具升级',
    desc: '豹纹工坊（豹纹+）、灵犀 AI、先锋派数字人等自研工具免费同步升级，紧跟 GPT-5 / Claude 等模型迭代',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: BookOpen,
    title: '60 天主理人训练营 + 1V1 陪跑',
    desc: '从 0 到 1 跑通本地第一场沙龙与第一笔订单，总部顾问全程在线答疑',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Award,
    title: '总部品牌与专利授权使用',
    desc: '合法使用「良朋社 OPC」「OPC 智富生态」品牌、商标与软著专利，本地宣传与签约场景无忧',
    color: 'from-amber-500 to-orange-500',
  },
]

// ═══════════════════════════════════════════════════════════
// 三方分润
// ═══════════════════════════════════════════════════════════
const parties: { role: string; emoji: string; icon: LucideIcon; range: string; subtitle: string; path: string; color: string }[] = [
  {
    role: '资源方',
    emoji: '🏢',
    icon: Briefcase,
    range: '75% - 85%',
    subtitle: '工具商 · 项目方 · 服务商',
    path: '通过 OPC 平台卖出工具与服务',
    color: 'from-amber-400 to-orange-500',
  },
  {
    role: '城市主理人',
    emoji: '🤝',
    icon: UserCog,
    range: '10% - 20%',
    subtitle: '落地运营商',
    path: '向本地企业推荐 OPC 工具与陪跑',
    color: 'from-violet-500 to-purple-500',
  },
  {
    role: '良朋社总部',
    emoji: '🏛️',
    icon: Award,
    range: '5% - 15%',
    subtitle: '平台方',
    path: '提供 SaaS 系统 + AI 诊断 + 全国客户池',
    color: 'from-sky-400 to-blue-500',
  },
]

export default function PartnerPage() {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    contact: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // ── 城市主理人 · 5980 加盟转化漏斗（任务 1） ──
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinResult, setJoinResult] = useState<{
    orderId: string
    points: { bonus: number; currentBalance: number; totalEarned: number; logId: string; source: string }
    city: { code: string; linked: boolean }
    paidAt: string
  } | null>(null)
  const [joinError, setJoinError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const response = await fetch('/api/partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          city: formData.city,
          phone: formData.contact,
        }),
      })
      const data = await response.json()

      if (data.success) {
        setIsSubmitted(true)
        setFormData({ name: '', city: '', contact: '' })
      } else {
        setErrorMessage(data.error || '提交失败，请稍后重试')
      }
    } catch {
      setErrorMessage('网络异常，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  /** 任务 1：底部 CTA → /api/payment/create-checkout */
  const handleJoinCity = async () => {
    if (joinLoading) return
    setJoinLoading(true)
    setJoinError('')

    // 优先使用已填表单的城市；否则 shenzhen
    const cityCode = formData.city && formData.city !== 'other' ? formData.city : 'shenzhen'
    const deviceId =
      (typeof window !== 'undefined' &&
        (window.localStorage.getItem('opc_device_id') ||
          window.localStorage.getItem('opc_partner_device_id'))) ||
      `web_${Date.now().toString(36).slice(-6)}`

    try {
      // 持久化 deviceId 供后续 API 复用
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem('opc_device_id', deviceId)
        } catch {}
      }

      const r = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-id': deviceId,
        },
        body: JSON.stringify({ cityCode }),
      })
      const json = await r.json()
      if (json.success) {
        setJoinResult({
          orderId: json.data.orderId,
          points: json.data.points,
          city: json.data.city,
          paidAt: json.data.paidAt,
        })
        // 同步 localStorage：标记主理人身份 + 积分余额
        if (typeof window !== 'undefined') {
          try {
            const owned: string[] = JSON.parse(
              window.localStorage.getItem('opc_owned_plans') || '[]'
            )
            if (!owned.includes('CITY_5980')) {
              owned.push('CITY_5980')
              window.localStorage.setItem('opc_owned_plans', JSON.stringify(owned))
            }
            window.localStorage.setItem('membership_level', '5980')
            window.localStorage.setItem('opc_user_role', 'CITY_MAINTAINER')
            window.localStorage.setItem('opc_points_balance', String(json.data.points.currentBalance))
          } catch {}
        }
      } else {
        setJoinError(json.error || '支付失败，请稍后重试')
      }
    } catch {
      setJoinError('网络异常，请稍后重试')
    } finally {
      setJoinLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white font-sans">
      {/* ═══ HERO 区：商业全景 + 数据大盘 ═══ */}
      <section className="relative overflow-hidden pt-20 pb-12 px-5">
        {/* 装饰光晕 */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-32 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-t from-slate-800 to-transparent" />

        <div className="relative max-w-lg mx-auto md:max-w-6xl md:mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/15 via-yellow-400/15 to-amber-500/15 backdrop-blur-md border border-amber-400/40 rounded-full px-4 py-1.5 mb-6"
          >
            <Sparkles size={14} className="text-amber-300" />
            <span className="text-sm text-amber-100 font-semibold tracking-wide">
              良朋社 OPC · 城市主理人招募计划
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 text-white"
          >
            看懂<span className="text-amber-400">商业全景</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400">
              成为城市主理人
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-lg text-slate-300 leading-relaxed mb-10 max-w-2xl mx-auto"
          >
            我们在深圳跑通了 AI 商业落地的全链路闭环，现面向全国招募
            <span className="text-amber-300 font-semibold">5 城 · 300+ 主理人 · 9 AI Agent</span>
            ，复制这套已盈利的商业操作系统。
          </motion.p>

          {/* 数据大盘 · 4 卡玻璃态 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
          >
            {heroStats.map((s) => (
              <div
                key={s.label}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 transition-colors"
              >
                <s.icon
                  size={22}
                  className={`mx-auto mb-2 ${s.gold ? 'text-amber-400' : 'text-slate-300'}`}
                />
                <div
                  className={`text-xl md:text-2xl font-extrabold leading-tight ${
                    s.gold ? 'text-amber-400' : 'text-white'
                  }`}
                >
                  {s.value}
                </div>
                <div className="text-[11px] md:text-xs text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ 9 大 AI 智能体矩阵 ═══ */}
      <section className="px-5 py-16">
        <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-violet-200 bg-violet-500/20 border border-violet-400/30 rounded-full mb-3">
              🧠 AI Agent 矩阵
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              核心引擎 · <span className="text-amber-400">9 大 AI 智能体</span>，为你打工
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
              每一个 Agent 都在 OPC 真实业务里跑通过，复制到你的城市主理人生意，效率提升 10 倍。
            </p>
          </motion.div>

          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {aiAgents.map((a) => (
              <motion.div
                key={a.name}
                {...fadeUp}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 md:p-4 text-center hover:bg-white/10 hover:border-amber-400/40 transition-all"
              >
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 mx-auto rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center text-white shadow-md mb-2`}
                >
                  <a.icon size={18} className="md:hidden" />
                  <a.icon size={22} className="hidden md:block" />
                </div>
                <h3 className="font-bold text-white text-xs md:text-sm leading-tight">{a.name}</h3>
                <p className="text-[10px] md:text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {a.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 城市主理人商业闭环（Bento 2x2）═══ */}
      <section className="px-5 py-16 bg-slate-900/40">
        <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-emerald-200 bg-emerald-500/20 border border-emerald-400/30 rounded-full mb-3">
              💰 商业闭环
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              你的专属 <span className="text-amber-400">OPC 城市商业闭环</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
              从工具赋能 → 本地引流 → 高客单陪跑 → 区域复制，4 步走完本地化商业闭环。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {businessLoop.map((step, i) => (
              <motion.div
                key={step.no}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-5 hover:bg-white/10 hover:border-amber-400/40 transition-all overflow-hidden"
              >
                <div
                  className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${step.color} opacity-20 rounded-full blur-2xl`}
                />
                <div className="relative flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-2xl shadow-md`}
                  >
                    {step.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white text-base leading-tight">
                        {step.title}
                      </h3>
                      <span
                        className={`text-[10px] font-bold tracking-wider bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}
                      >
                        STEP {step.no}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 三方分润 ═══ */}
      <section className="px-5 py-16">
        <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-amber-200 bg-amber-500/20 border border-amber-400/30 rounded-full mb-3">
              💰 收益模型
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              稳定的三方分润 · <span className="text-amber-400">共赢</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
              每一笔成交，三方按约定自动分润，全部留痕可查。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {parties.map((p, i) => (
              <motion.div
                key={p.role}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-amber-400/40 transition-all overflow-hidden"
              >
                <div
                  className={`absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br ${p.color} opacity-20 rounded-full blur-3xl`}
                />

                <div className="relative">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-2xl shadow-md`}
                    >
                      {p.emoji}
                    </div>
                    <div>
                      <div className="font-bold text-white text-base leading-tight">
                        {p.role}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-tight">
                        {p.subtitle}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    <span className="font-semibold text-amber-300">路径：</span>
                    {p.path}
                  </p>

                  <div
                    className={`bg-gradient-to-r ${p.color} rounded-xl px-4 py-3 flex items-center justify-between shadow-md`}
                  >
                    <div>
                      <div className="text-[10px] text-white/80">分润比例</div>
                      <div className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                        {p.range}
                      </div>
                    </div>
                    <p.icon size={32} className="text-white/30" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4 大权益模块（深色玻璃态）═══ */}
      <section className="px-5 py-16 bg-slate-900/40">
        <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-pink-200 bg-pink-500/20 border border-pink-400/30 rounded-full mb-3">
              ✨ 核心权益
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              4 大权益模块 · <span className="text-amber-400">构筑主理人护城河</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base">
              一次性年费涵盖以下全部模块，城市规模不同，报价区间略有差异。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-5 hover:bg-white/10 hover:border-amber-400/40 transition-all overflow-hidden"
              >
                <div
                  className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${b.color} opacity-20 rounded-full blur-2xl`}
                />
                <div className="relative flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${b.color} flex items-center justify-center shadow-md`}
                  >
                    <b.icon size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-100 text-base leading-tight mb-1.5">
                      {b.title}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                      {b.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4 大加盟费内含模块 + 5980 元价格显性化 ═══ */}
      <section className="px-5 py-16">
        <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
          <motion.div {...fadeUp} className="text-center mb-8">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-amber-200 bg-amber-500/20 border border-amber-400/30 rounded-full mb-3">
              💎 加盟方案
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              加盟费 <span className="text-amber-400">5980 元 / 年</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base">
              一次性年费，4 大模块全部解锁（含 SaaS 系统 / AI 工具升级 / 训练营 / 品牌授权）
            </p>
          </motion.div>

          {/* 价格大卡片 · 顶部 */}
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-5 md:p-6 shadow-2xl shadow-orange-500/30 mb-6"
          >
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/15 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-400/20 rounded-full blur-2xl" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-md">
                <Banknote size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-extrabold tracking-widest text-white/80 mb-1">
                  城市主理人 · 年费方案
                </div>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-4xl md:text-5xl font-extrabold text-white leading-none">
                    ¥5,980
                  </span>
                  <span className="text-sm text-white/80 font-semibold">/ 年</span>
                </div>
                <p className="text-xs md:text-sm text-white/95 leading-relaxed">
                  一次性付费，4 大模块全部解锁 · 享受 1V1 陪跑 + 9 大 AI 智能体 + 全国客户池
                </p>
              </div>
            </div>
          </motion.div>

          {/* 4 大加盟模块 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {franchiseModules.map((m, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-5 hover:bg-white/10 hover:border-amber-400/40 transition-all overflow-hidden"
              >
                <div
                  className={`absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br ${m.color} opacity-20 rounded-full blur-2xl`}
                />
                <div className="relative flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center shadow-md`}
                  >
                    <m.icon size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-extrabold text-amber-300 tracking-wider mb-0.5">
                      已含 · 权益模块 {i + 1}
                    </div>
                    <h3 className="font-bold text-slate-100 text-sm md:text-base leading-tight mb-1">
                      {m.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 合作意向表单 ═══ */}
      <section id="partner-form" className="px-5 py-16 bg-slate-900/40">
        <div className="max-w-lg mx-auto md:max-w-3xl md:mx-auto">
          <motion.div {...fadeUp} className="text-center mb-8">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-cyan-200 bg-cyan-500/20 border border-cyan-400/30 rounded-full mb-3">
              🤝 申请加盟
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              立即咨询 <span className="text-amber-400">5980 城市主理人加盟</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base">
              根据你的城市规模与预期目标，1V1 定制方案
            </p>
          </motion.div>

          {isSubmitted ? (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">提交成功！</h3>
              <p className="text-slate-300 mb-4 text-sm">
                您的合作意向已提交，我们将在 24 小时内与您联系。
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-amber-300 hover:text-amber-200 font-medium text-sm"
              >
                继续提交其他城市
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 md:p-6"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1.5">
                    姓名
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="请输入您的姓名"
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1.5">
                    意向城市
                  </label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
                    <select
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60 appearance-none"
                    >
                      <option value="" className="bg-slate-800">请选择意向城市</option>
                      <option value="beijing" className="bg-slate-800">北京</option>
                      <option value="shanghai" className="bg-slate-800">上海</option>
                      <option value="guangzhou" className="bg-slate-800">广州</option>
                      <option value="hangzhou" className="bg-slate-800">杭州</option>
                      <option value="chengdu" className="bg-slate-800">成都</option>
                      <option value="wuhan" className="bg-slate-800">武汉</option>
                      <option value="nanjing" className="bg-slate-800">南京</option>
                      <option value="shenzhen" className="bg-slate-800">深圳</option>
                      <option value="xian" className="bg-slate-800">西安</option>
                      <option value="chongqing" className="bg-slate-800">重庆</option>
                      <option value="tianjin" className="bg-slate-800">天津</option>
                      <option value="other" className="bg-slate-800">其他城市</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1.5">
                    微信号 / 手机号
                  </label>
                  <div className="relative">
                    <Smartphone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      placeholder="请输入微信号或手机号"
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60"
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="text-red-300 text-sm bg-red-500/10 border border-red-400/30 p-3 rounded-lg">
                    {errorMessage}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 py-3.5 rounded-xl font-extrabold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-orange-500/30 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  '提交中...'
                ) : (
                  <>
                    立即咨询 5980 城市主理人加盟
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-500 text-center mt-3">
                已有 <span className="text-amber-300 font-bold">300+</span> 位主理人
                在 <span className="text-amber-300 font-bold">5 座城市</span> 运营中
              </p>
            </form>
          )}
        </div>
      </section>

      {/* AI 智能供需匹配模块 */}
      <section className="px-5 py-12">
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <AIMatchmakerWidget defaultCity="" />
        </div>
      </section>

      {/* ═══ 底部 CTA · 浅色化以便跟深色底色区分 ═══ */}
      <section className="px-5 py-12">
        <div className="max-w-lg mx-auto md:max-w-3xl md:mx-auto">
          <motion.div
            {...fadeUp}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 text-center"
          >
            <div className="text-3xl mb-2">🚀</div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white leading-tight mb-2">
              加入我们，成为 OPC 城市主理人
            </h2>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-5 max-w-xl mx-auto">
              良朋社 OPC · 招募 5 城合伙人，复制深圳已跑通的整套商业操作系统。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={handleJoinCity}
                disabled={joinLoading}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-bold px-5 py-3 rounded-xl text-sm shadow-lg shadow-orange-500/30 hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {joinLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    支付中…
                  </>
                ) : (
                  <>
                    <Phone size={16} />
                    立即咨询 5980 城市主理人加盟
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
              <Link
                href="/workspace"
                className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-bold px-5 py-3 rounded-xl text-sm hover:bg-white/15 transition-colors"
              >
                <Sparkles size={16} />
                先完成 OPC 诊断
              </Link>
            </div>
            {joinError && (
              <p className="text-xs text-rose-300 text-center mt-3">⚠️ {joinError}</p>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══ 任务 1：加盟成功模态框 ═══ */}
      <AnimatePresence>
        {joinResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-slate-900/85 backdrop-blur-sm flex items-center justify-center px-5"
            onClick={() => setJoinResult(null)}
          >
            <motion.div
              initial={{ scale: 0.6, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-gradient-to-b from-slate-800 via-slate-900 to-black border border-amber-400/40 rounded-3xl p-6 text-center overflow-hidden shadow-2xl shadow-amber-500/30"
            >
              {/* 光晕 */}
              <div className="absolute -top-20 -left-20 w-48 h-48 bg-amber-400/30 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-rose-400/30 rounded-full blur-3xl" />

              <div className="relative">
                {/* 中心皇冠图标 */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 16 }}
                  className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-lg"
                >
                  <Crown size={36} className="text-slate-900" />
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-xl md:text-2xl font-extrabold text-white mb-1"
                >
                  🎉 主理人身份已激活
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-slate-300 mb-5"
                >
                  城市 <span className="text-amber-300 font-bold">{joinResult.city.code}</span> 已关联
                  {joinResult.city.linked ? ' ✅' : '（待人工对接）'}
                </motion.p>

                {/* 积分到账提示卡 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-rose-500/20 border border-amber-400/40 rounded-2xl p-4 mb-4"
                >
                  <div className="text-xs text-amber-200 font-bold mb-1">🎁 智富积分到账</div>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-3xl md:text-4xl font-extrabold text-amber-300 tabular-nums">
                      +{joinResult.points.bonus.toLocaleString()}
                    </span>
                    <span className="text-sm text-amber-200/80">积分</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    当前余额：
                    <span className="text-amber-300 font-bold">
                      {joinResult.points.currentBalance.toLocaleString()}
                    </span>{' '}
                    · 累计赚取 {joinResult.points.totalEarned.toLocaleString()}
                  </div>
                </motion.div>

                {/* 操作路径 */}
                <motion.ul
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-left text-xs text-slate-300 space-y-1.5 mb-5 bg-slate-900/40 rounded-xl p-3"
                >
                  <li>✅ User.role = CITY_MAINTAINER 已生效</li>
                  <li>✅ subscription_type = CITY_5980 · status = ACTIVE</li>
                  <li>✅ AssetBalance +{joinResult.points.bonus} 积分（PointsLog 已写入 PURCHASE_BONUS）</li>
                  <li>📍 订单号：{joinResult.orderId}</li>
                </motion.ul>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    href="/workspace"
                    onClick={() => setJoinResult(null)}
                    className="flex-1 inline-flex items-center justify-center gap-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm"
                  >
                    进入工作台
                    <ArrowRight size={14} />
                  </Link>
                  <Link
                    href="/member"
                    onClick={() => setJoinResult(null)}
                    className="flex-1 inline-flex items-center justify-center gap-1 bg-white/10 border border-white/20 text-white font-bold px-4 py-2.5 rounded-xl text-sm"
                  >
                    查看积分流水
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={() => setJoinResult(null)}
                  className="mt-3 text-xs text-slate-500 hover:text-slate-300"
                >
                  稍后查看
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="px-4 py-8 border-t border-white/10">
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <span className="text-lg font-bold text-white">OPC</span>
              </div>
              <div>
                <h3 className="font-bold text-white">良朋社 OPC</h3>
                <p className="text-xs text-slate-400">一人公司 × AI 商业操作系统</p>
              </div>
            </div>
            <div className="text-sm text-slate-400 md:border-l md:border-white/10 md:pl-4">
              <p>主办方：良朋社 OPC / 中科院中科创科学院</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
