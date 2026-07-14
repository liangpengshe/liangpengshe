/**
 * 用户诊断数据存储（In-Memory Store）
 * ------------------------------------------------------------
 * 用于 /api/ai/recommend-tools 等需要读取用户详细诊断数据的接口。
 *
 * 字段说明：
 *   - 痛点（painPoints）: 资金/技术/团队/客源 等问题清单
 *   - 资金（funds）: 启动资金范围
 *   - 经验（experience）: 创业经验年限
 *   - 货源（supplyChain）: 是否有自有货源
 *   - 目标收入（targetIncome）: 期待年化收入
 *   - 风险偏好（riskTolerance）: 保守/平衡/激进
 *   - 行业背景（background）: 文字描述
 * ------------------------------------------------------------
 */

import type { OPCLevel } from './learning-progress-store'

export interface UserDiagnosis {
  phone: string
  opcLevel: OPCLevel
  painPoints: string[]
  funds: string
  experience: string
  supplyChain?: string
  targetIncome?: string
  riskTolerance?: 'conservative' | 'balanced' | 'aggressive'
  background?: string
  description?: string
  createdAt: string
  updatedAt: string
}

const STORE = new Map<string, UserDiagnosis>()

/** 获取或创建默认诊断（首次访问时根据 OPC 类型生成合理默认值） */
export function getUserDiagnosis(phone: string, opcLevel: OPCLevel = 'TRADER'): UserDiagnosis {
  let record = STORE.get(phone)
  if (record) return record
  record = makeDefault(phone, opcLevel)
  STORE.set(phone, record)
  return record
}

function makeDefault(phone: string, opcLevel: OPCLevel): UserDiagnosis {
  const now = new Date().toISOString()
  // 根据 OPC 类型生成不同的默认痛点 + 背景
  const defaults: Record<OPCLevel, Pick<UserDiagnosis, 'painPoints' | 'background'>> = {
    TRADER: {
      painPoints: ['找不到优质货源', '不会写商品文案', '开店流程不熟悉'],
      background: '想做电商但没选好平台与品类',
    },
    FLOW: {
      painPoints: ['内容产出效率低', '粉丝增长慢', '变现路径不清晰'],
      background: '想做自媒体但缺乏系统化内容生产 SOP',
    },
    SYSTEM: {
      painPoints: ['企业流程效率低', 'AI 工具整合困难', '团队协同成本高'],
      background: '传统企业想 AI 转型但缺乏落地路径',
    },
    ASSET: {
      painPoints: ['产品难以规模化', '交付成本高', '资产复用度低'],
      background: '想把已有工具沉淀为可售卖资产',
    },
  }
  return {
    phone,
    opcLevel,
    painPoints: defaults[opcLevel].painPoints,
    funds: '3-5 万',
    experience: '0-1 年',
    supplyChain: '无',
    targetIncome: '20 万/年',
    riskTolerance: 'balanced',
    background: defaults[opcLevel].background,
    description: '',
    createdAt: now,
    updatedAt: now,
  }
}

/** 更新诊断数据（前端诊断完成后调用） */
export function saveUserDiagnosis(phone: string, data: Partial<Omit<UserDiagnosis, 'phone' | 'createdAt'>>): UserDiagnosis {
  const current = getUserDiagnosis(phone, data.opcLevel)
  const updated: UserDiagnosis = {
    ...current,
    ...data,
    phone,
    updatedAt: new Date().toISOString(),
  }
  STORE.set(phone, updated)
  return updated
}

/** 列出所有（仅调试用） */
export function listAllDiagnoses(): UserDiagnosis[] {
  return Array.from(STORE.values())
}
