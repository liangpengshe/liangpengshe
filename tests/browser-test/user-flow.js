// 真实模拟用户操作流程：首页 → STEP 02 → /guide/flow
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

  const allIssues = [];
  const networkErrors = [];

  page.on('console', (msg) => {
    allIssues.push({
      type: 'console.' + msg.type(),
      text: msg.text().substring(0, 800),
      url: page.url(),
    });
  });
  page.on('pageerror', (err) => {
    allIssues.push({
      type: 'pageerror',
      text: err.message.substring(0, 800),
      stack: err.stack ? err.stack.substring(0, 1000) : '',
      url: page.url(),
    });
  });
  page.on('response', (resp) => {
    if (resp.status() >= 400) {
      networkErrors.push({ url: resp.url(), status: resp.status() });
    }
  });

  console.log('=== 步骤 1: 打开首页 ===');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // 截图 1
  await page.screenshot({ path: path.join(os.tmpdir(), 'user-flow-1-home.png'), fullPage: false });

  console.log('=== 步骤 2: 设置已诊断状态 ===');
  await page.evaluate(() => {
    localStorage.setItem('opc_device_id', 'test-flow-' + Date.now());
    localStorage.setItem('opc_level', 'FLOW');
    localStorage.setItem('learning_score', '0');
  });

  console.log('=== 步骤 3: 刷新首页 ===');
  await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // 截图 2
  await page.screenshot({ path: path.join(os.tmpdir(), 'user-flow-2-home-after-set.png'), fullPage: false });

  // 抓取错误徽章
  const errBadge = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('button, a, [role="button"]'));
    for (const el of all) {
      const t = (el.textContent || '').trim();
      if (/^\d+\s*errors?$/i.test(t)) {
        return { found: true, text: t };
      }
    }
    return { found: false };
  });
  console.log('首页错误徽章:', JSON.stringify(errBadge));

  console.log('=== 步骤 4: 访问 /guide/flow ===');
  await page.goto('http://localhost:3001/guide/flow', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);

  // 截图 3
  await page.screenshot({ path: path.join(os.tmpdir(), 'user-flow-3-guide.png'), fullPage: false });

  // 抓取 /guide/flow 错误徽章
  const errBadge2 = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('button, a, [role="button"]'));
    for (const el of all) {
      const t = (el.textContent || '').trim();
      if (/^\d+\s*errors?$/i.test(t)) {
        return { found: true, text: t };
      }
    }
    return { found: false };
  });
  console.log('/guide/flow 错误徽章:', JSON.stringify(errBadge2));

  // 如果有错误徽章，点击展开
  if (errBadge2.found) {
    const btn = await page.locator('text=/^\\d+\\s*errors?$/i').first();
    if (await btn.count() > 0) {
      console.log('点击错误徽章展开详情...');
      await btn.click();
      await page.waitForTimeout(2000);
    }
  }

  // 抓取弹窗内容
  const errorOverlay = await page.evaluate(() => {
    const overlays = document.querySelectorAll('nextjs-portal, [data-nextjs-dialog-overlay], [data-nextjs-toast]');
    return Array.from(overlays).map(o => ({
      tag: o.tagName,
      text: o.textContent.substring(0, 1500),
      html: o.outerHTML.substring(0, 2500),
    }));
  });
  console.log('错误弹窗数量:', errorOverlay.length);

  // 截屏错误展开状态
  await page.screenshot({ path: path.join(os.tmpdir(), 'user-flow-4-errors-expanded.png'), fullPage: false });

  console.log('');
  console.log('══════════════════════════════════════');
  console.log('  错误统计');
  console.log('══════════════════════════════════════');
  console.log('pageerror:', allIssues.filter(i => i.type === 'pageerror').length);
  console.log('console.error:', allIssues.filter(i => i.type === 'console.error').length);
  console.log('console.warn:', allIssues.filter(i => i.type === 'console.warning').length);
  console.log('console.info:', allIssues.filter(i => i.type === 'console.info').length);
  console.log('网络 4xx/5xx:', networkErrors.length);
  console.log('');
  console.log('=== 详细 console 信息 ===');
  allIssues.forEach((iss, i) => {
    console.log(`\n[${i + 1}] ${iss.type} @ ${iss.url}`);
    console.log('  ' + iss.text);
    if (iss.stack) console.log('  stack: ' + iss.stack.substring(0, 300));
  });
  console.log('\n=== 网络错误 ===');
  networkErrors.forEach((n, i) => console.log(`[${i + 1}] ${n.status} ${n.url}`));

  if (errorOverlay.length > 0) {
    console.log('\n=== 错误弹窗内容 ===');
    errorOverlay.forEach((e, i) => {
      console.log(`\n[弹窗 ${i + 1}] ${e.tag}`);
      console.log('text: ' + e.text);
    });
  }

  // 写入报告
  const reportPath = path.join(os.tmpdir(), 'user-flow-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    errorBadgeAfterHome: errBadge,
    errorBadgeAfterGuide: errBadge2,
    errorOverlay,
    allIssues,
    networkErrors,
  }, null, 2), 'utf8');
  console.log('\n报告:', reportPath);

  await browser.close();
})();
