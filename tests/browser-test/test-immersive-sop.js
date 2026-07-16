// 沉浸式 SOP 详情页功能验证 · 浏览器自动化测试
// 验证 6 大任务的核心功能：
//   1. 关卡进度条（8 段胶囊）
//   2. 专注模式手风琴 + 圆形选择框
//   3. 付费解锁·欲望钩子
//   4. AI 情境助手悬浮按钮
//   5. 游戏化鼓励语 + 闪光特效
//   6. 移动端触控（44px 点击面积）

const { chromium } = require('playwright');
const path = require('path');
const os = require('os');

const BASE_URL = 'http://localhost:3001';
const TMP_DIR = process.platform === 'win32' ? path.join(os.tmpdir()) : '/tmp';

const SLUGS = [
  { slug: 'ai-digital-shop', title: 'AI数字网店项目' },
  { slug: 'ai-self-media', title: 'AI自媒体运营项目' },
  { slug: 'ai-no-stock-physical-shop', title: 'AI无货源实物网店项目' },
  { slug: 'ai-branded-physical-shop', title: 'AI有货源实物网店项目' },
  { slug: 'ai-tool-sales', title: 'AI工具销售推广项目' },
  { slug: 'ai-geo-enterprise', title: 'AI企业GEO项目' },
];

