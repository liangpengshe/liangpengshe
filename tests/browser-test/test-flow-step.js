// 良朋社 /guide/flow → "💪 我自己来，开始干！" 完整跳转流程测试
// 流程：打开指南页 → mock 积分 → 刷新 → 找按钮 → 点击 → 验证项目库前 3 张卡片

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');

const BASE_URL = 'http://localhost:3007';
const GUIDE_URL = `${BASE_URL}/guide/flow`;
const TARGET_URL = `${BASE_URL}/market/projects?recommend=flow`;
const TMP_DIR = process.platform === 'win32' ? path.join(os.tmpdir()) : '/tmp';

const SCREEN_BUTTON = path.join(TMP_DIR, 'flow-step3-button.png');
const SCREEN_LANDING = path.join(TMP_DIR, 'flow-projects-landing.png');
const REPORT_PATH = path.join(TMP_DIR, 'flow-step-report.json');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 1800 } });
  const page = await context.newPage();

  const report = {
    steps: [],
    apiResults: [],
    finalUrl: null,
    targetUrl: TARGET_URL,
    cardData: [],
    screenshots: { button: SCREEN_BUTTON, landing: SCREEN_LANDING },
  };

  const log = (msg) => {
    console.log(msg);
    report.steps.push({ t: new Date().toISOString(), msg });
  };

  try {
    // ── 步骤 1：打开 /guide/flow ──────────────────────────────
    log(`[步骤 1] 打开 ${GUIDE_URL}`);
    await page.goto(GUIDE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    log(`[步骤 1] 完成  url=${page.url()}`);

    // ── 步骤 2：等待页面加载完成（约 2 秒） ─────────────────
    log('[步骤 2] 等待 2 秒');
    await page.waitForTimeout(2000);
    log('[步骤 2] 完成');

    // ── 步骤 3：写 localStorage ──────────────────────────────
    log('[步骤 3] 写入 localStorage（opc_device_id/level + 任务标记）');
    const phone = 'test-flow-' + Date.now();
    const lsResult = await page.evaluate((p) => {
      try {
        localStorage.setItem('opc_device_id', p);
        localStorage.setItem('opc_level', 'FLOW');
        localStorage.setItem('task_browse', 'true');
        localStorage.setItem('task_register', 'true');
        localStorage.setItem('task_download', 'true');
        localStorage.setItem('learning_score', '100');
        localStorage.setItem('can_unlock_practice', 'true');
        return {
          ok: true,
          values: {
            opc_device_id: localStorage.getItem('opc_device_id'),
            opc_level: localStorage.getItem('opc_level'),
            task_browse: localStorage.getItem('task_browse'),
            task_register: localStorage.getItem('task_register'),
            task_download: localStorage.getItem('task_download'),
            learning_score: localStorage.getItem('learning_score'),
            can_unlock_practice: localStorage.getItem('can_unlock_practice'),
          },
        };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    }, phone);
    log(`[步骤 3] phone=${phone}  localStorage=${JSON.stringify(lsResult)}`);

    // ── 步骤 4：调用 4 个 PATCH 接口 ─────────────────────────
    log('[步骤 4] 调用 4 个 PATCH /api/user/learning-progress（browse / register / download / practice-done）');
    const actions = ['browse', 'register', 'download', 'practice-done'];
    for (const action of actions) {
      const r = await page.evaluate(
        async ({ p, a }) => {
          const res = await fetch('/api/user/learning-progress', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: p, action: a }),
          });
          return { status: res.status, body: await res.json() };
        },
        { p: phone, a: action }
      );
      report.apiResults.push({ action, ...r });
      const d = r.body?.data || {};
      log(`    - ${action.padEnd(14)} status=${r.status} score=${d.learning_score} unlocked=${d.can_unlock_practice} practice_done=${d.practice_done}`);
    }

    // ── 步骤 5：刷新页面，等待橙色"恭喜达标"横幅 ───────────
    log('[步骤 5] 刷新页面，等待橙色"恭喜达标"横幅');
    await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
    // 给 useEffect 拉取进度 + 渲染一点缓冲
    await page.waitForTimeout(2000);

    const orangeVisible = await page
      .locator('text=恭喜达标')
      .first()
      .isVisible()
      .catch(() => false);
    log(`[步骤 5] 橙色"恭喜达标"横幅可见: ${orangeVisible}`);

    // 找到按钮 A
    const btnA = page.locator('button', { hasText: '💪 我自己来，开始干！' });
    const btnACount = await btnA.count();
    const btnAVisible = btnACount > 0 ? await btnA.first().isVisible() : false;
    log(`[步骤 5] 按钮 "💪 我自己来，开始干！"  count=${btnACount} visible=${btnAVisible}`);

    // ── 步骤 6：截图当前页面（看到按钮）保存到 %TEMP% ─────
    log(`[步骤 6] 截图保存到 ${SCREEN_BUTTON}`);
    await page.screenshot({ path: SCREEN_BUTTON, fullPage: true });
    log('[步骤 6] 截图完成');

    if (!btnAVisible) {
      throw new Error('按钮未渲染，无法继续测试跳转');
    }

    // ── 步骤 7：点击按钮 A ─────────────────────────────────
    log('[步骤 7] 点击 "💪 我自己来，开始干！" 按钮');
    await Promise.all([
      page.waitForURL(`**/market/projects?recommend=flow`, { timeout: 10000 }).catch((e) => {
        log(`[步骤 7] waitForURL 警告: ${e.message}`);
      }),
      btnA.first().click(),
    ]);
    log(`[步骤 7] 点击完成  url=${page.url()}`);

    // ── 步骤 8：等待跳转完成（已 waitForURL） ──────────────
    log('[步骤 8] 跳转完成');

    // ── 步骤 9：验证 URL ─────────────────────────────────
    const finalUrl = page.url();
    report.finalUrl = finalUrl;
    const expectedUrl = 'http://localhost:3007/market/projects?recommend=flow';
    const urlOk = finalUrl === expectedUrl || finalUrl.startsWith(expectedUrl);
    log(`[步骤 9] 期望 URL: ${expectedUrl}`);
    log(`[步骤 9] 实际 URL: ${finalUrl}`);
    log(`[步骤 9] URL 校验: ${urlOk ? '✅ PASS' : '❌ FAIL'}`);

    // ── 步骤 10：等待 2 秒让项目卡片渲染 ─────────────────
    log('[步骤 10] 等待 2 秒让项目卡片渲染');
    await page.waitForTimeout(2000);
    log('[步骤 10] 完成');

    // ── 步骤 11：滚动到项目库区域 ─────────────────────────
    log('[步骤 11] 滚动到项目库区域');
    const projectsTab = page.locator('[role="tabpanel"]', { hasText: 'AI 智富项目库' });
    const projectsTabCount = await projectsTab.count();
    if (projectsTabCount > 0) {
      await projectsTab.first().scrollIntoViewIfNeeded();
      log(`[步骤 11] 滚动完成  panelCount=${projectsTabCount}`);
    } else {
      // 退路：滚动到页面中部偏下
      await page.evaluate(() => window.scrollTo(0, 400));
      log('[步骤 11] 未找到项目库 panel，滚动到 400px');
    }
    await page.waitForTimeout(800);

    // ── 步骤 12：截图保存到 %TEMP%\flow-projects-landing.png ─
    log(`[步骤 12] 截图保存到 ${SCREEN_LANDING}`);
    await page.screenshot({ path: SCREEN_LANDING, fullPage: true });
    log('[步骤 12] 截图完成');

    // ── 步骤 13：列出前 3 张项目卡片 ─────────────────────
    log('[步骤 13] 在浏览器中检测前 3 张项目卡片');
    const cardData = await page.evaluate(() => {
      const out = { activePanelFound: false, gridFound: false, cards: [] };

      // 找到"AI 智富项目库"那个 TabsContent
      const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
      // 用文本筛选
      let projectsPanel = null;
      for (const p of panels) {
        if (p.textContent && p.textContent.includes('AI 智富项目库')) {
          projectsPanel = p;
          break;
        }
      }
      if (!projectsPanel) {
        // 退路：选 active panel
        projectsPanel = document.querySelector('[role="tabpanel"][data-state="active"]');
      }
      out.activePanelFound = !!projectsPanel;
      out.activePanelId = projectsPanel ? projectsPanel.id : null;
      out.activePanelClass = projectsPanel ? projectsPanel.className : null;

      let grid = null;
      if (projectsPanel) {
        grid = projectsPanel.querySelector('div.grid.grid-cols-1.md\\:grid-cols-2');
      }
      if (!grid) {
        out.gridFound = false;
        return out;
      }
      out.gridFound = true;
      out.gridClass = grid.className;

      const cards = Array.from(grid.children).filter(
        (el) => el.tagName === 'DIV' && el.querySelector('h3')
      );
      out.totalCards = cards.length;

      out.cards = cards.slice(0, 3).map((card, idx) => {
        const data = {};
        data.index = idx;
        // 标题
        const h3 = card.querySelector('h3');
        data.title = h3 ? h3.textContent.trim() : null;
        // 完整 className
        data.className = card.className;
        // 蓝色 ring 描边
        data.hasRing2 = card.className.includes('ring-2');
        data.hasRingBlue500 = card.className.includes('ring-blue-500');
        data.hasBorderBlue400 = card.className.includes('border-blue-400');
        data.hasShadowBlue = card.className.includes('shadow-blue-200');
        // 内部所有元素中是否包含 "优先推荐" 文本
        const allElements = card.querySelectorAll('*');
        let badgeEl = null;
        for (const n of allElements) {
          if (n.textContent && n.textContent.trim() === '优先推荐') {
            badgeEl = n;
            break;
          }
        }
        data.hasPriorityBadge = !!badgeEl;
        if (badgeEl) {
          data.badgeOuterHTML = badgeEl.outerHTML;
          data.badgeClassName = badgeEl.className;
          // 父容器（带渐变背景的那个 div）
          data.badgeParentClassName = badgeEl.parentElement
            ? badgeEl.parentElement.className
            : null;
        }
        return data;
      });

      return out;
    });

    report.cardData = cardData;
    log(`[步骤 13] 找到面板: ${cardData.activePanelFound}  找到 grid: ${cardData.gridFound}  总卡片数: ${cardData.totalCards}`);
    cardData.cards.forEach((c) => {
      log(
        `    [卡片 #${c.index}] 标题="${c.title}"  优先推荐徽章=${c.hasPriorityBadge}  ring-2=${c.hasRing2}  ring-blue-500=${c.hasRingBlue500}  border-blue-400=${c.hasBorderBlue400}`
      );
    });

    log('========== 全部步骤完成 ==========');
  } catch (err) {
    log(`[错误] ${err.message}`);
    console.error(err.stack);
    report.error = err.message;
  } finally {
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
    log(`[报告] 完整 JSON 保存到: ${REPORT_PATH}`);
    await browser.close();
  }
})();
