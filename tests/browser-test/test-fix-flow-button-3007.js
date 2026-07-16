// 良朋社 /guide/flow → /market/projects?recommend=flow Bug 修复验证 (port 3007)
// 验证 localStorage 中历史 opc_level=TRADER 是否会被 URL level=flow 覆盖
const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');

const BASE_URL = 'http://localhost:3007/guide/flow';
const TMP_DIR = process.platform === 'win32' ? path.join(os.tmpdir()) : '/tmp';
const REPORT_PATH = path.join(TMP_DIR, 'fix-test-3007-report.json');
const SHOT_BEFORE = path.join(TMP_DIR, 'fix-test-3007-before-click.png');
const SHOT_AFTER = path.join(TMP_DIR, 'fix-test-3007-after-click.png');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 1800 } });
  const page = await context.newPage();

  const consoleLogs = [];
  page.on('console', (msg) => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', (err) => {
    consoleLogs.push(`[pageerror] ${err.message}`);
  });

  const report = {
    steps: [],
    rawData: {},
    assertions: {},
  };

  try {
    // 步骤 1: 打开 /guide/flow
    console.log('='.repeat(80));
    console.log('[步骤 1] 打开 URL:', BASE_URL);
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    report.steps.push({ step: 1, status: 'ok', url: page.url() });

    // 步骤 2: 等待 2 秒
    console.log('[步骤 2] 等待 2 秒');
    await page.waitForTimeout(2000);
    report.steps.push({ step: 2, status: 'ok' });

    // 步骤 3: 故意把 localStorage.opc_level 设置为 'TRADER'（模拟历史诊断残留）
    console.log('[步骤 3] 注入 localStorage 模拟历史诊断残留 + 完成所有任务');
    const setupResult = await page.evaluate(async () => {
      const phone = 'port3007-test-' + Date.now();
      localStorage.setItem('opc_device_id', phone);
      localStorage.setItem('opc_level', 'TRADER'); // 关键：故意冲突
      localStorage.setItem('task_browse', 'true');
      localStorage.setItem('task_register', 'true');
      localStorage.setItem('task_download', 'true');
      localStorage.setItem('learning_score', '100');
      localStorage.setItem('can_unlock_practice', 'true');
      return {
        phone,
        opcLevel: localStorage.getItem('opc_level'),
        task_browse: localStorage.getItem('task_browse'),
        task_register: localStorage.getItem('task_register'),
        task_download: localStorage.getItem('task_download'),
        learning_score: localStorage.getItem('learning_score'),
        can_unlock_practice: localStorage.getItem('can_unlock_practice'),
      };
    });
    report.rawData.localStorageAfterSetup = setupResult;
    report.steps.push({ step: 3, status: 'ok', data: setupResult });
    console.log('[步骤 3] 完成:', JSON.stringify(setupResult));

    // 步骤 4: 调用 4 个 PATCH 接口
    console.log('[步骤 4] 调用 4 个 PATCH 接口');
    const patchResults = await page.evaluate(async (phone) => {
      const results = [];
      for (const action of ['browse', 'register', 'download', 'practice-done']) {
        try {
          const res = await fetch('/api/user/learning-progress', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, action }),
          });
          const data = await res.json();
          results.push({ action, httpStatus: res.status, body: data });
        } catch (err) {
          results.push({ action, error: err.message });
        }
      }
      return results;
    }, setupResult.phone);
    report.rawData.patchResults = patchResults;
    report.steps.push({ step: 4, status: 'ok', data: patchResults });
    console.log('[步骤 4] 完成');
    patchResults.forEach((r) => {
      console.log(`  - ${r.action}: HTTP ${r.httpStatus} success=${r.body?.success}`);
    });

    // 步骤 5: 刷新页面，等待 2 秒
    console.log('[步骤 5] 刷新页面');
    await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    report.steps.push({ step: 5, status: 'ok' });

    // 步骤 6: 找到"💪 我自己来，开始干！"按钮
    console.log('[步骤 6] 定位按钮');
    const buttonInfo = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const targetBtn = buttons.find((b) =>
        b.textContent && b.textContent.includes('我自己来')
      );
      if (!targetBtn) return { found: false };
      targetBtn.scrollIntoView({ behavior: 'instant', block: 'center' });
      const rect = targetBtn.getBoundingClientRect();
      return {
        found: true,
        text: targetBtn.textContent.trim(),
        visible: rect.width > 0 && rect.height > 0,
        className: targetBtn.className,
      };
    });
    report.rawData.buttonBeforeClick = buttonInfo;
    report.steps.push({ step: 6, status: buttonInfo.found ? 'ok' : 'error', data: buttonInfo });
    console.log('[步骤 6] 按钮:', JSON.stringify(buttonInfo));

    await page.screenshot({ path: SHOT_BEFORE, fullPage: true });
    console.log('[截图 1] 点击前:', SHOT_BEFORE);
    report.rawData.screenshotBefore = SHOT_BEFORE;

    // 步骤 7: 点击前验证 localStorage.opc_level
    console.log('[步骤 7] 点击前验证 localStorage.opc_level');
    const beforeClickLvl = await page.evaluate(() => localStorage.getItem('opc_level'));
    report.rawData.localStorageBeforeClick = { opcLevel: beforeClickLvl };
    report.steps.push({ step: 7, status: 'ok', data: { opcLevel: beforeClickLvl } });
    console.log('[步骤 7] localStorage.opc_level =', beforeClickLvl);

    // 步骤 8: 点击按钮
    console.log('[步骤 8] 点击按钮');
    const btnLocator = page.locator('button:has-text("我自己来")');
    await btnLocator.first().click();
    report.steps.push({ step: 8, status: 'ok' });

    // 步骤 9: 等待 URL 跳转完成
    console.log('[步骤 9] 等待 URL 跳转');
    try {
      await page.waitForURL(/\/market\/projects/, { timeout: 10000 });
    } catch (e) {
      console.log('[步骤 9] waitForURL 超时, 当前 URL =', page.url());
    }
    await page.waitForTimeout(1500);
    const finalUrl = page.url();
    report.rawData.urlAfterNavigation = finalUrl;
    report.steps.push({ step: 9, status: 'ok', url: finalUrl });
    console.log('[步骤 9] 当前 URL:', finalUrl);

    // 步骤 10: 验证 URL
    console.log('[步骤 10] 验证 URL');
    const urlObj = new URL(finalUrl);
    const recommend = urlObj.searchParams.get('recommend');
    report.assertions.urlCheck = {
      fullUrl: finalUrl,
      pathname: urlObj.pathname,
      recommendParam: recommend,
      expected: '/market/projects?recommend=flow',
      expectedRecommend: 'flow',
      actualRecommend: recommend,
      pass: recommend === 'flow' && urlObj.pathname === '/market/projects',
    };
    console.log('[步骤 10] recommend param =', recommend, ' 期望 = flow');
    console.log('[步骤 10] 断言通过 =', report.assertions.urlCheck.pass);

    // 步骤 11: 验证 localStorage.opc_level
    console.log('[步骤 11] 验证 localStorage.opc_level 同步');
    const afterClickLvl = await page.evaluate(() => localStorage.getItem('opc_level'));
    report.assertions.localStorageSync = {
      opcLevel: afterClickLvl,
      expected: 'FLOW',
      pass: afterClickLvl === 'FLOW',
    };
    console.log('[步骤 11] localStorage.opc_level =', afterClickLvl, ' 期望 = FLOW');
    console.log('[步骤 11] 同步断言通过 =', report.assertions.localStorageSync.pass);

    // 步骤 12: 等待 2 秒让项目卡片渲染
    console.log('[步骤 12] 等待 2 秒让项目卡片渲染');
    await page.waitForTimeout(2000);
    report.steps.push({ step: 12, status: 'ok' });

    // 步骤 13: 提取前 2 张卡片
    console.log('[步骤 13] 提取前 2 张项目卡片');
    const cardData = await page.evaluate(() => {
      const out = { activePanelFound: false, cards: [] };

      const activePanel = document.querySelector('[role="tabpanel"][data-state="active"]');
      out.activePanelFound = !!activePanel;

      let grid = null;
      if (activePanel) {
        grid = activePanel.querySelector('div.grid.grid-cols-1.md\\:grid-cols-2');
      }

      let cards = [];
      if (grid) {
        cards = Array.from(grid.children).filter(
          (el) => el.tagName === 'DIV' && el.querySelector('h3')
        );
      }

      out.totalCards = cards.length;
      out.first2 = cards.slice(0, 2).map((card, idx) => {
        const h3 = card.querySelector('h3');
        const title = h3 ? h3.textContent.trim() : null;
        const innerText = card.textContent;
        const hasBadge = innerText.includes('优先推荐');
        const hasRing2 = card.className.includes('ring-2');
        const allEls = Array.from(card.querySelectorAll('*'));
        const badgeEl = allEls.find(
          (n) => n.children.length === 0 && n.textContent && n.textContent.trim() === '优先推荐'
        );
        return {
          index: idx,
          title,
          hasBadge,
          hasRing2,
          hasBadgeElement: !!badgeEl,
        };
      });

      return out;
    });
    report.rawData.first2Cards = cardData;
    report.steps.push({ step: 13, status: 'ok', data: cardData });
    console.log('[步骤 13] 前 2 张卡片:');
    cardData.first2.forEach((c) => {
      console.log(`  卡片${c.index + 1}: "${c.title}" | badge=${c.hasBadge} | ring2=${c.hasRing2}`);
    });

    report.assertions.firstCard = {
      expectedTitle: 'AI自媒体运营项目',
      actualTitle: cardData.first2[0]?.title,
      expectedBadge: true,
      actualBadge: cardData.first2[0]?.hasBadge,
      expectedRing: true,
      actualRing: cardData.first2[0]?.hasRing2,
      pass:
        cardData.first2[0]?.title === 'AI自媒体运营项目' &&
        cardData.first2[0]?.hasBadge === true &&
        cardData.first2[0]?.hasRing2 === true,
    };
    report.assertions.secondCard = {
      expectedTitle: 'AI工具销售推广项目',
      actualTitle: cardData.first2[1]?.title,
      expectedBadge: true,
      actualBadge: cardData.first2[1]?.hasBadge,
      expectedRing: true,
      actualRing: cardData.first2[1]?.hasRing2,
      pass:
        cardData.first2[1]?.title === 'AI工具销售推广项目' &&
        cardData.first2[1]?.hasBadge === true &&
        cardData.first2[1]?.hasRing2 === true,
    };
    console.log('[步骤 13] 卡片 1 断言通过 =', report.assertions.firstCard.pass);
    console.log('[步骤 13] 卡片 2 断言通过 =', report.assertions.secondCard.pass);

    // 步骤 14: 截图 - 点击后
    console.log('[步骤 14] 截图点击后页面');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({ path: SHOT_AFTER, fullPage: true });
    report.rawData.screenshotAfter = SHOT_AFTER;
    console.log('[截图 2] 点击后:', SHOT_AFTER);

    // 总结
    report.summary = {
      urlPass: report.assertions.urlCheck.pass,
      localStorageSyncPass: report.assertions.localStorageSync.pass,
      firstCardPass: report.assertions.firstCard.pass,
      secondCardPass: report.assertions.secondCard.pass,
      allPass:
        report.assertions.urlCheck.pass &&
        report.assertions.localStorageSync.pass &&
        report.assertions.firstCard.pass &&
        report.assertions.secondCard.pass,
    };

    console.log('\n' + '='.repeat(80));
    console.log('[最终结论]');
    console.log('='.repeat(80));
    console.log('URL 正确 (recommend=flow):', report.assertions.urlCheck.pass ? '✅ PASS' : '❌ FAIL');
    console.log('  实际 URL:', finalUrl);
    console.log('  recommend param:', recommend);
    console.log('localStorage 同步 (opc_level=FLOW):', report.assertions.localStorageSync.pass ? '✅ PASS' : '❌ FAIL');
    console.log('  实际 opc_level:', afterClickLvl);
    console.log('卡片 1 = AI自媒体运营项目:', report.assertions.firstCard.pass ? '✅ PASS' : '❌ FAIL');
    console.log('  实际 title:', cardData.first2[0]?.title);
    console.log('卡片 2 = AI工具销售推广项目:', report.assertions.secondCard.pass ? '✅ PASS' : '❌ FAIL');
    console.log('  实际 title:', cardData.first2[1]?.title);
    console.log('整体:', report.summary.allPass ? '✅ 全部通过' : '❌ 有失败');

    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
    console.log('\n[报告] 完整 JSON 保存到:', REPORT_PATH);
  } catch (err) {
    console.error('[错误]', err.message);
    console.error(err.stack);
    report.error = { message: err.message, stack: err.stack };
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
  } finally {
    await browser.close();
  }
})();
