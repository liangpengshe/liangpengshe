'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Calculator,
  Lock,
  Unlock,
  CalendarDays,
  Loader2,
  CheckCircle2,
  X,
  Brain,
  ListChecks,
  Zap,
  ArrowRight,
  ShoppingCart,
  Megaphone,
  Settings2,
  Gem,
} from 'lucide-react'
import { saveOPCRouteToStorage } from '@/lib/user-stage'

/** localStorage 中标记"用户已接受时间线"，用于防止再次进入诊断时重复展示 */
const DIAGNOSIS_ACCEPTED_KEY = 'diagnosis_accepted'

/** OPCLevel → /guide/{level} 路径映射（与 user-stage 的 LEVEL_TO_GUIDE 保持一致） */
const PATH_TO_GUIDE: Record<SelectedPath, string> = {
  TRADER: '/guide/trader',
  FLOW: '/guide/flow',
  SYSTEM: '/guide/system',
  ASSET: '/guide/asset',
}

// ════════════════════════════════════════════════════════════════
// 1. 4 问对话脚本（单选版，覆盖 OPC 四层）
// ════════════════════════════════════════════════════════════════

interface QuestionOption {
  value: string
  label: string
  emoji: string
  desc?: string
}

interface Question {
  key: 'identity' | 'strength' | 'bottleneck' | 'goal'
  text: string
  options: QuestionOption[]
}

const questions: Question[] = [
  {
    key: 'identity',
    text: '您目前的身份是？',
    options: [
      { value: 'solo', label: '个人创业者', emoji: '🧑‍💻' },
      { value: 'micro', label: '小微团队', emoji: '👥' },
      { value: 'boss', label: '企业主', emoji: '👔' },
      { value: 'other', label: '其他', emoji: '🔍' },
    ],
  },
  {
    key: 'strength',
    text: '您最擅长/具备的核心优势是什么？',
    options: [
      { value: 'content', label: '写文案做内容', emoji: '✍️' },
      { value: 'supply', label: '懂供应链', emoji: '📦' },
      { value: 'tech', label: '有技术背景', emoji: '⚙️' },
      { value: 'sales', label: '擅长销售', emoji: '💬' },
      { value: 'local', label: '有本地资源', emoji: '🏘️' },
    ],
  },
  {
    key: 'bottleneck',
    text: '您当前面临的最大瓶颈是什么？',
    options: [
      { value: 'traffic', label: '不知道怎么获客', emoji: '🚦' },
      { value: 'monetize', label: '不知道怎么变现', emoji: '💸' },
      { value: 'pricing', label: '不知道怎么定高价', emoji: '💎' },
      { value: 'scale', label: '不知道怎么复制放大', emoji: '🚀' },
    ],
  },
  {
    key: 'goal',
    text: '您的核心目标是？',
    options: [
      { value: 'first', label: '先跑通一单', emoji: '🎯' },
      { value: '30k', label: '稳定月入 3 万', emoji: '📈' },
      { value: 'enterprise', label: '接企业高客单', emoji: '🏢' },
      { value: 'national', label: '成为全国主理人', emoji: '🌐' },
    ],
  },
]

// ════════════════════════════════════════════════════════════════
// 2. 四层阶梯定位推演器（5-6 种路径组合演示）
// ════════════════════════════════════════════════════════════════

type LayerKey = 'trading' | 'traffic' | 'system' | 'asset'

interface LayerProfile {
  key: LayerKey
  label: string
  emoji: string
  description: string
  weapons: string[]
  color: string
  gradient: string
}

const layerProfiles: Record<LayerKey, LayerProfile> = {
  trading: {
    key: 'trading',
    label: '交易型 OPC',
    emoji: '💰',
    description: '跑通首单 + 智富严选，AI 帮你做爆款',
    weapons: ['智富严选', '灵犀 AI · 商品图生成', '豹纹工坊'],
    color: 'amber',
    gradient: 'from-amber-400 to-orange-500',
  },
  traffic: {
    key: 'traffic',
    label: '流量型 OPC',
    emoji: '🔥',
    description: '内容获客 + 自媒体矩阵，跑出稳定流量',
    weapons: ['豹纹工坊（豹纹+） · 爆款素材', 'AI 自媒体项目库', '灵犀 AI · 短视频脚本'],
    color: 'rose',
    gradient: 'from-rose-500 to-pink-600',
  },
  system: {
    key: 'system',
    label: '系统型 OPC',
    emoji: '⚙️',
    description: '企业流程改造 + 高客单解决方案',
    weapons: ['AI 内训服务', 'GEO 增长陪跑', '企业级智能客服 FastGPT'],
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
  },
  asset: {
    key: 'asset',
    label: '资产型 OPC',
    emoji: '🚀',
    description: '数字资产 + 全球外包，复制放大你的生意',
    weapons: ['城市分站加盟', '数字资产 SOP', '全球外包中心'],
    color: 'violet',
    gradient: 'from-violet-500 to-fuchsia-600',
  },
}

interface Selection {
  identity?: string
  strength?: string
  /**
   * 最大瓶颈（多选）
   * 保留为 string[] 是因为多数用户同时面临 2-3 个交叉卡点（例如「不会获客 + 不会变现」）。
   * matchLayer 会用 includes() 匹配，比单选更精准。
   */
  bottleneck?: string[]
  goal?: string
}

