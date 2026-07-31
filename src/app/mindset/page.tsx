'use client'

import Link from 'next/link'
import ClientLayout from '@/components/ClientLayout'
import {
  Brain,
  Package,
  ShoppingBag,
  Coins,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Quote,
  Rocket,
  Target,
  AlertTriangle,
  XCircle,
  Megaphone,
  Lightbulb,
  Crown,
  ShieldAlert,
  Trophy,
} from 'lucide-react'

/**
 * 🧠 OPC 双引擎智富思维 · 交易型 + 流量型 OPC 心法对照页
 * ------------------------------------------------------------
 * 顶层结构（Bento 2 列布局）：
 *   - Hero：🧠 OPC 双引擎智富思维 + 副标"赚钱的逻辑，用 AI 去验证..."
 *   - 引擎快速切换胶囊（mobile 友好，PC 单行）
 *   - Bento grid grid-cols-1 md:grid-cols-2
 *       左：💰 交易型 OPC（3 大核心卡 + 店群 SOP CTA）
 *       右：📈 流量型 OPC（4 大核心卡 + 自媒体 SOP CTA）
 *   - 终极心法双引擎对比（深色玻璃态）
 *   - 避坑三连（红警示条）
 *   - 底部统一行动号召：两个并排蓝紫渐变按钮 → /diagnosis
 * 转化漏斗：
 *   mindset → /diagnosis（最终让 AI 辅助决定）
 *   左侧 CTA → /market/projects?slug=ai-digital-shop-group
 *   右侧 CTA → /market/projects?recommend=flow （流量型项目推荐聚合页，含 AI图文/AI视频/AI工具/AI跨境）
 * ------------------------------------------------------------
 */

// 交易型 OPC 核心 3 卡（何为数字产品 / 虚拟电商对比 / 3000 元启动）
type CardPoint = { label: string; value: string }
type CardStep = { num: string; title: string; desc: string }

type TraderCard = {
  key: string
  title: string
  subtitle: string
  icon: typeof Package
  accent: string
  iconBg: string
  iconColor: string
  points: ReadonlyArray<CardPoint>
}

type FlowCardPoints = TraderCard & { steps?: never }
type FlowCardSteps = Omit<TraderCard, 'points'> & { steps: ReadonlyArray<CardStep> }
type FlowCard = FlowCardPoints | FlowCardSteps

const TRADER_CARDS: ReadonlyArray<TraderCard> = [
  {
    key: 'T1',
    title: '什么是 AI 数字产品？',
    subtitle: '一份产出 · 重复售卖 · 边际成本 ≈ 0',
    icon: Package,
    accent: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    points: [
      { label: '形态', value: 'AI 提示词包 / 视频教程 / PPT 模板 / 软件工具 / 数字化知识库' },
      { label: '极简优势', value: '无需物流 / 无需发货 / 无需仓储 / 无需退货' },
    ],
  },
  {
    key: 'T2',
    title: '为什么从"虚拟电商"切入？',
    subtitle: '毛利 95% · 3-5 天出单 · 一人多店',
    icon: ShoppingBag,
    accent: 'from-orange-500 to-rose-500',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    points: [
      { label: '实物电商', value: '卖 100 元 → 推广 + 物流 + 退换货（30%-50%）→ 实际到手 50-70 元' },
      { label: '虚拟电商', value: '卖 100 元 → 几乎没有实物成本 → 实际到手 ≈ 95 元' },
      { label: '运营能力', value: 'AI 客服 + 自动核销 + 自动发货 · 一人轻松运营多店' },
    ],
  },
  {
    key: 'T3',
    title: '3000 元启动成本清单',
    subtitle: '0 库存 0 实体 · 资金压力几乎为零',
    icon: Coins,
    accent: 'from-yellow-500 to-amber-600',
    iconBg: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    points: [
      { label: '工具', value: '百度网盘会员 298 元/年 + 自动发货 128 元/年' },
      { label: '平台', value: '网店保证金 2000 元（可退）' },
      { label: '周转', value: '少量周转金（几千块）即可启动第一家 AI 数字网店' },
    ],
  },
  {
    key: 'T4',
    title: '店群经营避坑指南',
    subtitle: '拒绝加盟 · 拒绝空想 · 专注 AI 工具驱动',
    icon: ShieldAlert,
    accent: 'from-amber-500 to-red-600',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-700',
    points: [
      { label: '坑一', value: '拒绝加盟与缴纳分润 · 任何先交钱才能赚钱的承诺都先停一停' },
      { label: '坑二', value: '拒绝空想先行 · 先动手验证（开 1 个店 + 跑通 1 单）' },
      { label: '坑三', value: '专注 AI 工具驱动的高效闭环 · 不做高人力的伪效率项目' },
    ],
  },
]

