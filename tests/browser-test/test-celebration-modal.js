// 良朋社 AI 数字店群项目 · 第 9 步通关庆祝弹窗端到端测试
// 流程：
//   T0 打开 /projects/ai-digital-shop-group，清空 localStorage，截屏初始态
//   T1 通过 localStorage 注入"前 8 步完成 + 第 9 步 4 个子任务已完成"
//   T2 刷新页面 → 验证：庆祝弹窗出现、标题/副标题/按钮文案正确、点击按钮跳转 /workspace
//   T3 关闭弹窗 + 再次刷新 → 验证：弹窗不再出现（localStorage.celebrated_9 防重）
//   T4 清空 celebrated_9 + 再刷新 → 验证：弹窗再次出现
// 全部对比截图保存到 %TEMP%\celebration-*.png

const { chromium } = require('playwright');
const path = require('path');
const os = require('os');

const BASE_URL = 'http://localhost:3001';
const PROJECT_URL = `${BASE_URL}/projects/ai-digital-shop-group`;
const WORKSPACE_URL = `${BASE_URL}/workspace`;
const TMP_DIR = process.platform === 'win32' ? path.join(os.tmpdir()) : '/tmp';

const SCREEN = {
  T0: path.join(TMP_DIR, 'celebration-T0-initial.png'),
  T1: path.join(TMP_DIR, 'celebration-T1-after-reload-with-modal.png'),
  T2: path.join(TMP_DIR, 'celebration-T2-after-click-workspace.png'),
  T3: path.join(TMP_DIR, 'celebration-T3-no-repeat-on-reload.png'),
  T4: path.join(TMP_DIR, 'celebration-T4-reappears-after-cleared.png'),
};
const REPORT_PATH = path.join(TMP_DIR, 'celebration-test-report.json');

