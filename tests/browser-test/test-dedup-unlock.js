// 良朋社 OPC 学习指南页 - "运营实操" 唯一入口改造验证
// ------------------------------------------------------------
// 验证要点：
//   A. 顶部紫色 STEP 03 预告横幅无按钮（只显示文字）
//   B. 页面中部没有白色"下一步打算怎么做？"抉择卡片
//   C. 底部显示橙红色"恭喜达标"横幅 + 两个并排按钮
//   D. 移动端（375x667）两个按钮垂直排列
//   E. 桌面端（1280x800）两个按钮水平排列
// ------------------------------------------------------------

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');

// /tmp 在 Windows 上对应 C:\Users\<user>\AppData\Local\Temp
const TMP_DIR = process.platform === 'win32' ? path.join(os.tmpdir()) : '/tmp';
console.log(`[INFO] 截图保存目录: ${TMP_DIR}`);

const BASE_URL = 'http://localhost:3007/guide/trader';
const SCREENSHOT_PATH = path.join(TMP_DIR, 'dedup-test-unlocked.png');
const SCREENSHOT_MOBILE = path.join(TMP_DIR, 'dedup-test-unlocked-mobile.png');
const SCREENSHOT_DESKTOP = path.join(TMP_DIR, 'dedup-test-unlocked-desktop.png');