function matchLayer(sel: Selection): LayerProfile | null {
  // 多选兼容：bottleneck 为数组，包含某 value 即视为命中
  const has = (v: string) => sel.bottleneck?.includes(v) ?? false

  // 路径 1：交易型 — 个人/小微 + 懂供应链/销售 + 变现/获客 + 跑通一单
  if (
    (sel.identity === 'solo' || sel.identity === 'micro') &&
    (sel.strength === 'supply' || sel.strength === 'sales') &&
    (has('monetize') || has('traffic')) &&
    sel.goal === 'first'
  ) {
    return layerProfiles.trading
  }

  // 路径 2：流量型 — 个人 + 写文案/有本地 + 获客/变现 + 月入3万
  if (
    sel.identity === 'solo' &&
    (sel.strength === 'content' || sel.strength === 'local') &&
    (has('traffic') || has('monetize')) &&
    (sel.goal === '30k' || sel.goal === 'first')
  ) {
    return layerProfiles.traffic
  }

  // 路径 3：系统型 — 企业主/小微 + 技术/销售 + 定价/获客 + 高客单
  if (
    (sel.identity === 'boss' || sel.identity === 'micro') &&
    (sel.strength === 'tech' || sel.strength === 'sales') &&
    (has('pricing') || has('traffic')) &&
    (sel.goal === 'enterprise' || sel.goal === '30k')
  ) {
    return layerProfiles.system
  }

  // 路径 4：资产型 — 企业主 + 销售/资源 + 复制放大 + 全国主理人
  if (
    sel.identity === 'boss' &&
    (sel.strength === 'sales' || sel.strength === 'local') &&
    has('scale') &&
    (sel.goal === 'national' || sel.goal === 'enterprise')
  ) {
    return layerProfiles.asset
  }

  // 路径 5：内容起家 → 流量型 (兜底)
  if (sel.strength === 'content' && !sel.goal) {
    return layerProfiles.traffic
  }

  // 路径 6：技术起家 → 系统型 (兜底)
  if (sel.strength === 'tech' && !sel.goal) {
    return layerProfiles.system
  }

  return null
}

// ════════════════════════════════════════════════════════════════
// 2.5 路径对比卡数据（用于入口"你想从哪条路开始？"）
// ════════════════════════════════════════════════════════════════

export type SelectedPath = 'TRADER' | 'FLOW' | 'SYSTEM' | 'ASSET'

interface PathComparison {
  key: SelectedPath
  emoji: string
  label: string
  tagline: string
  fastestTime: string
  skills: string[]
  risks: string[]
  fitFor: string[]
  gradient: string
  ring: string
  badge: string
  weapon: string[]
}

const pathComparisons: PathComparison[] = [
  {
    key: 'TRADER',
    emoji: '💰',
    label: '交易型 OPC',
    tagline: '跑通首单 + AI 帮你做爆款',
    fastestTime: '3-7 天',
    skills: ['选品眼光', '基础运营', '执行力'],
    risks: ['库存压货', '广告费超支', '退货率风险'],
    fitFor: ['想快速跑通一单验证', '手头有 1-3 万启动资金', '能接受短期失败'],
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    ring: 'ring-amber-400/50',
    badge: '推荐新手起步',
    weapon: ['智富严选', '灵犀 AI · 商品图', '豹纹工坊'],
  },
  {
    key: 'FLOW',
    emoji: '🔥',
    label: '流量型 OPC',
    tagline: '内容获客 + 自媒体矩阵',
    fastestTime: '15-30 天',
    skills: ['写文案做内容', '基础剪辑', '持续输出能力'],
    risks: ['起号周期长', '算法波动', '粉丝转化不稳'],
    fitFor: ['擅长写文案/做内容', '有耐心持续输出', '有 1-2 个月启动期'],
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    ring: 'ring-rose-400/50',
    badge: '内容创作者首选',
    weapon: ['豹纹工坊（豹纹+） · 爆款素材', 'AI 自媒体项目库', '灵犀 AI · 短视频脚本'],
  },
]

// ════════════════════════════════════════════════════════════════
// 2.6 时间预期管理（根据路径 + 资金 + 时间生成 3/7/15 天路线图）
// ════════════════════════════════════════════════════════════════

interface Timeline {
  d3: string[]
  d7: string[]
  d15: string[]
}

function generateTimeline(path: SelectedPath | null, budget: number, hours: number): Timeline {
  if (!path) return { d3: [], d7: [], d15: [] }
  const t: Timeline = { d3: [], d7: [], d15: [] }

  if (path === 'TRADER') {
    t.d3 = [
      '完成 3 款潜力品选品 + 货源谈判',
      '搭建店铺（Shopify / 抖店）',
      '产出 5 张 AI 商品图素材',
    ]
    t.d7 = [
      '上架首批 SKU + 基础详情页',
      '投放 500 元小额测试广告',
      '客服 SOP + 售后话术到位',
    ]
    t.d15 = [
      '跑通首单 + 收集真实用户反馈',
      '迭代主图 / 详情页 / 价格',
      '启动第二波内容矩阵引流',
    ]
  } else if (path === 'FLOW') {
    t.d3 = [
      '锁定 1 个垂直选题方向',
      '搭建账号矩阵（公众号 + 视频号）',
      '产出 3 篇核心内容选题清单',
    ]
    t.d7 = [
      '稳定日更 1-2 条内容',
      '建立基础钩子模板 + SOP',
      '测试 3 种内容形式的转化',
    ]
    t.d15 = [
      '跑出 1 条播放量 10w+ 爆款',
      '建立私域承接路径（社群/企微）',
      '开始接广告 / 带货分润',
    ]
  } else if (path === 'SYSTEM') {
    t.d3 = [
      '梳理 1 个标杆客户案例',
      '完成产品手册 V1',
      '锁定 3 家本地企业试点',
    ]
    t.d7 = [
      '完成 1 单 3 万元内训交付',
      '录制产品讲解视频 + 落地页',
      '启动公众号 + 视频号内容矩阵',
    ]
    t.d15 = [
      '沉淀 SOP 文档 + 销售话术',
      '招募 1 位主理人补齐交付',
      '规划下季度从系统型向资产型跃迁',
    ]
  } else if (path === 'ASSET') {
    t.d3 = [
      '梳理可数字化的核心 SOP',
      '搭建全球外包协作模板',
      '启动 1 个城市分站试点',
    ]
    t.d7 = [
      '上线主理人加盟页面',
      '跑通 1 笔分润结算链路',
      '建立数字资产版权登记流程',
    ]
    t.d15 = [
      '签约 2-3 位城市主理人',
      '搭建 1 套可复制的招商 SOP',
      '启动海外市场（TikTok / Shopify）',
    ]
  }

  // 根据资金和时间做动态调整
  if (budget < 1000) {
    t.d3.unshift('⚠️ 启动资金紧张，优先零成本验证')
  } else if (budget >= 10000) {
    t.d3.unshift('💰 资金充足，可直接进入投流阶段')
  }
  if (hours < 2) {
    t.d7.unshift('⏰ 日均时间有限，优先做单点突破')
  } else if (hours >= 5) {
    t.d7.unshift('🔥 高投入，可同时跑 2-3 个并行任务')
  }

  return t
}

