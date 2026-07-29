// 使用有头模式 + 全面错误捕获 + 模拟用户实际操作
const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    headless: false,  // 有头模式才能看到错误弹窗
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'zh-CN',
  });
  const page = await ctx.newPage();

  const allIssues = [];
  const networkErrors = [];

  // 全量监听 console
  page.on('console', (msg) => {
    allIssues.push({
      type: 'console.' + msg.type(),
      text: msg.text().substring(0, 1000),
      location: msg.location(),
    });
  });

  // 监听 pageerror
  page.on('pageerror', (err) => {
    allIssues.push({
      type: 'pageerror',
      text: err.message.substring(0, 1000),
      stack: err.stack ? err.stack.substring(0, 1500) : '',
    });
  });

  // 监听网络 4xx / 5xx
  page.on('response', async (resp) => {
    if (resp.status() >= 400) {
      networkErrors.push({
        url: resp.url(),
        status: resp.status(),
        method: resp.request().method(),
      });
    }
  });

  console.log('=== 步骤 1: 打开首页 ===');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // 抓取 Next.js 错误徽章
  const errBadge = await page.evaluate(() => {
    // 找带 "errors" 字样的红色徽章
    const candidates = Array.from(document.querySelectorAll('button, [role="button"], a'));
    for (const el of candidates) {
      const t = (el.textContent || '').trim();
      if (/^\d+\s*errors?$/i.test(t)) {
        return { found: true, text: t, html: el.outerHTML.substring(0, 500) };
      }
    }
    // 也找 [data-nextjs-toast]
    const toast = document.querySelector('[data-nextjs-toast]');
    if (toast) {
      return { found: true, text: toast.textContent, html: toast.outerHTML.substring(0, 500) };
    }
    return { found: false };
  });
  console.log('错误徽章:', JSON.stringify(errBadge));

  // 如果找到了错误徽章，点击展开
  if (errBadge.found) {
    const btn = await page.locator(`text=/^\\d+\\s*errors?$/i`).first();
    if (await btn.count() > 0) {
      await btn.click();
      await page.waitForTimeout(2000);
    }
  }

  // 抓取 Next.js 错误弹窗
  const errorOverlay = await page.evaluate(() => {
    const dialogs = document.querySelectorAll('[data-nextjs-dialog-overlay], [data-nextjs-dialog], nextjs-portal');
    const errors = [];
    for (const d of dialogs) {
      errors.push({
        type: d.tagName,
        html: d.outerHTML.substring(0, 3000),
      });
    }
    return errors;
  });
  console.log('错误弹窗数量:', errorOverlay.length);
  if (errorOverlay.length > 0) {
    console.log('错误弹窗内容:');
    errorOverlay.forEach((e, i) => {
      console.log(`  [${i}] ${e.type}: ${e.html.substring(0, 1500)}`);
    });
  }

  // 步骤 2: 设置 localStorage 模拟已诊断
  console.log('=== 步骤 2: 设置 localStorage ===');
  await page.evaluate(() => {
    localStorage.setItem('opc_device_id', 'test-final-' + Date.now());
    localStorage.setItem('opc_level', 'FLOW');
    localStorage.setItem('learning_score', '50');
  });

  console.log('=== 步骤 3: 刷新首页 ===');
  await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // 抓取错误徽章
  const errBadge2 = await page.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll('button, [role="button"], a'));
    for (const el of candidates) {
      const t = (el.textContent || '').trim();
      if (/^\d+\s*errors?$/i.test(t)) {
        return { found: true, text: t, html: el.outerHTML.substring(0, 500) };
      }
    }
    return { found: false };
  });
  console.log('刷新后错误徽章:', JSON.stringify(errBadge2));

  // 步骤 4: 访问 /member
  console.log('=== 步骤 4: 访问 /member ===');
  await page.goto('http://localhost:3001/member', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);

  // 截屏
  const screenPath = path.join(os.tmpdir(), 'final-screenshot.png');
  await page.screenshot({ path: screenPath, fullPage: false });
  console.log('截屏:', screenPath);

  // 报告
  console.log('');
  console.log('══════════════════════════════════════');
  console.log('  错误统计');
  console.log('══════════════════════════════════════');
  console.log('页面错误 (pageerror):', allIssues.filter(i => i.type === 'pageerror').length);
  console.log('console.error:', allIssues.filter(i => i.type === 'console.error').length);
  console.log('console.warn:', allIssues.filter(i => i.type === 'console.warning').length);
  console.log('网络 4xx/5xx:', networkErrors.length);
  console.log('');
  console.log('=== 详细错误列表 ===');
  allIssues.forEach((iss, i) => {
    console.log(`\n[${i + 1}] ${iss.type}`);
    console.log('  文本:', iss.text.substring(0, 600));
    if (iss.location) console.log('  位置:', JSON.stringify(iss.location));
    if (iss.stack) console.log('  Stack:', iss.stack.substring(0, 400));
  });

  // 写入 JSON 报告
  const reportPath = path.join(os.tmpdir(), 'final-errors-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    errorBadgeAfterHomeLoad: errBadge,
    errorOverlay,
    errorBadgeAfterReload: errBadge2,
    allIssues,
    networkErrors,
  }, null, 2), 'utf8');
  console.log('\n报告:', reportPath);

  await browser.close();
})();
