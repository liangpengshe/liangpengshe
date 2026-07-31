'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Search,
  ArrowRight,
  Wrench,
  Briefcase,
  FolderKanban,
  BookOpen,
  ExternalLink,
  Download,
  Sparkles,
  Bot,
  X,
  CheckCircle2,
  Phone,
  User,
  MessageCircle,
  Loader2,
  Send,
  Users,
  Building2,
  ChevronRight,
  Handshake,
  Lock,
  Crown,
  MapPin,
  ShieldCheck,
  Globe,
  Award,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { serviceItems, type ServiceItem } from '@/data/service-items'
import { projectItems, type ProjectItem } from '@/data/project-items'
import { resourceItems, type ResourceItem } from '@/data/resource-items'
import { FindSeniorOPCModal } from '@/components/market/FindSeniorOPCModal'
import { CollaborationMatchModal } from '@/components/market/CollaborationMatchModal'
import { UnlockResourceModal } from '@/components/market/UnlockResourceModal'
import {
  ResourceSubmissionModal,
  NeedLoginToSubmitModal,
} from '@/components/market/ResourceSubmissionModal'
import {
  canUnlockResource,
  readMembershipTierFromStorage,
  type MembershipTier,
  MEMBERSHIP_TIER_META,
} from '@/lib/user-membership'
import { useUserProgress, type UserProgressSnapshot } from '@/lib/use-user-progress'
import { MARKET_SEARCH_STORAGE_KEY, MARKET_SEARCH_EVENT } from '@/lib/market-search'

/**
 * AI四库全胜系统导航（统一入口 /market）
 * ------------------------------------------------------------
 * 路由：
 *   - /market              → 默认进入 AI智富工具库
 *   - /market/services     → 直接进入 AI智富服务库
 *   - /market/projects     → 直接进入 AI智富项目库
 *   - /market/resources    → 直接进入 AI智富资源库
 *   - /guide/[level]→ 按诊断结果展示个性化学习方案
 *
 * 4 库顺序（外层 Tabs）：
 *   1. AI智富工具库（默认）
 *   2. AI智富服务库
 *   3. AI智富项目库
 *   4. AI智富资源库
 *
 * 工具库内部分为 4 大顶级分类（2026-07 新思维导图）：
 *   1. AI 网店群工具（含子分类：AI 网店工作台 / AI 店群运营工具）
 *   2. AI 自媒体工具（含子分类：AI 自媒体登录页 / AI 自媒体运营工具）
 *   3. AI 自研工具（豹纹PLUS / 先锋派数字人 / 灵犀AI · 直接平铺）
 *   4. AI 严选工具（含 6 大子分类：写作/美工/音视频/智能体/编码/辅助）
 * ------------------------------------------------------------
 */

// ════════════════════════════════════════════════════════════════
// 工具库子分类 Mock 数据
// ════════════════════════════════════════════════════════════════

interface Platform {
  name: string
  url: string
  description: string
  /** 卡片底部按钮文案 + 图标；默认 'visit' */
  action?: 'visit' | 'download' | 'enter'
  /** 平台 emoji，作为占位 logo */
  icon?: string
  /** 标签：开店注册 / 热门 / 推荐 / 必装 / 出海 等 */
  tag?: string
  /**
   * AI 内容生成场景标签（决定左上班徽颜色）
   * 仅 AI 内容生成相关分类使用
   */
  scene?: 'writing' | 'image' | 'video' | 'coding'
}

/** 4 个 tool 顶级分类的稳定 slug（用于锚点 + URL 参数） */
type ToolSlug =
  | 'shop-group'
  | 'self-media-tools'
  | 'self-research'
  | 'curated-tools'

const TOOL_SLUG_MAP: Record<string, ToolSlug> = {
  'AI网店群工具': 'shop-group',
  'AI自媒体工具': 'self-media-tools',
  'AI自研工具': 'self-research',
  'AI严选工具': 'curated-tools',
  // 向后兼容旧 URL：?type=trader → 跳转网店群；?type=flow → 跳转自媒体
  'AI 网店工作台': 'shop-group',
  'AI 自媒体登录页': 'self-media-tools',
  '自研工具': 'self-research',
}

interface ToolCategory {
  title: string
  /** 分类大图标（emoji） */
  emoji: string
  /** 分类副标题 */
  subtitle: string
  /**
   * 顶级分类直接平铺的卡片（与 subCategories 二选一）
   * 适用：AI自研工具（豹纹+ / 先锋派 / 灵犀）、AI严选工具（按 6 大子分类分组展示）
   */
  platforms?: Platform[]
  /**
   * 子分类列表
   * 顶级分类为聚合入口（如「AI网店群工具」「AI自媒体工具」）时使用
   * 内部会渲染小标题 + 卡片网格
   */
  subCategories?: Array<{
    title: string
    emoji: string
    subtitle: string
    platforms: Platform[]
  }>
}