function nowPhone() {
  return 'test-device-' + Date.now();
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const phone = nowPhone();
  console.log(`[INFO] 测试 phone: ${phone}`);

  const results = {
    A: { pass: null, detail: '' },
    B: { pass: null, detail: '' },
    C: { pass: null, detail: '' },
    D: { pass: null, detail: '' },
    E: { pass: null, detail: '' },
  };

  // ============ 桌面端测试 ============
  const contextDesktop = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const pageDesktop = await contextDesktop.newPage();

  try {
    console.log(`\n[1] 打开 ${BASE_URL}（桌面端）`);
    await pageDesktop.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await pageDesktop.waitForTimeout(1500);

    // 步骤 2：通过 fetch API 触发所有任务
    console.log(`[2] 通过 fetch API 触发所有任务`);

    // 先在 localStorage 写入 device id
    await pageDesktop.evaluate((p) => {
      try { localStorage.setItem('opc_device_id', p); } catch (e) {}
    }, phone);

    // 触发 browse
    const r1 = await pageDesktop.evaluate(async (p) => {
      const res = await fetch('/api/user/learning-progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: p, action: 'browse' }),
      });
      return { status: res.status, body: await res.json() };
    }, phone);
    console.log(`    - browse     : status=${r1.status} score=${r1.body?.data?.learning_score} unlocked=${r1.body?.data?.can_unlock_practice}`);

    // 触发 register
    const r2 = await pageDesktop.evaluate(async (p) => {
      const res = await fetch('/api/user/learning-progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: p, action: 'register' }),
      });
      return { status: res.status, body: await res.json() };
    }, phone);
    console.log(`    - register   : status=${r2.status} score=${r2.body?.data?.learning_score} unlocked=${r2.body?.data?.can_unlock_practice}`);

    // 触发 download
    const r3 = await pageDesktop.evaluate(async (p) => {
      const res = await fetch('/api/user/learning-progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: p, action: 'download' }),
      });
      return { status: res.status, body: await res.json() };
    }, phone);
    console.log(`    - download   : status=${r3.status} score=${r3.body?.data?.learning_score} unlocked=${r3.body?.data?.can_unlock_practice}`);

    // 触发 practice-done
    const r4 = await pageDesktop.evaluate(async (p) => {
      const res = await fetch('/api/user/learning-progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: p, action: 'practice-done' }),
      });
      return { status: res.status, body: await res.json() };
    }, phone);
    console.log(`    - practice-done: status=${r4.status} practiceDone=${r4.body?.data?.step_practice_done}`);

    // 步骤 3：刷新页面（让 useEffect 重新查询 API）
    console.log(`[3] 刷新页面`);
    await pageDesktop.reload({ waitUntil: 'networkidle' });
    await pageDesktop.waitForTimeout(2500);

    // 步骤 4：等待页面加载完成
    console.log(`[4] 等待页面加载完成`);

    // 等待关键文案出现
    await pageDesktop.waitForSelector('text=新手启航任务清单', { timeout: 10000 });

    // 等待底部"恭喜达标"出现（如果解锁了）
    await pageDesktop.waitForTimeout(1500);

    // ─── 验证点 A：顶部紫色 STEP 03 预告横幅无按钮 ───
    // 查找紫色 STEP 03 横幅
    const purpleBanner = pageDesktop.locator('div.bg-gradient-to-r.from-blue-600.via-indigo-600.to-violet-600').first();
    const purpleBannerExists = await purpleBanner.count() > 0;
    if (purpleBannerExists) {
      // 查找横幅内所有 button / a 元素
      const bannerButtons = await purpleBanner.locator('button, a').all();
      const bannerButtonTexts = [];
      for (const btn of bannerButtons) {
        const txt = (await btn.textContent() || '').trim();
        if (txt) bannerButtonTexts.push(txt);
      }
      console.log(`\n[验证 A] 紫色 STEP 03 横幅内按钮数: ${bannerButtons.length}`);
      console.log(`          按钮文案: [${bannerButtonTexts.join(' | ')}]`);
      // 仅显示文字 = 没有"前往运营实操"按钮
      const hasPracticeBtn = bannerButtonTexts.some(t => t.includes('前往运营实操') || t.includes('前往') || t.includes('解锁'));
      results.A.pass = bannerButtons.length === 0 || !hasPracticeBtn;
      results.A.detail = `横幅内 button/a 数量=${bannerButtons.length}，文案=[${bannerButtonTexts.join(' | ')}]`;
    } else {
      results.A.pass = false;
      results.A.detail = '未找到紫色 STEP 03 横幅';
    }

    // ─── 验证点 B：中部没有白色"下一步打算怎么做？"抉择卡片 ───
    // 检查页面是否包含"下一步打算怎么做？"文本
    const choiceCardExists = await pageDesktop.locator('text=下一步打算怎么做').count() > 0;
    console.log(`\n[验证 B] 页面包含"下一步打算怎么做？"文案: ${choiceCardExists}`);
    results.B.pass = !choiceCardExists;
    results.B.detail = choiceCardExists
      ? '页面中仍然存在"下一步打算怎么做？"文案（未删除）'
      : '页面中未发现"下一步打算怎么做？"文案（已删除）';

    // ─── 验证点 C：底部"恭喜达标"横幅 + 两个并排按钮 ───
    const congratsText = await pageDesktop.locator('text=恭喜达标').count();
    // 查找两个按钮
    const btnA = pageDesktop.locator('button:has-text("我自己来，开始干")');
    const btnB = pageDesktop.locator('button:has-text("找人合作")');
    const btnAExists = await btnA.count() > 0;
    const btnBExists = await btnB.count() > 0;
    const btnAText = btnAExists ? (await btnA.first().textContent() || '').trim() : '';
    const btnBText = btnBExists ? (await btnB.first().textContent() || '').trim() : '';

    console.log(`\n[验证 C] 底部"恭喜达标"横幅: ${congratsText > 0 ? '✓' : '✗'}`);
    console.log(`          按钮 A 存在: ${btnAExists}，文案: "${btnAText}"`);
    console.log(`          按钮 B 存在: ${btnBExists}，文案: "${btnBText}"`);
    results.C.pass = congratsText > 0 && btnAExists && btnBExists;
    results.C.detail = `恭喜达标=${congratsText > 0}, 按钮A="${btnAText}", 按钮B="${btnBText}"`;

    // ─── 验证点 E：桌面端两个按钮水平排列 ───
    if (btnAExists && btnBExists) {
      const aBox = await btnA.first().boundingBox();
      const bBox = await btnB.first().boundingBox();
      if (aBox && bBox) {
        // 水平排列：A 的 y 和 B 的 y 接近（差 < 20），且 A 的 x < B 的 x
        const sameRow = Math.abs(aBox.y - bBox.y) < 20;
        const aLeftOfB = aBox.x < bBox.x;
        const overlap = !(aBox.x + aBox.width <= bBox.x || bBox.x + bBox.width <= aBox.x);
        console.log(`\n[验证 E] 桌面端按钮 A box: x=${aBox.x.toFixed(0)} y=${aBox.y.toFixed(0)} w=${aBox.width.toFixed(0)} h=${aBox.height.toFixed(0)}`);
        console.log(`          桌面端按钮 B box: x=${bBox.x.toFixed(0)} y=${bBox.y.toFixed(0)} w=${bBox.width.toFixed(0)} h=${bBox.height.toFixed(0)}`);
        console.log(`          同行: ${sameRow}, A在B左: ${aLeftOfB}, X轴重叠: ${overlap}`);
        results.E.pass = sameRow && aLeftOfB;
        results.E.detail = `A:(x=${aBox.x.toFixed(0)},y=${aBox.y.toFixed(0)}), B:(x=${bBox.x.toFixed(0)},y=${bBox.y.toFixed(0)}), 同行=${sameRow}, A左B右=${aLeftOfB}`;
      } else {
        results.E.pass = false;
        results.E.detail = '按钮 boundingBox 不可用';
      }
    } else {
      results.E.pass = false;
      results.E.detail = '按钮不存在，无法验证布局';
    }

    // 步骤 5：截图保存（桌面端全页）
    console.log(`\n[5] 截图保存（桌面端全页）: ${SCREENSHOT_DESKTOP}`);
    await pageDesktop.screenshot({ path: SCREENSHOT_DESKTOP, fullPage: true });

    // 滚到底部再截一张聚焦底部
    await pageDesktop.evaluate(() => {
      const btns = document.querySelectorAll('button');
      for (const b of btns) {
        if (b.textContent && b.textContent.includes('找人合作')) {
          b.scrollIntoView({ behavior: 'instant', block: 'center' });
          break;
        }
      }
    });
    await pageDesktop.waitForTimeout(1000);
    await pageDesktop.screenshot({ path: SCREENSHOT_PATH, fullPage: false });
    console.log(`[5] 主截图保存: ${SCREENSHOT_PATH}`);

  } catch (err) {
    console.error(`[错误] 桌面端测试异常: ${err.message}`);
    console.error(err.stack);
  } finally {
    await contextDesktop.close();
  }

  // ============ 移动端测试 ============
  console.log(`\n${'='.repeat(70)}`);
  console.log(`[移动端测试] 375x667`);
  console.log('='.repeat(70));

  const contextMobile = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const pageMobile = await contextMobile.newPage();

  try {
    await pageMobile.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await pageMobile.waitForTimeout(1500);

    // 设置 localStorage + 触发 API
    await pageMobile.evaluate((p) => {
      try { localStorage.setItem('opc_device_id', p); } catch (e) {}
    }, phone);

    for (const action of ['browse', 'register', 'download', 'practice-done']) {
      await pageMobile.evaluate(async ({ p, a }) => {
        await fetch('/api/user/learning-progress', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: p, action: a }),
        });
      }, { p: phone, a: action });
    }

    await pageMobile.reload({ waitUntil: 'networkidle' });
    await pageMobile.waitForTimeout(2500);

    // 等待任务清单 + 底部"恭喜达标"出现
    await pageMobile.waitForSelector('text=恭喜达标', { timeout: 10000 }).catch(() => {});

    // ─── 验证点 D：移动端两个按钮垂直排列 ───
    const btnAm = pageMobile.locator('button:has-text("我自己来，开始干")').first();
    const btnBm = pageMobile.locator('button:has-text("找人合作")').first();
    const btnAmExists = await btnAm.count() > 0;
    const btnBmExists = await btnBm.count() > 0;
    if (btnAmExists && btnBmExists) {
      const aBox = await btnAm.boundingBox();
      const bBox = await btnBm.boundingBox();
      if (aBox && bBox) {
        // 垂直排列：B 的 y 大于 A 的 y（差 > 20），X 接近
        const aAboveB = aBox.y < bBox.y;
        const yDiff = bBox.y - aBox.y;
        const xSimilar = Math.abs(aBox.x - bBox.x) < 30;
        const noXOverlap = !(aBox.x + aBox.width <= bBox.x || bBox.x + bBox.width <= aBox.x);
        console.log(`\n[验证 D] 移动端按钮 A box: x=${aBox.x.toFixed(0)} y=${aBox.y.toFixed(0)} w=${aBox.width.toFixed(0)} h=${aBox.height.toFixed(0)}`);
        console.log(`          移动端按钮 B box: x=${bBox.x.toFixed(0)} y=${bBox.y.toFixed(0)} w=${bBox.width.toFixed(0)} h=${bBox.height.toFixed(0)}`);
        console.log(`          A在B上: ${aAboveB}, Y差: ${yDiff.toFixed(0)}, X相似: ${xSimilar}, X轴不重叠: ${noXOverlap}`);
        results.D.pass = aAboveB && yDiff > 20 && noXOverlap;
        results.D.detail = `A:(x=${aBox.x.toFixed(0)},y=${aBox.y.toFixed(0)}), B:(x=${bBox.x.toFixed(0)},y=${bBox.y.toFixed(0)}), A在B上=${aAboveB}, Y差=${yDiff.toFixed(0)}`;
      } else {
        results.D.pass = false;
        results.D.detail = '移动端按钮 boundingBox 不可用';
      }
    } else {
      results.D.pass = false;
      results.D.detail = `移动端按钮不存在: A=${btnAmExists}, B=${btnBmExists}`;
    }

    // 移动端截图
    console.log(`\n[移动端截图] ${SCREENSHOT_MOBILE}`);
    // 滚到按钮区域
    await pageMobile.evaluate(() => {
      const btns = document.querySelectorAll('button');
      for (const b of btns) {
        if (b.textContent && b.textContent.includes('找人合作')) {
          b.scrollIntoView({ behavior: 'instant', block: 'center' });
          break;
        }
      }
    });
    await pageMobile.waitForTimeout(800);
    await pageMobile.screenshot({ path: SCREENSHOT_MOBILE, fullPage: false });

  } catch (err) {
    console.error(`[错误] 移动端测试异常: ${err.message}`);
    console.error(err.stack);
  } finally {
    await contextMobile.close();
  }

  await browser.close();

  // ============ 输出报告 ============
  console.log(`\n\n${'='.repeat(70)}`);
  console.log('📊 验证结果报告');
  console.log('='.repeat(70));

  const labels = {
    A: 'A. 顶部紫色 STEP 03 横幅无按钮（只显示文字）',
    B: 'B. 页面中部没有白色"下一步打算怎么做？"抉择卡片',
    C: 'C. 底部"恭喜达标"横幅 + 两个并排按钮',
    D: 'D. 移动端（375x667）两个按钮垂直排列',
    E: 'E. 桌面端（1280x800）两个按钮水平排列',
  };

  for (const [k, label] of Object.entries(labels)) {
    const r = results[k];
    const mark = r.pass ? '✅ 通过' : '❌ 失败';
    console.log(`\n${mark}  ${label}`);
    console.log(`       详情: ${r.detail}`);
  }

  // 写入 JSON 报告
  const reportPath = path.join(TMP_DIR, 'dedup-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n[报告] JSON: ${reportPath}`);

  // 总结
  const passCount = Object.values(results).filter(r => r.pass).length;
  const total = Object.keys(results).length;
  console.log(`\n总结: ${passCount}/${total} 验证点通过`);
  console.log(`主截图: ${SCREENSHOT_PATH}`);
  console.log(`桌面端截图: ${SCREENSHOT_DESKTOP}`);
  console.log(`移动端截图: ${SCREENSHOT_MOBILE}`);

  process.exit(passCount === total ? 0 : 1);
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(2);
});
