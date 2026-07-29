/**
 * 城市站配置 · 集中管理所有「分站首页」文案
 *
 * 演进说明：
 *   - 进化一：消除 /dongguan /liuzhou /wuhai 三个 481 行重复文件
 *   - 进化二：新增城市只需在 CITIES 数组加一项，无需复制粘贴整页
 *   - 进化三：SEO 友好 · 动态路由 /city/[slug] + 静态文案
 *   - 进化四：自动 301 redirect 旧路径（next.config.js）
 *   - 进化五：404 fallback · generateStaticParams + notFound()
 *
 * 字段说明：
 *   - slug:      URL 路径段（/city/{slug}）
 *   - name:      中文城市名（用于文案渲染）
 *   - emoji:     城市特色 emoji（一人公司·XX 标签）
 *   - tagline:   Hero 区主标题下方副标题
 *   - mainMaintainer: 浮动标签 - 主理人名（如"陈主理人"）
 *   - cityImage: 主理人图片路径（/images/{city}.png）
 *   - partnersDescription: 顶部蓝色大横幅的描述
 *   - activeUsers: 数据条「社区今日活跃」数字
 *   - staticActivities: 静态活动数据（不依赖 API）
 *   - joinCTA: CTA 区的「加入 XX 站 · 良朋社OPC」标题
 *   - contactLabel: CTA 区的「联系 XX 主理人」按钮文案
 *   - bgGradient: 数据条背景色（不同城市用不同色）
 */

export interface CityActivity {
  id: string
  city: string
  user: string
  action: string
  createdAt: string
}

export interface CityConfig {
  slug: string
  name: string
  emoji: string
  tagline: string
  /** 一人公司标签（Hero 浮动标签） */
  onePersonTag: string
  cityImage: string
  partnersDescription: string
  activeUsers: number
  staticActivities: CityActivity[]
  joinCTA: string
  contactLabel: string
  /** 城市主色调（用于数据条背景） */
  bgGradient: string
}

const dongguan: CityConfig = {
  slug: 'dongguan',
  name: '东莞',
  emoji: '🏙️',
  tagline:
    '东莞站 · 汇聚全国 AI 从业者与企业家，共同探索人工智能在企业中的实际应用与商业价值',
  onePersonTag: '🏙️ 东莞 · 一人公司',
  cityImage: '/images/dongguan.png',
  partnersDescription: '全国 7 座城市已联动（含东莞），招募更多城市合伙人共拓 AI 市场',
  activeUsers: 156,
  staticActivities: [
    { id: 'd1', city: '东莞', user: '陈主理人', action: '发布了新工具测评', createdAt: '2小时前' },
    { id: 'd2', city: '东莞', user: '林同学', action: '加入了 OPC 智富社群', createdAt: '4小时前' },
    { id: 'd3', city: '东莞', user: '黄老板', action: '完成了 AI 选品陪跑', createdAt: '1天前' },
  ],
  joinCTA: '加入东莞站 · 良朋社OPC',
  contactLabel: '联系东莞主理人',
  bgGradient: 'from-amber-800/60 via-orange-800/60 to-rose-900/60',
}

const liuzhou: CityConfig = {
  slug: 'liuzhou',
  name: '柳州',
  emoji: '🌁',
  tagline:
    '柳州站 · 汇聚全国 AI 从业者与企业家，共同探索人工智能在企业中的实际应用与商业价值',
  onePersonTag: '🌁 柳州 · 一人公司',
  cityImage: '/images/liuzhou.png',
  partnersDescription: '全国 7 座城市已联动（含柳州），招募更多城市合伙人共拓 AI 市场',
  activeUsers: 92,
  staticActivities: [
    { id: 'l1', city: '柳州', user: '王主理人', action: '发布了新工具测评', createdAt: '2小时前' },
    { id: 'l2', city: '柳州', user: '李同学', action: '加入了 OPC 智富社群', createdAt: '4小时前' },
    { id: 'l3', city: '柳州', user: '张老板', action: '完成了 AI 选品陪跑', createdAt: '1天前' },
  ],
  joinCTA: '加入柳州站 · 良朋社OPC',
  contactLabel: '联系柳州主理人',
  bgGradient: 'from-emerald-800/60 via-teal-800/60 to-cyan-900/60',
}

const wuhai: CityConfig = {
  slug: 'wuhai',
  name: '乌海',
  emoji: '🏔️',
  tagline:
    '乌海站 · 汇聚全国 AI 从业者与企业家，共同探索人工智能在企业中的实际应用与商业价值',
  onePersonTag: '🏔️ 乌海 · 一人公司',
  cityImage: '/images/wuhai.png',
  partnersDescription: '全国 7 座城市已联动（含乌海），招募更多城市合伙人共拓 AI 市场',
  activeUsers: 128,
  staticActivities: [
    { id: 'w1', city: '乌海', user: '王主理人', action: '发布了新工具测评', createdAt: '2小时前' },
    { id: 'w2', city: '乌海', user: '李同学', action: '加入了 OPC 智富社群', createdAt: '4小时前' },
    { id: 'w3', city: '乌海', user: '张老板', action: '完成了 AI 选品陪跑', createdAt: '1天前' },
  ],
  joinCTA: '加入乌海站 · 良朋社OPC',
  contactLabel: '联系乌海主理人',
  bgGradient: 'from-slate-800/60 to-slate-900/60',
}

export const CITIES: CityConfig[] = [dongguan, liuzhou, wuhai]

/** slug → config 索引 */
export const CITY_MAP: Record<string, CityConfig> = CITIES.reduce(
  (acc, c) => {
    acc[c.slug] = c
    return acc
  },
  {} as Record<string, CityConfig>
)

/** 查找城市（找不到返回 null） */
export function getCityBySlug(slug: string): CityConfig | null {
  return CITY_MAP[slug] || null
}

/** 列出所有合法 slug（用于 generateStaticParams） */
export function getAllCitySlugs(): string[] {
  return CITIES.map((c) => c.slug)
}