// 流量型 OPC 核心 4 卡（核心命题 / 核心心法 / 5 步变现 / 避坑）
const FLOW_CARDS: ReadonlyArray<FlowCard> = [
  {
    key: 'F1',
    title: '核心命题',
    subtitle: '不要追爆款 · 追 100 个精准用户',
    icon: Target,
    accent: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    points: [
      { label: '流量真相', value: '100 个精准高净值用户 · 价值远超 10 万泛流量' },
      { label: '变现方向', value: '卖高客单价（1980/5980）才是唯一的出路' },
      { label: '杠杆思维', value: 'AI 是实现"指数级增长"和"做可复制的事"的最佳杠杆' },
    ],
  },
  {
    key: 'F2',
    title: '核心心法',
    subtitle: '别学知识 · 学用 AI · 先写"今天我在干什么"',
    icon: Lightbulb,
    accent: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    points: [
      { label: '行动优先', value: '别纠结"会不会用" · 担心自己"敢不敢马上用"' },
      { label: '过程型内容', value: '不刻意造人设 · 把今天正在做的真实工作写下来' },
      { label: '30 条起势', value: '坚持发 30 条 · 你的定位和产品会自动长出来' },
    ],
  },
  {
    key: 'F3',
    title: '五大变现步骤',
    subtitle: '自用 → 炫技 → 截流 → 群内交付 → 做成产品',
    icon: Rocket,
    accent: 'from-rose-500 to-pink-600',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    steps: [
      { num: '01', title: '自己学自己用', desc: '用 AI 武装自己 · 拿到结果' },
      { num: '02', title: '用一次炫一次', desc: '发朋友圈 / 视频 · 引起围观' },
      { num: '03', title: '别人问立刻截流', desc: '建 AI 交流群 · 零成本建私域' },
      { num: '04', title: '群内低价交付', desc: '边学边卖 9.9 / 19.9 教程' },
      { num: '05', title: '做成 SOP 产品', desc: '卖提示词 / 服务 / 陪跑' },
    ],
  },
  {
    key: 'F4',
    title: '避坑总结',
    subtitle: '拒绝"假努力" · 拒绝"先有产品再行动"',
    icon: ShieldAlert,
    accent: 'from-slate-600 to-slate-800',
    iconBg: 'bg-slate-50',
    iconColor: 'text-slate-700',
    points: [
      { label: '坑一', value: '把"学习"当成"进度"，把"行动"当成"结果"（看了无数课从没发过视频）' },
      { label: '坑二', value: '一上来就卡死在"我得先有产品"' },
      { label: '坑三', value: '长期给别人做号 · 误判自己的能力' },
    ],
  },
]

// 双引擎终极心法
const ENGINE_MANTRA = {
  trader: {
    icon: Coins,
    color: 'from-amber-400 to-orange-500',
    title: '交易型 OPC',
    core: '数字网店',
    desc: '解决"赚到第一笔小钱"的问题。',
  },
  flow: {
    icon: Trophy,
    color: 'from-blue-400 to-violet-500',
    title: '流量型 OPC',
    core: '内容资产',
    desc: '解决"用 AI 撬动精准流量"的问题。',
  },
} as const