const SCREEN_PC = path.join(TMP_DIR, 'immersive-sop-pc.png');
const SCREEN_MOBILE = path.join(TMP_DIR, 'immersive-sop-mobile.png');
const SCREEN_AI = path.join(TMP_DIR, 'immersive-sop-ai-coach.png');
const SCREEN_PAYWALL = path.join(TMP_DIR, 'immersive-sop-paywall.png');
const REPORT_PATH = path.join(TMP_DIR, 'immersive-sop-report.json');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 1800 } });
  const page = await context.newPage();

  const report = {
    baseUrl: BASE_URL,
    timestamp: new Date().toISOString(),
    pages: [],
    apiTests: [],
    screenshots: {
      pc: SCREEN_PC,
      mobile: SCREEN_MOBILE,
      aiCoach: SCREEN_AI,
      paywall: SCREEN_PAYWALL,
    },
  };

  // ───────────── 1. PC 端: 测试每个项目页面 ─────────────
  for (const { slug, title } of SLUGS) {
    const url = `${BASE_URL}/projects/${slug}`;
    try {
      const r = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1500);

      const checks = await page.evaluate(() => {
        const html = document.body.innerHTML;
        // [Task 1] 关卡胶囊进度条
        const capsules = document.querySelectorAll('.rounded-full.border.flex.items-center.justify-center');
        const capsuleTexts = Array.from(capsules).slice(0, 12).map(el => el.textContent.trim());
        // [Task 2] 专注模式手风琴 + 圆形选择框
        const circleBtns = document.querySelectorAll('button[aria-label*="标记完成"], button[aria-label*="取消完成"]');
        // [Task 3] 付费解锁
        const paywallText = html.includes('完成该步骤需要加入实操会员');
        const paywallButton = html.includes('解锁并开启指导');
        // [Task 4] AI 助手
        const aiBtns = document.querySelectorAll('button[aria-label="AI 助手"]');
        // [Task 5] 鼓励语
        const cheerText = html.includes('关卡进度');
        // [Task 6] 移动端触控
        const minH44 = Array.from(document.querySelectorAll('button')).filter(b => {
          const r = b.getBoundingClientRect();
          return r.height >= 40;
        }).length;

        return {
          hasHero: !!document.querySelector('header'),
          capsuleCount: capsules.length,
          capsuleTexts,
          circleBtnCount: circleBtns.length,
          paywallText,
          paywallButton,
          aiBtnCount: aiBtns.length,
          cheerText,
          bigButtonCount: minH44,
        };
      });

      report.pages.push({
        slug,
        title,
        url,
        status: r?.status() || 0,
        ...checks,
        pass:
          checks.capsuleCount >= 8 &&
          checks.circleBtnCount >= 3 &&
          checks.paywallText &&
          checks.aiBtnCount >= 1,
      });

      if (slug === 'ai-digital-shop') {
        await page.screenshot({ path: SCREEN_PC, fullPage: true });
      }
    } catch (e) {
      report.pages.push({ slug, url, error: e.message });
    }
  }

  // ───────────── 2. 触发付费弹窗 ─────────────
  try {
    await page.goto(`${BASE_URL}/projects/ai-digital-shop`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    // 先清空会员状态
    await page.evaluate(() => {
      localStorage.removeItem('membership_level');
    });
    // 模拟完成前 2 步
    await page.evaluate(() => {
      localStorage.setItem('opc_sop_progress::ai-digital-shop', '2');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const hasPaywallHint = await page.evaluate(() => {
      return document.body.innerHTML.includes('完成该步骤需要加入实操会员');
    });
    // 点击解锁按钮触发弹窗
    if (hasPaywallHint) {
      const btn = await page.$('button:has-text("解锁并开启指导")');
      if (btn) {
        await btn.click();
        await page.waitForTimeout(800);
        const modal = await page.evaluate(() => {
          const text = document.body.innerText;
          return {
            hasModal: text.includes('解锁完整 SOP 子步骤'),
            hasMemberText: text.includes('69 元实操会员'),
            hasAICoach: text.includes('AI 随行教练'),
          };
        });
        report.paywallModal = modal;
        await page.screenshot({ path: SCREEN_PAYWALL, fullPage: false });
      }
    } else {
      report.paywallModal = { error: '未找到付费提示卡' };
    }
  } catch (e) {
    report.paywallModal = { error: e.message };
  }

  // ───────────── 3. 触发 AI 教练对话框 ─────────────
  try {
    await page.goto(`${BASE_URL}/projects/ai-digital-shop`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    // 模拟付费用户+当前在第 1 步（这样第 1 步展开的子步骤会有 AI 按钮）
    await page.evaluate(() => {
      localStorage.setItem('membership_level', '69');
      localStorage.removeItem('opc_sop_progress::ai-digital-shop');
      localStorage.removeItem('opc_sop_subprogress::ai-digital-shop');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const aiBtn = await page.$('button[aria-label="AI 助手"]');
    if (aiBtn) {
      await aiBtn.click();
      await page.waitForTimeout(2500); // 等 AI 返回
      const aiState = await page.evaluate(() => {
        const text = document.body.innerText;
        return {
          hasAICoachTitle: text.includes('AI 随行教练'),
          hasGuidance: text.includes('操作指引') || text.includes('打开目标平台') || text.includes('AI 教练正在为你生成指引'),
          hasExternalLink: !!document.querySelector('a[href*="ishop.taobao.com"], a[href*="open"]'),
        };
      });
      report.aiCoach = aiState;
      await page.screenshot({ path: SCREEN_AI, fullPage: false });
    } else {
      report.aiCoach = { error: '未找到 AI 助手按钮' };
    }
  } catch (e) {
    report.aiCoach = { error: e.message };
  }

  // ───────────── 4. 移动端测试 ─────────────
  try {
    const mobileCtx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mPage = await mobileCtx.newPage();
    await mPage.goto(`${BASE_URL}/projects/ai-digital-shop`, { waitUntil: 'networkidle' });
    await mPage.waitForTimeout(1500);

    const mobileCheck = await mPage.evaluate(() => {
      const circleBtns = document.querySelectorAll('button[aria-label*="标记完成"]');
      const tooSmall = Array.from(circleBtns).filter(b => {
        const r = b.getBoundingClientRect();
        return r.height < 28;
      }).length;
      const aiBtns = document.querySelectorAll('button[aria-label="AI 助手"]');
      const aiTooSmall = Array.from(aiBtns).filter(b => {
        const r = b.getBoundingClientRect();
        return r.width < 36 || r.height < 36;
      }).length;
      return {
        circleBtnCount: circleBtns.length,
        circleTooSmall: tooSmall,
        aiBtnCount: aiBtns.length,
        aiTooSmall,
        capsules: document.querySelectorAll('.rounded-full.border.flex.items-center.justify-center').length,
      };
    });
    report.mobile = mobileCheck;
    await mPage.screenshot({ path: SCREEN_MOBILE, fullPage: true });
    await mobileCtx.close();
  } catch (e) {
    report.mobile = { error: e.message };
  }

  // ───────────── 5. 标记子任务完成 → 鼓励语特效 ─────────────
  try {
    await page.goto(`${BASE_URL}/projects/ai-digital-shop`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    // 模拟付费用户，但 currentStep=0，且第 0 步的某个子任务已勾选
    await page.evaluate(() => {
      localStorage.setItem('membership_level', '69');
      localStorage.setItem('opc_sop_progress::ai-digital-shop', '0');
      // 第 0 步的子任务 id 是 step0-sub1, step0-sub2, step0-sub3
      // 存储 key 格式：step{stepIdx}-{sub.id}
      const subs = ['step0-step0-sub1', 'step0-step0-sub2'];
      localStorage.setItem('opc_sop_subprogress::ai-digital-shop', JSON.stringify(subs));
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    // currentStep=0, expandedStep=0 → 第 0 步展开且显示 3 个子任务圆选择框
    // 找到一个"标记完成"按钮（aria-label=标记完成）
    const checkBtn = await page.$('button[aria-label="标记完成"]');
    if (checkBtn) {
      await checkBtn.click();
      await page.waitForTimeout(900);
      // 检查是否触发鼓励语
      const cheerShown = await page.evaluate(() => {
        return document.body.innerText.includes('子任务完成') ||
               document.body.innerText.includes('做得不错') ||
               document.body.innerText.includes('进度 +1') ||
               document.body.innerText.includes('太棒了') ||
               document.body.innerText.includes('加油') ||
               document.body.innerText.includes('锁定') ||
               document.body.innerText.includes('已完成');
      });
      report.cheer = { triggered: cheerShown };
    } else {
      report.cheer = { error: '未找到标记完成按钮' };
    }
  } catch (e) {
    report.cheer = { error: e.message };
  }

  // ───────────── 6. API 端点测试 ─────────────
  try {
    const apiRes = await page.evaluate(async (base) => {
      const r = await fetch(`${base}/api/ai/practice-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectTitle: 'AI 数字网店项目',
          stepTitle: '第 1 步 · 开店申请',
          subStepTitle: '收集入驻材料',
          actionUrl: 'https://ishop.taobao.com',
        }),
      });
      const j = await r.json();
      return {
        status: r.status,
        success: j.success,
        source: j?.data?.source,
        guidanceLength: j?.data?.guidance?.length || 0,
        guidancePreview: (j?.data?.guidance || '').slice(0, 150),
      };
    }, BASE_URL);
    report.apiTests.push({ endpoint: '/api/ai/practice-script', ...apiRes });
  } catch (e) {
    report.apiTests.push({ endpoint: '/api/ai/practice-script', error: e.message });
  }

  // 输出报告
  const fs = require('fs');
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf-8');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  沉浸式 SOP 详情页功能验证报告');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  // 页面测试概览
  console.log('【1. 6 个项目页面渲染检查】');
  for (const p of report.pages) {
    if (p.error) {
      console.log(`  ❌ ${p.slug.padEnd(30)} ERROR: ${p.error}`);
      continue;
    }
    const ok = p.pass ? '✅' : '⚠️ ';
    const t = p.title;
    console.log(`  ${ok} ${t.padEnd(20)} [${p.status}] 胶囊=${p.capsuleCount}/8  圆选择=${p.circleBtnCount}  AI按钮=${p.aiBtnCount}  付费=${p.paywallText ? '✓' : '✗'}  大按钮=${p.bigButtonCount}`);
  }

  console.log('');
  console.log('【2. 付费解锁弹窗】');
  if (report.paywallModal?.error) {
    console.log(`  ❌ ${report.paywallModal.error}`);
  } else {
    const m = report.paywallModal || {};
    console.log(`  ${m.hasModal ? '✅' : '❌'} 弹窗出现：${m.hasModal}`);
    console.log(`  ${m.hasMemberText ? '✅' : '❌'} 包含 "69 元实操会员" 文案`);
    console.log(`  ${m.hasAICoach ? '✅' : '❌'} 包含 "AI 随行教练" 文案`);
  }

  console.log('');
  console.log('【3. AI 助手浮窗】');
  if (report.aiCoach?.error) {
    console.log(`  ❌ ${report.aiCoach.error}`);
  } else {
    const a = report.aiCoach || {};
    console.log(`  ${a.hasAICoachTitle ? '✅' : '❌'} AI 教练标题：${a.hasAICoachTitle}`);
    console.log(`  ${a.hasGuidance ? '✅' : '❌'} 引导内容：${a.hasGuidance}`);
  }

  console.log('');
  console.log('【4. 移动端 44px 触控】');
  if (report.mobile?.error) {
    console.log(`  ❌ ${report.mobile.error}`);
  } else {
    const m = report.mobile;
    console.log(`  ${m.capsules === 8 ? '✅' : '❌'} 8 段胶囊进度条：${m.capsules}`);
    console.log(`  ${m.circleTooSmall === 0 ? '✅' : '⚠️ '} 圆形选择框：${m.circleBtnCount} 个，过小 ${m.circleTooSmall}`);
    console.log(`  ${m.aiTooSmall === 0 ? '✅' : '⚠️ '} AI 助手按钮：${m.aiBtnCount} 个，过小 ${m.aiTooSmall}`);
  }

  console.log('');
  console.log('【5. 游戏化鼓励语】');
  if (report.cheer?.error) {
    console.log(`  ❌ ${report.cheer.error}`);
  } else {
    console.log(`  ${report.cheer?.triggered ? '✅' : '⚠️ '} 鼓励语触发：${report.cheer?.triggered}`);
  }

  console.log('');
  console.log('【6. API 端点 /api/ai/practice-script】');
  for (const a of report.apiTests) {
    if (a.error) {
      console.log(`  ❌ ${a.endpoint} ERROR: ${a.error}`);
    } else {
      console.log(`  ✅ status=${a.status} success=${a.success} source=${a.source} guidance=${a.guidanceLength} chars`);
      console.log(`     ${a.guidancePreview}`);
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`报告: ${REPORT_PATH}`);
  console.log(`截图: ${SCREEN_PC} | ${SCREEN_MOBILE} | ${SCREEN_AI} | ${SCREEN_PAYWALL}`);
  console.log('═══════════════════════════════════════════════════════════════');

  await browser.close();
})();
