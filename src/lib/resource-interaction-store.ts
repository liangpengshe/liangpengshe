/**
 * 资源库 · OPC 共创 UGC · 互动存储（评分/评论/实操笔记）
 * ------------------------------------------------------------
 * 对齐 prisma/schema.prisma 的 ResourceInteraction 模型
 *
 * type 字段：COMMENT（评论）/ REVIEW（评分）/ NOTE（实操笔记）
 * rating 字段：仅 REVIEW 类型存在（1-5 星）
 * ------------------------------------------------------------
 */

export type InteractionType = 'COMMENT' | 'REVIEW' | 'NOTE'

export interface ResourceInteractionRecord {
  id: string
  resourceId: string
  userId: string
  userName: string | null
  type: InteractionType
  content: string
  rating: number | null
  createdAt: string
}

declare global {
  var __resourceInteractionStore: Map<string, ResourceInteractionRecord> | undefined
}

const store: Map<string, ResourceInteractionRecord> =
  globalThis.__resourceInteractionStore ?? new Map()

if (!globalThis.__resourceInteractionStore) {
  globalThis.__resourceInteractionStore = store
  seedInitialInteractions(store)
}

function cuid(): string {
  return `int_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * 种子数据：让资源库 UGC 看起来更真实
 */
function seedInitialInteractions(map: Map<string, ResourceInteractionRecord>) {
  const now = Date.now()
  // 找出第一个已通过投稿的 id 作为种子
  // 演示版不引入跨 store 依赖，使用 placeholder
  const sampleResourceId = 'sub_sample'
  const seeds: Omit<ResourceInteractionRecord, 'id' | 'createdAt'>[] = [
    { resourceId: sampleResourceId, userId: 'opc_seed_trader', userName: '深圳主理人·弓老师', type: 'REVIEW', content: '话术实战验证过 3 个月，转化率提升 25%', rating: 5 },
    { resourceId: sampleResourceId, userId: 'opc_seed_flow', userName: '北京主理人·王老师', type: 'REVIEW', content: '模板分类清晰，新手可上手', rating: 4 },
    { resourceId: sampleResourceId, userId: 'opc_seed_system', userName: '杭州主理人·张主理人', type: 'REVIEW', content: 'AI 话术质量高', rating: 5 },
    { resourceId: sampleResourceId, userId: 'opc_seed_asset', userName: '上海主理人·李主理人', type: 'COMMENT', content: '请问这套话术适合抖音直播间还是视频号？', rating: null },
    { resourceId: sampleResourceId, userId: 'opc_seed_trader_2', userName: '广州主理人·黄主理人', type: 'NOTE', content: '【实操过程】先用这套话术跑了 30 天女装直播，从首日 GMV 500 涨到 8000。\n\n【避坑心得】1. 开场话术要结合自家产品改；2. 憋单节奏要跟着在线人数走；3. 转私域的话术建议每 5 分钟触发一次。', rating: null },
  ]
  for (const seed of seeds) {
    const id = cuid()
    const createdAt = new Date(now - Math.random() * 3 * 24 * 3600 * 1000).toISOString()
    map.set(id, { ...seed, id, createdAt })
  }
}

/**
 * 列出互动（按 resourceId 过滤 + 按 type 过滤）
 */
export function listInteractions(options: {
  resourceId?: string
  type?: InteractionType
} = {}): ResourceInteractionRecord[] {
  const items = Array.from(store.values())
  return items
    .filter((i) => !options.resourceId || i.resourceId === options.resourceId)
    .filter((i) => !options.type || i.type === options.type)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
}

/**
 * 提交互动（评论/评分/笔记）
 */
export function createInteraction(input: {
  resourceId: string
  userId: string
  userName?: string | null
  type: InteractionType
  content: string
  rating?: number | null
}): ResourceInteractionRecord {
  const id = cuid()
  const now = new Date().toISOString()
  const record: ResourceInteractionRecord = {
    id,
    resourceId: input.resourceId,
    userId: input.userId,
    userName: input.userName || null,
    type: input.type,
    content: input.content,
    rating: input.type === 'REVIEW' ? input.rating ?? null : null,
    createdAt: now,
  }
  store.set(id, record)
  return record
}

/**
 * 统计某资源的平均评分（1 位小数）+ 总评分数
 */
export function getAverageRating(resourceId: string): {
  average: number
  count: number
} {
  const reviews = listInteractions({ resourceId, type: 'REVIEW' }).filter(
    (r) => r.rating != null
  )
  if (reviews.length === 0) return { average: 0, count: 0 }
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0)
  return {
    average: Math.round((sum / reviews.length) * 10) / 10,
    count: reviews.length,
  }
}

/**
 * 批量统计多个资源的平均评分
 */
export function getBatchAverageRatings(
  resourceIds: string[]
): Record<string, { average: number; count: number }> {
  const out: Record<string, { average: number; count: number }> = {}
  for (const id of resourceIds) {
    out[id] = getAverageRating(id)
  }
  return out
}

/**
 * 统计某资源的互动数（按 type 分组）
 */
export function getInteractionStats(
  resourceId: string
): Record<InteractionType, number> {
  const all = listInteractions({ resourceId })
  return {
    COMMENT: all.filter((i) => i.type === 'COMMENT').length,
    REVIEW: all.filter((i) => i.type === 'REVIEW').length,
    NOTE: all.filter((i) => i.type === 'NOTE').length,
  }
}