export default function MindsetPage() {
  return (
    <ClientLayout>
      <div className="min-h-screen bg-slate-50 pb-24">
      {/* ════════ Hero 区 · 双引擎 ════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-amber-50/40 to-blue-50/40 border-b border-slate-200">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 py-10 md:py-14">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold tracking-widest uppercase text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
              <Brain size={11} />
              OPC 智富思维
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold tracking-widest uppercase text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
              <Sparkles size={11} />
              双引擎
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold tracking-widest uppercase text-violet-700 bg-violet-100 px-2.5 py-1 rounded-full">
              <Crown size={11} />
              创业心法
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            🧠 OPC 双引擎智富思维
          </h1>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-slate-600 leading-relaxed max-w-2xl">
            赚钱的逻辑，用 <strong className="text-amber-700">AI</strong> 去验证。
            <br className="hidden md:block" />
            选择你即将上场的<span className="text-rose-600 font-bold">赛道</span>。
          </p>

          {/* 引擎快速切换胶囊 */}
          <div className="mt-5 -mx-4">
            <div className="flex overflow-x-auto whitespace-nowrap scrollbar-hide gap-2 px-4 pb-2">
              <a
                href="#trader-engine"
                className="flex-shrink-0 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors px-3 py-1.5 rounded-full text-[12px] font-extrabold text-amber-800"
              >
                <Coins size={13} className="text-amber-600" />
                💰 AI 网店群思维（交易型）
              </a>
              <a
                href="#flow-engine"
                className="flex-shrink-0 inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors px-3 py-1.5 rounded-full text-[12px] font-extrabold text-blue-800"
              >
                <Megaphone size={13} className="text-blue-600" />
                📈 AI 自媒体思维（流量型）
              </a>
              <a
                href="#engine-mantra"
                className="flex-shrink-0 inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors px-3 py-1.5 rounded-full text-[12px] font-extrabold text-slate-700"
              >
                <Quote size={12} />
                双引擎终极心法
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ Bento 双列布局 ════════ */}
      <section className="max-w-6xl mx-auto px-4 pt-8 md:pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {/* ─────── 左侧：交易型 OPC ─────── */}
          <div id="trader-engine" className="flex flex-col gap-4 scroll-mt-32">
            {/* 引擎标题 */}
            <div className="flex items-center gap-3 px-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
                <Coins size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-extrabold tracking-widest uppercase text-amber-700">
                  ENGINE 01
                </div>
                <h2 className="text-base md:text-lg font-extrabold text-slate-900 leading-tight">
                  💰 AI 网店群思维（交易型）
                </h2>
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                卖货赚钱
              </span>
            </div>

            {/* 3 张核心卡 */}
            {TRADER_CARDS.map((c) => {
              const Icon = c.icon
              return (
                <article
                  key={c.key}
                  className="bg-white rounded-2xl shadow-sm border border-amber-100/60 hover:shadow-md transition-shadow overflow-hidden"
                >
                  <header className="flex items-start gap-3 p-4 md:p-5 border-b border-slate-100 bg-gradient-to-br from-amber-50/50 to-orange-50/30">
                    <div
                      className={`flex-shrink-0 w-11 h-11 rounded-2xl ${c.iconBg} flex items-center justify-center shadow-sm border border-amber-100/40`}
                    >
                      <Icon size={20} className={c.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`inline-block text-[9px] font-extrabold tracking-widest uppercase text-white bg-gradient-to-r ${c.accent} px-1.5 py-0.5 rounded-md mb-1`}
                      >
                        {c.key}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                        {c.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {c.subtitle}
                      </p>
                    </div>
                  </header>

                  <ul className="p-4 md:p-5 space-y-2.5">
                    {c.points.map((p, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-[12px] md:text-[13px] leading-relaxed"
                      >
                        <div className="flex-shrink-0 mt-1 w-4 h-4 rounded-full bg-amber-50 flex items-center justify-center">
                          <CheckCircle2 size={10} className="text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-extrabold text-slate-900 mr-1.5">
                            {p.label}
                          </span>
                          <span className="text-slate-600">{p.value}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </article>
              )
            })}

            {/* 左侧底部 CTA → 店群 SOP */}
            <Link
              href="/market/projects?slug=ai-digital-shop-group"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-5 py-3 rounded-2xl text-sm font-extrabold shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              💰 前往 AI 数字网店 SOP
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* ─────── 右侧：流量型 OPC ─────── */}
          <div id="flow-engine" className="flex flex-col gap-4 scroll-mt-32">
            <div className="flex items-center gap-3 px-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white shadow-md">
                <Megaphone size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-extrabold tracking-widest uppercase text-blue-700">
                  ENGINE 02
                </div>
                <h2 className="text-base md:text-lg font-extrabold text-slate-900 leading-tight">
                  📈 AI 自媒体思维（流量型）
                </h2>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                卖内容/服务
              </span>
            </div>

            {FLOW_CARDS.map((c) => {
              const Icon = c.icon
              return (
                <article
                  key={c.key}
                  className="bg-white rounded-2xl shadow-sm border border-blue-100/60 hover:shadow-md transition-shadow overflow-hidden"
                >
                  <header className="flex items-start gap-3 p-4 md:p-5 border-b border-slate-100 bg-gradient-to-br from-blue-50/50 to-violet-50/30">
                    <div
                      className={`flex-shrink-0 w-11 h-11 rounded-2xl ${c.iconBg} flex items-center justify-center shadow-sm border border-blue-100/40`}
                    >
                      <Icon size={20} className={c.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`inline-block text-[9px] font-extrabold tracking-widest uppercase text-white bg-gradient-to-r ${c.accent} px-1.5 py-0.5 rounded-md mb-1`}
                      >
                        {c.key}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                        {c.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {c.subtitle}
                      </p>
                    </div>
                  </header>

                  {/* F3 五大变现步骤：自定义编号列表 */}
                  {'steps' in c && c.steps ? (
                    <ol className="p-4 md:p-5 space-y-2">
                      {c.steps.map((s) => (
                        <li
                          key={s.num}
                          className="flex items-start gap-2.5 text-[12px] md:text-[13px] leading-relaxed"
                        >
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                            {s.num}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="font-extrabold text-slate-900 mr-1.5">
                              {s.title}
                            </span>
                            <span className="text-slate-600">· {s.desc}</span>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <ul className="p-4 md:p-5 space-y-2.5">
                      {c.points.map((p, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-[12px] md:text-[13px] leading-relaxed"
                        >
                          <div className="flex-shrink-0 mt-1 w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center">
                            <CheckCircle2 size={10} className="text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-extrabold text-slate-900 mr-1.5">
                              {p.label}
                            </span>
                            <span className="text-slate-600">{p.value}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              )
            })}

            {/* 右侧底部 CTA → 流量型项目推荐（原 ai-self-media-group 已拆为图文/视频两个，CTA 改为流量型推荐聚合页） */}
            <Link
              href="/market/projects?recommend=flow"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white px-5 py-3 rounded-2xl text-sm font-extrabold shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              📈 前往流量型项目推荐（图文 + 视频）
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════ 双引擎终极心法对比 ════════ */}
      <section
        id="engine-mantra"
        className="max-w-6xl mx-auto px-4 pt-10 scroll-mt-32"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-5 md:p-7 shadow-xl">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Quote size={14} className="text-amber-300" />
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-amber-200">
                双引擎终极心法
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-extrabold text-white leading-tight">
              选一个引擎先上道
            </h2>
            <p className="mt-1 text-xs md:text-sm text-amber-100/80">
              两种底层逻辑 · 两条变现路径 · 同一套 AI 工具
            </p>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              {(['trader', 'flow'] as const).map((k) => {
                const m = ENGINE_MANTRA[k]
                const Icon = m.icon
                return (
                  <div
                    key={k}
                    className="relative rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-9 h-9 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center shadow-md`}
                      >
                        <Icon size={16} className="text-white" />
                      </div>
                      <span className="text-[10px] font-extrabold text-amber-200 tracking-wider">
                        {m.title}
                      </span>
                    </div>
                    <div className="text-base font-extrabold text-white mb-1">{m.core}</div>
                    <div className="text-[11px] text-amber-50/80 leading-relaxed">{m.desc}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ════════ 避坑三连（双引擎通用） ════════ */}
      <section className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex items-start gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-4">
          <AlertTriangle size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-extrabold text-rose-900 flex items-center gap-1.5">
              <XCircle size={14} />
              避坑三连 · 双引擎通用
            </h4>
            <ul className="mt-2 space-y-1 text-[12px] text-rose-800/90 leading-relaxed">
              <li>
                · <strong>拒绝"假努力"</strong>：把"学习"当结果，每天发 1 条 · 行动才是进度
              </li>
              <li>
                · <strong>拒绝"先有产品"</strong>：先写"今天我在干什么" · 坚持 30 条，定位自动长出来
              </li>
              <li>
                · <strong>拒绝"加人再开干"</strong>：先小范围验证闭环 · 再放大矩阵（双引擎都适用）
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ════════ 底部统一行动号召（双按钮 → /diagnosis）══════ */}
      <section className="max-w-6xl mx-auto px-4 pt-10">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-900 p-6 md:p-8 shadow-2xl text-center">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-300/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-rose-400/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="inline-flex items-center gap-1 text-[10px] font-extrabold tracking-widest uppercase text-white/90 bg-white/15 backdrop-blur-sm border border-white/20 px-2.5 py-1 rounded-full">
              <Target size={11} />
              READY · 心法已懂
            </div>
            <h3 className="mt-3 text-xl md:text-2xl font-extrabold text-white leading-tight">
              心法已懂 · 请选择你的赛道
            </h3>
            <p className="mt-2 text-xs md:text-sm text-white/80 leading-relaxed max-w-md mx-auto">
              19.9 元开启 AI 智富入局诊断 · 让 AI 帮你做最终决定
            </p>

            <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              {/* 蓝紫渐变按钮 1：交易型 */}
              <Link
                href="/diagnosis"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl text-sm font-extrabold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Coins size={14} />
                我选 AI 网店群，立马实操
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* 蓝紫渐变按钮 2：流量型 */}
              <Link
                href="/diagnosis"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white px-6 py-3 rounded-xl text-sm font-extrabold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Megaphone size={14} />
                我选 AI 自媒体，立马实操
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[10px] text-white/80">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 size={10} />
                15 分钟专家咨询
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 size={10} />
                专属《OPC智富蓝皮书》
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 size={10} />
                免费加入同行社群
              </span>
            </div>
          </div>
        </div>
      </section>
      </div>
    </ClientLayout>
  )
}
