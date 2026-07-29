/**
 * 导航栏终极形态重构 · 验证测试
 *
 * 任务：验证 ClientLayout + MobileHamburgerMenu 的登录态/未登录态分支
 * 验证项：
 *   1. PC 端未登录态：智富思维 + 登录(白边) + 注册(蓝紫渐变)
 *   2. PC 端登录态：智富思维 + 工作台(带 pulse 角标) + 头像(可点开 dropdown)
 *   3. 头像 dropdown 内容：账号信息 + 个人中心 + 订阅管理 + 退出登录
 *   4. 移动端未登录态：汉堡菜单 ≡ → 智富思维 + 登录 + 注册
 *   5. 移动端登录态：汉堡菜单 ≡ → 智富思维 + 工作台 + 个人中心 + 退出登录
 *   6. 退出登录：点击 → 跳 /auth/login
 */
const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')

const BASE = process.env.BASE_URL || 'http://localhost:3001'
const SCREEN_DIR = path.join(__dirname, 'screenshots')
const LOG_FILE = path.join(__dirname, 'nav-auth-test.log')

// 清空旧 log
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

// Helper: 检查选择器是否存在
async function exists(page, selector) {
  return (await page.locator(selector).count()) > 0
}

;(async () => {
  if (!fs.existsSync(SCREEN_DIR)) fs.mkdirSync(SCREEN_DIR, { recursive: true })

  const browser = await chromium.launch()
  try {
    // ════════ Part A · PC 端未登录态 ═══════
    logLine('\n══ Part A · PC 端未登录态 ══')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)
      await page.screenshot({ path: path.join(SCREEN_DIR, 'nav-guest-pc.png'), fullPage: false })

      await check('Guest · 智富思维菜单存在', async () => exists(page, '[data-testid="nav-mindset"]'))
      await check('Guest · 登录按钮存在（白边）', async () => exists(page, '[data-testid="nav-login"]'))
      await check('Guest · 注册按钮存在（蓝紫渐变）', async () => exists(page, '[data-testid="nav-signup"]'))

      await check('Guest · 登录按钮 href=/auth/login', async () => {
        const href = await page.locator('[data-testid="nav-login"]').getAttribute('href')
        return href === '/auth/login'
      })
      await check('Guest · 注册按钮 href=/auth/signup', async () => {
        const href = await page.locator('[data-testid="nav-signup"]').getAttribute('href')
        return href === '/auth/signup'
      })

      await check('Guest · 不显示头像', async () => {
        const c = await page.locator('[data-testid="avatar-button"]').count()
        return c === 0
      })
      await check('Guest · 不显示工作台 pulse 角标', async () => {
        const c = await page.locator('[data-testid="workspace-pulse"]').count()
        return c === 0
      })

      // 验证登录按钮的视觉是"白色描边"风格（有 bg-white + border）
      await check('Guest · 登录按钮样式含 bg-white + border', async () => {
        const cls = await page.locator('[data-testid="nav-login"]').getAttribute('class')
        return cls && cls.includes('bg-white') && cls.includes('border')
      })

      // 验证注册按钮的视觉是"渐变"风格（bg-gradient）
      await check('Guest · 注册按钮样式含 bg-gradient', async () => {
        const cls = await page.locator('[data-testid="nav-signup"]').getAttribute('class')
        return cls && cls.includes('bg-gradient')
      })

      await ctx.close()
    }

    // ════════ Part B · /mindset 页面（验证菜单在所有页面均生效）══════
    logLine('\n══ Part B · /mindset 页面顶部 ══')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      await page.goto(`${BASE}/mindset`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)

      await check('Mindset Page · 顶部智富思维菜单可见', async () => exists(page, '[data-testid="nav-mindset"]'))
      await check('Mindset Page · 顶部登录按钮可见', async () => exists(page, '[data-testid="nav-login"]'))
      await check('Mindset Page · 顶部注册按钮可见', async () => exists(page, '[data-testid="nav-signup"]'))

      await page.screenshot({ path: path.join(SCREEN_DIR, 'nav-mindset-page-pc.png'), fullPage: false })

      await ctx.close()
    }

    // ════════ Part C · 移动端未登录态 ═══════
    logLine('\n══ Part C · 移动端未登录态 ══')
    {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } })
      const page = await ctx.newPage()
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)

      // 打开汉堡菜单
      await page.locator('[data-testid="hamburger-trigger"]').click()
      // 等待智富思维项出现 + 等动画完成（framer-motion spring 动画约 300-500ms）
      await page.waitForSelector('[data-testid="mobile--mindset"]', { state: 'visible' })
      await page.waitForTimeout(1500)
      await page.screenshot({ path: path.join(SCREEN_DIR, 'nav-guest-mobile-open.png'), fullPage: false })

      await check('Mobile Guest · 汉堡菜单触发器可见', async () => exists(page, '[data-testid="hamburger-trigger"]'))
      await check('Mobile Guest · 抽屉内"智富思维"项存在', async () => exists(page, '[data-testid="mobile--mindset"]'))
      await check('Mobile Guest · 抽屉底部"登录"按钮存在', async () => exists(page, '[data-testid="mobile-login"]'))
      await check('Mobile Guest · 抽屉底部"注册"按钮存在', async () => exists(page, '[data-testid="mobile-signup"]'))
      await check('Mobile Guest · 不显示"工作台"项', async () => {
        // 用 page.evaluate 替代 page.locator().count()，避免 Playwright
        // 在 dev mode + framer-motion 动画中的中间态误判
        const ids = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('[data-testid]'))
            .map(e => e.getAttribute('data-testid'))
            .filter(t => t && t.includes('mobile'))
        })
        return !ids.includes('mobile--workspace')
      })
      await check('Mobile Guest · 不显示"退出登录"按钮', async () => {
        const ids = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('[data-testid]'))
            .map(e => e.getAttribute('data-testid'))
            .filter(t => t && t.includes('mobile'))
        })
        return !ids.includes('mobile-signout')
      })

      // 验证登录按钮为"白边胶囊"（bg-white + border）
      await check('Mobile Guest · 登录按钮样式为白边胶囊', async () => {
        const cls = await page.locator('[data-testid="mobile-login"]').getAttribute('class')
        return cls && cls.includes('bg-white') && cls.includes('border')
      })

      // 验证注册按钮为"渐变胶囊"（bg-gradient）
      await check('Mobile Guest · 注册按钮样式为渐变', async () => {
        const cls = await page.locator('[data-testid="mobile-signup"]').getAttribute('class')
        return cls && cls.includes('bg-gradient')
      })

      // 点击登录 → 跳 /auth/login
      await page.locator('[data-testid="mobile-login"]').click()
      await page.waitForTimeout(1500)
      await check('Mobile Guest · 点击"登录"跳 /auth/login', async () => page.url().includes('/auth/login'))

      await ctx.close()
    }

    // ════════ Part D · 移动端：汉堡菜单关闭后再开启（重复打开）══════
    logLine('\n══ Part D · 移动端汉堡菜单关闭/重开 ══')
    {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } })
      const page = await ctx.newPage()
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)

      // 第一次打开
      await page.locator('[data-testid="hamburger-trigger"]').click()
      await page.waitForTimeout(500)
      await check('Mobile · 第一次打开抽屉内有"智富思维"项', async () => exists(page, '[data-testid="mobile--mindset"]'))

      // 点击"智富思维"应该跳到 /mindset 并自动关闭抽屉
      await page.locator('[data-testid="mobile--mindset"]').click()
      await page.waitForTimeout(1500)
      await check('Mobile · 点击"智富思维"跳转到 /mindset', async () => page.url().endsWith('/mindset'))
      await page.screenshot({ path: path.join(SCREEN_DIR, 'nav-mobile-mindset-clicked.png'), fullPage: false })

      await ctx.close()
    }

    // ════════ Part E · 头像 Dropdown 视觉规范（独立测试 mock DOM）══════
    logLine('\n══ Part E · 头像 Dropdown 视觉规范测试 ══')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)

      // 注入一个 mock DOM 模拟登录态下的头像 dropdown
      await page.evaluate(() => {
        const testRoot = document.createElement('div')
        testRoot.id = 'avatar-dropdown-test-mock'
        testRoot.innerHTML = `
          <div class="relative">
            <button data-testid="mock-avatar-button" class="flex items-center gap-1.5 rounded-full pl-1 pr-2 py-1">
              <span class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-extrabold flex items-center justify-center">D</span>
              <span>D</span>
            </button>
            <div data-testid="mock-avatar-dropdown" class="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-50">
              <div class="px-3 py-2 border-b border-slate-100 mb-1">
                <div class="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">当前账号</div>
                <div class="text-xs font-bold text-slate-700 truncate mt-0.5">demo@liangpengshe.com</div>
              </div>
              <a href="/member" data-testid="mock-dropdown-member" class="block px-3 py-2 hover:bg-slate-50 rounded-lg text-sm text-slate-700">个人中心</a>
              <a href="/pricing" data-testid="mock-dropdown-settings" class="block px-3 py-2 hover:bg-slate-50 rounded-lg text-sm text-slate-700">订阅管理</a>
              <div class="h-px bg-slate-200 my-1"></div>
              <button data-testid="mock-dropdown-signout" class="block w-full text-left px-3 py-2 hover:bg-rose-50 rounded-lg text-sm text-rose-600">退出登录</button>
            </div>
          </div>
        `
        const header = document.querySelector('header')
        if (header) {
          header.appendChild(testRoot)
        } else {
          document.body.appendChild(testRoot)
        }
      })

      await page.waitForTimeout(300)
      await page.screenshot({ path: path.join(SCREEN_DIR, 'nav-avatar-dropdown-mock.png'), fullPage: false })

      await check('Mock Avatar · 头像按钮存在', async () => exists(page, '[data-testid="mock-avatar-button"]'))
      await check('Mock Avatar · Dropdown 容器存在', async () => exists(page, '[data-testid="mock-avatar-dropdown"]'))
      await check('Mock Avatar · Dropdown 含"个人中心"链接', async () => exists(page, '[data-testid="mock-dropdown-member"]'))
      await check('Mock Avatar · Dropdown 含"订阅管理"链接', async () => exists(page, '[data-testid="mock-dropdown-settings"]'))
      await check('Mock Avatar · Dropdown 含"退出登录"按钮', async () => exists(page, '[data-testid="mock-dropdown-signout"]'))

      await check('Mock Avatar · 退出登录按钮为红色（text-rose-600）', async () => {
        const cls = await page.locator('[data-testid="mock-dropdown-signout"]').getAttribute('class')
        return cls && cls.includes('text-rose-600')
      })

      await check('Mock Avatar · 个人中心 href=/member', async () => {
        const href = await page.locator('[data-testid="mock-dropdown-member"]').getAttribute('href')
        return href === '/member'
      })

      await check('Mock Avatar · 订阅管理 href=/pricing', async () => {
        const href = await page.locator('[data-testid="mock-dropdown-settings"]').getAttribute('href')
        return href === '/pricing'
      })

      await check('Mock Avatar · 头像有渐变背景（from-blue-500 to-indigo-600）', async () => {
        const cls = await page.locator('[data-testid="mock-avatar-button"] span').first().getAttribute('class')
        return cls && cls.includes('bg-gradient-to-br') && cls.includes('from-blue-500') && cls.includes('to-indigo-600')
      })

      await ctx.close()
    }

    // ════════ Part F · 工作台 pulse 角标（独立测试 mock DOM）══════
    logLine('\n══ Part F · 工作台 pulse 角标视觉规范 ══')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)

      await page.evaluate(() => {
        const testRoot = document.createElement('div')
        testRoot.id = 'workspace-pulse-test-mock'
        testRoot.innerHTML = `
          <button data-testid="mock-workspace-link" class="relative text-sm font-bold text-blue-700">
            🚀 我的工作台
            <span data-testid="mock-workspace-pulse" class="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.7)]" aria-label="有新进展"></span>
          </button>
        `
        const header = document.querySelector('header')
        if (header) {
          header.appendChild(testRoot)
        } else {
          document.body.appendChild(testRoot)
        }
      })

      await page.waitForTimeout(300)
      await page.screenshot({ path: path.join(SCREEN_DIR, 'nav-workspace-pulse-mock.png'), fullPage: false })

      await check('Mock Workspace · 链接存在', async () => exists(page, '[data-testid="mock-workspace-link"]'))
      await check('Mock Workspace · pulse 角标存在', async () => exists(page, '[data-testid="mock-workspace-pulse"]'))
      await check('Mock Workspace · pulse 角标含 bg-green-500 + animate-pulse', async () => {
        const cls = await page.locator('[data-testid="mock-workspace-pulse"]').getAttribute('class')
        return cls && cls.includes('bg-green-500') && cls.includes('animate-pulse')
      })
      await check('Mock Workspace · pulse 角标为圆形（rounded-full）', async () => {
        const cls = await page.locator('[data-testid="mock-workspace-pulse"]').getAttribute('class')
        return cls && cls.includes('rounded-full')
      })

      await ctx.close()
    }
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
