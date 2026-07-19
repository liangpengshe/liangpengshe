// 良朋社首页 STEP 02 状态切换端到端测试
// 流程：
//   T0 打开首页（清空 localStorage）        → 截屏：STEP 02 应为"🔒 待解锁"
//   T1 设置诊断完成（opcLevel=flow）        → 截屏：STEP 02 应为"⏳ 进行中"
//   T2 完成 3 个学习任务（browse+register+download）→ 截屏：STEP 02 应为"✅ 已完成"
//   T3 点击 STEP 02 卡片                     → 验证跳转到 /market/projects?recommend=flow
// 全部对比截图保存到 %TEMP%\step02-*.png

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');

const BASE_URL = 'http://localhost:3001';
const HOME_URL = `${BASE_URL}/`;
const TARGET_URL = `${BASE_URL}/market/projects?recommend=flow`;
const TMP_DIR = process.platform === 'win32' ? path.join(os.tmpdir()) : '/tmp';

// 截屏路径
const SCREEN_T0 = path.join(TMP_DIR, 'step02-T0-locked.png');
const SCREEN_T1 = path.join(TMP_DIR, 'step02-T1-active.png');
const SCREEN_T2 = path.join(TMP_DIR, 'step02-T2-done.png');
const SCREEN_T3 = path.join(TMP_DIR, 'step02-T3-clicked.png');
const REPORT_PATH = path.join(TMP_DIR, 'step02-test-report.json');

