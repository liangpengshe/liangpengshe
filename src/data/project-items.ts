/**
 * 项目库 · 8 个项目方向 Mock 数据
 *
 * 引用方：
 *   - src/app/page.tsx （首页项目库 Tab）
 *   - src/app/market/projects/page.tsx （项目库独立页）
 *   - src/app/market/projects/[slug]/page.tsx （项目详情页 · 任务 4）
 *   - src/app/api/projects/inquiry/route.ts （意向对接分流）
 *   - src/app/api/projects/find-opc/route.ts （资深 OPC 匹配 · 任务 3）
 *
 * 字段说明：
 *   - id / slug           : 唯一标识（slug 用于详情页 URL）
 *   - categoryEmoji+cat   : 顶部分类
 *   - tagColor            : 标签颜色
 *   - level               : 适配的 OPC 等级（trader/flow/system/asset/general）
 *   - recommend           : true → 在 /market/projects?recommend=xxx 下高亮
 *   - highlights          : 核心卖点（详情页 + 卡片展示用）
 *   - sop                 : 标准 SOP 步骤（详情页展示用）
 *   - roleSupport         : 支持的意向角色（决定后端分流通道）
 */

export type ProjectLevel = 'trader' | 'flow' | 'system' | 'asset' | 'general'

export interface ProjectItem {
  id: string
  /** URL 友好的短标识，用于详情页路由 /market/projects/[slug] */
  slug: string
  title: string
  categoryEmoji: string
  category: string
  tagColor: string
  desc: string
  /** OPC 等级匹配：用于 /market/projects?recommend=xxx 高亮展示 */
  level: ProjectLevel
  /** 是否为推荐项目（recommend 模式下高亮） */
  recommend?: boolean
  /** 核心卖点（3-4 条） */
  highlights: string[]
  /** 适配人群 */
  forWho: string
  /** 标准 SOP 步骤（详情页用） */
  sop: { title: string; desc: string }[]
  /** 支持哪些角色（用于按钮显示 / 角色筛选） */
  roleSupport: Array<'executor' | 'partner' | 'manager'>
  /** AI 启动清单关键词（执行者角色提交后生成清单用） */
  startChecklist: string[]
}

