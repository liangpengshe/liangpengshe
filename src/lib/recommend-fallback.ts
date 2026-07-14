/**
 * 四库推荐兑底数据（按 OPC 4 层 × 4 库 划分）
 * ------------------------------------------------------------
 * 当 Dify 调用失败 / 无 API Key / 超时时，API 路由返回此处的静态数据。
 * 每个 OPC 类型在每个库下提供 2-3 个高质量推荐。
 *
 * 字段与前端 LibraryCard 完全一致：name / desc / icon / href / badge? / highlight?
 * ------------------------------------------------------------
 */

import type { OPCLevel } from './learning-progress-store'

export interface LibraryItem {
  name: string
  desc: string
  icon: string
  href: string
  badge?: string
  highlight?: boolean
}

export interface LibrariesSnapshot {
  tools: LibraryItem[]
  projects: LibraryItem[]
  services: LibraryItem[]
  resources: LibraryItem[]
}

const TRADER: LibrariesSnapshot = {
  tools: [
    {
      name: '智富严选',
      desc: 'AI 选品分析 + 一键上架，匹配当下爆款',
      icon: '🛒',
      href: '/market/tools?from=guide&level=trader',
      badge: '热门',
      highlight: true,
    },
    {
      name: '灵犀 AI',
      desc: '自动生成商品详情页和营销文案',
      icon: '✨',
      href: '/market/tools?from=guide&level=trader',
    },
    {
      name: '豹纹工坊',
      desc: '一键生成爆款商品素材图',
      icon: '🛠️',
      href: '/market/tools?from=guide&level=trader',
    },
  ],
  projects: [
    {
      name: '无货源网店群',
      desc: '0 库存起步，AI 自动选品上架',
      icon: '🌏',
      href: '/market/projects?from=guide&level=trader',
      badge: '跑通首单',
      highlight: true,
    },
    {
      name: 'AI TikTok Shop',
      desc: '海外短视频带货，AI 翻译 + 配音',
      icon: '📱',
      href: '/market/projects?from=guide&level=trader',
    },
  ],
  services: [
    {
      name: '基础店铺陪跑',
      desc: '30 天从开店到出单一对一辅导',
      icon: '🤝',
      href: '/market/services?from=guide&level=trader',
      badge: '爆款',
      highlight: true,
    },
    {
      name: '新手合规体检',
      desc: '店铺合规、违禁词预检',
      icon: '🛡️',
      href: '/market/services?from=guide&level=trader',
    },
  ],
  resources: [
    {
      name: '电商违禁词库',
      desc: '各平台违禁词实时更新',
      icon: '🚫',
      href: '/market/resources?from=guide&level=trader',
    },
    {
      name: '选品指南',
      desc: '智富严选内部选品 SOP',
      icon: '📚',
      href: '/market/resources?from=guide&level=trader',
      highlight: true,
    },
    {
      name: '首单模板',
      desc: '已验证的开店话术 + 素材包',
      icon: '📦',
      href: '/market/resources?from=guide&level=trader',
    },
  ],
}

const FLOW: LibrariesSnapshot = {
  tools: [
    {
      name: '先锋派数字人',
      desc: 'AI 数字人视频，批量产出内容',
      icon: '🎬',
      href: '/market/tools?from=guide&level=flow',
      badge: '爆款',
      highlight: true,
    },
    {
      name: '灵犀 AI',
      desc: '批量生成短视频脚本',
      icon: '✨',
      href: '/market/tools?from=guide&level=flow',
    },
  ],
  projects: [
    {
      name: 'AI 短视频矩阵',
      desc: 'AI 数字人 + 多账号矩阵系统',
      icon: '🎥',
      href: '/market/projects?from=guide&level=flow',
      badge: '热门',
      highlight: true,
    },
    {
      name: 'AI 私域引流',
      desc: '自动化获客 SOP',
      icon: '📈',
      href: '/market/projects?from=guide&level=flow',
    },
  ],
  services: [
    {
      name: '流量型陪跑',
      desc: '90 天打造一个百万流量账号',
      icon: '🚀',
      href: '/market/services?from=guide&level=flow',
      highlight: true,
    },
    {
      name: '数字人定制',
      desc: '专属 AI 数字人形象打造',
      icon: '🎭',
      href: '/market/services?from=guide&level=flow',
    },
  ],
  resources: [
    {
      name: '短视频脚本库',
      desc: '1000+ 爆款脚本模板',
      icon: '📜',
      href: '/market/resources?from=guide&level=flow',
      highlight: true,
    },
    {
      name: '矩阵工具评测',
      desc: '主流矩阵工具对比',
      icon: '⚖️',
      href: '/market/resources?from=guide&level=flow',
    },
  ],
}

