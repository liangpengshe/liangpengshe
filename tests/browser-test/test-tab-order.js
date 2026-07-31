// 验证 Tab 顺序 + 激活态高亮
const { chromium } = require('playwright');
const path = require('path');
const os = require('os');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  let pass = 0, total = 0;
  const log = (m) => console.log(m);

  // 阶段 1: /market/projects 路由下，4 个 Tab 顺序应为 项目/工具/服务/资源
  await page.goto('http://localhost:3001/market/projects', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  const tabs = await page.evaluate(() => {
    const nav = document.querySelector('nav');
    if (!nav) return [];
    return [...nav.querySelectorAll('a')].map((a) => {
      const span = a.querySelector('span:last-child');
      return {
        text: span?.textContent?.trim() || a.textContent?.trim(),
        href: a.getAttribute('href'),
        isActive: a.className.includes('bg-gradient-to-r') || a.className.includes('shadow-md'),
      };
    });
  });

  log('═══ 阶段 1: /market/projects 路由下 Tab 顺序 ═══');
  const expectedOrder = ['项目', '工具', '服务', '资源'];
  for (let i = 0; i < expectedOrder.length; i++) {
    const tabText = tabs[i]?.text?.slice(0, 2);
    total++;
    if (tabText === expectedOrder[i]) pass++;
    log(`  位置 ${i + 1}: "${tabText}" (期望 "${expectedOrder[i]}") ${tabText === expectedOrder[i] ? '✅' : '❌'}`);
  }

  log(`\n激活态: "${tabs.find((t) => t.isActive)?.text?.slice(0, 20)}"`);
  const activeIdx = tabs.findIndex((t) => t.isActive);
  total++; if (activeIdx === 0) pass++;
  log(`  激活位置 0 (项目): ${activeIdx === 0 ? '✅' : '❌'}`);

  await page.screenshot({ path: path.join(os.tmpdir(), 'tab-order-projects.png') });

  // 阶段 2: 切到 /market/tools，激活态应切到 工具(位置 1)
  await page.goto('http://localhost:3001/market/tools', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const tabs2 = await page.evaluate(() => {
    return [...document.querySelectorAll('nav a')].map((a) => {
      const span = a.querySelector('span:last-child');
      return {
        text: span?.textContent?.trim() || a.textContent?.trim(),
        isActive: a.className.includes('bg-gradient-to-r') || a.className.includes('shadow-md'),
      };
    });
  });
  log('\n═══ 阶段 2: /market/tools 路由下激活态 ═══');
  const activeIdx2 = tabs2.findIndex((t) => t.isActive);
  total++; if (activeIdx2 === 1) pass++;
  log(`  激活位置 ${activeIdx2} (期望 1=工具): ${activeIdx2 === 1 ? '✅' : '❌'}`);

  // 阶段 3: 切到 /market/resources，激活态应切到 资源(位置 3)
  await page.goto('http://localhost:3001/market/resources', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const tabs3 = await page.evaluate(() => {
    return [...document.querySelectorAll('nav a')].map((a) => {
      const span = a.querySelector('span:last-child');
      return {
        text: span?.textContent?.trim() || a.textContent?.trim(),
        isActive: a.className.includes('bg-gradient-to-r') || a.className.includes('shadow-md'),
      };
    });
  });
  log('\n═══ 阶段 3: /market/resources 路由下激活态 ═══');
  const activeIdx3 = tabs3.findIndex((t) => t.isActive);
  total++; if (activeIdx3 === 3) pass++;
  log(`  激活位置 ${activeIdx3} (期望 3=资源): ${activeIdx3 === 3 ? '✅' : '❌'}`);

  // 阶段 4: URL 参数 ?recommend=flow 仍正确高亮项目库
  await page.goto('http://localhost:3001/market/projects?recommend=flow', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const tabs4 = await page.evaluate(() => {
    return [...document.querySelectorAll('nav a')].map((a) => {
      const span = a.querySelector('span:last-child');
      return {
        text: span?.textContent?.trim() || a.textContent?.trim(),
        isActive: a.className.includes('bg-gradient-to-r') || a.className.includes('shadow-md'),
      };
    });
  });
  log('\n═══ 阶段 4: /market/projects?recommend=flow 激活态 ═══');
  const activeIdx4 = tabs4.findIndex((t) => t.isActive);
  total++; if (activeIdx4 === 0) pass++;
  log(`  激活位置 ${activeIdx4} (期望 0=项目): ${activeIdx4 === 0 ? '✅' : '❌'}`);

  await browser.close();
  log(`\n========== 测试结果 ═══`);
  log(`  通过: ${pass}/${total}`);
  const ok = pass === total;
  log(`  整体: ${ok ? '✅ ALL PASS' : '❌ FAIL'}`);
  process.exit(ok ? 0 : 1);
})();
