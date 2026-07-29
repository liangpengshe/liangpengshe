/**
 * OPC 智富思维页验证测试
 * 任务：验证 /mindset 页面内容 + 导航入口 + 底部 CTA
 * 验证项：
 *   1. 顶部导航含"智富思维"菜单（PC 端）
 *   2. 移动端汉堡菜单含"智富思维"入口
 *   3. /mindset 页面 6 大模块 + Hero + 终极心法 + 避坑 + CTA
 *   4. 底部 CTA 跳 /diagnosis
 *   5. 移动端 (390px) 单列布局无挤压
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

    // ════════ 1. 顶部导航含"智富思维" ════════
    console.log('\n[Nav] 顶部导航 + /mindset 内容')
    await pagePC.goto(`${BASE}/`, { waitUntil: 'networkidle' })
    await pagePC.screenshot({ path: path.join(SCREEN_DIR, 'home-with-mindset-nav.png'), fullPage: false })

    await check('PC 端 · 顶部导航含"智富思维"菜单', async () => {
      const text = await pagePC.textContent('body')
      return text.includes('智富思维')
    })
    await check('PC 端 · "智富思维"链接 href=/mindset', async () => {
      const href = await pagePC.getAttribute('[data-testid="nav-mindset"]', 'href')
      return href === '/mindset'
    })

    // ════════ 2. /mindset 页面内容 ════════
    console.log('\n[Mindset] /mindset 内容检查')
    await pagePC.goto(`${BASE}/mindset`, { waitUntil: 'networkidle' })
    await pagePC.screenshot({ path: path.join(SCREEN_DIR, 'mindset-pc.png'), fullPage: true })

    await check('页面 · Hero 标题存在', async () => {
      const text = await pagePC.textContent('body')
      return text.includes('🧠 OPC 智富思维') && text.includes('交易型创业心法')
    })
    await check('页面 · 副标题：用 AI 武装自己 · 韭菜 → 镰刀', async () => {
      const text = await pagePC.textContent('body')
      return text.includes('AI 武装自己') && text.includes('韭菜') && text.includes('镰刀')
    })
    await check('页面 · 4 大变现路径胶囊', async () => {
      const text = await pagePC.textContent('body')
      return ['智能体销售', '知识付费', '直播带货', '线索引流'].every((k) => text.includes(k))
    })

    await check('页面 · 6 大模块全部存在', async () => {
      const text = await pagePC.textContent('body')
      return [
        '什么是 AI 数字产品',
        '为什么从',
        '虚拟电商',
        'AI 时代网店还能做吗',
        '操盘四大核心优势',
        '对标与复制的核心心法',
        '新手启动的避坑指南',
      ].every((k) => text.includes(k))
    })

    await check('页面 · MODULE 01-06 标签全部存在', async () => {
      // React 渲染的 HTML 中数字可能被 <!-- --> 分割，但 textContent 不会
      const text = await pagePC.textContent('body')
      return ['MODULE 01', 'MODULE 02', 'MODULE 03', 'MODULE 04', 'MODULE 05', 'MODULE 06'].every(
        (k) => text.includes(k)
      )
    })

    await check('页面 · 关键文案：3000 元 / 拒绝加盟 / 拒绝分润', async () => {
      const text = await pagePC.textContent('body')
      return ['3000 元', '拒绝加盟', '拒绝分润'].every((k) => text.includes(k))
    })

    await check('页面 · 终极心法三条', async () => {
      const text = await pagePC.textContent('body')
      return ['终极心法', '数字网店', '课程与高客单', '对标与复制'].every((k) => text.includes(k))
    })

    await check('页面 · 避坑三连', async () => {
      const text = await pagePC.textContent('body')
      return ['避坑三连'].some((k) => text.includes(k))
    })

    await check('页面 · 底部 CTA："前往 AI 诊断咨询" + 心法已懂', async () => {
      const text = await pagePC.textContent('body')
      return text.includes('前往 AI 诊断咨询') && text.includes('心法已懂')
    })

    await check('页面 · 副 CTA："先看 AI 数字网店项目"', async () => {
      const text = await pagePC.textContent('body')
      return text.includes('先看 AI 数字网店项目')
    })

    // CTA 跳转测试
    await check('底部 CTA · 点击"前往 AI 诊断咨询"跳 /diagnosis', async () => {
      const cta = pagePC.locator('a:has-text("前往 AI 诊断咨询")').first()
      await cta.scrollIntoViewIfNeeded()
      await Promise.all([
        pagePC.waitForURL('**/diagnosis', { timeout: 8000 }).catch(() => null),
        cta.click(),
      ])
      await pagePC.waitForTimeout(1500)
      return pagePC.url().includes('/diagnosis')
    })

    // 返回 /mindset 测试副 CTA
    await pagePC.goto(`${BASE}/mindset`, { waitUntil: 'networkidle' })
    await check('副 CTA · 点击"先看 AI 数字网店项目"跳 /market/projects', async () => {
      const cta = pagePC.locator('a:has-text("先看 AI 数字网店项目")').first()
      await cta.scrollIntoViewIfNeeded()
      await Promise.all([
        pagePC.waitForURL('**/market/projects', { timeout: 8000 }).catch(() => null),
        cta.click(),
      ])
      await pagePC.waitForTimeout(1500)
      return pagePC.url().includes('/market/projects')
    })

    // ════════ 3. 移动端汉堡菜单 ════════
    console.log('\n[Mobile] 汉堡菜单 + /mindset')
    const ctxM = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    })
    const pageM = await ctxM.newPage()
    await pageM.goto(`${BASE}/`, { waitUntil: 'networkidle' })

    await check('移动端 · 汉堡菜单含"智富思维"入口', async () => {
      // 点开汉堡
      await pageM.locator('button[aria-label="打开菜单"]').click()
      await pageM.waitForTimeout(500)
      await pageM.screenshot({ path: path.join(SCREEN_DIR, 'mobile-hamburger-mindset.png'), fullPage: false })
      const text = await pageM.textContent('body')
      return text.includes('智富思维')
    })

    // 关掉汉堡，跳转到 /mindset
    await pageM.goto(`${BASE}/mindset`, { waitUntil: 'networkidle' })
    await pageM.screenshot({ path: path.join(SCREEN_DIR, 'mindset-mobile.png'), fullPage: true })

    await check('移动端 · /mindset 页面 6 模块可见', async () => {
      const text = await pageM.textContent('body')
      return [
        '什么是 AI 数字产品',
        '为什么从',
        'AI 时代网店还能做吗',
        '操盘四大核心优势',
        '对标与复制',
        '新手启动的避坑指南',
      ].every((k) => text.includes(k))
    })

    await check('移动端 · /mindset 底部 CTA 可见', async () => {
      // 滚动到底部
      await pageM.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await pageM.waitForTimeout(800)
      const text = await pageM.textContent('body')
      return text.includes('前往 AI 诊断咨询')
    })

    await check('移动端 · 卡片单列布局（无水平滚动）', async () => {
      return await pageM.evaluate(() => {
        // 如果页面有水平滚动条（document width > viewport width），说明布局错位
        return document.documentElement.scrollWidth <= window.innerWidth + 2
      })
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