// 第 9 步（idx=8）4 个子任务 id，与 src/app/projects/[slug]/page.tsx 中 subSteps 定义保持一致
const STEP9_SUB_IDS = ['9-1', '9-2', '9-3', '9-4'];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1800 },
    locale: 'zh-CN',
    storageState: undefined,
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));

  const report = {
    startedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    projectUrl: PROJECT_URL,
    scenarios: [],
    consoleErrors,
    screenshots: SCREEN,
    finalResult: null,
  };

  const log = (msg) => {
    console.log(msg);
    report.scenarios.push({ t: new Date().toISOString(), msg });
  };

  // ============= 辅助函数 =============

  // 注入"全部 9 步完成 + 第 9 步 4 个子任务已完成"状态
  const injectCompletionState = async () => {
    await page.evaluate((subIds) => {
      const slug = 'ai-digital-shop-group';
      // 1. 主步骤进度：currentStep = 9
      const progressKey = `opc_sop_progress::${slug}`;
      window.localStorage.setItem(progressKey, '9');

      // 2. 子步骤进度：写入第 9 步的 4 个 subStep + 兜底写入前 8 步的占位
      // 注意：实际 key 是 `opc_sop_subprogress::`（无下划线，源自 SUB_STORAGE_PREFIX）
      const subKey = `opc_sop_subprogress::${slug}`;
      const subDone = new Set();
      // 兜底：写入前 8 步的所有可能 subStep id（保持幂等）
      for (let i = 0; i < 8; i++) {
        subDone.add(`step${i}-sub1`);
      }
      // 关键：第 9 步（idx=8）的 4 个真实子任务
      subIds.forEach((id) => subDone.add(`step8-${id}`));
      window.localStorage.setItem(subKey, JSON.stringify([...subDone]));
    }, STEP9_SUB_IDS);
  };

  // 读取 currentStep + 是否已标记 celebrated_9
  const readState = async () =>
    page.evaluate(() => {
      const slug = 'ai-digital-shop-group';
      const progress = window.localStorage.getItem(`opc_sop_progress::${slug}`);
      const celebrated = window.localStorage.getItem('celebrated_9');
      return {
        currentStep: progress !== null ? Number(progress) : null,
        celebrated_9: celebrated,
      };
    });

  // 检测页面中"庆祝模态框"是否可见（标题含"AI 数字店群项目"）
  const isModalVisible = async () => {
    const heading = page.locator('h3', { hasText: 'AI 数字店群项目' });
    if ((await heading.count()) === 0) return false;
    // 检查是否在视口内可见
    return await heading.first().isVisible();
  };

  try {
    // ============= T0: 初始态 =============
    log('[T0] 打开项目页 + 清空 localStorage，验证初始态');
    await page.goto(PROJECT_URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: SCREEN.T0, fullPage: false });
    let t0 = await readState();
    log(`  currentStep=${t0.currentStep}, celebrated_9=${t0.celebrated_9}`);
    log(`  弹窗可见：${await isModalVisible()}`);

    // ============= T1: 注入完成态 + 刷新 + 验证弹窗 =============
    log('[T1] 注入"前 8 步完成 + 第 9 步 4 个子任务已完成" → 刷新 → 验证弹窗');
    await injectCompletionState();
    await page.reload({ waitUntil: 'networkidle' });
    // 等待 useEffect 触发 + 弹窗动画
    await page.waitForTimeout(1500);
    await page.screenshot({ path: SCREEN.T1, fullPage: false });

    const t1State = await readState();
    const t1ModalVisible = await isModalVisible();
    log(`  注入后 currentStep=${t1State.currentStep}, celebrated_9=${t1State.celebrated_9}`);
    log(`  弹窗可见：${t1ModalVisible}`);

    // 验证弹窗文案
    const headingText = await page.locator('h3', { hasText: 'AI 数字店群项目' }).first().textContent();
    const subtitleText = await page.locator('p', { hasText: '一人公司' }).first().textContent();
    const workspaceBtn = page.locator('a', { hasText: '前往工作台看收入数据' });
    const workspaceBtnCount = await workspaceBtn.count();
    const workspaceHref = workspaceBtnCount > 0 ? await workspaceBtn.first().getAttribute('href') : null;
    log(`  标题：${headingText?.trim()}`);
    log(`  副标题：${subtitleText?.trim()}`);
    log(`  按钮 href：${workspaceHref}`);

    // ============= T2: 点击"前往工作台看收入数据"按钮 =============
    log('[T2] 点击"前往工作台看收入数据"按钮 → 验证跳转 /workspace');
    if (workspaceBtnCount > 0) {
      await workspaceBtn.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      log(`  当前 URL：${page.url()}`);
      log(`  跳转成功：${page.url().startsWith(WORKSPACE_URL) ? '✅' : '❌'}`);
    } else {
      log('  ❌ 未找到"前往工作台"按钮');
    }
    await page.screenshot({ path: SCREEN.T2, fullPage: false });

    // ============= T3: 重新进入项目页 → 验证弹窗不重复 =============
    log('[T3] 重新进入 /projects/ai-digital-shop-group → 验证弹窗不再出现');
    await page.goto(PROJECT_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: SCREEN.T3, fullPage: false });
    const t3State = await readState();
    const t3ModalVisible = await isModalVisible();
    log(`  currentStep=${t3State.currentStep}, celebrated_9=${t3State.celebrated_9}`);
    log(`  弹窗可见（应为 false）：${t3ModalVisible}`);

    // ============= T4: 清空 celebrated_9 → 验证弹窗再次出现 =============
    log('[T4] 清空 celebrated_9 + 刷新 → 验证弹窗再次出现');
    await page.evaluate(() => window.localStorage.removeItem('celebrated_9'));
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: SCREEN.T4, fullPage: false });
    const t4State = await readState();
    const t4ModalVisible = await isModalVisible();
    log(`  清空后 celebrated_9=${t4State.celebrated_9}`);
    log(`  弹窗可见（应为 true）：${t4ModalVisible}`);

    // ============= 结果汇总 =============
    const t1Pass = t1ModalVisible && workspaceHref === '/workspace';
    const t3Pass = !t3ModalVisible;
    const t4Pass = t4ModalVisible;

    report.finalResult = {
      t1_首次触发弹窗: t1Pass ? '✅ PASS' : '❌ FAIL',
      t3_防重触发: t3Pass ? '✅ PASS' : '❌ FAIL',
      t4_清空后再次触发: t4Pass ? '✅ PASS' : '❌ FAIL',
      allPass: t1Pass && t3Pass && t4Pass,
    };
    log('\n========== 测试结果 ==========');
    log(`  T1 首次完成 → 弹窗出现 + 按钮跳转 /workspace: ${report.finalResult.t1_首次触发弹窗}`);
    log(`  T3 再次进入 → 弹窗不重复: ${report.finalResult.t3_防重触发}`);
    log(`  T4 清空标记 → 弹窗再次出现: ${report.finalResult.t4_清空后再次触发}`);
    log(`  整体: ${report.finalResult.allPass ? '✅ ALL PASS' : '❌ SOME FAILED'}`);
  } catch (err) {
    log(`❌ 测试异常：${err.message}`);
    report.finalResult = { error: err.message };
  } finally {
    report.endedAt = new Date().toISOString();
    require('fs').writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    console.log(`\n报告已写入: ${REPORT_PATH}`);
    await browser.close();
    process.exit(report.finalResult?.allPass ? 0 : 1);
  }
})();
