/**
 * 定价页 · 4 维权益权限矩阵定义
 * 用于 PlanCard 底部显性对比 + PricingComparisonTable 全档对比表
 */

import { Rocket, Network, GraduationCap, Building2 } from 'lucide-react'

export const MATRIX_DIMS = [
  { key: 'singleStore', label: '单店/单号实操', Icon: Rocket },
  { key: 'matrix', label: '矩阵放大与多店', Icon: Network },
  { key: 'coach', label: '专家陪跑', Icon: GraduationCap },
  { key: 'cityAgent', label: '本地分站代理', Icon: Building2 },
] as const

export type MatrixDimKey = (typeof MATRIX_DIMS)[number]['key']
