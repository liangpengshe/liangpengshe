// 精确测量紫色 OPC 生态成员横幅底部到绿色 OPC 内部供需广场 section 顶部的距离
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:3001/market/resources', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const result = await page.evaluate(() => {
    // 1. 找紫色 OPC 生态成员横幅（"你是 OPC 生态成员？点击这里"）
    const all = [...document.querySelectorAll('*')];
    const purpleHeading = all.find((el) => (el.textContent || '').trim() === '你是 OPC 生态成员？点击这里分享你的资源');
    if (!purpleHeading) return { err: 'no purple heading' };
    const purpleBanner = purpleHeading.closest('div.bg-gradient-to-r') || purpleHeading.parentElement?.parentElement?.parentElement;
    const pr = purpleBanner.getBoundingClientRect();

    // 2. 找绿色 OPC 内部供需广场 section（包含"进入供需广场"按钮）
    const greenHeading = all.find((el) => (el.textContent || '').trim() === 'OPC 内部供需广场');
    if (!greenHeading) return { err: 'no green heading' };
    const greenSection = greenHeading.closest('section') || greenHeading.parentElement?.parentElement;
    const gr = greenSection.getBoundingClientRect();

    return {
      purpleY: pr.top + window.scrollY,
      purpleH: pr.height,
      purpleBottom: pr.bottom + window.scrollY,
      greenY: gr.top + window.scrollY,
      greenH: gr.height,
      gap: (gr.top + window.scrollY) - (pr.bottom + window.scrollY),
      scrollY: window.scrollY,
    };
  });
  console.log(JSON.stringify(result, null, 2));

  await browser.close();
})();
