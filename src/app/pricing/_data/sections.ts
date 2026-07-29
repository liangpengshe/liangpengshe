/**
 * 定价页 · 3 区块元数据
 * 用于 SectionBlock 渲染 + StickySectionNav 吸顶导航
 */

import type { SectionKey } from './plan-types'

export interface SectionMeta {
  key: SectionKey
  index: '01' | '02' | '03'
  emoji: string
  title: string
  subtitle: string
  hint: string
  /** 深色背景（仅 expansion 区块） */
  dark?: boolean
  /** 区块引导色（左侧细条） */
  ribbon: string
}

export const SECTIONS: SectionMeta[] = [
  {
    key: 'ice',
    index: '01',
    emoji: '🧊',
    title: '破冰与连接',
    subtitle: '从「看见」到「入门」',
    hint: '低门槛体验，找到方向后再深入',
    ribbon: 'from-amber-400 to-orange-500',
  },
  {
    key: 'battle',
    index: '02',
    emoji: '⚔️',
    title: '实战与陪跑',
    subtitle: '从「订阅」到「跑通 SOP」',
    hint: '3 档按深度递进 · 卡片高度统一便于对比',
    ribbon: 'from-blue-500 to-indigo-600',
  },
  {
    key: 'expansion',
    index: '03',
    emoji: '👑',
    title: '扩张与授权',
    subtitle: '从「单店」到「城市合伙人」',
    hint: '锁定分站经营 + 总部导师全程支持',
    dark: true,
    ribbon: 'from-amber-400 to-yellow-500',
  },
]
