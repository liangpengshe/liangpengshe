/**
 * 跨组件共享的常量
 *
 * 放在 lib 目录而不是 layout 文件中，
 * 是因为 Next.js 的 layout 组件有严格类型签名（OmitWithTag），
 * 不允许导出除了 default 之外的命名导出。
 */

export const MARKET_SEARCH_STORAGE_KEY = 'market:search-query'

/** 跨组件搜索变化事件名（layout 写入 → MarketContent 监听） */
export const MARKET_SEARCH_EVENT = 'market:search-changed'
