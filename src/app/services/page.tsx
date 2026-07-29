'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Stethoscope,
  GraduationCap,
  Users,
  Building,
  Sparkles,
  Zap,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Star,
  ArrowRight,
  // 9 Agent 矩阵新增图标
  UserCog,
  Cpu,
  Megaphone,
  Mail,
  Headphones,
  Search,
  Target,
  DollarSign,
  Rocket,
  // IP 重构 4 步法新增图标
  ClipboardList,
  Mic,
  FileText,
  Crown,
} from 'lucide-react'
import AIDiagnosisForm from '@/components/AIDiagnosisForm'
import { toast } from '@/components/Toast'

// ─── AI 智富服务中台：四大引擎 ───
const serviceEngines = [
  {
    id: 'diagnosis',
    icon: Stethoscope,
    title: 'AI 战略诊断与咨询',
    desc: '面向个人与企业，通过 AI 诊断书快速定位痛点与商机。',
    tags: ['商机诊断', '企业转型', '四库匹配'],
    cta: '开始 AI 诊断',
    bg: 'bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50',
    border: 'border-blue-200',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    iconRing: 'ring-blue-200',
    tagBg: 'bg-white/80 text-blue-700',
    buttonGradient: 'bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500',
  },
  {
    id: 'coaching',
    icon: GraduationCap,
    title: 'AI 实战全周期陪跑',
    desc: '12 周从 0 到 1，完成"认知→验证→放大"的陪跑闭环。',
    tags: ['认知搭建', '闭环验证', '规模化放大'],
    cta: '查看陪跑体系',
    bg: 'bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50',
    border: 'border-violet-200',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-500',
    iconRing: 'ring-violet-200',
    tagBg: 'bg-white/80 text-violet-700',
    buttonGradient: 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500',
  },
  {
    id: 'mentors',
    icon: Users,
    title: 'OPC 导师智库',
    desc: '汇聚弓老师、卢老师、于老师、吕老师等 10 年+ 实战派导师，提供专属辅导。',
    tags: ['实战导师', '1V1 私教', '行业大咖'],
    cta: '预约导师',
    bg: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50',
    border: 'border-emerald-200',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    iconRing: 'ring-emerald-200',
    tagBg: 'bg-white/80 text-emerald-700',
    buttonGradient: 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500',
  },
  {
    id: 'training',
    icon: Building,
    title: 'OPC 主理人 AI 变现商学院',
    desc: '深度拆解【诊断表 → 直播成交 → 后端方案 → 高价课】的全链路 AI 赋能玩法。',
    tags: ['AI 变现 4 步法', '主理人培训', '体系复制'],
    cta: '了解内训',
    bg: 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50',
    border: 'border-orange-200',
    iconBg: 'bg-gradient-to-br from-orange-500 to-amber-500',
    iconRing: 'ring-orange-200',
    tagBg: 'bg-white/80 text-orange-700',
    buttonGradient: 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500',
  },
]

// ─── 导师数据 ───
const mentors = [
  {
    name: '弓老师',
    title: 'AI 商业落地专家 / 良朋社 OPC 创始人',
    avatar: '/mentors/processed/弓老师_face.jpg',
    bg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    stats: [
      { label: '操盘项目', value: '30+' },
      { label: '学员变现', value: '¥2.8亿' },
      { label: '陪跑周期', value: '12周' },
    ],
    quote: '让 AI 成为你的第一个员工，而不是竞争对手。',
  },
  {
    name: '卢老师',
    title: 'AI电商落地专家 / 良朋社联合创始人',
    avatar: '/mentors/processed/卢老师_face.png',
    bg: 'bg-gradient-to-br from-purple-500 to-pink-600',
    stats: [
      { label: '增长操盘', value: '¥10亿+' },
      { label: '孵化 IP', value: '50+' },
      { label: '私域沉淀', value: '200万+' },
    ],
    quote: 'AI 不是替代你，而是让你一个人活成一支军队。',
  },
  {
    name: '于老师',
    title: 'AI 技术架构师 / 开源社区 KOL',
    avatar: '/mentors/processed/于老师_face.jpg',
    bg: 'bg-gradient-to-br from-green-500 to-teal-600',
    stats: [
      { label: '开源贡献', value: '10万⭐' },
      { label: '技术咨询', value: '100+' },
      { label: '效率提升', value: '10x' },
    ],
    quote: '用 20% 的时间，创造 80% 的价值。',
  },
  {
    name: '吕老师',
    title: '新消费品牌操盘手',
    avatar: '/images/lv_teacher.png',
    bg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    stats: [
      { label: '品牌操盘', value: '¥5亿+' },
      { label: '学员创业', value: '200+' },
      { label: '成功案例', value: '50+' },
    ],
    quote: '最好的商业模式，是你自己的 CEO。',
  },
]

