/**
 * OPC 双引擎智富思维页验证测试
 * 任务：验证 /mindset 页面双引擎 Bento 布局 + 4 个 CTA 跳转
 */
const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')

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
  if (!fs.existsSync(SCREEN_DIR)) fs.mkdirSync(SCREEN_DIR, { recursive: true })

  const browser = await chromium.launch()
  try {
    // ─────── PC 端 ───────
    const ctxPC = await browser.newContext({ viewport: { width: 1280, height: 900 } })
    const pagePC = await ctxPC.newPage()

    // ════════ 1. Hero 区 + 引擎切换胶囊 ════════
    console.log('\n[Hero] 双引擎 Hero + 切换胶囊')
    await pagePC.goto(`${BASE}/mindset`, { waitUntil: 'networkidle' })
    await pagePC.waitForTimeout(800)
    await pagePC.screenshot({ path: path.join(SCREEN_DIR, 'mindset-dual-engine-pc.png'), fullPage: true })

    await check('PC · 页面标题含"OPC 双引擎智富思维"', async () => {
      const t = await pagePC.textContent('body')
      return t.includes('OPC 双引擎智富思维')
    })

    await check('PC · 副标含"赚钱的逻辑"', async () => {
      const t = await pagePC.textContent('body')
      return t.includes('赚钱的逻辑')
    })

    await check('PC · 含引擎切换胶囊"AI 店群思维"', async () => {
      const t = await pagePC.textContent('body')
      return t.includes('AI 店群思维')
    })

    await check('PC · 含引擎切换胶囊"AI 自媒体思维"', async () => {
      const t = await pagePC.textContent('body')
      return t.includes('AI 自媒体思维')
    })

    // ════════ 2. 左侧交易型内容 ════════
    console.log('\n[Trader] 左侧 3 大核心卡 + 店群 CTA')
    const traderSection = await pagePC.locator('#trader-engine').first()

    await check('Trader · 3 张核心卡（T1/T2/T3）', async () => {
      const t = await traderSection.textContent()
      return (
        t.includes('什么是 AI 数字产品') &&
        t.includes('为什么从"虚拟电商"切入') &&
        t.includes('3000 元启动成本清单')
      )
    })

    await check('Trader · 含 5 店群关键数字（298 / 128 / 2000 / 3000）', async () => {
      const t = await traderSection.textContent()
      return t.includes('298') && t.includes('128') && t.includes('2000') && t.includes('3000')
    })

    await check('Trader · 底部 CTA "前往 AI 数字网店 SOP"', async () => {
      const t = await traderSection.textContent()
      return t.includes('前往 AI 数字网店 SOP')
    })

    await check('Trader · 店群 CTA href 指向 ai-digital-shop-group', async () => {
      const cta = await traderSection.locator('a:has-text("前往 AI 数字网店 SOP")').first()
      const href = await cta.getAttribute('href')
      return href && href.includes('ai-digital-shop-group')
    })

    // ════════ 3. 右侧流量型内容 ════════
    console.log('\n[Flow] 右侧 4 大核心卡 + 自媒体 CTA')
    const flowSection = await pagePC.locator('#flow-engine').first()

    await check('Flow · 4 张核心卡（核心命题/核心心法/五大变现/避坑）', async () => {
      const t = await flowSection.textContent()
      return (
        t.includes('核心命题') &&
        t.includes('核心心法') &&
        t.includes('五大变现步骤') &&
        t.includes('避坑总结')
      )
    })

    await check('Flow · 含 5 步变现关键动作（自用/炫技/截流/群内/SOP）', async () => {
      const t = await flowSection.textContent()
      return (
        t.includes('自己学自己用') &&
        t.includes('用一次炫一次') &&
        t.includes('立刻截流') &&
        t.includes('群内低价交付') &&
        t.includes('做成 SOP 产品')
      )
    })

    await check('Flow · 流量真相含"100 个精准高净值用户"', async () => {
      const t = await flowSection.textContent()
      return t.includes('100 个精准高净值用户')
    })

    await check('Flow · 30 条起势内容', async () => {
      const t = await flowSection.textContent()
      return t.includes('坚持发 30 条')
    })

    await check('Flow · 底部 CTA "前往 AI 自媒体 SOP"', async () => {
      const t = await flowSection.textContent()
      return t.includes('前往 AI 自媒体 SOP')
    })

    await check('Flow · 自媒体 CTA href 指向 ai-self-media-group', async () => {
      const cta = await flowSection.locator('a:has-text("前往 AI 自媒体 SOP")').first()
      const href = await cta.getAttribute('href')
      return href && href.includes('ai-self-media-group')
    })

    // ════════ 4. 双引擎终极心法对比 ════════
    console.log('\n[Mantra] 双引擎终极心法对比区')
    await check('Mantra · 标题"选一个引擎先上道"', async () => {
      const t = await pagePC.textContent('body')
      return t.includes('选一个引擎先上道')
    })

    await check('Mantra · 含"交易型 OPC"和"流量型 OPC"', async () => {
      const t = await pagePC.textContent('body')
      return t.includes('交易型 OPC') && t.includes('流量型 OPC')
    })

    // ════════ 5. 避坑三连 ════════
    console.log('\n[Warning] 双引擎避坑三连')
    await check('Warning · 含"避坑三连 · 双引擎通用"', async () => {
      const t = await pagePC.textContent('body')
      return t.includes('避坑三连 · 双引擎通用')
    })

    await check('Warning · 3 条避坑（假努力/先有产品/加人再开干）', async () => {
      const t = await pagePC.textContent('body')
      return (
        t.includes('拒绝"假努力"') &&
        t.includes('拒绝"先有产品"') &&
        t.includes('拒绝"加人再开干"')
      )
    })

    // ════════ 6. 底部统一 CTA ════════
    console.log('\n[BottomCTA] 底部双按钮 → /diagnosis')
    const bottomCTA1 = pagePC.locator('a:has-text("我选 AI 店群，立马实操")').first()
    const bottomCTA2 = pagePC.locator('a:has-text("我选 AI 自媒体，立马实操")').first()

    await check('BottomCTA · 存在"我选 AI 店群"按钮', async () => {
      return (await bottomCTA1.count()) > 0
    })

    await check('BottomCTA · 存在"我选 AI 自媒体"按钮', async () => {
      return (await bottomCTA2.count()) > 0
    })

    await check('BottomCTA · 店群按钮 href=/diagnosis', async () => {
      const href = await bottomCTA1.getAttribute('href')
      return href === '/diagnosis'
    })

    await check('BottomCTA · 自媒体按钮 href=/diagnosis', async () => {
      const href = await bottomCTA2.getAttribute('href')
      return href === '/diagnosis'
    })

    // ════════ 7. CTA 跳转验证（点击 → 跳到对应页） ════════
    console.log('\n[Navigation] 4 个 CTA 实际跳转验证')

    // 7.1 店群 CTA → /market/projects?slug=ai-digital-shop-group
    await pagePC.goto(`${BASE}/mindset`, { waitUntil: 'networkidle' })
    const traderCta = pagePC.locator('#trader-engine a:has-text("前往 AI 数字网店 SOP")').first()
    await traderCta.scrollIntoViewIfNeeded()
    await Promise.all([
      pagePC.waitForURL('**/market/projects**', { timeout: 8000 }).catch(() => null),
      traderCta.click(),
    ])
    await pagePC.waitForTimeout(1500)
    await pagePC.screenshot({ path: path.join(SCREEN_DIR, 'mindset-trader-cta-landing.png'), fullPage: false })
    await check('Navigation · 店群 CTA 跳到 /market/projects?slug=ai-digital-shop-group', async () => {
      return pagePC.url().includes('/market/projects') && pagePC.url().includes('ai-digital-shop-group')
    })

    // 7.2 自媒体 CTA → /market/projects?slug=ai-self-media-group
    await pagePC.goto(`${BASE}/mindset`, { waitUntil: 'networkidle' })
    const flowCta = pagePC.locator('#flow-engine a:has-text("前往 AI 自媒体 SOP")').first()
    await flowCta.scrollIntoViewIfNeeded()
    await Promise.all([
      pagePC.waitForURL('**/market/projects**', { timeout: 8000 }).catch(() => null),
      flowCta.click(),
    ])
    await pagePC.waitForTimeout(1500)
    await pagePC.screenshot({ path: path.join(SCREEN_DIR, 'mindset-flow-cta-landing.png'), fullPage: false })
    await check('Navigation · 自媒体 CTA 跳到 /market/projects?slug=ai-self-media-group', async () => {
      return pagePC.url().includes('/market/projects') && pagePC.url().includes('ai-self-media-group')
    })

    // 7.3 底部 CTA 1 → /diagnosis
    await pagePC.goto(`${BASE}/mindset`, { waitUntil: 'networkidle' })
    const bottomCta1 = pagePC.locator('a:has-text("我选 AI 店群，立马实操")').first()
    await bottomCta1.scrollIntoViewIfNeeded()
    await Promise.all([
      pagePC.waitForURL('**/diagnosis', { timeout: 8000 }).catch(() => null),
      bottomCta1.click(),
    ])
    await pagePC.waitForTimeout(1500)
    await check('Navigation · 底部店群按钮跳到 /diagnosis', async () => {
      return pagePC.url().includes('/diagnosis')
    })

    // 7.4 底部 CTA 2 → /diagnosis
    await pagePC.goto(`${BASE}/mindset`, { waitUntil: 'networkidle' })
    const bottomCta2 = pagePC.locator('a:has-text("我选 AI 自媒体，立马实操")').first()
    await bottomCta2.scrollIntoViewIfNeeded()
    await Promise.all([
      pagePC.waitForURL('**/diagnosis', { timeout: 8000 }).catch(() => null),
      bottomCta2.click(),
    ])
    await pagePC.waitForTimeout(1500)
    await check('Navigation · 底部自媒体按钮跳到 /diagnosis', async () => {
      return pagePC.url().includes('/diagnosis')
    })

    await ctxPC.close()

    // ─────── 移动端 (390px) ───────
    const ctxM = await browser.newContext({ viewport: { width: 390, height: 800 } })
    const pageM = await ctxM.newPage()

    console.log('\n[Mobile] 移动端 390px 单列布局')
    await pageM.goto(`${BASE}/mindset`, { waitUntil: 'networkidle' })
    await pageM.waitForTimeout(800)
    await pageM.screenshot({ path: path.join(SCREEN_DIR, 'mindset-dual-engine-mobile.png'), fullPage: true })

    await check('Mobile · 页面正常加载', async () => {
      const t = await pageM.textContent('body')
      return t.includes('OPC 双引擎智富思维')
    })

    await check('Mobile · 横向滚动容器可滑动（无水平溢出）', async () => {
      const overflow = await pageM.evaluate(() => {
        return document.documentElement.scrollWidth - document.documentElement.clientWidth
      })
      // 允许最多 8px 误差（防止 1px 边框等）
      return overflow <= 8
    })

    // 检查 Bento 在移动端堆叠为单列
    await check('Mobile · Trader/Flow 双列堆叠为单列', async () => {
      // 找到包含 #trader-engine 和 #flow-engine 的父 grid
      const positions = await pageM.evaluate(() => {
        const t = document.getElementById('trader-engine')
        const f = document.getElementById('flow-engine')
        if (!t || !f) return null
        return { tTop: t.getBoundingClientRect().top, fTop: f.getBoundingClientRect().top }
      })
      if (!positions) return false
      // flow 应该在 trader 下方（top 更大）
      return positions.fTop > positions.tTop
    })

    await ctxM.close()
  } finally {
    await browser.close()
  }

  // ─────────── 结果汇总 ───────────
  console.log('\n' + '═'.repeat(60))
  const pass = results.filter((r) => r.status === 'PASS').length
  const fail = results.filter((r) => r.status !== 'PASS').length
  console.log(`📊 测试结果: ${pass} 通过 / ${fail} 失败 / ${results.length} 总计`)
  console.log('═'.repeat(60))

  if (fail > 0) {
    console.log('\n失败项:')
    results
      .filter((r) => r.status !== 'PASS')
      .forEach((r) => console.log(`  ✗ ${r.label}${r.error ? ' (' + r.error + ')' : ''}`))
    process.exit(1)
  } else {
    console.log('\n✅ 全部测试通过！')
  }
})()
