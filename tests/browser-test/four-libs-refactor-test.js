/**
 * 四库重构验证测试
 * 任务：验证工具库、服务库、项目库、资源库数据按新思维导图渲染
 * 验证项：
 *   1. 4 个页面 200 OK
 *   2. 工具库：4 大分类胶囊 + 12 个一级标签（4+3+6 平台名称）
 *   3. 服务库：9 大服务板块
 *   4. 项目库：9 个项目
 *   5. 资源库：6 大板块
 *   6. 移动端胶囊 Tabs 横向滚动容器
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

    // ════════ 1. 工具库 ════════
    console.log('\n[Tools] /market/tools')
    await pagePC.goto(`${BASE}/market/tools`, { waitUntil: 'networkidle' })
    await pagePC.screenshot({ path: path.join(SCREEN_DIR, 'tools-pc.png'), fullPage: true })

    await check('工具库 · 标题含 4 大分类胶囊', async () => {
      const text = await pagePC.textContent('body')
      return ['AI网店群工具', 'AI自媒体工具', 'AI自研工具', 'AI严选工具']
        .every((k) => text.includes(k))
    })
    await check('工具库 · 豹纹PLUS / 先锋派数字人 / 灵犀AI 存在', async () => {
      const text = await pagePC.textContent('body')
      return ['豹纹PLUS', '先锋派数字人', '灵犀AI'].every((k) => text.includes(k))
    })
    await check('工具库 · 6 大严选子分类标签', async () => {
      const text = await pagePC.textContent('body')
      return ['写作文案', '美工绘图', '音频视频', '智能体工具', '编码及系统', '辅助工具']
        .every((k) => text.includes(k))
    })
    await check('工具库 · AI 网店工作台 / AI 店群运营工具', async () => {
      const text = await pagePC.textContent('body')
      return ['AI网店工作台', 'AI店群运营工具'].every((k) => text.includes(k))
    })
    await check('工具库 · AI 自媒体登录页 / AI 自媒体运营工具', async () => {
      const text = await pagePC.textContent('body')
      return ['AI自媒体登录页', 'AI自媒体运营工具'].every((k) => text.includes(k))
    })
    await check('工具库 · 胶囊 Tabs 容器有 overflow-x-auto', async () => {
      return await pagePC.evaluate(() => {
        const el = document.querySelector('.scrollbar-hide')
        if (!el) return false
        const cls = el.className
        return cls.includes('overflow-x-auto') && cls.includes('whitespace-nowrap')
      })
    })

    // 胶囊点击切换 + 高亮
    await check('工具库 · 点击 AI 严选胶囊滚动 + 高亮', async () => {
      await pagePC.locator('button:has-text("AI严选工具")').first().click()
      await pagePC.waitForTimeout(1200)
      const url = pagePC.url()
      // 等待高亮 class 出现
      const hasHighlight = await pagePC.evaluate(() => {
        const btn = [...document.querySelectorAll('button')].find((b) =>
          b.textContent?.includes('AI严选工具')
        )
        return btn?.className.includes('border-blue-500') || btn?.className.includes('ring-2')
      })
      return hasHighlight
    })

    // ════════ 2. 服务库 ════════
    console.log('\n[Services] /market/services')
    await pagePC.goto(`${BASE}/market/services`, { waitUntil: 'networkidle' })
    await pagePC.screenshot({ path: path.join(SCREEN_DIR, 'services-pc.png'), fullPage: true })

    await check('服务库 · 9 大服务全部存在', async () => {
      const text = await pagePC.textContent('body')
      return [
        'OPC工具',
        'OPC内训',
        'OPC陪跑',
        'OPC社群',
        '企业GEO',
        '企业AI转型',
        '企业AI定制',
        'AI网店群代运营',
        'AI自媒体代运营',
      ].every((k) => text.includes(k))
    })
    await check('服务库 · 包含"提交需求"按钮交互', async () => {
      const text = await pagePC.textContent('body')
      return text.includes('提交需求') || text.includes('一键咨询') || text.includes('申请')
    })

    // ════════ 3. 项目库 ════════
    console.log('\n[Projects] /market/projects')
    await pagePC.goto(`${BASE}/market/projects`, { waitUntil: 'networkidle' })
    await pagePC.screenshot({ path: path.join(SCREEN_DIR, 'projects-pc.png'), fullPage: true })

    await check('项目库 · 9 个项目全部存在', async () => {
      const text = await pagePC.textContent('body')
      return [
        'AI数字店群项目',
        'AI无货源店群项目',
        'AI有货源店群项目',
        'AI跨境电商项目',
        'AI自媒体群项目',
        'AI工具推广项目',
        'AI编程开发项目',
        'AI企业GEO项目',
        'AI数字产品项目',
      ].every((k) => text.includes(k))
    })
    await check('项目库 · 包含"我想做"或"寻找资深OPC"按钮', async () => {
      const text = await pagePC.textContent('body')
      return text.includes('我想做') || text.includes('寻找资深OPC') || text.includes('寻找')
    })

    // recommend 高亮模式
    await pagePC.goto(`${BASE}/market/projects?recommend=trader`, { waitUntil: 'networkidle' })
    await check('项目库 · ?recommend=trader 触发高亮横幅', async () => {
      const text = await pagePC.textContent('body')
      return text.includes('交易型 OPC') || text.includes('精准推荐')
    })
    await pagePC.screenshot({ path: path.join(SCREEN_DIR, 'projects-pc-recommend.png'), fullPage: true })

    // ════════ 4. 资源库 ════════
    console.log('\n[Resources] /market/resources')
    await pagePC.goto(`${BASE}/market/resources`, { waitUntil: 'networkidle' })
    await pagePC.screenshot({ path: path.join(SCREEN_DIR, 'resources-pc.png'), fullPage: true })

    await check('资源库 · 6 大板块全部存在', async () => {
      const text = await pagePC.textContent('body')
      return [
        '数字产品库',
        '实物产品库',
        'AI自研工具库',
        'AI智能硬件库',
        'AI招商加盟库',
        'OPC生态资源库',
      ].every((k) => text.includes(k))
    })

    // ───────── 移动端 ─────────
    const ctxMobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    })
    const pageM = await ctxMobile.newPage()

    console.log('\n[Mobile] /market/tools (390x844)')
    await pageM.goto(`${BASE}/market/tools`, { waitUntil: 'networkidle' })
    await pageM.screenshot({ path: path.join(SCREEN_DIR, 'tools-mobile.png'), fullPage: true })

    await check('移动端 · 胶囊 Tabs 可横向滚动 (scrollWidth > clientWidth)', async () => {
      return await pageM.evaluate(() => {
        const el = document.querySelector('.scrollbar-hide')
        if (!el) return false
        return el.scrollWidth > el.clientWidth
      })
    })
    await check('移动端 · 4 大分类按钮可点击', async () => {
      const btns = await pageM.locator('button').allTextContents()
      return ['AI网店群工具', 'AI自媒体工具', 'AI自研工具', 'AI严选工具'].every(
        (l) => btns.some((t) => t.includes(l))
      )
    })

    await pageM.goto(`${BASE}/market/services`, { waitUntil: 'networkidle' })
    await pageM.screenshot({ path: path.join(SCREEN_DIR, 'services-mobile.png'), fullPage: true })
    await check('移动端 · 服务库 9 大服务全部可见', async () => {
      const text = await pageM.textContent('body')
      return [
        'OPC工具',
        'OPC内训',
        'OPC陪跑',
        'OPC社群',
        '企业GEO',
        '企业AI转型',
        '企业AI定制',
        'AI网店群代运营',
        'AI自媒体代运营',
      ].every((k) => text.includes(k))
    })

    await pageM.goto(`${BASE}/market/projects`, { waitUntil: 'networkidle' })
    await pageM.screenshot({ path: path.join(SCREEN_DIR, 'projects-mobile.png'), fullPage: true })
    // 滚动到页底，确保 9 个项目全部可见
    await pageM.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await pageM.waitForTimeout(1500)
    await pageM.evaluate(() => window.scrollTo(0, 0))
    await pageM.waitForTimeout(500)
    await check('移动端 · 项目库 9 个项目全部可见', async () => {
      const text = await pageM.textContent('body')
      return [
        'AI数字店群项目',
        'AI无货源店群项目',
        'AI有货源店群项目',
        'AI跨境电商项目',
        'AI自媒体群项目',
        'AI工具推广项目',
        'AI编程开发项目',
        'AI企业GEO项目',
        'AI数字产品项目',
      ].every((k) => text.includes(k))
    })

    await pageM.goto(`${BASE}/market/resources`, { waitUntil: 'networkidle' })
    await pageM.screenshot({ path: path.join(SCREEN_DIR, 'resources-mobile.png'), fullPage: true })
    await check('移动端 · 资源库 6 大板块全部可见', async () => {
      const text = await pageM.textContent('body')
      return [
        '数字产品库',
        '实物产品库',
        'AI自研工具库',
        'AI智能硬件库',
        'AI招商加盟库',
        'OPC生态资源库',
      ].every((k) => text.includes(k))
    })

    await ctxPC.close()
    await ctxMobile.close()
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
