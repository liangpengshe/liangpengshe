/**
 * city-managers · 服务库需求收集 · 城市主理人池
 * ------------------------------------------------------------
 * 任务：withFallback 迁移 services/inquiry（W3.6）
 * 与 api/projects/find-opc/route.ts 风格一致的静态 mock 池。
 * ------------------------------------------------------------
 */
export interface CityManager {
  city: string
  name: string
  phone: string
  wechat: string
  specialty?: string
}

export const CITY_MANAGERS: Record<string, CityManager> = {
  北京: { city: '北京', name: '王主理人', phone: '138-0000-0001', wechat: 'wang_bj', specialty: 'OPC 资源整合 · 北京 AI 创业圈' },
  上海: { city: '上海', name: '李主理人', phone: '138-0000-0002', wechat: 'li_sh', specialty: 'OPC 陪跑 · 长三角企业 AI 转型' },
  深圳: { city: '深圳', name: '陈主理人', phone: '138-0000-0003', wechat: 'chen_sz', specialty: '交易型 OPC · 网店 SOP 实战' },
  广州: { city: '广州', name: '黄主理人', phone: '138-0000-0004', wechat: 'huang_gz', specialty: '供应链主理人 · 13 行女装对接' },
  杭州: { city: '杭州', name: '张主理人', phone: '138-0000-0005', wechat: 'zhang_hz', specialty: '流量型 OPC · 自媒体矩阵增长' },
  成都: { city: '成都', name: '刘主理人', phone: '138-0000-0006', wechat: 'liu_cd', specialty: '系统型 OPC · 企业 AI 落地' },
  武汉: { city: '武汉', name: '赵主理人', phone: '138-0000-0007', wechat: 'zhao_wh', specialty: 'OPC 资源对接 · 华中创业者社群' },
  // 默认 fallback（用户城市不在主理人覆盖范围时启用深圳）
  default: { city: '深圳', name: '陈主理人', phone: '138-0000-0003', wechat: 'chen_sz', specialty: '交易型 OPC · 网店 SOP 实战' },
}
