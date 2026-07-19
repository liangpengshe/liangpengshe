// 完整用户路径测试：访问所有页面 + 模拟操作
const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');

const REPORT = path.join(os.tmpdir(), 'user-flow-report-v2.json');

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
    const type = msg.type();
    if (type === 'error' || type === 'warning' || type === 'warn') {
      allIssues.push({
        type: 'console.' + type,
        text: msg.text().substring(0, 1000),
        url: page.url(),
      });
    }
  });
  page.on('pageerror', (err) => {
    allIssues.push({
      type: 'pageerror',
      text: err.message.substring(0, 1000),
      stack: err.stack ? err.stack.substring(0, 1500) : '',
      url: page.url(),
    });
  });
  page.on('response', (res) => {
    if (res.status() >= 500) {
      networkErrors.push({ status: res.status(), url: res.url() });
    }
  });

  // 1. 访问首页
  console.log('1️⃣ 访问首页 /');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 2. 设置 localStorage 模拟学习完成
  console.log('2️⃣ 模拟学习完成状态');
  await page.evaluate(() => {
    localStorage.setItem('opc_level', 'flow');
    localStorage.setItem('learning_score', '100');
    localStorage.setItem('can_unlock_practice', 'true');
    localStorage.setItem('step_learning_done', 'true');
    localStorage.setItem('opc_user_phone', '13800138000');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 3. 点击 STEP 02 测试
  console.log('3️⃣ 测试 STEP 02 跳转');
  try {
    const step02 = await page.locator('text=STEP 02').first();
    if (await step02.count() > 0) {
      await step02.click({ timeout: 3000 });
      await page.waitForTimeout(2000);
    }
  } catch (e) {
    console.log('  STEP 02 点击异常:', e.message.substring(0, 200));
  }

  // 4. 访问所有关键页面
  const pages = [
    '/market',
    '/member',
    '/pricing',
    '/partner',
    '/diagnosis',
    '/guide/flow',
    '/console',
    '/workspace',
  ];

  for (const p of pages) {
    console.log('4️⃣ 访问', p);
    try {
      const res = await page.goto('http://localhost:3001' + p, { waitUntil: 'networkidle', timeout: 15000 });
      console.log('  状态:', res?.status());
      await page.waitForTimeout(1500);
    } catch (e) {
      console.log('  访问异常:', e.message.substring(0, 200));
    }
  }

  // 5. 回到首页再点 STEP 02
  console.log('5️⃣ 再次测试首页 STEP 02 跳转');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  try {
    const step02 = await page.locator('text=STEP 02').first();
    if (await step02.count() > 0) {
      await step02.click({ timeout: 3000 });
      await page.waitForTimeout(2000);
    }
  } catch (e) {
    console.log('  STEP 02 点击异常:', e.message.substring(0, 200));
  }

  // 6. 截图
  const screenshot = path.join(os.tmpdir(), 'user-flow-screenshot.png');
  await page.screenshot({ path: screenshot, fullPage: false });

  // 7. 输出报告
  console.log('');
  console.log('══════════════════════════════════════');
  console.log('  完整流程错误统计');
  console.log('══════════════════════════════════════');
  const pe = allIssues.filter((i) => i.type === 'pageerror').length;
  const ce = allIssues.filter((i) => i.type === 'console.error').length;
  const cw = allIssues.filter((i) => i.type === 'console.warning' || i.type === 'console.warn').length;
  console.log('pageerror:', pe);
  console.log('console.error:', ce);
  console.log('console.warn:', cw);
  console.log('总问题数:', allIssues.length);
  console.log('网络错误数:', networkErrors.length);
  if (allIssues.length > 0) {
    console.log('');
    console.log('--- 错误详情 ---');
    for (const i of allIssues.slice(0, 20)) {
      console.log(`[${i.type}] ${i.url || ''}`);
      console.log('  ', i.text.substring(0, 300));
    }
  }
  if (networkErrors.length > 0) {
    console.log('');
    console.log('--- 网络错误 ---');
    for (const n of networkErrors.slice(0, 20)) {
      console.log(`[${n.status}] ${n.url}`);
    }
  }

  fs.writeFileSync(
    REPORT,
    JSON.stringify(
      { allIssues, networkErrors, screenshot, pe, ce, cw, total: allIssues.length },
      null,
      2
    )
  );

  await browser.close();
  console.log('Done. Report:', REPORT);
})();
