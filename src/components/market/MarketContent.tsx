'use client'

import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { serviceItems, type ServiceItem } from '@/data/service-items'
import { projectItems, type ProjectItem } from '@/data/project-items'
import { resourceItems, type ResourceItem } from '@/data/resource-items'
import {
  canUnlockResource,
  readMembershipTierFromStorage,
  type MembershipTier,
  MEMBERSHIP_TIER_META,
} from '@/lib/user-membership'

/**
 * AI 智富四库导航（统一入口 /market）
 * ------------------------------------------------------------
 * 路由：
 *   - /market              → 默认进入 AI智富工具库
 *   - /market/services     → 直接进入 AI智富服务库
 *   - /market/projects     → 直接进入 AI智富项目库
 *   - /market/resources    → 直接进入 AI智富资源库
 *   - /market/guide/[level]→ 按诊断结果展示个性化学习方案
 *
 * 4 库顺序（外层 Tabs）：
 *   1. AI智富工具库（默认）
 *   2. AI智富服务库
 *   3. AI智富项目库
 *   4. AI智富资源库
 *
 * 工具库内部分为 4 大子分类：
 *   - AI网店工作台（电商后台入口）
 *   - AI自媒体登录页（内容平台创作者入口）
 *   - AI网店运营工具（数据/物流/裂变）
 *   - AI内容生成工具（AI 创作生产力）
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
  /** 标签：热门 / 推荐 / 必装 等 */
  tag?: string
}

interface ToolCategory {
  title: string
  /** 分类大图标（emoji） */
  emoji: string
  /** 分类副标题 */
  subtitle: string
  platforms: Platform[]
}

const toolCategories: ToolCategory[] = [
  {
    title: 'AI 网店工作台',
    emoji: '🏪',
    subtitle: '一站直达各大电商平台商家后台',
    platforms: [
      { name: '淘宝商家后台', url: 'https://www.taobao.com', description: '国内领先电商后台', icon: '🛒', tag: '必装' },
      { name: '拼多多商家后台', url: 'https://mms.pinduoduo.com', description: '拼多多商家入口', icon: '🍎', tag: '热门' },
      { name: '亚马逊卖家中心', url: 'https://sellercentral.amazon.com', description: '全球开店', icon: '📦', tag: '出海' },
    ],
  },
  {
    title: 'AI 自媒体登录页',
    emoji: '📱',
    subtitle: '主流内容平台创作者中心一键直达',
    platforms: [
      { name: '抖音创作者中心', url: 'https://creator.douyin.com', description: '发布短视频', icon: '🎵' },
      { name: '小红书创作者中心', url: 'https://creator.xiaohongshu.com', description: '图文笔记', icon: '📕' },
      { name: '头条号', url: 'https://mp.toutiao.com', description: '内容分发', icon: '📰' },
      { name: '百家号', url: 'https://baijiahao.baidu.com', description: '百度创作平台', icon: '🔍' },
      { name: '知乎', url: 'https://www.zhihu.com', description: '问答社区', icon: '💡' },
    ],
  },
  {
    title: 'AI 网店运营工具',
    emoji: '🛠️',
    subtitle: '数据分析 / 自动发货 / 裂变引流',
    platforms: [
      { name: '店侦探', url: 'https://www.dianzhentan.com', description: '电商数据分析', icon: '🕵️', tag: '热门' },
      { name: '阿奇索', url: 'https://www.aqisuo.com', description: '自动发货系统', icon: '⚡' },
      { name: '抖羚羊', url: 'https://www.doulingyang.com', description: '裂变引流工具', icon: '🚀', tag: '推荐' },
    ],
  },
  {
    title: 'AI 内容生成工具',
    emoji: '✨',
    subtitle: 'AI 创作生产力 · 跑通首单必备',
    platforms: [
      { name: '豹纹工坊', url: 'https://www.baowenplus.com', description: 'AI 自媒体内容生成', icon: '🐆', tag: '热门' },
      { name: '灵犀 AI', url: 'https://www.lingxixai.com', description: '智能内容创作', icon: '🦊' },
      { name: '先锋派数字人', url: 'https://www.xianfengpai.com.cn', description: 'AI 数字人视频', icon: '🎬', tag: '爆款' },
      // 内部路由：智富严选走交易型专属引导页
      { name: '智富严选', url: '/market/guide/trader', description: 'AI 选品推荐', icon: '💎', tag: '必装', action: 'enter' },
    ],
  },
]

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

