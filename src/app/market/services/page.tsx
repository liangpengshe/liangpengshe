import { MarketContent } from '@/components/market/MarketContent'

/**
 * AI 智富服务库 - 独立路由
 * 默认 Tab：services（多选需求引擎 + 8 个服务板块）
 */
export default function MarketServicesPage() {
  return <MarketContent defaultTab="services" />
}
