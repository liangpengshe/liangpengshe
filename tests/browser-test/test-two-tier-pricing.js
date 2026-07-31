// 两段式付费逻辑完整验证 - 修正版
const { chromium } = require('playwright');
const path = require('path');
const os = require('os');

const BASE = 'http://localhost:3001';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1800 } });
  const page = await ctx.newPage();
  let pass = 0, total = 0;
  const log = (m) => console.log(m);

  // 工具：清空 + 写进度 + 模拟付费
  async function reset(slug) {
    await page.evaluate((s) => {
      localStorage.removeItem(`opc_sop_progress::${s}`)
      localStorage.removeItem(`opc_sop_subprogress::${s}`)
      localStorage.removeItem('membership_level')
      localStorage.removeItem('subscription_type')
      localStorage.removeItem('celebrated_9')
    }, slug);
  }
  async function setPaid() {
    await page.evaluate(() => localStorage.setItem('subscription_type', 'MONTHLY_69'));
  }

  // 工具：点击多个子任务，避开 aria-label 变化问题
  async function clickAllSubs(maxCount) {
    for (let i = 0; i < maxCount; i++) {
      // 每次都重新 query
      const btns = await page.locator('button[aria-label="标记完成"]').all();
      if (btns.length === 0) break;
      await btns[0].click({ force: true });
      await page.waitForTimeout(500);
    }
  }

  // 阶段 1: 两段式项目 - 前 3 步可展开 + 第 3 步 4 子任务可点击
  log('═══ 阶段 1: 两段式项目前 3 步可点击子任务 ═══');
  for (const slug of ['ai-digital-shop-group', 'ai-image-text-media', 'ai-video-media']) {
    await page.goto(`${BASE}/projects/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await reset(slug);
    // 写 progress=2 → currentStep=2 → 第 3 步自动展开
    await page.evaluate((s) => localStorage.setItem(`opc_sop_progress::${s}`, '2'), slug);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    const subBtns = await page.locator('button[aria-label="标记完成"]').all();
    let enabled = 0;
    for (const b of subBtns) {
      if (!(await b.isDisabled())) enabled++;
    }
    total++; if (enabled >= 3) pass++;
    log(`  ${slug} 第 3 步可点击子任务: ${enabled}/3 ${enabled >= 3 ? '✅' : '❌'}`);
  }

  // 阶段 2: 第 4 步起子任务被锁
  log('\n═══ 阶段 2: 两段式项目第 4 步起子任务被锁 ═══');
  for (const slug of ['ai-image-text-media', 'ai-video-media']) {
    await page.goto(`${BASE}/projects/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await reset(slug);
    // 第 4 步（idx=3）展开
    await page.evaluate((s) => {
      localStorage.setItem(`opc_sop_progress::${s}`, '3')
    }, slug);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    const subBtns = await page.locator('button[aria-label="标记完成"]').all();
    let disabledCount = 0;
    for (const b of subBtns) {
      if (await b.isDisabled()) disabledCount++;
    }
    total++; if (disabledCount > 0) pass++;
    log(`  ${slug} 第 4 步 disabled 子任务: ${disabledCount} ${disabledCount > 0 ? '✅' : '❌'}`);
  }

  // 阶段 3: 单段式项目回归（前 2 步免费）
  log('\n═══ 阶段 3: 单段式项目回归 ═══');
  for (const slug of ['ai-no-stock-shop-group', 'ai-stock-shop-group', 'ai-cross-border']) {
    await page.goto(`${BASE}/projects/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await reset(slug);
    await page.evaluate((s) => localStorage.setItem(`opc_sop_progress::${s}`, '2'), slug);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    // 第 3 步（idx=2）展开（currentStep=2）
    const subBtns = await page.locator('button[aria-label="标记完成"]').all();
    let disabled = 0;
    for (const b of subBtns) {
      if (await b.isDisabled()) disabled++;
    }
    total++; if (disabled > 0) pass++;
    log(`  ${slug} 第 3 步（单段式）disabled: ${disabled > 0 ? '✅' : '❌'}`);
  }

  // 阶段 4: 两段式项目第 3 步完成触发拦截
  log('\n═══ 阶段 4: 两段式项目第 3 步完成触发拦截 ═══');
  for (const slug of ['ai-image-text-media', 'ai-video-media']) {
    await page.goto(`${BASE}/projects/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await reset(slug);
    await page.evaluate((s) => localStorage.setItem(`opc_sop_progress::${s}`, '2'), slug);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    // 点击 3 个子任务（用 .first() + 重新 query 避开 aria-label 变化）
    await clickAllSubs(5);
    await page.waitForTimeout(2000);

    // 检查拦截 - 模态框 + 横幅
    const modalCheck = await page.evaluate(() => {
      const body = document.body.textContent || '';
      return {
        unlock: body.includes('解锁'),
        banner: body.includes('前三步配置已经完成'),
      };
    });
    total++; if (modalCheck.unlock) pass++;
    log(`  ${slug} 拦截模态框: ${modalCheck.unlock ? '✅' : '❌'}`);

    // 关闭模态框
    const closeBtn = page.locator('button:has-text("稍后"), button:has-text("继续"), button:has-text("关闭"), button:has-text("好的")').first();
    if (await closeBtn.count() > 0) {
      await closeBtn.click({ force: true });
      await page.waitForTimeout(800);
    }

    // 检查横幅文案
    const bannerCheck = await page.evaluate(() => {
      return document.body.textContent?.includes('前三步配置已经完成') || false;
    });
    total++; if (bannerCheck) pass++;
    log(`  ${slug} 横幅文案: ${bannerCheck ? '✅' : '❌'}`);
  }

  // 阶段 5: 已付费用户 - 拦截不触发
  log('\n═══ 阶段 5: 已付费用户拦截不触发 ═══');
  for (const slug of ['ai-image-text-media', 'ai-video-media']) {
    await page.goto(`${BASE}/projects/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await reset(slug);
    await setPaid();
    await page.evaluate((s) => localStorage.setItem(`opc_sop_progress::${s}`, '2'), slug);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    await clickAllSubs(5);
    await page.waitForTimeout(2000);

    const modalCheck = await page.evaluate(() => {
      const body = document.body.textContent || '';
      return body.includes('解锁完整爆款') || body.includes('解锁并开启陪跑');
    });
    total++; if (!modalCheck) pass++;
    log(`  ${slug} 已付费不触发拦截: ${!modalCheck ? '✅' : '❌'}`);
  }

  // 截图归档
  await page.goto(`${BASE}/projects/ai-image-text-media`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await reset('ai-image-text-media');
  await page.evaluate(() => {
    localStorage.setItem('opc_sop_progress::ai-image-text-media', '2')
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await clickAllSubs(5);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(os.tmpdir(), 'two-tier-final.png'), fullPage: true });

  await browser.close();
  log(`\n========== 测试结果 ═══`);
  log(`  通过: ${pass}/${total}`);
  const ok = pass === total;
  log(`  整体: ${ok ? '✅ ALL PASS' : '❌ FAIL'}`);
  process.exit(ok ? 0 : 1);
})();
