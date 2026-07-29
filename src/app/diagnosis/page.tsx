'use client'

/**
 * 智富诊断主页面（4 阶段顶级漏斗）
 * ------------------------------------------------------------
 * 任务：拆 diagnosis/page.tsx（演进项 3.5）
 * 此文件精简后结构：
 *   - 静态数据：questions / pathComparisons / layerProfiles / mockReport
 *   - 状态机：Stage='select'|'chat'|'report'，主页面持有
 *   - 抽离子组件：Hero / EntrySelect / Report / BookingModal（_components/*）
 *   - 主页保留：chat 阶段（最高状态耦合） + RadioGroup / MultiButtonGroup
 *               + Timeline3Day（时间预期管理）
 * ------------------------------------------------------------
 */
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calculator,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { saveOPCRouteToStorage } from '@/lib/user-stage'
import { DIAGNOSIS_QUESTIONS, type Question, type QuestionOption } from './_data/questions'
import {
  PATH_COMPARISONS_DISPLAY,
  type SelectedPath,
} from './_data/pathComparisons'
import { LAYER_PROFILES, type LayerKey } from './_data/layerProfiles'
import { DiagnosisHero } from './_components/DiagnosisHero'
import { DiagnosisEntrySelect } from './_components/DiagnosisEntrySelect'
import { DiagnosisReport, type DiagnosisReportData } from './_components/DiagnosisReport'
import { BookingModal } from './_components/BookingModal'

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
// 1. 4 问对话脚本（已抽离到 _data/questions.ts）
// ════════════════════════════════════════════════════════════════
const questions = DIAGNOSIS_QUESTIONS

// ════════════════════════════════════════════════════════════════
// 2. 四层阶梯定位推演器（5-6 种路径组合演示）
// ════════════════════════════════════════════════════════════════
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

function matchLayer(sel: Selection) {
  // 多选兼容：bottleneck 为数组，包含某 value 即视为命中
  const has = (v: string) => sel.bottleneck?.includes(v) ?? false

  // 路径 1：交易型 — 个人/小微 + 懂供应链/销售 + 变现/获客 + 跑通一单
  if (
    (sel.identity === 'solo' || sel.identity === 'micro') &&
    (sel.strength === 'supply' || sel.strength === 'sales') &&
    (has('monetize') || has('traffic')) &&
    sel.goal === 'first'
  ) {
    return LAYER_PROFILES.trading
  }

  // 路径 2：流量型 — 个人 + 写文案/有本地 + 获客/变现 + 月入3万
  if (
    sel.identity === 'solo' &&
    (sel.strength === 'content' || sel.strength === 'local') &&
    (has('traffic') || has('monetize')) &&
    (sel.goal === '30k' || sel.goal === 'first')
  ) {
    return LAYER_PROFILES.traffic
  }

  // 路径 3：系统型 — 企业主/小微 + 技术/销售 + 定价/获客 + 高客单
  if (
    (sel.identity === 'boss' || sel.identity === 'micro') &&
    (sel.strength === 'tech' || sel.strength === 'sales') &&
    (has('pricing') || has('traffic')) &&
    (sel.goal === 'enterprise' || sel.goal === '30k')
  ) {
    return LAYER_PROFILES.system
  }

  // 路径 4：资产型 — 企业主 + 销售/资源 + 复制放大 + 全国主理人
  if (
    sel.identity === 'boss' &&
    (sel.strength === 'sales' || sel.strength === 'local') &&
    has('scale') &&
    (sel.goal === 'national' || sel.goal === 'enterprise')
  ) {
    return LAYER_PROFILES.asset
  }

  // 路径 5：内容起家 → 流量型 (兜底)
  if (sel.strength === 'content' && !sel.goal) {
    return LAYER_PROFILES.traffic
  }

  // 路径 6：技术起家 → 系统型 (兜底)
  if (sel.strength === 'tech' && !sel.goal) {
    return LAYER_PROFILES.system
  }

  return null
}

// ════════════════════════════════════════════════════════════════
// 3. 时间预期管理（根据路径 + 资金 + 时间生成 3/7/15 天路线图）
// ════════════════════════════════════════════════════════════════
interface Timeline {
  d3: string[]
  d7: string[]
  d15: string[]
}

function generateTimeline(
  path: SelectedPath | null,
  budget: number,
  hours: number
): Timeline {
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
// 4. 通用 OPC 报告数据
// ════════════════════════════════════════════════════════════════
const mockReport: DiagnosisReportData = {
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
// 5. Mock API 占位函数（留空以备真实接入）
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
async function submitQuickConsult(payload: { name: string; contact: string }): Promise<void> {
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
        return
      }
    }
  } catch {
    // 网络失败 / API 未就绪 → 降级 mock
  }
  await new Promise((r) => setTimeout(r, 400))
  // 兜底：本地 bookingId
  void payload // 标记使用避免 noUnusedParameters
}

// ════════════════════════════════════════════════════════════════
// 6. RadioGroup 子组件（移动端纵向 / 桌面端横向）
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
            {selected && <CheckCircle2 size={12} className="ml-auto text-emerald-400" />}
          </button>
        )
      })}
    </div>
  )
}

