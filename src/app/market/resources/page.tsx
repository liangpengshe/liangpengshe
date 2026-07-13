import { MarketContent } from '@/components/market/MarketContent'

/**
 * AI 智富资源库 - 独立路由
 * 默认 Tab：resources（Bento 网格 + 6 大资源板块）
 */
export default function MarketResourcesPage() {
  return <MarketContent defaultTab="resources" />
}
