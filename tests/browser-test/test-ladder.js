// 良朋社 OPC 首页 四层智富阶梯 智能访问判定逻辑 - 浏览器自动化测试
// 测试 3 个场景，每个场景都需要打开首页、清空 localStorage、设置特定状态、点击 OPC 卡片、观察行为、截图

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// /tmp 在 Windows 上对应 C:\Users\<user>\AppData\Local\Temp
const os = require('os');
const TMP_DIR = process.platform === 'win32' ? path.join(os.tmpdir()) : '/tmp';
console.log(`[INFO] 截图保存目录: ${TMP_DIR}`);

const BASE_URL = 'http://localhost:3006/';

// 4 个 OPC 卡片的中文标题（用于点击定位）
const LADDER_CARDS = {
  trader: '交易型 OPC',
  flow: '流量型 OPC',
  system: '系统型 OPC',
  asset: '资产型 OPC',
};

// 弹窗选择器
const BLOCKER_SELECTOR = '.fixed.inset-0.z-50';

async function gotoHomeAndClearStorage(page) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  // 等待 React 挂载
  await page.waitForTimeout(1500);
  // 清空 localStorage
  await page.evaluate(() => {
    try { localStorage.clear(); } catch (e) {}
  });
  // 刷新页面让 React 重新读取空状态
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
}

async function setLocalStorage(page, obj) {
  await page.evaluate((items) => {
    for (const [k, v] of Object.entries(items)) {
      localStorage.setItem(k, v);
    }
  }, obj);
  // 重新加载使 React 重新读取
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
}

// 点击指定 OPC 卡片并返回结果
async function clickLadderCard(page, cardName) {
  // 找到 OPC 阶梯区域（4. 学习路径 / 智富阶梯）
  // 卡片是 Link 元素，title=tooltip 包含 OPC 类型
  // 直接用文本定位更稳
  const card = page.locator(`a:has-text("${cardName}")`).first();
  await card.scrollIntoViewIfNeeded();
  await card.click({ timeout: 5000 });
  // 等待导航或弹窗
  await page.waitForTimeout(1500);
}

async function getBlockerInfo(page) {
  // 检查弹窗是否存在
  const blocker = page.locator(BLOCKER_SELECTOR);
  const exists = await blocker.count();
  if (exists === 0) {
    return { open: false };
  }
  const message = await blocker.locator('.text-slate-800').first().textContent().catch(() => null);
  const ctaLabel = await blocker.locator('a').first().textContent().catch(() => null);
  const ctaHref = await blocker.locator('a').first().getAttribute('href').catch(() => null);
  return { open: true, message: (message || '').trim(), ctaLabel: (ctaLabel || '').trim(), ctaHref };
}

async function closeBlocker(page) {
  // 点击关闭按钮 (右上角 ✕)
  const closeBtn = page.locator(BLOCKER_SELECTOR).locator('button[aria-label="关闭"]').first();
  if (await closeBtn.count() > 0) {
    await closeBtn.click();
    await page.waitForTimeout(500);
  }
}

