import { MarketContent } from '@/components/market/MarketContent'

/**
 * AI 智富四库 - 默认入口（AI智富工具库）
 *
 * 访问路径：
 *   - /market              → 默认进入 AI智富工具库（Tab 内部切换）
 *   - /market/tools        → 工具库（直链，独立路由）
 *   - /market/services     → 服务库（直链，独立路由）
 *   - /market/projects     → 项目库（直链，独立路由）
 *   - /market/resources    → 资源库（直链，独立路由）
 *
 * 4 个独立子路由都已实现，分别渲染 <MarketContent defaultTab="xxx" />。
 * 在根路径下点击 Tab 仍是 SPA 模式切换（不刷新页面），
 * 在子路由下点击 Tab 会 router.push 跳到对应子路由。
 */
export default function MarketPage() {
  return <MarketContent defaultTab="tools" />
}
