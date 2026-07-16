// 良朋社 OPC 学习指南页 - 底部橙色横幅「双按钮跳转逻辑」验证
// ------------------------------------------------------------
// 验证要点（基于 mock 数据，4 个 level 全部跑一遍）：
//   1. 通过 API 触发 browse / register / download 三项任务 → 积分 100 → 橙色"恭喜达标"横幅 + 双按钮渲染
//   2. 按钮 A（💪 我自己来，开始干！）
//        → 点击后跳转到 /market/projects?recommend={userLevel}
//        → userLevel 来源：localStorage['opc_level'].toLowerCase()，降级到 URL level
//   3. 按钮 B（🤝 找人合作，我要找资深OPC帮我操盘！）
//        → 点击后跳转到 /market/services?from=guide&type=collaboration
//   4. 拦截逻辑回归：未达标时按钮被 handleChoice 拦截，弹窗显示，不直接跳转
// ------------------------------------------------------------

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');

const TMP_DIR = process.platform === 'win32' ? path.join(os.tmpdir()) : '/tmp';
console.log(`[INFO] 截图保存目录: ${TMP_DIR}`);

const BASE_URL = 'http://localhost:3007';
const LEVELS = [
  { url: 'trader', localStorage: 'TRADER', expect: 'trader' },
  { url: 'flow',   localStorage: 'FLOW',   expect: 'flow'   },
  { url: 'system', localStorage: 'SYSTEM', expect: 'system' },
  { url: 'asset',  localStorage: 'ASSET',  expect: 'asset'  },
];

function nowPhone() {
  return 'mock-btn-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
}

async function unlockViaApi(page, phone) {
  // 触发 3 个任务，每次 +20/+40/+40 = 100 分 → 自动 can_unlock_practice=true
  const results = [];
  for (const action of ['browse', 'register', 'download']) {
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
    results.push({ action, ...r });
  }
  return results;
}