const SYSTEM: LibrariesSnapshot = {
  tools: [
    {
      name: 'Dify',
      desc: '工作流编排 + 智能体发布',
      icon: '🧠',
      href: '/market/tools?from=guide&level=system',
      badge: '推荐',
      highlight: true,
    },
    {
      name: 'Coze 扣子',
      desc: '零代码搭建企业级智能助手',
      icon: '⚡',
      href: '/market/tools?from=guide&level=system',
    },
  ],
  projects: [
    {
      name: 'AI 客服系统',
      desc: '为传统企业接入 AI 客服',
      icon: '🤖',
      href: '/market/projects?from=guide&level=system',
      badge: '高客单',
      highlight: true,
    },
    {
      name: '企业知识库智能体',
      desc: '私域知识库 + 智能问答',
      icon: '📚',
      href: '/market/projects?from=guide&level=system',
    },
  ],
  services: [
    {
      name: 'AI 内训',
      desc: '企业 AI 转型全员培训',
      icon: '🎓',
      href: '/market/services?from=guide&level=system',
    },
    {
      name: 'GEO 增长',
      desc: '生成式引擎优化服务',
      icon: '🎯',
      href: '/market/services?from=guide&level=system',
      badge: '高客单',
      highlight: true,
    },
  ],
  resources: [
    {
      name: '企业 AI 转型白皮书',
      desc: '100+ 行业落地案例',
      icon: '📘',
      href: '/market/resources?from=guide&level=system',
      highlight: true,
    },
    {
      name: '智能体搭建教程',
      desc: '从 0 到 1 搭建 SOP',
      icon: '🛠️',
      href: '/market/resources?from=guide&level=system',
    },
  ],
}

const ASSET: LibrariesSnapshot = {
  tools: [
    {
      name: 'Dify',
      desc: '工作流 + 智能体商业化',
      icon: '🧠',
      href: '/market/tools?from=guide&level=asset',
    },
    {
      name: 'Coze 扣子',
      desc: '智能体产品化与变现',
      icon: '⚡',
      href: '/market/tools?from=guide&level=asset',
      badge: '推荐',
      highlight: true,
    },
  ],
  projects: [
    {
      name: 'AI 数字员工 SaaS',
      desc: '可订阅的 AI 数字员工',
      icon: '💎',
      href: '/market/projects?from=guide&level=asset',
      badge: '资产化',
      highlight: true,
    },
    {
      name: '全球外包交付中心',
      desc: 'AI 工具 + 全球外包交付',
      icon: '🌐',
      href: '/market/projects?from=guide&level=asset',
    },
  ],
  services: [
    {
      name: '数字资产陪跑',
      desc: '把工具沉淀为可售卖的资产',
      icon: '💼',
      href: '/market/services?from=guide&level=asset',
      highlight: true,
    },
    {
      name: '投资人对接',
      desc: '项目 → 资本加速器',
      icon: '🤝',
      href: '/market/services?from=guide&level=asset',
    },
  ],
  resources: [
    {
      name: '数字资产估值指南',
      desc: '可复用资产估值模型',
      icon: '📊',
      href: '/market/resources?from=guide&level=asset',
      highlight: true,
    },
    {
      name: 'AI 产品化模板',
      desc: '工具 → 产品 → 资产',
      icon: '🏗️',
      href: '/market/resources?from=guide&level=asset',
    },
  ],
}

export const FALLBACK_RECOMMENDATIONS: Record<OPCLevel, LibrariesSnapshot> = {
  TRADER,
  FLOW,
  SYSTEM,
  ASSET,
}
