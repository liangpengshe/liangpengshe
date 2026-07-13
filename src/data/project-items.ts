/**
 * 项目库 · 8 个项目方向 Mock 数据
 *
 * 引用方：
 *   - src/app/market/page.tsx （前端渲染）
 *   - src/app/api/projects/inquiry/route.ts （后端分流）
 *
 * 字段说明：
 *   - categoryEmoji + category  : 顶部分类标签
 *   - tagColor                  : 标签颜色 tailwind class
 *   - roleSupport               : 支持的意向角色（决定后端分流通道）
 */

export interface ProjectItem {
  id: string
  title: string
  categoryEmoji: string
  category: string
  tagColor: string
  desc: string
  /** 支持哪些角色（用于按钮显示 / 角色筛选） */
  roleSupport: Array<'executor' | 'partner' | 'manager'>
  /** AI 启动清单关键词（执行者角色提交后生成清单用） */
  startChecklist: string[]
}

export const projectItems: ProjectItem[] = [
  {
    id: 'digital-shop',
    title: 'AI数字网店项目',
    categoryEmoji: '💻',
    category: '数字产品',
    tagColor: 'bg-blue-50 text-blue-600',
    desc: '利用 AI 生成商品图、标题和详情，实现 0 经验快速起店，知识变现。',
    roleSupport: ['executor', 'partner'],
    startChecklist: ['明确定位一个细分品类', '准备首批 10 款商品素材', '接入支付与发货链路'],
  },
  {
    id: 'no-stock-physical',
    title: 'AI无货源实物网店项目',
    categoryEmoji: '📦',
    category: '实物电商',
    tagColor: 'bg-emerald-50 text-emerald-600',
    desc: 'AI 辅助对接 1688/源头工厂，自动选品、铺货，无需囤货。',
    roleSupport: ['executor', 'partner'],
    startChecklist: ['筛选 3-5 个稳定货源', '搭建 ERP 订单同步', '测试 7 天投放 ROI'],
  },
  {
    id: 'stock-physical',
    title: 'AI有货源实物网店项目',
    categoryEmoji: '🏭',
    category: '品牌实物',
    tagColor: 'bg-amber-50 text-amber-600',
    desc: '自有品牌或产品，用 AI 做内容矩阵、批量引流、打造爆款。',
    roleSupport: ['executor', 'partner', 'manager'],
    startChecklist: ['梳理产品核心卖点', '搭建小红书/抖音矩阵', '配置私域沉淀路径'],
  },
  {
    id: 'cross-border',
    title: 'AI跨境电商项目',
    categoryEmoji: '🌍',
    category: '全球电商',
    tagColor: 'bg-violet-50 text-violet-600',
    desc: 'TikTok/亚马逊 AI 多语言内容生成、智能选品、低成本出海。',
    roleSupport: ['executor', 'partner'],
    startChecklist: ['选择目标市场（美/欧/东南亚）', '准备多语言商品页', '配置跨境支付通道'],
  },
  {
    id: 'self-media',
    title: 'AI自媒体运营项目',
    categoryEmoji: '🎬',
    category: '内容赛道',
    tagColor: 'bg-rose-50 text-rose-600',
    desc: 'AI 智能生成图文/短视频，多平台矩阵分发，快速起号变现。',
    roleSupport: ['executor', 'partner', 'manager'],
    startChecklist: ['锁定 1 个内容垂类', '规划 30 天选题', '接入流量主 + 商单通道'],
  },
  {
    id: 'system-dev',
    title: 'AI编程系统开发项目',
    categoryEmoji: '🔧',
    category: '技术研发',
    tagColor: 'bg-slate-100 text-slate-700',
    desc: 'AI 辅助编程，快速打造 SaaS 工具、专属系统或定制应用。',
    roleSupport: ['executor', 'partner'],
    startChecklist: ['定义 MVP 功能边界', '选择技术栈（Next/Supabase）', '设计付费转化漏斗'],
  },
  {
    id: 'tool-sales',
    title: 'AI工具销售推广项目',
    categoryEmoji: '🚀',
    category: '渠道销售',
    tagColor: 'bg-orange-50 text-orange-600',
    desc: '代理分销 AI 工具及 SaaS 产品，利用裂变与私域精准获客。',
    roleSupport: ['executor', 'partner', 'manager'],
    startChecklist: ['签约 1-2 个优质工具', '搭建分销分成体系', '冷启动私域 100 人'],
  },
  {
    id: 'geo-project',
    title: 'AI企业GEO项目',
    categoryEmoji: '🏢',
    category: '企业服务',
    tagColor: 'bg-cyan-50 text-cyan-600',
    desc: '利用 AI 结合地理位置和本地化内容，帮助企业精准获取同城客户。',
    roleSupport: ['partner', 'manager'],
    startChecklist: ['选择 1 个城市行业切入', '准备 GEO 落地页模板', '对接本地企业 BD'],
  },
]
