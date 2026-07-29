// 深度诊断：紫色 OPC 生态成员横幅 DOM 位置
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1200 } });
  const page = await ctx.newPage();

  await page.goto('http://localhost:3001/market/resources', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // 1. 找所有 "OPC 生态成员" 相关元素
  const matches = await page.evaluate(() => {
    const all = document.querySelectorAll('*');
    const results = [];
    for (const el of all) {
      const text = el.textContent || '';
      if (text.includes('OPC 生态成员') && text.length < 200) {
        const r = el.getBoundingClientRect();
        results.push({
          tag: el.tagName,
          cls: (el.className || '').slice(0, 80),
          text: text.slice(0, 60),
          y: r.y, h: r.height,
          bg: getComputedStyle(el).background.slice(0, 50)
        });
      }
    }
    return results;
  });
  console.log('OPC 生态成员相关元素:');
  for (const m of matches) {
    console.log(`  <${m.tag}> y=${m.y.toFixed(0)} h=${m.h.toFixed(0)} bg=${m.bg}`);
    console.log(`    text: "${m.text}"`);
  }

  // 2. 找所有 .from-blue-600.via-indigo-600 紫色 div
  const purpleDivs = await page.locator('div.bg-gradient-to-r.from-blue-600.via-indigo-600').all();
  console.log(`\n紫色 div 数: ${purpleDivs.length}`);
  for (let i = 0; i < purpleDivs.length; i++) {
    const box = await purpleDivs[i].boundingBox();
    const text = (await purpleDivs[i].textContent())?.slice(0, 40);
    console.log(`  [${i}] y=${box?.y.toFixed(0)} h=${box?.h.toFixed(0)} "${text}"`);
  }

  // 3. 找绿色 section（OPC 内部供需广场）
  const greenBox = await page.locator('text=OPC 内部供需广场').first().locator('..').locator('..').boundingBox();
  console.log(`\n绿色 section: y=${greenBox?.y.toFixed(0)} h=${greenBox?.h.toFixed(0)}`);

  await browser.close();
})();
