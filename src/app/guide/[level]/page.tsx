'use client'

import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Circle,
  Lock,
  Star,
  ExternalLink,
  Bot,
  Lightbulb,
  BookOpen,
  AlertTriangle,
  Wand2,
  Brain,
  Rocket,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { UNLOCK_PRACTICE_THRESHOLD } from '@/lib/learning-progress-store'
import { GuideAICoach } from '@/components/guide/GuideAICoach'

/**
 * OPC 学习入门 · AI 知识能力构图
 * ------------------------------------------------------------
 * 动态路由 /guide/[level]
 *   level 取值: trader | flow | system | asset
 *
 * 页面定位（v2 重构）：
 *   从"工具推荐页"升级为"AI 知识能力构图"。
 *   核心观点：AI 是增效工具，OPC 必须掌握核心业务逻辑。
 *
 * 页面结构：
 *   1. 顶部 Hero（独立导航行 + 渐变标题）— 保留
 *   2. 角色定位 Callout：AI 是增效工具（黄色 callout）
 *   3. "AI 与 OPC 能力拆解" 2x2 Bento 网格
 *      - 💡 必须掌握的核心技能（黄标：OPC 亲自做）
 *      - 🤖 AI 赋能工具矩阵（蓝标：AI 帮你做）
 *      - 📚 必须掌握的行业与平台知识（黄标：OPC 亲自做）
 *      - ⚡️ 高频卡点与避坑指南
 *   4. 引用"运营实操"阶段的钩子横幅
 *   5. 战略抉择卡（自己干 vs 找人合作）— 保留
 *   6. 新手启航任务清单（进度条 + 3 任务）— 保留
 *   7. 底部阶段解锁 CTA — 保留
 * ------------------------------------------------------------
 */

type Level = 'trader' | 'flow' | 'system' | 'asset'

const LEVEL_META: Record<Level, {
  label: string
  emoji: string
  tagline: string
  badge: string
  bg: string
  ring: string
  // 任务 平台跳转链接
  registerUrl: string
  registerLabel: string
  downloadUrl: string
  downloadLabel: string
}> = {
  trader: {
    label: '交易型 OPC',
    emoji: '💰',
    tagline: 'AI 网店群 · 智富严选 · 跑通首单赚第一笔钱',
    badge: '第一层 · 跑通',
    bg: 'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500',
    ring: 'ring-amber-300/60',
    registerUrl: 'https://ishop.taobao.com/openshop/tb_open_shop_landing.htm',
    registerLabel: '前往淘宝商家开店',
    downloadUrl: 'https://www.lingxixai.com',
    downloadLabel: '前往灵犀 AI',
  },
  flow: {
    label: '流量型 OPC',
    emoji: '🔥',
    tagline: '内容获客 · 自媒体矩阵 · 流量变现',
    badge: '第二层 · 放大',
    bg: 'bg-gradient-to-br from-rose-500 to-pink-600',
    ring: 'ring-rose-300/60',
    registerUrl: 'https://www.douyin.com/',
    registerLabel: '前往抖音创作者中心',
    downloadUrl: 'https://jimeng.jianying.com',
    downloadLabel: '前往即梦 Dreamina',
  },
  system: {
    label: '系统型 OPC',
    emoji: '⚙️',
    tagline: '企业流程改造 · 高客单 · AI 转型',
    badge: '第三层 · 转型',
    bg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    ring: 'ring-blue-300/60',
    registerUrl: 'https://www.coze.cn/overview',
    registerLabel: '前往扣子 Coze',
    downloadUrl: 'https://www.dify.ai',
    downloadLabel: '前往 Dify',
  },
  asset: {
    label: '资产型 OPC',
    emoji: '💎',
    tagline: '数字资产 · 全球外包 · 可复用交付',
    badge: '第四层 · 资产化',
    bg: 'bg-gradient-to-br from-violet-500 to-fuchsia-600',
    ring: 'ring-violet-300/60',
    registerUrl: 'https://www.coze.cn/store',
    registerLabel: '前往 Coze 商店',
    downloadUrl: 'https://www.lingxixai.com',
    downloadLabel: '前往灵犀 AI',
  },
}

// ════════════════════════════════════════════════════════════════
// 知识能力构图 · Mock 数据
// 每个 level 包含 4 个板块：skills / tools / rules / pitfalls
// 这是「AI 与 OPC 能力拆解」Bento 网格的数据源
// 未来可接入 /api/ai/knowledge-map，但保证本地 fallback 不留白
// ════════════════════════════════════════════════════════════════

interface KnowledgeItem {
  /** 条目标题（核心技能名 / 工具名 / 规则名，可选 — pitfalls 用 pitfall 字段） */
  title?: string
  /** 简短说明（可选） */
  desc?: string
  /** 工具名（卡片 2 专用：突出显示 AI 工具名） */
  tool?: string
  /** 卡点描述（卡片 4 专用：用户困境） */
  pitfall?: string
  /** 应对策略（卡片 4 专用：AI / OPC 解决方案） */
  strategy?: string
}

