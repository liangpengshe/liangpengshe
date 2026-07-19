// 完整用户路径测试：访问所有页面 + 模拟操作
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

  console.log('=== 完整用户路径测试 ===\n');

  // 1. 访问首页
  console.log('1. 访问首页 /');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // 2. 设置已诊断状态
  console.log('2. 设置 localStorage 模拟已诊断');
  await page.evaluate(() => {
    localStorage.setItem('opc_device_id', 'test-flow-' + Date.now());
    localStorage.setItem('opc_level', 'FLOW');
  });

  // 3. 刷新首页
  console.log('3. 刷新首页');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // 4. 点击 STEP 02 卡片
  console.log('4. 点击 STEP 02 学习入门');
  const step02Btn = page.locator('button', { hasText: '学习入门' }).first();
  if (await step02Btn.count() > 0) {
    await step02Btn.click();
    await page.waitForTimeout(3000);
  }
  console.log('   当前 URL:', page.url());

  // 5. 等待 5 秒看是否有 async error
  await page.waitForTimeout(5000);

  // 6. 访问 /market
  console.log('6. 访问 /market');
  await page.goto('http://localhost:3001/market', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // 7. 访问 /market/tools
  console.log('7. 访问 /market/tools');
  await page.goto('http://localhost:3001/market/tools', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // 8. 访问 /member
  console.log('8. 访问 /member');
  await page.goto('http://localhost:3001/member', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  // 9. 访问 /pricing
  console.log('9. 访问 /pricing');
  await page.goto('http://localhost:3001/pricing', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // 10. 访问 /partner
  console.log('10. 访问 /partner');
  await page.goto('http://localhost:3001/partner', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // 11. 访问 /diagnosis
  console.log('11. 访问 /diagnosis');
  await page.goto('http://localhost:3001/diagnosis', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // 12. 完成 3 个学习任务
  console.log('12. 模拟完成 3 个学习任务');
  const phone = await page.evaluate(() => localStorage.getItem('opc_device_id'));
  for (const action of ['browse', 'register', 'download']) {
    const r = await page.evaluate(async ({ p, a }) => {
      const res = await fetch('/api/user/learning-progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: p, action: a }),
      });
      return { status: res.status, body: await res.json() };
    }, { p: phone, a: action });
    console.log(`    - ${action}: status=${r.status}, score=${r.body?.data?.learning_score}`);
  }

  // 13. 访问首页验证
  console.log('13. 回首页验证状态');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // 14. 点击 STEP 02 测试跳转
  console.log('14. 点击 STEP 02 测试跳转');
  const step02Btn2 = page.locator('button', { hasText: '学习入门' }).first();
  if (await step02Btn2.count() > 0) {
    await step02Btn2.click();
    await page.waitForTimeout(3000);
  }
  console.log('   跳转后 URL:', page.url());

  // 输出报告
  console.log('');
  console.log('══════════════════════════════════════');
  console.log('  完整流程错误统计');
  console.log('══════════════════════════════════════');
  console.log('pageerror:', allIssues.filter(i => i.type === 'pageerror').length);
  console.log('console.error:', allIssues.filter(i => i.type === 'console.error').length);
  console.log('console.warn:', allIssues.filter(i => i.type === 'console.warning' || i.type === 'console.warn').length);
  console.log('总问题数:', allIssues.length);
  console.log('');
  if (allIssues.length > 0) {
    console.log('=== 详细错误 ===');
    allIssues.forEach((iss, i) => {
      console.log(`\n[${i + 1}] ${iss.type} @ ${iss.url}`);
      console.log('  ' + iss.text);
      if (iss.stack) console.log('  stack: ' + iss.stack.substring(0, 500));
    });
  } else {
    console.log('✅ 完整流程无任何错误！');
  }

  // 写入报告
  const reportPath = path.join(os.tmpdir(), 'full-flow-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    totalIssues: allIssues.length,
    issues: allIssues,
  }, null, 2), 'utf8');
  console.log('\n报告:', reportPath);

  await browser.close();
})();
