'use client'

/**
 * 第 4 步·精准选品 渲染效果测试页
 * ------------------------------------------------------------
 * 入口：访问 /test-step4-selection
 * 作用：在本地浏览器中快速验证 ai-digital-shop-group 第 4 步的 3 大区块 + 付费解锁横幅 + 3 圆环打卡
 *
 * 模拟数据：
 *   - 顶部进度 4/9（与项目页一致）
 *   - 任务卡片：精准选品
 *   - 区块 A：货品类型（7 标签云 + AI 提示）
 *   - 区块 B：选品方法（4 策略 + 淘宝链接 + 紫色付费引导）
 *   - 区块 C：货品风控（企查查查商标 + 查版权 + 琥珀付费引导）
 *   - 3 个 subStep 圆环：4-1 / 4-2 / 4-3
 *   - 付费解锁横幅（默认隐藏，3 个 subStep 全完成时弹出）
 *   - 咨询AI教练按钮
 * ------------------------------------------------------------
 */

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Lock,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  CheckCircle2,
  Circle,
  ExternalLink,
  Target,
} from 'lucide-react'

// 3 个 subStep（与项目页 buildSOPTasks 注入的数据完全一致）
const SUB_STEPS = [
  {
    id: '4-1',
    title: '货品类型（已学习 7 类）',
    desc: '学习考试 / 老师教务 / 网盘资料 / 软件工具 / 设计制作 / 服务创意 / 游戏卡券',
  },
  {
    id: '4-2',
    title: '选品方法（已掌握 4 大策略）',
    desc: '关键词选品法 / 店铺选品法 / 热点选品法 / 节日选品法',
  },
  {
    id: '4-3',
    title: '货品风控（已完成商标+版权核查）',
    desc: '查商标 + 查版权 · 企查查工具实操',
  },
]

const TOTAL_SUBSTEPS = SUB_STEPS.length

