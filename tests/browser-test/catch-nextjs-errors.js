// 抓取 Next.js dev mode 错误弹窗的真实内容
const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'zh-CN',
  });
  const page = await ctx.newPage();

  // 监听 console
  const allConsole = [];
  page.on('console', (msg) => {
    allConsole.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', (err) => {
    allConsole.push({ type: 'pageerror', text: err.message, stack: err.stack });
  });

  // 1. 访问首页
  console.log('=== 访问首页 ===');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // 2. 抓取 Next.js 错误弹窗
  console.log('=== 抓取错误弹窗 ===');
  const errBadge = await page.evaluate(() => {
    // Next.js dev 模式的错误指示器：左下角红色 "N errors" 按钮
    const errBtn = document.querySelector('[data-nextjs-toast]') || 
                   document.querySelector('button[class*="error"]') ||
                   Array.from(document.querySelectorAll('button')).find(b => 
                     (b.textContent || '').match(/^\d+\s*errors?\s*$/i)
                   );
    if (errBtn) {
      return { found: true, text: errBtn.textContent };
    }
    return { found: false };
  });
  console.log('错误徽章:', JSON.stringify(errBadge));

  // 3. 点击错误徽章展开错误详情
  const errBtns = await page.locator('button').filter({ hasText: /^\d+\s*errors?$/ }).all();
  if (errBtns.length > 0) {
    console.log(`找到 ${errBtns.length} 个错误按钮，点击展开详情`);
    await errBtns[0].click();
    await page.waitForTimeout(2000);
  }

  // 4. 截屏错误详情
  const screenPath = path.join(os.tmpdir(), 'nextjs-errors.png');
  await page.screenshot({ path: screenPath, fullPage: true });
  console.log('错误详情截屏:', screenPath);

  // 5. 抓取所有错误文本
  const errorTexts = await page.evaluate(() => {
    // Next.js 错误面板的内容
    const panels = document.querySelectorAll('[data-nextjs-dialog], [data-nextjs-errors], .nextjs-error-overlay, [class*="nextjs"]');
    const texts = [];
    panels.forEach(p => {
      texts.push({ tag: p.tagName, class: p.className.toString().substring(0, 200), text: p.textContent.substring(0, 1500) });
    });
    // 也获取 body 中所有错误相关的内容
    return texts;
  });
  console.log('错误面板:', JSON.stringify(errorTexts, null, 2));

  // 6. 完整 console 输出
  console.log('=== Console 完整日志 ===');
  allConsole.forEach((c, i) => {
    if (c.type === 'error' || c.type === 'pageerror' || c.type === 'warning' || c.text.includes('error') || c.text.includes('Error')) {
      console.log(`[${i}] ${c.type}: ${c.text.substring(0, 500)}`);
    }
  });

  // 7. 写入完整报告
  const reportPath = path.join(os.tmpdir(), 'nextjs-errors-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    errorBadge: errBadge,
    errorPanels: errorTexts,
    allConsole: allConsole,
    screenshot: screenPath,
  }, null, 2), 'utf8');
  console.log('报告:', reportPath);

  await browser.close();
})();
