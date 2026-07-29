'use client'

/**
 * DiagnosisReport · 报告展示 + 付费拦截 + 行动指令（report 阶段）
 * ------------------------------------------------------------
 * 任务：拆 diagnosis/page.tsx（演进项 3.5）
 * 职责：渲染第三阶段（report 阶段）的全部内容：
 *       1) 免费 20%：综合评分 + 四层阶梯定位 + 3 条核心建议
 *       2) 付费拦截 80%：LockedSection 列表 + 锁定遮罩 + 支付按钮
 *       3) 解锁后内容：4 大板块（角色/武器/路线/智能体）
 *       4) 15 分钟 1V1 咨询卡
 *       5) OPC 社群二维码入口
 *       6) 专属行动指令（TRADER/FLOW 专属跳转）
 *
 * 父组件仅需透传 3 个回调（handlePay / setBookingOpen / 与 mockReport 引用）。
 * ------------------------------------------------------------
 */
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Brain,
  CalendarDays,
  ListChecks,
  Loader2,
  Lock,
  Settings2,
  Unlock,
  Zap,
  ArrowRight,
} from 'lucide-react'
import type { SelectedPath } from '../_data/pathComparisons'
import type { LayerKey, LayerProfile } from '../_data/layerProfiles'

// ─── 数据结构（与 page.tsx 中 mockReport 保持兼容）──────────────────────

export interface DiagnosisReportData {
  score: number
  freeContent: {
    layer: LayerKey
    layerLabel: string
    summary: string
    suggestions: string[]
  }
  lockedContent: {
    role: {
      title: string
      bestLayer: string
      reason: string
      transitionPath: string
    }
    weapons: {
      title: string
      tools: string[]
      projects: string[]
      service: string
      resource: string
    }
    roadmap: {
      title: string
      week1: string[]
      week2: string[]
      week3: string[]
    }
    agents: {
      title: string
      items: { name: string; use: string }[]
    }
  }
}

interface DiagnosisReportProps {
  report: DiagnosisReportData
  layerProfiles: Record<LayerKey, LayerProfile>
  paid: boolean
  paying: boolean
  selectedPath: SelectedPath | null
  onPay: () => void
  onOpenBooking: () => void
}

// ─── 辅助小组件 ────────────────────────────────────────────────

function LockedSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-1.5 text-[11px] font-bold mb-1.5">
        {icon}
        <span className="text-white/70">{title}</span>
      </div>
      {children}
    </div>
  )
}

function BulletLine({
  label,
  items,
  single,
}: {
  label: string
  items: string[]
  single?: boolean
}) {
  return (
    <div>
      <div className="text-[10px] font-bold text-white/60 mb-0.5">{label}</div>
      <ul className="space-y-0.5">
        {items.map((it, i) => (
          <li key={i} className="text-xs text-white/85">
            • {it}
          </li>
        ))}
      </ul>
    </div>
  )
}