(async () => {
  const browser = await chromium.launch({ headless: true });
  // 用全新 context，确保 localStorage / cookies / sessionStorage 完全隔离
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1800 },
    locale: 'zh-CN',
    storageState: undefined, // 显式声明无持久化状态
  });
  const page = await context.newPage();

  // 监听控制台错误
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));

  const report = {
    startedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    steps: [],
    apiResults: [],
    step02States: [],
    finalUrl: null,
    targetUrl: TARGET_URL,
    consoleErrors,
    screenshots: { T0: SCREEN_T0, T1: SCREEN_T1, T2: SCREEN_T2, T3: SCREEN_T3 },
  };

  const log = (msg) => {
    console.log(msg);
    report.steps.push({ t: new Date().toISOString(), msg });
  };

  /**
   * 在浏览器中读取 STEP 02 卡片的实际状态
   * 1. 找含"STEP 02"和"学习入门"的按钮（精准定位 4 步路径卡）
   * 2. 抓 badge 的文本 + className（含 bg-... / text-... / border-... / animate-...）
   */
  const readStep02State = async () => {
    return await page.evaluate(() => {
      // 找 STEP 02 学习入门 卡片 - 优先按按钮（卡片是 button）+ "学习入门"文本
      const allBtns = Array.from(document.querySelectorAll('button'));
      const card = allBtns.find((b) => {
        const t = (b.textContent || '').trim();
        // 必须同时含 STEP 02 + 学习入门 + 徽章关键词（区分于其他区域的"学习入门"文本）
        return /STEP\s*02/.test(t) && t.includes('学习入门');
      });

      if (!card) return { found: false, error: 'no STEP 02 button found' };

      // 找 badge：取按钮内所有 span，取最后一个含 emoji 状态词的
      const spans = Array.from(card.querySelectorAll('span'));
      const badge = spans.find((s) => {
        const t = (s.textContent || '').trim();
        return /^(✅|⏳|🔒)/.test(t);
      });

      return {
        found: true,
        cardClass: card.className.substring(0, 200),
        badge: badge
          ? {
              text: badge.textContent.trim(),
              className: badge.className,
              bg: (badge.className.match(/bg-\S+/g) || []).join(' '),
              textColor: (badge.className.match(/text-\S+/g) || []).join(' '),
              border: (badge.className.match(/border\S*/g) || []).join(' '),
              animate: badge.className.includes('animate-pulse'),
            }
          : null,
      };
    });
  };

  try {
    // ══════════════════════════════════════════════════════════
    // T0 — 打开首页 + 清空 localStorage
    // ══════════════════════════════════════════════════════════
    log(`[T0] 打开 ${HOME_URL}`);
    await page.goto(HOME_URL, { waitUntil: 'networkidle', timeout: 30000 });

    log('[T0] 清空 localStorage（模拟新用户）');
    const cleared = await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        return {
          cleared: true,
          lsKeys: Object.keys(localStorage).length,
          ssKeys: Object.keys(sessionStorage).length,
        };
      } catch (e) {
        return { cleared: false, error: e.message };
      }
    });
    log(`[T0] 清空结果: ${JSON.stringify(cleared)}`);

    await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);

    // 验证 T0 真的是空状态
    const t0Ls = await page.evaluate(() => ({
      opc_level: localStorage.getItem('opc_level'),
      learning_score: localStorage.getItem('learning_score'),
      can_unlock_practice: localStorage.getItem('can_unlock_practice'),
      step_learning_done: localStorage.getItem('step_learning_done'),
      device_id: localStorage.getItem('opc_device_id'),
    }));
    log(`[T0] 当前 localStorage: ${JSON.stringify(t0Ls)}`);

    const t0State = await readStep02State();
    report.step02States.push({ phase: 'T0', ...t0State });
    log(`[T0] STEP 02 状态: found=${t0State.found}  badge=${t0State.badge?.text}  bg="${t0State.badge?.bg}"`);

    log(`[T0] 截屏保存到 ${SCREEN_T0}`);
    await page.screenshot({ path: SCREEN_T0, fullPage: true });

    // ══════════════════════════════════════════════════════════
    // T1 — 设置诊断完成（opcLevel=flow），STEP 02 应变为"⏳ 进行中"
    // ══════════════════════════════════════════════════════════
    log('[T1] 写入 localStorage：opc_level=FLOW（模拟已诊断）');
    const phone = 'test-step02-' + Date.now();
    await page.evaluate((p) => {
      try {
        // 同步写 device_id（用于让首页 fetch API）
        localStorage.setItem('opc_device_id', p);
        localStorage.setItem('opc_level', 'FLOW');
      } catch (e) {}
    }, phone);

    // 同步通过 API 把 opcLevel 写入服务端（模拟完整的诊断完成）
    log('[T1] 调用 API set-opc FLOW（让服务端也有记录）');
    const setOpc = await page.evaluate(async (p) => {
      const r = await fetch('/api/user/learning-progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: p, action: 'set-opc', opcLevel: 'FLOW' }),
      });
      return await r.json();
    }, phone);
    log(`[T1] API set-opc 返回: opcLevel=${setOpc.data?.opcLevel}  step_diagnosis_done=${setOpc.data?.step_diagnosis_done}`);

    log('[T1] 刷新页面');
    await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);

    const t1State = await readStep02State();
    report.step02States.push({ phase: 'T1', ...t1State });
    log(`[T1] STEP 02 状态: found=${t1State.found}  badge=${t1State.badge?.text}  bg="${t1State.badge?.bg}"  animate=${t1State.badge?.animate}`);

    log(`[T1] 截屏保存到 ${SCREEN_T1}`);
    await page.screenshot({ path: SCREEN_T1, fullPage: true });

    // ══════════════════════════════════════════════════════════
    // T2 — 完成 3 个学习任务（browse + register + download = 100 分）
    //     STEP 02 应自动从"进行中"变为"✅ 已完成"（绿色）
    // ══════════════════════════════════════════════════════════
    log('[T2] 调用 PATCH /api/user/learning-progress 模拟 3 个任务完成');
    const actions = ['browse', 'register', 'download'];
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
      log(`    [T2] - ${action.padEnd(10)} status=${r.status} score=${d.learning_score} task_${action}=${d['task_' + action]} unlock=${d.can_unlock_practice} learning_done=${d.step_learning_done}`);
    }

    // 验证服务端最终状态
    const finalApi = await page.evaluate(async (p) => {
      const res = await fetch('/api/user/learning-progress?phone=' + encodeURIComponent(p));
      return await res.json();
    }, phone);
    log(`[T2] 服务端 FINAL: score=${finalApi.data.learning_score}  unlock=${finalApi.data.can_unlock_practice}  step_learning_done=${finalApi.data.step_learning_done}`);

    // 模拟 guide 页 → 同步 localStorage 后的状态
    log('[T2] 模拟 guide 页 syncProgressToLocalStorage · 写 localStorage');
    await page.evaluate((d) => {
      try {
        localStorage.setItem('learning_score', String(d.learning_score));
        localStorage.setItem('can_unlock_practice', d.can_unlock_practice ? 'true' : 'false');
        if (d.learning_score >= 80 || d.can_unlock_practice || d.step_learning_done) {
          localStorage.setItem('step_learning_done', 'true');
        }
      } catch (e) {}
    }, finalApi.data);

    // 触发首页重新读取（focus 事件 + reload）
    log('[T2] 刷新首页，等待 STEP 02 自动变绿');
    await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    const t2State = await readStep02State();
    report.step02States.push({ phase: 'T2', ...t2State });
    log(`[T2] STEP 02 状态: found=${t2State.found}  badge=${t2State.badge?.text}  bg="${t2State.badge?.bg}"  text="${t2State.badge?.textColor}"  border="${t2State.badge?.border}"`);

    // 验证是否变绿
    const isGreen = t2State.badge?.bg?.includes('green') || t2State.badge?.textColor?.includes('green');
    log(`[T2] STEP 02 是否已变绿: ${isGreen ? '✅ YES' : '❌ NO'}`);

    log(`[T2] 截屏保存到 ${SCREEN_T2}`);
    await page.screenshot({ path: SCREEN_T2, fullPage: true });

    // ══════════════════════════════════════════════════════════
    // T3 — 点击 STEP 02 卡片，验证跳转到 /market/projects?recommend=flow
    // ══════════════════════════════════════════════════════════
    log('[T3] 点击 STEP 02 卡片（用 button + 学习入门 文本定位）');
    const step02Btn = page.locator('button', { hasText: '学习入门' }).first();
    const btnCount = await page.locator('button', { hasText: '学习入门' }).count();
    log(`[T3] 找到 ${btnCount} 个含"学习入门"文本的按钮`);

    if (btnCount > 0) {
      await Promise.all([
        page.waitForURL(`**/market/projects**`, { timeout: 10000 }).catch((e) => {
          log(`[T3] waitForURL 警告: ${e.message}`);
        }),
        step02Btn.click().catch((e) => {
          log(`[T3] 点击失败: ${e.message}`);
        }),
      ]);
      log(`[T3] 点击完成  url=${page.url()}`);
    } else {
      log('[T3] 未找到 STEP 02 按钮 DOM，跳过点击测试');
    }

    await page.waitForTimeout(2000);
    report.finalUrl = page.url();
    const urlOk = page.url().includes('/market/projects') && page.url().includes('recommend=flow');
    log(`[T3] 期望 URL: ${TARGET_URL}`);
    log(`[T3] 实际 URL: ${page.url()}`);
    log(`[T3] URL 校验: ${urlOk ? '✅ PASS' : '❌ FAIL'}`);

    log(`[T3] 截屏保存到 ${SCREEN_T3}`);
    await page.screenshot({ path: SCREEN_T3, fullPage: true });

    // ══════════════════════════════════════════════════════════
    // 最终汇总
    // ══════════════════════════════════════════════════════════
    log('');
    log('═══════════════════════════════════════════');
    log('            测试结果汇总');
    log('═══════════════════════════════════════════');
    log(`T0 初始(空 localStorage): badge=${report.step02States[0]?.badge?.text || 'N/A'}  bg="${report.step02States[0]?.badge?.bg || 'N/A'}"`);
    log(`T1 诊断完成(FLOW):        badge=${report.step02States[1]?.badge?.text || 'N/A'}  bg="${report.step02States[1]?.badge?.bg || 'N/A'}"  animate=${report.step02States[1]?.badge?.animate}`);
    log(`T2 学习完成(100分):       badge=${report.step02States[2]?.badge?.text || 'N/A'}  bg="${report.step02States[2]?.badge?.bg || 'N/A'}"  text="${report.step02States[2]?.badge?.textColor || 'N/A'}"  border="${report.step02States[2]?.badge?.border || 'N/A'}"`);
    log(`T3 点击跳转:              ${urlOk ? '✅ PASS' : '❌ FAIL'}  url=${page.url()}`);
    log('');
    log(`控制台错误: ${consoleErrors.length} 个`);
    if (consoleErrors.length > 0) {
      consoleErrors.slice(0, 5).forEach((e, i) => log(`  [err ${i + 1}] ${e}`));
    }
    log('═══════════════════════════════════════════');
  } catch (err) {
    log(`[FATAL] ${err.message}`);
    console.error(err.stack);
    report.fatal = err.message;
  } finally {
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
    log(`[报告] 完整 JSON 保存到: ${REPORT_PATH}`);
    log(`[截屏] T0=${SCREEN_T0}`);
    log(`[截屏] T1=${SCREEN_T1}`);
    log(`[截屏] T2=${SCREEN_T2}`);
    log(`[截屏] T3=${SCREEN_T3}`);
    await browser.close();
  }
})();