interface KnowledgeData {
  /** 卡片 1：必须掌握的核心技能（黄标） */
  skills: KnowledgeItem[]
  /** 卡片 2：AI 赋能工具矩阵（蓝标） */
  tools: KnowledgeItem[]
  /** 卡片 3：必须掌握的行业与平台知识（黄标） */
  rules: KnowledgeItem[]
  /** 卡片 4：高频卡点与避坑指南（黄 + 蓝标） */
  pitfalls: KnowledgeItem[]
}

const knowledgeData: Record<Level, KnowledgeData> = {
  // ─────── 交易型 OPC：跑通首单 ───────
  trader: {
    skills: [
      {
        title: '选品逻辑',
        desc: '判断一个品能不能做：需求强度、利润空间、竞争密度、复购频次',
      },
      {
        title: '成本利润核算',
        desc: '出厂价 + 物流 + 平台扣点 + 退货损耗 = 真实净利，不能只看 GMV',
      },
      {
        title: '定价策略',
        desc: '锚定价 / 阶梯价 / 套餐价 / 满减组合：让用户感觉"占便宜"',
      },
      {
        title: '库存风险控制',
        desc: '先小批量测款再放大，规避 SKU 压货 3 个月资金断裂',
      },
    ],
    tools: [
      {
        tool: '灵犀 AI',
        title: '批量生成商品详情文案',
        desc: '10 秒生成 1 套详情页 + 营销话术，替代逐字手写',
      },
      {
        tool: '豹纹工坊',
        title: '批量生成短视频素材',
        desc: '上传产品图 → 一键出 30 条短视频，自动匹配爆款 BGM',
      },
      {
        tool: '店侦探',
        title: '监控竞品销量与定价',
        desc: 'AI 帮你追踪 100 个对标店铺的 SKU 上下架节奏',
      },
      {
        tool: '阿奇索自动发货',
        title: '24h 无人值守自动发货',
        desc: '从下单到回执全流程自动化，1 个人管 10 个店',
      },
    ],
    rules: [
      {
        title: '淘宝 / 拼多多新手保证金',
        desc: '类目不同保证金 1000-50000 不等，开店前必查',
      },
      {
        title: '电商类目限制清单',
        desc: '食品 / 医疗 / 化妆品 / 书籍：需要特殊资质（食品经营许可证等）',
      },
      {
        title: '电商违禁词库',
        desc: '"最 / 第一 / 绝对" 等极限词禁用，违者下架 + 罚款',
      },
      {
        title: '售后维权规则',
        desc: '7 天无理由 / 运费险 / 品质退款：必须留有 3% 利润缓冲',
      },
    ],
    pitfalls: [
      {
        pitfall: '不知道选什么品？',
        strategy: '让 AI 帮你罗列 5 个蓝海类目（搜 1688 销量榜 + 抖店飙升榜交叉对比）',
      },
      {
        pitfall: '商品上架后没流量？',
        strategy: '用 AI 拆解 TOP 10 竞品主图 / 标题 / SKU 结构，反向生成你的差异化方案',
      },
      {
        pitfall: '发货物流延迟 / 客户投诉？',
        strategy: '让 AI 草拟 3 套客服话术（安抚型 / 补偿型 / 物流型），一键复制到千牛',
      },
      {
        pitfall: '退货率突然飙升？',
        strategy: '让 AI 分析最近 50 条差评关键词，定位是商品 / 物流 / 描述哪一环的问题',
      },
    ],
  },

  // ─────── 流量型 OPC：内容获客 ───────
  flow: {
    skills: [
      {
        title: '账号人设定位',
        desc: '一句话讲清"我是谁 / 为谁 / 提供什么独特价值"，贯穿所有内容',
      },
      {
        title: '爆款选题网感',
        desc: '判断一个话题能不能爆：情绪共鸣度 + 争议性 + 可执行性',
      },
      {
        title: '粉丝互动策略',
        desc: '评论回复 / 私信钩子 / 社群引流：把公域流量沉淀为私域',
      },
      {
        title: '数据复盘能力',
        desc: '完播率 / 互动率 / 转粉率：3 个核心指标决定账号生死',
      },
    ],
    tools: [
      {
        tool: 'Deepseek',
        title: '脚本撰写辅助',
        desc: '5 分钟生成 10 个选题大纲 + 完整脚本框架，你只需要做风格化润色',
      },
      {
        tool: '先锋派数字人',
        title: '7×24h 口播视频生成',
        desc: '1 张照片 + 1 段文案 = 1 条 60s 口播视频，量产不疲劳',
      },
      {
        tool: '即梦 Dreamina',
        title: 'AI 批量生成爆款封面',
        desc: '输入标题 → AI 自动出 20 张差异化封面，CTR 提升 30%+',
      },
      {
        tool: '海绵音乐',
        title: 'AI 配乐 / 翻唱 / 语音克隆',
        desc: 'BGM / 配音 / 翻唱一键生成，规避版权风险',
      },
    ],
    rules: [
      {
        title: '抖音算法推荐逻辑',
        desc: '完播率 > 互动率 > 转粉率：前 3 秒定生死，必须有强钩子',
      },
      {
        title: '小红书内容规范',
        desc: '禁用夸张承诺 / 虚假对比 / 引流站外，违者限流 7-30 天',
      },
      {
        title: '平台违禁词 / 敏感词',
        desc: '微信 / 抖音 / 小红书各有独立词库，发布前必查',
      },
      {
        title: '广告法红线',
        desc: '"最 / 第一 / 唯一" 等极限词 + 医疗功效承诺，0 容忍',
      },
    ],
    pitfalls: [
      {
        pitfall: '内容没流量，播放量卡在 200？',
        strategy: '让 AI 拆解对标账号的 3 个爆款结构（开头 / 中段 / 钩子），反向生成你的版本',
      },
      {
        pitfall: '粉丝增长慢，变现路径不清晰？',
        strategy: '用 AI 帮你设计 3 层变现漏斗（9.9 引流 → 199 训练营 → 1980 私域）',
      },
      {
        pitfall: '内容同质化严重，被算法降权？',
        strategy: '让 AI 分析你近 30 条内容的主题 / 情绪 / 形式分布，识别重复模式并优化',
      },
      {
        pitfall: '想做矩阵但分身乏术？',
        strategy: '用 AI 工作流搭建"选题 → 脚本 → 配音 → 剪辑 → 字幕"全自动流水线',
      },
    ],
  },

  // ─────── 系统型 OPC：企业转型 ───────
  system: {
    skills: [
      {
        title: '业务流程解构',
        desc: '把一个企业流程拆解为 SOP：输入 / 处理 / 输出 / 异常处理',
      },
      {
        title: 'AI 改造可行性评估',
        desc: '判断哪个环节值得 AI 化：高重复 + 低创意 + 有数据 = 优先改造',
      },
      {
        title: '客户需求诊断',
        desc: '30 分钟问对 5 个问题，准确定位客户真实痛点（而非表面需求）',
      },
      {
        title: '项目报价与交付',
        desc: '按效果 / 按节点 / 按月费 3 种报价模式，匹配不同客户类型',
      },
    ],
    tools: [
      {
        tool: 'Dify',
        title: '工作流编排 + 智能体发布',
        desc: '拖拽式搭建企业级 AI 应用：客服 / 知识库 / 数据分析',
      },
      {
        tool: 'Coze 扣子',
        title: '零代码搭建企业级智能助手',
        desc: '30 分钟搭出专属 AI 客服 / 销售助手，零基础也能交付',
      },
      {
        tool: 'TRAE IDE',
        title: 'AI 原生 IDE',
        desc: '面向系统型 OPC 的代码生成工具，加速 MVP 开发',
      },
      {
        tool: '飞书多维表格',
        title: '企业数据中台',
        desc: 'AI 字段 + 自动化流程 = 替代 80% 的传统 CRM',
      },
    ],
    rules: [
      {
        title: '企业数据合规',
        desc: '客户数据本地化部署 / 隐私计算 / GDPR 适配：B 端必谈',
      },
      {
        title: 'AI 落地效果评估',
        desc: '不能只看 demo：实际节省人力 / 提升转化 / ROI 才是付费标准',
      },
      {
        title: '合同与知识产权',
        desc: '工作流代码 / 智能体 / 训练数据：归属与复用条款必须写清',
      },
      {
        title: '持续运维 SLA',
        desc: '99.9% 可用性 / 7×24 响应 / 月度迭代：B 端服务的 3 条生死线',
      },
    ],
    pitfalls: [
      {
        pitfall: '客户说"想要 AI"但需求模糊？',
        strategy: '用 AI 帮你生成 5 个行业诊断问卷模板（10 分钟锁定真实痛点）',
      },
      {
        pitfall: 'POC 演示效果很好，正式交付被打回？',
        strategy: '提前用 AI 模拟 100 个边缘 case，识别模型崩溃点并设计人工兜底',
      },
      {
        pitfall: '报价太低亏本，报价太高丢单？',
        strategy: '让 AI 帮你测算 3 种定价模型（按效果 / 按节点 / 按月费）的盈亏平衡点',
      },
      {
        pitfall: '交付完客户不会用，复购率低？',
        strategy: '用 AI 生成定制化操作手册 + 录屏脚本，把"会用"门槛降到 0',
      },
    ],
  },

  // ─────── 资产型 OPC：数字资产 ───────
  asset: {
    skills: [
      {
        title: '数字资产估值',
        desc: '判断一个 AI 工具 / 工作流 / 智能体值多少钱：复用次数 × 边际成本',
      },
      {
        title: 'SaaS 化产品设计',
        desc: '把单次服务封装为可订阅的标准化产品（用户自助 / 自动交付）',
      },
      {
        title: '全球外包交付',
        desc: 'AI + 海外兼职：把交付时间从 30 天压缩到 3 天',
      },
      {
        title: '投资人对接能力',
        desc: '讲清"为什么是你 / 为什么是现在 / 为什么能赚大钱"3 个核心问题',
      },
    ],
    tools: [
      {
        tool: 'Dify',
        title: '工作流 + 智能体商业化',
        desc: '把内部工作流封装为对外可售卖的 SaaS / 智能体',
      },
      {
        tool: 'Coze 商店',
        title: '智能体上架变现',
        desc: '在 Coze 商店发布你的智能体，按调用次数自动分账',
      },
      {
        tool: '灵犀 AI',
        title: '数字内容资产沉淀',
        desc: '把碎片化经验沉淀为可复用的提示词 / 工作流 / 知识库',
      },
      {
        tool: '硅基流动',
        title: 'AI 算力调度',
        desc: '按需调度多模型算力，把单次调用成本压到 0.01 元',
      },
    ],
    rules: [
      {
        title: '数字资产确权',
        desc: '工作流 / 智能体 / 训练数据：在 GitHub / 区块链 / 版权局多重备案',
      },
      {
        title: '订阅经济模型',
        desc: '免费试用 → 基础版 → 专业版 → 企业版：4 档定价覆盖 90% 客群',
      },
      {
        title: '全球合规适配',
        desc: '数据出境 / 税务 / 支付：海外营收必须做合规架构',
      },
      {
        title: '资产退出路径',
        desc: '持续运营 / 并购 / 上市：3 条退出路径决定资产估值倍数',
      },
    ],
    pitfalls: [
      {
        pitfall: '做出来的工具没人用，付费率低？',
        strategy: '用 AI 分析 100 个种子用户的使用路径，定位卡点并优化 onboarding',
      },
      {
        pitfall: '想全球化但不懂海外市场？',
        strategy: '让 AI 调研 5 个目标市场的用户画像 / 竞品 / 定价，输出 go-to-market 报告',
      },
      {
        pitfall: '资产有但不知道怎么估值？',
        strategy: '用 AI 套用 3 套估值模型（DCF / 可比公司 / 风险因子），输出专业 BP 附件',
      },
      {
        pitfall: '想融资但不知道 BP 怎么写？',
        strategy: '让 AI 帮你生成投资人偏好的 BP 结构（10 页 / 20 页 / 30 页 3 套版本）',
      },
    ],
  },
}

