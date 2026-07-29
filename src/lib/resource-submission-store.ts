/**
 * 资源库 · OPC 共创 UGC · 投稿存储
 * ------------------------------------------------------------
 * 对齐 prisma/schema.prisma 的 ResourceSubmission 模型
 *
 * 演示版使用内存 Map 持久化（与现有 13 个 store 模式一致）
 * 生产环境替换为：
 *   prisma.resourceSubmission.findMany({ where, orderBy, skip, take, include })
 *   prisma.resourceSubmission.create({ data })
 *   prisma.resourceSubmission.update({ where: { id }, data })
 * ------------------------------------------------------------
 */

import type { ResourceCategory } from './resource-categories'

export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface ResourceSubmissionRecord {
  id: string
  authorId: string
  authorName: string | null
  authorLevel: string | null
  title: string
  description: string
  category: ResourceCategory
  fileUrl: string | null
  status: SubmissionStatus
  rejectReason: string | null
  createdAt: string // ISO 字符串
  updatedAt: string
}

/** 全局单例 Map（避免 dev 模式 HMR 重建） */
declare global {
  var __resourceSubmissionStore: Map<string, ResourceSubmissionRecord> | undefined
}

const store: Map<string, ResourceSubmissionRecord> =
  globalThis.__resourceSubmissionStore ?? new Map()

if (!globalThis.__resourceSubmissionStore) {
  globalThis.__resourceSubmissionStore = store
  // 注入种子数据：让资源库 UGC 看起来更真实
  seedInitialSubmissions(store)
}

/**
 * 生成 cuid 风格 ID（演示用，不引外部依赖）
 */
