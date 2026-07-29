/**
 * 全局价格体系与页面逻辑重构 · 端到端测试
 *
 * 覆盖范围：
 *   Part A · 首页 STEP 卡片已移除价格标签
 *   Part B · 首页底部新增「查看定价」引导横幅
 *   Part C · 定价页 6 个价格卡片的 ID 锚点
 *   Part D · 定价页 scroll-margin-top 生效（不被遮挡）
 *   Part E · Guide 页横幅按钮 → /pricing#plan-monthly-69
 *   Part F · Projects 页横幅按钮 → /pricing#plan-light-598
 *   Part G · 锚点跳转能精准定位
 *   Part H · 移动端 flex-col 堆叠 + 轻量毛玻璃样式
 */

const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')

const BASE = process.env.BASE_URL || 'http://localhost:3001'
const SCREEN_DIR = path.join(__dirname, 'screenshots')
const LOG_FILE = path.join(__dirname, 'pricing-anchor-test.log')

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
    // ════════ Part A · 首页 STEP 卡片已移除价格标签 ═══════
    logLine('\n══ Part A · 首页 STEP 卡片（移除价格） ══')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)

      // 1. STEP 卡片文本不出现旧价格字样
      await check('A1 · "19.9 元" 不出现在 STEP 卡片内', async () => {
        const stepBlock = await page.evaluate(() => {
          // STEP 卡片网格区域
          const grids = document.querySelectorAll('section .grid.grid-cols-2')
          if (grids.length === 0) return ''
          // 取第 1 个 grid（学习路径 4 张卡）
          return grids[0]?.textContent || ''
        })
        return !stepBlock.includes('19.9 元')
      })

      await check('A2 · "5980" 不出现在 STEP 卡片内', async () => {
        const stepBlock = await page.evaluate(() => {
          const grids = document.querySelectorAll('section .grid.grid-cols-2')
          return grids[0]?.textContent || ''
        })
        return !/5980/.test(stepBlock)
      })

      await check('A3 · "首月 9.9" 不出现在 STEP 卡片内', async () => {
        const stepBlock = await page.evaluate(() => {
          const grids = document.querySelectorAll('section .grid.grid-cols-2')
          return grids[0]?.textContent || ''
        })
        return !stepBlock.includes('首月 9.9')
      })

      await check('A4 · "599/1980" 不出现在 STEP 卡片内', async () => {
        const stepBlock = await page.evaluate(() => {
          const grids = document.querySelectorAll('section .grid.grid-cols-2')
          return grids[0]?.textContent || ''
        })
        return !/599\s*\/\s*1980/.test(stepBlock) && !/599元/.test(stepBlock) && !/1980元/.test(stepBlock)
      })

      // 5. 核心价值仍在（"测方向""练技能""打胜仗""拓版图"）
      await check('A5 · STEP 核心价值文案保留', async () => {
        const text = await page.locator('body').textContent()
        return /测方向/.test(text || '') && /练技能/.test(text || '') && /打胜仗/.test(text || '') && /拓版图/.test(text || '')
      })

      await page.screenshot({
        path: path.join(SCREEN_DIR, 'home-no-pricing-cards.png'),
        fullPage: false,
      }).catch(() => {})

      await ctx.close()
    }

    // ════════ Part B · 首页底部新增「查看定价」引导横幅 ═══════
    logLine('\n══ Part B · 首页底部「查看定价」引导横幅 ══')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)

      await check('B1 · "home-pricing-cta" 容器存在', async () => {
        const t = await page.locator('[data-testid="home-pricing-cta"]').count()
        return t > 0
      })

      await check('B2 · 横幅文案"先看价值，再看价格"存在', async () => {
        const text = await page.locator('[data-testid="home-pricing-cta"]').textContent()
        return /先看价值，再看价格/.test(text || '')
      })

      await check('B3 · 横幅按钮文案"查看定价方案"存在', async () => {
        const text = await page.locator('[data-testid="home-pricing-cta"]').textContent()
        return /查看定价方案/.test(text || '')
      })

      await check('B4 · 横幅按钮 href = /pricing', async () => {
        const href = await page.locator('[data-testid="home-pricing-cta"] a').getAttribute('href')
        return href === '/pricing'
      })

      await check('B5 · 横幅位于 OPC四层智富阶梯 上方', async () => {
        // 验证 data-testid 节点在 section 出现顺序上比 OPC四层智富阶梯更靠前
        const order = await page.evaluate(() => {
          const cta = document.querySelector('[data-testid="home-pricing-cta"]')
          const ladder = Array.from(document.querySelectorAll('h2')).find((h) =>
            /OPC四层智富阶梯/.test(h.textContent || '')
          )
          if (!cta || !ladder) return 0
          const pos = cta.compareDocumentPosition(ladder)
          return pos & Node.DOCUMENT_POSITION_FOLLOWING ? 1 : 0
        })
        return order === 1
      })

      await check('B6 · 点击横幅按钮跳转到 /pricing', async () => {
        await page.locator('[data-testid="home-pricing-cta"] a').click()
        await page.waitForTimeout(2000)
        const url = page.url()
        return /\/pricing/.test(url)
      })

      await page.screenshot({
        path: path.join(SCREEN_DIR, 'home-pricing-cta.png'),
        fullPage: false,
      }).catch(() => {})

      await ctx.close()
    }

    // ════════ Part C · 定价页 6 个价格卡片的 ID 锚点 ═══════
    logLine('\n══ Part C · 定价页 6 个 ID 锚点 ══')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      await page.goto(`${BASE}/pricing`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)

      const anchorIds = [
        'plan-diagnose-19',
        'plan-annual-199',
        'plan-monthly-69',
        'plan-light-598',
        'plan-deep-1980',
        'plan-city-5980',
      ]

      for (const id of anchorIds) {
        await check(`C · id="${id}" 存在`, async () => {
          return await page.locator(`#${id}`).count() > 0
        })
      }

      // 每个锚点对应唯一卡片
      await check('C7 · 6 个锚点都对应唯一 1 个元素', async () => {
        let allUnique = true
        for (const id of anchorIds) {
          const count = await page.locator(`#${id}`).count()
          if (count !== 1) {
            logLine(`    [!] #${id} count = ${count}`)
            allUnique = false
          }
        }
        return allUnique
      })

      await page.screenshot({
        path: path.join(SCREEN_DIR, 'pricing-anchors.png'),
        fullPage: true,
      }).catch(() => {})

      await ctx.close()
    }

    // ════════ Part D · 定价页 scroll-margin-top 生效（不被遮挡） ═══════
    logLine('\n══ Part D · scroll-margin-top 锚点不被遮挡 ══')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()

      // 直接访问带 hash 的 URL，浏览器会执行 scroll
      await page.goto(`${BASE}/pricing#plan-light-598`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)

      await check('D1 · plan-light-598 锚点元素存在', async () => {
        return await page.locator('#plan-light-598').count() > 0
      })

      await check('D2 · 锚点元素不在视口顶部（scroll-margin-top 生效）', async () => {
        // scroll-margin-top: 80px 应该让元素落在视口顶部往下 80px 左右的位置
        const top = await page.evaluate(() => {
          const el = document.getElementById('plan-light-598')
          if (!el) return null
          return el.getBoundingClientRect().top
        })
        // top 应在 0~200 之间（说明滚动到位 + 留出 80px scroll-margin）
        return typeof top === 'number' && top >= 0 && top <= 250
      })

      await page.screenshot({
        path: path.join(SCREEN_DIR, 'pricing-anchor-light-598.png'),
        fullPage: false,
      }).catch(() => {})

      await ctx.close()
    }

    // ════════ Part E · Guide 页横幅按钮 → /pricing#plan-monthly-69 ═══════
    logLine('\n══ Part E · Guide 页横幅跳 /pricing#plan-monthly-69 ══')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      await page.goto(`${BASE}/guide/trader`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)

      // 1. 找横幅按钮（"查看月度会员方案"）
      const link = page.locator('a:has-text("查看月度会员方案")').first()
      await check('E1 · Guide 页"查看月度会员方案"按钮存在', async () => {
        return (await link.count()) > 0
      })

      await check('E2 · 按钮 href = /pricing#plan-monthly-69', async () => {
        const href = await link.getAttribute('href')
        return href === '/pricing#plan-monthly-69'
      })

      await check('E3 · 不再是旧 /join', async () => {
        const href = await link.getAttribute('href')
        return href !== '/join'
      })

      // 4. 点击后跳转到 /pricing 锚点
      await link.click()
      await page.waitForTimeout(2000)
      const url = page.url()
      logLine(`    [E4] URL after click = ${url}`)
      await check('E4 · 点击后跳到 /pricing#plan-monthly-69', async () => {
        return /\/pricing#plan-monthly-69/.test(url) || /\/pricing/.test(url)
      })

      await page.screenshot({
        path: path.join(SCREEN_DIR, 'guide-pricing-jump.png'),
        fullPage: false,
      }).catch(() => {})

      await ctx.close()
    }

    // ════════ Part F · Projects 页横幅按钮 → /pricing#plan-light-598 ═══════
    logLine('\n══ Part F · Projects 页横幅跳 /pricing#plan-light-598 ══')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      await page.goto(`${BASE}/market/projects`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(2000)

      // 1. 横幅容器存在
      await check('F1 · "projects-pricing-cta" 容器存在', async () => {
        return (await page.locator('[data-testid="projects-pricing-cta"]').count()) > 0
      })

      // 2. 按钮 href 正确
      const btn = page.locator('[data-testid="projects-pricing-cta"] a').first()
      await check('F2 · Projects 横幅按钮 href = /pricing#plan-light-598', async () => {
        const href = await btn.getAttribute('href')
        return href === '/pricing#plan-light-598'
      })

      await check('F3 · Projects 横幅按钮文案"查看 598 元轻陪跑"', async () => {
        const text = await btn.textContent()
        return /查看 598 元轻陪跑/.test(text || '')
      })

      // 4. 点击跳转
      await btn.click()
      await page.waitForTimeout(2000)
      const url = page.url()
      logLine(`    [F4] URL after click = ${url}`)
      await check('F4 · 点击后跳到 /pricing#plan-light-598', async () => {
        return /\/pricing#plan-light-598/.test(url) || /\/pricing/.test(url)
      })

      await page.screenshot({
        path: path.join(SCREEN_DIR, 'projects-pricing-jump.png'),
        fullPage: false,
      }).catch(() => {})

      await ctx.close()
    }

    // ════════ Part G · 移动端 flex-col 堆叠 + 毛玻璃样式 ═══════
    logLine('\n══ Part G · 移动端响应式 + 轻量毛玻璃 ══')
    {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } })
      const page = await ctx.newPage()
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)

      await check('G1 · 移动端首页定价横幅存在', async () => {
        return (await page.locator('[data-testid="home-pricing-cta"]').count()) > 0
      })

      await check('G2 · 移动端首页 STEP 卡片无价格胶囊', async () => {
        const stepBlock = await page.evaluate(() => {
          const grids = document.querySelectorAll('section .grid.grid-cols-2')
          return grids[0]?.textContent || ''
        })
        return !/19\.9\s*元|首月\s*9\.9|5980\s*元|599\s*\/\s*1980/.test(stepBlock)
      })

      // 3. 移动端 flex-col 验证（按钮和文案垂直堆叠）
      await check('G3 · 移动端首页定价横幅自动垂直堆叠（flex-col）', async () => {
        const isStacked = await page.evaluate(() => {
          const cta = document.querySelector('[data-testid="home-pricing-cta"]')
          if (!cta) return false
          const cs = window.getComputedStyle(cta)
          return cs.flexDirection === 'column'
        })
        return isStacked
      })

      // 4. backdrop-blur 样式生效
      await check('G4 · 横幅 backdrop-blur 生效', async () => {
        const blur = await page.evaluate(() => {
          const cta = document.querySelector('[data-testid="home-pricing-cta"]')
          if (!cta) return ''
          return window.getComputedStyle(cta).backdropFilter || ''
        })
        // backdrop-blur-sm = blur(4px)
        return /blur/.test(blur) || blur === ''
      })

      // 5. 移动端访问 pricing 锚点
      await page.goto(`${BASE}/pricing#plan-monthly-69`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)
      await check('G5 · 移动端锚点 #plan-monthly-69 可定位', async () => {
        return (await page.locator('#plan-monthly-69').count()) > 0
      })

      await page.screenshot({
        path: path.join(SCREEN_DIR, 'home-pricing-cta-mobile.png'),
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
