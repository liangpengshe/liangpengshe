'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
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
  ShieldCheck,
  FileText,
  Package,
  Handshake,
  Briefcase,
  Award,
  Bot,
  Globe,
  MessageCircle,
  HeartHandshake,
  GraduationCap,
  Building,
  ClipboardList,
  Mic,
  Crown,
  ChevronRight,
  Building2,
  Wallet,
  Wrench,
  Link2,
  type LucideIcon,
} from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5 },
}

// ═══════════════════════════════════════════════════════════
// 模块一：数据大盘
// ═══════════════════════════════════════════════════════════
const heroStats: { icon: LucideIcon; value: string; label: string; gold?: boolean }[] = [
  { icon: Coins,     value: '¥210 万+', label: '累计交易额', gold: true },
  { icon: Users,     value: '300+',    label: '活跃主理人' },
  { icon: MapPin,    value: '5 城',    label: '覆盖城市' },
  { icon: Cpu,       value: '9 个',    label: 'AI 智能体' },
]

// ═══════════════════════════════════════════════════════════
// 模块二：9 个 AI 智能体团队（与全站保持一致）
// ═══════════════════════════════════════════════════════════
const aiAgents: { icon: LucideIcon; name: string; desc: string; color: string }[] = [
  { icon: UserCog,    name: 'CEO 智能体',    desc: '战略决策 + 业务规划',     color: 'from-blue-500 to-indigo-500' },
  { icon: Cpu,        name: '技术智能体',    desc: 'AI 工作流 + 自动化部署',  color: 'from-cyan-500 to-blue-500' },
  { icon: Megaphone,  name: '营销智能体',    desc: '内容生成 + 投流优化',     color: 'from-pink-500 to-rose-500' },
  { icon: Mail,       name: '邮件智能体',    desc: 'EDM + 私域触达',          color: 'from-amber-500 to-orange-500' },
  { icon: Headphones, name: '客服智能体',    desc: '7×24 自动应答',           color: 'from-emerald-500 to-teal-500' },
  { icon: Search,     name: '研究智能体',    desc: '行业调研 + 竞品分析',     color: 'from-violet-500 to-purple-500' },
  { icon: Target,     name: '广告智能体',    desc: '多平台投放 + ROI 优化',   color: 'from-red-500 to-rose-500' },
  { icon: DollarSign, name: '财务智能体',    desc: '成本核算 + 分润计算',     color: 'from-green-500 to-emerald-500' },
  { icon: Rocket,     name: '执行智能体',    desc: '任务拆解 + 自动跟进',     color: 'from-orange-500 to-amber-500' },
]

// ═══════════════════════════════════════════════════════════
// 模块三：5 大重构引擎（与全站保持一致）
// ═══════════════════════════════════════════════════════════
const engines: { no: string; title: string; desc: string; icon: LucideIcon; color: string; emoji: string }[] = [
  { no: '01', title: '定位重构',  desc: '锁定人群、价格带、差异化卖点，从"什么都能做"变成"只服务这类人"。',  icon: Target,      color: 'from-blue-500 to-cyan-500',     emoji: '🎯' },
  { no: '02', title: '信任重构',  desc: 'AI 知识库 + 直播连麦，3 分钟建立"专家级"信任，告别低价内卷。',         icon: ShieldCheck, color: 'from-emerald-500 to-teal-500',  emoji: '🛡️' },
  { no: '03', title: '内容重构',  desc: 'AI 智能体矩阵批量生成爆款，1 个人 = 1 个内容工厂，矩阵起号 10 倍速。',   icon: FileText,    color: 'from-pink-500 to-rose-500',     emoji: '📝' },
  { no: '04', title: '产品重构',  desc: '199 引流课 → 980 标准课 → 3 万系统课，AI 搭好阶梯式产品矩阵。',         icon: Package,     color: 'from-amber-500 to-orange-500',  emoji: '📦' },
  { no: '05', title: '成交重构',  desc: 'AI 私域 + 直播 + 1V1 教练三件套，从流量到成交全链路打通，提效 3 倍。',    icon: Handshake,   color: 'from-violet-500 to-purple-500', emoji: '🤝' },
]

