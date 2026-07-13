import { MarketContent } from '@/components/market/MarketContent'

/**
 * AI 智富工具库 - 独立路由
 * 默认 Tab：tools（与 /market 等价）
 */
export default function MarketToolsPage() {
  return <MarketContent defaultTab="tools" />
}
