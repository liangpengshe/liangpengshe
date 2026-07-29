// 深挖 114px 间距来源
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:3001/market/resources', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const result = await page.evaluate(() => {
    const all = [...document.querySelectorAll('*')];
    const purple = all.find((el) => (el.textContent || '').trim() === '你是 OPC 生态成员？点击这里分享你的资源')?.closest('div.bg-gradient-to-r');
    const green = all.find((el) => (el.textContent || '').trim() === 'OPC 内部供需广场')?.closest('section');

    // 找紫色横幅的父链
    const purplePath = [];
    let p = purple;
    while (p && p !== document.body) {
      const r = p.getBoundingClientRect();
      const cs = getComputedStyle(p);
      purplePath.push({
        tag: p.tagName,
        cls: (p.className || '').slice(0, 60),
        mt: cs.marginTop, mb: cs.marginBottom, pt: cs.paddingTop, pb: cs.paddingBottom,
        h: r.height.toFixed(0)
      });
      p = p.parentElement;
    }
    return { purplePath: purplePath.slice(0, 8) };
  });
  console.log(JSON.stringify(result, null, 2));

  await browser.close();
})();
