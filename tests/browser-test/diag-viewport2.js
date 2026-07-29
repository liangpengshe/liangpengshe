// 简化版：滚动到紫色横幅截图（视口）
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.goto('http://localhost:3001/market/resources', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // 滚动到紫色 OPC 生态成员横幅附近
  await page.evaluate(() => {
    const all = [...document.querySelectorAll('*')];
    const target = all.find((el) => (el.textContent || '').includes('你是 OPC 生态成员？点击这里'));
    if (target) {
      const r = target.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + r.top - 50);
    }
  });
  await page.waitForTimeout(800);

  await page.screenshot({ path: 'C:\\Users\\lujie\\AppData\\Local\\Temp\\resources-viewport2.png', fullPage: false });
  console.log('OK 截图保存');

  await browser.close();
})();