export const projectItems: ProjectItem[] = [
  {
    id: 'digital-shop',
    slug: 'ai-digital-shop',
    title: 'AI数字网店项目',
    categoryEmoji: '💻',
    category: '数字产品',
    tagColor: 'bg-blue-50 text-blue-600',
    desc: '利用 AI 生成商品图、标题和详情，实现 0 经验快速起店，知识变现。',
    level: 'trader',
    recommend: true,
    highlights: [
      '0 库存 0 物流，所有商品均为数字交付',
      'AI 一键生成商品图/标题/详情文案',
      '知识变现路径短，第一周即可跑通首单',
    ],
    forWho: '有一技之长（设计/写作/编程/咨询）但不知道如何变现的创作者',
    sop: [
      { title: '第 1 周 · 选品定位', desc: '锁定 1 个细分品类（如 PPT 模板 / 头像定制 / 简历优化）' },
      { title: '第 2 周 · 素材准备', desc: 'AI 批量生成 10-20 款商品上架素材' },
      { title: '第 3 周 · 店铺搭建', desc: '接入支付 / 自动发货 / 客服机器人' },
      { title: '第 4 周 · 投流放大', desc: '小红书 / 抖音内容矩阵冷启动' },
    ],
    roleSupport: ['executor', 'partner'],
    startChecklist: ['明确定位一个细分品类', '准备首批 10 款商品素材', '接入支付与发货链路'],
  },
  {
    id: 'no-stock-physical',
    slug: 'ai-no-stock-physical-shop',
    title: 'AI无货源实物网店项目',
    categoryEmoji: '📦',
    category: '实物电商',
    tagColor: 'bg-emerald-50 text-emerald-600',
    desc: 'AI 辅助对接 1688/源头工厂，自动选品、铺货，无需囤货。',
    level: 'trader',
    recommend: true,
    highlights: [
      '一件代发，0 库存压力',
      'AI 智能选品 + 多平台铺货',
      '源头工厂直供，毛利空间大',
    ],
    forWho: '想试水电商但怕压货的轻资产创业者',
    sop: [
      { title: '第 1 周 · 选品调研', desc: 'AI 抓取 1688 爆款数据，筛 3-5 个稳定货源' },
      { title: '第 2 周 · 多店铺货', desc: 'AI 一键生成详情页 + 多平台一键上架' },
      { title: '第 3 周 · 投流测试', desc: '小额投放测试 7 天 ROI，筛出爆品' },
      { title: '第 4 周 · 放大复制', desc: '主推爆品 + 多账号矩阵铺货' },
    ],
    roleSupport: ['executor', 'partner'],
    startChecklist: ['筛选 3-5 个稳定货源', '搭建 ERP 订单同步', '测试 7 天投放 ROI'],
  },
  {
    id: 'stock-physical',
    slug: 'ai-branded-physical-shop',
    title: 'AI有货源实物网店项目',
    categoryEmoji: '🏭',
    category: '品牌实物',
    tagColor: 'bg-amber-50 text-amber-600',
    desc: '自有品牌或产品，用 AI 做内容矩阵、批量引流、打造爆款。',
    level: 'trader',
    highlights: [
      '品牌溢价高，复购稳定',
      'AI 内容矩阵 + 私域沉淀',
      '可逐步建立独立站 / 私域品牌',
    ],
    forWho: '已有供应链或工厂资源，想做品牌溢价的创业者',
    sop: [
      { title: '第 1 周 · 卖点梳理', desc: '用 AI 提炼产品核心差异化卖点' },
      { title: '第 2 周 · 内容矩阵', desc: '小红书/抖音/视频号三平台账号同步搭建' },
      { title: '第 3 周 · 私域沉淀', desc: '企微 + 社群 SOP 跑通' },
      { title: '第 4 周 · 投流放大', desc: '千川 / 巨量投放放大爆款' },
    ],
    roleSupport: ['executor', 'partner', 'manager'],
    startChecklist: ['梳理产品核心卖点', '搭建小红书/抖音矩阵', '配置私域沉淀路径'],
  },
  {
    id: 'cross-border',
    slug: 'ai-cross-border',
    title: 'AI跨境电商项目',
    categoryEmoji: '🌍',
    category: '全球电商',
    tagColor: 'bg-violet-50 text-violet-600',
    desc: 'TikTok/亚马逊 AI 多语言内容生成、智能选品、低成本出海。',
    level: 'flow',
    highlights: [
      'AI 多语言内容生成，0 外语门槛',
      'TikTok Shop / Amazon 多平台打通',
      '欧美 / 东南亚市场任选',
    ],
    forWho: '希望撬动海外流量红利的跨境创业者',
    sop: [
      { title: '第 1 周 · 选市场', desc: '美国 / 欧洲 / 东南亚 三选一' },
      { title: '第 2 周 · 多语言素材', desc: 'AI 生成英语 / 西班牙语 / 印尼语商品页' },
      { title: '第 3 周 · 平台开店', desc: 'TikTok Shop / Amazon / Shopify 三选一' },
      { title: '第 4 周 · 冷启动', desc: '短视频矩阵 + 联盟营销' },
    ],
    roleSupport: ['executor', 'partner'],
    startChecklist: ['选择目标市场（美/欧/东南亚）', '准备多语言商品页', '配置跨境支付通道'],
  },
  {
    id: 'self-media',
    slug: 'ai-self-media',
    title: 'AI自媒体运营项目',
    categoryEmoji: '🎬',
    category: '内容赛道',
    tagColor: 'bg-rose-50 text-rose-600',
    desc: 'AI 智能生成图文/短视频，多平台矩阵分发，快速起号变现。',
    level: 'flow',
    highlights: [
      'AI 一键生成图文 / 短视频脚本',
      '多平台矩阵分发，放大流量',
      '流量主 + 商单 + 知识付费多元变现',
    ],
    forWho: '有表达欲但不想真人出镜的内容创作者',
    sop: [
      { title: '第 1 周 · 选垂类', desc: '锁定 1 个内容垂类 + 人设' },
      { title: '第 2 周 · 选题规划', desc: 'AI 生成 30 天选题库' },
      { title: '第 3 周 · 内容生产', desc: 'AI 批量生成图文/口播视频' },
      { title: '第 4 周 · 矩阵分发', desc: '3 平台同步 + 流量主 + 商单接入' },
    ],
    roleSupport: ['executor', 'partner', 'manager'],
    startChecklist: ['锁定 1 个内容垂类', '规划 30 天选题', '接入流量主 + 商单通道'],
  },
  {
    id: 'system-dev',
    slug: 'ai-system-dev',
    title: 'AI编程系统开发项目',
    categoryEmoji: '🔧',
    category: '技术研发',
    tagColor: 'bg-slate-100 text-slate-700',
    desc: 'AI 辅助编程，快速打造 SaaS 工具、专属系统或定制应用。',
    level: 'system',
    highlights: [
      'AI 辅助编程，开发效率 ×3',
      'SaaS 订阅 / 定制项目 / 模板售卖三路变现',
      '高毛利、可复制',
    ],
    forWho: '有技术背景或愿意学习 AI 编程的工程师',
    sop: [
      { title: '第 1 周 · MVP 边界', desc: '定义最小可行产品功能' },
      { title: '第 2 周 · 技术选型', desc: 'Next.js + Supabase + Stripe 黄金栈' },
      { title: '第 3 周 · MVP 开发', desc: 'AI 辅助 7 天内出 MVP' },
      { title: '第 4 周 · 上线推广', desc: 'Product Hunt + Twitter(X) 海外冷启动' },
    ],
    roleSupport: ['executor', 'partner'],
    startChecklist: ['定义 MVP 功能边界', '选择技术栈（Next/Supabase）', '设计付费转化漏斗'],
  },
  {
    id: 'tool-sales',
    slug: 'ai-tool-sales',
    title: 'AI工具销售推广项目',
    categoryEmoji: '🚀',
    category: '渠道销售',
    tagColor: 'bg-orange-50 text-orange-600',
    desc: '代理分销 AI 工具及 SaaS 产品，利用裂变与私域精准获客。',
    level: 'flow',
    highlights: [
      '代理分成模式，0 自研成本',
      '裂变 + 私域放大销售',
      '签约 1-2 个工具即可起盘',
    ],
    forWho: '有私域 / 社群资源的销售型创业者',
    sop: [
      { title: '第 1 周 · 选品签约', desc: '签约 1-2 个优质 AI 工具代理' },
      { title: '第 2 周 · 分销体系', desc: '搭建分销分成 + 邀请码体系' },
      { title: '第 3 周 · 私域冷启动', desc: '冷启动 100 人私域种子用户' },
      { title: '第 4 周 · 裂变放大', desc: '邀请奖励 + 拼团 + 直播转化' },
    ],
    roleSupport: ['executor', 'partner', 'manager'],
    startChecklist: ['签约 1-2 个优质工具', '搭建分销分成体系', '冷启动私域 100 人'],
  },
  {
    id: 'geo-project',
    slug: 'ai-geo-enterprise',
    title: 'AI企业GEO项目',
    categoryEmoji: '🏢',
    category: '企业服务',
    tagColor: 'bg-cyan-50 text-cyan-600',
    desc: '利用 AI 结合地理位置和本地化内容，帮助企业精准获取同城客户。',
    level: 'system',
    highlights: [
      '本地化 + AI 内容双轮驱动',
      '服务本地企业，高客单价',
      '可规模化复制到全国',
    ],
    forWho: '有本地企业资源 / 销售能力的城市合伙人',
    sop: [
      { title: '第 1 周 · 选行业', desc: '餐饮 / 教培 / 医美 / 家居 任选 1 个垂直' },
      { title: '第 2 周 · GEO 模板', desc: 'AI 批量生成 50+ 城市落地页' },
      { title: '第 3 周 · 客户 BD', desc: '陌拜 / 转介绍 / 商会活动获取前 5 个客户' },
      { title: '第 4 周 · 交付优化', desc: '服务交付 + 案例包装 + 转介绍闭环' },
    ],
    roleSupport: ['partner', 'manager'],
    startChecklist: ['选择 1 个城市行业切入', '准备 GEO 落地页模板', '对接本地企业 BD'],
  },
  // ─────── 9. 资产型 · AI 数字产品（数字资产 + 全球分发） ───────
  {
    id: 'p9',
    slug: 'ai-digital-product',
    title: 'AI数字产品项目',
    categoryEmoji: '💎',
    category: '数字资产 / 全球分发',
    tagColor: 'bg-violet-100 text-violet-700',
    desc: '把 AI 工作流 / 提示词 / 模板 / 数字素材封装为可订阅、可分发的全球数字资产，在 Gumroad / Coze 商店 / 先锋派 持续变现。',
    level: 'asset',
    recommend: false,
    highlights: [
      '🎯 选品逻辑：判断哪些数字资产有复利价值（提示词包 / 模板库 / 数字素材）',
      '🌍 全球分发：一套资产多平台售卖（Gumroad / Coze 商店 / 先锋派 / 自建 SaaS）',
      '💰 边际成本趋近 0：售出第 100 份 ≠ 制作第 100 份',
      '🔁 订阅 + 续费 + 转介绍 三重复利',
    ],
    forWho: '适合：具备专业能力（设计 / 编程 / 写作 / AI 工具），想把单次服务沉淀为可复用数字资产的进阶主理人',
    sop: [
      { title: '第 1 周 · 资产盘点', desc: '梳理你已有的素材 / 模板 / 工作流，筛 3-5 个可售卖的高价值资产' },
      { title: '第 2 周 · 选品定价', desc: '调研 Gumroad / Coze 商店同类型定价 + 自身 ROI，输出 3 档定价表' },
      { title: '第 3 周 · 上架分发', desc: '打包 + 上架 Gumroad / Coze / 先锋派，配置自动交付' },
      { title: '第 4 周 · 引流放大', desc: '用 X(Twitter) / YouTube / 小红书 短视频导流，跑通首月 100 单' },
    ],
    roleSupport: ['executor', 'manager'],
    startChecklist: ['盘点已有数字资产', '调研 Gumroad 同类竞品定价', '准备 1 套可售卖的样板资产'],
  },
]

/** 根据 slug 查找项目（详情页使用） */
export function getProjectBySlug(slug: string): ProjectItem | undefined {
  return projectItems.find((p) => p.slug === slug)
}

/** 根据 id 查找项目（API 兼容） */
export function getProjectById(id: string): ProjectItem | undefined {
  return projectItems.find((p) => p.id === id)
}
