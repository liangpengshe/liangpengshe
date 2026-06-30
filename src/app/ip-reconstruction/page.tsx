'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Sparkles,
  Crown,
  Target,
  ShieldCheck,
  FileText,
  Package,
  Handshake,
  UserCog,
  Cpu,
  Megaphone,
  Mail,
  Headphones,
  Search,
  DollarSign,
  Rocket,
  ClipboardList,
  Mic,
  CheckCircle2,
  Award,
  TrendingUp,
} from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5 },
}

// ─── 5 大核心重构模块 ───
const coreModules = [
  {
    no: '01',
    title: '定位重构',
    desc: 'AI 帮你重新定位人群、价格带和差异化卖点，从"什么都能做"变成"只服务这类人"。',
    icon: Target,
    color: 'from-blue-500 to-cyan-500',
    bg: 'from-blue-50 to-cyan-50',
    border: 'border-blue-200',
    emoji: '🎯',
  },
  {
    no: '02',
    title: '信任重构',
    desc: '用 AI 知识库 + 直播连麦，3 分钟建立"专家级"信任，告别低价内卷。',
    icon: ShieldCheck,
    color: 'from-emerald-500 to-teal-500',
    bg: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-200',
    emoji: '🛡️',
  },
  {
    no: '03',
    title: '内容重构',
    desc: 'AI 智能体矩阵批量生成爆款内容，1 个人 = 1 个内容工厂，矩阵起号 10 倍速。',
    icon: FileText,
    color: 'from-pink-500 to-rose-500',
    bg: 'from-pink-50 to-rose-50',
    border: 'border-pink-200',
    emoji: '📝',
  },
  {
    no: '04',
    title: '产品重构',
    desc: '从 199 元引流课 → 980 元标准课 → 3 万元系统课，AI 帮你搭好阶梯式产品矩阵。',
    icon: Package,
    color: 'from-amber-500 to-orange-500',
    bg: 'from-amber-50 to-orange-50',
    border: 'border-amber-200',
    emoji: '📦',
  },
  {
    no: '05',
    title: '成交重构',
    desc: 'AI 私域 + 直播 + 1V1 教练三件套，从流量到成交全链路打通，转化率提升 3 倍。',
    icon: Handshake,
    color: 'from-violet-500 to-purple-500',
    bg: 'from-violet-50 to-purple-50',
    border: 'border-violet-200',
    emoji: '🤝',
  },
]

// ─── 9 个 AI 智能体团队（与服务库保持一致）───
const aiAgents = [
  { icon: UserCog,    name: 'CEO 智能体',    desc: '战略决策 + 业务规划',  color: 'from-blue-500 to-indigo-500' },
  { icon: Cpu,        name: '技术智能体',    desc: 'AI 工作流 + 自动化部署', color: 'from-cyan-500 to-blue-500' },
  { icon: Megaphone,  name: '营销智能体',    desc: '内容生成 + 投流优化',   color: 'from-pink-500 to-rose-500' },
  { icon: Mail,       name: '邮件智能体',    desc: 'EDM + 私域触达',        color: 'from-amber-500 to-orange-500' },
  { icon: Headphones, name: '客服智能体',    desc: '7x24 自动应答',         color: 'from-emerald-500 to-teal-500' },
  { icon: Search,     name: '研究智能体',    desc: '行业调研 + 竞品分析',   color: 'from-violet-500 to-purple-500' },
  { icon: Target,     name: '广告智能体',    desc: '多平台投放 + ROI 优化', color: 'from-red-500 to-rose-500' },
  { icon: DollarSign, name: '财务智能体',    desc: '成本核算 + 分润计算',   color: 'from-green-500 to-emerald-500' },
  { icon: Rocket,     name: '执行智能体',    desc: '任务拆解 + 自动跟进',   color: 'from-orange-500 to-amber-500' },
]