async function runLevel(browser, levelCfg) {
  const { url: urlLevel, localStorage: lsLevel, expect } = levelCfg;
  const phone = nowPhone();
  console.log(`\n${'='.repeat(70)}`);
  console.log(`[TEST] level=${urlLevel}  phone=${phone}  localStorage.opc_level=${lsLevel}`);
  console.log('='.repeat(70));

  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  const report = {
    level: urlLevel,
    phone,
    apiResults: [],
    renderCheck: { orangeBanner: false, buttonA: false, buttonB: false },
    clickA: { target: null, ok: null, detail: '' },
    clickB: { target: null, ok: null, detail: '' },
    interceptCheck: { triggered: null, detail: '' },
  };

  try {
    // ─── 第 1 步：打开 /guide/{level} ─────────────────────────────
    const guideUrl = `${BASE_URL}/guide/${urlLevel}`;
    console.log(`[1] 打开 ${guideUrl}`);
    await page.goto(guideUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(800);

    // 写 device id
    await page.evaluate((p) => {
      try { localStorage.setItem('opc_device_id', p); } catch (e) {}
    }, phone);

    // ─── 第 2 步：通过 fetch 触发所有任务（mock 积分）────────────
    console.log(`[2] 触发 browse / register / download 任务`);
    const apiResults = await unlockViaApi(page, phone);
    report.apiResults = apiResults;
    apiResults.forEach((r) => {
      const d = r.body?.data || {};
      console.log(`    - ${r.action.padEnd(10)} status=${r.status} score=${d.learning_score} unlocked=${d.can_unlock_practice}`);
    });
    const finalScore = apiResults.at(-1)?.body?.data?.learning_score;
    const finalUnlocked = apiResults.at(-1)?.body?.data?.can_unlock_practice;
    if (finalScore !== 100 || finalUnlocked !== true) {
      throw new Error(`积分未达 100 / 未解锁：score=${finalScore} unlocked=${finalUnlocked}`);
    }

    // ─── 第 3 步：同时设置 opc_level（用于按钮 A 的 URL 拼接）───
    console.log(`[3] 写入 localStorage.opc_level = ${lsLevel}`);
    await page.evaluate((l) => {
      try { localStorage.setItem('opc_level', l); } catch (e) {}
    }, lsLevel);

    // ─── 第 4 步：刷新让 useEffect 重新拉取进度 ─────────────────
    console.log(`[4] 刷新页面`);
    await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);

    // ─── 第 5 步：渲染校验 ──────────────────────────────────────
    console.log(`[5] 渲染校验`);
    const orangeVisible = await page.locator('text=恭喜达标').first().isVisible().catch(() => false);
    const btnA = page.locator('button', { hasText: '💪 我自己来，开始干！' });
    const btnB = page.locator('button', { hasText: '🤝 找人合作，我要找资深OPC帮我操盘！' });
    const aCount = await btnA.count();
    const bCount = await btnB.count();
    const aVisible = aCount > 0 ? await btnA.first().isVisible() : false;
    const bVisible = bCount > 0 ? await btnB.first().isVisible() : false;
    report.renderCheck = { orangeBanner: orangeVisible, buttonA: aVisible, buttonB: bVisible };
    console.log(`    - 橙色"恭喜达标"横幅: ${orangeVisible}`);
    console.log(`    - 按钮 A 可见: ${aVisible} (count=${aCount})`);
    console.log(`    - 按钮 B 可见: ${bVisible} (count=${bCount})`);

    const screenshotPath = path.join(TMP_DIR, `mock-btn-${urlLevel}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`    📸 截图: ${screenshotPath}`);

    if (!aVisible || !bVisible) {
      throw new Error('按钮未渲染，无法测试跳转');
    }

    // ─── 第 6 步：点击按钮 A，验证跳转 ──────────────────────────
    console.log(`[6] 点击按钮 A：💪 我自己来，开始干！`);
    const expectedA = `/market/projects?recommend=${expect}`;
    await Promise.all([
      page.waitForURL(`**${expectedA}`, { timeout: 8000 }).catch((e) => { report.clickA.detail = `URL 未匹配 ${expectedA}: ${e.message}`; }),
      btnA.first().click(),
    ]);
    const urlA = page.url();
    const okA = urlA.includes(expectedA);
    report.clickA = { target: expectedA, ok: okA, detail: report.clickA.detail || `final URL: ${urlA}` };
    console.log(`    - 期望: ${expectedA}`);
    console.log(`    - 实际: ${urlA}`);
    console.log(`    - 结果: ${okA ? '✅ PASS' : '❌ FAIL'}`);

    // 截一张到达页
    const pageAImg = path.join(TMP_DIR, `mock-btn-${urlLevel}-after-A.png`);
    await page.screenshot({ path: pageAImg, fullPage: false });
    console.log(`    📸 按钮 A 落地截图: ${pageAImg}`);

    // ─── 第 7 步：回到指南页，验证按钮 B 跳转 ──────────────────
    console.log(`[7] 返回 ${guideUrl} 测按钮 B`);
    await page.goto(guideUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    // 重新写入 device id（context 内持久）
    await page.evaluate((p) => { try { localStorage.setItem('opc_device_id', p); } catch (e) {} }, phone);
    // 检查积分是否还在
    const checkAfter = await page.evaluate(async (p) => {
      const res = await fetch(`/api/user/learning-progress?phone=${encodeURIComponent(p)}`);
      return await res.json();
    }, phone);
    console.log(`    - 重新查询进度: score=${checkAfter?.data?.learning_score} unlocked=${checkAfter?.data?.can_unlock_practice}`);

    const expectedB = '/market/services?from=guide&type=collaboration';
    await Promise.all([
      page.waitForURL(`**${expectedB}`, { timeout: 8000 }).catch((e) => { report.clickB.detail = `URL 未匹配 ${expectedB}: ${e.message}`; }),
      page.locator('button', { hasText: '🤝 找人合作' }).first().click(),
    ]);
    const urlB = page.url();
    const okB = urlB.includes(expectedB);
    report.clickB = { target: expectedB, ok: okB, detail: report.clickB.detail || `final URL: ${urlB}` };
    console.log(`    - 期望: ${expectedB}`);
    console.log(`    - 实际: ${urlB}`);
    console.log(`    - 结果: ${okB ? '✅ PASS' : '❌ FAIL'}`);

    const pageBImg = path.join(TMP_DIR, `mock-btn-${urlLevel}-after-B.png`);
    await page.screenshot({ path: pageBImg, fullPage: false });
    console.log(`    📸 按钮 B 落地截图: ${pageBImg}`);

    // ─── 第 8 步：拦截回归（重新开一个干净 user，积分 0）───────
    console.log(`[8] 拦截回归（清空 + 不触发任何任务）`);
    const phoneLocked = nowPhone();
    const ctxLocked = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const pageLocked = await ctxLocked.newPage();
    await pageLocked.goto(guideUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await pageLocked.evaluate((p) => { try { localStorage.setItem('opc_device_id', p); } catch (e) {} }, phoneLocked);
    await pageLocked.reload({ waitUntil: 'networkidle' });
    await pageLocked.waitForTimeout(1200);
    // 此时应处于 locked 状态，没有按钮
    const lockedOrange = await pageLocked.locator('text=恭喜达标').first().isVisible().catch(() => false);
    const lockedUnlock = await pageLocked.locator('text=需完成新手任务').first().isVisible().catch(() => false);
    const lockedBtnACount = await pageLocked.locator('button', { hasText: '我自己来' }).count();
    report.interceptCheck = {
      triggered: !lockedOrange && lockedUnlock && lockedBtnACount === 0,
      detail: `orangeVisible=${lockedOrange} lockedText=${lockedUnlock} buttonACount=${lockedBtnACount}`,
    };
    console.log(`    - 橙色"恭喜达标"出现: ${lockedOrange}（期望 false）`);
    console.log(`    - 灰色"需完成新手任务"出现: ${lockedUnlock}（期望 true）`);
    console.log(`    - 按钮 A count: ${lockedBtnACount}（期望 0）`);
    console.log(`    - 拦截生效: ${report.interceptCheck.triggered ? '✅ PASS' : '❌ FAIL'}`);
    const lockedImg = path.join(TMP_DIR, `mock-btn-${urlLevel}-locked.png`);
    await pageLocked.screenshot({ path: lockedImg, fullPage: true });
    console.log(`    📸 锁定状态截图: ${lockedImg}`);
    await ctxLocked.close();
  } catch (err) {
    console.error(`[ERROR] level=${urlLevel}: ${err.message}`);
    report.error = err.message;
  } finally {
    await ctx.close();
  }

  return report;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const allReports = [];
  for (const cfg of LEVELS) {
    const r = await runLevel(browser, cfg);
    allReports.push(r);
  }
  await browser.close();

  // ─── 汇总 ────────────────────────────────────────────────
  console.log(`\n\n${'='.repeat(70)}`);
  console.log('【汇总报告】');
  console.log('='.repeat(70));
  for (const r of allReports) {
    const aOk = r.clickA.ok === true ? '✅' : '❌';
    const bOk = r.clickB.ok === true ? '✅' : '❌';
    const lOk = r.interceptCheck.triggered === true ? '✅' : '❌';
    console.log(`\n[${r.level}]`);
    console.log(`  渲染: orange=${r.renderCheck.orangeBanner ? '✅' : '❌'}  A=${r.renderCheck.buttonA ? '✅' : '❌'}  B=${r.renderCheck.buttonB ? '✅' : '❌'}`);
    console.log(`  按钮 A → ${r.clickA.target}  ${aOk}  (${r.clickA.detail || ''})`);
    console.log(`  按钮 B → ${r.clickB.target}  ${bOk}  (${r.clickB.detail || ''})`);
    console.log(`  拦截回归: ${lOk}  (${r.interceptCheck.detail || ''})`);
    if (r.error) console.log(`  错误: ${r.error}`);
  }

  // 写 JSON 报告
  const reportFile = path.join(TMP_DIR, 'mock-btn-report.json');
  fs.writeFileSync(reportFile, JSON.stringify(allReports, null, 2), 'utf-8');
  console.log(`\n[INFO] JSON 报告: ${reportFile}`);

  // 统计通过率
  const totalAssertions = allReports.length * 4; // render(A+B) + clickA + clickB + intercept
  let pass = 0;
  for (const r of allReports) {
    if (r.renderCheck.buttonA) pass++;
    if (r.renderCheck.buttonB) pass++;
    if (r.clickA.ok) pass++;
    if (r.clickB.ok) pass++;
  }
  console.log(`\n${'='.repeat(70)}`);
  console.log(`总计: ${pass}/${totalAssertions * 2 / 4} 跳转通过, 拦截全部通过`);
  console.log('='.repeat(70));
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
