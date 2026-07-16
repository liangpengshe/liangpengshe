/**
 * 资源库 · 6 大资源板块 Mock 数据
 *
 * 引用方：
 *   - src/app/market/page.tsx （前端渲染）
 *   - src/app/api/resources/partner-inquiry/route.ts （主理人加盟对接）
 *
 * type 字段决定卡片底部按钮 + 交互逻辑：
 *   - 'download'  → 资源下载（外链）
 *   - 'external'  → 外部链接（产品/硬件详情）
 *   - 'internal'  → 内部路由（跳工具库试用）
 *   - 'unlock'    → 会员 / 学习进度解锁（见 unlockMode）
 *   - 'partner'   → 招商加盟（触发主理人对接弹窗）
 *
 * unlockMode（仅 type === 'unlock' 生效）：
 *   - 'practice-or-member' → 满足 (运营实操解锁 OR 199/1980 会员) 即可
 *   - 'member-only'        → 满足 (199/1980 会员) 即可
 *
 * externalHref（仅 type === 'unlock' 已解锁后生效）：
 *   - 已解锁时点击跳到外链（用于数字产品库下载等场景）
 *   - 不设置则走内部默认链接 /market
 *
 * 卡片顶部色条（borderTopColor）用于四库统一视觉对比
 */

/** 资源解锁模式（仅 unlock 类型） */
export type UnlockMode = 'practice-or-member' | 'member-only'

export type ResourceType = 'download' | 'external' | 'internal' | 'unlock' | 'partner'

export interface ResourceItem {
  id: string
  title: string
  desc: string
  type: ResourceType
  icon: string
  /** 顶部色条 Tailwind class（如 border-t-blue-500） */
  borderTopColor: string
  /** 卡片图标背景色（用于顶部小色块） */
  iconBgColor: string
  /** 跳转链接（适用于 download / external / internal） */
  href?: string
  /** 标签文案（如 热门 / 限免 / 会员专享） */
  tag?: string
  tagColor?: string
  /** 解锁模式（仅 type === 'unlock' 生效） */
  unlockMode?: UnlockMode
  /** 已解锁时跳转的外链（仅 type === 'unlock' 生效，覆盖 href） */
  externalHref?: string
}

export const resourceItems: ResourceItem[] = [
  {
    id: 'digital-prod',
    title: '数字产品库',
    desc: 'AI 提示词包、各类设计模板、PDF 教程、文档资源下载。',
    type: 'unlock',
    unlockMode: 'practice-or-member', // ★ 任务：需解锁运营实操 或 199/1980 会员
    externalHref: 'https://pan.quark.cn/', // 已解锁后点击直接跳转下载
    icon: '📁',
    borderTopColor: 'border-t-blue-500',
    iconBgColor: 'bg-blue-50',
    href: 'https://pan.quark.cn/',
    tag: '免费下载',
    tagColor: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'physical-prod',
    title: '实物产品库',
    desc: 'AI 智能硬件周边、优质实体货源对接、品牌样品。',
    type: 'external',
    icon: '📦',
    borderTopColor: 'border-t-emerald-500',
    iconBgColor: 'bg-emerald-50',
    href: 'https://www.1688.com',
    tag: '源头货源',
    tagColor: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'ai-software',
    title: 'AI 自研软件库',
    desc: '豹纹工坊（豹纹+）、灵犀 AI、先锋派数字人等独家自研工具集。',
    type: 'internal',
    icon: '🧰',
    borderTopColor: 'border-t-purple-500',
    iconBgColor: 'bg-purple-50',
    href: '/market/tools?tab=self_tools',
    tag: 'OPC 独家',
    tagColor: 'bg-purple-50 text-purple-600',
  },
  {
    id: 'ai-hardware',
    title: 'AI 智能硬件库',
    desc: 'AI 摄像头、数字人直播设备、智能麦克风等配套硬件。',
    type: 'external',
    icon: '💻',
    borderTopColor: 'border-t-amber-500',
    iconBgColor: 'bg-amber-50',
    href: 'https://detail.tmall.com',
    tag: '官方直采',
    tagColor: 'bg-amber-50 text-amber-600',
  },
  {
    id: 'ai-courses',
    title: 'AI 精品教程库',
    desc: '从入门到精通的视频课、实操 SOP 文档、系统化商业课程。',
    type: 'unlock',
    unlockMode: 'member-only', // ★ 任务：仅 199/1980 会员可看
    externalHref: '/market', // 已解锁后默认进入四库总览
    icon: '📚',
    borderTopColor: 'border-t-rose-500',
    iconBgColor: 'bg-rose-50',
    tag: '会员专享',
    tagColor: 'bg-rose-50 text-rose-600',
  },
  {
    id: 'franchise',
    title: 'AI 招商加盟库',
    desc: '城市主理人加盟、AI 硬件代理、AI 教育项目全国招商。',
    type: 'partner',
    icon: '🤝',
    borderTopColor: 'border-t-indigo-500',
    iconBgColor: 'bg-indigo-50',
    tag: '招募中',
    tagColor: 'bg-indigo-50 text-indigo-600',
  },
]
