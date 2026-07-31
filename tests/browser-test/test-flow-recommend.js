// 良朋社 · 流量型 OPC 推荐逻辑验证（修正版）
// 核心判断：prioritySet 命中 → ring-2 高亮 + 🔥 优先推荐徽章 + 卡片置顶
// 而非简单文本包含（避免误判）

const { chromium } = require('playwright');
const path = require('path');
const os = require('os');

const BASE = 'http://localhost:3001';
const SCREENSHOT_DIR = os.tmpdir();

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
  const page = await ctx.newPage();
  const log = (m) => console.log(m);
  let passCount = 0, total = 0;

  // ============ 阶段 1: 流量型推荐（?recommend=flow）============
  log('═══ 阶段 1: 流量型推荐（?recommend=flow）═══');
  await page.goto(`${BASE}/market/projects?recommend=flow`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // 1. 横幅文案
  const hasBannerImageText = (await page.locator('text=AI 图文自媒体项目').count()) > 0;
  const hasBannerVideo = (await page.locator('text=AI 视频自媒体项目').count()) > 0;
  total += 2;
  if (hasBannerImageText) passCount++;
  if (hasBannerVideo) passCount++;
  log(`  横幅含 AI图文: ${hasBannerImageText ? '✅' : '❌'}`);
  log(`  横幅含 AI视频: ${hasBannerVideo ? '✅' : '❌'}`);

  // 2. 优先推荐徽章：3 个（图文/视频/工具）
  const priorityCount = await page.locator('text=优先推荐').count();
  total++; if (priorityCount >= 3) passCount++;
  log(`  优先推荐徽章数: ${priorityCount} (期望 3)`);

  // 3. 卡片置顶顺序：取所有项目卡片 h3，按 DOM 顺序
  const allTitles = await page.locator('h3').evaluateAll((hs) =>
    hs.map((h) => h.textContent?.trim() || '').filter(Boolean)
  );
  // 找前 N 个包含"项目"字样的卡片
  const projectCards = allTitles.filter((t) => t.includes('项目'));
  total++; if (projectCards[0]?.includes('AI图文')) passCount++;
  total++; if (projectCards[1]?.includes('AI视频')) passCount++;
  total++; if (projectCards[2]?.includes('AI工具')) passCount++;
  log(`  置顶[0]: ${projectCards[0]?.slice(0, 20)}`);
  log(`  置顶[1]: ${projectCards[1]?.slice(0, 20)}`);
  log(`  置顶[2]: ${projectCards[2]?.slice(0, 20)}`);

  // 4. AI自媒体群项目 已不存在
  const oldExists = (await page.locator('text=AI自媒体群项目').count()) > 0;
  total++; if (!oldExists) passCount++;
  log(`  AI自媒体群项目残留: ${oldExists ? '❌' : '✅ 已彻底删除'}`);

  // 5. ring-2 高亮 = 3
  const ringCount = await page.locator('.ring-2').count();
  total++; if (ringCount >= 3) passCount++;
  log(`  ring-2 高亮数: ${ringCount} (期望 ≥ 3)`);

  // ============ 阶段 2: 交易型推荐（?recommend=trader）隔离验证 ============
  log('\n═══ 阶段 2: 交易型推荐（?recommend=trader）═══');
  await page.goto(`${BASE}/market/projects?recommend=trader`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 交易型 prioritySet = [数字店群, 无货源]
  const traderPriority = await page.locator('text=优先推荐').count();
  const traderRing = await page.locator('.ring-2').count();
  total++; if (traderPriority === 2) passCount++;
  total++; if (traderRing === 2) passCount++;
  log(`  交易型优先推荐徽章: ${traderPriority} (期望 2，仅数字店群+无货源)`);
  log(`  交易型 ring-2: ${traderRing} (期望 2)`);

  // 检查图文/视频 不应带 ring-2 也不应有 优先推荐
  // 找 AI图文卡片，看其祖先是否有 ring-2
  const imageRing = await page.evaluate(() => {
    const allH3 = [...document.querySelectorAll('h3')];
    const target = allH3.find((h) => h.textContent?.includes('AI图文自媒体项目'));
    if (!target) return null;
    let p = target.parentElement;
    while (p && p !== document.body) {
      if (p.className?.includes?.('ring-2')) return true;
      p = p.parentElement;
    }
    return false;
  });
  total++; if (imageRing === false) passCount++;
  log(`  AI图文 在交易型模式无 ring-2: ${imageRing === false ? '✅' : '❌'}`);

  // ============ 阶段 3: 默认模式（无 ?recommend）============
  log('\n═══ 阶段 3: 默认模式（无 ?recommend）═══');
  await page.goto(`${BASE}/market/projects`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const noPriority = await page.locator('text=优先推荐').count();
  total++; if (noPriority === 0) passCount++;
  log(`  默认模式优先推荐徽章: ${noPriority} (期望 0)`);

  // ============ 阶段 4: 新旧 slug 详情页 ============
  log('\n═══ 阶段 4: 新旧 slug 详情页可达性 ═══');
  for (const slug of ['ai-image-text-media', 'ai-video-media']) {
    const res = await page.goto(`${BASE}/projects/${slug}`, { waitUntil: 'networkidle' });
    total++; if (res?.status() === 200) passCount++;
    log(`  /projects/${slug}: ${res?.status() === 200 ? '✅ 200' : '❌ ' + res?.status()}`);
  }
  const oldRes = await page.goto(`${BASE}/projects/ai-self-media-group`, { waitUntil: 'networkidle' });
  total++; if (oldRes?.status() !== 200) passCount++;
  log(`  /projects/ai-self-media-group: ${oldRes?.status() !== 200 ? '✅ 已 404' : '❌ 仍可访问'}`);

  // ============ 阶段 5: system + asset 模式回归 ============
  log('\n═══ 阶段 5: system + asset 模式回归 ═══');
  for (const level of ['system', 'asset']) {
    const res = await page.goto(`${BASE}/market/projects?recommend=${level}`, { waitUntil: 'networkidle' });
    total++; if (res?.status() === 200) passCount++;
    log(`  ${level} 模式: HTTP ${res?.status()}`);
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'flow-recommend-final.png'), fullPage: true });

  await browser.close();
  log(`\n========== 测试结果 ═══`);
  log(`  通过: ${passCount}/${total}`);
  const pass = passCount === total;
  log(`  整体: ${pass ? '✅ ALL PASS' : '❌ FAIL'}`);
  process.exit(pass ? 0 : 1);
})();
