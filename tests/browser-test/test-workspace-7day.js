// 良朋社 · 工作台双模式 e2e 测试
// 场景：
//   T0 默认模式（无参数）：今日 OPC 行动清单
//   T1 项目模式 + 进度 0：起步期清单
//   T2 项目模式 + 进度 4：执行期清单（自动切换情境）
//   T3 项目模式 + 进度 8：放大期清单
//   T4 移动端单列堆叠验证

const { chromium } = require('playwright');
const path = require('path');
const os = require('os');

const BASE_URL = 'http://localhost:3001';
const TMP_DIR = process.platform === 'win32' ? path.join(os.tmpdir()) : '/tmp';

const SCREEN = {
  T0_DEFAULT: path.join(TMP_DIR, 'workspace-T0-default.png'),
  T1_START: path.join(TMP_DIR, 'workspace-T1-startup.png'),
  T2_EXEC: path.join(TMP_DIR, 'workspace-T2-execution.png'),
  T3_SCALE: path.join(TMP_DIR, 'workspace-T3-scaling.png'),
  T4_MOBILE: path.join(TMP_DIR, 'workspace-T4-mobile.png'),
};
const REPORT_PATH = path.join(TMP_DIR, 'workspace-test-report.json');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const report = { startedAt: new Date().toISOString(), scenarios: [] };
  const log = (msg) => {
    console.log(msg);
    report.scenarios.push({ t: new Date().toISOString(), msg });
  };

  const setProgress = (page, value) =>
    page.evaluate((v) => {
      localStorage.setItem('opc_sop_progress::ai-digital-shop-group', String(v))
    }, value);

  const goto = async (page, url) => {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
  };

  try {
    // ============ T0: 默认模式 ============
    log('[T0] 默认模式（无 project 参数）');
    const ctx0 = await browser.newContext({ viewport: { width: 1280, height: 1200 } });
    const p0 = await ctx0.newPage();
    await goto(p0, `${BASE_URL}/workspace`);
    await p0.screenshot({ path: SCREEN.T0_DEFAULT, fullPage: false });
    const t0Title = (await p0.locator('h1').first().textContent())?.trim();
    const t0HasTodayTodo = (await p0.locator('text=今日 TODO').count()) > 0;
    log(`  标题: "${t0Title}", 显示今日 TODO: ${t0HasTodayTodo}`);
    const t0Has7Day = (await p0.locator('text=7 天核心待办').count()) > 0;
    log(`  不应显示 7 天核心待办: ${!t0Has7Day ? '✅' : '❌'}`);
    await ctx0.close();

    // ============ T1: 起步期 (progress=0) ============
    log('[T1] 项目模式 + 进度 0：应显示「起步期」清单');
    const ctx1 = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const p1 = await ctx1.newPage();
    await goto(p1, `${BASE_URL}/projects/ai-digital-shop-group`);
    await setProgress(p1, 0);
    await goto(p1, `${BASE_URL}/workspace?project=ai-digital-shop-group`);
    await p1.screenshot({ path: SCREEN.T1_START, fullPage: false });
    const t1Title = (await p1.locator('h1').first().textContent())?.trim();
    const t1HasLabel = (await p1.locator('text=起步期').count()) > 0;
    const t1TodoCount = await p1.locator('text=前往执行').count();
    log(`  标题: "${t1Title}"`);
    log(`  显示「起步期」: ${t1HasLabel ? '✅' : '❌'}`);
    log(`  4 个前往执行按钮: ${t1TodoCount === 4 ? '✅' : `❌(${t1TodoCount})`}`);
    await ctx1.close();

    // ============ T2: 执行期 (progress=4) ============
    log('[T2] 项目模式 + 进度 4：应显示「执行期」清单（自动切换）');
    const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const p2 = await ctx2.newPage();
    await goto(p2, `${BASE_URL}/projects/ai-digital-shop-group`);
    await setProgress(p2, 4);
    await goto(p2, `${BASE_URL}/workspace?project=ai-digital-shop-group`);
    await p2.screenshot({ path: SCREEN.T2_EXEC, fullPage: false });
    const t2HasLabel = (await p2.locator('text=执行期').count()) > 0;
    const t2TodoCount = await p2.locator('text=前往执行').count();
    log(`  显示「执行期」: ${t2HasLabel ? '✅' : '❌'}`);
    log(`  4 个前往执行按钮: ${t2TodoCount === 4 ? '✅' : `❌(${t2TodoCount})`}`);
    await ctx2.close();

    // ============ T3: 放大期 (progress=8) ============
    log('[T3] 项目模式 + 进度 8：应显示「放大期」清单');
    const ctx3 = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const p3 = await ctx3.newPage();
    await goto(p3, `${BASE_URL}/projects/ai-digital-shop-group`);
    await setProgress(p3, 8);
    await goto(p3, `${BASE_URL}/workspace?project=ai-digital-shop-group`);
    await p3.screenshot({ path: SCREEN.T3_SCALE, fullPage: false });
    const t3HasLabel = (await p3.locator('text=放大期').count()) > 0;
    const t3TodoCount = await p3.locator('text=前往执行').count();
    log(`  显示「放大期」: ${t3HasLabel ? '✅' : '❌'}`);
    log(`  4 个前往执行按钮: ${t3TodoCount === 4 ? '✅' : `❌(${t3TodoCount})`}`);
    await ctx3.close();

    // ============ T4: 移动端单列堆叠 ============
    log('[T4] 移动端：4 个待办自动堆叠单列 + 按钮占满宽度');
    const ctx4 = await browser.newContext({ viewport: { width: 375, height: 1400 }, isMobile: true });
    const p4 = await ctx4.newPage();
    await goto(p4, `${BASE_URL}/projects/ai-digital-shop-group`);
    await setProgress(p4, 4);
    await goto(p4, `${BASE_URL}/workspace?project=ai-digital-shop-group`);
    await p4.waitForTimeout(1500);
    await p4.screenshot({ path: SCREEN.T4_MOBILE, fullPage: false });
    const todoBoxes = await p4.locator('text=前往执行').evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect()
        return { x: r.x, y: r.y, w: r.width, h: r.height }
      })
    )
    log(`  按钮数: ${todoBoxes.length}, 位置: ${JSON.stringify(todoBoxes.slice(0, 2))}`);
    // 移动端 4 个按钮应当 y 坐标依次增加（堆叠）
    const stacked = todoBoxes.length >= 4 && todoBoxes[0].y < todoBoxes[1].y && todoBoxes[1].y < todoBoxes[2].y
    log(`  移动端单列堆叠: ${stacked ? '✅' : '❌'}`);
    await ctx4.close();

    // ============ 结果汇总 ============
    const t0Pass = t0HasTodayTodo && !t0Has7Day;
    const t1Pass = t1HasLabel && t1TodoCount === 4;
    const t2Pass = t2HasLabel && t2TodoCount === 4;
    const t3Pass = t3HasLabel && t3TodoCount === 4;
    const t4Pass = stacked;
    const allPass = t0Pass && t1Pass && t2Pass && t3Pass && t4Pass;

    report.finalResult = {
      T0_默认模式: t0Pass ? '✅ PASS' : '❌ FAIL',
      T1_起步期: t1Pass ? '✅ PASS' : '❌ FAIL',
      T2_执行期自动切换: t2Pass ? '✅ PASS' : '❌ FAIL',
      T3_放大期: t3Pass ? '✅ PASS' : '❌ FAIL',
      T4_移动端堆叠: t4Pass ? '✅ PASS' : '❌ FAIL',
      allPass,
    };
    log('\n========== 测试结果 ==========');
    log(`  T0 默认模式: ${report.finalResult.T0_默认模式}`);
    log(`  T1 起步期 (进度 0): ${report.finalResult.T1_起步期}`);
    log(`  T2 执行期 (进度 4): ${report.finalResult.T2_执行期自动切换}`);
    log(`  T3 放大期 (进度 8): ${report.finalResult.T3_放大期}`);
    log(`  T4 移动端堆叠: ${report.finalResult.T4_移动端堆叠}`);
    log(`  整体: ${allPass ? '✅ ALL PASS' : '❌ FAILED'}`);
  } catch (err) {
    log(`❌ 测试异常：${err.message}`);
    report.finalResult = { error: err.message };
  } finally {
    report.endedAt = new Date().toISOString();
    require('fs').writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    console.log(`\n报告: ${REPORT_PATH}`);
    await browser.close();
    process.exit(report.finalResult?.allPass ? 0 : 1);
  }
})();
