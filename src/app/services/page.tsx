'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Briefcase,
  PenTool,
  ChartNoAxesCombined,
  Shield,
  Sparkles,
  Zap,
  Target,
  Rocket,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Star,
  ArrowRight,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import AIDiagnosisForm from '@/components/AIDiagnosisForm'

// ─── AI 智能体数据 ───
const aiAgents = [
  {
    icon: Briefcase,
    title: 'AI 战略官',
    subtitle: 'Strategist',
    desc: '商业模式诊断',
    tags: ['战略咨询', '流程重构'],
    borderColor: 'border-blue-500',
    buttonColor: 'text-blue-600 hover:bg-blue-50',
    lightBg: 'bg-blue-50',
    lightText: 'text-blue-600',
  },
  {
    icon: PenTool,
    title: 'AI 内容官',
    subtitle: 'Content Creator',
    desc: '7×24 内容产出',
    tags: ['图文写作', '视频生成'],
    borderColor: 'border-purple-500',
    buttonColor: 'text-purple-600 hover:bg-purple-50',
    lightBg: 'bg-purple-50',
    lightText: 'text-purple-600',
  },
  {
    icon: ChartNoAxesCombined,
    title: 'AI 数据官',
    subtitle: 'Data Analyst',
    desc: '全渠道数据看板',
    tags: ['流量分析', 'ROI 追踪'],
    borderColor: 'border-green-500',
    buttonColor: 'text-green-600 hover:bg-green-50',
    lightBg: 'bg-green-50',
    lightText: 'text-green-600',
  },
  {
    icon: Shield,
    title: 'AI 风控官',
    subtitle: 'Risk Manager',
    desc: '合同与财税合规',
    tags: ['合同审核', '财税风控'],
    borderColor: 'border-amber-500',
    buttonColor: 'text-amber-600 hover:bg-amber-50',
    lightBg: 'bg-amber-50',
    lightText: 'text-amber-600',
  },
]

// ─── 陪跑阶段数据 ───
const stages = [
  {
    id: 'stage-1',
    phase: '第一阶段',
    title: '认知与搭建',
    icon: Zap,
    duration: '第 1-2 周',
    items: [
      'AI 工具全家桶认知',
      '账号矩阵搭建',
      'AI 商业模型诊断',
    ],
  },
  {
    id: 'stage-2',
    phase: '第二阶段',
    title: '验证与闭环',
    icon: Target,
    duration: '第 3-8 周',
    items: [
      '单点 AI 工作流跑通',
      '内容发布 SOP 生成',
      '首笔变现闭环验证',
    ],
  },
  {
    id: 'stage-3',
    phase: '第三阶段',
    title: '放大与复制',
    icon: Rocket,
    duration: '第 9-12 周',
    items: [
      '多平台矩阵放大',
      '团队 AI 系统培训',
      '复购与转介绍体系建立',
    ],
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
    title: '前字节跳动增长负责人',
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
    name: '宋老师',
    title: '新消费品牌操盘手',
    avatar: '/mentors/processed/宋老师_face.png',
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
  const [activeStage, setActiveStage] = useState('stage-1')
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
                一人公司 × AI 商业操作系统
              </span>
            </motion.h1>

            <motion.p
              {...fadeUp}
              className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed"
            >
              不招人、不租办公室、不写代码。<br className="hidden md:block" />
              一个人 + AI 智能体矩阵 = 年入百万的一人公司。
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

      {/* ═══ AI 智能体矩阵 ═══ */}
      <section className="px-5 -mt-16 relative z-10">
        <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
          <motion.div
            {...fadeUp}
            className="text-center mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              AI 智能体矩阵
            </h2>
            <p className="text-gray-500">你的 4 位 7×24 小时 AI 员工</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiAgents.map((agent, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ delay: i * 0.1 }}
                className={`group bg-white rounded-2xl border-t-4 ${agent.borderColor} shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${agent.lightBg} flex items-center justify-center`}>
                      <agent.icon className={`${agent.lightText}`} size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-lg">{agent.title}</h3>
                        <span className="text-xs text-gray-400 font-medium tracking-wide">
                          {agent.subtitle}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{agent.desc}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {agent.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`${agent.lightBg} ${agent.lightText} text-xs font-medium px-2.5 py-1 rounded-full`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    className={`w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 border border-gray-200 ${agent.buttonColor} transition-colors`}
                  >
                    <span>一键定制</span>
                    <ChevronRight size={16} />
                  </button>
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


      {/* ═══ AI 赋能陪跑 ═══ */}
      <section className="px-5 py-20">
        <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
          <motion.div
            {...fadeUp}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              AI 赋能陪跑体系
            </h2>
            <p className="text-gray-500">12 周从 0 到 1，搭建你的 AI 商业操作系统</p>
          </motion.div>

          <motion.div {...fadeUp}>
            <Tabs value={activeStage} onValueChange={setActiveStage} className="w-full">
              <TabsList className="w-full justify-center gap-2 bg-transparent mb-8">
                {stages.map((stage) => (
                  <TabsTrigger
                    key={stage.id}
                    value={stage.id}
                    className="flex-1 max-w-[180px] data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border-blue-200 border border-transparent rounded-xl py-4 px-4 flex flex-col items-center gap-1"
                  >
                    <span className="text-xs text-gray-400">{stage.phase}</span>
                    <span className="font-semibold text-sm">{stage.title}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {stages.map((stage) => (
                <TabsContent key={stage.id} value={stage.id} className="mt-0">
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <stage.icon className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{stage.title}</h3>
                        <p className="text-sm text-blue-600 font-medium">{stage.duration}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {stage.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl"
                        >
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle2 size={14} className="text-green-600" />
                          </div>
                          <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
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
                从"工具库推荐"到"项目库 SOP"，再到"服务库高客单成交"，全程拆解一人公司和中小企业的 AI 商业变现全流程。
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
                <div className={`h-44 ${mentor.bg} flex items-end justify-center relative overflow-hidden`}>
                  {/* 真实导师头像：使用预处理的 4:3 横图，脸部位于图片中心，object-cover 完整露出 */}
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="absolute inset-0 w-full h-full object-cover"
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