// ═══════════════════════════════════════════════════════════
// 模块四：4 步变现路径
// ═══════════════════════════════════════════════════════════
const fourSteps: { step: string; title: string; desc: string; price: string; icon: LucideIcon; color: string }[] = [
  { step: '01', title: 'AI 诊断表',   desc: 'AI 1 分钟生成精准诊断表', price: '免费',   icon: ClipboardList, color: 'from-blue-500 to-cyan-500' },
  { step: '02', title: '直播连麦',     desc: 'AI 实时生成解决方案',     price: '免费',   icon: Mic,           color: 'from-violet-500 to-purple-500' },
  { step: '03', title: '1000 元方案',  desc: '几十页执行案 AI 辅助',    price: '¥1,000', icon: FileText,      color: 'from-amber-500 to-orange-500' },
  { step: '04', title: '3 万元系统',   desc: '全套 IP 重构 + 合伙人',   price: '¥30,000', icon: Crown,         color: 'from-emerald-500 to-teal-500' },
]

// ═══════════════════════════════════════════════════════════
// 模块五：四根支柱（深色沙盘版）
// ═══════════════════════════════════════════════════════════
const revenuePillars: {
  icon: LucideIcon
  emoji: string
  title: string
  desc: string
  highlight: string
  color: string
  href: string
}[] = [
  {
    icon: Wallet,
    emoji: '💰',
    title: 'C 端会员订阅',
    desc: '99 元 / 199 元 / 1980 元三级会员体系，锁定高净值用户长期复购。',
    highlight: '99 / 199 / 1980 元',
    color: 'from-amber-400 to-orange-500',
    href: '/pricing',
  },
  {
    icon: Link2,
    emoji: '🔗',
    title: 'B 端交易撮合',
    desc: '项目库、服务库成交订单，平台按比例分润，规模化复制。',
    highlight: '按单分润',
    color: 'from-blue-400 to-indigo-500',
    href: '/projects',
  },
  {
    icon: MapPin,
    emoji: '🏙️',
    title: '分站加盟年费',
    desc: '城市主理人缴纳年度系统与品牌授权费，构建本地化护城河。',
    highlight: '年付制',
    color: 'from-emerald-400 to-teal-500',
    href: '/partner',
  },
  {
    icon: Wrench,
    emoji: '🛠️',
    title: '自研工具 SaaS',
    desc: '豹纹工坊、灵犀 AI 等工具提供月度/年度订阅收入，毛利极高。',
    highlight: '月 / 年订阅',
    color: 'from-violet-400 to-fuchsia-500',
    href: '/tools',
  },
]

// ═══════════════════════════════════════════════════════════
// 模块六：三方分润
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
    icon: Handshake,
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

// ═══════════════════════════════════════════════════════════
// 模块六：9 个实战案例（与项目库保持一致）
// ═══════════════════════════════════════════════════════════
interface PitchCase {
  id: string
  title: string
  alias: string
  tag: string
  result: string
  icon: LucideIcon
  color: string
}

