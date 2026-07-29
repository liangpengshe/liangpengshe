/**
 * OPC 智富路径全盘优化验证测试
 * 任务：验证首页学习路径卡片 + 定价页核心价值文案
 * 验证项：
 *   1. 首页 STEP 卡片显示 4 大步骤、核心价值、价格、交付物
 *   2. 移动端 (390px) 价格胶囊 + 交付物清晰可见
 *   3. 定价页 599/1980/5980 卡片显示核心价值
 *   4. 5980 按钮跳 /partner
 */
const { chromium } = require('playwright')
const path = require('path')

const BASE = process.env.BASE_URL || 'http://localhost:3001'
const SCREEN_DIR = path.join(__dirname, 'screenshots')

const results = []
const errors = []

async function check(label, fn) {
  try {
    const ok = await fn()
    results.push({ label, status: ok ? 'PASS' : 'FAIL' })
    console.log(`  ${ok ? '✓' : '✗'} ${label}`)
    if (!ok) errors.push(label)
  } catch (e) {
    results.push({ label, status: 'ERROR', error: e.message })
    console.log(`  ✗ ${label} (${e.message})`)
    errors.push(label)
  }
}

;(async () => {
  const fs = require('fs')
  if (!fs.existsSync(SCREEN_DIR)) fs.mkdirSync(SCREEN_DIR, { recursive: true })

  const browser = await chromium.launch()
  try {
    // ───────── PC 端 ─────────
    const ctxPC = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const pagePC = await ctxPC.newPage()

    // ════════ 1. 首页学习路径 ════════
    console.log('\n[Home /] 学习路径 STEP 卡片')
    await pagePC.goto(`${BASE}/`, { waitUntil: 'networkidle' })
    await pagePC.screenshot({ path: path.join(SCREEN_DIR, 'home-pc.png'), fullPage: true })

    await check('首页 · 4 大 STEP 标题存在', async () => {
      const text = await pagePC.textContent('body')
      return ['咨询诊断', '学习入门', '运营实操', '矩阵放大'].every((k) => text.includes(k))
    })
    await check('首页 · 4 大核心价值文案', async () => {
      const text = await pagePC.textContent('body')
      return [
        '我适合做什么',
        '我第一步应该干什么',
        '怎么干才能成',
        '怎么把生意做成资产',
      ].every((k) => text.includes(k))
    })
    await check('首页 · 4 大价格胶囊', async () => {
      const text = await pagePC.textContent('body')
      return ['19.9 元', '首月 9.9 元', '599 / 1980 元/年', '5980 元'].every((k) => text.includes(k))
    })
    await check('首页 · 交付物胶囊存在（蓝皮书 / 8 步 SOP / 城市独家 / 分站系统）', async () => {
      const text = await pagePC.textContent('body')
      return ['OPC智富蓝皮书', '8 步 SOP', '城市独家经营', '分站系统'].every((k) => text.includes(k))
    })
    await check('首页 · 交付物采用极简浅色胶囊样式', async () => {
      return await pagePC.evaluate(() => {
        // 找到含 "OPC智富蓝皮书" 的元素，向上找最近的胶囊
        const all = [...document.querySelectorAll('span')]
        const target = all.find((el) => el.textContent?.includes('OPC智富蓝皮书'))
        if (!target) return false
        const cls = target.className
        return cls.includes('bg-slate-100') && cls.includes('rounded-full') && cls.includes('px-1.5')
      })
    })
    await check('首页 · 价格胶囊不破坏卡片主视觉（仍是白底卡片）', async () => {
      return await pagePC.evaluate(() => {
        // 找 STEP 卡片
        const cards = [...document.querySelectorAll('button')].filter((b) =>
          b.textContent?.includes('STEP 0')
        )
        if (cards.length < 4) return false
        return cards.every((c) => c.className.includes('bg-white') && c.className.includes('rounded-2xl'))
      })
    })

    // ════════ 2. 定价页核心价值 ════════
    console.log('\n[Pricing /pricing] 核心价值文案')
    await pagePC.goto(`${BASE}/pricing`, { waitUntil: 'networkidle' })
    await pagePC.screenshot({ path: path.join(SCREEN_DIR, 'pricing-pc.png'), fullPage: true })

    await check('定价页 · 599 卡片 · 轻陪跑 · 解决"怎么干才能成"', async () => {
      const text = await pagePC.textContent('body')
      return text.includes('轻陪跑') && text.includes('怎么干才能成')
    })
    await check('定价页 · 1980 卡片 · 深度陪跑 · 解决"怎么从 1 做到 10"', async () => {
      const text = await pagePC.textContent('body')
      return text.includes('深度陪跑') && text.includes('怎么从 1 做到 10')
    })
    await check('定价页 · 5980 卡片 · 怎么把生意做成资产', async () => {
      const text = await pagePC.textContent('body')
      return text.includes('怎么把生意做成资产')
    })
    await check('定价页 · 5980 按钮文案为【了解主理人权益】', async () => {
      const text = await pagePC.textContent('body')
      return text.includes('了解主理人权益')
    })

    // 点击 5980 按钮 → /partner
    await check('定价页 · 点击 5980 按钮跳转 /partner', async () => {
      const btn = pagePC.locator('button:has-text("了解主理人权益"), a:has-text("了解主理人权益")').first()
      await btn.click()
      await pagePC.waitForLoadState('networkidle')
      return pagePC.url().includes('/partner')
    })

    // ───────── 移动端 ─────────
    const ctxM = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    })
    const pageM = await ctxM.newPage()

    console.log('\n[Mobile] / (390x844) 移动端 STEP 卡片')
    await pageM.goto(`${BASE}/`, { waitUntil: 'networkidle' })
    await pageM.screenshot({ path: path.join(SCREEN_DIR, 'home-mobile.png'), fullPage: true })

    await check('移动端 · 4 个 STEP 卡片全部渲染', async () => {
      const cards = await pageM.locator('button:has-text("STEP 0")').count()
      return cards >= 4
    })
    await check('移动端 · 卡片不挤压（4 个胶囊在每张卡片内 flex-wrap）', async () => {
      // 找到第一张 STEP 卡片，检查其内部胶囊数量 ≥ 2
      return await pageM.evaluate(() => {
        const cards = [...document.querySelectorAll('button')].filter((b) =>
          b.textContent?.includes('STEP 0')
        )
        if (cards.length < 4) return false
        return cards.every((c) => {
          const badges = c.querySelectorAll('span.bg-slate-100')
          return badges.length >= 2 // 至少有 2 个交付物胶囊
        })
      })
    })
    await check('移动端 · 4 个 STEP 标题可见', async () => {
      const text = await pageM.textContent('body')
      return ['咨询诊断', '学习入门', '运营实操', '矩阵放大'].every((k) => text.includes(k))
    })
    await check('移动端 · 4 个价格胶囊可见', async () => {
      const text = await pageM.textContent('body')
      return ['19.9 元', '首月 9.9 元', '599 / 1980 元/年', '5980 元'].every((k) =>
        text.includes(k)
      )
    })

    console.log('\n[Mobile] /pricing (390x844) 移动端定价页')
    await pageM.goto(`${BASE}/pricing`, { waitUntil: 'networkidle' })
    await pageM.screenshot({ path: path.join(SCREEN_DIR, 'pricing-mobile.png'), fullPage: true })

    await check('移动端 · 599/1980/5980 卡片核心价值可见', async () => {
      const text = await pageM.textContent('body')
      return [
        '轻陪跑',
        '怎么干才能成',
        '深度陪跑',
        '怎么从 1 做到 10',
        '怎么把生意做成资产',
      ].every((k) => text.includes(k))
    })

    await ctxPC.close()
    await ctxM.close()
  } finally {
    await browser.close()
  }

  console.log('\n══════════════════════════════════════════════════')
  const pass = results.filter((r) => r.status === 'PASS').length
  const fail = results.filter((r) => r.status !== 'PASS').length
  console.log(`总计：${results.length} 项 · 通过 ${pass} · 失败 ${fail}`)
  if (errors.length) {
    console.log('失败项：')
    errors.forEach((e) => console.log('  - ' + e))
    process.exit(1)
  }
  process.exit(0)
})()