async function runScenario(scenarioName, scenarioLabel, localStorageState, actions) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🧪 场景 ${scenarioName}: ${scenarioLabel}`);
  console.log('='.repeat(70));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const results = [];

  try {
    // 步骤 1+2: 打开首页 + 清空 localStorage
    console.log(`\n  [1] 打开 ${BASE_URL}`);
    await gotoHomeAndClearStorage(page);
    console.log(`  [2] localStorage.clear() ✓`);

    // 步骤 3: 设置特定 localStorage
    if (Object.keys(localStorageState).length > 0) {
      console.log(`  [3] 设置 localStorage:`);
      for (const [k, v] of Object.entries(localStorageState)) {
        console.log(`      - ${k} = ${v}`);
      }
      await setLocalStorage(page, localStorageState);
    } else {
      console.log(`  [3] 无 localStorage 需要设置（保持清空状态）`);
    }

    // 步骤 4-5: 依次执行动作
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      console.log(`\n  [动作 ${i + 1}] ${action.label}`);

      // 如果是除第一次以外的动作，需要先回到首页
      if (i > 0) {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);
        // 重新设置 localStorage (因为新页面可能丢失)
        if (Object.keys(localStorageState).length > 0) {
          await setLocalStorage(page, localStorageState);
        }
      }

      const beforeUrl = page.url();
      await clickLadderCard(page, action.cardName);
      const afterUrl = page.url();
      const blockerInfo = await getBlockerInfo(page);

      const r = {
        action: action.label,
        cardClicked: action.cardName,
        beforeUrl,
        afterUrl,
        navigated: beforeUrl !== afterUrl,
        blockerOpen: blockerInfo.open,
        blockerMessage: blockerInfo.message || null,
        blockerCta: blockerInfo.ctaLabel || null,
        blockerHref: blockerInfo.ctaHref || null,
        expected: action.expected,
        pass: action.check(blockerInfo, beforeUrl, afterUrl),
      };
      results.push(r);

      console.log(`      卡片: ${action.cardName}`);
      console.log(`      跳转前 URL: ${beforeUrl}`);
      console.log(`      跳转后 URL: ${afterUrl}`);
      console.log(`      弹窗: ${blockerInfo.open ? '✓ 已弹出' : '✗ 未弹出'}`);
      if (blockerInfo.open) {
        console.log(`      弹窗文案: ${blockerInfo.message}`);
        console.log(`      弹窗 CTA: ${blockerInfo.ctaLabel} (→ ${blockerInfo.ctaHref})`);
      }
      console.log(`      预期: ${action.expected}`);
      console.log(`      结果: ${r.pass ? '✅ 通过' : '❌ 失败'}`);

      // 关闭弹窗（如果有）以便下一次操作
      if (blockerInfo.open) {
        await closeBlocker(page);
      }
    }

    // 步骤 6: 截图保存
    const screenshotPath = path.join(TMP_DIR, `scenario-${scenarioName}.png`);
    // 回到首页再截图
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    if (Object.keys(localStorageState).length > 0) {
      await setLocalStorage(page, localStorageState);
    }
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`\n  [截图] 保存到: ${screenshotPath}`);

    // 额外截一张"最后一个动作的结果"图
    if (results.length > 0) {
      const lastAction = results[results.length - 1];
      const resultShotPath = path.join(TMP_DIR, `scenario-${scenarioName}-last-result.png`);
      // 复现最后一个动作
      if (lastAction.blockerOpen) {
        // 复现弹窗状态
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);
        if (Object.keys(localStorageState).length > 0) {
          await setLocalStorage(page, localStorageState);
        }
        await clickLadderCard(page, lastAction.cardClicked);
        await page.waitForTimeout(800);
        await page.screenshot({ path: resultShotPath, fullPage: false });
        console.log(`  [结果截图] 保存到: ${resultShotPath} (展示弹窗状态)`);
      } else {
        // 跳转后的页面截图
        await page.screenshot({ path: resultShotPath, fullPage: false });
        console.log(`  [结果截图] 保存到: ${resultShotPath} (展示跳转后页面)`);
      }
    }

  } catch (err) {
    console.error(`  ❌ 场景 ${scenarioName} 执行出错: ${err.message}`);
    results.push({ error: err.message });
  } finally {
    await browser.close();
  }

  return results;
}

(async () => {
  const allResults = {};

  // ════════════════════════════════════════════════════════════════
  // 场景 A: 完全新用户（所有 localStorage 为空）
  // ════════════════════════════════════════════════════════════════
  allResults.A = await runScenario('A', '完全新用户（localStorage 为空）', {}, [
    {
      label: '点击交易型 OPC',
      cardName: LADDER_CARDS.trader,
      expected: '弹出"尚未开启诊断"拦截框（不跳转）',
      check: (blocker, before, after) => blocker.open && !before.includes('/guide/trader'),
    },
    {
      label: '点击流量型 OPC',
      cardName: LADDER_CARDS.flow,
      expected: '弹出"尚未开启诊断"拦截框（不跳转）',
      check: (blocker, before, after) => blocker.open && !before.includes('/guide/flow'),
    },
    {
      label: '点击系统型 OPC',
      cardName: LADDER_CARDS.system,
      expected: '弹出"需先跑通基础版图"拦截框',
      check: (blocker) => blocker.open,
    },
    {
      label: '点击资产型 OPC',
      cardName: LADDER_CARDS.asset,
      expected: '弹出"需先跑通基础版图"拦截框',
      check: (blocker) => blocker.open,
    },
  ]);

  // ════════════════════════════════════════════════════════════════
  // 场景 B: 诊断已完成（用户当前状态）
  // localStorage: diagnosis_accepted=true, opc_level=TRADER, learning_score=30
  // ════════════════════════════════════════════════════════════════
  allResults.B = await runScenario('B', '诊断已完成（diagnosis_accepted + opc_level + learning_score=30）', {
    'diagnosis_accepted': 'true',
    'opc_level': 'TRADER',
    'learning_score': '30',
  }, [
    {
      label: '点击交易型 OPC',
      cardName: LADDER_CARDS.trader,
      expected: '直接跳转到 /guide/trader（不弹窗）',
      check: (blocker, before, after) => !blocker.open && after.includes('/guide/trader'),
    },
    {
      label: '点击流量型 OPC',
      cardName: LADDER_CARDS.flow,
      expected: '直接跳转到 /guide/flow（不弹窗）',
      check: (blocker, before, after) => !blocker.open && after.includes('/guide/flow'),
    },
    {
      label: '点击系统型 OPC',
      cardName: LADDER_CARDS.system,
      expected: '弹出"需先跑通基础版图"拦截框（learning_score=30 不足 80）',
      check: (blocker) => blocker.open,
    },
    {
      label: '点击资产型 OPC',
      cardName: LADDER_CARDS.asset,
      expected: '弹出"需先跑通基础版图"拦截框',
      check: (blocker) => blocker.open,
    },
  ]);

  // ════════════════════════════════════════════════════════════════
  // 场景 C: 基础闭环已完成 + can_unlock_practice
  // localStorage: diagnosis_accepted=true, opc_level=TRADER, can_unlock_practice=true
  // ════════════════════════════════════════════════════════════════
  allResults.C = await runScenario('C', '基础闭环已完成 + can_unlock_practice=true', {
    'diagnosis_accepted': 'true',
    'opc_level': 'TRADER',
    'can_unlock_practice': 'true',
  }, [
    {
      label: '点击系统型 OPC',
      cardName: LADDER_CARDS.system,
      expected: '直接跳转到 /guide/system（基础闭环完成）',
      check: (blocker, before, after) => !blocker.open && after.includes('/guide/system'),
    },
    {
      label: '点击资产型 OPC',
      cardName: LADDER_CARDS.asset,
      expected: '直接跳转到 /guide/asset',
      check: (blocker, before, after) => !blocker.open && after.includes('/guide/asset'),
    },
  ]);

  // ════════════════════════════════════════════════════════════════
  // 总结报告
  // ════════════════════════════════════════════════════════════════
  console.log(`\n\n${'='.repeat(70)}`);
  console.log('📊 测试总结');
  console.log('='.repeat(70));

  for (const [key, results] of Object.entries(allResults)) {
    const pass = results.filter(r => r.pass).length;
    const total = results.length;
    console.log(`  场景 ${key}: ${pass}/${total} 通过`);
  }

  // 输出最终 JSON 报告
  const reportPath = path.join(TMP_DIR, 'opc-ladder-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(allResults, null, 2), 'utf8');
  console.log(`\n[报告] 详细 JSON 报告保存到: ${reportPath}`);
})();