export default function TestStep4Page() {
  const [paidMember, setPaidMember] = useState(false)
  const [subDone, setSubDone] = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed] = useState(false)

  const completedCount = subDone.size
  const allDone = completedCount === TOTAL_SUBSTEPS
  const showUnlockBanner = allDone && !paidMember

  const toggleSub = (id: string) => {
    setSubDone((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const resetAll = () => setSubDone(new Set())
  const markAll = () => setSubDone(new Set(SUB_STEPS.map((s) => s.id)))

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* 顶部说明 */}
        <div className="mb-6 rounded-2xl bg-white border border-slate-200 p-5">
          <h1 className="text-lg font-bold text-slate-800 mb-2">
            🧪 第 4 步·精准选品 渲染测试页
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            验证 <code className="bg-slate-100 px-1.5 py-0.5 rounded">ai-digital-shop-group</code> 第 4 步的 3 大区块渲染、付费解锁横幅触发逻辑、3 圆环打卡交互。
          </p>
        </div>

        {/* 调试控制条 */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-indigo-700">🎛️ 调试控制</span>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={paidMember}
                onChange={(e) => setPaidMember(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600"
              />
              <span>付费会员（开启后所有付费门控解锁）</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={collapsed}
                onChange={(e) => setCollapsed(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600"
              />
              <span>卡片折叠状态</span>
            </label>
            <div className="ml-auto flex gap-2">
              <button
                onClick={resetAll}
                className="text-xs bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-full px-3 py-1.5 transition-colors min-h-[32px]"
              >
                🔄 重置打卡
              </button>
              <button
                onClick={markAll}
                className="text-xs bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-full px-3 py-1.5 transition-colors min-h-[32px]"
              >
                ✅ 全部打卡
              </button>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            当前状态：subDone = {completedCount}/{TOTAL_SUBSTEPS} ·
            付费会员 = {paidMember ? '是' : '否'} ·
            横幅应显示 = <span className={showUnlockBanner ? 'text-amber-700 font-bold' : 'text-slate-400'}>{showUnlockBanner ? '✅ 显示' : '❌ 隐藏'}</span>
          </div>
        </div>

        {/* 顶部进度条 4/9 */}
        <div className="mb-4 rounded-2xl bg-white border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Target size={14} className="text-blue-500" />
              关卡进度
            </div>
            <div className="text-sm font-bold text-blue-600">4/9</div>
          </div>
          <div className="grid grid-cols-9 gap-1.5">
            {Array.from({ length: 9 }).map((_, i) => {
              const isDone = i < 4
              const isCurrent = i === 3
              const state = isDone
                ? 'bg-emerald-500 text-white border-emerald-500'
                : isCurrent
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'bg-slate-200 text-slate-400 border-slate-200'
              return (
                <div
                  key={i}
                  className={`h-7 rounded-md border flex items-center justify-center text-xs font-bold ${state}`}
                >
                  {i + 1}/9
                </div>
              )
            })}
          </div>
        </div>

        {/* ════════ 第 4 步任务卡片 ════════ */}
        <div className="rounded-2xl bg-white border-2 border-blue-500 shadow-sm overflow-hidden">
          {/* 卡片头部 */}
          <div className="p-5 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
              4
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-base font-bold text-slate-800">
                  第 4 步 · 精准选品
                </h3>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  （会员）
                </span>
                <span className="text-xs text-slate-500">
                  利用 AI 工具锁定 3-5 个高复购候选品类，输出选品对比表
                </span>
              </div>
              <p className="text-xs text-emerald-600 font-medium">
                ✅ 已完成 · {completedCount}/{TOTAL_SUBSTEPS} 子任务
              </p>
            </div>
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded min-h-[44px] flex items-center gap-1"
            >
              {collapsed ? '展开' : '收起'}
              {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>

          {/* 卡片主体（折叠时隐藏） */}
          {!collapsed && (
            <div className="px-5 pb-5">
              {/* ════════ 3 大区块（专属渲染）══════ */}
              <div className="mb-4 flex flex-col gap-4">
                {/* 区块 A：货品类型 */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">📦</span>
                    <h4 className="text-sm font-bold text-slate-800">
                      货品类型（知识普及）
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {['学习考试', '老师教务', '网盘资料', '软件工具', '设计制作', '服务创意', '游戏卡券'].map((tag) => (
                      <span
                        key={tag}
                        className="bg-slate-50/50 border border-slate-200 rounded-full px-2.5 py-1 text-xs text-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-slate-500 leading-relaxed">
                    💡 想知道每类产品具体怎么卖？可以随时点击右下角"咨询AI教练"深入聊聊。
                  </div>
                </div>

                {/* 区块 B：选品方法 */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base">🎯</span>
                    <h4 className="text-sm font-bold text-slate-800">
                      选品方法（4 大策略）
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {['关键词选品法', '店铺选品法', '热点选品法', '节日选品法'].map((strategy) => (
                      <div
                        key={strategy}
                        className="bg-slate-50 rounded-lg p-2 text-sm text-slate-600 border border-slate-100"
                      >
                        {strategy}
                      </div>
                    ))}
                  </div>
                  <a
                    href="https://www.taobao.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-50/80 hover:bg-blue-100 border border-blue-200/50 text-blue-700 rounded-full px-4 py-1.5 text-sm flex items-center gap-2 transition-colors w-fit min-h-[36px] mb-3"
                  >
                    <span aria-hidden="true">🔗</span>
                    <span>选品链接（用于实地调研）</span>
                    <ExternalLink size={12} className="text-blue-500" />
                  </a>
                  <div className="rounded-lg bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200/60 p-3">
                    <p className="text-xs text-slate-700 leading-relaxed mb-2">
                      具体的选品链接、实操 SOP 和完整标准清单，已内置入良朋社会员群及陪跑服务。
                    </p>
                    <Link
                      href="/pricing#plan-annual-199"
                      className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-full px-3 py-1.5 transition-colors min-h-[32px]"
                    >
                      <span>解锁完整选品标准</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>

                {/* 区块 C：货品风控 */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base">🛡️</span>
                    <h4 className="text-sm font-bold text-slate-800">货品风控</h4>
                  </div>
                  <div className="flex flex-col gap-2 mb-3">
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
                      <div className="text-sm font-medium text-slate-800 mb-1">
                        <span className="mr-1.5" aria-hidden="true">🔗</span>查商标
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-2">
                        在企查查查询商品主图、详情页、标题是否被注册商标。
                      </p>
                      <a
                        href="https://www.qcc.com/web_search?back=%2Fweb_searchBrand"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs rounded-full px-3 py-1.5 transition-colors min-h-[32px] w-fit"
                      >
                        <span>去企查查查商标</span>
                        <span aria-hidden="true">→</span>
                      </a>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
                      <div className="text-sm font-medium text-slate-800 mb-1">
                        <span className="mr-1.5" aria-hidden="true">🔗</span>查版权
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-2">
                        在企查查查询版权，需分段落查询。
                      </p>
                      <a
                        href="https://www.qcc.com/web_searchCopyright"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs rounded-full px-3 py-1.5 transition-colors min-h-[32px] w-fit"
                      >
                        <span>去企查查查版权</span>
                        <span aria-hidden="true">→</span>
                      </a>
                    </div>
                  </div>
                  <div className="rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-3">
                    <p className="text-xs text-slate-700 leading-relaxed mb-2">
                      要完整核对禁售产品库与弱版权对照清单，请联系导师或加入良朋社 199 付费群获取完整电子版。
                    </p>
                    <Link
                      href="/partner"
                      className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-full px-3 py-1.5 transition-colors min-h-[32px]"
                    >
                      <span>联系导师解锁风控清单</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* ════════ 3 个 subStep 圆环（打卡入口）══════ */}
              <div className="mt-5 flex flex-col gap-2">
                {SUB_STEPS.map((sub) => {
                  const subKey = sub.id
                  const subChecked = subDone.has(subKey)
                  // 测试模式（对应生产 UNLOCK_ALL_STEPS_FOR_TESTING=true）：第 4 步始终可打卡
                  return (
                    <div
                      key={subKey}
                      className={`rounded-xl border p-3 flex items-start gap-3 transition-all ${
                        subChecked
                          ? 'bg-emerald-50/50 border-emerald-300'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <button
                        onClick={() => toggleSub(subKey)}
                        className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all min-h-[44px] min-w-[44px] ${
                          subChecked
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'bg-white border-slate-300 text-transparent hover:border-emerald-400'
                        }`}
                        aria-label={subChecked ? '取消完成' : '标记完成'}
                      >
                        {subChecked ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm font-bold mb-0.5 ${
                            subChecked ? 'text-emerald-700 line-through' : 'text-slate-800'
                          }`}
                        >
                          {sub.title}
                        </div>
                        <div className="text-xs text-slate-500 leading-relaxed">
                          {sub.desc}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* ════════ 付费解锁横幅（条件渲染）══════ */}
              <AnimatePresence>
                {showUnlockBanner && (
                  <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 24, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                    className="mt-4 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 border-2 border-amber-300/60 p-4 shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center text-lg shadow-md">
                        🔓
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-amber-900 mb-1">
                          3 大选品区块已完成！解锁完整 SOP →
                        </div>
                        <p className="text-xs text-amber-800/80 leading-relaxed mb-3">
                          你已经掌握 7 类货品、4 大选品方法、商标+版权核查工具。接下来的 4-9 步含具体链接、AI 选品工具栈、爆款复盘模板，已内置入良朋社会员群及陪跑服务。
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href="/pricing#plan-monthly-69"
                            className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full px-3 py-2 min-h-[36px] hover:from-blue-700 hover:to-indigo-700 transition-colors"
                          >
                            <span>69元/月 解锁</span>
                          </Link>
                          <Link
                            href="/pricing#plan-annual-199"
                            className="inline-flex items-center gap-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold rounded-full px-3 py-2 min-h-[36px] hover:from-violet-700 hover:to-purple-700 transition-colors"
                          >
                            <span>199元/年 会员</span>
                          </Link>
                          <Link
                            href="/pricing#plan-light-598"
                            className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full px-3 py-2 min-h-[36px] hover:from-amber-600 hover:to-orange-600 transition-colors"
                          >
                            <span>598 轻陪跑</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 咨询AI教练按钮 */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => alert('召唤 AI 教练（真实项目中会派发 lps:open-ai-assistant 自定义事件）')}
                  className="inline-flex items-center gap-1.5 text-xs text-violet-700 hover:text-violet-900 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-full px-3 py-1.5 transition-colors min-h-[36px]"
                >
                  <MessageSquare size={12} />
                  <span>💬 咨询AI教练</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 验证清单 */}
        <div className="mt-6 rounded-2xl bg-white border border-slate-200 p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-3">✅ 验证清单</h2>
          <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <li>
              <strong>1. 默认状态</strong>（不勾付费、不打卡）：
              <ul className="ml-4 mt-1 space-y-1 list-disc">
                <li>3 大区块全部展示，标签云、4 策略卡片、企查查工具正常</li>
                <li>3 个 subStep 圆环未勾选（白色空心）</li>
                <li>付费解锁横幅<strong className="text-amber-700">不显示</strong></li>
              </ul>
            </li>
            <li>
              <strong>2. 部分打卡</strong>（勾 1-2 个 subStep）：
              <ul className="ml-4 mt-1 space-y-1 list-disc">
                <li>已勾选圆环变绿、文字 line-through、卡片底色变 emerald-50</li>
                <li>付费解锁横幅<strong className="text-amber-700">仍不显示</strong>（需要 allDone）</li>
              </ul>
            </li>
            <li>
              <strong>3. 全部打卡</strong>（勾满 3 个）：
              <ul className="ml-4 mt-1 space-y-1 list-disc">
                <li>付费解锁横幅<strong className="text-emerald-700">平滑弹出</strong>（spring 动画）</li>
                <li>3 个价格按钮（69/月、199/年、598 轻陪跑）正常显示</li>
              </ul>
            </li>
            <li>
              <strong>4. 付费会员开启</strong>（勾满 3 个 + 付费会员 = true）：
              <ul className="ml-4 mt-1 space-y-1 list-disc">
                <li>付费解锁横幅<strong className="text-emerald-700">不显示</strong>（!paidMember 条件）</li>
              </ul>
            </li>
            <li>
              <strong>5. 折叠/展开</strong>（勾"卡片折叠状态"）：
              <ul className="ml-4 mt-1 space-y-1 list-disc">
                <li>卡片主体隐藏，仅保留头部</li>
                <li>3 大区块 + 圆环 + 横幅 + AI 教练按钮全部隐藏</li>
              </ul>
            </li>
            <li>
              <strong>6. 外部链接</strong>：
              <ul className="ml-4 mt-1 space-y-1 list-disc">
                <li>淘宝选品链接 → 新标签页打开 taobao.com</li>
                <li>企查查 2 个工具链接 → 新标签页打开 qcc.com</li>
                <li>2 个付费引导按钮 → SPA 内跳转 /pricing 或 /partner</li>
              </ul>
            </li>
          </ul>
        </div>

        <div className="mt-4 text-xs text-slate-400 text-center">
          独立测试页 · 不影响主项目代码
        </div>
      </div>
    </div>
  )
}