// ════════════════════════════════════════════════════════════════
// 3. 通用 OPC 报告数据
// ════════════════════════════════════════════════════════════════

const mockReport = {
  score: 88,
  freeContent: {
    layer: 'system' as LayerKey,
    layerLabel: '系统型 OPC',
    summary:
      '您的「企业流程改造 + 高客单解决方案」能力与 OPC 系统型阶梯高度匹配，建议从 GEO 增长陪跑服务切入，跑通 1-2 个标杆案例后再向资产型跃迁。',
    suggestions: [
      '用 GEO 增长陪跑拿下首个 3 万元企业内训单',
      '优先在长三角 / 珠三角招募 1-2 位主理人补齐交付能力',
      '6 个月内把案例沉淀为可复制的 SOP 文档',
    ],
  },
  lockedContent: {
    role: {
      title: '你的 OPC 角色定位',
      bestLayer: '系统型 OPC',
      reason:
        '您具备技术/销售双重背景，且瓶颈在「定价」与「获客」——这恰是系统型 OPC 的核心战场：用 AI 把企业流程改造做成标准化产品，再以高客单形式交付。',
      transitionPath: '系统型 → 资产型',
    },
    weapons: {
      title: '四库全胜武器推荐',
      tools: ['GEO 增长陪跑（自研）', '企业级智能客服 FastGPT'],
      projects: ['AI 企业内训 SOP', '高客单 GEO 增长包'],
      service: '智富 AI 内训服务',
      resource: 'OPC 工具订阅（豹纹工坊（豹纹+））',
    },
    roadmap: {
      title: '30 天行动路线图',
      week1: [
        '完成 GEO 增长陪跑产品手册 V1',
        '锁定 3 家本地企业作为首期试点',
        '搭建 FastGPT 企业知识库模板',
      ],
      week2: [
        '完成 1 单 3 万元内训交付（标杆案例）',
        '录制产品讲解视频 + 落地页',
        '启动公众号 + 视频号内容矩阵',
      ],
      week3: [
        '沉淀 SOP 文档 + 销售话术',
        '招募 1 位主理人补齐交付',
        '规划下季度从系统型向资产型跃迁',
      ],
    },
    agents: {
      title: '可借力的 AI 智能体',
      items: [
        { name: '商业 IP 诊断 Agent', use: '帮客户生成定制化诊断报告' },
        { name: '项目规划 Agent', use: '把案例拆解为可复制 SOP' },
      ],
    },
  },
}

// ════════════════════════════════════════════════════════════════
// 4. Mock API 占位函数（留空以备真实接入）
// ════════════════════════════════════════════════════════════════

async function mockGenerateDiagnosis(
  _payload: Selection,
  _selectedPath: SelectedPath | null = null,
  _budget: number = 0,
  _dailyHours: number = 0
) {
  await new Promise((r) => setTimeout(r, 800))
  // 数据流打标：selected_path 字段供后续四库推荐和工作台任务匹配
  const enrichedPayload = {
    ..._payload,
    selected_path: _selectedPath, // TRADER / FLOW / SYSTEM / ASSET
    budget: _budget,
    daily_hours: _dailyHours,
    created_at: new Date().toISOString(),
  }
  console.log('[Diagnosis] 数据流打标：', enrichedPayload)
  return { success: true, data: mockReport, payload: enrichedPayload }
}

async function mockCheckout(amount: number) {
  await new Promise((r) => setTimeout(r, 1000))
  return { success: true, data: { orderId: `mock_${Date.now()}`, amount } }
}

/**
 * 提交 15 分钟免费咨询预约
 * 真实调用 /api/consultations（占位接口），失败时降级到 mock
 */
async function submitQuickConsult(payload: { name: string; contact: string }) {
  try {
    const r = await fetch('/api/consultations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        contact: payload.contact,
        source: 'diagnosis-report-15min',
      }),
    })
    if (r.ok) {
      const j = await r.json().catch(() => ({}))
      if (j?.success) {
        return { success: true, data: j.data || { bookingId: `bk_${Date.now()}` } }
      }
    }
  } catch {
    // 网络失败 / API 未就绪 → 降级 mock
  }
  await new Promise((r) => setTimeout(r, 400))
  return { success: true, data: { bookingId: `bk_${Date.now()}`, ...payload } }
}

// ════════════════════════════════════════════════════════════════
// 5. RadioGroup 子组件（移动端纵向 / 桌面端横向）
// ════════════════════════════════════════════════════════════════

function RadioGroup({
  options,
  value,
  onChange,
}: {
  options: QuestionOption[]
  value?: string
  onChange: (v: string) => void
}) {
  return (
    <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 mt-3">
      {options.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`group flex items-center gap-2 px-3 md:px-4 h-12 rounded-xl text-sm font-medium transition-all border ${
              selected
                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/60 text-white shadow-lg shadow-blue-500/20'
                : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30 hover:bg-white/8'
            }`}
          >
            <span className="text-base">{opt.emoji}</span>
            <span className="whitespace-nowrap">{opt.label}</span>
            {selected && (
              <CheckCircle2 size={12} className="ml-auto text-emerald-400" />
            )}
          </button>
        )
      })}
    </div>
  )
}

