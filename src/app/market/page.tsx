import { redirect } from 'next/navigation'

/**
 * /market 根路径 → 直接重定向到 /market/tools
 *
 * 历史上 /market 是 Tabs 聚合入口，现在已经拆分为 4 个独立子路由：
 *   - /market/tools
 *   - /market/services
 *   - /market/projects
 *   - /market/resources
 *
 * 为了避免用户访问 /market 时看到重复或不一致的内容，统一 301 到工具库。
 */
export default function MarketPage() {
  redirect('/market/tools')
}
