// MySQL Prisma 不支持 String[] 字段类型（PostgreSQL 才支持）
// 本项目把 string[] 字段存为 JSON 字符串，用这两个函数做编解码
//
// 写库时：specialty: arrToDb(p.specialty)
// 读库时：const arr = arrFromDb(diag.goals)

export function arrFromDb(value: string | null | undefined | any): string[] {
  if (!value) return []
  // 兜底：如果是数组（mock/前端直接塞），原样返回
  if (Array.isArray(value)) return value.filter((v) => typeof v === 'string')
  if (typeof value !== 'string') return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : []
  } catch {
    return []
  }
}

export function arrToDb(value: string | string[] | null | undefined): string {
  if (Array.isArray(value)) return JSON.stringify(value)
  if (typeof value === 'string') return value // 已经是 string（DB 读取后透传），原样返回
  return '[]'
}
