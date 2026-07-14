/**
 * 资源库 · 投稿分类枚举（共享给前端 + API + Store）
 * ------------------------------------------------------------
 * 允许投稿：physical-prod / ai-software / ai-hardware / ai-courses
 * 禁止投稿：digital-prod（数字产品库）/ franchise（主理人招募）
 * ------------------------------------------------------------
 */

export const SUBMITTABLE_CATEGORIES = [
  'physical-prod',
  'ai-software',
  'ai-hardware',
  'ai-courses',
] as const

export const NON_SUBMITTABLE_CATEGORIES = ['digital-prod', 'franchise'] as const

export type ResourceCategory = (typeof SUBMITTABLE_CATEGORIES)[number]

export const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  'physical-prod': '实物产品库',
  'ai-software': 'AI 自研软件库',
  'ai-hardware': 'AI 智能硬件库',
  'ai-courses': 'AI 精品教程库',
}

export const CATEGORY_EMOJI: Record<ResourceCategory, string> = {
  'physical-prod': '📦',
  'ai-software': '🧰',
  'ai-hardware': '💻',
  'ai-courses': '📚',
}

/**
 * 是否可投稿
 */
export function isSubmittableCategory(v: string): v is ResourceCategory {
  return (SUBMITTABLE_CATEGORIES as readonly string[]).includes(v)
}