function cuid(): string {
  return `sub_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * 种子数据：4 大可投稿分类各 2 条已通过 + 1 条待审核
 */
function seedInitialSubmissions(map: Map<string, ResourceSubmissionRecord>) {
  const now = Date.now()
  const seeds: Omit<ResourceSubmissionRecord, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      authorId: 'opc_seed_trader',
      authorName: '深圳主理人·弓老师',
      authorLevel: 'TRADER',
      title: 'AI 数字人直播话术包 v3.2',
      description: '500+ 条实战验证的直播话术，按品类（女装/食品/3C）分类。含开场/憋单/逼单/转私域 4 大场景。',
      category: 'ai-self-tools',
      fileUrl: 'https://pan.quark.cn/sop/ai-live-v3.2',
      status: 'APPROVED',
      rejectReason: null,
    },
    {
      authorId: 'opc_seed_flow',
      authorName: '北京主理人·王老师',
      authorLevel: 'FLOW',
      title: '抖音 0 粉冷启动 SOP',
      description: '从账号注册到首条爆款的全流程 SOP，含 7 天起号节奏表、5 类起号模板、3 大避坑指南。',
      category: 'opc-ecology',
      fileUrl: 'https://example.com/sop/douyin-cold-start',
      status: 'APPROVED',
      rejectReason: null,
    },
    {
      authorId: 'opc_seed_system',
      authorName: '杭州主理人·张主理人',
      authorLevel: 'SYSTEM',
      title: 'AI 选品雷达 · 1688 数据爬取工具',
      description: '基于 Playwright 的 1688 爆款数据爬取工具，自动生成选品报告（Excel/CSV）。',
      category: 'ai-self-tools',
      fileUrl: 'https://example.com/tools/1688-radar',
      status: 'APPROVED',
      rejectReason: null,
    },
    {
      authorId: 'opc_seed_asset',
      authorName: '上海主理人·李主理人',
      authorLevel: 'ASSET',
      title: 'TikTok Shop 美区选品清单 2026 Q3',
      description: '2026 Q3 美区 TikTok Shop 爆款选品清单，含 30 个细分品类、客单价、利润率分析。',
      category: 'physical-prod',
      fileUrl: 'https://example.com/list/tiktok-q3-2026',
      status: 'APPROVED',
      rejectReason: null,
    },
    {
      authorId: 'opc_seed_trader_2',
      authorName: '广州主理人·黄主理人',
      authorLevel: 'TRADER',
      title: '拼多多无货源女装起店 SOP',
      description: '广州 13 行女装供应链资源整合，从选品到发货全流程 SOP。',
      category: 'opc-ecology',
      fileUrl: null,
      status: 'APPROVED',
      rejectReason: null,
    },
    {
      authorId: 'opc_seed_flow_2',
      authorName: '深圳主理人·陈主理人',
      authorLevel: 'FLOW',
      title: 'AI 数字人直播一体机评测',
      description: '对 6 款主流 AI 数字人直播一体机的实测评测，含功能/价格/稳定性对比表。',
      category: 'ai-hardware',
      fileUrl: 'https://example.com/review/digital-human-devices',
      status: 'APPROVED',
      rejectReason: null,
    },
    {
      authorId: 'opc_pending_1',
      authorName: 'OPC 新成员·小王',
      authorLevel: 'TRADER',
      title: 'AI 文案生成 prompt 模板包',
      description: '我自己整理的 200+ 条 prompt 模板，覆盖小红书/抖音/微信生态，希望能分享给更多 OPC。',
      category: 'ai-self-tools',
      fileUrl: 'https://example.com/share/prompts-200',
      status: 'PENDING',
      rejectReason: null,
    },
  ]
  for (const seed of seeds) {
    const id = cuid()
    const createdAt = new Date(now - Math.random() * 7 * 24 * 3600 * 1000).toISOString()
    map.set(id, {
      ...seed,
      id,
      createdAt,
      updatedAt: createdAt,
    })
  }
}

/**
 * 列出投稿（支持按 category / status / authorId 过滤）
 */
export function listSubmissions(options: {
  category?: ResourceCategory
  status?: SubmissionStatus
  authorId?: string
} = {}): ResourceSubmissionRecord[] {
  const items = Array.from(store.values())
  return items
    .filter((s) => !options.category || s.category === options.category)
    .filter((s) => !options.status || s.status === options.status)
    .filter((s) => !options.authorId || s.authorId === options.authorId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
}

/**
 * 通过 ID 获取投稿
 */
export function getSubmissionById(id: string): ResourceSubmissionRecord | null {
  return store.get(id) || null
}

/**
 * 通过 ID 列表获取（用于批量统计实用指数）
 */
export function getSubmissionsByIds(ids: string[]): ResourceSubmissionRecord[] {
  return ids.map((id) => store.get(id)).filter(Boolean) as ResourceSubmissionRecord[]
}

/**
 * 创建投稿
 */
export function createSubmission(input: {
  authorId: string
  authorName?: string | null
  authorLevel?: string | null
  title: string
  description: string
  category: ResourceCategory
  fileUrl?: string | null
}): ResourceSubmissionRecord {
  const id = cuid()
  const now = new Date().toISOString()
  const record: ResourceSubmissionRecord = {
    id,
    authorId: input.authorId,
    authorName: input.authorName || null,
    authorLevel: input.authorLevel || null,
    title: input.title,
    description: input.description,
    category: input.category,
    fileUrl: input.fileUrl || null,
    status: 'PENDING',
    rejectReason: null,
    createdAt: now,
    updatedAt: now,
  }
  store.set(id, record)
  return record
}

/**
 * 更新投稿状态
 */
export function updateSubmissionStatus(
  id: string,
  status: SubmissionStatus,
  rejectReason?: string
): ResourceSubmissionRecord | null {
  const record = store.get(id)
  if (!record) return null
  record.status = status
  record.rejectReason = status === 'REJECTED' ? rejectReason || null : null
  record.updatedAt = new Date().toISOString()
  store.set(id, record)
  return record
}

/**
 * 统计某分类下已通过的投稿数
 */
export function countApprovedByCategory(): Record<ResourceCategory, number> {
  const out: Record<string, number> = {}
  const items = Array.from(store.values())
  for (const r of items) {
    if (r.status !== 'APPROVED') continue
    out[r.category] = (out[r.category] || 0) + 1
  }
  return out as Record<ResourceCategory, number>
}
