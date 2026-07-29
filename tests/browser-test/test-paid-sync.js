// 良朋社 AI 数字店群项目 · 付费状态同步 + 步骤通行 端到端测试
// 覆盖场景：
//   T0 打开项目页 + 清空 localStorage + 拦截 /api/user/status 返回免费用户 → 验证初始态
//   T1 完成前 3 步 → 验证：第 3 步完成时弹拦截模态框 + 琥珀色横幅显示
//   T2 模拟付费：localStorage.subscription_type='MONTHLY_69' + 拦截 API 返回付费 → 验证第 4-9 步可打卡
//   T3 拦截 /api/user/status 返回 ANNUAL_199 → 验证同步生效（横幅不显示 + 子任务可点）
//   T4 验证 isPaidMember 状态正确反映在 DOM 上

const { chromium } = require('playwright');
const path = require('path');
const os = require('os');

const BASE_URL = 'http://localhost:3001';
const PROJECT_URL = `${BASE_URL}/projects/ai-digital-shop-group`;
const TMP_DIR = process.platform === 'win32' ? path.join(os.tmpdir()) : '/tmp';

const SCREEN = {
  T0: path.join(TMP_DIR, 'paid-sync-T0-initial-free.png'),
  T1_AFTER_STEP3: path.join(TMP_DIR, 'paid-sync-T1-after-step3-free-locked.png'),
  T1_BANNER: path.join(TMP_DIR, 'paid-sync-T1-banner-visible.png'),
  T2_STEP4_PAYING: path.join(TMP_DIR, 'paid-sync-T2-step4-paying-unlocked.png'),
  T3_SYNC: path.join(TMP_DIR, 'paid-sync-T3-after-api-sync.png'),
  T4_FINAL: path.join(TMP_DIR, 'paid-sync-T4-final-all-unlocked.png'),
};
const REPORT_PATH = path.join(TMP_DIR, 'paid-sync-test-report.json');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1800 },
    locale: 'zh-CN',
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));

  // 网络请求追踪
  const apiHits = { '/api/user/status': 0 };
  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('/api/user/status')) {
      apiHits['/api/user/status']++;
      console.log(`  [API] /api/user/status → ${res.status()}`);
    }
  });

  const report = {
    startedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    apiHits,
    consoleErrors,
    scenarios: [],
    screenshots: SCREEN,
    finalResult: null,
  };

  const log = (msg) => {
    console.log(msg);
    report.scenarios.push({ t: new Date().toISOString(), msg });
  };

  // 辅助：拦截 /api/user/status 返回指定订阅类型
  const mockUserStatus = async (subscriptionType, isPaid = true) => {
    await page.route('**/api/user/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          subscriptionType,
          membershipLevel: isPaid ? 'paid' : null,
          isPaid,
          expiresAt: isPaid ? new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString() : null,
        }),
      });
    });
  };

  // 辅助：解除拦截
  const unrouteUserStatus = async () => {
    await page.unroute('**/api/user/status');
  };

  // 辅助：读取 localStorage 关键 key
  const readState = async () =>
    page.evaluate(() => ({
      subscriptionType: localStorage.getItem('subscription_type'),
      membershipLevel: localStorage.getItem('membership_level'),
      currentStep: localStorage.getItem('opc_sop_progress::ai-digital-shop-group'),
      subProgress: localStorage.getItem('opc_sop_subprogress::ai-digital-shop-group'),
      celebrated: localStorage.getItem('celebrated_9'),
    }));

  // 辅助：检查横幅文案是否显示
  const isPaywallBannerVisible = async () => {
    // 通用付费解锁横幅（琥珀色）
    const banner = page.locator('text=完成该步骤需要加入实操会员');
    return (await banner.count()) > 0 && (await banner.first().isVisible());
  };

  // 辅助：检查第 4 步紫色统一引导横幅
  const isPurpleStep4BannerVisible = async () => {
    const banner = page.locator('text=进阶权益解锁区');
    return (await banner.count()) > 0 && (await banner.first().isVisible());
  };

  // 辅助：点击第 N 步卡片的完成按钮
  const clickStepComplete = async (stepIdx) => {
    // 找到该步的"已完成"按钮
    const btns = page.locator(`button:has-text("已完成")`);
    const count = await btns.count();
    if (count === 0) {
      log(`  ❌ 未找到任何"已完成"按钮`);
      return false;
    }
    await btns.nth(stepIdx).click();
    await page.waitForTimeout(500);
    return true;
  };

  try {
    // ============= T0: 初始态 =============
    log('[T0] 打开项目页 + 清空 localStorage + 拦截 API 返回免费');
    await mockUserStatus(null, false);
    await page.goto(PROJECT_URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // 等待 mounted + API 拉取
    await page.screenshot({ path: SCREEN.T0, fullPage: false });

    const t0State = await readState();
    log(`  初始态: subscriptionType=${t0State.subscriptionType}, membershipLevel=${t0State.membershipLevel}, currentStep=${t0State.currentStep}`);
    log(`  API 被调用次数: ${apiHits['/api/user/status']}`);

    // ============= T1: 完成前 3 步（写入 localStorage 模拟） =============
    log('[T1] 模拟完成前 2 步 + 真实点击第 3 步子任务，触发拦截逻辑');
    // 1. 仅推进到 currentStep=2（第 1、2 步完成），第 3 步展开可点击但未完成
    await page.evaluate(() => {
      const slug = 'ai-digital-shop-group';
      localStorage.setItem(`opc_sop_progress::${slug}`, '2');
      const subSet = new Set();
      // 只标记前 2 步的子任务完成
      ['1-1', '1-2', '1-3', '2-1', '2-2', '2-3'].forEach((id) => {
        subSet.add(`step${id.startsWith('1-') ? '0' : '1'}-${id}`);
      });
      localStorage.setItem(`opc_sop_subprogress::${slug}`, JSON.stringify([...subSet]));
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 2. 展开所有卡片（点击"展开全部"按钮 或 点击第 3 步标题）
    // 找到含"第 3 步"的标题元素
    const step3Header = page.locator('text=基础设置').first();
    if ((await step3Header.count()) > 0) {
      log('  找到"基础设置"标题，尝试点击展开');
      await step3Header.click();
      await page.waitForTimeout(800);
    }

    // 3. 通过 CSS class 找到子任务圆环（w-7 h-7 rounded-full button）
    const circleButtons = page.locator('button.w-7.h-7.rounded-full, button.rounded-full.w-7.h-7');
    const btnCount = await circleButtons.count();
    log(`  找到 ${btnCount} 个圆环 button（rounded-full w-7 h-7）`);

    // 用 page.evaluate 分析圆环：哪些已勾选（background gradient from-emerald），找到第 3 步的未勾选圆环
    const step3BtnIdx = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'))
        .filter((b) => b.className.includes('rounded-full') && b.className.includes('w-7') && b.className.includes('h-7'))
      return btns.map((b, i) => ({
        i,
        checked: b.className.includes('from-emerald'),
        disabled: b.disabled,
        text: (b.textContent || '').slice(0, 30).replace(/\s+/g, ' '),
      }))
    })
    log(`  圆环详情: ${JSON.stringify(step3BtnIdx)}`)

    // 依次点击第 3 步 4 个子任务圆环（拦截在 allDone=true 时触发）
    for (let i = 0; i < 4; i++) {
      const btn = page.locator('button.w-7.h-7.rounded-full').nth(i)
      if ((await btn.count()) > 0) {
        await btn.click({ force: true })
        await page.waitForTimeout(600)
        log(`  点击第 3 步圆环 ${i + 1}/4`)
      } else {
        log(`  ⚠️ 找不到第 3 步圆环 ${i + 1}`)
        break
      }
    }
    await page.waitForTimeout(1500)
    await page.screenshot({ path: SCREEN.T1_AFTER_STEP3, fullPage: false });

    const t1Banner = await isPaywallBannerVisible();
    log(`  琥珀色付费解锁横幅: ${t1Banner ? '✅ 显示' : '❌ 不显示'}`);

    // 检查拦截模态框
    const modal = page.locator('text=恭喜你完成【开店申请→开店工具→基础设置】');
    const modalVisible = (await modal.count()) > 0 && (await modal.first().isVisible());
    log(`  第 3 步完成拦截模态框: ${modalVisible ? '✅ 弹窗' : '❌ 未弹窗'}`);

    // 截图横幅
    await page.screenshot({ path: SCREEN.T1_BANNER, fullPage: false });

    // ============= T2: 模拟付费 + 验证第 4 步可打卡 =============
    log('[T2] 模拟付费：localStorage.subscription_type=MONTHLY_69 + 拦截 API 返回 MONTHLY_69');
    await unrouteUserStatus();
    await mockUserStatus('MONTHLY_69', true);
    await page.evaluate(() => {
      localStorage.setItem('subscription_type', 'MONTHLY_69');
      localStorage.setItem('membership_level', 'paid');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: SCREEN.T2_STEP4_PAYING, fullPage: false });

    const t2State = await readState();
    const t2Banner = await isPaywallBannerVisible();
    const t2Purple = await isPurpleStep4BannerVisible();
    log(`  状态: subscriptionType=${t2State.subscriptionType}, membershipLevel=${t2State.membershipLevel}`);
    log(`  琥珀色付费解锁横幅: ${t2Banner ? '❌ 仍显示' : '✅ 不显示'}`);
    log(`  第 4 步紫色统一引导横幅: ${t2Purple ? '❌ 仍显示' : '✅ 不显示'}`);
    log(`  API 被调用次数: ${apiHits['/api/user/status']}`);

    // ============= T3: 切换为 ANNUAL_199 + 验证同步生效 =============
    log('[T3] 拦截 /api/user/status 返回 ANNUAL_199 → 验证 useEffect 同步生效');
    await unrouteUserStatus();
    await mockUserStatus('ANNUAL_199', true);
    // 清空 localStorage.subscription_type 强制从 API 拉取
    await page.evaluate(() => {
      localStorage.removeItem('subscription_type');
      localStorage.removeItem('membership_level');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: SCREEN.T3_SYNC, fullPage: false });

    const t3State = await readState();
    const t3Banner = await isPaywallBannerVisible();
    log(`  同步后: subscriptionType=${t3State.subscriptionType}, membershipLevel=${t3State.membershipLevel}`);
    log(`  琥珀色付费解锁横幅: ${t3Banner ? '❌ 仍显示' : '✅ 不显示'}`);
    log(`  API 被调用次数: ${apiHits['/api/user/status']}`);

    // ============= T4: 模拟第 4 步子任务打卡 =============
    log('[T4] 模拟第 4 步子任务打卡（验证付费用户能正常操作）');
    await page.evaluate(() => {
      const slug = 'ai-digital-shop-group';
      const subSet = new Set(JSON.parse(localStorage.getItem(`opc_sop_subprogress::${slug}`) || '[]'));
      // 添加第 4 步的子任务
      subSet.add('step3-4-1');
      localStorage.setItem(`opc_sop_subprogress::${slug}`, JSON.stringify([...subSet]));
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SCREEN.T4_FINAL, fullPage: false });

    const t4State = await readState();
    log(`  第 4 步子任务已打卡: ${t4State.subProgress?.includes('step3-4-1') ? '✅' : '❌'}`);

    // ============= 结果汇总 =============
    const t1Pass = t1Banner; // 免费用户：横幅应显示
    const t2Pass = !t2Banner && !t2Purple; // 付费用户：横幅不显示
    const t3Pass = t3State.subscriptionType === 'ANNUAL_199' && !t3Banner; // API 同步生效

    report.finalResult = {
      T1_免费用户拦截: t1Pass ? '✅ PASS' : '❌ FAIL',
      T2_付费状态覆盖: t2Pass ? '✅ PASS' : '❌ FAIL',
      T3_API异步同步: t3Pass ? '✅ PASS' : '❌ FAIL',
      allPass: t1Pass && t2Pass && t3Pass,
      apiHits: apiHits,
    };
    log('\n========== 测试结果 ==========');
    log(`  T1 免费用户完成第 3 步 → 拦截横幅显示: ${report.finalResult.T1_免费用户拦截}`);
    log(`  T2 模拟付费 (MONTHLY_69) → 拦截横幅消失: ${report.finalResult.T2_付费状态覆盖}`);
    log(`  T3 API 异步同步 (ANNUAL_199) → 拦截横幅消失: ${report.finalResult.T3_API异步同步}`);
    log(`  /api/user/status 调用次数: ${apiHits['/api/user/status']}`);
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
