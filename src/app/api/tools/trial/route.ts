import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * 工具体验申请接口
 * 接收用户提交的信息，返回对应工具的真实官网跳转链接。
 *
 * 数据库写入：如果当前 Prisma schema 含 TrialRequest / Lead 等模型，
 * 可在此处 await prisma.xxx.create({ data: ... })
 * 当前 schema 未含相应模型，因此先做"无 DB 写入 + 完整日志"的实现，
 * 后续可直接扩展。
 */

const REDIRECT_MAP: Record<string, { url: string; name: string }> = {
  leopard: {
    url: 'https://www.baowenplus.com/',
    name: '豹纹工坊',
  },
  lingxi: {
    url: 'https://www.lingxixai.com/',
    name: '灵犀 AI',
  },
  pioneer: {
    url: 'https://www.xianfengpai.com.cn/',
    name: '先锋派数字人',
  },
}

interface TrialRequestBody {
  name?: string
  phone?: string
  company?: string
  toolSlug?: string
}

export async function POST(req: Request) {
  let body: TrialRequestBody = {}
  try {
    body = (await req.json()) as TrialRequestBody
  } catch {
    return NextResponse.json(
      { success: false, error: 'INVALID_JSON', message: '请求体不是合法 JSON' },
      { status: 400 }
    )
  }

  const { name, phone, company, toolSlug } = body

  if (!name || !phone) {
    return NextResponse.json(
      { success: false, error: 'MISSING_FIELDS', message: '姓名和手机号为必填项' },
      { status: 400 }
    )
  }

  const slug = (toolSlug || 'leopard').toLowerCase()
  const target = REDIRECT_MAP[slug] || REDIRECT_MAP.leopard

  // 服务端日志：方便你后续接入 CRM/邮件/数据库时直接打捞
  console.log('[tools/trial]', {
    timestamp: new Date().toISOString(),
    toolSlug: slug,
    toolName: target.name,
    name,
    phone: phone.replace(/^(\d{3})\d{4}/, '$1****'), // 简单脱敏
    company: company || '(empty)',
    redirectUrl: target.url,
  })

  // 这里预留：await prisma.trialRequest.create({ data: { ... } })
  // 接入数据库时再启用

  return NextResponse.json({
    success: true,
    redirectUrl: target.url,
    toolName: target.name,
    message: `${target.name} 体验账号已开通，即将跳转至官网`,
  })
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: Object.entries(REDIRECT_MAP).map(([slug, v]) => ({ slug, ...v })),
  })
}