const toolCategories: ToolCategory[] = [
  // ════════ 1. AI 网店群工具（聚合：AI 网店工作台 + AI 店群运营工具）══════
  {
    title: 'AI网店群工具',
    emoji: '🏪',
    subtitle: '电商开店 + 店群运营 · 一站直达',
    subCategories: [
      {
        title: 'AI网店工作台',
        emoji: '🛒',
        subtitle: '各大电商平台商家后台 · 开店 / 入驻',
        platforms: [
          { name: '淘宝商家后台', url: 'https://ishop.taobao.com/openshop/tb_open_shop_landing.htm', description: '国内领先电商开店', icon: '🛒', tag: '开店注册' },
          { name: '拼多多商家后台', url: 'https://mms.pinduoduo.com/login/register?redirectUrl=https%3A%2F%2Fmms.pinduoduo.com%2Fhome%2F', description: '拼多多商家入驻', icon: '🍎', tag: '开店注册' },
          { name: '小红书开店', url: 'https://zhaoshang.xiaohongshu.com/merchant/login?settleFrom=login_page_pc', description: '小红书商家入驻', icon: '📕', tag: '开店注册' },
          { name: '抖店', url: 'https://fxg.jinritemai.com/', description: '抖音电商后台', icon: '🎵', tag: '开店注册' },
          { name: '视频号小店', url: 'https://channels.weixin.qq.com/login.html', description: '微信视频号小店', icon: '💬', tag: '开店注册' },
          { name: '亚马逊全球开店', url: 'https://sellercentral.amazon.com', description: '全球开店出海', icon: '📦', tag: '出海' },
        ],
      },
      {
        title: 'AI店群运营工具',
        emoji: '🛠️',
        subtitle: '数据分析 / 自动发货 / 裂变引流',
        platforms: [
          { name: '店侦探', url: 'https://www.dianzhentan.com', description: '电商数据分析', icon: '🕵️', tag: '热门' },
          { name: '阿奇索自动发货', url: 'https://www.agiso.com/', description: '自动发货系统', icon: '⚡' },
          { name: '抖羚羊', url: 'https://www.doulingyang.com', description: '裂变引流工具', icon: '🚀', tag: '推荐' },
          { name: '哈士奇电商插件', url: 'https://hsq.dangxun.com/', description: '电商浏览器插件', icon: '🐺' },
          { name: '至尊宝电商工具', url: 'https://tool.zzbtool.com/index.html#/index', description: '多功能运营工具', icon: '👑' },
          { name: '版权著作权检测', url: 'https://banquan.tianyancha.com/zp', description: '版权查询', icon: '©️' },
        ],
      },
    ],
  },
  // ════════ 2. AI 自媒体工具（聚合：AI 自媒体登录页 + AI 自媒体运营工具）══════
  {
    title: 'AI自媒体工具',
    emoji: '📱',
    subtitle: '内容平台登录 + 自媒体运营 · 一站直达',
    subCategories: [
      {
        title: 'AI自媒体登录页',
        emoji: '🔗',
        subtitle: '主流内容平台创作者中心一键直达',
        platforms: [
          { name: '抖音创作者中心', url: 'https://creator.douyin.com', description: '发布短视频', icon: '🎵' },
          { name: '小红书创作者中心', url: 'https://creator.xiaohongshu.com', description: '图文笔记', icon: '📕' },
          { name: '头条号', url: 'https://www.toutiao.com/', description: '字节内容分发', icon: '📰' },
          { name: '百家号', url: 'https://baijiahao.baidu.com/builder/theme/bjh/login', description: '百度创作平台', icon: '🔍' },
          { name: '知乎', url: 'https://www.zhihu.com/signin?next=%2F', description: '问答社区', icon: '💡' },
          { name: '微信公众号', url: 'https://mp.weixin.qq.com/cgi-bin/registermidpage?action=index', description: '微信公众平台', icon: '💬' },
          { name: '快手', url: 'https://www.kuaishou.com/new-reco', description: '快手内容平台', icon: '⚡' },
        ],
      },
      {
        title: 'AI自媒体运营工具',
        emoji: '🎬',
        subtitle: '内容生成 / 选题规划 / 矩阵分发',
        platforms: [
          { name: '创客贴', url: 'https://www.chuangkit.com/', description: '封面图/海报模板', icon: '🎨' },
          { name: '剪映专业版', url: 'https://www.capcut.cn/', description: 'AI 剪辑一键成片', icon: '🎬' },
          { name: '新榜', url: 'https://www.newrank.cn/', description: '内容数据监测', icon: '📊' },
          { name: '蝉妈妈', url: 'https://www.chanmama.com/', description: '抖音数据洞察', icon: '📈' },
          { name: '图文宝盒', url: 'https://www.tubaohe.com/', description: '一键生成图文笔记', icon: '🖼️' },
          { name: '5118 工具', url: 'https://www.5118.com/', description: 'SEO 关键词挖掘', icon: '🔎' },
        ],
      },
    ],
  },
  // ════════ 3. AI 自研工具（OPC 独家 · 豹纹+ / 先锋派 / 灵犀）══════
  {
    title: 'AI自研工具',
    emoji: '🧬',
    subtitle: 'OPC 独家自研 · 豹纹PLUS / 先锋派数字人 / 灵犀AI',
    platforms: [
      { name: '豹纹PLUS', url: 'https://www.baowenplus.com', description: 'AI 自媒体内容生成 · 豹纹+', icon: '🐆', tag: '独家' },
      { name: '先锋派数字人', url: 'https://www.xianfengpai.com.cn', description: 'AI 数字人视频生成', icon: '🎬', tag: '爆款' },
      { name: '灵犀AI', url: 'https://www.lingxixai.com', description: '智能内容创作助手', icon: '🦊', tag: '热门' },
    ],
  },
  // ════════ 4. AI 严选工具（6 大子分类：写作 / 美工 / 音视频 / 智能体 / 编码 / 辅助）══════
  {
    title: 'AI严选工具',
    emoji: '✨',
    subtitle: '严选 6 大 AI 生产力工具 · 写作/美工/音视频/智能体/编码/辅助',
    subCategories: [
      {
        title: '写作文案',
        emoji: '✍️',
        subtitle: 'AI 文案生产力 · 跑通首单必备',
        platforms: [
          { name: 'Deepseek', url: 'https://www.deepseek.com', description: '深度求索 AI', icon: '🐋', scene: 'writing' },
          { name: '豆包', url: 'https://www.doubao.com', description: '字节跳动 AI 助手', icon: '🫘', scene: 'writing' },
          { name: 'Kimi', url: 'https://kimi.moonshot.cn', description: '月之暗面长文 AI', icon: '🌙', scene: 'writing' },
          { name: 'ChatGPT', url: 'https://chat.openai.com', description: 'OpenAI 对话 AI', icon: '💬', scene: 'writing' },
          { name: '通义千问', url: 'https://tongyi.aliyun.com', description: '阿里通义大模型', icon: '🔮', scene: 'writing' },
        ],
      },
      {
        title: '美工绘图',
        emoji: '🎨',
        subtitle: 'AI 生图工具集合',
        platforms: [
          { name: '即梦 Dreamina', url: 'https://jimeng.jianying.com', description: '字节 AI 生图', icon: '🌟', scene: 'image' },
          { name: '文心一格', url: 'https://yige.baidu.com', description: '百度 AI 艺术', icon: '🎭', scene: 'image' },
          { name: 'Midjourney', url: 'https://www.midjourney.com', description: '顶级 AI 生图', icon: '🎨', scene: 'image' },
          { name: 'StableDiffusion', url: 'https://stability.ai', description: '开源 AI 生图模型', icon: '🌀', scene: 'image' },
          { name: 'Canva AI', url: 'https://www.canva.cn', description: '在线设计 AI 加持', icon: '🖼️', scene: 'image' },
          { name: 'LiblibAI', url: 'https://www.liblib.art', description: '国内 AI 绘画社区', icon: '🖌️', scene: 'image' },
        ],
      },
      {
        title: '音频视频',
        emoji: '🎬',
        subtitle: 'AI 视频 / 音频生成',
        platforms: [
          { name: '海绵音乐', url: 'https://www.haimian.com', description: 'AI 音乐生成', icon: '🎵', scene: 'video' },
          { name: '可灵 AI', url: 'https://kelingai.com/', description: '快手 AI 视频', icon: '⚡', scene: 'video' },
          { name: '即梦 AI 视频', url: 'https://jimeng.jianying.com', description: '字节 AI 视频', icon: '🌟', scene: 'video' },
          { name: 'Sora', url: 'https://openai.com/sora', description: 'OpenAI 视频生成', icon: '🎞️', scene: 'video' },
          { name: 'ElevenLabs', url: 'https://elevenlabs.io', description: 'AI 配音克隆', icon: '🎙️', scene: 'video' },
        ],
      },
      {
        title: '智能体工具',
        emoji: '🤖',
        subtitle: 'AI 智能体 / 自动化工作流',
        platforms: [
          { name: '扣子 Coze', url: 'https://www.coze.cn/overview', description: '字节 AI 智能体', icon: '🪄', scene: 'coding' },
          { name: 'Dify', url: 'https://dify.ai', description: '开源 AI 工作流', icon: '🧩', scene: 'coding' },
          { name: '腾讯元器', url: 'https://yuanqi.tencent.com', description: '腾讯智能体平台', icon: '🪶', scene: 'coding' },
          { name: '百度千帆 AppBuilder', url: 'https://cloud.baidu.com/product/AppBuilder', description: '百度智能体构建', icon: '⛵', scene: 'coding' },
          { name: '阿里云百炼', url: 'https://bailian.console.aliyun.com', description: '阿里智能体平台', icon: '🔥', scene: 'coding' },
        ],
      },
      {
        title: '编码及系统',
        emoji: '💻',
        subtitle: 'AI 编程 / 系统搭建',
        platforms: [
          { name: 'TRAE IDE', url: 'https://www.trae.cn/', description: 'AI 原生 IDE', icon: '🛠️', scene: 'coding' },
          { name: 'Cursor', url: 'https://www.cursor.com/', description: 'AI 代码编辑器', icon: '🖱️', scene: 'coding' },
          { name: 'GitHub Copilot', url: 'https://github.com/features/copilot', description: 'AI 配对编程', icon: '🐙', scene: 'coding' },
          { name: 'V0', url: 'https://v0.dev', description: 'AI 生成 UI 代码', icon: '🅱️', scene: 'coding' },
          { name: 'Bolt.new', url: 'https://bolt.new', description: 'AI 全栈开发', icon: '⚡', scene: 'coding' },
        ],
      },
      {
        title: 'AI辅助工具',
        emoji: '🧰',
        subtitle: '网盘 / 资源管理 / 日常效率',
        platforms: [
          { name: '百度网盘', url: 'https://pan.baidu.com/', description: '文件存储与分享', icon: '☁️' },
          { name: '夸克网盘', url: 'https://b.quark.cn/', description: '高速云盘', icon: '⚡' },
          { name: '任推邦', url: 'https://www.rentuibang.com/', description: '多创收工具', icon: '🚀' },
          { name: '腾讯文档', url: 'https://docs.qq.com', description: '在线协作文档', icon: '📄' },
          { name: '飞书', url: 'https://www.feishu.cn', description: '高效协同办公', icon: '✈️' },
        ],
      },
    ],
  },
]

/**
 * 工具库渲染顺序优先级（任务 1 新版）
 * 按 思维导图 4 大分类顺序：网店群 → 自媒体 → 自研 → 严选
 */
const CATEGORY_PRIORITY: Record<string, number> = {
  'AI网店群工具': 0,
  'AI自媒体工具': 1,
  'AI自研工具': 2,
  'AI严选工具': 3,
  // 向后兼容旧 title
  '自研工具': 2,
  'AI 网店工作台': 0,
  'AI 自媒体登录页': 1,
  'AI 网店运营工具': 0,
  '日常工具': 3,
  'AI 文案写作': 3,
  'AI 图片创作': 3,
  'AI 音频视频': 3,
  'AI 智能体与编程': 3,
}

function sortToolCategories(cats: ToolCategory[]): ToolCategory[] {
  return [...cats].sort((a, b) => {
    const pa = CATEGORY_PRIORITY[a.title]
    const pb = CATEGORY_PRIORITY[b.title]
    if (pa !== undefined && pb !== undefined) return pa - pb
    if (pa !== undefined) return -1
    if (pb !== undefined) return 1
    return 0
  })
}

// ════════════════════════════════════════════════════════════════
// 类型定义
// ════════════════════════════════════════════════════════════════

type MarketTab = 'tools' | 'services' | 'projects' | 'resources'

interface InquiryResult {
  success: boolean
  message: string
  aiSessions?: string[]
  expertTickets?: string[]
  matchedManagers?: Array<{ city: string; name: string; phone: string; wechat: string }>
  /** 后端按 opc_level 智能分配的专家（任务 3） */
  assignedExpert?: {
    name: string
    specialty: string
    avatar?: string
    wechat?: string
    fallback?: boolean
  }
}

/** 4 大 OPC 类型的中文标签 + emoji（用于上下文横幅） */
const OPC_LEVEL_DISPLAY: Record<'TRADER' | 'FLOW' | 'SYSTEM' | 'ASSET', { label: string; emoji: string }> = {
  TRADER: { label: '交易先锋', emoji: '🏅' },
  FLOW:   { label: '流量猎手', emoji: '🎯' },
  SYSTEM: { label: '系统建造师', emoji: '⚙️' },
  ASSET:  { label: '资产掌舵人', emoji: '💎' },
}

interface ProjectInquiryResult {
  success: boolean
  message: string
  projectTitle?: string
  intent?: string
  aiChecklist?: string[]
  expertTicket?: string
  matchedManagers?: Array<{ city: string; name: string; phone: string; wechat: string; specialty: string }>
}

interface PartnerInquiryResult {
  success: boolean
  routed: 'manager' | 'expert'
  message: string
  manager?: {
    city: string
    name: string
    wechat: string
    phone: string
    specialty: string
  }
  policy?: string[]
  ticketId?: string
  eta?: string
  fallback?: string[]
}

const INTENT_LABEL: Record<'executor' | 'partner' | 'manager', string> = {
  executor: '执行者 · 我要亲自做这个项目',
  partner: '寻找合作方 · 资源对接',
  manager: 'OPC 主理人 · 我想做当地负责人',
}

// ════════════════════════════════════════════════════════════════
// 主入口：MarketContent（支持 defaultTab 切换初始 tab）
// ════════════════════════════════════════════════════════════════

