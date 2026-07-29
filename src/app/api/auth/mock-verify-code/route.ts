import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

/**
 * ════════════════════════════════════════════════════════════════
 *  Mock 验证验证码 · 登录/注册一体化
 * ════════════════════════════════════════════════════════════════
 *  流程：
 *    1. 校验 code === '6666'
 *    2. 在 User 表查找该手机号 → 不存在则自动注册
 *    3. 生成 Mock JWT token（base64 编码的简化 JWT）
 *    4. 返回 { user, token } 让前端写入 localStorage
 *
 *  降级策略：
 *    - Prisma 不可用时，使用内存 store
 *    - 保证本地无 DB 也能演示完整闭环
 * ════════════════════════════════════════════════════════════════
 */

export const dynamic = 'force-dynamic'

function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

/** 简化版 Mock JWT（base64url(header).base64url(payload).signature） */
function generateMockJwt(userId: string, phone: string): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const payload = {
    sub: userId,
    phone,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 天
  }
  const b64 = (o: object) =>
    Buffer.from(JSON.stringify(o))
      .toString('base64')
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  const sig = crypto
    .createHmac('sha256', 'opc-mock-secret')
    .update(`${b64(header)}.${b64(payload)}`)
    .digest('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  return `${b64(header)}.${b64(payload)}.${sig}`
}

/** 内存 store（无 DB 时降级用） */
type MockUser = { id: string; phone: string; name: string; createdAt: string }
function getMemStore(): MockUser[] {
  return ((globalThis as any).__opcMockUserStore ||= []) as MockUser[]
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { phone, code } = body || {}

    // ── 1. 校验必填 ──
    if (!phone || !code) {
      return NextResponse.json(
        { success: false, error: '手机号和验证码不能为空' },
        { status: 400 }
      )
    }

    const trimmedPhone = String(phone).trim()
    if (!isValidPhone(trimmedPhone)) {
      return NextResponse.json(
        { success: false, error: '请输入正确的 11 位手机号' },
        { status: 400 }
      )
    }

    // ── 2. 校验验证码（演示模式固定 6666） ──
    if (String(code).trim() !== '6666') {
      return NextResponse.json(
        { success: false, error: '验证码错误（演示码：6666）' },
        { status: 400 }
      )
    }

    // ── 3. 查找/创建用户（Prisma 优先，失败则降级到内存） ──
    let user: { id: string; phone: string; name: string; isNewUser: boolean }

    try {
      const existing = await prisma.user.findUnique({
        where: { phone: trimmedPhone },
      })

      if (existing) {
        user = {
          id: existing.id,
          phone: existing.phone || trimmedPhone,
          name: existing.name || `用户${trimmedPhone.slice(-4)}`,
          isNewUser: false,
        }
      } else {
        // [类型兜底] Prisma schema 要求 email 必填，但 mock 场景下只有手机号
        const created = await prisma.user.create({
          data: {
            email: `${trimmedPhone}@mock.local`,
            phone: trimmedPhone,
            name: `用户${trimmedPhone.slice(-4)}`,
            role: 'MEMBER',
          },
        })
        user = {
          id: created.id,
          phone: created.phone || trimmedPhone,
          name: created.name || `用户${trimmedPhone.slice(-4)}`,
          isNewUser: true,
        }
      }
    } catch (dbErr: any) {
      // ⚠️ Prisma 不可用（无 DB / env 缺失）→ 降级到内存
      console.info('[mock-verify-code] Prisma 不可用，使用内存用户表')
      const mem = getMemStore()
      const found = mem.find((u) => u.phone === trimmedPhone)
      if (found) {
        user = {
          id: found.id,
          phone: found.phone,
          name: found.name,
          isNewUser: false,
        }
      } else {
        const newUser: MockUser = {
          id: `mock-user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          phone: trimmedPhone,
          name: `用户${trimmedPhone.slice(-4)}`,
          createdAt: new Date().toISOString(),
        }
        mem.push(newUser)
        user = {
          id: newUser.id,
          phone: newUser.phone,
          name: newUser.name,
          isNewUser: true,
        }
      }
    }

    // ── 4. 生成 token ──
    const token = generateMockJwt(user.id, user.phone)

    return NextResponse.json({
      success: true,
      mock: true,
      isNewUser: user.isNewUser,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
      },
      message: user.isNewUser ? '注册成功，已自动创建账号' : '登录成功',
    })
  } catch (error: any) {
    console.error('[mock-verify-code] error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || '验证失败，请稍后重试' },
      { status: 500 }
    )
  }
}
