// 用户视口视角：滚动到紫色横幅，看下方到底有多少空白
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.goto('http://localhost:3001/market/resources', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // 滚动到紫色横幅底部
  await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    for (const el of elements) {
      if ((el.textContent || '').includes('你是 OPC 生态成员？点击这里')) {
        el.scrollIntoView({ block: 'start', behavior: 'instant' });
        break;
      }
    }
  });
  await page.waitForTimeout(1000);

  // 截屏（视口视角）
  await page.screenshot({ path: 'C:\\Users\\lujie\\AppData\\Local\\Temp\\resources-viewport.png', fullPage: false });
  console.log('截图: C:\\Users\\lujie\\AppData\\Local\\Temp\\resources-viewport.png');

  // 测视口视角下紫色横幅和绿色 section 间距
  const purple = await page.locator('text=你是 OPC 生态成员？点击这里').first().boundingBox();
  console.log(`视口内紫色横幅: y=${purple?.y.toFixed(0)} h=${purple?.h.toFixed(0)}`);

  const green = await page.locator('text=OPC 内部供需广场').first().boundingBox();
  console.log(`视口内绿色 section: y=${green?.y.toFixed(0)} h=${green?.h.toFixed(0)}`);

  if (purple && green) {
    const gap = green.y - (purple.y + purple.height);
    console.log(`视口间距: ${gap.toFixed(0)}px`);
  }

  await browser.close();
})();