export function MarketContent({ defaultTab = 'tools' as MarketTab }: { defaultTab?: MarketTab }) {
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState<MarketTab>(defaultTab)
  const [searchQuery, setSearchQuery] = useState('')
  // 多选需求引擎状态
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [inquiryOpen, setInquiryOpen] = useState(false)
  // 项目库 · 对接匹配引擎状态
  const [projectInquiry, setProjectInquiry] = useState<{
    project: ProjectItem
    intent: 'executor' | 'partner'
  } | null>(null)
  // 资源库 · 招商加盟对接状态
  const [partnerInquiry, setPartnerInquiry] = useState<{
    resource: ResourceItem
  } | null>(null)
  // 资源库 · 会员门锁状态（用于 unlock 类型）
  const [lockedResource, setLockedResource] = useState<ResourceItem | null>(null)
  // 会员等级（订阅 localStorage 变化，实时同步）
  const [membershipTier, setMembershipTier] = useState<MembershipTier>('none')

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
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
      {/* ════════ 顶部导航 ════════ */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
            <span className="text-xl">🏢</span>
            <span>良朋社OPC</span>
          </Link>
          <span className="font-bold text-gray-900">AI 智富四库</span>
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

      <main className="px-5 py-6">
        {/* ════════ 顶部 Banner（胶囊化 + 紧凑） ════════ */}
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

        {/* ════════ 4 库 Tabs（顺序：工具 → 服务 → 项目 → 资源） ════════ */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
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

          {/* ════════ AI智富工具库：双层循环渲染 4 个子分类 ════════ */}
          <TabsContent value="tools" className="mt-5 space-y-6">
            {toolCategories.map((category) => (
              <ToolCategorySection key={category.title} category={category} />
            ))}
          </TabsContent>

          {/* ════════ AI智富服务库：多选需求引擎（8 个板块） ════════ */}
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
                />
              ))}
            </div>
          </TabsContent>

          {/* ════════ AI智富项目库：对接匹配引擎（8 个项目方向） ════════ */}
          <TabsContent value="projects" className="mt-5">
            <div className="mb-4 flex items-center gap-2">
              <FolderKanban className="text-emerald-500" size={18} />
              <span className="font-bold text-gray-900 text-sm">📁 AI 智富项目库</span>
              <span className="text-[10px] text-slate-500">对接匹配 · 主理人 / 合作方</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">
              💡 选择感兴趣的项目方向，提交后我们将为您匹配 AI 启动清单 / 项目合作方 / 当地 OPC 主理人
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectItems.map((proj) => (
                <ProjectCard
                  key={proj.id}
                  project={proj}
                  onAction={(intent) => setProjectInquiry({ project: proj, intent })}
                />
              ))}
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
                onClick={() => setInquiryOpen(true)}
                className="flex-shrink-0 px-4 py-2.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all"
              >
                立即提交需求 →
              </button>
            </div>
          </div>
        )}

        {/* ════════ 开发者招商横幅（保留） ════════ */}
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
      </main>

      {/* ════════ 需求收集弹窗（受控） ════════ */}
      {inquiryOpen && (
        <ServiceInquiryModal
          services={selectedServiceItems}
          onClose={() => setInquiryOpen(false)}
          onSuccess={() => {
            setSelectedServices([])
            setInquiryOpen(false)
          }}
        />
      )}

      {/* ════════ 项目对接匹配弹窗（受控） ════════ */}
      {projectInquiry && (
        <ProjectInquiryModal
          project={projectInquiry.project}
          intent={projectInquiry.intent}
          onClose={() => setProjectInquiry(null)}
          onSuccess={() => setProjectInquiry(null)}
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

      {/* ════════ 资源库 · 会员门锁提示弹窗（受控） ════════ */}
      {lockedResource && (
        <MemberLockedModal
          resource={lockedResource}
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

function ToolCategorySection({ category }: { category: ToolCategory }) {
  return (
    <section>
      {/* 子分类标题 */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-2xl">{category.emoji}</span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm md:text-base font-bold text-slate-900 flex items-center gap-1.5">
            {category.title}
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {category.platforms.length}
            </span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">{category.subtitle}</p>
        </div>
      </div>

      {/* 卡片网格：移动端 1 列 / 桌面端 2-3 列 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {category.platforms.map((p) => (
          <PlatformCard key={p.name} platform={p} />
        ))}
      </div>
    </section>
  )
}

// ════════════════════════════════════════════════════════════════
// 平台卡片：轻量化 CTA + 右侧箭头（Stripe / Linear 范式）
// ════════════════════════════════════════════════════════════════

function PlatformCard({ platform }: { platform: Platform }) {
  const action = platform.action || 'visit'
  const isInternal = platform.url.startsWith('/')
  const tagColor =
    platform.tag === '必装' ? 'bg-slate-100 text-slate-600' :
    platform.tag === '热门' ? 'bg-slate-100 text-slate-600' :
    platform.tag === '爆款' ? 'bg-slate-100 text-slate-600' :
    platform.tag === '推荐' ? 'bg-slate-100 text-slate-600' :
    platform.tag === '出海' ? 'bg-slate-100 text-slate-600' :
    'bg-slate-100 text-slate-500'

  const actionLabel =
    action === 'download' ? '立即下载' :
    action === 'enter' ? '立即进入' :
    '前往官网'

  const ActionIcon =
    action === 'download' ? Download :
    action === 'enter' ? ArrowRight :
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

  const baseClass =
    'group block bg-white rounded-2xl shadow-sm hover:shadow-md p-4 border border-slate-100 hover:border-slate-200 transition-all'

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
}: {
  service: ServiceItem
  selected: boolean
  onToggle: () => void
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
        selected
          ? 'border-blue-500 ring-2 ring-blue-100 shadow-blue-100'
          : 'border-transparent hover:border-blue-200'
      )}
    >
      {/* 选中对勾 */}
      {selected && (
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
// ════════════════════════════════════════════════════════════════

function ProjectCard({
  project,
  onAction,
}: {
  project: ProjectItem
  onAction: (intent: 'executor' | 'partner') => void
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-2 border border-slate-100 hover:border-slate-200">
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
        {/* 主按钮：保留渐变色，引导主操作 */}
        <button
          type="button"
          onClick={() => onAction('executor')}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all min-h-[40px]"
        >
          <Bot size={14} />
          <span>我想做这个项目</span>
        </button>
        {/* 次按钮：轻量化 outline 风格 */}
        <button
          type="button"
          onClick={() => onAction('partner')}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border border-slate-200 bg-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-300 text-xs font-bold rounded-xl transition-colors min-h-[40px]"
        >
          <Handshake size={14} />
          <span>寻找合作方</span>
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
  onPartner,
  onLocked,
}: {
  resource: ResourceItem
  membershipTier: MembershipTier
  onPartner: (r: ResourceItem) => void
  onLocked: (r: ResourceItem) => void
}) {
  const isUnlocked = resource.type === 'unlock' && canUnlockResource(membershipTier)

  /** 渲染底部按钮（按 type 分支，统一轻量化风格） */
  const renderAction = () => {
    const baseBtn =
      'mt-auto w-full flex items-center justify-between border bg-transparent text-slate-600 group-hover:bg-slate-50 transition-colors px-4 py-2 rounded-lg min-h-[40px]'

    switch (resource.type) {
      case 'download':
        return (
          <a
            href={resource.href || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(baseBtn, 'border-slate-200 group-hover:border-slate-300')}
          >
            <span className="flex items-center gap-1.5 text-xs font-semibold">
              <Download size={12} className="text-slate-500" />
              <span>前往下载</span>
            </span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-all" />
          </a>
        )
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
        return isUnlocked ? (
          <Link
            href="/market"
            className={cn(baseBtn, 'border-slate-200 group-hover:border-slate-300')}
          >
            <span className="flex items-center gap-1.5 text-xs font-semibold">
              <Crown size={12} className="text-slate-500" />
              <span>已解锁 · 立即观看</span>
            </span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-all" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => onLocked(resource)}
            className={cn(baseBtn, 'border-amber-200 group-hover:bg-amber-50 group-hover:border-amber-300')}
          >
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
              <Lock size={12} className="text-amber-500" />
              <span>会员专享解锁</span>
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
        {resource.tag && (
          <span
            className={cn(
              'flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500'
            )}
          >
            {resource.tag}
          </span>
        )}
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
// 需求收集弹窗（含 AI/专家分流反馈 + 主理人推荐）
// ════════════════════════════════════════════════════════════════

function ServiceInquiryModal({
  services,
  onClose,
  onSuccess,
}: {
  services: ServiceItem[]
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
          form,
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
              href="/member"
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
