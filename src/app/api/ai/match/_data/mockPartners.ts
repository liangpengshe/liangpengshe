/**
 * mockPartners 静态数据（ai/match 兜底）
 * ------------------------------------------------------------
 * 任务：withFallback 迁移 ai/match（W3.1）
 * 原位置：src/app/api/ai/match/route.ts 中 mockPartners 数组。
 * 抽离原因：路由文件只保留编排，静态数据 / 工具放 _data / _lib。
 *
 * 去身份化处理：人名改为"AI 创业者 / 操盘手 / 服务商"等角色型标签。
 * 避免编造"张总 / 李总"等假名（与首页动态滚动条口径保持一致）。
 * ------------------------------------------------------------
 */
export interface MockPartner {
  id: string
  name: string
  city: string
  description: string
  tags: string[]
  status: string
  matchScore: number
}

export const MOCK_PARTNERS: readonly MockPartner[] = [
  {
    id: 'mock-1',
    name: 'AI 跨境操盘手',
    city: '杭州',
    description:
      '跨境电商运营专家，5 年 Shopify 独立站操盘经验，专注 AI 选品与自动化广告投放',
    tags: ['杭州', '电商', '供应链', 'AI 选品', '独立站'],
    status: 'APPROVED',
    matchScore: 92,
  },
  {
    id: 'mock-2',
    name: 'AI 自媒体矩阵操盘手',
    city: '深圳',
    description:
      'AI 自媒体矩阵操盘手，擅长抖音 + 小红书双平台内容分发与冷启动',
    tags: ['深圳', '自媒体', '内容创作', '抖音', '小红书'],
    status: 'APPROVED',
    matchScore: 87,
  },
  {
    id: 'mock-3',
    name: '本地生活服务商',
    city: '广州',
    description:
      '本地生活服务商，主攻美团 + 抖音同城号，擅长 AI 数字人直播',
    tags: ['广州', '本地生活', '直播', '数字人', '短视频'],
    status: 'APPROVED',
    matchScore: 85,
  },
  {
    id: 'mock-4',
    name: 'AI 工具代理服务商',
    city: '成都',
    description:
      'AI 工具代理与技术服务商，为本地中小企业提供 AI 培训 + 落地咨询',
    tags: ['成都', 'AI 工具', '培训', '咨询', '中小企业'],
    status: 'APPROVED',
    matchScore: 80,
  },
  {
    id: 'mock-5',
    name: 'AI 跨境营销顾问',
    city: '杭州',
    description: '传统外贸转型顾问，AI 跨境营销与多语言内容生成专家',
    tags: ['杭州', '外贸', '跨境', 'AI 营销', '多语言'],
    status: 'APPROVED',
    matchScore: 78,
  },
] as const
