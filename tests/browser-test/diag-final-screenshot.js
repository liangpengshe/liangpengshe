// 最终验证：详细 debug
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:3001/market/resources', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  // fullPage 截图存档
  await page.screenshot({ path: 'C:\\Users\\lujie\\AppData\\Local\\Temp\\resources-final-full.png', fullPage: true });
  console.log('OK 截图');
  await browser.close();
})();
