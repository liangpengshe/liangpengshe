/**
 * ════════════════════════════════════════════════════════════════
 *  SOP 兑换目录 · 任务 P1-5 mock 数据集中化
 * ════════════════════════════════════════════════════════════════
 *
 *  之前内联在 src/app/member/page.tsx 末尾（line 2382-2432），现抽离到独立文件：
 *  1. 降低 member/page.tsx ~50 行
 *  2. 未来真正接入 /api/market/sop-docs 时，只需替换 import 源
 *  3. 集中管理所有可兑换内容
 *
 *  类别：交易型 / 流量型 / 系统型 / 资产型 / 通用
 *  积分档位：50 / 60 / 80 / 100 / 120 / 200
 * ════════════════════════════════════════════════════════════════
 */

export type SOPExchangeCategory = '交易型 OPC' | '流量型 OPC' | '系统型 OPC' | '资产型 OPC' | '通用'

export interface SOPExchangeItem {
  id: string
  title: string
  category: SOPExchangeCategory
  points: number
  pages: number
  desc: string
}

export const SOP_EXCHANGE_CATALOG: readonly SOPExchangeItem[] = [
  {
    id: 'sop-trader-001',
    title: '选品 SOP · 5 步定位蓝海类目',
    category: '交易型 OPC',
    points: 50,
    pages: 18,
    desc: '需求强度 / 利润空间 / 竞争密度 / 复购频次 4 维评估表',
  },
  {
    id: 'sop-flow-002',
    title: '内容矩阵 SOP · 10 个爆款选题公式',
    category: '流量型 OPC',
    points: 80,
    pages: 24,
    desc: '情绪共鸣度 / 争议性 / 可执行性 三轴选题法',
  },
  {
    id: 'sop-system-003',
    title: '客户交付 SOP · 5 阶段验收清单',
    category: '系统型 OPC',
    points: 120,
    pages: 32,
    desc: 'POC 验证 → 灰度上线 → 全量交付 → 运维支持 4 阶段',
  },
  {
    id: 'sop-asset-004',
    title: '数字资产 SOP · 3 套定价模型',
    category: '资产型 OPC',
    points: 200,
    pages: 28,
    desc: 'DCF / 可比公司 / 风险因子 估值框架',
  },
  {
    id: 'sop-coach-005',
    title: 'AI 教练话术 SOP · 7 类客户应对',
    category: '通用',
    points: 60,
    pages: 16,
    desc: '拒绝型 / 比价型 / 决策型 / 售后型 等应对模板',
  },
  {
    id: 'sop-pricing-006',
    title: '定价策略 SOP · 4 套组合拳',
    category: '通用',
    points: 100,
    pages: 22,
    desc: '锚定价 / 阶梯价 / 套餐价 / 满减组合 实操指南',
  },
] as const

/** 按积分升序 */
export const SOP_EXCHANGE_CATALOG_BY_POINTS = [...SOP_EXCHANGE_CATALOG].sort(
  (a, b) => a.points - b.points
)
