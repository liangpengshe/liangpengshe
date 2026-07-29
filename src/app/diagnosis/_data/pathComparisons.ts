/**
 * pathComparisons 静态数据（4 类路径对比卡）
 * ------------------------------------------------------------
 * 任务：拆 diagnosis/page.tsx（演进项 3.5）
 * 原位置：diagnosis/page.tsx 中 4 处 `pathComparisons` 引用。
 * 抽离原因：与 questions 一样是只读静态数据，没必要进主组件。
 * ------------------------------------------------------------
 */
export type SelectedPath = 'TRADER' | 'FLOW' | 'SYSTEM' | 'ASSET'

export interface PathComparison {
  key: SelectedPath
  emoji: string
  label: string
  tagline: string
  fastestTime: string
  skills: string[]
  risks: string[]
  fitFor: string[]
  gradient: string
  ring: string
  badge: string
  weapon: string[]
}

/**
 * 注意：当前 stage === 'select' 渲染区只取前两条（TRADER / FLOW）作为
 * 路径选择卡；其他两条（SYSTEM / ASSET）从"chat 阶段 → 4 问推演"反向流入。
 * 完整数据仍保留 4 条，方便后续页内扩展或"完整路径对比"独立区块复用。
 */
export const PATH_COMPARISONS: readonly PathComparison[] = [
  {
    key: 'TRADER',
    emoji: '💰',
    label: '交易型 OPC',
    tagline: '跑通首单 + AI 帮你做爆款',
    fastestTime: '3-7 天',
    skills: ['选品眼光', '基础运营', '执行力'],
    risks: ['库存压货', '广告费超支', '退货率风险'],
    fitFor: ['想快速跑通一单验证', '手头有 1-3 万启动资金', '能接受短期失败'],
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    ring: 'ring-amber-400/50',
    badge: '推荐新手起步',
    weapon: ['智富严选', '灵犀 AI · 商品图', '豹纹工坊'],
  },
  {
    key: 'FLOW',
    emoji: '🔥',
    label: '流量型 OPC',
    tagline: '内容获客 + 自媒体矩阵',
    fastestTime: '15-30 天',
    skills: ['写文案做内容', '基础剪辑', '持续输出能力'],
    risks: ['起号周期长', '算法波动', '粉丝转化不稳'],
    fitFor: ['擅长写文案/做内容', '有耐心持续输出', '有 1-2 个月启动期'],
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    ring: 'ring-rose-400/50',
    badge: '内容创作者首选',
    weapon: ['豹纹工坊（豹纹+） · 爆款素材', 'AI 自媒体项目库', '灵犀 AI · 短视频脚本'],
  },
  {
    key: 'SYSTEM',
    emoji: '⚙️',
    label: '系统型 OPC',
    tagline: '企业流程改造 + 高客单解决方案',
    fastestTime: '30-60 天',
    skills: ['行业 know-how', 'B 端销售', '项目交付能力'],
    risks: ['销售周期长', '定制化重', '客户决策链复杂'],
    fitFor: ['已有行业资源', '能接 3-10 万单', '想做 B 端长期生意'],
    gradient: 'from-blue-500 via-indigo-500 to-violet-500',
    ring: 'ring-blue-400/50',
    badge: '企业主首选',
    weapon: ['GEO 增长陪跑', 'FastGPT 企业知识库', 'AI 内训服务'],
  },
  {
    key: 'ASSET',
    emoji: '🚀',
    label: '资产型 OPC',
    tagline: '数字资产 + 全球外包，复制放大你的生意',
    fastestTime: '60-90 天',
    skills: ['体系化思维', '团队管理', '资本运作意识'],
    risks: ['前期投入大', '需要团队补齐', '区域合规复杂'],
    fitFor: ['已有主业现金流', '想做资产化复制', '有意愿做城市主理人'],
    gradient: 'from-violet-500 via-fuchsia-500 to-pink-500',
    ring: 'ring-violet-400/50',
    badge: '进阶玩家',
    weapon: ['城市分站加盟', '数字资产 SOP', '全球外包中心'],
  },
] as const

/** select 阶段实际渲染的卡（仅 2 条） */
export const PATH_COMPARISONS_DISPLAY = PATH_COMPARISONS.slice(0, 2)