// ─── 4 步法流程 ───
const fourSteps = [
  { step: '01', title: '诊断表生成',  desc: 'AI 1 分钟生成精准诊断表', icon: ClipboardList, color: 'from-blue-500 to-cyan-500' },
  { step: '02', title: '直播连麦',    desc: 'AI 实时生成解决方案',      icon: Mic,           color: 'from-violet-500 to-purple-500' },
  { step: '03', title: '1000 元方案', desc: '几十页执行案 AI 辅助生成',  icon: FileText,      color: 'from-amber-500 to-orange-500' },
  { step: '04', title: '3 万元系统', desc: '全套 IP 重构 + 合伙人权益', icon: Crown,         color: 'from-emerald-500 to-teal-500' },
]

export default function IPReconstructionPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ═══ Hero 区 ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pt-12 pb-20 px-5">
        {/* 装饰光晕 */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-32 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-t from-slate-900 to-transparent" />

        <div className="relative max-w-lg mx-auto md:max-w-5xl md:mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/15 via-yellow-400/15 to-amber-500/15 backdrop-blur-md border border-amber-400/40 rounded-full px-4 py-1.5 mb-6"
          >
            <Sparkles size={14} className="text-amber-300" />
            <span className="text-sm text-amber-100 font-semibold tracking-wide">
              良朋社 IP 重构系统 · 官方独立页
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4"
          >
            <span className="text-white">良朋社 ·</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400">
              商业 IP 系统重构
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl mx-auto"
          >
            AI 时代，每个人的商业 IP 都需要系统化升级。
            <br className="hidden md:block" />
            4 步法 + 9 个 AI Agent + 1V1 陪跑，让你的 IP 跑通变现闭环。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <button
              onClick={() => { window.location.href = '/booking?p=diagnose-1000' }}
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3.5 px-7 rounded-xl shadow-2xl shadow-amber-500/30 hover:scale-105 transition-all"
            >
              <Award size={18} />
              预约 1V1 IP 诊断
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold py-3.5 px-7 rounded-xl hover:bg-white/15 transition-all"
            >
              <TrendingUp size={18} />
              查看 4 步法完整服务
            </Link>
          </motion.div>

          {/* 数据小条 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 grid grid-cols-3 gap-3 max-w-md mx-auto"
          >
            {[
              { v: '9', l: 'AI 智能体' },
              { v: '4', l: '步法流程' },
              { v: '100+', l: '重构案例' },
            ].map((s) => (
              <div key={s.l} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-3">
                <div className="text-2xl md:text-3xl font-extrabold text-amber-300">{s.v}</div>
                <div className="text-[11px] text-white/70 mt-0.5">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ 5 大核心重构模块（2x2+1）═══ */}
      <section className="px-5 py-20 bg-white">
        <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-50 rounded-full mb-3">
              🎯 5 大核心重构
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              商业 IP 的 5 个重构维度
            </h2>
            <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto">
              从定位到成交，每一步都配备 AI 智能体和标准化 SOP。
            </p>
          </motion.div>

          {/* 桌面端：3+2 布局（前 4 个 2x2，第 5 个独占一行居中） */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coreModules.slice(0, 4).map((m) => (
              <motion.div
                key={m.no}
                {...fadeUp}
                className={`group relative bg-gradient-to-br ${m.bg} border ${m.border} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all overflow-hidden`}
              >
                <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${m.color} opacity-10 rounded-full blur-2xl`} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center text-2xl shadow-md`}>
                      {m.emoji}
                    </div>
                    <div className={`text-[10px] font-bold tracking-wider bg-gradient-to-r ${m.color} bg-clip-text text-transparent`}>
                      STEP {m.no}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2">
                    {m.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 第 5 个模块：成交重构（单独卡片，居中） */}
          <motion.div
            {...fadeUp}
            className={`group relative mt-4 bg-gradient-to-r ${coreModules[4].color} rounded-2xl p-6 shadow-xl text-white overflow-hidden`}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/15 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-400/20 rounded-full blur-2xl" />
            <div className="relative flex items-center gap-5">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl shadow-md">
                {coreModules[4].emoji}
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold tracking-wider text-white/80 mb-1">
                  STEP {coreModules[4].no} · 终极闭环
                </div>
                <h3 className="font-bold text-xl leading-tight mb-1.5">
                  {coreModules[4].title}
                </h3>
                <p className="text-sm text-white/90 leading-relaxed">
                  {coreModules[4].desc}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ 9 个 AI 智能体矩阵 ═══ */}
      <section className="px-5 py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-500 rounded-full mb-3">
              🦾 9 个 AI Agent 团队
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              良朋社 AI 智能体矩阵
            </h2>
            <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto">
              9 个 AI Agent 全部接入 OPC 业务，复制到你的 IP，效率提升 10 倍。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {aiAgents.map((agent) => (
              <motion.div
                key={agent.name}
                {...fadeUp}
                className="group relative bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all overflow-hidden"
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

      {/* ═══ 4 步法流程（横排时间线）═══ */}
      <section className="px-5 py-20 bg-white">
        <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-rose-500 rounded-full mb-3">
              ⚡️ 4 步变现 SOP
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              从诊断到 3 万元系统 · 标准化交付
            </h2>
            <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto">
              良朋社 AI 商业实验室 · 4 步法完整跑通
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
            {fourSteps.map((s, idx) => (
              <motion.div
                key={s.step}
                {...fadeUp}
                className="relative bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
              >
                {/* 连接线（桌面端） */}
                {idx < fourSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-slate-200" />
                )}
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-md mb-3`}>
                  <s.icon size={20} />
                </div>
                <div className={`text-[10px] font-bold tracking-wider bg-gradient-to-r ${s.color} bg-clip-text text-transparent mb-1`}>
                  STEP {s.step}
                </div>
                <h3 className="font-bold text-gray-900 text-sm md:text-base leading-tight mb-1">
                  {s.title}
                </h3>
                <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 真实成果数据 ═══ */}
      <section className="px-5 py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-lg mx-auto md:max-w-5xl md:mx-auto">
          <motion.div
            {...fadeUp}
            className="relative bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 rounded-2xl p-6 md:p-8 shadow-2xl overflow-hidden text-white"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl" />
            <div className="relative text-center">
              <div className="text-[11px] font-bold text-amber-300 tracking-wider mb-2">
                🏆 良朋社 IP 重构 · 真实成果
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                100+ 真实主理人 · 90 天跑通变现
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { v: '100+', l: '重构主理人' },
                  { v: '¥30,000', l: '客单价' },
                  { v: '90 天', l: '平均周期' },
                  { v: '85%', l: '完课率' },
                ].map((s) => (
                  <div key={s.l} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl py-4">
                    <div className="text-2xl md:text-3xl font-extrabold text-amber-300">{s.v}</div>
                    <div className="text-[11px] text-white/70 mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ 底部 CTA ═══ */}
      <section className="px-5 py-20 bg-white">
        <div className="max-w-lg mx-auto md:max-w-3xl md:mx-auto">
          <motion.div
            {...fadeUp}
            className="text-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 border-2 border-amber-200 rounded-2xl p-8 md:p-10 shadow-lg"
          >
            <div className="text-4xl mb-3">🎯</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              预约良朋社 1V1 IP 诊断
            </h2>
            <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-6 max-w-lg mx-auto">
              仅需 1000 元，AI 生成几十页商业执行方案 + 1V1 视频解读 30 分钟，帮你锁定变现路径。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => { window.location.href = '/booking?p=diagnose-1000' }}
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3.5 px-7 rounded-xl shadow-xl hover:scale-105 transition-all"
              >
                <Sparkles size={18} />
                立即预约 ¥1,000 诊断
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => { window.location.href = '/booking?p=course-30000' }}
                className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3.5 px-7 rounded-xl hover:bg-slate-800 transition-all"
              >
                <Crown size={18} />
                升级 3 万元系统课
              </button>
            </div>
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>信息加密</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>1 小时内回电</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>不满意全额退款</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
