/**
 * city-managers · 城市主理人 Mock 数据
 * ------------------------------------------------------------
 * 任务：withFallback 迁移 resources/partner-inquiry（W3.4）
 * 覆盖 7 个核心城市，用于"招商加盟对接"主理人匹配。
 * ------------------------------------------------------------
 */
export interface CityManager {
  city: string
  name: string
  wechat: string
  phone: string
  /** 主理人专长方向 */
  specialty: string
}

export const CITY_MANAGERS: Record<string, CityManager[]> = {
  北京: [
    {
      city: '北京',
      name: '王主理人',
      wechat: 'wang_bj',
      phone: '138-0000-0001',
      specialty: '数字产品 / 企业 GEO',
    },
  ],
  上海: [
    {
      city: '上海',
      name: '李主理人',
      wechat: 'li_sh',
      phone: '138-0000-0002',
      specialty: '跨境电商 / 智能硬件',
    },
  ],
  深圳: [
    {
      city: '深圳',
      name: '陈主理人',
      wechat: 'chen_sz',
      phone: '138-0000-0003',
      specialty: '工具销售 / 系统开发',
    },
  ],
  广州: [
    {
      city: '广州',
      name: '黄主理人',
      wechat: 'huang_gz',
      phone: '138-0000-0004',
      specialty: '无货源网店 / 实物产品',
    },
  ],
  杭州: [
    {
      city: '杭州',
      name: '张主理人',
      wechat: 'zhang_hz',
      phone: '138-0000-0005',
      specialty: '自媒体 / 内容赛道',
    },
  ],
  成都: [
    {
      city: '成都',
      name: '刘主理人',
      wechat: 'liu_cd',
      phone: '138-0000-0006',
      specialty: '本地生活 / 企业 GEO',
    },
  ],
  武汉: [
    {
      city: '武汉',
      name: '赵主理人',
      wechat: 'zhao_wh',
      phone: '138-0000-0007',
      specialty: 'AI 培训 / 陪跑服务',
    },
  ],
}

/** 关键词 → 城市兜底映射（用于模糊匹配） */
export const KEYWORD_TO_CITY: ReadonlyArray<{ keywords: string[]; city: string }> = [
  { keywords: ['京', '北京', 'beijing', 'BJ'], city: '北京' },
  { keywords: ['沪', '上海', 'shanghai', 'SH'], city: '上海' },
  { keywords: ['深', '深圳', 'shenzhen', 'SZ'], city: '深圳' },
  { keywords: ['穗', '广州', 'guangzhou', 'GZ'], city: '广州' },
  { keywords: ['杭', '杭州', 'hangzhou', 'HZ'], city: '杭州' },
  { keywords: ['蓉', '成都', 'chengdu', 'CD'], city: '成都' },
  { keywords: ['汉', '武汉', 'wuhan', 'WH'], city: '武汉' },
]
