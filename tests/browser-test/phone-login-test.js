/**
 * 良朋社 OPC · 手机号验证码登录/注册 · 端到端测试
 *
 * 覆盖范围：
 *   Part A · Mock API（mock-send-code / mock-verify-code）
 *   Part B · /auth/signup 自动跳转到 /auth/login
 *   Part C · /auth/login UI 元素
 *   Part D · 表单交互：倒计时、验证码、跳转
 *   Part E · localStorage 登录态写入
 *   Part F · PC + Mobile 响应式
 */

const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')

const BASE = process.env.BASE_URL || 'http://localhost:3001'
const SCREEN_DIR = path.join(__dirname, 'screenshots')
const LOG_FILE = path.join(__dirname, 'phone-login-test.log')

if (!fs.existsSync(SCREEN_DIR)) fs.mkdirSync(SCREEN_DIR, { recursive: true })
fs.writeFileSync(LOG_FILE, '')

const results = []
const errors = []
let logBuffer = []

function logLine(line) {
  console.log(line)
  logBuffer.push(line)
}

async function check(label, fn) {
  try {
    const ok = await fn()
    const status = ok ? 'PASS' : 'FAIL'
    results.push({ label, status })
    const symbol = ok ? '[OK]' : '[XX]'
    logLine(`  ${symbol} ${label}`)
    if (!ok) errors.push(label)
  } catch (e) {
    results.push({ label, status: 'ERROR', error: e.message })
    logLine(`  [XX] ${label} (${e.message})`)
    errors.push(label)
  }
}

async function fetchJson(url, opts) {
  const res = await fetch(url, opts)
  let body
  try {
    body = await res.json()
  } catch {
    body = null
  }
  return { status: res.status, ok: res.ok, body }
}