export function MarketContent({
  defaultTab = 'tools' as MarketTab,
  standalone = true,
  highlightCategory,
  briefHighlight = null,
  selfToolsRef,
  recommendLevel,
  collaborationHighlight = false,
}: {
  defaultTab?: MarketTab
  /**
   * true  → 渲染完整页面（顶部 header + 搜索 + 横幅 + Tabs + 内容）
   *         用于 /market 旧兼容入口
   * false → 仅渲染内容（chrome 由 /market/layout.tsx 提供）
   *         用于 /market/tools 等独立子路由
   */
  standalone?: boolean
  /**
   * 高亮指定子分类下的第一张卡片（带 ring-2 + animate-pulse）
   * 用于 /market/tools?type=trader|flow 落地后自动定位
   */
  highlightCategory?: ToolSlug
  /**
   * 短暂高亮某个子分类（用于场景胶囊筛选点击后 1.5s 闪烁）
   */
  briefHighlight?: ToolSlug | string | null
  /**
   * 自研工具区块的外部 ref（用于 ?tab=self_tools 自动滚动 + 3s 高亮）
   * 绑定到外层 wrapper div（id="self-tools"）
   */
  selfToolsRef?: React.RefObject<HTMLDivElement>
  /**
   * 精准推荐模式（任务 2）：
   *   来自 URL ?recommend=trader|flow|system|asset
   *   → 命中 level 的项目卡片（recommend:true 或 level 匹配）展示 ring-2 高亮
   */
  recommendLevel?: 'trader' | 'flow' | 'system' | 'asset'
  /**
   * 来自学习入门页的"找人合作"协作高亮
   *   来自 /market/services?from=guide&type=collaboration
   *   → 高亮「OPC 陪跑」与「AI 网店代运营」两张服务卡片
   */
  collaborationHighlight?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState<MarketTab>(defaultTab)
  const [searchQuery, setSearchQuery] = useState('')
  // 多选需求引擎状态
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [inquiryOpen, setInquiryOpen] = useState(false)
  // ════════ 协作匹配弹窗（学习入门 → 找人合作 联动）══════
  // 当 collaborationHighlight=true 且用户点击高亮服务卡时，弹出此弹窗
  // 推荐匹配的 CITY_MAINTAINER / 资产型 OPC，并引导进入服务咨询表单
  const [collaborationService, setCollaborationService] = useState<ServiceItem | null>(null)
  // 项目库 · 寻找资深 OPC 匹配弹窗状态（任务 3）
  const [findOpcProject, setFindOpcProject] = useState<ProjectItem | null>(null)
  // 资源库 · 招商加盟对接状态
  const [partnerInquiry, setPartnerInquiry] = useState<{
    resource: ResourceItem
  } | null>(null)
  // 资源库 · 会员门锁状态（用于 unlock 类型）
  const [lockedResource, setLockedResource] = useState<ResourceItem | null>(null)
  // 服务库 · 前置检测弹窗（未诊断用户首次提交时弹出）
  const [preCheckOpen, setPreCheckOpen] = useState(false)
  // 会员等级（订阅 localStorage 变化，实时同步）
  const [membershipTier, setMembershipTier] = useState<MembershipTier>('none')
  // 学习进度（用于资源库门锁判定：can_unlock_practice）
  const userProgress: UserProgressSnapshot | null = useUserProgress()

  // ════════ 资源库 · UGC 投稿弹窗状态（任务 2）══════
  const [submissionOpen, setSubmissionOpen] = useState(false)
  const [needLoginOpen, setNeedLoginOpen] = useState(false)

  /**
   * 流量型 OPC 精准推荐配置
   * ------------------------------------------------------------
   * recommendLevel === 'flow' 时：
   *   1) 「AI图文自媒体项目」「AI视频自媒体项目」标记为 isHighlighted
   *   2) 这 2 个项目置顶到网格最前面
   *   3) 其他项目的"优先推荐"徽章自动消失
   *   [任务:拆分自媒体项目 + 流量型精减] 原 AI自媒体群项目 已拆为 AI图文 + AI视频
   *       AI工具推广项目（level=flow 但属于渠道销售分类）不再进入流量型优先推荐
   *
   * trader 模式沿用：AI数字店群项目 + AI无货源店群项目
   * system / asset 模式暂未配置置顶集合（保持原顺序 + level 匹配高亮）
   * ------------------------------------------------------------
   */
  const PRIORITY_TITLES_BY_LEVEL: Record<NonNullable<typeof recommendLevel>, string[]> = {
    trader: ['AI数字店群项目', 'AI无货源店群项目'],
    // [任务:拆分自媒体项目 + 流量型精减] 流量型 OPC 仅推荐 AI图文 + AI视频 两个新拆分的项目
    // AI工具推广项目虽然 level=flow，但因属于"渠道销售"分类，不再进入流量型优先推荐
    flow: ['AI图文自媒体项目', 'AI视频自媒体项目'],
    system: ['AI编程开发项目', 'AI企业GEO项目'],
    asset: ['AI跨境电商项目', 'AI数字产品项目'],
  }

  const displayProjects = useMemo(() => {
    if (!recommendLevel) return projectItems
    const priorities = PRIORITY_TITLES_BY_LEVEL[recommendLevel] || []
    if (priorities.length === 0) return projectItems
    const prioritySet = new Set(priorities)
    const pinned = projectItems.filter((p) => prioritySet.has(p.title))
    const others = projectItems.filter((p) => !prioritySet.has(p.title))
    // 保持原数组中的相对顺序（不再次排序 pinned）
    return [...pinned, ...others]
  }, [recommendLevel])

  /**
   * 读取当前 OPC 用户身份（演示版：从 localStorage 解析）
   * 生产环境替换为：await getCurrentUser() 查 Supabase
   */
  const getAuthorInfo = (): {
    deviceId: string
    name: string
    opcLevel: string | null
    isRegistered: boolean
  } => {
    if (typeof window === 'undefined') {
      return { deviceId: '', name: '访客', opcLevel: null, isRegistered: false }
    }
    const deviceId = window.localStorage.getItem('opc_device_id') || ''
    const name = window.localStorage.getItem('opc_user_name') || 'OPC 成员'
    const opcLevel = window.localStorage.getItem('opc_level')
    // 已注册条件：deviceId 存在 + 至少有过诊断（opc_level 有值）
    const isRegistered = !!deviceId && !!opcLevel
    return { deviceId, name, opcLevel, isRegistered }
  }

  /**
   * 资源库底部横幅按钮 · 点击处理
   * - 未登录/未注册 → 弹出 NeedLoginToSubmitModal 拦截
   * - 已注册 → 弹出 ResourceSubmissionModal 投稿表单
   */
  const handleSubmitClick = () => {
    if (typeof window === 'undefined') return
    const author = getAuthorInfo()
    if (!author.isRegistered) {
      setNeedLoginOpen(true)
    } else {
      setSubmissionOpen(true)
    }
  }

  const toggleService = (id: string) => {
    // ════════ 协作高亮卡 → 弹协作匹配弹窗（不走 toggle）══════
    // 当 collaborationHighlight=true 且点击的是「OPC 陪跑 / AI 网店代运营」时
    // 优先弹出推荐弹窗，引导至协作匹配而非简单勾选
    if (
      collaborationHighlight &&
      (id === 'opc-coaching' || id === 'shop-group-daiyun')
    ) {
      const svc = serviceItems.find((s) => s.id === id)
      if (svc) {
        setCollaborationService(svc)
        return
      }
    }
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  /**
   * 服务提交 · 前置拦截（任务 1）
   * - 已诊断用户：直接打开 ServiceInquiryModal
   * - 未诊断用户：先弹 PreCheckModal 引导其完成诊断
   */
  const handleSubmitWithPreCheck = () => {
    if (typeof window === 'undefined') return
    const opcLevelRaw = window.localStorage.getItem('opc_level')
    const isValid = opcLevelRaw && ['TRADER', 'FLOW', 'SYSTEM', 'ASSET'].includes(opcLevelRaw)
    if (isValid) {
      setInquiryOpen(true)
    } else {
      setPreCheckOpen(true)
    }
  }

  // 透传给模态框的用户状态（避免每次渲染都读 localStorage）
  const hasDiagnosis = (() => {
    if (typeof window === 'undefined') return false
    const v = window.localStorage.getItem('opc_level')
    return !!(v && ['TRADER', 'FLOW', 'SYSTEM', 'ASSET'].includes(v))
  })()
  const opcLevel: 'TRADER' | 'FLOW' | 'SYSTEM' | 'ASSET' | null = (() => {
    if (typeof window === 'undefined') return null
    const v = window.localStorage.getItem('opc_level')
    if (v && ['TRADER', 'FLOW', 'SYSTEM', 'ASSET'].includes(v)) {
      return v as 'TRADER' | 'FLOW' | 'SYSTEM' | 'ASSET'
    }
    return null
  })()

  // 用户当前城市（兜底 '深圳'，与 CitySelector 保持一致）
  // CitySelector 把城市 code（如 'shenzhen'）存在 lps.selectedCity 中
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

  /**
   * 协作匹配弹窗 → 引导至服务咨询表单
   * 流程：
   *   1. 关闭协作匹配弹窗
   *   2. 将当前 service 加入 selectedServices（单选）
   *   3. 打开标准 ServiceInquiryModal（自动定位到服务咨询流程）
   */
  const handleCollaborationSubmitForm = () => {
    if (!collaborationService) return
    const sid = collaborationService.id
    setCollaborationService(null)
    // 确保该 service 在 selectedServices 中
    setSelectedServices((prev) =>
      prev.includes(sid) ? prev : [...prev, sid]
    )
    // 打开服务咨询弹窗
    setInquiryOpen(true)
  }

  // 同步读取 localStorage 中的会员等级（首次加载 + 监听 storage 事件）
  useEffect(() => {
    setMembershipTier(readMembershipTierFromStorage())
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'opc_membership_tier') {
        setMembershipTier(readMembershipTierFromStorage())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // 嵌入模式（layout 提供 chrome）：从 sessionStorage 同步搜索词
  useEffect(() => {
    if (standalone) return
    if (typeof window === 'undefined') return
    const sync = () => {
      const saved = sessionStorage.getItem(MARKET_SEARCH_STORAGE_KEY) || ''
      setSearchQuery((prev) => (prev === saved ? prev : saved))
    }
    sync()
    // 监听 storage 事件 + 自定义事件，实时同步
    const onCustom = () => sync()
    window.addEventListener('storage', sync)
    window.addEventListener(MARKET_SEARCH_EVENT, onCustom)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener(MARKET_SEARCH_EVENT, onCustom)
    }
  }, [standalone])

  // Tab 切换时，路由联动：/market 根路径点击 → /market/{tab}
  // 这样 URL 始终与当前 Tab 同步，可分享、可前进/后退
  const handleTabChange = (v: string) => {
    const target = v as MarketTab
    setActiveTab(target)
    const targetPath = `/market/${target}`
    if (pathname !== targetPath) {
      router.push(targetPath)
    }
  }

  const selectedServiceItems = serviceItems.filter((s) => selectedServices.includes(s.id))

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ════════ 顶部导航（仅 standalone 模式渲染）══════ */}
      {standalone && (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="flex items-center justify-between px-5 py-4">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <span className="text-xl">🏢</span>
              <span>良朋社OPC</span>
          </Link>
          <span className="font-bold text-gray-900">AI四库全胜系统</span>
          <div className="w-24" />
        </div>
        <div className="px-5 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索工具 / 服务 / 项目 / 资源..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
        </header>
      )}

      <main className="px-5 py-6">
        {/* ════════ 顶部 Banner（仅 standalone 模式渲染）══════ */}
        {standalone && (
          <div className="mb-5 flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
            <Sparkles size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-semibold text-blue-600 tracking-wider uppercase">
              AI 智富导航
            </div>
            <div className="text-sm font-bold text-slate-800 leading-tight">
              四库联动 · 一站直达全网 AI 工具与平台
            </div>
          </div>
        </div>
        )}

        {/* ════════ 4 库 Tabs（顺序：工具 → 服务 → 项目 → 资源）══════ */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          {standalone && (
          <TabsList className="w-full grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger
              value="tools"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              <span className="inline-flex items-center gap-1.5">
                <Wrench size={14} />
                <span className="text-xs md:text-sm">AI智富工具库</span>
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              <span className="inline-flex items-center gap-1.5">
                <Briefcase size={14} />
                <span className="text-xs md:text-sm">AI智富服务库</span>
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              <span className="inline-flex items-center gap-1.5">
                <FolderKanban size={14} />
                <span className="text-xs md:text-sm">AI智富项目库</span>
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              <span className="inline-flex items-center gap-1.5">
                <BookOpen size={14} />
                <span className="text-xs md:text-sm">AI智富资源库</span>
              </span>
            </TabsTrigger>
          </TabsList>
          )}

        {/* ════════ AI智富工具库：4 大顶级分类（按 思维导图 顺序） ════════ */}
          <TabsContent value="tools" className="mt-5 space-y-6">
            {sortToolCategories(toolCategories).map((category) => {
              // 自研工具（兼容旧 title '自研工具'）的 wrapper 锚点 + 高亮
              const isSelfTools = category.title === 'AI自研工具' || category.title === '自研工具'
              const section = (
                <ToolCategorySection
                  category={category}
                  highlightCategory={highlightCategory}
                  briefHighlight={briefHighlight ?? null}
                />
              )
              // 自研工具：外层包一层 wrapper（id="self-tools"），用于 ?tab=self_tools 锚点 + 高亮
              if (isSelfTools) {
                return (
                  <div
                    key={category.title}
                    id="self-tools"
                    ref={selfToolsRef}
                    className="rounded-2xl transition-all duration-300"
                  >
                    {section}
                  </div>
                )
              }
              return <div key={category.title}>{section}</div>
            })}
          </TabsContent>

          {/* ════════ AI智富服务库：多选需求引擎（9 个板块） ════════ */}
          <TabsContent value="services" className="mt-5">
            <div className="mb-4 flex items-center gap-2">
              <Briefcase className="text-violet-500" size={18} />
              <span className="font-bold text-gray-900 text-sm">🤝 AI 智富服务库</span>
              <span className="text-[10px] text-slate-500">智能体 / 工作流 / 顾问陪跑</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">
              💡 勾选感兴趣的服务板块，提交后我们将为您精准对接 AI 顾问或行业专家
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {serviceItems.map((svc) => (
                <ServiceSelectCard
                  key={svc.id}
                  service={svc}
                  selected={selectedServices.includes(svc.id)}
                  onToggle={() => toggleService(svc.id)}
                  highlighted={collaborationHighlight && (svc.id === 'opc-coaching' || svc.id === 'shop-group-daiyun')}
                />
              ))}
            </div>
          </TabsContent>

          {/* ════════ AI智富项目库：对接匹配引擎（9 个项目方向） ════════ */}
          <TabsContent value="projects" className="mt-5">
            <div className="mb-4 flex items-center gap-2">
              <FolderKanban className="text-emerald-500" size={18} />
              <span className="font-bold text-gray-900 text-sm">📁 AI 智富项目库</span>
              <span className="text-[10px] text-slate-500">对接匹配 · 主理人 / 合作方</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">
              💡 选择感兴趣的项目方向，提交后我们将为您匹配 AI 启动清单 / 资深 OPC 主理人
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayProjects.map((proj) => {
                // 精准推荐模式（任务 2 收口）：
                //   唯一高亮依据：项目 title 是否在 PRIORITY_TITLES_BY_LEVEL[recommendLevel] 集合内
                //   移除历史的 proj.recommend === true / proj.level === recommendLevel 全局兼容，
                //   否则 AI数字网店 / AI无货源实物（recommend:true + level:trader）会在 flow/system/asset 模式下被误高亮
                const prioritySet = recommendLevel
                  ? new Set(PRIORITY_TITLES_BY_LEVEL[recommendLevel] || [])
                  : null
                const isHighlighted =
                  recommendLevel !== undefined &&
                  prioritySet !== null &&
                  prioritySet.has(proj.title)
                return (
                  <ProjectCard
                    key={proj.id}
                    project={proj}
                    highlighted={isHighlighted}
                    onExecutor={() => {
                      // 任务 5：跳转至独立 SOP 详情页（/projects/[slug]），完全脱离四库 layout
                      window.location.href = `/projects/${proj.slug}`
                    }}
                    onFindOpc={() => setFindOpcProject(proj)}
                  />
                )
              })}
            </div>
          </TabsContent>

          {/* ════════ AI智富资源库：Bento 网格 + 6 大资源板块 ════════ */}
          <TabsContent value="resources" className="mt-5">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="text-amber-500" size={18} />
              <span className="font-bold text-gray-900 text-sm">📚 AI 智富资源库</span>
              <span className="text-[10px] text-slate-500">数字 / 实物 / 软件 / 硬件 / 课程 / 加盟</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">
              💡 6 大资源板块一站直达，下载 / 外链 / 内部跳转 / 会员解锁 / 招商加盟
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resourceItems.map((res) => (
                <ResourceCard
                  key={res.id}
                  resource={res}
                  membershipTier={membershipTier}
                  userProgress={userProgress}
                  onPartner={(r) => setPartnerInquiry({ resource: r })}
                  onLocked={(r) => setLockedResource(r)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* ════════ 服务库粘性行动面板（仅在选中项 > 0 时显示） ════════ */}
        {selectedServices.length > 0 && (
          <div className="fixed bottom-4 left-0 right-0 z-40 px-4 pointer-events-none">
            <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-3 pointer-events-auto">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold">
                {selectedServices.length}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900">
                  已选择 {selectedServices.length} 项服务，提交您的需求
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {selectedServiceItems.map((s) => s.title).join(' · ')}
                </div>
              </div>
              <button
                type="button"
                onClick={handleSubmitWithPreCheck}
                className="flex-shrink-0 px-4 py-2.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all"
              >
                立即提交需求 →
              </button>
            </div>
          </div>
        )}

        {/* ════════ OPC 共创 UGC 资源投稿横幅（仅资源库 tab 显示） ════════ */}
        {activeTab === 'resources' && (
          <div className="mt-10 relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 md:p-8 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-pink-400/20 rounded-full blur-2xl" />
            <div className="relative flex flex-col md:flex-row items-center gap-5 text-white">
              <div className="flex-1">
                <div className="text-xs text-blue-100 mb-1.5">🌱 OPC 生态共创</div>
                <h3 className="text-lg md:text-xl font-bold mb-2">
                  你是 OPC 生态成员？点击这里分享你的资源
                </h3>
                <p className="text-sm text-blue-50/90 leading-relaxed">
                  实物货源 / AI 软件 / 智能硬件 / 精品教程 ——
                  投稿后 1-3 个工作日审核，通过即可在资源库展示并获得评分
                </p>
              </div>
              <button
                type="button"
                onClick={handleSubmitClick}
                className="flex-shrink-0 px-5 py-2.5 bg-white text-blue-600 text-sm font-semibold rounded-xl hover:scale-105 transition-transform shadow-lg flex items-center gap-1.5"
              >
                立即上架 →
              </button>
            </div>
          </div>
        )}

        {/* ════════ 工具开发者招募横幅（仅工具库 tab 保留） ════════ */}
        {activeTab === 'tools' && (
          <div className="mt-10 relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 md:p-8 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="relative flex flex-col md:flex-row items-center gap-5 text-white">
              <div className="flex-1">
                <div className="text-xs text-blue-100 mb-1.5">🤖 工具开发者招募</div>
                <h3 className="text-lg md:text-xl font-bold mb-2">你是工具开发者？</h3>
                <p className="text-sm text-blue-50/90">
                  点击这里上架你的工具，获得 OPC 生态免费推广
                </p>
              </div>
              <Link
                href="/tools/submit"
                className="flex-shrink-0 px-5 py-2.5 bg-white text-blue-600 text-sm font-semibold rounded-xl hover:scale-105 transition-transform shadow-lg"
              >
                立即上架 →
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* ════════ 需求收集弹窗（受控） ════════ */}
      {inquiryOpen && (
        <ServiceInquiryModal
          services={selectedServiceItems}
          hasDiagnosis={hasDiagnosis}
          opcLevel={opcLevel}
          onClose={() => setInquiryOpen(false)}
          onSuccess={() => {
            setSelectedServices([])
            setInquiryOpen(false)
          }}
        />
      )}

      {/* ════════ 服务库 · 前置检测弹窗（任务 1） ════════ */}
      {preCheckOpen && (
        <PreCheckModal
          onClose={() => setPreCheckOpen(false)}
          onProceedAnyway={() => {
            setPreCheckOpen(false)
            setInquiryOpen(true)
          }}
        />
      )}

      {/* ════════ 项目库 · 寻找资深 OPC 弹窗（任务 3） ════════ */}
      {findOpcProject && (
        <FindSeniorOPCModal
          project={findOpcProject}
          onClose={() => setFindOpcProject(null)}
        />
      )}

      {/* ════════ 协作匹配弹窗（学习入门 → 找人合作 联动）══════ */}
      {collaborationService && (
        <CollaborationMatchModal
          service={collaborationService}
          opcLevel={opcLevel}
          city={userCity}
          onClose={() => setCollaborationService(null)}
          onSubmitForm={handleCollaborationSubmitForm}
        />
      )}

      {/* ════════ 资源库 · 招商加盟对接弹窗（受控） ════════ */}
      {partnerInquiry && (
        <PartnerInquiryModal
          resource={partnerInquiry.resource}
          onClose={() => setPartnerInquiry(null)}
          onSuccess={() => setPartnerInquiry(null)}
        />
      )}

      {/* ════════ 资源库 UGC 弹窗 · 投稿模态框（任务 2） ════════ */}
      {submissionOpen && (
        <ResourceSubmissionModal
          author={getAuthorInfo()}
          onClose={() => setSubmissionOpen(false)}
        />
      )}

      {/* ════════ 资源库 UGC 弹窗 · 未登录拦截（任务 2） ════════ */}
      {needLoginOpen && (
        <NeedLoginToSubmitModal
          onClose={() => setNeedLoginOpen(false)}
          onLogin={() => {
            setNeedLoginOpen(false)
            // 引导至 /diagnosis 作为"登录/注册 OPC"入口
            window.location.href = '/diagnosis'
          }}
        />
      )}

      {/* ════════ 资源库 · 解锁拦截弹窗（受控） ════════ */}
      {lockedResource && (
        <UnlockResourceModal
          resource={lockedResource}
          opcLevel={opcLevel}
          currentTier={membershipTier}
          onClose={() => setLockedResource(null)}
        />
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// 工具库子分类区块（双层循环的"外层"）
// ════════════════════════════════════════════════════════════════

function ToolCategorySection({
  category,
  highlightCategory,
  briefHighlight,
}: {
  category: ToolCategory
  highlightCategory?: ToolSlug
  briefHighlight?: ToolSlug | string | null
}) {
  // 派生锚点 id：用于 /market/tools 顶部快捷分流滚动
  // 显式映射到稳定英文 slug（避免中文字符在 URL 中的兼容问题）
  const currentSlug = TOOL_SLUG_MAP[category.title]
  const anchorId = `tools-category-${currentSlug}`
  const isHighlighted = highlightCategory === currentSlug
  const isBriefFlash = briefHighlight === currentSlug

  // 统计总平台数（用于右侧徽章）
  const totalPlatforms = category.subCategories
    ? category.subCategories.reduce((sum, sub) => sum + sub.platforms.length, 0)
    : category.platforms?.length || 0

  return (
    <section
      id={anchorId}
      className={`rounded-2xl transition-all duration-500 ${
        isBriefFlash ? 'ring-2 ring-blue-400/50 bg-blue-50/40 -m-1 p-1' : ''
      }`}
    >
      {/* 顶级分类标题 */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-2xl">{category.emoji}</span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm md:text-base font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
            {category.title}
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {totalPlatforms}
            </span>
            {isHighlighted && (
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full animate-pulse">
                ✨ 为你定位
              </span>
            )}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">{category.subtitle}</p>
        </div>
      </div>

      {/* 渲染分支：1) 子分类模式（聚合入口）  2) 平铺模式（自研工具） */}
      {category.subCategories ? (
        // ════════ 子分类模式：每个子分类渲染一个小标题 + 卡片网格 ═══════
        <div className="space-y-4">
          {category.subCategories.map((sub) => {
            // 单独锚点：AI 辅助工具子分类（支持顶部胶囊快速定位）
            const auxId = sub.title === 'AI辅助工具' ? 'ai-auxiliary' : undefined
            return (
              <div
                key={sub.title}
                id={auxId}
                className={`rounded-2xl bg-white border border-slate-200 p-4 hover:shadow-md transition-shadow ${
                  auxId ? 'scroll-mt-20' : ''
                }`}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-lg">{sub.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[13px] font-bold text-slate-800 flex items-center gap-1.5">
                      {sub.title}
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
                        {sub.platforms.length}
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{sub.subtitle}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {sub.platforms.map((p, idx) => (
                    <PlatformCard
                      key={p.name}
                      platform={p}
                      highlight={isHighlighted && idx === 0}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        // ════════ 平铺模式：直接渲染 platforms 网格 ═══════
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {category.platforms?.map((p, idx) => (
            <PlatformCard
              key={p.name}
              platform={p}
              highlight={isHighlighted && idx === 0}
            />
          ))}
        </div>
      )}
    </section>
  )
}

// ════════════════════════════════════════════════════════════════
// 平台卡片：轻量化 CTA + 右侧箭头（Stripe / Linear 范式）
// ════════════════════════════════════════════════════════════════

function PlatformCard({
  platform,
  highlight = false,
}: {
  platform: Platform
  /** 高亮模式：带 ring + pulse（用于诊断后自动定位） */
  highlight?: boolean
}) {
  const action = platform.action || 'visit'
  const isInternal = platform.url.startsWith('/') && platform.url !== '#'
  const tagColor =
    platform.tag === '必装' ? 'bg-slate-100 text-slate-600' :
    platform.tag === '热门' ? 'bg-slate-100 text-slate-600' :
    platform.tag === '爆款' ? 'bg-slate-100 text-slate-600' :
    platform.tag === '推荐' ? 'bg-slate-100 text-slate-600' :
    platform.tag === '出海' ? 'bg-slate-100 text-slate-600' :
    platform.tag === '开店注册' ? 'bg-orange-100 text-orange-700' :
    'bg-slate-100 text-slate-500'

  // AI 内容生成场景徽章配置（任务 5）
  const SCENE_BADGE: Record<NonNullable<Platform['scene']>, { className: string; label: string }> = {
    writing: { className: 'bg-emerald-100 text-emerald-700', label: '✍️ 写文案' },
    image: { className: 'bg-indigo-100 text-indigo-700', label: '🎨 做图片' },
    video: { className: 'bg-rose-100 text-rose-700', label: '🎬 搞视频' },
    coding: { className: 'bg-amber-100 text-amber-700', label: '💻 编代码' },
  }
  const sceneBadge = platform.scene ? SCENE_BADGE[platform.scene] : null

  const actionLabel =
    action === 'download' ? '立即下载' :
    action === 'enter' ? '立即进入' :
    platform.url === '#' ? '暂无外链' :
    '前往官网'

  const ActionIcon =
    action === 'download' ? Download :
    action === 'enter' ? ArrowRight :
    platform.url === '#' ? Lock :
    ExternalLink

  const cardInner = (
    <div className="flex items-start gap-3">
      {/* 平台 emoji 占位 */}
      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center text-xl">
        {platform.icon || '🔗'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
            {platform.name}
          </span>
          {platform.tag && (
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${tagColor}`}>
              {platform.tag}
            </span>
          )}
          {sceneBadge && (
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${sceneBadge.className}`}>
              {sceneBadge.label}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[11px] text-slate-500 leading-snug line-clamp-1">
          {platform.description}
        </p>
      </div>
    </div>
  )

  // 轻量化 CTA：border + transparent + hover:bg-slate-50 + 右侧箭头
  const actionButton = (
    <div className="mt-3 flex items-center justify-between w-full border border-slate-200 bg-transparent text-slate-600 group-hover:border-slate-300 group-hover:bg-slate-50 transition-colors px-4 py-2 rounded-lg">
      <span className="flex items-center gap-1.5 text-xs font-semibold">
        <ActionIcon size={12} className="text-slate-500" />
        <span>{actionLabel}</span>
      </span>
      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
    </div>
  )

  const baseClass = highlight
    ? 'group block bg-white rounded-2xl shadow-md p-4 border-2 border-blue-500 ring-2 ring-blue-500/30 animate-pulse transition-all'
    : 'group block bg-white rounded-2xl shadow-sm hover:shadow-md p-4 border border-slate-100 hover:border-slate-200 transition-all'

  // 无外链（StableDiffusion 占位）：渲染为 <div>
  if (platform.url === '#') {
    return (
      <div className={baseClass + ' cursor-default'}>
        {cardInner}
        {actionButton}
      </div>
    )
  }

  // 内部路由走 Next.js Link，外部链接走 <a target="_blank">
  if (isInternal) {
    return (
      <Link href={platform.url} className={baseClass}>
        {cardInner}
        {actionButton}
      </Link>
    )
  }

  return (
    <a
      href={platform.url}
      target="_blank"
      rel="noopener noreferrer"
      className={baseClass}
    >
      {cardInner}
      {actionButton}
    </a>
  )
}

// ════════════════════════════════════════════════════════════════
// 服务库多选卡片（点击切换选中状态 + 边框蓝+对勾反馈）
// ════════════════════════════════════════════════════════════════

function ServiceSelectCard({
  service,
  selected,
  onToggle,
  highlighted = false,
}: {
  service: ServiceItem
  selected: boolean
  onToggle: () => void
  /**
   * 来自学习入门页"找人合作"协作高亮
   * true → 紫色 ring-2 描边 + 协作推荐角标
   */
  highlighted?: boolean
}) {
  const isAI = service.type === 'ai'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        'group relative w-full text-left bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-5 cursor-pointer',
        'border-2',
        highlighted
          ? 'border-purple-500 ring-2 ring-purple-500 shadow-purple-100'
          : selected
          ? 'border-blue-500 ring-2 ring-blue-100 shadow-blue-100'
          : 'border-transparent hover:border-blue-200'
      )}
    >
      {/* 协作推荐角标（来自学习入门页） */}
      {highlighted && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-extrabold text-white bg-gradient-to-r from-purple-500 to-fuchsia-500 px-2 py-0.5 rounded-full shadow-md">
          🤝 协作推荐
        </span>
      )}
      {/* 选中对勾（未高亮时显示） */}
      {selected && !highlighted && (
        <span className="absolute top-3 right-3 inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white shadow-md">
          <CheckCircle2 size={14} strokeWidth={3} />
        </span>
      )}

      <div className="flex items-start gap-3 mb-3">
        <div
          className={cn(
            'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
            isAI
              ? 'bg-slate-100 border border-slate-200'
              : 'bg-slate-100 border border-slate-200'
          )}
        >
          {service.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={cn(
                'text-sm font-bold',
                selected ? 'text-blue-600' : 'text-slate-800'
              )}
            >
              {service.title}
            </span>
            {service.tag && (
              <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full', service.tagColor || 'bg-slate-100 text-slate-500')}>
                {service.tag}
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
            {isAI ? <Bot size={10} /> : <Building2 size={10} />}
            <span>{isAI ? 'AI 智能体服务' : '专家人工服务'}</span>
          </div>
        </div>
      </div>

      <p className="text-[12px] text-slate-600 leading-relaxed line-clamp-2">
        {service.desc}
      </p>

      <div
        className={cn(
          'mt-3 flex items-center justify-between text-[11px] font-bold',
          selected ? 'text-blue-600' : 'text-slate-400'
        )}
      >
        <span>{selected ? '已选中' : '点击选择'}</span>
        <ChevronRight
          size={14}
          className={cn(
            'transition-transform',
            selected ? 'translate-x-0.5 text-blue-600' : 'group-hover:translate-x-0.5'
          )}
        />
      </div>
    </button>
  )
}

// ════════════════════════════════════════════════════════════════
// 项目库卡片 · 对接匹配引擎（Bento 网格 + 双按钮）
// 主按钮保留引导色，次按钮降级为轻量 outline
// 任务 2：highlighted=true → ring-2 ring-blue-500 + 推荐徽章
// 任务 3：次按钮文案改为"寻找资深OPC"，点击触发 find-opc 弹窗
// 任务 4：主按钮"我想做这个项目"跳详情页 /market/projects/[slug]
// ════════════════════════════════════════════════════════════════

function ProjectCard({
  project,
  highlighted = false,
  onExecutor,
  onFindOpc,
}: {
  project: ProjectItem
  /** 精准推荐模式高亮（任务 2） */
  highlighted?: boolean
  onExecutor: () => void
  onFindOpc: () => void
}) {
  return (
    <div
      className={cn(
        'relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-2 border',
        highlighted
          ? 'border-blue-400 ring-2 ring-blue-500 shadow-blue-200/50 shadow-md'
          : 'border-slate-100 hover:border-slate-200'
      )}
    >
      {/* 精准推荐徽章（任务 2） */}
      {highlighted && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md ring-2 ring-white">
            <Sparkles size={10} />
            优先推荐
          </div>
        </div>
      )}

      {/* 顶部：分类标签（轻量化 Tag） */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500'
          )}
        >
          <span>{project.categoryEmoji}</span>
          <span>{project.category}</span>
        </span>
        {project.roleSupport.includes('manager') && (
          <span className="text-[9px] font-bold text-amber-600 bg-slate-100 px-2 py-0.5 rounded-full">
            招募主理人
          </span>
        )}
      </div>

      {/* 标题 + 描述 */}
      <h3 className="font-bold text-lg text-slate-800 leading-snug">
        {project.title}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
        {project.desc}
      </p>

      {/* 双动作按钮：移动端 flex-col 铺满 / 桌面端 flex-row 并排 */}
      <div className="mt-3 flex flex-col md:flex-row gap-2">
        {/* 主按钮：保留渐变色，引导主操作（任务 4：跳详情页） */}
        <button
          type="button"
          onClick={onExecutor}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all min-h-[40px]"
        >
          <Bot size={14} />
          <span>我想做这个项目</span>
        </button>
        {/* 次按钮：任务 3 — 文案改为"寻找资深OPC" */}
        <button
          type="button"
          onClick={onFindOpc}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border border-slate-200 bg-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-300 text-xs font-bold rounded-xl transition-colors min-h-[40px]"
        >
          <Award size={14} />
          <span>寻找资深OPC</span>
        </button>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// 资源库卡片 · Bento 网格 + 5 种交互类型
//   - download / external / internal / unlock / partner
// 全部按钮统一轻量化（border + transparent + hover）
// ════════════════════════════════════════════════════════════════

function ResourceCard({
  resource,
  membershipTier,
  userProgress,
  onPartner,
  onLocked,
}: {
  resource: ResourceItem
  membershipTier: MembershipTier
  /** 用户学习进度（用于 practice-or-member 模式解锁判定） */
  userProgress: UserProgressSnapshot | null
  onPartner: (r: ResourceItem) => void
  onLocked: (r: ResourceItem) => void
}) {
  // ════════════════════════════════════════════════════════════════
  // 解锁判定（双模式分支）
  //   - member-only        → 仅看会员等级
  //   - practice-or-member → 满足 (会员 OR 运营实操已解锁) 即可
  //   - 默认（无 unlockMode）→ 兼容旧 unlock 资源（仅会员）
  // ════════════════════════════════════════════════════════════════
  const isUnlocked = (() => {
    if (resource.type !== 'unlock') return false
    const memberOk = canUnlockResource(membershipTier)
    if (resource.unlockMode === 'practice-or-member') {
      return memberOk || userProgress?.canUnlockPractice === true
    }
    // 默认 member-only 行为
    return memberOk
  })()

  /**
   * 渲染底部按钮（按 type 分支，统一轻量化风格）
   */
  const renderAction = () => {
    const baseBtn =
      'mt-auto w-full flex items-center justify-between border bg-transparent text-slate-600 group-hover:bg-slate-50 transition-colors px-4 py-2 rounded-lg min-h-[40px]'

    switch (resource.type) {
      case 'external':
        return (
          <a
            href={resource.href || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(baseBtn, 'border-slate-200 group-hover:border-slate-300')}
          >
            <span className="flex items-center gap-1.5 text-xs font-semibold">
              <Globe size={12} className="text-slate-500" />
              <span>了解详情</span>
            </span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-all" />
          </a>
        )
      case 'internal':
        return (
          <Link
            href={resource.href || '/market'}
            className={cn(baseBtn, 'border-slate-200 group-hover:border-slate-300')}
          >
            <span className="flex items-center gap-1.5 text-xs font-semibold">
              <Wrench size={12} className="text-slate-500" />
              <span>去工具库试用</span>
            </span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-all" />
          </Link>
        )
      case 'unlock':
        if (isUnlocked) {
          // 已解锁：优先用 externalHref（外链下载），否则走内部默认
          if (resource.externalHref && /^https?:\/\//.test(resource.externalHref)) {
            return (
              <a
                href={resource.externalHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  baseBtn,
                  'border-emerald-200 group-hover:bg-emerald-50 group-hover:border-emerald-300 text-emerald-700'
                )}
              >
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  <Download size={12} className="text-emerald-600" />
                  <span>已解锁 · 前往下载</span>
                </span>
                <ArrowRight className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </a>
            )
          }
          return (
            <Link
              href={resource.externalHref || '/market'}
              className={cn(
                baseBtn,
                'border-emerald-200 group-hover:bg-emerald-50 group-hover:border-emerald-300 text-emerald-700'
              )}
            >
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <Crown size={12} className="text-emerald-600" />
                <span>已解锁 · 立即观看</span>
              </span>
              <ArrowRight className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </Link>
          )
        }
        // 未解锁：若配置了 lockedHref → 跳到指定内部页面（替代弹窗）
        if (resource.lockedHref) {
          return (
            <Link
              href={resource.lockedHref}
              className={cn(
                baseBtn,
                'border-amber-200 group-hover:bg-amber-50 group-hover:border-amber-300'
              )}
            >
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                <Lock size={12} className="text-amber-500" />
                <span>解锁资源 →</span>
              </span>
              <ArrowRight className="w-3 h-3 text-amber-400 group-hover:translate-x-0.5 transition-all" />
            </Link>
          )
        }
        // 未解锁：拦截 → 触发 UnlockResourceModal
        return (
          <button
            type="button"
            onClick={() => onLocked(resource)}
            className={cn(
              baseBtn,
              'border-amber-200 group-hover:bg-amber-50 group-hover:border-amber-300'
            )}
          >
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
              <Lock size={12} className="text-amber-500" />
              <span>解锁资源 →</span>
            </span>
            <ArrowRight className="w-3 h-3 text-amber-400 group-hover:translate-x-0.5 transition-all" />
          </button>
        )
      case 'partner':
        return (
          <button
            type="button"
            onClick={() => onPartner(resource)}
            className={cn(baseBtn, 'border-indigo-200 group-hover:bg-indigo-50 group-hover:border-indigo-300')}
          >
            <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
              <Handshake size={12} className="text-indigo-500" />
              <span>咨询城市主理人</span>
            </span>
            <ArrowRight className="w-3 h-3 text-indigo-400 group-hover:translate-x-0.5 transition-all" />
          </button>
        )
      default:
        return null
    }
  }

  /**
   * 渲染右上角标签（已解锁 / 需解锁 / 原始 tag）
   *   - type === 'unlock' 时根据 isUnlocked 决定标签
   *   - 其他 type 用 resource.tag
   */
  const renderTag = () => {
    if (resource.type === 'unlock') {
      if (isUnlocked) {
        return (
          <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-0.5">
            <CheckCircle2 size={10} />
            已解锁
          </span>
        )
      }
      // 未解锁：根据 unlockMode 显示不同标签文案
      const isPracticeGate = resource.unlockMode === 'practice-or-member'
      return (
        <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-0.5">
          <Lock size={10} />
          {isPracticeGate ? '🔒 需解锁' : '🔒 会员专享'}
        </span>
      )
    }
    if (!resource.tag) return null
    return (
      <span
        className={cn(
          'flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full',
          resource.tagColor || 'bg-slate-100 text-slate-500'
        )}
      >
        {resource.tag}
      </span>
    )
  }

  return (
    <div
      className={cn(
        'group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-2 border-t-4',
        resource.borderTopColor
      )}
    >
      {/* 顶部：图标 + 标题 + 标签 */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-2xl',
              resource.iconBgColor
            )}
          >
            {resource.icon}
          </div>
          <h3 className="font-bold text-lg text-slate-800 leading-tight">
            {resource.title}
          </h3>
        </div>
        {renderTag()}
      </div>

      {/* 描述 */}
      <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 min-h-[3.6em]">
        {resource.desc}
      </p>

      {/* 底部操作按钮 */}
      {renderAction()}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// 前置检测弹窗（任务 1：未诊断用户首次提交时弹出）
// ════════════════════════════════════════════════════════════════

function PreCheckModal({
  onClose,
  onProceedAnyway,
}: {
  onClose: () => void
  onProceedAnyway: () => void
}) {
  const router = useRouter()
  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 md:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full md:max-w-md bg-white rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部暖色横幅 */}
        <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-pink-500 px-5 py-5 text-white">
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/15 blur-2xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="text-[10px] font-bold tracking-wider uppercase text-amber-100 mb-1">
                ⚠️ 前置提醒
              </div>
              <h3 className="text-base md:text-lg font-extrabold leading-snug">
                系统检测到您还未完成
                <br />
                《OPC 智富入局诊断》
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="关闭"
              className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
            <Sparkles size={16} className="flex-shrink-0 mt-0.5 text-amber-500" />
            <span>
              为了让您的服务需求得到<strong className="text-amber-600">最精准的匹配</strong>，建议先完成诊断。
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-700 mb-1">📌 完成诊断后可解锁：</div>
            <div>· 4 大 OPC 路径专属方案（交易/流量/系统/资产）</div>
            <div>· 系统为您智能匹配对应的专属专家</div>
            <div>· 个性化工具 / 项目 / 服务推荐</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                onClose()
                router.push('/diagnosis')
              }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              🧭 先去诊断，再提交
            </button>
            <button
              type="button"
              onClick={onProceedAnyway}
              className="flex-1 px-4 py-3 bg-white text-slate-700 border border-slate-300 text-sm font-medium rounded-xl hover:bg-slate-50 active:scale-95 transition-all"
            >
              我已了解，直接提交
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// 需求收集弹窗（含 AI/专家分流反馈 + 主理人推荐）
// ════════════════════════════════════════════════════════════════

function ServiceInquiryModal({
  services,
  hasDiagnosis,
  opcLevel,
  onClose,
  onSuccess,
}: {
  services: ServiceItem[]
  /** 是否已完成诊断（任务 2 上下文感知） */
  hasDiagnosis?: boolean
  /** 诊断的 OPC 类型（仅 hasDiagnosis=true 时有效） */
  opcLevel?: 'TRADER' | 'FLOW' | 'SYSTEM' | 'ASSET' | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    wechat: '',
    description: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<InquiryResult | null>(null)

  const servicesSummary = services.map((s) => s.title).join('、')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) return
    setSubmitting(true)
    setResult(null)
    try {
      const res = await fetch('/api/services/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedServices: services.map((s) => s.id),
          form: {
            ...form,
            // 任务 3：把 opcLevel 透传给后端，用于智能路由
            opcLevel: hasDiagnosis ? opcLevel ?? null : null,
          },
        }),
      })
      const data: InquiryResult = await res.json()
      setResult(data)
      if (data.success) {
        setTimeout(() => onSuccess(), 4000)
      }
    } catch (err) {
      setResult({
        success: false,
        message: '提交失败，请稍后重试',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 md:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题 */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-5 py-4 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-blue-600 tracking-wider uppercase mb-1">
              📋 需求提交
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              请填写您的联系方式
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
              我们将为您精准对接：<span className="font-bold text-slate-700">{servicesSummary}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* ═══ 上下文感知横幅（任务 2）═══ */}
        {hasDiagnosis && opcLevel && OPC_LEVEL_DISPLAY[opcLevel] && (
          <div className="mx-5 mt-4 bg-blue-50 border-l-4 border-blue-500 p-3 rounded-md text-sm text-blue-800 flex items-start gap-2">
            <Sparkles size={16} className="flex-shrink-0 mt-0.5 text-blue-500" />
            <div>
              <div className="font-bold">
                根据您的诊断结果（{OPC_LEVEL_DISPLAY[opcLevel].emoji} {OPC_LEVEL_DISPLAY[opcLevel].label}）
              </div>
              <div className="text-[11px] text-blue-700/80 mt-0.5">
                系统将为您匹配最合适专家，提交后 24h 内主动联系您。
              </div>
            </div>
          </div>
        )}

        {/* 表单 / 结果 */}
        {result ? (
          <InquiryResultView result={result} />
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <Field
              icon={<User size={14} />}
              label="姓名"
              required
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              placeholder="您的称呼"
            />
            <Field
              icon={<Phone size={14} />}
              label="手机号"
              required
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              placeholder="11 位手机号"
              type="tel"
            />
            <Field
              icon={<MessageCircle size={14} />}
              label="微信号"
              value={form.wechat}
              onChange={(v) => setForm({ ...form, wechat: v })}
              placeholder="选填，便于添加您"
            />
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                <Send size={12} />
                简要说明
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="说一说您的具体场景和期望（选填）"
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || !form.name.trim() || !form.phone.trim()}
                className="w-full py-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    提交中…
                  </>
                ) : (
                  <>获取专属方案 →</>
                )}
              </button>
              <p className="mt-2 text-[10px] text-slate-400 text-center">
                提交即表示同意《用户协议》和《隐私政策》
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
}: {
  icon: React.ReactNode
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
        {icon}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
      />
    </div>
  )
}

function InquiryResultView({ result }: { result: InquiryResult }) {
  if (!result.success) {
    return (
      <div className="p-6 text-center">
        <div className="text-4xl mb-3">😢</div>
        <h4 className="text-base font-bold text-slate-900 mb-2">提交失败</h4>
        <p className="text-sm text-slate-500">{result.message}</p>
      </div>
    )
  }

  return (
    <div className="p-5 space-y-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-lg mb-3">
          <CheckCircle2 size={32} strokeWidth={2.5} />
        </div>
        <h4 className="text-base font-bold text-slate-900 mb-1">需求已提交成功！</h4>
        <p className="text-xs text-slate-500">我们已为您开启以下通道，4 秒后自动关闭</p>
      </div>

      {result.aiSessions && result.aiSessions.length > 0 && (
        <ResultBlock
          icon={<Bot size={16} className="text-blue-500" />}
          title="🤖 AI 智能体已开启"
          items={result.aiSessions}
          tone="blue"
        />
      )}

      {result.expertTickets && result.expertTickets.length > 0 && (
        <ResultBlock
          icon={<Building2 size={16} className="text-violet-500" />}
          title="👨‍💼 专家工单已创建"
          items={result.expertTickets}
          tone="violet"
        />
      )}

      {result.matchedManagers && result.matchedManagers.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
            <Users size={14} className="text-amber-500" />
            📍 为您推荐当地 OPC 主理人
          </div>
          <div className="space-y-2">
            {result.matchedManagers.map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-amber-50/60 border border-amber-200 rounded-xl"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-sm font-bold">
                  {m.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900">
                    {m.name} <span className="text-[10px] text-slate-500 font-normal">· {m.city}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    📞 {m.phone} · 微信 {m.wechat}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ 任务 3：专属专家智能分配结果 ═══ */}
      {result.assignedExpert && (
        <div
          className={`p-3 rounded-xl border ${
            result.assignedExpert.fallback
              ? 'bg-slate-50 border-slate-200'
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
            <Crown size={14} className={result.assignedExpert.fallback ? 'text-slate-500' : 'text-amber-500'} />
            {result.assignedExpert.fallback ? '🏢 总部专家池' : '🎯 专属专家已分配'}
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full text-white flex items-center justify-center text-lg ${
                result.assignedExpert.fallback
                  ? 'bg-gradient-to-br from-slate-400 to-slate-600'
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600'
              }`}
            >
              {result.assignedExpert.avatar || (result.assignedExpert.fallback ? '🏢' : '👤')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-slate-900">
                {result.assignedExpert.name}
              </div>
              <div className="text-[11px] text-slate-500">
                {result.assignedExpert.specialty}
              </div>
              {result.assignedExpert.wechat && (
                <div className="text-[10px] text-slate-400 mt-0.5">
                  微信 {result.assignedExpert.wechat}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ResultBlock({
  icon,
  title,
  items,
  tone,
}: {
  icon: React.ReactNode
  title: string
  items: string[]
  tone: 'blue' | 'violet'
}) {
  const toneClass =
    tone === 'blue'
      ? 'bg-blue-50/60 border-blue-200'
      : 'bg-violet-50/60 border-violet-200'
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
        {icon}
        {title}
      </div>
      <div className={`p-3 ${toneClass} border rounded-xl space-y-1`}>
        {items.map((it, i) => (
          <div key={i} className="flex items-start gap-1.5 text-[12px] text-slate-700">
            <CheckCircle2 size={12} className="text-green-500 mt-0.5 flex-shrink-0" />
            <span>{it}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// 项目对接匹配弹窗（含 AI 启动清单 / 合作方工单 / 主理人推荐）
// ════════════════════════════════════════════════════════════════

function ProjectInquiryModal({
  project,
  intent,
  onClose,
  onSuccess,
}: {
  project: ProjectItem
  intent: 'executor' | 'partner'
  onClose: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    role: intent,
  })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<ProjectInquiryResult | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) return
    setSubmitting(true)
    setResult(null)
    try {
      const res = await fetch('/api/projects/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          intent: form.role,
          form,
        }),
      })
      const data: ProjectInquiryResult = await res.json()
      setResult(data)
      if (data.success) {
        setTimeout(() => onSuccess(), 5000)
      }
    } catch (err) {
      setResult({ success: false, message: '提交失败，请稍后重试' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 md:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题 */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-5 py-4 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase mb-1">
              📁 项目对接
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              您对【{project.title}】感兴趣
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              请留下联系方式，我们为您匹配专属顾问
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        {result ? (
          <ProjectInquiryResultView result={result} project={project} />
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <Field
              icon={<User size={14} />}
              label="姓名"
              required
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              placeholder="您的称呼"
            />
            <Field
              icon={<Phone size={14} />}
              label="手机号 / 微信"
              required
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              placeholder="便于添加您"
              type="tel"
            />
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                <Briefcase size={12} />
                意向角色
              </label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as 'executor' | 'partner' })
                }
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              >
                {project.roleSupport.map((r) => (
                  <option key={r} value={r}>
                    {INTENT_LABEL[r]}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || !form.name.trim() || !form.phone.trim()}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    对接中…
                  </>
                ) : (
                  <>对接专属项目顾问 →</>
                )}
              </button>
              <p className="mt-2 text-[10px] text-slate-400 text-center">
                提交即表示同意《用户协议》和《隐私政策》
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function ProjectInquiryResultView({
  result,
  project,
}: {
  result: ProjectInquiryResult
  project: ProjectItem
}) {
  if (!result.success) {
    return (
      <div className="p-6 text-center">
        <div className="text-4xl mb-3">😢</div>
        <h4 className="text-base font-bold text-slate-900 mb-2">提交失败</h4>
        <p className="text-sm text-slate-500">{result.message}</p>
      </div>
    )
  }

  return (
    <div className="p-5 space-y-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg mb-3">
          <CheckCircle2 size={32} strokeWidth={2.5} />
        </div>
        <h4 className="text-base font-bold text-slate-900 mb-1">对接已建立！</h4>
        <p className="text-xs text-slate-500">
          《{result.projectTitle || project.title}》专属通道已开启，5 秒后自动关闭
        </p>
      </div>

      {/* AI 启动清单（执行者） */}
      {result.aiChecklist && result.aiChecklist.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
            <Bot size={14} className="text-blue-500" />
            🤖 AI 启动清单（Dify 生成）
          </div>
          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1.5">
            {result.aiChecklist.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-1.5 text-[12px] text-slate-700"
              >
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 专家工单（合作方） */}
      {result.expertTicket && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
            <Building2 size={14} className="text-violet-500" />
            👨‍💼 合作方工单已创建
          </div>
          <div className="p-3 bg-violet-50/60 border border-violet-200 rounded-xl">
            <div className="flex items-start gap-1.5 text-[12px] text-slate-700">
              <CheckCircle2 size={12} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span>{result.expertTicket}</span>
            </div>
          </div>
        </div>
      )}

      {/* 主理人推荐（合作方/主理人） */}
      {result.matchedManagers && result.matchedManagers.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
            <Users size={14} className="text-amber-500" />
            📍 为您匹配当地 OPC 主理人
          </div>
          <div className="space-y-2">
            {result.matchedManagers.map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-amber-50/60 border border-amber-200 rounded-xl"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-sm font-bold">
                  {m.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900">
                    {m.name}{' '}
                    <span className="text-[10px] text-slate-500 font-normal">
                      · {m.city} · 擅长「{m.specialty}」
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    📞 {m.phone} · 微信 {m.wechat}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// 资源库 · 招商加盟对接弹窗
//   根据意向城市匹配 OPC 主理人（API 后端分流）
// ════════════════════════════════════════════════════════════════

function PartnerInquiryModal({
  resource,
  onClose,
  onSuccess,
}: {
  resource: ResourceItem
  onClose: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState({ name: '', wechat: '', city: '' })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<PartnerInquiryResult | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.wechat.trim() || !form.city.trim()) return
    setSubmitting(true)
    setResult(null)
    try {
      const res = await fetch('/api/resources/partner-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          wechat: form.wechat,
          city: form.city,
          resourceId: resource.id,
        }),
      })
      const data: PartnerInquiryResult = await res.json()
      setResult(data)
      if (data.success) {
        setTimeout(() => onSuccess(), 6000)
      }
    } catch (err) {
      setResult({ success: false, routed: 'expert', message: '提交失败，请稍后重试' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 md:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题 */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-5 py-4 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase mb-1">
              🤝 招商加盟
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              您对【{resource.title}】感兴趣
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              我们为您对接当地 OPC 主理人，提供本地加盟政策
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        {result ? (
          <PartnerInquiryResultView result={result} />
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <Field
              icon={<User size={14} />}
              label="姓名"
              required
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              placeholder="您的称呼"
            />
            <Field
              icon={<MessageCircle size={14} />}
              label="微信号"
              required
              value={form.wechat}
              onChange={(v) => setForm({ ...form, wechat: v })}
              placeholder="便于主理人添加您"
            />
            <Field
              icon={<MapPin size={14} />}
              label="意向城市"
              required
              value={form.city}
              onChange={(v) => setForm({ ...form, city: v })}
              placeholder="如：上海 / 北京 / 深圳"
            />

            {/* 支持城市提示 */}
            <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl">
              <div className="text-[11px] font-bold text-indigo-700 mb-1.5">
                🏙️ 目前已开通主理人服务的城市
              </div>
              <div className="text-[10px] text-slate-600 leading-relaxed">
                北京 / 上海 / 深圳 / 广州 / 杭州 / 成都 / 武汉
                <br />
                <span className="text-slate-500">
                  其他城市将由总部专家 24h 内对接
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={
                  submitting ||
                  !form.name.trim() ||
                  !form.wechat.trim() ||
                  !form.city.trim()
                }
                className="w-full py-3 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    对接中…
                  </>
                ) : (
                  <>提交，获取当地加盟政策 →</>
                )}
              </button>
              <p className="mt-2 text-[10px] text-slate-400 text-center">
                提交即表示同意《用户协议》和《隐私政策》
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function PartnerInquiryResultView({ result }: { result: PartnerInquiryResult }) {
  if (!result.success) {
    return (
      <div className="p-6 text-center">
        <div className="text-4xl mb-3">😢</div>
        <h4 className="text-base font-bold text-slate-900 mb-2">提交失败</h4>
        <p className="text-sm text-slate-500">{result.message}</p>
      </div>
    )
  }

  return (
    <div className="p-5 space-y-4">
      <div className="text-center">
        <div
          className={cn(
            'inline-flex items-center justify-center w-16 h-16 rounded-full text-white shadow-lg mb-3',
            result.routed === 'manager'
              ? 'bg-gradient-to-br from-indigo-400 to-blue-600'
              : 'bg-gradient-to-br from-amber-400 to-orange-600'
          )}
        >
          {result.routed === 'manager' ? (
            <Handshake size={32} strokeWidth={2.5} />
          ) : (
            <ShieldCheck size={32} strokeWidth={2.5} />
          )}
        </div>
        <h4 className="text-base font-bold text-slate-900 mb-1">
          {result.routed === 'manager' ? '已为您匹配主理人' : '已转入总部专家线索池'}
        </h4>
        <p className="text-xs text-slate-500">{result.message}</p>
      </div>

      {/* 路径 1：匹配到主理人 */}
      {result.routed === 'manager' && result.manager && (
        <>
          {/* 主理人卡片 */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
              <Users size={14} className="text-indigo-500" />
              📍 当地 OPC 主理人
            </div>
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center text-base font-bold">
                  {result.manager.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900">
                    {result.manager.name}
                    <span className="text-[10px] text-slate-500 font-normal ml-1.5">
                      · {result.manager.city} · 擅长「{result.manager.specialty}」
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    📞 {result.manager.phone}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    💬 微信{' '}
                    <span className="font-bold text-indigo-600">
                      {result.manager.wechat}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 加盟政策 */}
          {result.policy && result.policy.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                <Crown size={14} className="text-amber-500" />
                🎁 加盟政策亮点
              </div>
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1.5">
                {result.policy.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-1.5 text-[12px] text-slate-700"
                  >
                    <CheckCircle2
                      size={12}
                      className="text-green-500 mt-0.5 flex-shrink-0"
                    />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 路径 2：未匹配到 → 转入人工专家 */}
      {result.routed === 'expert' && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
            <Building2 size={14} className="text-amber-500" />
            🏢 总部专家线索
          </div>
          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
            {result.ticketId && (
              <div className="text-[12px] text-slate-700">
                <span className="text-slate-500">工单编号：</span>
                <span className="font-bold text-amber-700">{result.ticketId}</span>
              </div>
            )}
            {result.eta && (
              <div className="flex items-start gap-1.5 text-[12px] text-slate-700">
                <CheckCircle2
                  size={12}
                  className="text-green-500 mt-0.5 flex-shrink-0"
                />
                <span>{result.eta}</span>
              </div>
            )}
            {result.fallback?.map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-1.5 text-[12px] text-slate-700"
              >
                <CheckCircle2
                  size={12}
                  className="text-green-500 mt-0.5 flex-shrink-0"
                />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] text-slate-400 text-center pt-1">
        6 秒后自动关闭
      </p>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// 资源库 · 会员门锁提示弹窗（点击 unlock 类型未达标时弹出）
// ════════════════════════════════════════════════════════════════

function MemberLockedModal({
  resource,
  currentTier,
  onClose,
}: {
  resource: ResourceItem
  currentTier: MembershipTier
  onClose: () => void
}) {
  const meta = MEMBERSHIP_TIER_META[currentTier] || MEMBERSHIP_TIER_META.none
  const isAlreadyMember = currentTier !== 'none'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 md:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题 */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-5 py-4 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-rose-600 tracking-wider uppercase mb-1">
              🔒 会员专享
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              {resource.title}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              {isAlreadyMember
                ? '当前会员等级暂不支持此资源'
                : '请先升级您的阶段，解锁全部精品教程'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* 资源预览 */}
          <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-2xl">
                {resource.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  {resource.title}
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                  {resource.desc}
                </p>
              </div>
            </div>
          </div>

          {/* 当前等级提示 */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                <User size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-slate-500">您当前的会员等级</div>
                <div className="text-sm font-bold text-slate-900">
                  {meta.label}
                </div>
              </div>
            </div>
          </div>

          {/* 解锁等级说明 */}
          <div>
            <div className="text-xs font-bold text-slate-700 mb-2">
              🔓 该资源仅向以下会员开放
            </div>
            <div className="space-y-2">
              {(['weekly_card', 'coaching'] as const).map((tier) => {
                const tierMeta = MEMBERSHIP_TIER_META[tier]
                return (
                  <div
                    key={tier}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-xl"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center">
                      <Crown size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-900">
                        {tierMeta.label}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {tierMeta.price}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="space-y-2 pt-1">
            <Link
              href="/pricing"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <Crown size={16} />
              <span>立即升级会员</span>
              <ArrowRight size={16} />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              暂不升级，继续浏览
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
