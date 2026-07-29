/**
 * 良朋社 /pricing 页面文案微调验证
 * 验证：69 月卡首月提示 + 9.9 vs 19.9 文案 + 阶梯递进按钮文案
 */
const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');

const REPORT = path.join(os.tmpdir(), 'pricing-copy-test.json');
const BASE = 'http://localhost:3001';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1800 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message.substring(0, 300)));
  const log = [];

  console.log('══════════════════════════════════════════════════════════');
  console.log('  /pricing 页面文案微调验证');
  console.log('══════════════════════════════════════════════════════════\n');

  await page.goto(`${BASE}/pricing`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  const body = await page.textContent('body');

  // ── 1. 69 月卡 ──
  console.log('┌─ 1. 69 元/月 卡片文案 ───────────────────────────────┐');
  const checks1 = [
    { label: '首月优惠提示', match: '首月仅需 9.9 元，次月恢复 69 元/月' },
    { label: '9.9 vs 19.9 引导', match: '9.9 元买的是动手的机会' },
    { label: '9.9 vs 19.9 引导', match: '19.9 元买的是方向的选择' },
    { label: '首月建议', match: '先花 19.9 元找方向，再花 9.9 元动手试试' },
    { label: '按钮文案', match: '立即体验 9.9 元首月' },
  ];
  for (const c of checks1) {
    const ok = body.includes(c.match);
    console.log(`  ${ok ? '✓' : '✗'} ${c.label.padEnd(15)}: "${c.match}"`);
    log.push({ group: 'monthly-69', label: c.label, ok, match: c.match });
  }
  console.log('└────────────────────────────────────────────────────┘\n');

  // ── 2. 阶梯递进按钮 ──
  console.log('┌─ 2. 199/598/1980 阶梯递进按钮 ────────────────────────┐');
  const checks2 = [
    { label: '199 按钮', match: '加入圈层 199' },
    { label: '598 按钮', match: '开启陪跑 598' },
    { label: '1980 按钮', match: '解锁矩阵 1980' },
  ];
  for (const c of checks2) {
    const ok = body.includes(c.match);
    console.log(`  ${ok ? '✓' : '✗'} ${c.label.padEnd(12)}: "${c.match}"`);
    log.push({ group: 'ladder-cta', label: c.label, ok, match: c.match });
  }
  console.log('└────────────────────────────────────────────────────┘\n');

  // ── 3. 升级补差价 ──
  console.log('┌─ 3. 升级补差价提示 ─────────────────────────────────┐');
  const upgradeCount = (body.match(/已购 199 元用户升级仅需补差价/g) || []).length;
  console.log(`  出现次数: ${upgradeCount} (期望: 2，分别在 598 和 1980 卡片)`);
  log.push({ group: 'upgrade-note', count: upgradeCount, expected: 2, ok: upgradeCount >= 2 });
  console.log('└────────────────────────────────────────────────────┘\n');

  // ── 4. 合作档 ──
  console.log('┌─ 4. 合作档（合作档）────────────────────────────────┐');
  const checks4 = [
    { label: '合作档按钮', match: '了解主理人权益' },
  ];
  for (const c of checks4) {
    const ok = body.includes(c.match);
    console.log(`  ${ok ? '✓' : '✗'} ${c.label.padEnd(15)}: "${c.match}"`);
    log.push({ group: 'partner', label: c.label, ok, match: c.match });
  }
  console.log('└────────────────────────────────────────────────────┘\n');

  // 截图
  const ss = path.join(os.tmpdir(), 'pricing-copy-test.png');
  await page.screenshot({ path: ss, fullPage: true });
  console.log(`📸 截图: ${ss}`);

  // 汇总
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  📊 文案验证结果');
  console.log('══════════════════════════════════════════════════════════');
  const passed = log.filter((l) => l.ok !== false).length;
  console.log(`  通过: ${passed}/${log.length}`);
  console.log(`  JS 错误: ${errs.length}`);
  if (errs.length) errs.forEach((e) => console.log(`    - ${e}`));
  fs.writeFileSync(REPORT, JSON.stringify({ log, errs }, null, 2));
  console.log(`  📄 报告: ${REPORT}`);

  await browser.close();
})();
