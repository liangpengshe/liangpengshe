// 检查 /member 页面真实渲染内容
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    locale: 'zh-CN',
  });
  const page = await ctx.newPage();

  // 监听 console error
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text());
  });

  // 设置 localStorage
  await page.goto('http://localhost:3001/');
  await page.evaluate(() => {
    localStorage.setItem('opc_level', 'FLOW');
    localStorage.setItem('learning_score', '0');
    localStorage.setItem('can_unlock_practice', 'false');
    localStorage.removeItem('step_learning_done');
  });

  // 访问 /member
  await page.goto('http://localhost:3001/member', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);

  // 检查 localStorage 是否还在
  const ls = await page.evaluate(() => ({
    opc_level: localStorage.getItem('opc_level'),
    learning_score: localStorage.getItem('learning_score'),
  }));
  console.log('localStorage:', JSON.stringify(ls));

  // 检查页面文本
  const text = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log('--- 页面文本前 500 字符 ---');
  console.log(text);

  console.log('');
  console.log('--- Errors ---');
  errors.forEach((e) => console.log(e));

  await browser.close();
})();
