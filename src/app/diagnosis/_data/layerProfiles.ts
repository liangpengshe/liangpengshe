/**
 * layerProfiles 静态数据（四层阶梯定位推演器）
 * ------------------------------------------------------------
 * 任务：拆 diagnosis/page.tsx（演进项 3.5）
 * 原位置：diagnosis/page.tsx 第 76-113 行 layerProfiles 对象。
 * 抽离原因：纯静态数据 + 类型，与 PathComparison 一并归入 _data。
 * ------------------------------------------------------------
 */

export type LayerKey = 'trading' | 'traffic' | 'system' | 'asset'

export interface LayerProfile {
  key: LayerKey
  label: string
  emoji: string
  description: string
  weapons: string[]
  color: string
  gradient: string
}

export const LAYER_PROFILES: Record<LayerKey, LayerProfile> = {
  trading: {
    key: 'trading',
    label: '交易型 OPC',
    emoji: '💰',
    description: '跑通首单 + 智富严选，AI 帮你做爆款',
    weapons: ['智富严选', '灵犀 AI · 商品图生成', '豹纹工坊'],
    color: 'amber',
    gradient: 'from-amber-400 to-orange-500',
  },
  traffic: {
    key: 'traffic',
    label: '流量型 OPC',
    emoji: '🔥',
    description: '内容获客 + 自媒体矩阵，跑出稳定流量',
    weapons: ['豹纹工坊（豹纹+） · 爆款素材', 'AI 自媒体项目库', '灵犀 AI · 短视频脚本'],
    color: 'rose',
    gradient: 'from-rose-500 to-pink-600',
  },
  system: {
    key: 'system',
    label: '系统型 OPC',
    emoji: '⚙️',
    description: '企业流程改造 + 高客单解决方案',
    weapons: ['AI 内训服务', 'GEO 增长陪跑', '企业级智能客服 FastGPT'],
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
  },
  asset: {
    key: 'asset',
    label: '资产型 OPC',
    emoji: '🚀',
    description: '数字资产 + 全球外包，复制放大你的生意',
    weapons: ['城市分站加盟', '数字资产 SOP', '全球外包中心'],
    color: 'violet',
    gradient: 'from-violet-500 to-fuchsia-600',
  },
} as const
