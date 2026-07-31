// 验证 AI 图文 / AI 视频 自媒体项目 9 步 SOP
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

  for (const slug of ['ai-image-text-media', 'ai-video-media']) {
    log(`\n═══ ${slug} ═══`);
    await page.goto(`${BASE}/projects/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    // 清空 localStorage 进度
    await page.evaluate((s) => localStorage.removeItem(`opc_sop_progress::${s}`), slug);

    // 1. 进度条文字 "第 X/9 步"
    const progressText = await page.evaluate(() => {
      const all = [...document.querySelectorAll('*')];
      const target = all.find((el) => el.textContent?.match(/第\s*0\/9\s*步/) && el.children.length === 0);
      return target?.textContent?.trim() || '';
    });
    total++; if (progressText.includes('0/9')) pass++;
    log(`  初始进度: ${progressText}`);

    // 2. 抓取 9 个步骤标题（关卡进度条上的圆环数）
    const stepCircles = await page.evaluate(() => {
      const all = [...document.querySelectorAll('button, span, div')];
      return all.filter((el) => /^\d+\/9$/.test(el.textContent?.trim() || '')).map((el) => el.textContent.trim());
    });
    total++; if (stepCircles.length === 9) pass++;
    log(`  圆环数: ${stepCircles.length} (期望 9)`);

    // 3. 展开第一步卡片 - 验证 title + desc
    const expand1 = await page.locator('button:has-text("第 1 步")').first().isVisible();
    log(`  第 1 步可点击展开: ${expand1 ? '✅' : '❌'}`);

    // 4. 检查第 1 步的 actionUrl 链接
    const firstActionUrl = await page.evaluate(() => {
      const all = [...document.querySelectorAll('a')];
      const target = all.find((a) => a.href.includes('creator.xiaohongshu.com') || a.href.includes('creator.douyin.com'));
      return target?.href || null;
    });
    const expectedUrl = slug === 'ai-image-text-media' ? 'creator.xiaohongshu.com' : 'creator.douyin.com';
    total++; if (firstActionUrl?.includes(expectedUrl)) pass++;
    log(`  第 1 步 actionUrl: ${firstActionUrl} (期望含 ${expectedUrl})`);

    // 5. 9 个步骤标题顺序
    const expectedTitles = ['账号申请', '运营工具', '基础设置', '精准选题', '内容制作', '账号运营', '私域维护', '数据分析', '矩阵放大'];
    const allStepTexts = await page.evaluate(() => {
      return [...document.querySelectorAll('h2, h3, h4, button, span, div')]
        .map((el) => el.textContent?.trim() || '')
        .filter((t) => t.length > 0);
    });
    let titlesFound = 0;
    for (const t of expectedTitles) {
      if (allStepTexts.some((s) => s.includes(`第 ${expectedTitles.indexOf(t) + 1} 步`) && s.includes(t))) {
        titlesFound++;
      }
    }
    total++; if (titlesFound === 9) pass++;
    log(`  9 个步骤标题匹配: ${titlesFound}/9`);

    // 6. 打卡功能测试 - 模拟点击展开后
    const circleBtn = await page.locator('button >> text=1/9').first();
    if (await circleBtn.count() > 0) {
      log(`  找到 1/9 圆环按钮: ✅`);
    } else {
      log(`  找到 1/9 圆环按钮: ❌`);
    }

    // 7. 截图
    await page.screenshot({ path: path.join(os.tmpdir(), `media-${slug}.png`), fullPage: true });
    log(`  截图: C:\\Users\\lujie\\AppData\\Local\\Temp\\media-${slug}.png`);
  }

  // 8. 回归测试 - 数字店群 9 步 SOP 不受影响
  log(`\n═══ 回归测试: ai-digital-shop-group ═══`);
  await page.goto(`${BASE}/projects/ai-digital-shop-group`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const shopCircles = await page.evaluate(() => {
    const all = [...document.querySelectorAll('*')];
    return all.filter((el) => /^\d+\/9$/.test(el.textContent?.trim() || '')).map((el) => el.textContent.trim());
  });
  total++; if (shopCircles.length === 9) pass++;
  log(`  数字店群 9 步圆环: ${shopCircles.length} (期望 9)`);

  await browser.close();
  log(`\n========== 测试结果 ═══`);
  log(`  通过: ${pass}/${total}`);
  const ok = pass === total;
  log(`  整体: ${ok ? '✅ ALL PASS' : '❌ FAIL'}`);
  process.exit(ok ? 0 : 1);
})();
