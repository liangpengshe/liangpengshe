/**
 * collaboration-experts · 协作匹配 Mock 数据
 * ------------------------------------------------------------
 * 任务：withFallback 迁移 services/collaboration-match（W3.5）
 * 包含 2 个池：城市主理人（按城市分布）+ 资产型 OPC 专家。
 * ------------------------------------------------------------
 */
export interface CollaborationExpert {
  id: string
  name: string
  city: string
  phone: string
  wechatMasked: string
  type: 'CITY_MAINTAINER' | 'ASSET_OPC'
  expertise_tags: string[]
  bio: string
  handledProjectCount: number
  matchScore: number
  fallback?: boolean
}

export const CITY_MAINTAINER_POOL: readonly CollaborationExpert[] = [
  {
    id: 'm-sz-gong',
    name: '弓老师',
    city: '深圳',
    phone: '138-0011-8801',
    wechatMasked: 'opc_g***1',
    type: 'CITY_MAINTAINER',
    expertise_tags: ['AI数字网店', '数字产品', '无货源', '选品'],
    bio: '前阿里 P7，连续创业者，主攻数字产品变现，孵化 50+ 数字店铺。',
    handledProjectCount: 5,
    matchScore: 0,
  },
  {
    id: 'm-sz-chen',
    name: '陈主理人',
    city: '深圳',
    phone: '138-0011-8802',
    wechatMasked: 'opc_c***2',
    type: 'CITY_MAINTAINER',
    expertise_tags: ['实物电商', '无货源', '1688 选品', '淘宝'],
    bio: '深耕 1688 一件代发 3 年，实战操盘 30+ 实物店铺，首月出单率 95%。',
    handledProjectCount: 3,
    matchScore: 0,
  },
  {
    id: 'm-dg-li',
    name: '李主理人',
    city: '东莞',
    phone: '138-0011-8811',
    wechatMasked: 'opc_dg_li',
    type: 'CITY_MAINTAINER',
    expertise_tags: ['AI网店代运营', 'Shopee', 'Lazada', '跨境电商'],
    bio: '东莞制造业带 AI 网店代运营，Shopee 单月 GMV 破 30 万。',
    handledProjectCount: 4,
    matchScore: 0,
  },
  {
    id: 'm-dg-zhao',
    name: '赵主理人',
    city: '东莞',
    phone: '138-0011-8812',
    wechatMasked: 'opc_dg_zhao',
    type: 'CITY_MAINTAINER',
    expertise_tags: ['数字网店', '拼多多', '抖音小店'],
    bio: '本地抖音小店代运营，30 天从 0 到日出百单。',
    handledProjectCount: 2,
    matchScore: 0,
  },
  {
    id: 'm-lz-wang',
    name: '王老板',
    city: '柳州',
    phone: '138-0011-8821',
    wechatMasked: 'opc_lz_wang',
    type: 'CITY_MAINTAINER',
    expertise_tags: ['AI网店代运营', '螺蛳粉供应链', '天猫'],
    bio: '柳州本地供应链主理人，AI 数字网店 3 天完成 SKU 铺货。',
    handledProjectCount: 3,
    matchScore: 0,
  },
  {
    id: 'm-lz-luo',
    name: '罗主理人',
    city: '柳州',
    phone: '138-0011-8822',
    wechatMasked: 'opc_lz_luo',
    type: 'CITY_MAINTAINER',
    expertise_tags: ['OPC 陪跑', 'AI 落地', '流量运营'],
    bio: '前字节运营，擅长从诊断到陪跑一条龙。',
    handledProjectCount: 4,
    matchScore: 0,
  },
  {
    id: 'm-wh-li',
    name: '李主理人',
    city: '乌海',
    phone: '138-0011-8831',
    wechatMasked: 'opc_wh_li',
    type: 'CITY_MAINTAINER',
    expertise_tags: ['OPC 陪跑', '本地沙龙', 'AI 数字网店'],
    bio: '乌海本地 OPC 主理人，1 周招募 12 个种子用户。',
    handledProjectCount: 2,
    matchScore: 0,
  },
  {
    id: 'm-wh-gao',
    name: '高主理人',
    city: '乌海',
    phone: '138-0011-8832',
    wechatMasked: 'opc_wh_gao',
    type: 'CITY_MAINTAINER',
    expertise_tags: ['AI 落地', '代运营', '本地化'],
    bio: '本地企业 AI 转型陪跑，已服务 5 家区域企业。',
    handledProjectCount: 2,
    matchScore: 0,
  },
] as const

export const ASSET_EXPERT_POOL: readonly CollaborationExpert[] = [
  {
    id: 'a-lv',
    name: '吕老师',
    city: '深圳',
    phone: '138-0022-8801',
    wechatMasked: 'lv_opc_a***1',
    type: 'ASSET_OPC',
    expertise_tags: ['数字资产', 'AI 数字员工', 'SaaS 化'],
    bio: '资产型 OPC 专家，专注把工具沉淀为可订阅的数字员工产品。',
    handledProjectCount: 3,
    matchScore: 0,
  },
  {
    id: 'a-yu',
    name: '于老师',
    city: '深圳',
    phone: '138-0022-8802',
    wechatMasked: 'yu_opc_s***2',
    type: 'ASSET_OPC',
    expertise_tags: ['系统型 OPC', '工作流编排', 'Dify'],
    bio: '系统型 OPC 专家，搭建企业级 AI 客服与工作流系统。',
    handledProjectCount: 4,
    matchScore: 0,
  },
  {
    id: 'a-lin',
    name: '林薇老师',
    city: '深圳',
    phone: '138-0022-8803',
    wechatMasked: 'linwei_opc_***3',
    type: 'ASSET_OPC',
    expertise_tags: ['流量型 OPC', '自媒体矩阵', 'AI 增长'],
    bio: '流量型 OPC 专家，0 粉冷启动，30 天百万曝光。',
    handledProjectCount: 5,
    matchScore: 0,
  },
] as const
