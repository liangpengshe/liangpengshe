// 验证双引擎页面对齐 + 命名
const { chromium } = require('playwright');
const path = require('path');
const os = require('os');

(async () => {
  const browser = await chromium.launch({ headless: true });
  let pass = 0, total = 0;

  // 1. PC 端
  console.log('═══ 1. PC 端双引擎对齐 ═══');
  const pcPage = await browser.newPage({ viewport: { width: 1280, height: 1800 } });
  await pcPage.goto('http://localhost:3001/mindset', { waitUntil: 'networkidle' });
  await pcPage.waitForTimeout(3000);

  const pc = await pcPage.evaluate(() => {
    const text = document.body.textContent || '';
    const traderCards = document.querySelectorAll('#trader-engine article');
    const flowCards = document.querySelectorAll('#flow-engine article');
    return {
      hasNewTabName: text.includes('AI 网店群思维（交易型）') && !text.includes('AI 店群思维（交易型）'),
      hasNewButtonName: text.includes('我选 AI 网店群') && !text.includes('我选 AI 店群'),
      traderCardCount: traderCards.length,
      flowCardCount: flowCards.length,
      t4Title: [...traderCards].map((c) => c.querySelector('h3')?.textContent?.trim()).filter(t => t && t.includes('避坑')),
      t4HasCircles: [...traderCards].some((c) => c.textContent?.includes('拒绝加盟') && c.textContent?.includes('拒绝空想') && c.textContent?.includes('专注 AI 工具驱动')),
    };
  });

  total++; if (pc.hasNewTabName) pass++;
  console.log(`  Tab 改名"AI 网店群思维": ${pc.hasNewTabName ? '✅' : '❌'}`);
  total++; if (pc.hasNewButtonName) pass++;
  console.log(`  深色按钮改名"我选 AI 网店群": ${pc.hasNewButtonName ? '✅' : '❌'}`);
  total++; if (pc.traderCardCount === 4) pass++;
  console.log(`  左侧 4 个卡片: ${pc.traderCardCount} (期望 4) ${pc.traderCardCount === 4 ? '✅' : '❌'}`);
  total++; if (pc.flowCardCount === 4) pass++;
  console.log(`  右侧 4 个卡片: ${pc.flowCardCount} (期望 4) ${pc.flowCardCount === 4 ? '✅' : '❌'}`);
  total++; if (pc.t4Title.length === 1 && pc.t4Title[0] === '店群经营避坑指南') pass++;
  console.log(`  T4 标题"店群经营避坑指南": ${pc.t4Title[0] || '❌'} ${pc.t4Title[0] === '店群经营避坑指南' ? '✅' : '❌'}`);
  total++; if (pc.t4HasCircles) pass++;
  console.log(`  T4 3 项内容齐全: ${pc.t4HasCircles ? '✅' : '❌'}`);

  await pcPage.screenshot({ path: path.join(os.tmpdir(), 'mindset-pc-aligned.png'), fullPage: true });
  await pcPage.close();

  // 2. 移动端
  console.log('\n═══ 2. 移动端自动折叠为单列 ═══');
  const mobilePage = await browser.newPage({ viewport: { width: 375, height: 1000 } });
  await mobilePage.goto('http://localhost:3001/mindset', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(3000);

  const mobile = await mobilePage.evaluate(() => {
    const text = document.body.textContent || '';
    const traderCards = document.querySelectorAll('#trader-engine article');
    return {
      hasNewName: text.includes('AI 网店群思维（交易型）'),
      traderCardCount: traderCards.length,
      hasT4: [...traderCards].some((c) => c.textContent?.includes('店群经营避坑')),
    };
  });

  total++; if (mobile.hasNewName) pass++;
  console.log(`  移动端命名同步: ${mobile.hasNewName ? '✅' : '❌'}`);
  total++; if (mobile.traderCardCount === 4) pass++;
  console.log(`  移动端 4 个卡片: ${mobile.traderCardCount} ${mobile.traderCardCount === 4 ? '✅' : '❌'}`);
  total++; if (mobile.hasT4) pass++;
  console.log(`  移动端 T4 显示: ${mobile.hasT4 ? '✅' : '❌'}`);

  await mobilePage.screenshot({ path: path.join(os.tmpdir(), 'mindset-mobile-aligned.png'), fullPage: true });
  await mobilePage.close();

  // 3. 对齐验证：左右两列顶部到 CTA 的总高度差
  console.log('\n═══ 3. 左右两列高度差（桌面端）═══');
  const alignPage = await browser.newPage({ viewport: { width: 1280, height: 2400 } });
  await alignPage.goto('http://localhost:3001/mindset', { waitUntil: 'networkidle' });
  await alignPage.waitForTimeout(3000);
  const align = await alignPage.evaluate(() => {
    const t = document.querySelector('#trader-engine');
    const f = document.querySelector('#flow-engine');
    return {
      traderH: t?.getBoundingClientRect().height || 0,
      flowH: f?.getBoundingClientRect().height || 0,
      diff: Math.abs((t?.getBoundingClientRect().height || 0) - (f?.getBoundingClientRect().height || 0)),
    };
  });
  console.log(`  交易型高度: ${Math.round(align.traderH)}px`);
  console.log(`  流量型高度: ${Math.round(align.flowH)}px`);
  console.log(`  高度差: ${Math.round(align.diff)}px (${align.diff < 100 ? '完美对齐' : align.diff < 200 ? '大致对齐' : '存在空档'})`);
  await alignPage.close();

  await browser.close();
  console.log(`\n========== 测试结果 ═══`);
  console.log(`  通过: ${pass}/${total}`);
  const ok = pass === total;
  console.log(`  整体: ${ok ? '✅ ALL PASS' : '❌ FAIL'}`);
  process.exit(ok ? 0 : 1);
})();