;(async () => {
  const browser = await chromium.launch()

  try {
    // ════════ Part A · Mock API ═══════
    logLine('\n══ Part A · Mock API ══')

    // A1 · mock-send-code · 合法手机号
    {
      const r = await fetchJson(`${BASE}/api/auth/mock-send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '13800138000' }),
      })
      logLine(`    [A1] status=${r.status}, body=${JSON.stringify(r.body)?.slice(0, 200)}`)
      await check('A1 · mock-send-code 合法手机号 → 200 + success', async () =>
        r.status === 200 && r.body?.success === true && r.body?.demoCode === '6666'
      )
    }

    // A2 · mock-send-code · 非法手机号
    {
      const r = await fetchJson(`${BASE}/api/auth/mock-send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '123' }),
      })
      logLine(`    [A2] status=${r.status}, body=${JSON.stringify(r.body)}`)
      await check('A2 · mock-send-code 非法手机号 → 400', async () =>
        r.status === 400 && r.body?.success === false
      )
    }

    // A3 · mock-send-code · 缺失 phone
    {
      const r = await fetchJson(`${BASE}/api/auth/mock-send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      logLine(`    [A3] status=${r.status}, body=${JSON.stringify(r.body)}`)
      await check('A3 · mock-send-code 缺失 phone → 400', async () =>
        r.status === 400 && r.body?.success === false
      )
    }

    // A4 · mock-verify-code · 错误码
    {
      const r = await fetchJson(`${BASE}/api/auth/mock-verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '13800138000', code: '0000' }),
      })
      logLine(`    [A4] status=${r.status}, body=${JSON.stringify(r.body)}`)
      await check('A4 · mock-verify-code 错误码 → 400', async () =>
        r.status === 400 && r.body?.success === false
      )
    }

    // A5 · mock-verify-code · 正确码 6666 · 新用户
    {
      const r = await fetchJson(`${BASE}/api/auth/mock-verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '13800138000', code: '6666' }),
      })
      logLine(`    [A5] status=${r.status}, body=${JSON.stringify(r.body)?.slice(0, 300)}`)
      await check('A5 · mock-verify-code 6666 → success + token + user', async () =>
        r.status === 200 &&
          r.body?.success === true &&
          typeof r.body?.token === 'string' &&
          r.body?.user?.phone === '13800138000'
      )
      await check('A5 · 返回 isNewUser 字段', async () => typeof r.body?.isNewUser === 'boolean')
    }

    // A6 · 重复登录相同手机号 → isNewUser=false
    {
      const r = await fetchJson(`${BASE}/api/auth/mock-verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '13800138000', code: '6666' }),
      })
      logLine(`    [A6] isNewUser=${r.body?.isNewUser}`)
      await check('A6 · 相同手机号二次登录 → isNewUser=false', async () => r.body?.isNewUser === false)
    }

    // A7 · 另一个手机号 → 新的 isNewUser
    {
      const r = await fetchJson(`${BASE}/api/auth/mock-verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '13900139000', code: '6666' }),
      })
      logLine(`    [A7] phone=${r.body?.user?.phone}, isNewUser=${r.body?.isNewUser}`)
      await check('A7 · 另一手机号 → 成功', async () =>
        r.status === 200 && r.body?.user?.phone === '13900139000'
      )
    }

    // ════════ Part B · /auth/signup 自动跳转 ═══════
    logLine('\n══ Part B · /auth/signup 自动跳转到 /auth/login ══')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      await page.goto(`${BASE}/auth/signup`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(2000)
      logLine(`    [B] final URL = ${page.url()}`)
      await check('B · /auth/signup 自动跳到 /auth/login', async () =>
        page.url().includes('/auth/login')
      )
      await ctx.close()
    }

    // ════════ Part C · /auth/login UI 元素（PC 端） ═══════
    logLine('\n══ Part C · /auth/login UI 元素（PC 端） ══')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)
      await page.screenshot({ path: path.join(SCREEN_DIR, 'phone-login-pc-initial.png'), fullPage: false })

      await check('C1 · 标题"手机号登录 / 注册"可见', async () => {
        const t = await page.locator('h1:has-text("手机号登录")').count()
        return t > 0
      })
      await check('C2 · 副标题"未注册的手机号将自动创建账号"可见', async () => {
        const t = await page.locator('text=未注册的手机号将自动创建账号').count()
        return t > 0
      })
      await check('C3 · 手机号输入框存在', async () =>
        (await page.locator('[data-testid="phone-input"]').count()) > 0
      )
      await check('C4 · 验证码输入框存在', async () =>
        (await page.locator('[data-testid="code-input"]').count()) > 0
      )
      await check('C5 · "获取验证码"按钮存在', async () =>
        (await page.locator('[data-testid="send-code-btn"]').count()) > 0
      )
      await check('C6 · "登录 / 注册"主按钮存在', async () =>
        (await page.locator('[data-testid="login-submit"]').count()) > 0
      )
      await check('C7 · 演示码提示 6666 可见', async () => {
        const t = await page.locator('text=6666').count()
        return t > 0
      })
      await check('C8 · "获取验证码"按钮初始 disabled（手机号未填）', async () =>
        await page.locator('[data-testid="send-code-btn"]').isDisabled()
      )
      await ctx.close()
    }

    // ════════ Part D · 表单交互（PC 端） ═══════
    logLine('\n══ Part D · 表单交互（PC 端） ══')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)

      // D1 · 填入 11 位手机号 → "获取验证码"按钮变为可点击
      await page.locator('[data-testid="phone-input"]').fill('13800138001')
      await page.waitForTimeout(300)
      const enabled1 = await page.locator('[data-testid="send-code-btn"]').isEnabled()
      logLine(`    [D1] send-code-btn enabled = ${enabled1}`)
      await check('D1 · 填入 11 位手机号后，"获取验证码"可点击', async () => enabled1)

      // D2 · 点击"获取验证码" → 倒计时启动（按钮文案变成 "60s 后重试"）
      await page.locator('[data-testid="send-code-btn"]').click()
      await page.waitForTimeout(800)
      const btnText = await page.locator('[data-testid="send-code-btn"]').textContent()
      logLine(`    [D2] send-code-btn text = "${btnText}"`)
      await check('D2 · 点击后按钮文案变为 "60s 后重试"', async () =>
        /60s 后重试|59s 后重试|58s 后重试/.test(btnText || '')
      )

      // D3 · 成功提示
      const successText = await page.locator('[data-testid="login-success"]').textContent().catch(() => '')
      logLine(`    [D3] success = "${successText?.slice(0, 80)}"`)
      await check('D3 · 出现"验证码已发送"成功提示', async () => (successText || '').includes('验证码已发送'))

      // D4 · 倒计时按钮 disabled
      const disabled2 = await page.locator('[data-testid="send-code-btn"]').isDisabled()
      logLine(`    [D4] send-code-btn disabled = ${disabled2}`)
      await check('D4 · 倒计时期间按钮 disabled', async () => disabled2)

      await page.screenshot({ path: path.join(SCREEN_DIR, 'phone-login-pc-countdown.png'), fullPage: false })

      // D5 · 填入错误验证码 → 错误提示
      await page.locator('[data-testid="code-input"]').fill('0000')
      await page.locator('[data-testid="login-submit"]').click()
      await page.waitForTimeout(2000)
      const errText1 = await page.locator('[data-testid="login-error"]').textContent().catch(() => '')
      logLine(`    [D5] error = "${errText1?.slice(0, 80)}"`)
      await check('D5 · 错误验证码 → 错误提示', async () => (errText1 || '').includes('验证码错误'))

      // D6 · 填入 6666 → 跳转到 /member
      await page.locator('[data-testid="code-input"]').fill('6666')
      await page.locator('[data-testid="login-submit"]').click()
      // 等待跳转（前端 setTimeout 400ms + 路由）
      await page.waitForURL(/\/member/, { timeout: 8000 }).catch(() => {})
      await page.waitForTimeout(1500)
      const finalUrl = page.url()
      logLine(`    [D6] final URL = ${finalUrl}`)
      await check('D6 · 6666 验证码 → 跳转到 /member', async () => finalUrl.includes('/member'))

      // D7 · localStorage 写入
      const ls = await page.evaluate(() => {
        return {
          isLoggedIn: localStorage.getItem('isLoggedIn'),
          token: localStorage.getItem('opc_token'),
          user: localStorage.getItem('opc_user'),
          deviceId: localStorage.getItem('opc_device_id'),
          loginAt: localStorage.getItem('loginAt'),
        }
      })
      logLine(`    [D7] localStorage = ${JSON.stringify(ls).slice(0, 300)}`)
      await check('D7a · localStorage.isLoggedIn = "true"', async () => ls.isLoggedIn === 'true')
      await check('D7b · localStorage.opc_token 存在且非空', async () =>
        typeof ls.token === 'string' && ls.token.length > 20
      )
      await check('D7c · localStorage.opc_user 包含 phone', async () => {
        try {
          const u = JSON.parse(ls.user || '{}')
          return u.phone === '13800138001'
        } catch {
          return false
        }
      })
      await check('D7d · localStorage.opc_device_id 写入', async () => ls.deviceId === '13800138001')

      await page.screenshot({ path: path.join(SCREEN_DIR, 'phone-login-pc-after.png'), fullPage: false })
      await ctx.close()
    }

    // ════════ Part E · 移动端响应式 ═══════
    logLine('\n══ Part E · 移动端响应式 ══')
    {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } })
      const page = await ctx.newPage()
      await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)
      await page.screenshot({ path: path.join(SCREEN_DIR, 'phone-login-mobile-initial.png'), fullPage: false })

      await check('E1 · 移动端标题可见', async () => {
        const t = await page.locator('h1:has-text("手机号登录")').count()
        return t > 0
      })
      await check('E2 · 移动端手机号输入框', async () =>
        (await page.locator('[data-testid="phone-input"]').count()) > 0
      )
      await check('E3 · 移动端获取验证码按钮', async () =>
        (await page.locator('[data-testid="send-code-btn"]').count()) > 0
      )
      await check('E4 · 移动端提交按钮', async () =>
        (await page.locator('[data-testid="login-submit"]').count()) > 0
      )

      // 移动端完整流程
      await page.locator('[data-testid="phone-input"]').fill('13911112222')
      await page.locator('[data-testid="send-code-btn"]').click()
      await page.waitForTimeout(800)
      await page.locator('[data-testid="code-input"]').fill('6666')
      await page.locator('[data-testid="login-submit"]').click()
      await page.waitForURL(/\/member/, { timeout: 8000 }).catch(() => {})
      await page.waitForTimeout(1500)
      const mobileUrl = page.url()
      logLine(`    [E5] mobile final URL = ${mobileUrl}`)
      await check('E5 · 移动端完整登录流程 → 跳 /member', async () => mobileUrl.includes('/member'))

      await page.screenshot({ path: path.join(SCREEN_DIR, 'phone-login-mobile-after.png'), fullPage: false })
      await ctx.close()
    }

    // ════════ Part F · 边界场景 ═══════
    logLine('\n══ Part F · 边界场景 ══')
    {
      // F1 · 11 位以下手机号 → 错误
      const r = await fetchJson(`${BASE}/api/auth/mock-verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '138', code: '6666' }),
      })
      logLine(`    [F1] status=${r.status}, error="${r.body?.error}"`)
      await check('F1 · 非法手机号 → 400 + 中文错误', async () =>
        r.status === 400 && /手机号/.test(r.body?.error || '')
      )

      // F2 · 空 body
      const r2 = await fetchJson(`${BASE}/api/auth/mock-verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      logLine(`    [F2] status=${r2.status}, error="${r2.body?.error}"`)
      await check('F2 · 空 body → 400', async () => r2.status === 400)

      // F3 · 验证码 6667 (非 6666) → 失败
      const r3 = await fetchJson(`${BASE}/api/auth/mock-verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '13800138000', code: '6667' }),
      })
      logLine(`    [F3] status=${r3.status}, error="${r3.body?.error}"`)
      await check('F3 · 验证码 6667（非 6666）→ 400', async () => r3.status === 400)
    }
  } catch (e) {
    logLine(`\n[!!] 测试异常退出: ${e.message}`)
    errors.push(`测试异常: ${e.message}`)
  } finally {
    await browser.close()
  }

  // ─────────── 结果汇总 ───────────
  logLine('\n' + '═'.repeat(60))
  const pass = results.filter((r) => r.status === 'PASS').length
  const fail = results.filter((r) => r.status !== 'PASS').length
  logLine(`📊 测试结果: ${pass} 通过 / ${fail} 失败 / ${results.length} 总计`)
  logLine('═'.repeat(60))

  if (fail > 0) {
    logLine('\n失败项:')
    results
      .filter((r) => r.status !== 'PASS')
      .forEach((r) => logLine(`  ✗ ${r.label}${r.error ? ' (' + r.error + ')' : ''}`))
    fs.writeFileSync(LOG_FILE, logBuffer.join('\n') + '\n')
    process.exit(1)
  } else {
    logLine('\n✅ 全部测试通过！')
    fs.writeFileSync(LOG_FILE, logBuffer.join('\n') + '\n')
  }
})()
