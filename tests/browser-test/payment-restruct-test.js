/**
 * 良朋社支付链路重构 · 端到端验证
 * 验证：统一入口 → 网关 → 履约引擎 三段式解耦
 */
const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');

const REPORT = path.join(os.tmpdir(), 'payment-restruct-test.json');
const BASE = 'http://localhost:3001';
const deviceId = `dev-restruct-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const log = [];
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message.substring(0, 300)));

  console.log('══════════════════════════════════════════════════════════');
  console.log('  良朋社支付链路重构 · 端到端验证');
  console.log(`  Device: ${deviceId}`);
  console.log('══════════════════════════════════════════════════════════\n');

  // ─── 测试 1: /pricing 页面渲染 4 档 ───
  console.log('┌─ 测试 1: /pricing 4 档布局 ──────────────────────────┐');
  const t1 = Date.now();
  const pricingRes = await page.goto(`${BASE}/pricing`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1000);
  const pricingStatus = pricingRes.status();
  // 检查页面是否含 4 档文案
  const pTxt = await page.textContent('body');
  const hasPIONEER = pTxt.includes('19.9');
  const hasMONTHLY = pTxt.includes('69');
  const hasBASIC = pTxt.includes('199');
  const hasPRO = pTxt.includes('598');
  const hasDEEP = pTxt.includes('1980');
  const hasCITY = pTxt.includes('5980');
  const hasCta = pTxt.includes('了解主理人权益');
  console.log(`  /pricing 状态: ${pricingStatus} (${Date.now() - t1}ms)`);
  console.log(`  4 档文案命中:`);
  console.log(`    19.9 诊断卡:   ${hasPIONEER ? '✓' : '✗'}`);
  console.log(`    69 月卡:       ${hasMONTHLY ? '✓' : '✗'}`);
  console.log(`    199 基础会员:  ${hasBASIC ? '✓' : '✗'}`);
  console.log(`    598 轻陪跑:    ${hasPRO ? '✓' : '✗'}`);
  console.log(`    1980 深度陪跑: ${hasDEEP ? '✓' : '✗'}`);
  console.log(`    5980 主理人:   ${hasCITY ? '✓' : '✗'}`);
  console.log(`  合作档按钮文案:  ${hasCta ? '✓ 了解主理人权益' : '✗ 旧文案'}`);
  log.push({ test: 'pricing-page', status: pricingStatus, hasCta });
  console.log('└────────────────────────────────────────────────────┘\n');

  // ─── 测试 2: /api/order/create 订单生成器 ───
  console.log('┌─ 测试 2: 统一订单生成器 ─────────────────────────────┐');
  const tests = [
    { planKey: 'PIONEER_19', expectAmount: 19.9, label: '19.9 诊断卡' },
    { planKey: 'MONTHLY_69', expectAmount: 69, label: '69 月卡' },
    { planKey: 'BASIC_199', expectAmount: 199, label: '199 基础会员' },
    { planKey: 'PRO_598', expectAmount: 598, label: '598 轻陪跑' },
    { planKey: 'DEEP_1980', expectAmount: 1980, label: '1980 深度陪跑' },
  ];

  const orderIds = {};
  for (const t of tests) {
    const t0 = Date.now();
    const r = await page.request.fetch(`${BASE}/api/order/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: { planKey: t.planKey, userId: deviceId + '_' + t.planKey, usePoints: false, provider: 'mock' },
    });
    const j = await r.json();
    const ok = j.success && j.orderId && j.checkoutUrl && j.amount === t.expectAmount;
    orderIds[t.planKey] = j.orderId;
    console.log(`  ${ok ? '✓' : '✗'} ${t.label.padEnd(15)} → orderId=${j.orderId?.slice(0, 30)}... amount=${j.amount} (${Date.now() - t0}ms)`);
    log.push({ test: 'create-order', planKey: t.planKey, ok, orderId: j.orderId, amount: j.amount });
  }

  // 合作档：禁止直接支付
  const cityT0 = Date.now();
  const cityR = await page.request.fetch(`${BASE}/api/order/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { planKey: 'CITY_5980', userId: deviceId + '_city', provider: 'mock' },
  });
  const cityJ = await cityR.json();
  const cityOk = !cityJ.success && cityJ.redirectTo === '/partner';
  console.log(`  ${cityOk ? '✓' : '✗'} CITY_5980 合作档  → 拒绝支付, redirectTo=${cityJ.redirectTo} (${Date.now() - cityT0}ms)`);
  log.push({ test: 'create-order-city', ok: cityOk, redirectTo: cityJ.redirectTo });
  console.log('└────────────────────────────────────────────────────┘\n');

  // ─── 测试 3: mock 网关 + 履约引擎 ───
  console.log('┌─ 测试 3: Mock 网关 + 履约引擎 ───────────────────────┐');
  for (const planKey of ['PIONEER_19', 'DEEP_1980']) {
    const oid = orderIds[planKey];
    if (!oid) continue;

    const t0 = Date.now();
    const r = await page.request.fetch(`${BASE}/api/payment/mock-checkout?orderId=${oid}`, {
      method: 'GET',
    });
    const j = await r.json();
    const ok = j.success && j.fulfillResult?.success;
    console.log(`  ${ok ? '✓' : '✗'} ${planKey.padEnd(12)} → mock 网关 + fulfill (${Date.now() - t0}ms)`);
    console.log(`     履约结果: action=${j.fulfillResult?.action || j.fulfillResult?.details?.action} applied=${j.fulfillResult?.applied}`);
    log.push({ test: 'mock-gateway-fulfill', planKey, ok, fulfillResult: j.fulfillResult });
  }
  console.log('└────────────────────────────────────────────────────┘\n');

  // ─── 测试 4: 防重复（409） ───
  console.log('┌─ 测试 4: 防重复 409 ─────────────────────────────────┐');
  const t4 = Date.now();
  const r4 = await page.request.fetch(`${BASE}/api/order/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { planKey: 'PIONEER_19', userId: deviceId + '_PIONEER_19', provider: 'mock' },
  });
  const j4 = await r4.json();
  const dup4 = j4.code === 'ALREADY_PURCHASED' || r4.status() === 409;
  console.log(`  ${dup4 ? '✓' : '✗'} PIONEER_19 二次购买 → ${r4.status()} ${j4.code || j4.error?.slice(0, 40)}`);
  log.push({ test: 'duplicate-check', ok: dup4, status: r4.status() });
  console.log('└────────────────────────────────────────────────────┘\n');

  // ─── 测试 5: 履约幂等（同 orderId 二次） ───
  console.log('┌─ 测试 5: 履约幂等性 ─────────────────────────────────┐');
  const oid = orderIds['PIONEER_19'];
  if (oid) {
    const t5 = Date.now();
    const r5a = await page.request.fetch(`${BASE}/api/order/fulfill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: { orderId: oid, paymentStatus: 'succeeded', provider: 'mock' },
    });
    const j5a = await r5a.json();
    // 第二次应该返回 already_fulfilled
    const r5b = await page.request.fetch(`${BASE}/api/order/fulfill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: { orderId: oid, paymentStatus: 'succeeded', provider: 'mock' },
    });
    const j5b = await r5b.json();
    const idemOk = j5b.reason === 'already_fulfilled' || !j5b.applied;
    console.log(`  第一次: applied=${j5a.applied}  第二次: applied=${j5b.applied} reason=${j5b.reason}`);
    console.log(`  ${idemOk ? '✓ 幂等生效' : '✗ 重复履约!'}`);
    log.push({ test: 'idempotency', ok: idemOk });
  }
  console.log('└────────────────────────────────────────────────────┘\n');

  // ─── 汇总 ───
  console.log('══════════════════════════════════════════════════════════');
  console.log('  📊 测试汇总');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`  JS 运行时错误: ${errs.length}`);
  if (errs.length) {
    errs.forEach((e) => console.log(`    - ${e}`));
  }
  const passed = log.filter((l) => l.ok !== false).length;
  console.log(`  通过: ${passed}/${log.length}`);
  fs.writeFileSync(REPORT, JSON.stringify({ log, errs }, null, 2));
  console.log(`  📄 报告: ${REPORT}`);

  await browser.close();
})();
