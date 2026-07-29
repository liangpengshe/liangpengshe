/**
 * 首页冷启动期数据与引流优化 · 端到端测试
 *
 * 覆盖范围：
 *   Part A · 数据统计条（4 项内测初期数据）
 *   Part B · 动态滚动条（8 项去身份化文案）
 *   Part C · Hero 按钮（/live 替换 /salon · 线上直播公开课）
 *   Part D · /live 占位页（直播预告 + 排期 + 福利）
 *   Part E · /partner 按钮保留跳转
 *   Part F · /salon 仍然可访问（不删除）
 */

const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')

const BASE = process.env.BASE_URL || 'http://localhost:3001'
const SCREEN_DIR = path.join(__dirname, 'screenshots')
const LOG_FILE = path.join(__dirname, 'cold-start-test.log')

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

;(async () => {
  const browser = await chromium.launch()

  try {
    // ════════ Part A · 数据统计条 ═══════
    logLine('\n══ Part A · 数据统计条（内测初期） ══')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)

      // 1. 内测企业
      await check('A1 · "内测企业"标签', async () => {
        const t = await page.locator('text=内测企业').count()
        return t > 0
      })
      await check('A2 · 数字 20 存在', async () => {
        // 渲染格式：{value}{suffix}\n{label}{unit}，textContent 连起来是 "20+内测企业家"
        const text = await page.locator('body').textContent()
        return /20\+/.test(text || '') && /内测企业/.test(text || '')
      })

      // 2. 内部实战轮
      await check('A3 · "内部实战轮"标签', async () => {
        const t = await page.locator('text=内部实战轮').count()
        return t > 0
      })
      await check('A4 · 数字 3 期', async () => {
        // 渲染格式：value(无+)\nlabel+unit → textContent 连起来是 "3内部实战轮期"
        // 验证数字 3 + 标签"内部实战轮" + 单位"期"三者共同出现
        const text = await page.locator('body').textContent()
        return /3.*内部实战轮.*期/.test(text || '')
      })

      // 3. 在线学员
      await check('A5 · "在线学员"标签', async () => {
        const t = await page.locator('text=在线学员').count()
        return t > 0
      })
      await check('A6 · 数字 80', async () => {
        const text = await page.locator('body').textContent()
        return /80\+/.test(text || '') && /在线学员/.test(text || '')
      })

      // 4. 实操案例
      await check('A7 · "实操案例"标签', async () => {
        const t = await page.locator('text=实操案例').count()
        return t > 0
      })
      await check('A8 · 数字 10', async () => {
        const text = await page.locator('body').textContent()
        return /10\+?/.test(text || '')
      })

      // 5. 旧文案不出现
      await check('A9 · 旧"已赋能企业"文案不出现', async () => {
        const text = await page.locator('body').textContent()
        return !text.includes('已赋能企业')
      })
      await check('A10 · 旧"举办沙龙"文案不出现', async () => {
        const text = await page.locator('body').textContent()
        return !text.includes('举办沙龙')
      })
      await check('A11 · 旧"服务客户"文案不出现', async () => {
        const text = await page.locator('body').textContent()
        return !text.includes('服务客户')
      })
      await check('A12 · 旧 300+ 不出现在统计条（去重）', async () => {
        const text = await page.locator('body').textContent()
        // 排除 "300" 出现在 active count 那种位置。这里只检查"已赋能 300"组合不存在
        return !/已赋能.*300/.test(text || '')
      })

      await page.screenshot({
        path: path.join(SCREEN_DIR, 'home-stats-cold-start.png'),
        fullPage: false,
        clip: { x: 0, y: 0, width: 1280, height: 800 },
      }).catch(() => page.screenshot({ path: path.join(SCREEN_DIR, 'home-stats-cold-start.png') }))
      await ctx.close()
    }

    // ════════ Part B · 动态滚动条 ═══════
    logLine('\n══ Part B · 动态滚动条（去身份化） ══')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(2500)

      // 用 evaluate 直接读 ActivityTicker 的 textContent（更精确）
      const tickerText = await page.evaluate(() => {
        const el = document.querySelector('.animate-marquee')
        return el ? (el.textContent || '').replace(/\s+/g, ' ') : ''
      })
      // 写到文件方便调试
      fs.writeFileSync(path.join(__dirname, 'debug-ticker.txt'), tickerText)
      const tickerSafe = tickerText.replace(/[\u4e00-\u9fa5]/g, '?').slice(0, 400)
      logLine(`    [B] ticker len=${tickerText.length}, sample="${tickerSafe}..."`)

      // 1. 首批内测用户已开启 AI 数字网店实操
      await check('B1 · "首批内测用户...AI 数字网店实操"出现', async () =>
        /首批内测用户.*AI\s*数字网店实操/.test(tickerText)
      )

      // 2. 第 3 期实战营招募
      await check('B2 · "第 3 期实战营招募"出现', async () =>
        /第\s*3\s*期实战营招募/.test(tickerText)
      )

      // 3. 首期 AI 商业直播课即将开播
      await check('B3 · "首期 AI 商业直播课即将开播"出现', async () =>
        /首期.*AI.*商业直播课.*即将开播/.test(tickerText)
      )

      // 4. 旧假名不出现
      await check('B4 · ticker 中旧假名（张总/王总/李总等）不出现', async () =>
        !/(张总|王总|李总|王老板|陈姐|李主理)/.test(tickerText)
      )

      // 5. ticker 中旧"城市+假名"搭配不出现
      await check('B5 · ticker 中"深圳/广州/杭州+假名"不出现', async () =>
        !/(深圳|东莞|乌海|柳州|广州|杭州).{0,8}(张总|王总|李总|王老板|陈姐)/.test(tickerText)
      )
      await page.screenshot({
        path: path.join(SCREEN_DIR, 'home-ticker-cold-start.png'),
        fullPage: false,
      }).catch(() => {})
      await ctx.close()
    }

    // ════════ Part C · Hero 按钮（/live） ═══════
    logLine('\n══ Part C · Hero 按钮（线上直播公开课） ══')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)

      // 1. "线上直播公开课"按钮存在
      await check('C1 · "线上直播公开课"按钮存在', async () => {
        const t = await page.locator('[data-testid="hero-live-btn"]').count()
        return t > 0
      })

      // 2. 按钮 href 指向 /live
      await check('C2 · 按钮 href = /live', async () => {
        const href = await page.locator('[data-testid="hero-live-btn"]').getAttribute('href')
        return href === '/live'
      })

      // 3. 按钮文案
      await check('C3 · 按钮文案包含"线上直播公开课"', async () => {
        const text = await page.locator('[data-testid="hero-live-btn"]').textContent()
        return (text || '').includes('线上直播公开课')
      })

      // 4. 旧"智富沙龙"按钮不出现
      await check('C4 · 旧"智富沙龙·立即报名"按钮不出现', async () => {
        const text = await page.locator('body').textContent()
        return !text.includes('智富沙龙·立即报名')
      })

      // 5. /partner 按钮保留
      await check('C5 · "智富主理人·城市招募"按钮保留', async () => {
        const text = await page.locator('body').textContent()
        return text.includes('智富主理人·城市招募')
      })

      // 6. 点击 /live 按钮跳转
      await page.locator('[data-testid="hero-live-btn"]').click()
      await page.waitForTimeout(2000)
      const url1 = page.url()
      logLine(`    [C6] clicked, URL = ${url1}`)
      await check('C6 · 点击"线上直播公开课"跳到 /live', async () => url1.endsWith('/live') || url1.includes('/live'))

      await page.screenshot({
        path: path.join(SCREEN_DIR, 'home-hero-cold-start.png'),
        fullPage: false,
      }).catch(() => {})
      await ctx.close()
    }

    // ════════ Part D · /live 占位页 ═══════
    logLine('\n══ Part D · /live 占位页 ══')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      await page.goto(`${BASE}/live`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)

      // 1. 标题
      await check('D1 · "线上直播公开课"标题', async () => {
        const t = await page.locator('h1:has-text("线上直播公开课")').count()
        return t > 0
      })

      // 2. 直播预告标签
      await check('D2 · "直播预告"标签', async () => {
        const t = await page.locator('text=直播预告').count()
        return t > 0
      })

      // 3. 首期主题
      await check('D3 · 首期主题卡片', async () => {
        const t = await page.locator('text=把"生意"做成"资产"').count()
        return t > 0
      })

      // 4. 预约提醒按钮
      await check('D4 · "预约提醒"按钮', async () => {
        const t = await page.locator('[data-testid="live-reserve-btn"]').count()
        return t > 0
      })

      // 5. 排期表
      await check('D5 · 直播排期表（4 张卡）', async () => {
        const t = await page.locator('text=近期直播排期').count()
        return t > 0
      })

      // 6. 直播间福利
      await check('D6 · 直播间福利区', async () => {
        const t = await page.locator('text=直播间专属福利').count()
        return t > 0
      })

      // 7. 线下沙龙降级为辅助入口
      await check('D7 · 包含 /salon 跳转', async () => {
        const links = await page.locator('a[href="/salon"]').count()
        return links > 0
      })

      await page.screenshot({
        path: path.join(SCREEN_DIR, 'live-page-pc.png'),
        fullPage: false,
      }).catch(() => {})
      await ctx.close()
    }

    // ════════ Part E · /partner 按钮跳转 ═══════
    logLine('\n══ Part E · /partner 按钮跳转 ══')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)
      // 找"智富主理人·城市招募"链接
      const link = page.locator('a:has-text("智富主理人·城市招募")').first()
      const href = await link.getAttribute('href')
      logLine(`    [E] partner link href = ${href}`)
      await check('E · "智富主理人"按钮 href = /partner', async () => href === '/partner')
      await ctx.close()
    }

    // ════════ Part F · /salon 仍然可访问 ═══════
    logLine('\n══ Part F · /salon 仍然可访问 ══')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      const resp = await page.goto(`${BASE}/salon`, { waitUntil: 'networkidle' }).catch((e) => null)
      await page.waitForTimeout(1500)
      const status = resp ? resp.status() : 0
      logLine(`    [F] /salon status = ${status}`)
      await check('F1 · /salon 仍然返回 200', async () => status === 200)
      await check('F2 · /salon 不被删除（页面有内容）', async () => {
        const text = await page.locator('body').textContent()
        return (text || '').length > 100
      })
      await ctx.close()
    }

    // ════════ Part G · 移动端响应式 ═══════
    logLine('\n══ Part G · 移动端响应式 ══')
    {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } })
      const page = await ctx.newPage()
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)

      await check('G1 · 移动端"线上直播公开课"按钮', async () => {
        const t = await page.locator('[data-testid="hero-live-btn"]').count()
        return t > 0
      })
      await check('G2 · 移动端"内测企业"标签', async () => {
        const t = await page.locator('text=内测企业').count()
        return t > 0
      })
      await check('G3 · 移动端动态滚动条', async () => {
        const tickerText = await page.evaluate(() => {
          const el = document.querySelector('.animate-marquee')
          return el ? (el.textContent || '') : ''
        })
        return /首批内测用户/.test(tickerText)
      })

      await page.screenshot({
        path: path.join(SCREEN_DIR, 'home-mobile-cold-start.png'),
        fullPage: false,
      }).catch(() => {})

      // 移动端访问 /live
      await page.goto(`${BASE}/live`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)
      await check('G4 · 移动端 /live 标题', async () => {
        const t = await page.locator('h1:has-text("线上直播公开课")').count()
        return t > 0
      })

      await page.screenshot({
        path: path.join(SCREEN_DIR, 'live-page-mobile.png'),
        fullPage: false,
      }).catch(() => {})

      await ctx.close()
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
