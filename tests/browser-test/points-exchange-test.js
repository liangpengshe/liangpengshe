/**
 * 良朋社积分消费场景开启 · 端到端验证
 * 验证：/member 我的积分面板 + /api/points redeem-sop + /pricing 抵扣提示
 */
const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');

const REPORT = path.join(os.tmpdir(), 'points-exchange-test.json');
const BASE = 'http://localhost:3001';
const deviceId = `dev-points-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1800 } });
  const page = await ctx.newPage();
  const errs = [];
  const log = [];
  page.on('pageerror', (e) => errs.push(e.message.substring(0, 300)));

  console.log('══════════════════════════════════════════════════════════');
  console.log('  良朋社积分消费场景 · 端到端验证');
  console.log(`  Device: ${deviceId}`);
  console.log('══════════════════════════════════════════════════════════\n');

  // ── 1. 先给用户一些积分（签到） ──
  console.log('┌─ 准备: 给测试用户 +5 积分 ─────────────────────────────┐');
  const t1 = Date.now();
  const r1 = await page.request.fetch(`${BASE}/api/points`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { action: 'sign-in', userId: deviceId },
  });
  const j1 = await r1.json();
  const initOk = j1.success && j1.data?.balance > 0;
  console.log(`  ${initOk ? '✓' : '✗'} 签到成功: balance=${j1.data?.balance} (${Date.now() - t1}ms)`);
  log.push({ test: 'init-points', ok: initOk, balance: j1.data?.balance });
  console.log('└────────────────────────────────────────────────────┘\n');

  // ── 2. redeem-sop 兑换（积分不足场景） ──
  console.log('┌─ 测试 2: 积分不足场景 ───────────────────────────────┐');
  const t2 = Date.now();
  const r2 = await page.request.fetch(`${BASE}/api/points`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: {
      action: 'redeem-sop',
      userId: deviceId,
      sopId: 'sop-asset-004',
      sopTitle: '数字资产 SOP · 3 套定价模型',
      costPoints: 200,
    },
  });
  const j2 = await r2.json();
  const insufficient = !j2.success && j2.error?.includes('积分不足');
  console.log(`  ${insufficient ? '✓' : '✗'} 200 积分兑换失败: ${j2.error?.slice(0, 50)} (${Date.now() - t2}ms)`);
  log.push({ test: 'redeem-insufficient', ok: insufficient, error: j2.error });
  console.log('└────────────────────────────────────────────────────┘\n');

  // ── 3. 先 grant 200 积分（通过 task-reward 模拟） ──
  console.log('┌─ 准备: 再奖励 200 积分（任务奖励上限 500）─────────────┐');
  const t3 = Date.now();
  const r3 = await page.request.fetch(`${BASE}/api/points`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { action: 'task-reward', userId: deviceId, taskType: 'purchase-bonus', amount: 200, remark: '测试用积分' },
  });
  const j3 = await r3.json();
  const grantOk = j3.success;
  console.log(`  ${grantOk ? '✓' : '✗'} 任务奖励: balance=${j3.data?.balance} (${Date.now() - t3}ms)`);
  log.push({ test: 'grant-points', ok: grantOk, balance: j3.data?.balance });
  console.log('└────────────────────────────────────────────────────┘\n');

  // ── 4. redeem-sop 成功 ──
  console.log('┌─ 测试 4: 积分兑换 SOP 成功 ───────────────────────────┐');
  const t4 = Date.now();
  const r4 = await page.request.fetch(`${BASE}/api/points`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: {
      action: 'redeem-sop',
      userId: deviceId,
      sopId: 'sop-asset-004',
      sopTitle: '数字资产 SOP · 3 套定价模型',
      costPoints: 200,
    },
  });
  const j4 = await r4.json();
  const redeemOk = j4.success && j4.data?.remainingPoints >= 0;
  console.log(`  ${redeemOk ? '✓' : '✗'} 兑换 200 分: remainingPoints=${j4.data?.remainingPoints} (${Date.now() - t4}ms)`);
  log.push({ test: 'redeem-success', ok: redeemOk, ...j4.data });
  console.log('└────────────────────────────────────────────────────┘\n');

  // ── 5. 余额查询 ──
  console.log('┌─ 测试 5: 积分余额查询 ───────────────────────────────┐');
  const t5 = Date.now();
  const r5 = await page.request.fetch(`${BASE}/api/points?userId=${deviceId}&type=balance`);
  const j5 = await r5.json();
  const balOk = j5.success && typeof j5.data?.points === 'number';
  console.log(`  ${balOk ? '✓' : '✗'} 余额: ${j5.data?.points} 分 (${Date.now() - t5}ms)`);
  log.push({ test: 'balance-query', ok: balOk, points: j5.data?.points });
  console.log('└────────────────────────────────────────────────────┘\n');

  // ── 6. 积分流水查询 ──
  console.log('┌─ 测试 6: 积分流水查询 ───────────────────────────────┐');
  const t6 = Date.now();
  const r6 = await page.request.fetch(`${BASE}/api/points?userId=${deviceId}&type=logs`);
  const j6 = await r6.json();
  const logsOk = j6.success && Array.isArray(j6.data?.logs);
  const hasSOP = logsOk && j6.data.logs.some((l) => l.type === 'EXCHANGE_SOP');
  console.log(`  ${logsOk ? '✓' : '✗'} 流水 ${j6.data?.logs?.length} 条, 含 EXCHANGE_SOP: ${hasSOP ? '✓' : '✗'} (${Date.now() - t6}ms)`);
  log.push({ test: 'logs-query', ok: logsOk && hasSOP, count: j6.data?.logs?.length, hasSOP });
  console.log('└────────────────────────────────────────────────────┘\n');

  // ── 7. /pricing 页面渲染验证（不依赖登录态） ──
  console.log('┌─ 测试 7: /pricing 页面渲染 ───────────────────────────┐');
  const t7 = Date.now();
  const pricingRes = await page.goto(`${BASE}/pricing`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1500);
  const pricingStatus = pricingRes.status();
  const pricingBody = await page.textContent('body');
  const hasCta = pricingBody.includes('立即体验 9.9 元首月') || pricingBody.includes('加入圈层 199');
  console.log(`  /pricing 状态: ${pricingStatus} (${Date.now() - t7}ms)`);
  console.log(`  CTA 文案命中: ${hasCta ? '✓' : '✗'}`);
  log.push({ test: 'pricing-render', ok: hasCta, status: pricingStatus });
  console.log('└────────────────────────────────────────────────────┘\n');

  // ── 7.5 给用户充值到 250 积分（满足 canDeduct >= 200 条件） ──
  console.log('┌─ 准备: 充值到 250 积分（满足抵扣门槛）──────────────┐');
  const t75 = Date.now();
  const r75 = await page.request.fetch(`${BASE}/api/points`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { action: 'task-reward', userId: deviceId, taskType: 'topup', amount: 250, remark: '测试用积分充值' },
  });
  const j75 = await r75.json();
  console.log(`  ✓ 充值后余额: ${j75.data?.balance} 分 (${Date.now() - t75}ms)`);
  log.push({ test: 'topup-for-deduct', ok: j75.success, balance: j75.data?.balance });
  console.log('└────────────────────────────────────────────────────┘\n');

  // ── 8. /pricing?applyPoints=true 自动勾选抵扣 ──
  console.log('┌─ 测试 8: URL 参数 applyPoints=true 自动勾选 ──────────┐');
  const t8 = Date.now();
  // 先到首页（确保 localStorage 设置不会受软导航缓存影响）
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((id) => {
    localStorage.setItem('opc_device_id', id)
  }, deviceId)
  await page.goto(`${BASE}/pricing?applyPoints=true`, { waitUntil: 'load', timeout: 30000 });
  // 等待 points fetch 完成 + 滚动到页面底部，触发所有 PayButton 渲染
  await page.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight)
    // 等待至少出现一个 PayButton 勾选框
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 500))
      const cbs = document.querySelectorAll('input[type=checkbox]')
      if (cbs.length > 0) {
        const deductBox = Array.from(cbs).find(el => (el.closest('label')?.textContent || '').includes('积分抵扣'))
        if (deductBox) return // 找到则退出
      }
    }
  })
  const checked = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input[type="checkbox"]'))
    const deductBox = inputs.find((el) => {
      const label = el.closest('label')?.textContent || ''
      return label.includes('积分抵扣')
    })
    return deductBox ? deductBox.checked : null
  })
  console.log(`  抵扣勾选框状态: ${checked === true ? '✓ 已勾选' : checked === false ? '✗ 未勾选' : '✗ 未找到'} (${Date.now() - t8}ms)`);
  log.push({ test: 'applyPoints-url', ok: checked === true, checked });
  console.log('└────────────────────────────────────────────────────┘\n');

  // ── 9. /pricing 已订阅卡片底部积分提示 ──
  console.log('┌─ 测试 9: 已订阅卡片底部积分提示 ────────────────────┐');
  const t9 = Date.now();
  // 模拟已订阅 MONTHLY_69（写入 localStorage）
  await page.evaluate(() => {
    localStorage.setItem('opc_active_subscription', JSON.stringify({ plan: 'MONTHLY_69' }))
  })
  await page.goto(`${BASE}/pricing`, { waitUntil: 'load', timeout: 30000 });
  // 等待积分提示渲染
  await page.evaluate(async () => {
    // 滚动到实战与陪跑区块（已订阅卡片所在位置）
    const el = document.getElementById('section-battle')
    if (el) el.scrollIntoView({ block: 'start' })
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 500))
      if ((document.body.textContent || '').includes('最高可抵扣')) return
    }
  })
  const hintText = await page.evaluate(() => {
    return document.body.textContent || ''
  })
  const hasHint = hintText.includes('您当前有') && hintText.includes('积分') && hintText.includes('最高可抵扣')
  console.log(`  积分提示文案: ${hasHint ? '✓ 已显示' : '✗ 缺失'} (${Date.now() - t9}ms)`);
  log.push({ test: 'subscribed-points-hint', ok: hasHint });
  console.log('└────────────────────────────────────────────────────┘\n');

  // ── 10. /member 页面（注入 localStorage 模拟登录 + 满积分） ──
  console.log('┌─ 测试 10: /member 页面我的积分面板 ───────────────────┐');
  const t10 = Date.now();
  // 模拟登录态：写入 users 表的 key + deviceId
  await page.evaluate((id) => {
    localStorage.setItem('opc_device_id', id)
    // 写入模拟用户数据（使 PointsExchangeCard 可见）
    const mockUser = { id, phone: id, name: '测试老板', email: 'test@opc.local' }
    localStorage.setItem('opc_user', JSON.stringify(mockUser))
  }, deviceId)
  await page.goto(`${BASE}/member`, { waitUntil: 'load', timeout: 30000 });
  // 等待我的积分面板渲染
  await page.evaluate(async () => {
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 500))
      const text = document.body.textContent || ''
      if (text.includes('积分兑换 SOP 资料') || text.includes('积分兑换')) {
        // 滚动到该区域
        const heads = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, div'))
        const target = heads.find(el => (el.textContent || '').includes('我的积分') || (el.textContent || '').includes('积分兑换'))
        if (target) target.scrollIntoView({ block: 'start' })
        return
      }
    }
  })
  const memberBody = await page.textContent('body');
  const hasExchangePanel = memberBody.includes('我的积分') && (memberBody.includes('积分兑换 SOP 资料') || memberBody.includes('积分兑换'));
  console.log(`  我的积分面板: ${hasExchangePanel ? '✓ 已渲染' : '✗ 缺失（需登录态）'} (${Date.now() - t10}ms)`);
  log.push({ test: 'member-exchange-panel', ok: hasExchangePanel });
  console.log('└────────────────────────────────────────────────────┘\n');

  // 汇总
  console.log('══════════════════════════════════════════════════════════');
  console.log('  📊 测试汇总');
  console.log('══════════════════════════════════════════════════════════');
  const passed = log.filter((l) => l.ok !== false).length;
  console.log(`  通过: ${passed}/${log.length}`);
  console.log(`  JS 错误: ${errs.length}`);
  if (errs.length) errs.forEach((e) => console.log(`    - ${e}`));
  fs.writeFileSync(REPORT, JSON.stringify({ log, errs }, null, 2));
  console.log(`  📄 报告: ${REPORT}`);

  await browser.close();
})();
