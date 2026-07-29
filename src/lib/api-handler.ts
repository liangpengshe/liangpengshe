/**
 * ════════════════════════════════════════════════════════════════
 *  API 路由统一处理器 · withFallback 装饰器
 * ════════════════════════════════════════════════════════════════
 *
 *  任务 P0-3：消除 63 个 API 路由中"try/catch + supabase + mock"三层重复
 *
 *  收益：
 *    - 每个 API route.ts 从 30+ 行 → 5-8 行
 *    - 统一响应结构：{ success, data, source: 'live' | 'mock' }
 *    - 统一日志风格：info 级别（避免 dev warn 噪声）
 *    - 自动 console.info 降级（不抛 error）
 *
 *  用法示例：
 *    // src/app/api/activities/route.ts
 *    import { withFallback } from '@/lib/api-handler'
 *    import { FALLBACK_ACTIVITIES } from '@/mocks/activities'
 *
 *    export const GET = withFallback({
 *      mock: FALLBACK_ACTIVITIES,
 *      fetcher: async () => {
 *        const supabase = await createClient()
 *        const { data } = await supabase.from('partner_applications').select('*')
 *        return data ?? []
 *      },
 *    })
 *
 *  兼容性：
 *    - 旧路由返回 NextResponse.json({ success, data, source })
 *    - 新装饰器返回同结构
 *    - 调用方无需修改
 * ════════════════════════════════════════════════════════════════
 */

import { NextResponse } from 'next/server'

export type ApiSource = 'live' | 'mock'

export interface WithFallbackOptions<T> {
  /** 兜底数据（supabase/prisma 失败时返回） */
  mock: T
  /** 真实数据获取函数，throw 即降级 */
  fetcher: () => Promise<T>
  /** 日志前缀（默认 'api'） */
  tag?: string
  /** 降级时是否打印 info 日志（默认 true，仅 dev 提示一次） */
  silent?: boolean
}

/**
 * 统一响应结构
 */
export interface ApiEnvelope<T> {
  success: boolean
  data: T
  source: ApiSource
  mock: boolean
  message?: string
}

/**
 * GET 路由装饰器：fetcher 失败时降级到 mock
 */
export function withFallback<T = unknown>(opts: WithFallbackOptions<T>) {
  return async (request?: Request): Promise<NextResponse<ApiEnvelope<T>>> => {
    const tag = opts.tag || 'api'
    try {
      const data = await opts.fetcher()
      // 即使 fetcher 没 throw，也要做"空数据降级"判定
      if (data == null || (Array.isArray(data) && data.length === 0)) {
        if (!opts.silent) {
          console.info(`[${tag}] empty result, fallback to mock`)
        }
        return NextResponse.json({
          success: true,
          data: opts.mock,
          source: 'mock' as const,
          mock: true,
        })
      }
      return NextResponse.json({
        success: true,
        data,
        source: 'live' as const,
        mock: false,
      })
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      if (!opts.silent) {
        console.info(`[${tag}] fallback to mock: ${message}`)
      }
      return NextResponse.json({
        success: true,
        data: opts.mock,
        source: 'mock' as const,
        mock: true,
        message: `降级到 mock: ${message}`,
      })
    }
  }
}

/**
 * POST/PUT/DELETE 路由装饰器：不降级（写操作必须真实成功）
 */
export function withStrictHandler<TIn, TOut = unknown>(
  handler: (body: TIn, request: Request) => Promise<TOut>
) {
  return async (request: Request): Promise<NextResponse> => {
    try {
      const body = (await request.json().catch(() => ({}))) as TIn
      const data = await handler(body, request)
      return NextResponse.json({ success: true, data, mock: false })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Internal error'
      console.error('[api-strict] error:', message)
      return NextResponse.json(
        { success: false, error: message },
        { status: 500 }
      )
    }
  }
}

/**
 * 错误响应工具
 */
export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

// ════════════════════════════════════════════════════════════════
// withSmartFallback · POST 路由智能降级（演进项 3.4）
// ════════════════════════════════════════════════════════════════
//
// 场景：POST 路由需要"读多个数据源 + 各自降级 + 计算"，例如：
//   - /api/ai/match：Dify 提取标签 + Supabase 查合伙人
//   - /api/ai/practice-script：Dify 生成指引 + 本地降级模板
// 与 withFallback 的区别：
//   - withFallback 用于纯 GET（fetcher 失败 → 整体降级 mock）
//   - withSmartFallback 用于 POST（handler throw → 降级到 mockBuilder 生成的兜底）
//
// 设计要点：
//   1. mockBuilder 接收 body，可基于输入动态生成 mock（更精准）
//   2. responseShape 自定义响应结构（避免破坏现有调用方期望的字段）
//   3. handler 内 try/catch 自身的数据源（细粒度降级），最外层用本装饰器兜底
//
export interface WithSmartFallbackOptions<TIn, TOut> {
  /** 处理函数（throw 即降级） */
  handler: (body: TIn, request: Request) => Promise<TOut>
  /** 兜底数据构造器（基于 body 动态生成） */
  mockBuilder: (body: TIn) => TOut | Promise<TOut>
  /** 响应字段包装（默认 { success, data, source, mock }） */
  responseShape?: (data: TOut, isMock: boolean) => Record<string, unknown>
  /** 日志前缀 */
  tag?: string
  /** 静默模式（不打印降级日志） */
  silent?: boolean
}

export function withSmartFallback<TIn = unknown, TOut = unknown>(
  opts: WithSmartFallbackOptions<TIn, TOut>
) {
  return async (request: Request): Promise<NextResponse> => {
    const tag = opts.tag || 'api-smart'
    let body: TIn
    try {
      body = (await request.json().catch(() => ({}))) as TIn
    } catch {
      body = {} as TIn
    }

    try {
      const data = await opts.handler(body, request)
      const shape = opts.responseShape
        ? opts.responseShape(data, false)
        : { success: true, data, source: 'live', mock: false }
      return NextResponse.json(shape)
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      if (!opts.silent) {
        console.info(`[${tag}] fallback to mock: ${message}`)
      }
      const mockData = await opts.mockBuilder(body)
      const shape = opts.responseShape
        ? opts.responseShape(mockData, true)
        : {
            success: true,
            data: mockData,
            source: 'mock' as const,
            mock: true,
            message: `降级到 mock: ${message}`,
          }
      return NextResponse.json(shape)
    }
  }
}