// ════════════════════════════════════════════════════════════════
// 学习进度类型（与 lib/learning-progress-store 保持一致）
// ════════════════════════════════════════════════════════════════

interface LearningProgress {
  phone: string
  opcLevel?: string
  task_browse: boolean
  task_register: boolean
  task_download: boolean
  learning_score: number
  can_unlock_practice: boolean
  step_diagnosis_done: boolean
  step_learning_done: boolean
  step_practice_done: boolean
  step_scaleup_done: boolean
  updatedAt: string
  createdAt: string
}

/**
 * 获取或创建匿名用户手机号（localStorage 持久化）
 */
function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'ssr-device'
  let id = window.localStorage.getItem('opc_device_id')
  if (!id) {
    id = `dev-${Date.now()}-${Math.floor(Math.random() * 100000)}`
    window.localStorage.setItem('opc_device_id', id)
  }
  return id
}

// ════════════════════════════════════════════════════════════════
// 主页组件
// ════════════════════════════════════════════════════════════════

export default function LevelGuidePage() {
  const params = useParams<{ level: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawLevel = (params?.level || 'trader') as string
  const validLevels: Level[] = ['trader', 'flow', 'system', 'asset']
  const level: Level = (validLevels.includes(rawLevel as Level) ? rawLevel : 'trader') as Level

  const meta = LEVEL_META[level]
  const fromSource = searchParams?.get('from') || ''

  // 当前 level 的知识能力数据（无接口，静态 Mock，永不空白）
  const knowledge = knowledgeData[level]

  // ──── 学习进度状态 ────
  const [progress, setProgress] = useState<LearningProgress | null>(null)
  const [submittingTask, setSubmittingTask] = useState<string | null>(null)

  // 首次加载拉取进度
  useEffect(() => {
    const phone = getOrCreateDeviceId()
    fetch(`/api/user/learning-progress?phone=${encodeURIComponent(phone)}`)
      .then((r) => r.json())
      .then((resp) => {
        if (resp.success) setProgress(resp.data)
      })
      .catch(() => {
        // 静默失败，使用默认空进度
      })
  }, [])

  // 完成任务打卡
  const completeTask = useCallback(
    async (task: 'browse' | 'register' | 'download') => {
      if (submittingTask) return
      setSubmittingTask(task)
      try {
        const phone = getOrCreateDeviceId()
        const res = await fetch('/api/user/learning-progress', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, action: task }),
        })
        const resp = await res.json()
        if (resp.success) {
          setProgress(resp.data)
        }
      } catch {
        // 静默失败
      } finally {
        setSubmittingTask(null)
      }
    },
    [submittingTask]
  )

  // 浏览任务：进入页面 1.5s 后自动标记
  useEffect(() => {
    if (progress?.task_browse) return
    const t = setTimeout(() => {
      completeTask('browse')
    }, 1500)
    return () => clearTimeout(t)
  }, [progress?.task_browse, completeTask])

  const score = progress?.learning_score ?? 0
  const unlocked = progress?.can_unlock_practice ?? false

  // ════════ AI 智富私教上下文 ═══════
  // 从 localStorage 读取当前城市（与 CitySelector 保持一致）
  const CITY_CODE_TO_NAME: Record<string, string> = {
    shenzhen: '深圳',
    dongguan: '东莞',
    liuzhou: '柳州',
    wuhai: '乌海',
  }
  const userCity: string = (() => {
    if (typeof window === 'undefined') return '深圳'
    const code = window.localStorage.getItem('lps.selectedCity') || 'shenzhen'
    return CITY_CODE_TO_NAME[code] || '深圳'
  })()

  // 从 localStorage 读取 opc_level（智富身份）
  const userOpcLevel: string | null = (() => {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem('opc_level') || null
  })()

  // 当前页面路径（客户端 mount 后才设置，避免 SSR hydration 不一致）
  const [currentPath, setCurrentPath] = useState<string>(`/guide/${level}`)
  useEffect(() => {
    setCurrentPath(window.location.pathname)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* ════════ 顶部 Hero ════════ */}
      <section
        className={`${meta.bg} text-white px-5 pt-6 pb-8 md:pt-10 md:pb-12 relative overflow-hidden`}
      >
        <div aria-hidden className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/5 blur-3xl" />

        <div className="max-w-lg md:max-w-6xl md:mx-auto relative">
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-white/90 hover:text-white text-xs md:text-sm bg-white/15 hover:bg-white/25 backdrop-blur px-3 py-1.5 rounded-full transition-colors"
            >
              <ArrowLeft size={14} />
              返回
            </button>
            <Link href="/" className="text-white/80 hover:text-white text-xs md:text-sm transition-colors">
              良朋社 OPC
            </Link>
          </div>

          <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-widest text-white/80 uppercase mb-2">
            <Sparkles size={12} className="md:w-3.5 md:h-3.5" />
            {meta.badge}
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold leading-tight drop-shadow-sm">
            <span className="mr-2">{meta.emoji}</span>
            [{meta.label}] 专属学习方案
          </h1>
          <p className="mt-2 text-sm md:text-base text-white/90 leading-relaxed max-w-2xl">
            {meta.tagline}
          </p>

          {fromSource === 'guide' && (
            <div className="mt-3 inline-flex items-center gap-1 text-[10px] bg-white/20 backdrop-blur px-2 py-1 rounded-full">
              ✨ 来自指南页的推荐
            </div>
          )}
        </div>
      </section>

      {/* ════════ AI 增效工具 · 角色定位 Callout ════════ */}
      <section className="px-5 py-4 md:py-6">
        <div className="max-w-lg md:max-w-6xl md:mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200 shadow-sm">
            <div aria-hidden className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-amber-300/30 blur-2xl" />
            <div aria-hidden className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-orange-300/30 blur-2xl" />
            <div className="relative p-4 md:p-5 flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md">
                <Brain size={20} className="md:w-6 md:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] md:text-xs font-extrabold text-amber-700 tracking-wider uppercase mb-0.5">
                  🎯 AI × OPC 角色定位
                </div>
                <p className="text-sm md:text-base font-bold text-slate-900 leading-tight">
                  在【{meta.label}】的实操中，AI 是你的增效工具
                </p>
                <p className="mt-1 text-xs md:text-sm text-slate-700 leading-relaxed">
                  你需要掌握核心业务逻辑，AI 负责批量执行。请查看下方的能力拆解图。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ AI 与 OPC 能力拆解 · 2x2 Bento 网格 ════════ */}
      <section className="px-5 py-2 md:py-4">
        <div className="max-w-lg md:max-w-6xl md:mx-auto">
          {/* 区块标题 + 图例 */}
          <div className="mb-4 md:mb-5 flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg md:text-2xl font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                <span className="text-xl md:text-2xl">🗺️</span>
                AI 与 OPC 能力拆解
              </h2>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                看清什么能交给 AI · 什么必须自己动脑
              </p>
            </div>
            {/* 图例：🟡 OPC 亲自做 / 🔵 AI 帮你做 */}
            <div className="flex items-center gap-1.5 flex-wrap text-[10px] md:text-xs">
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-full font-bold">
                🟡 OPC 亲自做
              </span>
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full font-bold">
                🔵 AI 帮你做
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {/* 卡片 1：必须掌握的核心技能（黄标） */}
            <KnowledgeCard
              kind="skills"
              emoji="💡"
              title="必须掌握的核心技能"
              subtitle="AI 无法替代 · 决策与判断"
              ownerTag="opc"
              accent="amber"
              items={knowledge.skills}
              renderItem={(it) => (
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-base">
                    🎯
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 leading-tight">
                        {it.title}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full">
                        🟡 OPC 亲自做
                      </span>
                    </div>
                    {it.desc && (
                      <p className="mt-0.5 text-[11px] text-slate-600 leading-snug">
                        {it.desc}
                      </p>
                    )}
                  </div>
                </div>
              )}
            />

            {/* 卡片 2：AI 赋能工具矩阵（蓝标） */}
            <KnowledgeCard
              kind="tools"
              emoji="🤖"
              title="AI 赋能工具矩阵"
              subtitle="批量执行 · 7×24 跑腿"
              ownerTag="ai"
              accent="blue"
              items={knowledge.tools}
              renderItem={(it) => (
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Bot size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {it.tool && (
                        <span className="text-sm font-extrabold text-blue-700 leading-tight">
                          {it.tool}
                        </span>
                      )}
                      <span className="text-slate-300 text-xs">→</span>
                      <span className="text-sm font-bold text-slate-900 leading-tight">
                        {it.title}
                      </span>
                    </div>
                    {it.desc && (
                      <p className="mt-0.5 text-[11px] text-slate-600 leading-snug">
                        {it.desc}
                      </p>
                    )}
                    <span className="mt-1.5 inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full">
                      🔵 AI 帮你做
                    </span>
                  </div>
                </div>
              )}
            />

            {/* 卡片 3：必须掌握的行业与平台知识（黄标） */}
            <KnowledgeCard
              kind="rules"
              emoji="📚"
              title="必须掌握的行业与平台知识"
              subtitle="实操前必读 · 避坑护身符"
              ownerTag="opc"
              accent="amber"
              items={knowledge.rules}
              renderItem={(it) => (
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-base">
                    📋
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 leading-tight">
                        {it.title}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full">
                        🟡 OPC 亲自做
                      </span>
                    </div>
                    {it.desc && (
                      <p className="mt-0.5 text-[11px] text-slate-600 leading-snug">
                        {it.desc}
                      </p>
                    )}
                  </div>
                </div>
              )}
            />

            {/* 卡片 4：高频卡点与避坑指南 */}
            <KnowledgeCard
              kind="pitfalls"
              emoji="⚡️"
              title="高频卡点与避坑指南"
              subtitle="新手踩坑实录 · AI 给解法"
              ownerTag="mixed"
              accent="rose"
              items={knowledge.pitfalls}
              renderItem={(it) => (
                <div className="space-y-1.5">
                  {/* 卡点（黄标） */}
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-6 h-6 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center text-xs">
                      ⚠️
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[12px] font-bold text-slate-900 leading-tight">
                          {it.pitfall}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full">
                          🟡 卡点
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* 策略（蓝标） */}
                  {it.strategy && (
                    <div className="flex items-start gap-2 pl-1">
                      <div className="flex-shrink-0 w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Wand2 size={11} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-1.5 flex-wrap">
                          <span className="text-[11px] text-slate-700 leading-snug">
                            {it.strategy}
                          </span>
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            🔵 AI 解法
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            />
          </div>
        </div>
      </section>

      {/* ════════ 引用"运营实操"阶段的钩子横幅 ════════ */}
      <section className="px-5 py-4 md:py-6">
        <div className="max-w-lg md:max-w-6xl md:mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg">
            <div aria-hidden className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
            <div aria-hidden className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-white/10 blur-3xl" />

            <div className="relative p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
              <div className="flex items-start md:items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Rocket size={20} className="md:w-6 md:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] md:text-xs font-extrabold text-white/80 tracking-wider uppercase mb-0.5 flex items-center gap-1">
                    <Sparkles size={10} />
                    STEP 03 · 运营实操预告
                  </div>
                  <p className="text-sm md:text-base font-bold leading-snug">
                    熟读以上能力矩阵后，你是不是已经跃跃欲试了？
                  </p>
                  <p className="text-[11px] md:text-xs text-white/85 mt-0.5">
                    前往【运营实操】阶段，我们将手把手带你走一遍 SOP 执行流程
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push(`/market/projects?recommend=${level}`)}
                className="group flex-shrink-0 inline-flex items-center justify-center gap-1.5 bg-white hover:bg-amber-50 text-blue-700 font-extrabold text-sm px-5 py-3 rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
              >
                前往运营实操
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ 战略抉择卡：自己干 vs 找人合作 ═══════ */}
      <section className="px-5 py-2">
        <div className="max-w-lg md:max-w-6xl md:mx-auto">
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 mb-8 flex flex-col gap-4">
            <div>
              <h2 className="text-base md:text-lg font-extrabold text-slate-900 leading-tight">
                🎯 你已经了解 OPC 所需工具，下一步打算怎么做？
              </h2>
              <p className="mt-1.5 text-xs md:text-sm text-slate-600 leading-relaxed">
                你是打算自己一步步落地干，还是想找有经验的资深 OPC 合作共赢？
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mt-2">
              {/* 按钮 1：自己来，进入运营实操 */}
              <button
                type="button"
                onClick={() => router.push(`/market/projects?recommend=${level}`)}
                className="flex-1 h-14 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm md:text-base rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
              >
                💪 我自己来，开始干！
                <ArrowRight size={16} />
              </button>

              {/* 按钮 2：找人合作，进入服务撮合 */}
              <button
                type="button"
                onClick={() => router.push('/market/services?from=guide&type=collaboration')}
                className="flex-1 h-14 inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm md:text-base rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
              >
                🤝 找人合作，我要找资深 OPC / 资产型 OPC 帮我操盘！
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ 新手启航任务清单（任务 2 核心）══════ */}
      <section className="px-5 py-2">
        <div className="max-w-lg md:max-w-6xl md:mx-auto">
          <div className="relative rounded-3xl bg-white border border-slate-200 shadow-sm p-5 md:p-7 overflow-hidden">
            {/* 装饰光晕 */}
            <div aria-hidden className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-blue-100 blur-3xl opacity-60" />
            <div aria-hidden className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-emerald-100 blur-3xl opacity-60" />

            <div className="relative">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-blue-600 mb-1">
                    🎯 STEP 02 · 新手启航
                  </div>
                  <h2 className="text-lg md:text-2xl font-extrabold text-slate-900 leading-tight">
                    新手启航任务清单
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500 mt-1">
                    完成 3 个任务，累计 {UNLOCK_PRACTICE_THRESHOLD} 分即可解锁「运营实操」阶段
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl md:text-3xl font-extrabold text-slate-900">
                    {score}
                    <span className="text-sm text-slate-400 font-bold">/100</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">SCORE</div>
                </div>
              </div>

              {/* 进度条 */}
              <div className="mb-5">
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      unlocked
                        ? 'bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600'
                        : 'bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600'
                    }`}
                    style={{ width: `${Math.min(100, score)}%` }}
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10px] font-bold text-slate-500">
                  <span>0</span>
                  <span className={score >= 20 ? 'text-blue-600' : ''}>+20 浏览</span>
                  <span className={score >= 60 ? 'text-blue-600' : ''}>+40 注册</span>
                  <span className={score >= 100 ? 'text-emerald-600' : ''}>+40 下载</span>
                  <span className={unlocked ? 'text-emerald-600' : 'text-slate-400'}>
                    {unlocked ? '✓ 已解锁' : `${UNLOCK_PRACTICE_THRESHOLD} 解锁`}
                  </span>
                </div>
              </div>

              {/* 3 个任务卡 */}
              <div className="space-y-3">
                <TaskCard
                  icon="📖"
                  title="任务 1：浏览学习"
                  desc="完成当前学习页面的内容了解（已自动标记）"
                  score={20}
                  done={!!progress?.task_browse}
                  loading={submittingTask === 'browse'}
                  onComplete={() => completeTask('browse')}
                  ctaText="我已浏览，立即打卡"
                  color="emerald"
                />
                <TaskCard
                  icon="🏪"
                  title="任务 2：注册账号"
                  desc={`前往注册你的第一个${level === 'flow' ? '自媒体' : '网店'}账号`}
                  score={40}
                  done={!!progress?.task_register}
                  loading={submittingTask === 'register'}
                  onComplete={() => completeTask('register')}
                  externalUrl={meta.registerUrl}
                  externalLabel={meta.registerLabel}
                  ctaText="我已注册，完成打卡"
                  color="blue"
                />
                <TaskCard
                  icon="⚙️"
                  title="任务 3：下载工具"
                  desc="配置并下载首款 AI 工具（灵犀 AI / 即梦 / Dify 等）"
                  score={40}
                  done={!!progress?.task_download}
                  loading={submittingTask === 'download'}
                  onComplete={() => completeTask('download')}
                  externalUrl={meta.downloadUrl}
                  externalLabel={meta.downloadLabel}
                  ctaText="我已下载/配置完成"
                  color="purple"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ 底部阶段解锁 CTA ════════ */}
      <section className="px-5 mt-6 mb-8">
        <div className="max-w-lg md:max-w-6xl md:mx-auto">
          <div
            className={`relative overflow-hidden rounded-3xl p-6 md:p-8 shadow-2xl text-center md:text-left ${
              unlocked
                ? `${meta.bg} text-white`
                : 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-500'
            }`}
          >
            {unlocked ? (
              <>
                <div aria-hidden className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
                <div aria-hidden className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
                <div className="relative flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold tracking-wider text-white/80 uppercase mb-2">
                      <Sparkles size={14} />
                      STEP 03 · 已解锁
                    </div>
                    <h3 className="text-xl md:text-2xl font-extrabold leading-snug">
                      恭喜达标！前往运营实操 → 开启你的第一个项目
                    </h3>
                    <p className="mt-1.5 text-xs md:text-sm text-white/85">
                      从【项目库】精准选品，跟随 SOP 执行第一套完整商业闭环节奏
                    </p>
                  </div>
                  <Link
                    href="/market/projects"
                    className="group flex-shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-2xl font-extrabold text-sm md:text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    <Rocket size={18} className="md:w-5 md:h-5" />
                    前往运营实操
                    <ArrowRight size={18} className="md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="w-14 h-14 rounded-full bg-slate-400/30 flex items-center justify-center">
                  <Lock size={24} className="text-slate-500" />
                </div>
                <h3 className="text-base md:text-lg font-extrabold">
                  🔒 需完成新手任务（需达到 {UNLOCK_PRACTICE_THRESHOLD} 分）解锁运营实操
                </h3>
                <p className="text-xs md:text-sm text-slate-500 max-w-md">
                  当前 {score} / {UNLOCK_PRACTICE_THRESHOLD} 分，还差 {UNLOCK_PRACTICE_THRESHOLD - score} 分。继续完成下方任务即可解锁。
                </p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                  <Star size={12} />
                  <span>STEP 03 · 待解锁</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════ AI 智富私教浮动教练（右下角）══════ */}
      <GuideAICoach
        level={level}
        page={currentPath}
        city={userCity}
        opcLevel={userOpcLevel}
      />
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// 任务卡片（与原版一致）
// ════════════════════════════════════════════════════════════════

const COLOR_MAP = {
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    icon: 'bg-emerald-100 text-emerald-600',
    pill: 'bg-emerald-500 text-white',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: 'bg-blue-100 text-blue-600',
    pill: 'bg-blue-500 text-white',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    icon: 'bg-purple-100 text-purple-600',
    pill: 'bg-purple-500 text-white',
  },
} as const

function TaskCard({
  icon,
  title,
  desc,
  score,
  done,
  loading,
  onComplete,
  externalUrl,
  externalLabel,
  ctaText,
  color,
}: {
  icon: string
  title: string
  desc: string
  score: number
  done: boolean
  loading: boolean
  onComplete: () => void
  externalUrl?: string
  externalLabel?: string
  ctaText: string
  color: keyof typeof COLOR_MAP
}) {
  const c = COLOR_MAP[color]
  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        done
          ? `${c.bg} ${c.border} opacity-90`
          : `bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm`
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl ${done ? 'bg-emerald-100' : c.icon}`}>
          {done ? <CheckCircle2 size={20} className="text-emerald-600" /> : <span>{icon}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`text-sm font-bold ${done ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
              {title}
            </h4>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${done ? 'bg-emerald-500 text-white' : c.pill}`}>
              +{score} 分
            </span>
            {done && (
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                <CheckCircle2 size={10} /> 已完成
              </span>
            )}
          </div>
          <p className={`mt-1 text-[11px] leading-snug ${done ? 'text-slate-400' : 'text-slate-500'}`}>
            {desc}
          </p>

          {!done && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {externalUrl && (
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 text-[11px] font-bold ${c.text} hover:underline`}
                >
                  {externalLabel} <ExternalLink size={10} />
                </a>
              )}
              <button
                type="button"
                onClick={onComplete}
                disabled={loading}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all active:scale-95 disabled:opacity-50 ${
                  color === 'emerald'
                    ? 'bg-emerald-500 hover:bg-emerald-600'
                    : color === 'blue'
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-purple-500 hover:bg-purple-600'
                }`}
              >
                {loading ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    打卡中...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={12} />
                    {ctaText}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 self-center">
          {done ? (
            <CheckCircle2 size={20} className="text-emerald-500" />
          ) : (
            <Circle size={20} className="text-slate-300" />
          )}
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// 知识能力卡片（2x2 Bento 单元 · 通用渲染器）
// ════════════════════════════════════════════════════════════════

const KNOWLEDGE_CARD_STYLE = {
  amber: {
    bg: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50',
    border: 'border-amber-200',
    accent: 'text-amber-700',
    iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50',
    border: 'border-blue-200',
    accent: 'text-blue-700',
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
  },
  rose: {
    bg: 'bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50',
    border: 'border-rose-200',
    accent: 'text-rose-700',
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600',
  },
} as const

function KnowledgeCard<T extends KnowledgeItem>({
  kind: _kind,
  emoji,
  title,
  subtitle,
  ownerTag,
  accent,
  items,
  renderItem,
}: {
  kind: 'skills' | 'tools' | 'rules' | 'pitfalls'
  emoji: string
  title: string
  subtitle: string
  /** 主要归属：opc（黄标） / ai（蓝标） / mixed（混合） */
  ownerTag: 'opc' | 'ai' | 'mixed'
  accent: keyof typeof KNOWLEDGE_CARD_STYLE
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
}) {
  const style = KNOWLEDGE_CARD_STYLE[accent]
  const ownerBadge = {
    opc: (
      <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full">
        🟡 OPC 亲自做
      </span>
    ),
    ai: (
      <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full">
        🔵 AI 帮你做
      </span>
    ),
    mixed: (
      <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded-full">
        🟡+🔵 混合
      </span>
    ),
  }[ownerTag]

  return (
    <div
      className={`relative ${style.bg} border ${style.border} rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
    >
      {/* 装饰光晕 */}
      <div aria-hidden className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/40 blur-2xl" />

      <div className="relative">
        {/* 卡片头部 */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className={`flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-xl ${style.iconBg} text-white flex items-center justify-center text-lg md:text-xl shadow-sm`}>
              {emoji}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={`text-sm md:text-base font-extrabold ${style.accent} leading-tight`}>
                {title}
              </h3>
              <p className="text-[10px] md:text-[11px] text-slate-500 leading-tight mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>
          {ownerBadge}
        </div>

        {/* 卡片条目列表 */}
        <ul className="space-y-2.5">
          {items.map((it, i) => (
            <li
              key={i}
              className="bg-white/85 hover:bg-white rounded-xl p-2.5 border border-white/60 transition-colors"
            >
              {renderItem(it, i)}
            </li>
          ))}
        </ul>

        {/* 底部统计 */}
        <div className="mt-3 pt-2.5 border-t border-white/60 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <Lightbulb size={10} />
            {items.length} 个核心知识点
          </span>
          <span className="font-bold">{ownerTag === 'opc' ? '需要刻意练习' : ownerTag === 'ai' ? '直接用工具落地' : '识别边界 · 灵活组合'}</span>
        </div>
      </div>
    </div>
  )
}
