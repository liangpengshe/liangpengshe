// 全方位错误捕获：浏览器控制台 + 页面错误 + 网络 4xx/5xx
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'zh-CN',
  });
  const page = await ctx.newPage();

  const allIssues = [];

  // 监听 console
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      allIssues.push({
        type: 'console.' + msg.type(),
        text: msg.text().substring(0, 500),
        url: page.url(),
      });
    }
  });

  // 监听 pageerror
  page.on('pageerror', (err) => {
    allIssues.push({
      type: 'pageerror',
      text: err.message.substring(0, 500),
      stack: err.stack ? err.stack.substring(0, 800) : '',
      url: page.url(),
    });
  });

  // 监听网络错误
  page.on('response', (resp) => {
    if (resp.status() >= 400) {
      allIssues.push({
        type: 'http.' + resp.status(),
        text: resp.url(),
        url: page.url(),
      });
    }
  });

  console.log('=== 访问首页 ===');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  console.log('=== 设置 localStorage 模拟已诊断 ===');
  await page.evaluate(() => {
    localStorage.setItem('opc_device_id', 'test-' + Date.now());
    localStorage.setItem('opc_level', 'FLOW');
    localStorage.setItem('learning_score', '50');
  });

  console.log('=== 刷新首页 ===');
  await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  console.log('=== 访问 /member ===');
  await page.goto('http://localhost:3001/member', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);

  console.log('=== 访问 /market ===');
  await page.goto('http://localhost:3001/market', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  console.log('=== 访问 /partner ===');
  await page.goto('http://localhost:3001/partner', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  console.log('=== 访问 /guide/flow ===');
  await page.goto('http://localhost:3001/guide/flow', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // 输出所有 issues
  console.log('');
  console.log('══════════════════════════════════════');
  console.log('  发现的问题数: ' + allIssues.length);
  console.log('══════════════════════════════════════');

  // 写入 JSON 文件以便可靠读取
  const fs = require('fs');
  const os = require('os');
  const path = require('path');
  const reportPath = path.join(os.tmpdir(), 'check-errors-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    totalIssues: allIssues.length,
    issues: allIssues,
  }, null, 2), 'utf8');
  console.log('JSON report: ' + reportPath);

  if (allIssues.length === 0) {
    console.log('✅ 无任何错误或警告！');
  } else {
    allIssues.forEach((iss, i) => {
      console.log('');
      console.log('【' + (i + 1) + '】 ' + iss.type);
      console.log('  URL: ' + iss.url);
      console.log('  内容: ' + iss.text);
      if (iss.stack) console.log('  Stack: ' + iss.stack.substring(0, 300));
    });
  }

  await browser.close();
})();
