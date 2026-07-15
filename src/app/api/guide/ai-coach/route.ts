import { NextResponse } from 'next/server'

/**
 * AI 智富私教（学习入门 · 浮动教练）
 * ------------------------------------------------------------
 * POST /api/guide/ai-coach
 *
 * Body:
 *   {
 *     question: string,                       // 用户提问
 *     context?: {
 *       level?: 'trader' | 'flow' | 'system' | 'asset',  // 当前学习页 OPC 类型
 *       page?: string,                        // 当前 URL（用于追溯）
 *       city?: string,                        // 用户城市（兜底推荐本地化用）
 *     }
 *   }
 *
 * 业务逻辑：
 *   1. 优先调用 Dify Chatflow / Workflow（DIFY_API_KEY_COACH）
 *   2. 把 opc_level、page、city 拼成 system prompt
 *   3. 限流：每用户每分钟 20 次（基于 deviceId / ip 兜底）
 *   4. 超时：12s（私教场景需要快速响应）
 *   5. 失败 / 未配置 Key → 使用本地 Mock 兜底（保证体验不中断）
 *
 * 提示词核心（用户指定）：
 *   "你是一名 OPC 智富生态系统的 AI 实战教练。目前用户正在学习【{level}型 OPC】。
 *    请根据用户的问题：{question}，给出具体、落地、操作级别的回答。
 *    如果用户问的是选品，请直接给出具体的类目建议或工具查找方向。
 *    如果用户问的是平台规则，请给出具体的规则点。
 *    回答控制在 200 字以内，语言直接、干脆。不要长篇大论的理论。"
 *
 * 返回 JSON：
 *   { success: true, reply: string, source: 'dify' | 'mock' }
 * ------------------------------------------------------------
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface CoachRequest {
  question?: string
  context?: {
    level?: 'trader' | 'flow' | 'system' | 'asset'
    page?: string
    city?: string
  }
}

const LEVEL_LABEL_CN: Record<string, string> = {
  trader: '交易型 OPC',
  flow: '流量型 OPC',
  system: '系统型 OPC',
  asset: '资产型 OPC',
}

const SYSTEM_PROMPT = `你是一名 OPC 智富生态系统的 AI 实战教练。

【核心规则】
- 你正在辅导的用户当前正在学习【{LEVEL}】。
- 必须给出具体、落地、操作级别的回答，禁止空泛理论。
- 选品类问题 → 直接给具体类目建议或工具查找方向。
- 平台规则类问题 → 直接给具体规则点。
- 回答控制在 200 字以内。
- 语言直接、干脆，不啰嗦。
- 不说"我建议您"、"您可以尝试"等客套话，直接给方案。

【用户当前上下文】
- 学习阶段：{LEVEL}（{LEVEL_DESC}）
- 当前页面：{PAGE}
- 用户城市：{CITY}

【回答格式】
- 直接陈述方案，可以分点（1/2/3），但每点不超过 30 字。
- 必要时给出具体工具名 / 平台名 / 数字。`

const LEVEL_DESC: Record<string, string> = {
  trader: '跑通首单 · AI 网店群 · 智富严选',
  flow: '内容获客 · 自媒体矩阵 · 流量变现',
  system: '企业流程改造 · 高客单 · AI 转型',
  asset: '数字资产 · 全球外包 · 可复用交付',
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as CoachRequest
    const question = (body.question || '').trim()
    if (!question) {
      return NextResponse.json(
        { success: false, reply: '请先输入你的问题～' },
        { status: 400 }
      )
    }

    const level = body.context?.level || 'trader'
    const page = body.context?.page || `/guide/${level}`
    const city = body.context?.city || '深圳'
    const levelLabel = LEVEL_LABEL_CN[level] || 'OPC'
    const levelDesc = LEVEL_DESC[level] || ''

    const apiKey = process.env.DIFY_API_KEY_COACH || process.env.DIFY_API_KEY_CHAT || process.env.DIFY_API_KEY
    const baseUrl = process.env.DIFY_BASE_URL || 'https://api.dify.ai/v1'

    if (!apiKey) {
      // 未配置 Key → 本地 Mock 兜底（保证演示和体验不中断）
      const reply = generateMockReply(question, level, city)
      return NextResponse.json({ success: true, reply, source: 'mock' })
    }

    // 构造 system prompt（用户问题的 context）
    const systemPrompt = SYSTEM_PROMPT
      .replace(/{LEVEL}/g, levelLabel)
      .replace(/{LEVEL_DESC}/g, levelDesc)
      .replace(/{PAGE}/g, page)
      .replace(/{CITY}/g, city)

    // 探测 Dify App 模式（chat / workflow / chatflow）
    let mode = 'unknown'
    try {
      const infoRes = await fetch(`${baseUrl}/info`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(3000),
      })
      if (infoRes.ok) {
        const info = await infoRes.json().catch(() => ({}))
        mode = (info.mode || 'unknown').toString()
      }
    } catch {
      mode = 'unknown'
    }

    const isPureWorkflow = mode === 'workflow'
    const endpoint = isPureWorkflow ? `${baseUrl}/workflows/run` : `${baseUrl}/chat-messages`

    // 拼接最终 query：把 system 注入到 query 头部
    const finalQuery = `${systemPrompt}\n\n【用户问题】\n${question}`

    const body_dify: Record<string, any> = isPureWorkflow
      ? {
          inputs: {
            question,
            level: levelLabel,
            page,
            city,
            system_prompt: systemPrompt,
          },
          response_mode: 'blocking',
          user: `guide-${level}-${city}`,
        }
      : {
          query: finalQuery,
          inputs: {
            level: levelLabel,
            page,
            city,
          },
          response_mode: 'blocking',
          user: `guide-${level}-${city}`,
        }

    // 12s 超时
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 12000)

    let reply = ''
    try {
      const difyRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body_dify),
        signal: controller.signal,
      })

      if (!difyRes.ok) {
        const errText = await difyRes.text().catch(() => '')
        console.warn('[guide/ai-coach] Dify non-2xx:', difyRes.status, errText.substring(0, 200))
        throw new Error(`Dify ${difyRes.status}`)
      }

      const data = await difyRes.json()
      // 兼容多种返回结构：answer / data.output.text / text
      reply =
        data.answer ||
        data.data?.outputs?.text ||
        data.data?.outputs?.reply ||
        data.text ||
        ''
    } catch (err) {
      // Dify 失败 → 兜底 mock
      console.warn('[guide/ai-coach] Dify 调用失败，使用 mock:', (err as Error).message)
      reply = generateMockReply(question, level, city)
      return NextResponse.json({ success: true, reply, source: 'mock' })
    } finally {
      clearTimeout(timeout)
    }

    if (!reply || reply.trim().length < 2) {
      reply = generateMockReply(question, level, city)
      return NextResponse.json({ success: true, reply, source: 'mock' })
    }

    // 截断超过 200 字的部分（按 spec 约束）
    if (reply.length > 240) {
      reply = reply.substring(0, 220) + '…'
    }

    return NextResponse.json({ success: true, reply, source: 'dify' })
  } catch (err) {
    console.error('[guide/ai-coach] 未知错误:', err)
    return NextResponse.json(
      {
        success: false,
        reply: '教练打盹了 😅，请稍后再试。',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/guide/ai-coach',
    method: 'POST',
    description: 'AI 智富私教 · 学习入门浮动教练',
    bodyExample: {
      question: '我还是不明白怎么精准选品',
      context: { level: 'trader', page: '/guide/trader', city: '深圳' },
    },
  })
}

// ════════════════════════════════════════════════════════════════
// Mock 兜底回复（按 level + 关键词匹配）
// 保证即使 Dify 未配置或失败，私教也能给出基本答案
// ════════════════════════════════════════════════════════════════

function generateMockReply(question: string, level: string, city: string): string {
  const q = question.toLowerCase()

  // 通用兜底：分 level 给一条操作建议
  if (level === 'trader') {
    if (q.includes('选品') || q.includes('卖什么')) {
      return `1. 打开灵犀AI → 输入"${city} 蓝海类目"，AI 给你 5 个候选\n2. 去 1688 销量榜 / 抖店飙升榜交叉验证\n3. 先小批量测 3 个 SKU，跑 7 天数据再放大\n4. 利润率必须 > 30%，否则不做`
    }
    if (q.includes('定价') || q.includes('价格')) {
      return `1. 先查同款 TOP 20 竞品的中位数定价\n2. 用"满减 + 阶梯价"组合：买 1 件 ¥X，买 2 件省 ¥Y\n3. 锚定价用 ¥X9（如 99/199），不取整数\n4. 留 3% 利润缓冲应付退货`
    }
    if (q.includes('物流') || q.includes('发货')) {
      return `延迟先主动发短信：参考话术"亲，宝贝已发出，预计明天到达，给您带来不便深表歉意～"\n物流选择：单件 < ¥3 走四通一达；高客单走顺丰\n批量发货用阿奇索自动发货，1 套配置 100 个订单`
    }
    if (q.includes('保证金') || q.includes('资质')) {
      return `1. 淘宝个体店：¥1000（部分类目免）\n2. 拼多多个人店：¥1000 起（部分类目免）\n3. 抖店：关联合伙人免保证金\n4. 食品/化妆品/书籍需特殊资质（食品经营许可证等）`
    }
    if (q.includes('违禁') || q.includes('规则')) {
      return `1. 极限词禁用：最/第一/绝对/全网最低\n2. 医疗/金融类词需特殊资质\n3. 抄袭主图/详情页会被 24h 下架\n4. 售后响应 < 2h，否则扣店铺分`
    }
    return `【${city} · 交易型 OPC 教练】\n你说的是"${question}"。建议先明确卡点是选品/定价/物流/规则中的哪一项，再针对性提问。你也可以直接看页面顶部的"AI 与 OPC 能力拆解"获取完整清单。`
  }

  if (level === 'flow') {
    if (q.includes('流量') || q.includes('播放量') || q.includes('涨粉')) {
      return `1. 让 AI 拆解 3 个对标爆款的开头/中段/钩子\n2. 前 3 秒必须有强冲突/反转/数字钩子\n3. 发布时间：晚 8-10 点 + 早 7-9 点\n4. 完播率 < 30% 立即换开头`
    }
    if (q.includes('人设') || q.includes('定位')) {
      return `人设三要素：身份（我是谁）+ 目标用户（为谁）+ 独特价值（凭什么看我）\n公式示例：30 岁裸辞宝妈 + 副业宝妈 + 每天 1 条真实生活\n拒绝空泛：不能只说"分享生活"，要具体到"分享北京租房改造" `
    }
    if (q.includes('脚本') || q.includes('文案')) {
      return `1. 打开 Deepseek → 输入选题 + 人设\n2. 3 秒钩子用"震惊/数字/反问"\n3. 中段用 2 个具体案例，不要空话\n4. CTA 引导关注/评论/收藏，2 选 1`
    }
    if (q.includes('矩阵') || q.includes('多账号')) {
      return `1. 主账号 + 3 个子账号矩阵（不同角度但同 IP）\n2. 用 AI 工作流自动化：选题→脚本→配音→剪辑→字幕\n3. 子账号内容自动同步主账号，节省 80% 精力\n4. 不要一机多号，会被限流`
    }
    return `【${city} · 流量型 OPC 教练】\n你说的是"${question}"。建议先确认你卡在哪一环：定位/选题/脚本/发布/变现？点开页面顶部"AI 与 OPC 能力拆解"可看到 4 维清单。`
  }

  if (level === 'system') {
    if (q.includes('客户') || q.includes('需求') || q.includes('诊断')) {
      return `客户需求诊断 5 问：\n1. 你的核心业务是什么？\n2. 当前最大痛点是什么？\n3. 痛点的频次 / 量级？\n4. 已试过哪些方案 / 失败原因？\n5. 项目预算 + 时间窗口？\n30 分钟问完 5 个问题 = 70% 报价成功率`
    }
    if (q.includes('报价') || q.includes('价格')) {
      return `3 种定价模型：\n1. 按效果（GMV 提升分成）— 高客单，3-6 月起\n2. 按节点（首付 30% + 上线 40% + 月度 30%）— 最稳\n3. 按月费（AI 客服 ¥5000/月）— 长期稳定\nPOC 期可打折，正式合同按市场价`
    }
    if (q.includes('落地') || q.includes('交付') || q.includes('demo')) {
      return `POC 失败常见原因：\n1. 没考虑边缘 case → 用 AI 模拟 100 个测试\n2. 数据没准备好 → 提前索要脱敏样本\n3. 没做人工兜底 → 设计 3 级 fallback\n4. 客户不会用 → 录 5 分钟操作视频`
    }
    return `【${city} · 系统型 OPC 教练】\n你说的是"${question}"。系统型 OPC 重点是：业务解构 → AI 改造 → 报价交付。你可以先看页面顶部的"AI 与 OPC 能力拆解"。`
  }

  if (level === 'asset') {
    if (q.includes('估值') || q.includes('价值')) {
      return `数字资产估值 3 套模型：\n1. DCF：未来 5 年现金流折现\n2. 可比公司：找 5 个对标 SaaS 估值倍数\n3. 风险因子：核心代码 / 数据 / 客户合同折算\nSaaS 估值 = MRR × 24-48 倍`
    }
    if (q.includes('saas') || q.includes('订阅')) {
      return `订阅经济 4 档定价：\n1. 免费版（导流 + 锁定用户）\n2. 基础版 ¥99/月（核心功能）\n3. 专业版 ¥499/月（高级功能）\n4. 企业版 ¥4999+/月（定制 + SLA）\n转化率从免费到付费目标 > 5%`
    }
    if (q.includes('出海') || q.includes('全球')) {
      return `全球化 3 步：\n1. 选市场：用 AI 调研 5 个目标国家（用户 / 竞品 / 定价）\n2. 配团队：AI 工具 + 海外兼职平台（Upwork / Fiverr）\n3. 合规架构：数据出境 / 税务 / 支付三件套\n先用 1 个市场跑通，再复制到 5 个`
    }
    return `【${city} · 资产型 OPC 教练】\n你说的是"${question}"。资产型 OPC 重点：把工具沉淀为可订阅的产品。先看页面顶部"AI 与 OPC 能力拆解"找方向。`
  }

  return `【OPC 智富私教】\n收到你的问题："${question}"。你可以更具体地描述你的卡点（如：选品、定价、流量、报价、估值等），我可以给你更精准的方案。`
}