const pitchCases: PitchCase[] = [
  { id: 'c1', title: '从程序员到 AI 数字人操盘手',       alias: '小陈',     tag: '定位重构', result: '月 GMV 85 万 / 净利 23 万',     icon: Bot,             color: 'from-blue-500 to-cyan-500' },
  { id: 'c2', title: '三线城市教培老板，AI 出海跨境',     alias: '王姐',     tag: '赛道重构', result: '月销售 $28,000 / 复购 34%',     icon: Globe,           color: 'from-purple-500 to-pink-500' },
  { id: 'c3', title: '国企 HR 转型 AI 私域主理人',         alias: 'Lily',     tag: '信任重构', result: '月成交 92 单 / 客单 ¥630',       icon: MessageCircle,   color: 'from-rose-500 to-orange-500' },
  { id: 'c4', title: '从疗愈大师到高客单商业导师',         alias: '清一老师', tag: '定位重构', result: '客单 ¥199 → ¥30,000+',          icon: Sparkles,        color: 'from-violet-500 to-fuchsia-500' },
  { id: 'c5', title: '亲子数字心理教练 IP 重构',           alias: '晓燕老师', tag: '产品重构', result: '月成交 120+ 单 / 复购 52%',      icon: HeartHandshake,  color: 'from-pink-500 to-rose-500' },
  { id: 'c6', title: '私域 AI 成交教练 · 母婴赛道',        alias: '丹丹老师', tag: '内容重构', result: '月成交 ¥28 万 / AI 替 3 人',     icon: Users,           color: 'from-amber-500 to-orange-500' },
  { id: 'c7', title: '前大厂工程师 → AI 商业 IP 讲师',     alias: 'Leo 老师', tag: '内容重构', result: '半年营收 200 万+ / 学员 800+',   icon: GraduationCap,   color: 'from-indigo-500 to-blue-500' },
  { id: 'c8', title: '实体店老板 → AI 招商操盘手',         alias: '陈总',     tag: '成交重构', result: '月签 12 城 / 单笔 5 万+',        icon: Building,        color: 'from-emerald-500 to-teal-500' },
  { id: 'c9', title: '营养师 → 高客单健康 IP 操盘手',      alias: 'Anna 老师',tag: '信任重构', result: '半年营收 150 万 / 私域 5000+',   icon: HeartHandshake,  color: 'from-rose-500 to-pink-500' },
]

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white font-sans">
      {/* ═══ HERO 区 ═══ */}
      <section className="relative overflow-hidden pt-20 pb-16 px-5">
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
              良朋社 OPC 商业操作系统 · 可视化沙盘
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 text-white"
          >
            看懂<span className="text-amber-400">良朋社 OPC</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400">
              商业操作系统
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-lg text-slate-300 leading-relaxed mb-10 max-w-2xl mx-auto"
          >
            一座云端的 AI 商业商场，<span className="text-amber-300 font-semibold">5 城 + 300 主理人 + 9 AI Agent</span>，
            正在真实运转的商业生态全景。
          </motion.p>

          {/* ═══ 模块一：数据大盘（玻璃拟态 4 卡）═══ */}
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

      {/* ═══ 模块二：🧠 9 个 AI 智能体团队 ═══ */}
      <section className="px-5 py-20">
        <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-violet-200 bg-violet-500/20 border border-violet-400/30 rounded-full mb-3">
              🧠 AI Agent 矩阵
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              9 个 AI 智能体，<span className="text-amber-400">为你打工</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
              每一个 Agent 都在 OPC 真实业务里跑通过，复制到你的 IP，效率提升 10 倍。
            </p>
          </motion.div>

          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {aiAgents.map((a) => (
              <motion.div
                key={a.name}
                {...fadeUp}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 md:p-4 text-center hover:bg-white/10 hover:border-amber-400/40 transition-all"
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 mx-auto rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center text-white shadow-md mb-2`}>
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

      {/* ═══ 模块三：⚡️ 5 大重构引擎 ═══ */}
      <section className="px-5 py-20 bg-slate-900/40">
        <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-amber-200 bg-amber-500/20 border border-amber-400/30 rounded-full mb-3">
              ⚡️ 5 大重构引擎
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              良朋社 IP 系统重构 · <span className="text-amber-400">5 大引擎</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
              从定位到成交，每一步都配备 AI 智能体和标准化 SOP。
            </p>
          </motion.div>

          {/* 桌面端：前 4 个 2x2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {engines.slice(0, 4).map((e) => (
              <motion.div
                key={e.no}
                {...fadeUp}
                className="group relative bg-white/10 rounded-2xl p-4 md:p-5 border border-white/10 hover:border-amber-400/40 hover:bg-white/15 transition-all overflow-hidden"
              >
                <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${e.color} opacity-20 rounded-full blur-2xl`} />
                <div className="relative flex items-start gap-3">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${e.color} flex items-center justify-center text-2xl shadow-md`}>
                    {e.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white text-base leading-tight">{e.title}</h3>
                      <span className={`text-[10px] font-bold tracking-wider bg-gradient-to-r ${e.color} bg-clip-text text-transparent`}>
                        STEP {e.no}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed">{e.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 第 5 个：跨两列的"终极闭环"卡 */}
          <motion.div
            {...fadeUp}
            className={`group relative mt-4 bg-gradient-to-r ${engines[4].color} rounded-2xl p-5 md:p-6 shadow-xl text-white overflow-hidden md:col-span-2`}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/15 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-400/20 rounded-full blur-2xl" />
            <div className="relative flex items-center gap-5">
              <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl shadow-md">
                {engines[4].emoji}
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold tracking-wider text-white/80 mb-1">
                  STEP {engines[4].no} · 终极闭环
                </div>
                <h3 className="font-bold text-lg md:text-xl leading-tight mb-1.5">{engines[4].title}</h3>
                <p className="text-xs md:text-sm text-white/90 leading-relaxed">{engines[4].desc}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ 模块四：🚀 4 步 AI 变现闭环 ═══ */}
      <section className="px-5 py-20">
        <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-orange-200 bg-orange-500/20 border border-orange-400/30 rounded-full mb-3">
              🚀 4 步变现闭环
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              从诊断到 3 万系统 · <span className="text-amber-400">标准化交付</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
              良朋社 AI 商业实验室 · 4 步法完整跑通
            </p>
          </motion.div>

          {/* 移动端：纵向；桌面端：横向 Flex + 箭头 */}
          <div className="flex flex-col md:flex-row md:items-stretch gap-3">
            {fourSteps.map((s, idx) => (
              <motion.div
                key={s.step}
                {...fadeUp}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="relative flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-5 hover:bg-white/10 transition-all"
              >
                {/* 桌面端连接箭头（不是最后一张） */}
                {idx < fourSteps.length - 1 && (
                  <>
                    {/* 横向箭头（桌面） */}
                    <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-400 items-center justify-center text-slate-900 z-10 shadow-lg shadow-amber-500/40">
                      <ChevronRight size={14} />
                    </div>
                    {/* 纵向箭头（移动） */}
                    <div className="md:hidden absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-slate-900 z-10 rotate-90 shadow-lg shadow-amber-500/40">
                      <ChevronRight size={14} />
                    </div>
                  </>
                )}

                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-md mb-3`}>
                  <s.icon size={20} />
                </div>
                <div className={`text-[10px] font-bold tracking-wider bg-gradient-to-r ${s.color} bg-clip-text text-transparent mb-1`}>
                  STEP {s.step}
                </div>
                <h3 className="font-bold text-white text-sm md:text-base leading-tight mb-1">{s.title}</h3>
                <p className="text-[11px] md:text-xs text-slate-400 leading-relaxed mb-2">{s.desc}</p>
                <div className="inline-block text-[10px] font-bold px-2 py-0.5 bg-amber-400/15 text-amber-300 border border-amber-400/30 rounded-full">
                  {s.price}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 模块四·五：💰 四根支柱，构成健康的现金流（深色玻璃态）═══ */}
      <section className="px-5 py-20 bg-slate-900/40">
        <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-amber-200 bg-amber-500/20 border border-amber-400/30 rounded-full mb-3">
              💰 四根支柱
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              四根支柱，<span className="text-amber-400">构成健康的现金流</span>
            </h2>
            <p className="text-slate-300 text-sm md:text-base">
              稳定的收入来源，多线并行，让平台抗周期、抗风险。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {revenuePillars.map((r, i) => (
              <Link
                key={r.title}
                href={r.href}
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 rounded-2xl"
              >
                <motion.div
                  {...fadeUp}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-5 hover:bg-white/10 hover:border-amber-400/40 transition-all overflow-hidden cursor-pointer"
                >
                  <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${r.color} opacity-20 rounded-full blur-2xl`} />
                  <div className="relative flex items-start gap-3">
                    <div className={`flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center text-xl shadow-md`}>
                      <span>{r.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-base md:text-lg leading-tight mb-1.5">
                        {r.title}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-400 leading-relaxed mb-2">
                        {r.desc}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <div className="inline-block text-[11px] font-bold px-2 py-0.5 bg-amber-400/15 text-amber-300 border border-amber-400/30 rounded-full">
                          {r.highlight}
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300/80 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                          立即查看
                          <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 模块五：💰 三方盈利分润 ═══ */}
      <section className="px-5 py-20 bg-slate-900/40">
        <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-emerald-200 bg-emerald-500/20 border border-emerald-400/30 rounded-full mb-3">
              💰 收益模型
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              稳定的收益模型，<span className="text-amber-400">三方共赢</span>
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
                <div className={`absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br ${p.color} opacity-20 rounded-full blur-3xl`} />

                <div className="relative">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-2xl shadow-md`}>
                      {p.emoji}
                    </div>
                    <div>
                      <div className="font-bold text-white text-base leading-tight">{p.role}</div>
                      <div className="text-[11px] text-slate-400 leading-tight">{p.subtitle}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    <span className="font-semibold text-amber-300">路径：</span>
                    {p.path}
                  </p>

                  <div className={`bg-gradient-to-r ${p.color} rounded-xl px-4 py-3 flex items-center justify-between shadow-md`}>
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

      {/* ═══ 模块六：🏆 9 个实战案例 ═══ */}
      <section className="px-5 py-20">
        <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-rose-200 bg-rose-500/20 border border-rose-400/30 rounded-full mb-3">
              🏆 100 个 IP 重构计划
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              标杆案例 · <span className="text-amber-400">9 个真实主理人</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
              来自不同行业、不同背景的 IP，在 4 步法 + 9 Agent 的加持下完成系统重构。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {pitchCases.map((c) => (
              <motion.div
                key={c.id}
                {...fadeUp}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-amber-400/40 hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden"
              >
                <div className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${c.color} opacity-20 rounded-full blur-2xl`} />

                <div className="relative">
                  <div className="flex items-start justify-between mb-2">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white shadow-md`}>
                      <c.icon size={18} />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-white/10 text-slate-200 border border-white/20 rounded-full">
                      {c.tag}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm leading-tight mb-1 line-clamp-2 min-h-[2.5rem]">
                    {c.title}
                  </h3>
                  <div className="text-[11px] text-slate-400 mb-2">化名：{c.alias}</div>

                  <div className="text-xs text-amber-300 font-semibold leading-relaxed">
                    → {c.result}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 模块七：真实成果（深圳总部样板）═══ */}
      <section className="px-5 py-16 bg-slate-900/40">
        <div className="max-w-lg mx-auto md:max-w-5xl md:mx-auto">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white rounded-3xl p-6 md:p-8 shadow-2xl border border-white/10"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-500/30 rounded-full blur-3xl" />
            <div className="absolute top-4 right-4 text-xs text-amber-300/80 font-medium tracking-widest">
              SHENZHEN
            </div>

            <div className="relative">
              <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                <span>📍 深圳总部</span>
              </div>

              <h2 className="text-xl md:text-3xl font-bold leading-tight mb-2 text-white">
                深圳总部已跑通，
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                  不只是构想。
                </span>
              </h2>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-6">
                这套模式不是在 PPT 上，而是在深圳讯美广场真实运转着。
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { v: '70+', l: '赋能企业', icon: Building2 },
                  { v: '5', l: '举办沙龙', icon: MapPin },
                  { v: '¥2.8亿', l: '学员变现', icon: TrendingUp },
                  { v: '90 天', l: '平均重构周期', icon: Sparkles },
                ].map((s) => (
                  <div key={s.l} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
                    <s.icon size={16} className="text-amber-300 mx-auto mb-1.5" />
                    <div className="text-2xl md:text-3xl font-extrabold text-amber-300 leading-tight">
                      {s.v}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ 模块八：底部 CTA ═══ */}
      <section className="px-5 py-20">
        <div className="max-w-lg mx-auto md:max-w-3xl md:mx-auto">
          <motion.div
            {...fadeUp}
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 md:p-8 rounded-2xl text-center shadow-2xl shadow-orange-500/30"
          >
            <div className="text-3xl md:text-4xl mb-2">🎯</div>
            <h2 className="text-xl md:text-3xl font-extrabold text-white leading-tight mb-2">
              看懂系统，加入我们，
              <br className="md:hidden" />
              成为城市主理人。
            </h2>
            <p className="text-sm md:text-base text-amber-50 leading-relaxed mb-6 max-w-xl mx-auto">
              良朋社 OPC · 招募 5 城合伙人，复制深圳已跑通的整套商业操作系统。
            </p>

            <Link
              href="/partner"
              className="group inline-flex w-full md:w-auto items-center justify-center gap-2 bg-white text-orange-600 font-bold px-6 py-3.5 md:py-4 rounded-xl text-base shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Award size={18} />
              立即了解合伙人权益
              <ArrowRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>

            <div className="mt-5 text-xs text-amber-50/90">
              已有 <span className="font-bold text-white">300+</span> 位主理人
              在 <span className="font-bold text-white">5 座城市</span> 运营中
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