/**
 * MultiButtonGroup：多选按钮组（用于"最大瓶颈"等可多选题）
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

// 3 天 / 7 天 / 15 天预期路线图（chat 阶段实时展示）
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
      <div className="flex items-center gap-1.5 mb-2">
        <Calculator size={12} className="text-amber-300" />
        <span className="text-[10px] font-bold text-amber-200">
          3 天 / 7 天 / 15 天 预期路线图
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {stages.map((s, idx) => (
          <div
            key={s.key}
            className={`relative rounded-lg ${colorMap[s.color].bg} ring-1 ${colorMap[s.color].ring} p-2.5`}
          >
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

// ════════════════════════════════════════════════════════════════
// 7. 主页面：4 阶段顶级漏斗
// ════════════════════════════════════════════════════════════════
type Stage = 'select' | 'chat' | 'report' | 'expert'
type Mode = 'chat' | 'form'

export default function DiagnosisPage() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('select')
  const [mode, setMode] = useState<Mode>('chat')
  const [currentQIdx, setCurrentQIdx] = useState(0) // 0..3
  const [selection, setSelection] = useState<Selection>({})
  const [selectedPath, setSelectedPath] = useState<SelectedPath | null>(null)
  const [budget, setBudget] = useState<number>(0)
  const [dailyHours, setDailyHours] = useState<number>(0)
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
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

  // 从"路径选择卡"直接进入对话，自动填入初始背景
  const startChatWithPath = (path: SelectedPath) => {
    setSelectedPath(path)
    setMode('chat')
    setStage('chat')
    setCurrentQIdx(0)
    // 智能分流：把用户选定的路径写入 localStorage，供首页 STEP 02 智能跳转
    saveOPCRouteToStorage(path)
    // 自动填入"身份"作为初始背景
    const identity =
      path === 'TRADER' ? 'solo' : path === 'FLOW' ? 'solo' : path === 'SYSTEM' ? 'boss' : 'boss'
    setSelection({ identity })
  }

  // 用户想换一条路 → 回到"路径选择卡"阶段
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
   * 绿色按钮"我接受这个时间线"
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
      void mockGenerateDiagnosis(
        {
          identity: 'boss',
          strength: 'tech',
          bottleneck: ['pricing'],
          goal: 'enterprise',
        },
        'SYSTEM',
        5000,
        3
      )
    }, 500)
  }

  // 用户选择了一个选项（单选 / 多选统一入口）
  const handleSelect = (key: Question['key'], value: string) => {
    // bottleneck 是数组：toggle 行为
    if (key === 'bottleneck') {
      const cur = selection.bottleneck || []
      const next = cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value]
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
          void mockGenerateDiagnosis(newSel, selectedPath, budget, dailyHours)
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
    (Object.keys(selection).length / questions.length) * 100,
    100
  )

  return (
    <main className="min-h-screen pb-20">
      {/* ═══ 1. 顶部 Hero 区（已抽离） ═══ */}
      <DiagnosisHero />

      <AnimatePresence mode="wait">
        {/* ═══ 2. 第一阶段：入口选择器（已抽离） ═══ */}
        {stage === 'select' && (
          <DiagnosisEntrySelect
            pathComparisons={PATH_COMPARISONS_DISPLAY}
            onStartChat={startChat}
            onStartForm={startForm}
            onStartChatWithPath={startChatWithPath}
          />
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
                    <span className="text-base">🧠</span>
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
                        {idx < currentQIdx &&
                          (q.key === 'bottleneck' &&
                          Array.isArray(userAnswer) &&
                          userAnswer.length > 0 ? (
                            <div className="flex justify-end">
                              <div className="max-w-[85%] bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 text-sm flex flex-wrap items-center gap-1.5">
                                {userAnswer.map((v: string) => {
                                  const opt = q.options.find((o) => o.value === v)
                                  return opt ? (
                                    <span
                                      key={v}
                                      className="inline-flex items-center gap-1 bg-white/15 rounded-full px-2 py-0.5 text-xs"
                                    >
                                      <span>{opt.emoji}</span>
                                      <span>{opt.label}</span>
                                    </span>
                                  ) : null
                                })}
                              </div>
                            </div>
                          ) : (
                            userAnswer &&
                            !Array.isArray(userAnswer) && (
                              <div className="flex justify-end">
                                <div className="max-w-[80%] bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 text-sm flex items-center gap-2">
                                  <span>
                                    {q.options.find((o) => o.value === userAnswer)?.emoji}
                                  </span>
                                  <span>
                                    {q.options.find((o) => o.value === userAnswer)?.label}
                                  </span>
                                </div>
                              </div>
                            )
                          ))}
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
                        <span>数据收集完成！正在为您生成《OPC 智富蓝皮书》...</span>
                      </div>
                    </motion.div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* LiveCalculator 时间预期管理 */}
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
                            🧮 时间与预期管理 · {PATH_COMPARISONS_DISPLAY.find((p) => p.key === selectedPath)?.label}
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
                              onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
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
                              onChange={(e) => setDailyHours(parseFloat(e.target.value) || 0)}
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
                            onClick={handleAcceptTimeline}
                            disabled={budget === 0 || dailyHours === 0}
                            data-testid="accept-timeline"
                            className="h-10 rounded-lg bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold hover:from-emerald-500/30 hover:to-green-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 size={12} />
                            我接受这个时间线
                          </button>
                          <button
                            onClick={handleSwitchPath}
                            data-testid="switch-path"
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

        {/* ═══ 4. 第三阶段：报告展示 + 付费拦截（已抽离） ═══ */}
        {stage === 'report' && (
          <DiagnosisReport
            report={mockReport}
            layerProfiles={LAYER_PROFILES}
            paid={paid}
            paying={paying}
            selectedPath={selectedPath}
            onPay={handlePay}
            onOpenBooking={() => setBookingOpen(true)}
          />
        )}
      </AnimatePresence>

      {/* ═══ 5. 专家预约弹窗（已抽离） ═══ */}
      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onSubmit={submitQuickConsult}
      />
    </main>
  )
}