function RoadmapWeek({
  week,
  color,
  items,
}: {
  week: string
  color: 'emerald' | 'blue' | 'violet'
  items: string[]
}) {
  const colorMap = {
    emerald: 'text-emerald-300 bg-emerald-500/15',
    blue: 'text-blue-300 bg-blue-500/15',
    violet: 'text-violet-300 bg-violet-500/15',
  } as const
  return (
    <div>
      <div
        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 ${colorMap[color]}`}
      >
        {week}
      </div>
      <ul className="space-y-0.5 pl-1">
        {items.map((it, i) => (
          <li
            key={i}
            className="text-[11px] text-white/80 flex items-start gap-1.5"
          >
            <span className="text-white/40 flex-shrink-0">•</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── 主组件 ───────────────────────────────────────────────────

export function DiagnosisReport({
  report,
  layerProfiles,
  paid,
  paying,
  selectedPath,
  onPay,
  onOpenBooking,
}: DiagnosisReportProps) {
  return (
    <motion.section
      key="report"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="px-4"
    >
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-slate-900/50 border border-white/10 rounded-2xl p-5 md:p-7 backdrop-blur-sm">
          {/* 报告标题 */}
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <ListChecks size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-base md:text-lg font-bold text-white">
                《OPC 智富蓝皮书：你的 AI 商业进化地图》
              </h2>
              <p className="text-[11px] text-white/50">
                基于您的回答生成 · 仅供个人参考
              </p>
            </div>
          </div>

          {/* 免费 20% */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                {report.score}
              </div>
              <div>
                <div className="text-xs text-white/50">综合评分</div>
                <div className="text-sm text-white font-bold">/ 100 分</div>
              </div>
              <div className="ml-auto text-2xl">🌟</div>
            </div>

            {/* 四层阶梯综合定位 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 md:p-4">
              <div className="text-[11px] font-bold text-emerald-300 mb-2 flex items-center gap-1.5">
                📊 四层阶梯综合定位
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">
                  {layerProfiles[report.freeContent.layer].emoji}
                </span>
                <div className="text-base md:text-lg font-extrabold text-white">
                  你适合从【{report.freeContent.layerLabel}】起步
                </div>
              </div>
              <p className="text-sm text-white/85 leading-relaxed">
                {report.freeContent.summary}
              </p>
            </div>

            {/* 3 条核心实战建议 */}
            <div className="bg-blue-500/8 border border-blue-400/20 rounded-xl p-3 md:p-4">
              <div className="text-[11px] font-bold text-blue-300 mb-2.5 flex items-center gap-1.5">
                🎯 3 条核心实战建议
              </div>
              <ul className="space-y-1.5 text-xs text-white/85">
                {report.freeContent.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-blue-400 font-bold flex-shrink-0">
                      {i + 1}.
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 付费拦截 80% */}
          <div className="relative mt-6">
            {/* 锁定内容 */}
            <div className="space-y-3 opacity-40">
              <LockedSection
                icon={<Settings2 size={14} className="text-amber-300" />}
                title={report.lockedContent.role.title}
              >
                <p className="text-xs text-white/70">
                  {report.lockedContent.role.reason}
                </p>
              </LockedSection>
              <LockedSection
                icon={<ListChecks size={14} className="text-purple-300" />}
                title={report.lockedContent.weapons.title}
              >
                <p className="text-xs text-white/70">
                  2 工具 + 2 项目 + 1 服务 + 1 资源
                </p>
              </LockedSection>
              <LockedSection
                icon={<CalendarDays size={14} className="text-blue-300" />}
                title={report.lockedContent.roadmap.title}
              >
                <p className="text-xs text-white/70">3 周 9 个关键动作</p>
              </LockedSection>
              <LockedSection
                icon={<Brain size={14} className="text-rose-300" />}
                title={report.lockedContent.agents.title}
              >
                <p className="text-xs text-white/70">
                  2 个 AI 智能体精准推荐
                </p>
              </LockedSection>
            </div>

            {/* 遮罩层 */}
            <AnimatePresence>
              {!paid && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 backdrop-blur-lg bg-slate-900/80 rounded-xl flex flex-col items-center justify-center text-center px-4"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/30">
                    <Lock size={20} className="text-white" />
                  </div>
                  <p className="text-sm text-white/90 font-bold mb-1">
                    ⚡️ 您还有 4 项核心内容未解锁
                  </p>
                  <p className="text-xs text-white/60 mb-4">
                    角色定位 · 四库武器 · 30 天路线 · AI 智能体
                  </p>
                  <button
                    onClick={onPay}
                    disabled={paying}
                    data-testid="unlock-full-report"
                    className="h-12 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-105 active:scale-95 disabled:opacity-70 transition-all rounded-xl text-white text-sm font-bold shadow-lg shadow-amber-500/40 flex items-center gap-2"
                  >
                    {paying ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        支付中…
                      </>
                    ) : (
                      <>
                        <Unlock size={14} />
                        解锁完整蓝皮书 · 9.9 元
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 解锁后 */}
            {paid && (
              <>
                <motion.div
                  initial={{ scaleY: 0, opacity: 0.8 }}
                  animate={{ scaleY: 1, opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{ transformOrigin: 'top' }}
                  className="pointer-events-none absolute inset-x-0 -top-4 h-32 bg-gradient-to-b from-amber-300/60 via-amber-200/30 to-transparent blur-md z-10"
                />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 space-y-3"
                >
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold mb-2">
                    <Unlock size={12} />
                    <span>完整蓝皮书已解锁</span>
                  </div>

                  {/* 板块 1：角色定位 */}
                  <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-4">
                    <div className="text-[11px] font-bold text-amber-300 mb-2 flex items-center gap-1.5">
                      ⚙️ 一、你的 OPC 角色定位
                    </div>
                    <div className="text-sm font-extrabold text-white mb-1">
                      {report.lockedContent.role.bestLayer}
                    </div>
                    <p className="text-xs text-white/85 leading-relaxed mb-2">
                      {report.lockedContent.role.reason}
                    </p>
                    <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-200 bg-amber-500/15 px-2 py-0.5 rounded-full">
                      <ArrowRight size={10} />
                      跃迁路径：{report.lockedContent.role.transitionPath}
                    </div>
                  </div>

                  {/* 板块 2：四库武器 */}
                  <div className="bg-purple-500/10 border border-purple-400/30 rounded-xl p-4">
                    <div className="text-[11px] font-bold text-purple-300 mb-2.5 flex items-center gap-1.5">
                      🛠️ 二、四库全胜武器推荐
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-white/85">
                      <BulletLine
                        label="🔧 工具"
                        items={report.lockedContent.weapons.tools}
                      />
                      <BulletLine
                        label="📁 项目"
                        items={report.lockedContent.weapons.projects}
                      />
                      <BulletLine
                        label="💼 服务"
                        items={[report.lockedContent.weapons.service]}
                        single
                      />
                      <BulletLine
                        label="📚 资源"
                        items={[report.lockedContent.weapons.resource]}
                        single
                      />
                    </div>
                  </div>

                  {/* 板块 3：30 天路线图 */}
                  <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4">
                    <div className="text-[11px] font-bold text-blue-300 mb-2.5 flex items-center gap-1.5">
                      📅 三、30 天行动路线图
                    </div>
                    <div className="space-y-2.5">
                      <RoadmapWeek
                        week="第 1 周 (D1-D7)"
                        color="emerald"
                        items={report.lockedContent.roadmap.week1}
                      />
                      <RoadmapWeek
                        week="第 2 周 (D8-D15)"
                        color="blue"
                        items={report.lockedContent.roadmap.week2}
                      />
                      <RoadmapWeek
                        week="第 3 周 (D16-D30)"
                        color="violet"
                        items={report.lockedContent.roadmap.week3}
                      />
                    </div>
                  </div>

                  {/* 板块 4：AI 智能体 */}
                  <div className="bg-rose-500/10 border border-rose-400/30 rounded-xl p-4">
                    <div className="text-[11px] font-bold text-rose-300 mb-2.5 flex items-center gap-1.5">
                      🤖 四、可借力的 AI 智能体
                    </div>
                    <div className="space-y-2">
                      {report.lockedContent.agents.items.map((a, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 p-2.5 bg-white/5 rounded-lg"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                            <Brain size={14} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-white">
                              {a.name}
                            </div>
                            <div className="text-[11px] text-white/70 leading-relaxed">
                              {a.use}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </div>

          {/* ═══ 5. 15 分钟 1V1 免费咨询卡片 ═══ */}
          <AnimatePresence>
            {paid && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col md:flex-row items-center gap-3"
              >
                <div className="text-3xl flex-shrink-0">🎯</div>
                <div className="flex-1 text-center md:text-left">
                  <div className="text-sm font-bold text-slate-900">
                    需要专家帮您把把关？
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    良朋社主理人 1V1 · 15 分钟免费诊断咨询
                  </div>
                </div>
                <button
                  onClick={onOpenBooking}
                  data-testid="open-booking-modal"
                  className="h-12 px-5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition flex items-center gap-2 shadow-sm"
                >
                  <CalendarDays size={14} />
                  立即预约 15 分钟 1V1 免费诊断咨询
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══ 5.5 加入良朋社 OPC 智富社群 · 扫码入口 ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-4 bg-white/5 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4"
          >
            {/* 二维码 */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <div className="relative w-[120px] h-[120px] bg-white rounded-xl p-1.5 shadow-2xl shadow-blue-500/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/opc-qr.png"
                  width={120}
                  height={120}
                  alt="良朋社OPC社群二维码"
                  className="w-full h-full object-contain rounded-lg"
                />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
                  9.9
                </span>
              </div>
            </div>
            {/* 文案 */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1.5">
                <span className="text-base">💬</span>
                <h3 className="text-sm md:text-base font-bold text-white">
                  加入良朋社 OPC 智富社群
                </h3>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-400/30 rounded-full px-1.5 py-0.5">
                  9.9 诊断专属
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                与 <span className="font-bold text-amber-300">300+</span> 同频创业者一起交流，
                获取每日实操干货与资源对接。
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-cyan-300 bg-cyan-500/10 border border-cyan-400/20 rounded-lg px-2 py-1">
                <span>📱</span>
                <span>扫码添加良朋社小助手，备注【9.9诊断】，立即进群</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ═══ 6. 专属行动指令（基于 selectedPath） ═══ */}
        {(selectedPath === 'TRADER' || selectedPath === 'FLOW') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 relative overflow-hidden rounded-2xl"
          >
            {/* 渐变光晕背景 */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${
                selectedPath === 'TRADER'
                  ? 'from-blue-500 via-indigo-500 to-purple-500'
                  : 'from-pink-500 via-rose-500 to-orange-500'
              } opacity-90`}
            />
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />

            <div className="relative p-5 md:p-6 text-white">
              <div className="text-[10px] font-bold tracking-widest uppercase text-white/80 mb-2 flex items-center gap-1.5">
                <Zap size={12} />
                专属行动指令
              </div>
              <h3 className="text-xl md:text-2xl font-extrabold leading-tight mb-4">
                {selectedPath === 'TRADER' ? (
                  <>
                    你的第一步：开启你的
                    <strong className="text-amber-200">第一家网店</strong>！
                  </>
                ) : (
                  <>
                    你的第一步：开启你的
                    <strong className="text-amber-200">第一个自媒体账号</strong>！
                  </>
                )}
              </h3>
              <Link
                href={
                  selectedPath === 'TRADER'
                    ? '/market/tools?type=trader'
                    : '/market/tools?type=flow'
                }
                data-testid="report-cta"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-slate-900 text-sm md:text-base font-extrabold rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-lg"
              >
                {selectedPath === 'TRADER'
                  ? '🚀 立即去注册网店'
                  : '🎬 立即去注册自媒体'}
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  )
}
