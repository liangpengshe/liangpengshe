/**
 * inquiry · 业务工具函数
 * ------------------------------------------------------------
 * 任务：withFallback 迁移 services/inquiry（W3.6）
 * 抽离所有纯函数（OPCLevel → 专家映射 / 主理人匹配 / 工单 ID）。
 * ------------------------------------------------------------
 */
import { CITY_MANAGERS, type CityManager } from '../_data/city-managers'

// ════════════════════════════════════════════════════════════════
// 类型
// ════════════════════════════════════════════════════════════════
export type OPCLevel = 'TRADER' | 'FLOW' | 'SYSTEM' | 'ASSET'

/** 4 大 OPC 类型对应的专属专家 */
export interface AssignedExpert {
  opcLevel: OPCLevel
  name: string
  avatar: string
  specialty: string
  wechat: string
}

export interface InquiryForm {
  name?: string
  phone?: string
  wechat?: string
  description?: string
  city?: string
  opcLevel?: OPCLevel | null
}

// ════════════════════════════════════════════════════════════════
// OPCLevel → 专属专家映射
// ════════════════════════════════════════════════════════════════
export const OPC_LEVEL_TO_EXPERT: Record<OPCLevel, AssignedExpert> = {
  TRADER: { opcLevel: 'TRADER', name: '弓老师', avatar: '🏹', specialty: '交易型 OPC 专家 · 网店 SOP', wechat: 'gong_opc_trader' },
  FLOW:   { opcLevel: 'FLOW',   name: '林薇老师', avatar: '🌸', specialty: '流量型 OPC 专家 · 自媒体增长', wechat: 'linwei_opc_flow' },
  SYSTEM: { opcLevel: 'SYSTEM', name: '于老师', avatar: '⚙️', specialty: '系统型 OPC 专家 · 数字员工搭建', wechat: 'yu_opc_system' },
  ASSET:  { opcLevel: 'ASSET',  name: '吕老师', avatar: '💎', specialty: '资产型 OPC 专家 · 资产倍增', wechat: 'lv_opc_asset' },
}

// ════════════════════════════════════════════════════════════════
// 入参校验（throw 让 withSmartFallback 兜底）
// ════════════════════════════════════════════════════════════════
export function validateInquiry(body: { selectedServices?: unknown; form?: InquiryForm }): string | null {
  const { selectedServices, form } = body
  if (!Array.isArray(selectedServices) || selectedServices.length === 0) {
    return '请至少选择一项服务'
  }
  if (!form?.name?.trim() || !form?.phone?.trim()) {
    return '姓名和手机号必填'
  }
  // 手机号简单格式校验
  if (form.phone && !/^1[3-9]\d{9}$/.test(form.phone.trim())) {
    return '手机号格式不正确'
  }
  return null
}

// ════════════════════════════════════════════════════════════════
// 主理人匹配（按城市键，缺省 fallback）
// ════════════════════════════════════════════════════════════════
export function matchManagerByCity(city: string | undefined | null): CityManager {
  if (!city) return CITY_MANAGERS.default
  return CITY_MANAGERS[city] || CITY_MANAGERS.default
}

// ════════════════════════════════════════════════════════════════
// OPCLevel → 专家（fallback 到"总部专家池"）
// ════════════════════════════════════════════════════════════════
export function assignExpert(
  opcLevel: OPCLevel | null | undefined,
): AssignedExpert | { name: string; specialty: string; fallback: true } {
  if (opcLevel && OPC_LEVEL_TO_EXPERT[opcLevel]) {
    return OPC_LEVEL_TO_EXPERT[opcLevel]
  }
  return {
    name: '总部专家池',
    specialty: '根据您的需求画像智能匹配 · 24h 内联系您',
    fallback: true as const,
  }
}

// ════════════════════════════════════════════════════════════════
// 工单 ID 生成（人工专家兜底用）
// ════════════════════════════════════════════════════════════════
export function buildTicketId(): string {
  return `EXP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`
}
