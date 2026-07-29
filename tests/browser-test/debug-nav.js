// Quick debug: check what's actually in the DOM
const { chromium } = require('playwright')

;(async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()

  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)

  // Print all data-testid values
  const testIds = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[data-testid]')).map(el => el.getAttribute('data-testid'))
  })
  console.log('All data-testid values on page:')
  testIds.forEach(t => console.log(' -', t))

  // Check specific test IDs
  for (const id of ['nav-mindset', 'nav-login', 'nav-signup', 'avatar-button', 'workspace-link', 'workspace-pulse', 'avatar-menu-wrapper', 'avatar-dropdown']) {
    const c = await page.locator(`[data-testid="${id}"]`).count()
    console.log(`[${id}]: count = ${c}`)
  }

  await browser.close()
})()
