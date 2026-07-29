/**
 * city-maintainers · 城市主理人 Mock 池
 * ------------------------------------------------------------
 * 任务：withFallback 迁移 projects/find-opc（W3.3）
 * 抽离原因：路由文件只保留编排，静态池放 _data。
 * ------------------------------------------------------------
 */
export interface CityMaintainer {
  id: string
  name: string
  city: string
  phone: string
  wechat: string
  /** 擅长领域标签（与 project.category 模糊匹配） */
  expertise_tags: string[]
  /** 已操盘同类项目数 */
  handledProjectCount: number
  /** 主理人简介 */
  bio: string
  /** 评分（用于排序） */
  score: number
}

export const CITY_MAINTAINERS: readonly CityMaintainer[] = [
  {
    id: 'opc-sz-001',
    name: '弓老师',
    city: '深圳',
    phone: '138-0011-8801',
    wechat: 'opc_gong_sz',
    expertise_tags: ['数字产品', 'AI数字网店', '实物电商', '无货源'],
    handledProjectCount: 5,
    bio: '前阿里 P7，连续创业者，主攻数字产品变现，孵化 50+ 数字店铺。',
    score: 98,
  },
  {
    id: 'opc-sz-002',
    name: '陈主理人',
    city: '深圳',
    phone: '138-0011-8802',
    wechat: 'opc_chen_sz',
    expertise_tags: ['实物电商', '无货源', '品牌实物', '1688 选品'],
    handledProjectCount: 3,
    bio: '深耕 1688 一件代发 3 年，实战操盘 30+ 实物店铺，首月出单率 95%。',
    score: 95,
  },
  {
    id: 'opc-sz-003',
    name: '林主理人',
    city: '深圳',
    phone: '138-0011-8803',
    wechat: 'opc_lin_sz',
    expertise_tags: ['技术研发', 'SaaS 工具', '系统开发'],
    handledProjectCount: 4,
    bio: '前腾讯高级工程师，独立开发 3 款 SaaS 工具 ARR 累计破 500 万。',
    score: 93,
  },
  {
    id: 'opc-bj-001',
    name: '王主理人',
    city: '北京',
    phone: '138-0011-8804',
    wechat: 'opc_wang_bj',
    expertise_tags: ['内容赛道', 'AI自媒体', '短视频', '抖音'],
    handledProjectCount: 6,
    bio: '抖音 / 视频号双平台万粉操盘手，擅长 0 粉冷启动。',
    score: 96,
  },
  {
    id: 'opc-bj-002',
    name: '周主理人',
    city: '北京',
    phone: '138-0011-8805',
    wechat: 'opc_zhou_bj',
    expertise_tags: ['企业服务', '企业 GEO', '本地化', 'BD'],
    handledProjectCount: 2,
    bio: '前 4A 广告策略总监，专注本地企业 GEO 项目交付。',
    score: 89,
  },
  {
    id: 'opc-sh-001',
    name: '李主理人',
    city: '上海',
    phone: '138-0011-8806',
    wechat: 'opc_li_sh',
    expertise_tags: ['全球电商', 'TikTok Shop', '亚马逊', '跨境电商'],
    handledProjectCount: 4,
    bio: '跨境电商老兵，TikTok Shop 美区单月 GMV 破 10 万美金。',
    score: 94,
  },
  {
    id: 'opc-gz-001',
    name: '黄主理人',
    city: '广州',
    phone: '138-0011-8807',
    wechat: 'opc_huang_gz',
    expertise_tags: ['实物电商', '无货源', '淘宝', '拼多多'],
    handledProjectCount: 3,
    bio: '广州 13 行女装供应链资源，擅长无货源女装起店。',
    score: 91,
  },
  {
    id: 'opc-hz-001',
    name: '张主理人',
    city: '杭州',
    phone: '138-0011-8808',
    wechat: 'opc_zhang_hz',
    expertise_tags: ['内容赛道', '小红书', '种草', '私域'],
    handledProjectCount: 5,
    bio: '小红书万粉 KOC 矩阵操盘手，单月最高 50 万 GMV。',
    score: 92,
  },
  {
    id: 'opc-cd-001',
    name: '何主理人',
    city: '成都',
    phone: '138-0011-8809',
    wechat: 'opc_he_cd',
    expertise_tags: ['渠道销售', '工具销售', 'SaaS 分销'],
    handledProjectCount: 3,
    bio: 'AI 工具代理分销冠军，单月最高签约 200+ 客户。',
    score: 90,
  },
] as const
