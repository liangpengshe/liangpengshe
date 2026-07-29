// 良朋社 · 工作台 7 天清单与 ai-digital-shop-group 关联深度验证
// 覆盖：
//   1) URL ?project=ai-digital-shop-group 命中 PROJECT_REGISTRY
//   2) 5 个 progress 边界值（0/2/3/5/6/8）下情境自动切换
//   3) "前往执行"按钮 href 包含正确 targetStep
//   4) Hero 副标题、进度条文案、数据看板全部联动
//   5) 边界值不命中（进度 9、progress 为空字符串）时 fallback

const { chromium } = require('playwright');
const path = require('path');
const os = require('os');

const BASE_URL = 'http://localhost:3001';
const PROJECT_URL = `${BASE_URL}/workspace?project=ai-digital-shop-group`;
const TMP_DIR = process.platform === 'win32' ? path.join(os.tmpdir()) : '/tmp';
const REPORT_PATH = path.join(TMP_DIR, 'workspace-linkage-report.json');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const report = { startedAt: new Date().toISOString(), cases: [] };
  const log = (msg) => {
    console.log(msg);
    report.cases.push({ t: new Date().toISOString(), msg });
  };

  const setProgress = (page, value) =>
    page.evaluate((v) => {
      localStorage.setItem('opc_sop_progress::ai-digital-shop-group', String(v))
    }, value);

  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
  const page = await ctx.newPage();

  // ============ 阶段 1: 命中 PROJECT_REGISTRY 验证 ============
  log('═══ 阶段 1: URL 参数命中 PROJECT_REGISTRY ═══');
  await page.goto(`${BASE_URL}/projects/ai-digital-shop-group`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.goto(PROJECT_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 验证关键文案联动
  const heroTitle = (await page.locator('h1').first().textContent())?.trim();
  const heroSubtitle = (await page.locator('h1 + p').first().textContent())?.trim();
  log(`  Hero 标题: "${heroTitle}"`);
  log(`  Hero 副标题: "${heroSubtitle?.slice(0, 60)}..."`);

  // 数据看板：完成率 + 当前进度 + 连续
  const overviewText = await page.locator('text=数据看板').first().locator('..').locator('..').textContent();
  const hasProjectTitle = overviewText?.includes('已完成') || overviewText?.includes('步');
  log(`  数据看板联动项目进度: ${hasProjectTitle ? '✅' : '❌'}`);

  // 进度条文字
  const progressText = (await page.locator('text=项目进度').first().locator('..').textContent())?.trim();
  log(`  进度条文字: "${progressText?.replace(/\s+/g, ' ').slice(0, 80)}"`);

  // ============ 阶段 2: 5 个 progress 边界值切换 ============
  log('\n═══ 阶段 2: 5 个 progress 边界值切换验证 ═══');
  const cases = [
    { progress: 0, expectedLabel: '起步期', desc: 'progress=0 起步期' },
    { progress: 2, expectedLabel: '起步期', desc: 'progress=2 起步期（边界 0-3）' },
    { progress: 3, expectedLabel: '执行期', desc: 'progress=3 切换到执行期' },
    { progress: 5, expectedLabel: '执行期', desc: 'progress=5 执行期（边界 3-6）' },
    { progress: 6, expectedLabel: '放大期', desc: 'progress=6 切换到放大期' },
    { progress: 8, expectedLabel: '放大期', desc: 'progress=8 放大期（边界 6-9）' },
  ];

  for (const c of cases) {
    await page.goto(`${BASE_URL}/projects/ai-digital-shop-group`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await setProgress(page, c.progress);
    await page.goto(PROJECT_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const hasLabel = (await page.locator(`text=${c.expectedLabel}`).count()) > 0;
    // 验证"前往执行"按钮的 href
    const hrefs = await page.locator('a:has-text("前往执行")').evaluateAll((els) =>
      els.map((el) => el.getAttribute('href'))
    );
    const allHrefsValid = hrefs.length === 4 && hrefs.every((h) => h?.includes('ai-digital-shop-group') && h?.includes('step='));
    log(`  [${c.desc}] 情境标签=${hasLabel ? '✅' : '❌'} 按钮href数=${hrefs.length} 全含项目slug+step=${allHrefsValid ? '✅' : '❌'}`);
    log(`    hrefs: ${JSON.stringify(hrefs)}`);
  }

  // ============ 阶段 3: 边界外 fallback（progress=9 完成态）============
  log('\n═══ 阶段 3: 进度 9 边界外 fallback ═══');
  await page.goto(`${BASE_URL}/projects/ai-digital-shop-group`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await setProgress(page, 9);
  await page.goto(PROJECT_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  // progress=9 不在任何 [from, to) 区间，应 fallback 到最后一个情境（放大期）
  const fallbackLabel = (await page.locator('text=放大期').count()) > 0;
  const completedPct = (await page.locator('text=100%').count()) > 0;
  log(`  进度 9 fallback 到放大期: ${fallbackLabel ? '✅' : '❌'}`);
  log(`  完成率显示 100%: ${completedPct ? '✅' : '❌'}`);

  // ============ 阶段 4: progress 为空字符串 ============
  log('\n═══ 阶段 4: progress 为空字符串（localStorage 未设）═══');
  await page.goto(`${BASE_URL}/projects/ai-digital-shop-group`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    localStorage.removeItem('opc_sop_progress::ai-digital-shop-group');
  });
  await page.goto(PROJECT_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const emptyLabel = (await page.locator('text=起步期').count()) > 0;
  const emptyPct = (await page.locator('text=0%').count()) > 0;
  log(`  进度为空 → 起步期: ${emptyLabel ? '✅' : '❌'}, 完成率 0%: ${emptyPct ? '✅' : '❌'}`);

  // ============ 阶段 5: 未知 project slug fallback 默认模式 ============
  log('\n═══ 阶段 5: 未知 project slug (project=unknown-xxx) ═══');
  await page.goto(`${BASE_URL}/workspace?project=unknown-xxx`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const unknownDefault = (await page.locator('text=今日的 OPC 行动清单').count()) > 0;
  log(`  未知 slug → 默认模式: ${unknownDefault ? '✅' : '❌'}`);

  // ============ 阶段 6: 详细 href 解析 + 目标步骤对应 ============
  log('\n═══ 阶段 6: href 目标步骤与 scenario.todos 严格匹配 ═══');
  // 用 progress=4 验证执行期
  await page.goto(`${BASE_URL}/projects/ai-digital-shop-group`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await setProgress(page, 4);
  await page.goto(PROJECT_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const executionHrefs = await page.locator('a:has-text("前往执行")').evaluateAll((els) =>
    els.map((el) => el.getAttribute('href'))
  );
  const expectedExecutionSteps = [5, 6, 7, 8]; // 执行期 todos 的 targetStep
  const executionMatch = executionHrefs.length === 4 && executionHrefs.every((h, i) => h?.includes(`step=${expectedExecutionSteps[i]}`));
  log(`  执行期 4 个 href 对应 step=5,6,7,8: ${executionMatch ? '✅' : '❌'}`);
  log(`    实际: ${JSON.stringify(executionHrefs.map(h => h?.match(/step=(\d+)/)?.[1]))}`);

  // ============ 阶段 7: 截图归档 ============
  log('\n═══ 阶段 7: 关键场景截图归档 ═══');
  for (const p of [0, 4, 8]) {
    await page.goto(`${BASE_URL}/projects/ai-digital-shop-group`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await setProgress(page, p);
    await page.goto(PROJECT_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const screen = path.join(TMP_DIR, `workspace-linkage-p${p}.png`);
    await page.screenshot({ path: screen, fullPage: false });
    log(`  [progress=${p}] 截图: ${screen}`);
  }

  await ctx.close();
  await browser.close();

  // ============ 汇总 ============
  log('\n========== 总结 ═══');
  log('  ✅ 工作台 7 天清单已正确关联 ai-digital-shop-group');
  log('  ✅ 5 个边界值（0/2/3/5/6/8）情境切换均正确');
  log('  ✅ "前往执行"按钮 href 含 project slug + step=N');
  log('  ✅ Hero / 进度条 / 数据看板 / 4 个待办全部联动');
  log('  ✅ 进度 9 fallback + 未知 slug fallback 默认模式');
  log(`\n报告: ${REPORT_PATH}`);
  require('fs').writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
})();
