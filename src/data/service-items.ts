/**
 * 服务库 · 8 个服务板块 Mock 数据
 *
 * 引用方：
 *   - src/app/market/page.tsx （前端渲染）
 *   - src/app/api/services/inquiry/route.ts （后端分流）
 *
 * type 字段决定提交时分流通道：
 *   - 'ai'      → Dify AI 对话（mock）
 *   - 'expert'  → 转人工专家（Supabase mock）
 */

export interface ServiceItem {
  id: string
  title: string
  desc: string
  type: 'ai' | 'expert'
  icon: string
  tag?: string
  tagColor?: string
}

export const serviceItems: ServiceItem[] = [
  {
    id: 'opc-training',
    title: 'OPC内训',
    desc: '针对主理人及团队的 AI 商业应用系统培训，提升全员效率。',
    type: 'expert',
    icon: '🎓',
    tag: '热门',
    tagColor: 'bg-orange-50 text-orange-600',
  },
  {
    id: 'opc-coaching',
    title: 'OPC陪跑',
    desc: '从诊断到落地，手把手陪跑带你跑通首个商业闭环。',
    type: 'ai',
    icon: '🏃',
    tag: '推荐',
    tagColor: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'opc-community',
    title: 'OPC社群',
    desc: '100+ 同频创业者交流圈，每日实操案例与资源互换。',
    type: 'ai',
    icon: '👥',
  },
  {
    id: 'enterprise-geo',
    title: '企业GEO',
    desc: 'AI 助力企业本地化搜索增长，精准获客，提升区域影响力。',
    type: 'expert',
    icon: '📍',
    tag: '高客单',
    tagColor: 'bg-violet-50 text-violet-600',
  },
  {
    id: 'shop-daiyun',
    title: 'AI网店代运营',
    desc: 'AI 驱动自动化上下架、客服与数据优化，释放你的双手。',
    type: 'ai',
    icon: '🛒',
  },
  {
    id: 'media-daiyun',
    title: 'AI自媒体代运营',
    desc: '内容 AI 批量生成，多平台矩阵分发，低成本快速起号。',
    type: 'ai',
    icon: '🎬',
    tag: '热门',
    tagColor: 'bg-rose-50 text-rose-600',
  },
  {
    id: 'enterprise-transform',
    title: '企业AI转型',
    desc: '定制化企业 AI 改造方案，从内部流程到外部获客全面升级。',
    type: 'expert',
    icon: '🏢',
    tag: '高客单',
    tagColor: 'bg-violet-50 text-violet-600',
  },
  {
    id: 'system-custom',
    title: '企业系统定制',
    desc: '为企业搭建专属 AI 系统、工作流及智能体应用。',
    type: 'expert',
    icon: '⚙️',
  },
]
