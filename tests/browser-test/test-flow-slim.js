// 流量型 OPC 精减验证：仅 AI图文 + AI视频 2 个优先推荐
const { chromium } = require('playwright');
const path = require('path');
const os = require('os');

const BASE = 'http://localhost:3001';
const REPORT = path.join(os.tmpdir(), 'flow-slim-report.json');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
  const page = await ctx.newPage();
  let pass = 0, total = 0;
  const log = (m) => console.log(m);

  // ============ 阶段 1: 流量型推荐 ?recommend=flow ============
  log('═══ 阶段 1: 流量型推荐（?recommend=flow）═══');
  await page.goto(`${BASE}/market/projects?recommend=flow`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // 1. 优先推荐徽章应只有 2 个
  const priorityCount = await page.locator('text=优先推荐').count();
  total++; if (priorityCount === 2) pass++;
  log(`  优先推荐徽章数: ${priorityCount} (期望 2)`);

  // 2. 卡片置顶：取所有项目卡片 h3，按 DOM 顺序
  const allTitles = await page.locator('h3').evaluateAll((hs) =>
    hs.map((h) => h.textContent?.trim() || '').filter((t) => t.includes('项目'))
  );
  log(`  置顶[0]: ${allTitles[0]?.slice(0, 20)}`);
  log(`  置顶[1]: ${allTitles[1]?.slice(0, 20)}`);
  log(`  置顶[2]: ${allTitles[2]?.slice(0, 20)} (应为数字店群等非优先)`);

  total++; if (allTitles[0]?.includes('AI图文')) pass++;
  total++; if (allTitles[1]?.includes('AI视频')) pass++;
  // AI工具推广项目不应在置顶前 2 位
  total++; if (!allTitles.slice(0, 2).some((t) => t?.includes('AI工具'))) pass++;
  log(`  AI工具 不在置顶前 2: ${!allTitles.slice(0, 2).some((t) => t?.includes('AI工具')) ? '✅' : '❌'}`);

  // 3. AI工具推广项目 应在非置顶区
  const toolIndex = allTitles.findIndex((t) => t?.includes('AI工具'));
  total++; if (toolIndex >= 2) pass++;
  log(`  AI工具 位置: 第 ${toolIndex + 1} 位 (期望 ≥ 3)`);

  // 4. ring-2 高亮 = 2
  const ringCount = await page.locator('.ring-2').count();
  log(`  ring-2 高亮数: ${ringCount} (期望 2)`);
  // 容忍其他高亮元素（页面其他 ring-2 不一定来自项目卡）
  total++; if (ringCount >= 2) pass++;

  // 5. AI工具推广项目 不应有 ring-2 边框
  const toolHasRing = await page.evaluate(() => {
    const allH3 = [...document.querySelectorAll('h3')];
    const target = allH3.find((h) => h.textContent?.includes('AI工具推广项目'));
    if (!target) return false;
    let p = target.parentElement;
    while (p && p !== document.body) {
      if (p.className?.includes?.('ring-2')) return true;
      p = p.parentElement;
    }
    return false;
  });
  total++; if (!toolHasRing) pass++;
  log(`  AI工具 无 ring-2 高亮: ${!toolHasRing ? '✅' : '❌'}`);

  // 6. AI图文 + AI视频 应该有 ring-2 高亮
  const imageHasRing = await page.evaluate(() => {
    const allH3 = [...document.querySelectorAll('h3')];
    const target = allH3.find((h) => h.textContent?.includes('AI图文自媒体项目'));
    if (!target) return false;
    let p = target.parentElement;
    while (p && p !== document.body) {
      if (p.className?.includes?.('ring-2')) return true;
      p = p.parentElement;
    }
    return false;
  });
  const videoHasRing = await page.evaluate(() => {
    const allH3 = [...document.querySelectorAll('h3')];
    const target = allH3.find((h) => h.textContent?.includes('AI视频自媒体项目'));
    if (!target) return false;
    let p = target.parentElement;
    while (p && p !== document.body) {
      if (p.className?.includes?.('ring-2')) return true;
      p = p.parentElement;
    }
    return false;
  });
  total++; if (imageHasRing) pass++;
  total++; if (videoHasRing) pass++;
  log(`  AI图文 有 ring-2: ${imageHasRing ? '✅' : '❌'}`);
  log(`  AI视频 有 ring-2: ${videoHasRing ? '✅' : '❌'}`);

  // 截图
  await page.screenshot({ path: path.join(os.tmpdir(), 'flow-slim-final.png'), fullPage: true });
  log(`\n截图: ${path.join(os.tmpdir(), 'flow-slim-final.png')}`);

  await browser.close();
  log(`\n========== 测试结果 ═══`);
  log(`  通过: ${pass}/${total}`);
  const ok = pass === total;
  log(`  整体: ${ok ? '✅ ALL PASS' : '❌ FAIL'}`);
  process.exit(ok ? 0 : 1);
})();
