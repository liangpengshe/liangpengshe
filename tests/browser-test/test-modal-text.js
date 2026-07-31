// 验证 3 个两段式项目的模态框文案差异
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

  async function reset(slug) {
    await page.evaluate((s) => {
      localStorage.removeItem(`opc_sop_progress::${s}`)
      localStorage.removeItem(`opc_sop_subprogress::${s}`)
      localStorage.removeItem('membership_level')
      localStorage.removeItem('subscription_type')
    }, slug);
  }

  async function clickAllSubs(maxCount) {
    for (let i = 0; i < maxCount; i++) {
      const btns = await page.locator('button[aria-label="标记完成"]').all();
      if (btns.length === 0) break;
      await btns[0].click({ force: true });
      await page.waitForTimeout(400);
    }
  }

  for (const slug of ['ai-digital-shop-group', 'ai-image-text-media', 'ai-video-media']) {
    log(`\n═══ ${slug} 模态框文案 ═══`);
    await page.goto(`${BASE}/projects/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await reset(slug);
    await page.evaluate((s) => localStorage.setItem(`opc_sop_progress::${s}`, '2'), slug);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    // 触发拦截
    await clickAllSubs(5);
    await page.waitForTimeout(2000);

    const isMedia = slug === 'ai-image-text-media' || slug === 'ai-video-media';

    // 1. 标题
    const titleVisible = await page.evaluate((media) => {
      const body = document.body.textContent || '';
      return media
        ? body.includes('🔓 解锁 AI 核心选题权限')
        : body.includes('🔓 解锁核心选品权限');
    }, isMedia);
    total++; if (titleVisible) pass++;
    log(`  标题: ${titleVisible ? '✅' : '❌'} (期望: ${isMedia ? 'AI 核心选题' : '核心选品'})`);

    // 2. 描述
    const descVisible = await page.evaluate((media) => {
      const body = document.body.textContent || '';
      return media
        ? body.includes('精准选题与 AI 内容制作是自媒体项目的核心')
        : body.includes('精准选品是店群项目的核心');
    }, isMedia);
    total++; if (descVisible) pass++;
    log(`  描述: ${descVisible ? '✅' : '❌'}`);

    // 3. 权益 1
    const benefit1 = await page.evaluate((media) => {
      const body = document.body.textContent || '';
      return media
        ? body.includes('解锁 4-9 步核心选题 SOP + AI 创作工具链')
        : body.includes('解锁 4-8 步精准选品 SOP + AI 选品工具栈');
    }, isMedia);
    total++; if (benefit1) pass++;
    log(`  权益 1: ${benefit1 ? '✅' : '❌'}`);

    // 4. 权益 2 (通用,所有项目都有)
    const benefit2 = await page.evaluate(() => {
      return document.body.textContent?.includes('AI 随行教练 7×24 实操答疑') || false;
    });
    total++; if (benefit2) pass++;
    log(`  权益 2 (通用): ${benefit2 ? '✅' : '❌'}`);

    // 5. 权益 3
    const benefit3 = await page.evaluate((media) => {
      const body = document.body.textContent || '';
      return media
        ? body.includes('精准选题后 100% 爆款方向 + 内容产出跃升')
        : body.includes('精准选品后 100% 复购方向 + 客单提升');
    }, isMedia);
    total++; if (benefit3) pass++;
    log(`  权益 3: ${benefit3 ? '✅' : '❌'}`);

    // 6. 4 个底部按钮文案 + 锚点（只验"都存在"不验总数，页面其他位置可能也有相同锚点）
    const allLinks = await page.evaluate(() => {
      return [...document.querySelectorAll('a[href*="/pricing#"]')].map((a) => ({
        text: a.textContent?.trim().slice(0, 20),
        href: a.getAttribute('href'),
      }));
    });
    const hrefs = allLinks.map((b) => b.href);
    const hasAll = (k) => hrefs.some((h) => h?.includes(k));
    log(`  /pricing 链接总数: ${allLinks.length}`);
    total++; if (hasAll('plan-monthly-69')) pass++;
    total++; if (hasAll('plan-annual-199')) pass++;
    total++; if (hasAll('plan-light-598')) pass++;
    total++; if (hasAll('plan-deep-1980')) pass++;
    log(`  4 个锚点齐全: ${hasAll('plan-monthly-69') && hasAll('plan-annual-199') && hasAll('plan-light-598') && hasAll('plan-deep-1980') ? '✅' : '❌'}`);

    // 6b. 4 个底部按钮文字 (在模态框内查找)
    const modalBtnTexts = await page.evaluate(() => {
      // 找 z-[56] 的模态框容器
      const modal = document.querySelector('.z-\\[56\\]');
      if (!modal) return [];
      return [...modal.querySelectorAll('a[href*="/pricing#"]')].map((a) => a.textContent?.trim() || '');
    });
    log(`  模态框内按钮: ${modalBtnTexts.length} 个 (期望 4)`);
    total++; if (modalBtnTexts.length === 4) pass++;

    // 7. 稍后再说按钮
    const laterBtn = await page.evaluate(() => {
      return document.body.textContent?.includes('稍后再说，继续逛逛') || false;
    });
    total++; if (laterBtn) pass++;
    log(`  稍后再说: ${laterBtn ? '✅' : '❌'}`);

    // 截图
    await page.screenshot({ path: path.join(os.tmpdir(), `modal-${slug}.png`), fullPage: true });

    // 关闭模态框
    const closeBtn = page.locator('button[aria-label="关闭"]').first();
    if (await closeBtn.count() > 0) {
      await closeBtn.click({ force: true });
      await page.waitForTimeout(500);
    }
  }

  await browser.close();
  log(`\n========== 测试结果 ═══`);
  log(`  通过: ${pass}/${total}`);
  const ok = pass === total;
  log(`  整体: ${ok ? '✅ ALL PASS' : '❌ FAIL'}`);
  process.exit(ok ? 0 : 1);
})();