/**
 * MultiButtonGroup：多选按钮组（用于"最大瓶颈"等可多选题）
 * 点击行为：未选 → 添加；已选 → 移除。
 * 视觉反馈：选中用 bg-blue-600 text-white 高亮，未选保持半透明。
 * 移动端：min-height 44px 舒适点击区，flex-wrap 自动换行。
 */
function MultiButtonGroup({
  options,
  values,
  onToggle,
}: {
  options: QuestionOption[]
  values: string[]
  onToggle: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {options.map((opt) => {
        const selected = values.includes(opt.value)
        return (
          <button
            key={opt.value}
            onClick={() => onToggle(opt.value)}
            aria-pressed={selected}
            className={`group inline-flex items-center gap-2 px-3 md:px-4 min-h-[44px] rounded-xl text-sm font-medium transition-all border ${
              selected
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-400 text-white shadow-lg shadow-blue-500/30 ring-1 ring-blue-300/50'
                : 'bg-slate-800/50 border-slate-600/50 text-white/70 hover:border-blue-400/50 hover:bg-slate-700/60 hover:text-white'
            }`}
          >
            <span className="text-base">{opt.emoji}</span>
            <span className="whitespace-nowrap">{opt.label}</span>
            {selected ? (
              <CheckCircle2 size={12} className="text-emerald-300 flex-shrink-0" />
            ) : (
              <span className="w-3 h-3 rounded-full border border-white/30 flex-shrink-0" />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// 6. 主页面：4 阶段顶级漏斗
// ════════════════════════════════════════════════════════════════

type Stage = 'select' | 'chat' | 'report' | 'expert'
type Mode = 'chat' | 'form'

export default function DiagnosisPage() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('select')
  const [mode, setMode] = useState<Mode>('chat')
  const [currentQIdx, setCurrentQIdx] = useState(0) // 0..3
  const [selection, setSelection] = useState<Selection>({})
  // 新增：路径选择（默认未选，TS 必填）
  const [selectedPath, setSelectedPath] = useState<SelectedPath | null>(null)
  // 新增：资金 + 日均时间（用于时间预期管理）
  const [budget, setBudget] = useState<number>(0)
  const [dailyHours, setDailyHours] = useState<number>(0)
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingSent, setBookingSent] = useState(false)
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  // 自动滚动
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentQIdx, stage])

  // 实时推演结果
  const liveProfile = matchLayer(selection)

  const startChat = () => {
    setMode('chat')
    setStage('chat')
    setCurrentQIdx(0)
    setSelection({})
  }

  // 新增：从"路径选择卡"直接进入对话，自动填入初始背景
  const startChatWithPath = (path: SelectedPath) => {
    setSelectedPath(path)
    setMode('chat')
    setStage('chat')
    setCurrentQIdx(0)
    // 智能分流：把用户选定的路径写入 localStorage，供首页 STEP 02 智能跳转
    saveOPCRouteToStorage(path)
    // 自动填入"身份"作为初始背景
    const identity = path === 'TRADER' ? 'solo' : path === 'FLOW' ? 'solo' : path === 'SYSTEM' ? 'boss' : 'boss'
    setSelection({ identity })
  }

  // 新增：用户想换一条路 → 回到"路径选择卡"阶段
  const goBackToPathSelect = () => {
    setStage('select')
    setSelectedPath(null)
    setSelection({})
    setCurrentQIdx(0)
  }

  /**
   * 红色按钮"太慢了，看看另一条路"完整版：
   *   1. 清空已接受的标记，让用户重新进入能看到选择卡
   *   2. 重置所有状态（路径 / 答案 / 资金 / 时间）
   *   3. 通过 router 强制刷新路由回到 /diagnosis 入口阶段
   */
  const handleSwitchPath = () => {
    try {
      window.localStorage.removeItem(DIAGNOSIS_ACCEPTED_KEY)
      window.localStorage.removeItem('opc_level')
    } catch {
      // 忽略 localStorage 异常
    }
    goBackToPathSelect()
    setBudget(0)
    setDailyHours(0)
    // 软跳转：回到 /diagnosis 入口阶段，保留 SPA 体验
    router.push('/diagnosis')
  }

  /**
   * 绿色按钮"我接受这个时间线"：
   *   1. 写入 opc_level 到 localStorage（关键！供 /guide/* 页和后续模块读取）
   *   2. 设置 diagnosis_accepted 标记，避免下次进入重复展示
   *   3. router.push 跳转至对应 /guide/{trader|flow|system|asset} 学习页
   */
  const handleAcceptTimeline = () => {
    if (!selectedPath) {
      // 兜底：如果路径意外丢失，至少把用户带回路径选择卡
      handleSwitchPath()
      return
    }
    const target = PATH_TO_GUIDE[selectedPath]
    try {
      window.localStorage.setItem('opc_level', selectedPath)
      window.localStorage.setItem(DIAGNOSIS_ACCEPTED_KEY, 'true')
      // 同步 stageStore（双写：localStorage + 内存）
      saveOPCRouteToStorage(selectedPath)
    } catch {
      // 即便 localStorage 失败，也允许用户继续跳转（降级体验）
    }
    router.push(target)
  }

  const startForm = () => {
    setMode('form')
    setStage('chat')
    // 预设一组典型答案：系统型路径
    setSelection({
      identity: 'boss',
      strength: 'tech',
      bottleneck: ['pricing'],
      goal: 'enterprise',
    })
    setCurrentQIdx(4)
    setSelectedPath('SYSTEM') // 表单模式默认系统型
    setTimeout(() => {
      setStage('report')
      void mockGenerateDiagnosis({
        identity: 'boss',
        strength: 'tech',
        bottleneck: ['pricing'],
        goal: 'enterprise',
      }, 'SYSTEM', 5000, 3)
    }, 500)
  }

  // 用户选择了一个选项（单选 / 多选统一入口）
  const handleSelect = (key: Question['key'], value: string) => {
    // bottleneck 是数组：toggle 行为
    if (key === 'bottleneck') {
      const cur = selection.bottleneck || []
      const next = cur.includes(value)
        ? cur.filter((x) => x !== value)
        : [...cur, value]
      setSelection({ ...selection, bottleneck: next })
      // 多选不立即触发下一步（用户可能继续选），智能分流也实时反推
      const reversed = matchLayer({ ...selection, bottleneck: next })
      if (reversed) {
        const map: Record<string, SelectedPath> = {
          trading: 'TRADER',
          traffic: 'FLOW',
          system: 'SYSTEM',
          asset: 'ASSET',
        }
        const lv = map[reversed.key]
        if (lv) {
          setSelectedPath(lv)
          saveOPCRouteToStorage(lv)
        }
      }
      return
    }

    // 其他问题（单选）
    const newSel = { ...selection, [key]: value }
    setSelection(newSel)

    // 智能分流：根据 4 问结果反推 OPCLevel，写入 localStorage
    const reversed = matchLayer(newSel)
    if (reversed) {
      const map: Record<string, SelectedPath> = {
        trading: 'TRADER',
        traffic: 'FLOW',
        system: 'SYSTEM',
        asset: 'ASSET',
      }
      const lv = map[reversed.key]
      if (lv) {
        setSelectedPath(lv)
        saveOPCRouteToStorage(lv)
      }
    }

    // 延迟切到下一问，模拟"AI 处理"
    setTimeout(() => {
      if (currentQIdx < questions.length - 1) {
        setCurrentQIdx(currentQIdx + 1)
      } else {
        // 4 问完成，切到报告
        setCurrentQIdx(currentQIdx + 1)
        setTimeout(() => {
          setStage('report')
          void mockGenerateDiagnosis(
            newSel,
            selectedPath,
            budget,
            dailyHours
          )
        }, 800)
      }
    }, 350)
  }

  // 模拟支付
  const handlePay = async () => {
    setPaying(true)
    const res = await mockCheckout(9.9)
    if (res.success) setPaid(true)
    setPaying(false)
  }

  const currentQ = questions[currentQIdx]
  const progress = Math.min(
    ((Object.keys(selection).length) / questions.length) * 100,
    100
  )

  return (
    <main className="min-h-screen pb-20">
      {/* ═══ 1. 顶部 Hero 区 ═══ */}
      <section className="relative overflow-hidden pt-10 pb-6 px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/15 rounded-full blur-3xl" />
        <div className="absolute top-10 right-1/4 w-[300px] h-[300px] bg-purple-500/15 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 mb-4 text-xs text-white/70"
          >
            <Sparkles size={12} className="text-amber-400" />
            <span>AI 智富对话引擎 · 四层阶梯实时定位</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold leading-tight mb-3"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              📊 你的 OPC 创业 · AI 综合诊断
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-base text-white/60 max-w-xl mx-auto"
          >
            30 秒，AI 帮你定位在四层创业阶梯中的最佳位置 + 推荐武器组合。
          </motion.p>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {/* ═══ 2. 第一阶段：入口选择器 ═══ */}
        {stage === 'select' && (
          <motion.section
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-4"
          >
            <div className="max-w-4xl mx-auto space-y-6">
              {/* 上排：AI / 手动 二选一 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={startChat}
                  className="group relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 hover:scale-[1.02] active:scale-[0.99] transition-all rounded-2xl p-6 md:p-8 text-left text-white border border-white/20 shadow-2xl shadow-purple-500/30 min-h-[180px] flex flex-col justify-between"
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="text-4xl mb-3">🤖</div>
                    <h3 className="text-xl md:text-2xl font-bold mb-2">AI 帮我定位</h3>
                    <p className="text-sm text-white/80 leading-relaxed">
                      对话式诊断，路径最短。
                      <br />
                      <span className="text-white/60">仅需回答 4 个关键问题</span>
                    </p>
                  </div>
                  <div className="relative mt-4 inline-flex items-center gap-1 text-sm font-bold">
                    <span>开始对话</span>
                    <Zap size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                <button
                  onClick={startForm}
                  className="group relative bg-transparent hover:bg-white/5 transition-all rounded-2xl p-6 md:p-8 text-left text-white/90 border-2 border-white/15 hover:border-white/30 min-h-[180px] flex flex-col justify-between"
                >
                  <div className="relative">
                    <div className="text-4xl mb-3">📋</div>
                    <h3 className="text-xl md:text-2xl font-bold mb-2">快速定位模式</h3>
                    <p className="text-sm text-white/60 leading-relaxed">
                      已有明确方向？
                      <br />
                      <span className="text-white/40">直接用「系统型」案例体验报告</span>
                    </p>
                  </div>
                  <div className="relative mt-4 inline-flex items-center gap-1 text-sm font-bold text-white/60 group-hover:text-white">
                    <span>示例报告</span>
                    <ListChecks size={14} />
                  </div>
                </button>
              </div>

              {/* 下排：路径选择卡 */}
              <div>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="text-lg">🤔</span>
                  <h3 className="text-base md:text-lg font-bold text-white">
                    你想从哪条路开始？
                  </h3>
                  <span className="ml-auto text-[10px] text-white/40 hidden md:inline">
                    点击直接进入对话，自动填入初始背景
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pathComparisons.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => startChatWithPath(p.key)}
                      className={`group relative text-left rounded-2xl p-5 bg-gradient-to-br ${p.gradient} bg-opacity-15 border border-white/20 hover:scale-[1.02] active:scale-[0.99] transition-all overflow-hidden`}
                    >
                      <div className={`absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br ${p.gradient} opacity-25 rounded-full blur-2xl`} />
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{p.emoji}</span>
                          <h4 className="text-base md:text-lg font-extrabold text-white">
                            {p.label}
                          </h4>
                          <span className="ml-auto text-[10px] font-bold text-white/90 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                            {p.badge}
                          </span>
                        </div>
                        <p className="text-xs text-white/85 mb-3 leading-relaxed">
                          {p.tagline}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="bg-white/10 rounded-lg p-2">
                            <div className="text-white/60 mb-0.5">⏱ 最快出单</div>
                            <div className="text-white font-bold">{p.fastestTime}</div>
                          </div>
                          <div className="bg-white/10 rounded-lg p-2">
                            <div className="text-white/60 mb-0.5">🛠 需要技能</div>
                            <div className="text-white font-bold leading-snug">
                              {p.skills.slice(0, 2).join('、')}
                            </div>
                          </div>
                          <div className="bg-white/10 rounded-lg p-2">
                            <div className="text-white/60 mb-0.5">⚠️ 初期风险</div>
                            <div className="text-white font-bold leading-snug">
                              {p.risks[0]}
                            </div>
                          </div>
                          <div className="bg-white/10 rounded-lg p-2">
                            <div className="text-white/60 mb-0.5">🎯 适合谁</div>
                            <div className="text-white font-bold leading-snug">
                              {p.fitFor[0]}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-white opacity-90 group-hover:opacity-100 group-hover:gap-2 transition-all">
                          <span>选这条路开始</span>
                          <ArrowRight size={12} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* ═══ 3. 第二阶段：4 问单选 + 实时推演 ═══ */}
        {stage === 'chat' && mode === 'chat' && (
          <motion.section
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-4"
          >
            <div className="max-w-4xl mx-auto">
              <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-sm">
                {/* 头部 */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Brain size={16} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">AI 智富顾问</div>
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      在线 · 四层阶梯定位中
                    </div>
                  </div>
                  <div className="text-[10px] text-white/40">
                    {Math.min(Object.keys(selection).length, 4)} / 4 已回答
                  </div>
                </div>

                {/* 进度条 */}
                <div className="mb-5">
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.4 }}
                      className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full"
                    />
                  </div>
                </div>

                {/* 问题列表：只显示"已完成"的 + "当前" */}
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {questions.map((q, idx) => {
                    if (idx > currentQIdx) return null
                    const userAnswer = selection[q.key]
                    return (
                      <motion.div
                        key={q.key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                      >
                        {/* AI 提问气泡 */}
                        <div className="flex justify-start">
                          <div className="max-w-[90%] bg-white/8 text-white/90 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed">
                            {idx + 1}. {q.text}
                          </div>
                        </div>
                        {/* 选项区：单选 / 多选分支 */}
                        {idx === currentQIdx && currentQIdx < questions.length && (
                          <div className="pl-2">
                            {q.key === 'bottleneck' ? (
                              <>
                                <p className="text-[11px] text-amber-200/80 mt-2">
                                  💡 可多选（多数老板同时面临 2-3 个卡点）
                                </p>
                                <MultiButtonGroup
                                  options={q.options}
                                  values={(userAnswer as string[] | undefined) || []}
                                  onToggle={(v) => handleSelect(q.key, v)}
                                />
                                {/* 多选不自动切题，给"完成本题"按钮 */}
                                {((userAnswer as string[] | undefined) || []).length > 0 && (
                                  <button
                                    onClick={() => {
                                      // 用最新 bottleneck 数组（避免闭包陷阱）
                                      const finalBottleneck = (selection.bottleneck || []) as string[]
                                      const finalSel = { ...selection, bottleneck: finalBottleneck }
                                      // 手动进入下一问
                                      if (currentQIdx < questions.length - 1) {
                                        setCurrentQIdx(currentQIdx + 1)
                                      } else {
                                        setCurrentQIdx(currentQIdx + 1)
                                        setTimeout(() => {
                                          setStage('report')
                                          void mockGenerateDiagnosis(
                                            finalSel,
                                            selectedPath,
                                            budget,
                                            dailyHours
                                          )
                                        }, 800)
                                      }
                                    }}
                                    className="mt-3 inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full text-sm shadow-md hover:shadow-lg active:scale-95 transition-all"
                                  >
                                    完成本题，继续
                                    <ArrowRight size={14} />
                                  </button>
                                )}
                              </>
                            ) : (
                              <RadioGroup
                                options={q.options}
                                value={userAnswer as string | undefined}
                                onChange={(v) => handleSelect(q.key, v)}
                              />
                            )}
                          </div>
                        )}
                        {/* 已选答案反馈（多选用列表形式） */}
                        {idx < currentQIdx && (
                          (q.key === 'bottleneck' && Array.isArray(userAnswer) && userAnswer.length > 0) ? (
                            <div className="flex justify-end">
                              <div className="max-w-[85%] bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 text-sm flex flex-wrap items-center gap-1.5">
                                {userAnswer.map((v: string) => {
                                  const opt = q.options.find((o) => o.value === v)
                                  return opt ? (
                                    <span key={v} className="inline-flex items-center gap-1 bg-white/15 rounded-full px-2 py-0.5 text-xs">
                                      <span>{opt.emoji}</span>
                                      <span>{opt.label}</span>
                                    </span>
                                  ) : null
                                })}
                              </div>
                            </div>
                          ) : (
                            userAnswer && !Array.isArray(userAnswer) && (
                              <div className="flex justify-end">
                                <div className="max-w-[80%] bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 text-sm flex items-center gap-2">
                                  <span>{q.options.find((o) => o.value === userAnswer)?.emoji}</span>
                                  <span>{q.options.find((o) => o.value === userAnswer)?.label}</span>
                                </div>
                              </div>
                            )
                          )
                        )}
                      </motion.div>
                    )
                  })}

                  {/* 全部完成 */}
                  {currentQIdx >= questions.length && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="max-w-[90%] bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed flex items-center gap-2">
                        <CheckCircle2 size={14} />
                        <span>
                          数据收集完成！正在为您生成《OPC 智富蓝皮书》...
                        </span>
                      </div>
                    </motion.div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* LiveCalculator 时间预期管理（新版本） */}
                <AnimatePresence>
                  {selectedPath && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="mt-4 overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-400/30 rounded-xl p-3 md:p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Calculator size={14} className="text-amber-300" />
                          <span className="text-xs font-bold text-amber-200">
                            🧮 时间与预期管理 · {pathComparisons.find(p => p.key === selectedPath)?.label}
                          </span>
                        </div>

                        {/* 资金 + 时间输入 */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div>
                            <div className="text-[10px] text-white/60 mb-1">
                              💰 启动资金（元）
                            </div>
                            <input
                              type="number"
                              value={budget || ''}
                              onChange={(e) =>
                                setBudget(parseFloat(e.target.value) || 0)
                              }
                              placeholder="如 3000"
                              className="w-full h-10 bg-white/5 border border-white/15 rounded-lg px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/60"
                            />
                          </div>
                          <div>
                            <div className="text-[10px] text-white/60 mb-1">
                              ⏰ 日均时间（小时）
                            </div>
                            <input
                              type="number"
                              value={dailyHours || ''}
                              onChange={(e) =>
                                setDailyHours(parseFloat(e.target.value) || 0)
                              }
                              placeholder="如 3"
                              className="w-full h-10 bg-white/5 border border-white/15 rounded-lg px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/60"
                            />
                          </div>
                        </div>

                        {/* 3 / 7 / 15 天时间轴 */}
                        {(budget > 0 || dailyHours > 0) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-2 mb-3"
                          >
                            <Timeline3Day
                              timeline={generateTimeline(selectedPath, budget, dailyHours)}
                            />
                          </motion.div>
                        )}

                        {/* 双按钮：接受 / 换路径 */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                          <button
                            onClick={() => {
                              // 接受时间线 → 保存 OPC 等级 + 标记已接受 + 跳转到对应指南页
                              handleAcceptTimeline()
                            }}
                            disabled={budget === 0 || dailyHours === 0}
                            className="h-10 rounded-lg bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold hover:from-emerald-500/30 hover:to-green-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 size={12} />
                            我接受这个时间线
                          </button>
                          <button
                            onClick={handleSwitchPath}
                            className="h-10 rounded-lg bg-rose-500/10 border border-rose-400/30 text-rose-200 text-xs font-bold hover:bg-rose-500/20 transition-all flex items-center justify-center gap-1.5"
                          >
                            ⚠️ 太慢了，看看另一条路
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.section>
        )}

        {/* ═══ 4. 第三阶段：报告展示 + 付费拦截 ═══ */}
        {stage === 'report' && (
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
                      {mockReport.score}
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
                        {layerProfiles[mockReport.freeContent.layer].emoji}
                      </span>
                      <div className="text-base md:text-lg font-extrabold text-white">
                        你适合从【{mockReport.freeContent.layerLabel}】起步
                      </div>
                    </div>
                    <p className="text-sm text-white/85 leading-relaxed">
                      {mockReport.freeContent.summary}
                    </p>
                  </div>

                  {/* 3 条核心实战建议 */}
                  <div className="bg-blue-500/8 border border-blue-400/20 rounded-xl p-3 md:p-4">
                    <div className="text-[11px] font-bold text-blue-300 mb-2.5 flex items-center gap-1.5">
                      🎯 3 条核心实战建议
                    </div>
                    <ul className="space-y-1.5 text-xs text-white/85">
                      {mockReport.freeContent.suggestions.map((s, i) => (
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
                      title={mockReport.lockedContent.role.title}
                    >
                      <p className="text-xs text-white/70">
                        {mockReport.lockedContent.role.reason}
                      </p>
                    </LockedSection>
                    <LockedSection
                      icon={<ListChecks size={14} className="text-purple-300" />}
                      title={mockReport.lockedContent.weapons.title}
                    >
                      <p className="text-xs text-white/70">
                        2 工具 + 2 项目 + 1 服务 + 1 资源
                      </p>
                    </LockedSection>
                    <LockedSection
                      icon={<CalendarDays size={14} className="text-blue-300" />}
                      title={mockReport.lockedContent.roadmap.title}
                    >
                      <p className="text-xs text-white/70">
                        3 周 9 个关键动作
                      </p>
                    </LockedSection>
                    <LockedSection
                      icon={<Brain size={14} className="text-rose-300" />}
                      title={mockReport.lockedContent.agents.title}
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
                          onClick={handlePay}
                          disabled={paying}
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
                            {mockReport.lockedContent.role.bestLayer}
                          </div>
                          <p className="text-xs text-white/85 leading-relaxed mb-2">
                            {mockReport.lockedContent.role.reason}
                          </p>
                          <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-200 bg-amber-500/15 px-2 py-0.5 rounded-full">
                            <ArrowRight size={10} />
                            跃迁路径：{mockReport.lockedContent.role.transitionPath}
                          </div>
                        </div>

                        {/* 板块 2：四库武器 */}
                        <div className="bg-purple-500/10 border border-purple-400/30 rounded-xl p-4">
                          <div className="text-[11px] font-bold text-purple-300 mb-2.5 flex items-center gap-1.5">
                            🛠️ 二、四库全胜武器推荐
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-white/85">
                            <BulletLine label="🔧 工具" items={mockReport.lockedContent.weapons.tools} />
                            <BulletLine label="📁 项目" items={mockReport.lockedContent.weapons.projects} />
                            <BulletLine label="💼 服务" items={[mockReport.lockedContent.weapons.service]} single />
                            <BulletLine label="📚 资源" items={[mockReport.lockedContent.weapons.resource]} single />
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
                              items={mockReport.lockedContent.roadmap.week1}
                            />
                            <RoadmapWeek
                              week="第 2 周 (D8-D15)"
                              color="blue"
                              items={mockReport.lockedContent.roadmap.week2}
                            />
                            <RoadmapWeek
                              week="第 3 周 (D16-D30)"
                              color="violet"
                              items={mockReport.lockedContent.roadmap.week3}
                            />
                          </div>
                        </div>

                        {/* 板块 4：AI 智能体 */}
                        <div className="bg-rose-500/10 border border-rose-400/30 rounded-xl p-4">
                          <div className="text-[11px] font-bold text-rose-300 mb-2.5 flex items-center gap-1.5">
                            🤖 四、可借力的 AI 智能体
                          </div>
                          <div className="space-y-2">
                            {mockReport.lockedContent.agents.items.map((a, i) => (
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

                {/* ═══ 5. 15 分钟 1V1 免费咨询卡片（任务 1 R1）═══ */}
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
                        onClick={() => setBookingOpen(true)}
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

              {/* ═══ 5. 专属行动指令（基于 selectedPath） ═══ */}
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
                        <>你的第一步：开启你的<strong className="text-amber-200">第一家网店</strong>！</>
                      ) : (
                        <>你的第一步：开启你的<strong className="text-amber-200">第一个自媒体账号</strong>！</>
                      )}
                    </h3>
                    <Link
                      href={
                        selectedPath === 'TRADER'
                          ? '/market/tools?type=trader'
                          : '/market/tools?type=flow'
                      }
                      className="inline-flex items-center gap-2 px-5 py-3 bg-white text-slate-900 text-sm md:text-base font-extrabold rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-lg"
                    >
                      {selectedPath === 'TRADER' ? '🚀 立即去注册网店' : '🎬 立即去注册自媒体'}
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ═══ 6. 专家预约弹窗 ═══ */}
      <AnimatePresence>
        {bookingOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => !bookingSent && setBookingOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-slate-900 border border-white/15 rounded-2xl p-6"
            >
              {!bookingSent ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <CalendarDays size={18} className="text-amber-400" />
                      预约专家咨询
                    </h3>
                    <button
                      onClick={() => setBookingOpen(false)}
                      className="text-white/50 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-white/60 mb-4">
                    填写您的姓名与微信号，专家将在 1 小时内主动联系您。
                  </p>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault()
                      const fd = new FormData(e.currentTarget)
                      await submitQuickConsult({
                        name: String(fd.get('name') || ''),
                        contact: String(fd.get('contact') || ''),
                      })
                      setBookingSent(true)
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="text-[11px] text-white/50 mb-1 block">姓名</label>
                      <input
                        name="name"
                        required
                        className="w-full h-12 bg-white/5 border border-white/15 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-blue-400/60"
                        placeholder="请输入您的姓名"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-white/50 mb-1 block">微信号</label>
                      <input
                        name="contact"
                        required
                        className="w-full h-12 bg-white/5 border border-white/15 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-blue-400/60"
                        placeholder="请输入您的微信号"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-transform"
                    >
                      提交预约
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center mb-3">
                    <CheckCircle2 size={32} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">预约成功！</h3>
                  <p className="text-sm text-white/70 mb-5">
                    专家将在 1 小时内通过微信联系您，请留意好友申请。
                  </p>
                  <button
                    onClick={() => {
                      setBookingOpen(false)
                      setBookingSent(false)
                    }}
                    className="h-12 px-6 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-xl"
                  >
                    知道了
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

// ════════════════════════════════════════════════════════════════
// 7. 辅助小组件
// ════════════════════════════════════════════════════════════════

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
    <div className={single ? '' : ''}>
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

// 3 天 / 7 天 / 15 天预期路线图（新版本：时间与预期管理）
function Timeline3Day({ timeline }: { timeline: Timeline }) {
  const stages = [
    { key: 'd3', label: 'D1-3', sub: '启动', color: 'emerald', items: timeline.d3 },
    { key: 'd7', label: 'D4-7', sub: '验证', color: 'blue', items: timeline.d7 },
    { key: 'd15', label: 'D8-15', sub: '迭代', color: 'violet', items: timeline.d15 },
  ] as const

  const colorMap: Record<string, { dot: string; bg: string; text: string; ring: string }> = {
    emerald: {
      dot: 'bg-emerald-400 shadow-emerald-400/50',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-300',
      ring: 'ring-emerald-400/30',
    },
    blue: {
      dot: 'bg-blue-400 shadow-blue-400/50',
      bg: 'bg-blue-500/10',
      text: 'text-blue-300',
      ring: 'ring-blue-400/30',
    },
    violet: {
      dot: 'bg-violet-400 shadow-violet-400/50',
      bg: 'bg-violet-500/10',
      text: 'text-violet-300',
      ring: 'ring-violet-400/30',
    },
  }

  return (
    <div className="relative">
      {/* 时间线标题 */}
      <div className="flex items-center gap-1.5 mb-2">
        <CalendarDays size={12} className="text-amber-300" />
        <span className="text-[10px] font-bold text-amber-200">
          3 天 / 7 天 / 15 天 预期路线图
        </span>
      </div>

      {/* 横向阶段轨道（移动端纵向 / 桌面端横向） */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {stages.map((s, idx) => (
          <div
            key={s.key}
            className={`relative rounded-lg ${colorMap[s.color].bg} ring-1 ${colorMap[s.color].ring} p-2.5`}
          >
            {/* 阶段标签 */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className={`w-2 h-2 rounded-full ${colorMap[s.color].dot} shadow-md`} />
              <div className={`text-[10px] font-extrabold ${colorMap[s.color].text}`}>
                {s.label}
              </div>
              <div className="text-[10px] text-white/50">· {s.sub}</div>
              {idx < stages.length - 1 && (
                <ArrowRight
                  size={10}
                  className="ml-auto text-white/30 hidden md:block"
                />
              )}
            </div>
            {/* 任务列表 */}
            {s.items.length > 0 ? (
              <ul className="space-y-1">
                {s.items.map((it, i) => (
                  <li
                    key={i}
                    className="text-[11px] text-white/85 leading-snug flex items-start gap-1.5"
                  >
                    <span className={`${colorMap[s.color].text} font-bold flex-shrink-0`}>
                      {i + 1}.
                    </span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-[10px] text-white/40 italic">—</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