// ─── 主页面组件 ───
export default function ServicesPage() {
  const [diagnosisOpen, setDiagnosisOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({ wechat: '', phone: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 340
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 },
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ═══ HERO 区 ═══ */}
      <motion.section
        {...fadeUp}
        className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-50 pt-20 pb-32 px-5"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-40 bg-gradient-to-t from-slate-50 to-transparent" />
        </div>

        <div className="relative max-w-lg mx-auto md:max-w-6xl md:mx-auto">
          <div className="text-center">
            <motion.div
              {...fadeUp}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6"
            >
              <Sparkles size={14} className="text-blue-400" />
              <span className="text-sm text-slate-300 font-medium">良朋社 OPC 2025 年度旗舰</span>
            </motion.div>

            <motion.h1
              {...fadeUp}
              className="text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-tight"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400">
                ⚡️ AI 智富服务中台
              </span>
            </motion.h1>

            <motion.p
              {...fadeUp}
              className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              从战略诊断到导师陪跑，为 OPC 主理人与企业<br className="hidden md:block" />
              搭建一站式 AI 赋能服务体系。
            </motion.p>

            <motion.p
              {...fadeUp}
              className="text-slate-500 text-sm mb-6"
            >
              已有 2,847 位老板完成测评
            </motion.p>

            <motion.button
              {...fadeUp}
              onClick={() => setDiagnosisOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-lg px-10 py-4 rounded-2xl shadow-lg shadow-purple-500/25 transition-all duration-300"
            >
              <Zap size={22} className="group-hover:rotate-12 transition-transform" />
              <span>测一测你的 AI 商业阶段</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* ═══ AI 智富服务中台：4 宫格 Bento ═══ */}
      <section className="px-5 -mt-16 relative z-10">
        <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
          <motion.div
            {...fadeUp}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-amber-200 rounded-full px-3 py-1 mb-3">
              <Zap size={14} className="text-amber-500" />
              <span className="text-xs text-slate-700 font-medium">四大引擎 · 一站式中台</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              战略诊断 · 实战陪跑 · 导师智库 · 生态连接
            </h2>
            <p className="text-gray-500 text-sm md:text-base">
              从商机识别到 1V1 陪跑，再到体系复制与总部赋能
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {serviceEngines.map((engine, i) => (
              <motion.div
                key={engine.id}
                {...fadeUp}
                transition={{ delay: i * 0.08 }}
                className={`group relative ${engine.bg} border-2 ${engine.border} rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col`}
              >
                {/* 装饰光晕 */}
                <div className={`absolute -top-12 -right-12 w-32 h-32 ${engine.iconBg} opacity-10 rounded-full blur-2xl`} />

                <div className="relative flex flex-col h-full">
                  {/* 大图标 */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`flex-shrink-0 w-14 h-14 rounded-2xl ${engine.iconBg} flex items-center justify-center shadow-md ring-4 ${engine.iconRing}`}>
                      <engine.icon size={28} className="text-white" />
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2">
                    {engine.title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-700 leading-relaxed mb-3">
                    {engine.desc}
                  </p>

                  {/* 标签 */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {engine.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full border border-white/60 ${engine.tagBg}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 渐变 CTA 按钮 */}
                  <button
                    className={`mt-auto w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white ${engine.buttonGradient} rounded-xl shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all`}
                  >
                    <span>{engine.cta}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ─── 1000 元 · AI 商业定位诊断报告 — 高亮单品 ─── */}
          <motion.div
            {...fadeUp}
            className="mt-6 relative bg-white border-2 border-amber-300 rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full blur-3xl opacity-60" />
            <div className="relative flex flex-col md:flex-row items-center gap-5">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md ring-4 ring-amber-200">
                <span className="text-2xl">💼</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-[11px] font-semibold px-2 py-0.5 rounded-full mb-2">
                  <Sparkles size={12} />
                  <span>高客单 · 立等可取</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1.5">
                  1000 元 · AI 商业定位诊断报告
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  由 AI 结合您的行业背景，生成一份几十页的具体执行方案。超值交付，立等可取。
                </p>
              </div>
              <div className="flex flex-col items-center md:items-end gap-1 flex-shrink-0">
                <div className="text-2xl md:text-3xl font-extrabold text-amber-600">¥1,000</div>
                <div className="text-[11px] text-gray-400">一次性 · 含 1V1 解读</div>
                <button
                  onClick={() => {
                    toast.info('请填写您的姓名与电话，助理将在 1 小时内联系您完成预约。（演示用：正式环境会跳转到 /booking 预约表单）')
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-xl hover:scale-[1.03] active:scale-95 transition-all"
                >
                  立即预约诊断
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* 服务商入驻横幅 */}
          <div className="mt-8 relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-5 md:p-6 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <div className="relative flex flex-col md:flex-row items-center gap-4 text-white">
              <div className="flex-1">
                <div className="text-xs text-indigo-100 mb-1">💼 专业服务商招募</div>
                <h3 className="text-base md:text-lg font-bold mb-1.5">
                  您是专业咨询/内训师？
                </h3>
                <p className="text-xs md:text-sm text-indigo-50/90">
                  申请成为 OPC 认证服务商，共享企业客户资源
                </p>
              </div>
              <Link
                href="/services/join"
                className="flex-shrink-0 px-4 py-2.5 bg-white text-indigo-600 text-sm font-semibold rounded-xl hover:scale-105 transition-transform shadow-lg"
              >
                立即申请 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ OPC 内部特训营 ═══ */}
      <section className="px-5 py-20 bg-white">
        <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full mb-3">
              OPC 专属培训
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              OPC 内部特训营
            </h2>
            <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              专为 OPC 城市主理人与核心成员设计的实战培训体系，覆盖 AI 技术、变现路径与服务体系，持续赋能。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 卡片 1：AI 技术实战营 */}
            <motion.div
              {...fadeUp}
              className="bg-white rounded-2xl shadow-sm p-6 border-t-4 border-blue-500 hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-3">💻</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                AI 技术实战营
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                覆盖 AI 图文、AI 视频、AI 数字人、AI 智能体等核心工具的操作与落地应用，让主理人亲自体验四库全胜系统底层能力。
              </p>
            </motion.div>

            {/* 卡片 2：AI 变现路径特训 */}
            <motion.div
              {...fadeUp}
              className="bg-white rounded-2xl shadow-sm p-6 border-t-4 border-purple-500 hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                AI 变现路径特训
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                从&ldquo;工具库推荐&rdquo;到&ldquo;项目库 SOP&rdquo;，再到&ldquo;服务库高客单成交&rdquo;，全程拆解一人公司和中小企业的 AI 商业变现全流程。
              </p>
            </motion.div>

            {/* 卡片 3：OPC 服务体系构建 */}
            <motion.div
              {...fadeUp}
              className="bg-white rounded-2xl shadow-sm p-6 border-t-4 border-emerald-500 hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                OPC 服务体系构建
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                深度讲解 OPC 四库全胜系统的运营逻辑、主理人分润模式、客户私域承接与高客单转化实操。
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ 企业 AI 智富内训（4 步变现系统）═══ */}
      <section className="px-5 py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-3">
              🎓 良朋社 AI 商业实验室 · 4 步变现 SOP
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              企业 AI 智富内训（4 步变现系统）
            </h2>
            <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              从诊断、直播到后端成交，完全复制这套 AI 知识变现 SOP。
            </p>
          </motion.div>

          {/* 2 列网格：4 步大纲 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {[
              {
                step: '01',
                title: '在线诊断表设计',
                desc: '通过 AI 抓取用户痛点，完成精准定位。',
                color: 'from-blue-500 to-cyan-500',
                bg: 'from-blue-50 to-cyan-50',
                border: 'border-blue-200',
                icon: '📝',
              },
              {
                step: '02',
                title: 'AI 直播连麦诊断',
                desc: '用 AI 模型快速生成解决方案，建立极强信任。',
                color: 'from-violet-500 to-purple-500',
                bg: 'from-violet-50 to-purple-50',
                border: 'border-violet-200',
                icon: '🎙️',
              },
              {
                step: '03',
                title: '后端 1000 元方案交付',
                desc: 'AI 辅助生成几十页的商业执行方案。',
                color: 'from-amber-500 to-orange-500',
                bg: 'from-amber-50 to-orange-50',
                border: 'border-amber-200',
                icon: '📄',
              },
              {
                step: '04',
                title: '高阶 3 万元课程销售',
                desc: '用 AI 智能体辅助你完成话术、流程与系统搭建。',
                color: 'from-emerald-500 to-teal-500',
                bg: 'from-emerald-50 to-teal-50',
                border: 'border-emerald-200',
                icon: '🚀',
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                {...fadeUp}
                className={`group relative bg-gradient-to-br ${item.bg} border ${item.border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all overflow-hidden`}
              >
                <div className={`absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br ${item.color} opacity-10 rounded-full blur-2xl`} />
                <div className="relative flex items-start gap-3">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-xl shadow-md`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold tracking-wider bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                        STEP {item.step}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base leading-tight mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 底部 C 端转化价格卡片 */}
          <motion.div
            {...fadeUp}
            className="relative bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 rounded-2xl p-6 md:p-8 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl" />
            <div className="relative flex flex-col md:flex-row items-center gap-6 text-white">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 bg-amber-500 text-slate-900 text-[11px] font-bold px-2.5 py-1 rounded-full mb-3">
                  <Sparkles size={12} />
                  <span>🔥 C 端转化 · 高客单</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-2">
                  企业 AI 变现内训 · 全套陪跑
                </h3>
                <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-3">
                  3 万元 / 套 · 提供全面陪跑与手册。
                </p>
                <ul className="space-y-1.5 text-sm text-slate-200">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>良朋社 AI 商业实验室亲授 · 4 步变现 SOP 完整拆解</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>AI 智能体部署手册 + 提示词库</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>30 天 1V1 陪跑 · 落地保驾护航</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="text-center">
                  <div className="text-[11px] text-amber-300 mb-1">高阶 · 一次性</div>
                  <div className="text-4xl md:text-5xl font-extrabold text-amber-400">¥30,000</div>
                  <div className="text-[11px] text-slate-400 mt-1">/ 套 · 含 1V1 陪跑 + 手册</div>
                </div>
                <button
                  onClick={() => {
                    window.location.href = '/booking?p=course-30000'
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-95 transition-all"
                >
                  私信助理报名
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ 良朋社 · IP 重构系统：9 Agent + 4 步法 + 双产品卡 ═══ */}

      {/* ── 9 个 AI 智能体团队矩阵（3x3 网格）── */}
      <section className="px-5 py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-500 rounded-full mb-3">
              🦾 良朋社 AI 智能体团队
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              9 个 AI Agent，陪你从 0 到 1 跑通商业增长
            </h2>
            <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto">
              每一个 Agent 都在 OPC 真实业务里跑通过，复制到你的 IP，效率提升 10 倍。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {[
              { icon: UserCog,    name: 'CEO 智能体',    desc: '战略决策 + 业务规划',  color: 'from-blue-500 to-indigo-500',     bg: 'from-blue-50 to-indigo-50',     border: 'border-blue-200' },
              { icon: Cpu,        name: '技术智能体',    desc: 'AI 工作流 + 自动化部署', color: 'from-cyan-500 to-blue-500',     bg: 'from-cyan-50 to-blue-50',       border: 'border-cyan-200' },
              { icon: Megaphone,  name: '营销智能体',    desc: '内容生成 + 投流优化',   color: 'from-pink-500 to-rose-500',     bg: 'from-pink-50 to-rose-50',       border: 'border-pink-200' },
              { icon: Mail,       name: '邮件智能体',    desc: 'EDM + 私域触达',        color: 'from-amber-500 to-orange-500',  bg: 'from-amber-50 to-orange-50',    border: 'border-amber-200' },
              { icon: Headphones, name: '客服智能体',    desc: '7x24 自动应答',         color: 'from-emerald-500 to-teal-500',  bg: 'from-emerald-50 to-teal-50',    border: 'border-emerald-200' },
              { icon: Search,     name: '研究智能体',    desc: '行业调研 + 竞品分析',   color: 'from-violet-500 to-purple-500', bg: 'from-violet-50 to-purple-50',   border: 'border-violet-200' },
              { icon: Target,     name: '广告智能体',    desc: '多平台投放 + ROI 优化', color: 'from-red-500 to-rose-500',     bg: 'from-red-50 to-rose-50',        border: 'border-red-200' },
              { icon: DollarSign, name: '财务智能体',    desc: '成本核算 + 分润计算',   color: 'from-green-500 to-emerald-500', bg: 'from-green-50 to-emerald-50',   border: 'border-green-200' },
              { icon: Rocket,     name: '执行智能体',    desc: '任务拆解 + 自动跟进',   color: 'from-orange-500 to-amber-500',  bg: 'from-orange-50 to-amber-50',    border: 'border-orange-200' },
            ].map((agent) => (
              <motion.div
                key={agent.name}
                {...fadeUp}
                className={`group relative bg-gradient-to-br ${agent.bg} border ${agent.border} rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all overflow-hidden`}
              >
                <div className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${agent.color} opacity-10 rounded-full blur-2xl`} />
                <div className="relative flex items-center gap-3">
                  <div className={`flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-white shadow-md`}>
                    <agent.icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm md:text-base leading-tight">
                      {agent.name}
                    </h3>
                    <p className="text-[11px] md:text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {agent.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IP 商业系统重构 4 步法（单列长流程）── */}
      <section className="px-5 py-20 bg-white">
        <div className="max-w-lg mx-auto md:max-w-4xl md:mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-rose-500 rounded-full mb-3">
              ⚡️ 良朋社 IP 商业系统重构
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              4 步法：从 0 到 1 跑通 IP 变现闭环
            </h2>
            <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto">
              每一步都配备专属 AI 智能体 + 标准化 SOP 模板。
            </p>
          </motion.div>

          <div className="relative">
            {/* 中间连接线（仅桌面端） */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-purple-300 via-amber-300 to-emerald-300 -translate-x-1/2" />

            {[
              {
                step: '01',
                title: '诊断表生成（AI 定制）',
                desc: 'AI 根据你的行业、客群、痛点，1 分钟生成精准诊断表，锁定高意向用户。',
                icon: ClipboardList,
                color: 'from-blue-500 to-cyan-500',
                bg: 'from-blue-50 to-cyan-50',
                border: 'border-blue-200',
                emoji: '📋',
                right: false,
              },
              {
                step: '02',
                title: '直播连麦诊断（AI 知识库支撑）',
                desc: '直播连麦时，AI 实时调取知识库生成解决方案，3 分钟建立极强信任。',
                icon: Mic,
                color: 'from-violet-500 to-purple-500',
                bg: 'from-violet-50 to-purple-50',
                border: 'border-violet-200',
                emoji: '🎙️',
                right: true,
              },
              {
                step: '03',
                title: '1000 元方案交付（AI 生成几十页执行案）',
                desc: 'AI 辅助输出几十页的商业执行方案，交付即建立口碑，引爆转介绍。',
                icon: FileText,
                color: 'from-amber-500 to-orange-500',
                bg: 'from-amber-50 to-orange-50',
                border: 'border-amber-200',
                emoji: '📄',
                right: false,
              },
              {
                step: '04',
                title: '3 万元高级课程与 AI 系统落地',
                desc: '升级到 3 万元高级课程，含全套 IP 重构、陪跑、AI 工具与合伙人权益。',
                icon: Crown,
                color: 'from-emerald-500 to-teal-500',
                bg: 'from-emerald-50 to-teal-50',
                border: 'border-emerald-200',
                emoji: '👑',
                right: true,
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                {...fadeUp}
                className="relative mb-6 last:mb-0"
              >
                <div className={`md:flex items-center gap-6 ${item.right ? 'md:flex-row-reverse' : ''}`}>
                  {/* 卡片 */}
                  <div className={`flex-1 bg-gradient-to-br ${item.bg} border ${item.border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all`}>
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl shadow-md`}>
                        {item.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[10px] font-bold tracking-wider bg-gradient-to-r ${item.color} bg-clip-text text-transparent mb-1`}>
                          STEP {item.step}
                        </div>
                        <h3 className="font-bold text-gray-900 text-base md:text-lg leading-tight mb-1.5">
                          {item.title}
                        </h3>
                        <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* 中间圆点（仅桌面端） */}
                  <div className="hidden md:flex flex-shrink-0 w-10 h-10 rounded-full bg-white border-4 border-slate-100 items-center justify-center z-10 shadow-md">
                    <item.icon size={16} className="text-slate-600" />
                  </div>
                  {/* 占位（用于对齐） */}
                  <div className="hidden md:block flex-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 双产品售价卡片（1000 元 + 30000 元）── */}
      <section className="px-5 py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-full mb-3">
              💰 良朋社 IP 重构服务产品
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              4 步法产品化 · 两档标准化交付
            </h2>
            <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto">
              从 1000 元诊断到 30000 元全套陪跑，透明定价，按需选择。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 左卡片：橙色 · 1000 元 */}
            <motion.div
              {...fadeUp}
              className="relative bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-6 md:p-7 shadow-xl text-white overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/15 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl" />
              <div className="relative">
                <div className="text-[11px] font-bold text-amber-100 tracking-wider mb-2">
                  🟠 入门产品 · STEP 03
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-2 leading-tight">
                  《良朋社 AI 商业定位诊断》
                </h3>
                <p className="text-sm text-amber-50/90 leading-relaxed mb-5">
                  一份几十页的执行方案，含行业定位、用户画像、AI 落地路径与 3 个月增长路线图。
                </p>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-4xl md:text-5xl font-extrabold">¥1,000</span>
                  <span className="text-sm text-amber-100">/ 份</span>
                </div>
                <ul className="space-y-1.5 text-sm text-amber-50/95 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-white flex-shrink-0 mt-0.5" />
                    <span>几十页 AI 商业执行方案</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-white flex-shrink-0 mt-0.5" />
                    <span>1V1 视频解读 30 分钟</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-white flex-shrink-0 mt-0.5" />
                    <span>赠送 199 元基础会员 1 个月</span>
                  </li>
                </ul>
                <button
                  onClick={() => { window.location.href = '/pricing' }}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-white text-orange-600 text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                  立即购买诊断
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>

            {/* 右卡片：紫色 · 30000 元 */}
            <motion.div
              {...fadeUp}
              className="relative bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 rounded-2xl p-6 md:p-7 shadow-xl text-white overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/15 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-400/20 rounded-full blur-2xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-900 text-[11px] font-bold px-2.5 py-1 rounded-full mb-2">
                  <Sparkles size={12} />
                  <span>🔥 旗舰产品 · STEP 04</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-2 leading-tight">
                  《良朋社商业 IP 系统重构》
                </h3>
                <p className="text-sm text-violet-100/90 leading-relaxed mb-5">
                  全套 IP 重构课程 + 30 天 1V1 陪跑 + AI 工具部署 + 城市合伙人权益。
                </p>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-4xl md:text-5xl font-extrabold">¥30,000</span>
                  <span className="text-sm text-violet-200">/ 套</span>
                </div>
                <ul className="space-y-1.5 text-sm text-violet-50/95 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-amber-300 flex-shrink-0 mt-0.5" />
                    <span>4 步法全套 SOP + AI 智能体手册</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-amber-300 flex-shrink-0 mt-0.5" />
                    <span>30 天 1V1 落地陪跑</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-amber-300 flex-shrink-0 mt-0.5" />
                    <span>3 款自研 AI 工具年度使用权</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-amber-300 flex-shrink-0 mt-0.5" />
                    <span>城市合伙人权益 + 主理人分销</span>
                  </li>
                </ul>
                <button
                  onClick={() => { window.location.href = '/booking?p=course-30000' }}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                  私信助理报名
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ 导师展示 ═══ */}
      <section className="px-5 py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
          <motion.div
            {...fadeUp}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                实战导师团
              </h2>
              <p className="text-gray-500 text-sm">人均 10 年 + 商业实战经验</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => handleScroll('left')}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>
          </motion.div>

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {mentors.map((mentor, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ delay: i * 0.1 }}
                className="flex-shrink-0 w-[280px] md:w-[300px] snap-start bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <div className={`h-44 ${mentor.bg} flex items-start justify-center pt-2 relative overflow-hidden`}>
                  {/* 导师头像：背景图 + 圆形裁切 + 白色描边 + 阴影
                      关键：源图都是 1:1 方形（940×940 / 2048×2048），容器是 112×112 圆形
                      background-size: cover — 缩放至完整覆盖圆，保持比例
                      background-position: center 28% — 人脸在原图偏上，向下移动 28% 把人脸移到圆形正中央
                      （每人脸部在原图的 Y 位置略有差异，28% 是四张图统一居中的折中值） */}
                  <div
                    className="relative w-28 h-28 rounded-full border-4 border-white/90 shadow-lg overflow-hidden bg-gray-200"
                    style={{
                      backgroundImage: `url(${mentor.avatar})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center 28%',
                      backgroundRepeat: 'no-repeat',
                    }}
                    aria-label={mentor.name}
                    role="img"
                  />
                  {/* 底部柔光渐变，保证姓名对比度 */}
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg">{mentor.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{mentor.title}</p>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {mentor.stats.map((stat) => (
                      <div key={stat.label} className="text-center">
                        <div className="font-bold text-gray-900 text-sm">{stat.value}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3">
                    <div className="flex items-start gap-1.5">
                      <Star size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600 italic leading-relaxed">
                        {mentor.quote}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 服务商入驻横幅 */}
          <div className="mt-8 relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-5 md:p-6 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <div className="relative flex flex-col md:flex-row items-center gap-4 text-white">
              <div className="flex-1">
                <div className="text-xs text-indigo-100 mb-1">💼 专业服务商招募</div>
                <h3 className="text-base md:text-lg font-bold mb-1.5">
                  您是专业咨询/内训师？
                </h3>
                <p className="text-xs md:text-sm text-indigo-50/90">
                  申请成为 OPC 认证服务商，共享企业客户资源
                </p>
              </div>
              <Link
                href="/services/join"
                className="flex-shrink-0 px-4 py-2.5 bg-white text-indigo-600 text-sm font-semibold rounded-xl hover:scale-105 transition-transform shadow-lg"
              >
                立即申请 →
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* ═══ 底部生态 ═══ */}
      <section className="px-5 py-20">
        <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
          <motion.div
            {...fadeUp}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* 左侧：创富星球 */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 mb-4">
                  <Sparkles size={14} className="text-amber-400" />
                  <span className="text-xs font-medium">社群专属</span>
                </div>

                <h3 className="text-2xl font-bold mb-2">加入 OPC 创富星球</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  与 3,000+ 一人公司创业者同行，每日分享 AI 工具新玩法、商业案例拆解、独家资源对接。
                </p>

                <div className="space-y-3 mb-8">
                  {[
                    '每周 3 篇 AI 商业实战案例拆解',
                    '每月 1 场导师闭门直播答疑',
                    '独家 AI 工具使用手册 + 提示词库',
                    '城市合伙人线下沙龙优先名额',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-blue-400 flex-shrink-0" />
                      <span className="text-sm text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-bold">¥99</span>
                  <span className="text-sm text-slate-400">/ 年</span>
                  <span className="text-sm text-slate-500 line-through ml-2">¥999</span>
                </div>

                <button className="w-full bg-white text-slate-900 font-semibold py-3 rounded-xl hover:bg-slate-100 transition-colors">
                  立即加入星球
                </button>
              </div>
            </div>

            {/* 右侧：预约表单 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-1">预约 30 分钟 AI 诊断</h3>
              <p className="text-gray-500 text-sm mb-6">
                留下联系方式，专属顾问将在 24 小时内与你联系
              </p>

              {submitted ? (
                <div className="bg-green-50 rounded-xl p-6 text-center">
                  <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-1">预约成功</h4>
                  <p className="text-sm text-gray-500">顾问将在 24 小时内联系你</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      微信号
                    </label>
                    <input
                      type="text"
                      value={formData.wechat}
                      onChange={(e) => setFormData({ ...formData, wechat: e.target.value })}
                      required
                      placeholder="请输入你的微信号"
                      className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      手机号
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      placeholder="请输入你的手机号"
                      className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20"
                  >
                    立即预约诊断
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    仅用于顾问联系，严格保护隐私
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI 商业落地诊断入口横幅 */}
      <section className="px-5 py-16 bg-slate-50">
        <div className="max-w-lg mx-auto md:max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden"
          >
            {/* 装饰光晕 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl" />

            <div className="relative text-center text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-1.5 mb-4">
                <Sparkles size={14} />
                <span className="text-xs font-semibold">AI 商业落地诊断</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold mb-4">
                不知道从哪开始？
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-200">
                  让 AI 给你一份专属诊断
                </span>
              </h2>
              <p className="text-sm md:text-base text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
                4 步问卷 · 1 分钟生成 · 极简但深刻的
                <br className="md:hidden" />
                《AI 商业落地诊断报告》Markdown 版
              </p>
              <AIDiagnosisForm
                compact
                open={diagnosisOpen}
                onOpenChange={setDiagnosisOpen}
              />
              <p className="text-xs text-white/60 mt-5">
                ✨ 已有 1280+ 位创业者完成诊断 · 平均节省 30% 试错成本
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 py-8 border-t border-gray-100">
        <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏢</span>
            <span className="font-bold text-gray-900">良朋社 OPC</span>
          </div>
          <p className="text-sm text-gray-400">
            © 2025 良朋社 OPC. 一人公司 × AI 商业操作系统
          </p>
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            返回首页 →
          </Link>
        </div>
      </footer>
    </div>
  )
}
