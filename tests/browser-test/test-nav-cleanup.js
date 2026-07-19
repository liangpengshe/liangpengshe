// 导航清理 + 个人中心入口 + /member 缺口卡 端到端测试
// 验证：
//   T1 PC 顶部导航: 移除"学习中心"/"城市主理人"，新增"个人中心"
//   T2 移动端汉堡: 移除"学习中心"/"城市主理人"，新增"个人中心"
//   T3 个人中心入口点击: 跳转到 /member
//   T4 /member 缺口卡: 未达标时显示"你目前还差 X 分解锁运营实操"

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');

const BASE_URL = 'http://localhost:3001';
const HOME_URL = `${BASE_URL}/`;
const MEMBER_URL = `${BASE_URL}/member`;
const TMP_DIR = process.platform === 'win32' ? path.join(os.tmpdir()) : '/tmp';
const REPORT_PATH = path.join(TMP_DIR, 'nav-test-report.json');
const SCREEN_PC = path.join(TMP_DIR, 'nav-PC.png');
const SCREEN_MOBILE_MENU = path.join(TMP_DIR, 'nav-mobile-menu.png');
const SCREEN_MEMBER_GAP = path.join(TMP_DIR, 'nav-member-gap.png');
const SCREEN_MEMBER_DONE = path.join(TMP_DIR, 'nav-member-done.png');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const report = {
    startedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    steps: [],
    checks: [],
  };

  const log = (msg) => {
    console.log(msg);
    report.steps.push({ t: new Date().toISOString(), msg });
  };
  const check = (label, pass, detail) => {
    const status = pass ? '✅' : '❌';
    console.log(`  ${status} ${label}: ${detail}`);
    report.checks.push({ label, pass, detail });
  };

  try {
    // ══════════════════════════════════════════════════════════
    // T1 — PC 顶部导航（1280×800）
    // ══════════════════════════════════════════════════════════
    log('=== T1: PC 顶部导航检查 ===');
    const pcCtx = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      locale: 'zh-CN',
    });
    const pcPage = await pcCtx.newPage();
    await pcPage.goto(HOME_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await pcPage.waitForTimeout(2000);

    // 1.1 检查"学习中心"已移除
    const hasStudyCenter = await pcPage.evaluate(() => {
      const nav = document.querySelector('header');
      if (!nav) return { found: false, reason: 'no header' };
      const text = nav.textContent || '';
      return {
        found: text.includes('学习中心') || text.includes('📚'),
        text: text.substring(0, 300),
      };
    });
    check('PC 导航 · 学习中心已移除', !hasStudyCenter.found, hasStudyCenter.found ? `文本仍含"学习中心" 或 "📚"` : '✅ 已移除');

    // 1.2 检查"城市主理人"已移除
    const hasPartner = await pcPage.evaluate(() => {
      const nav = document.querySelector('header');
      if (!nav) return { found: false };
      const text = nav.textContent || '';
      return {
        found: text.includes('城市主理人') || text.includes('💼'),
      };
    });
    check('PC 导航 · 城市主理人已移除', !hasPartner.found, hasPartner.found ? '文本仍含"城市主理人" 或 "💼"' : '✅ 已移除');

    // 1.3 检查"个人中心"已添加
    const hasPersonalCenter = await pcPage.evaluate(() => {
      const link = document.querySelector('a[href="/member"]');
      if (!link) return { found: false, hrefs: Array.from(document.querySelectorAll('header a')).map(a => a.getAttribute('href')) };
      const text = (link.textContent || '').trim();
      return { found: text.includes('个人中心'), text, href: link.getAttribute('href') };
    });
    check('PC 导航 · 个人中心已添加', hasPersonalCenter.found, hasPersonalCenter.found ? `text="${hasPersonalCenter.text}" href="${hasPersonalCenter.href}"` : `未找到 /member 链接，当前 header 链接: ${JSON.stringify(hasPersonalCenter.hrefs)}`);

    // 1.4 检查"我的工作台"和"登录/注册"仍在
    const hasWorkspace = await pcPage.evaluate(() => {
      return Array.from(document.querySelectorAll('header *')).some(el => (el.textContent || '').includes('我的工作台'));
    });
    check('PC 导航 · 我的工作台仍存在', hasWorkspace, hasWorkspace ? '✅' : '❌');

    const hasLoginSignup = await pcPage.evaluate(() => {
      const links = Array.from(document.querySelectorAll('header a')).map(a => a.textContent.trim());
      return {
        login: links.includes('登录'),
        signup: links.includes('注册'),
      };
    });
    check('PC 导航 · 登录/注册仍存在', hasLoginSignup.login && hasLoginSignup.signup, JSON.stringify(hasLoginSignup));

    log(`[T1] 截屏: ${SCREEN_PC}`);
    await pcPage.screenshot({ path: SCREEN_PC, fullPage: false });

    // ══════════════════════════════════════════════════════════
    // T2 — 移动端汉堡菜单（375×812，iPhone X）
    // ══════════════════════════════════════════════════════════
    log('');
    log('=== T2: 移动端汉堡菜单检查 ===');
    const mCtx = await browser.newContext({
      viewport: { width: 375, height: 812 },
      locale: 'zh-CN',
      isMobile: true,
      hasTouch: true,
    });
    const mPage = await mCtx.newPage();
    await mPage.goto(HOME_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await mPage.waitForTimeout(2000);

    // 2.1 找到汉堡按钮并点击
    const menuBtn = mPage.locator('button[aria-label="打开菜单"]');
    const hasMenuBtn = await menuBtn.count();
    check('移动端 · 汉堡按钮存在', hasMenuBtn > 0, hasMenuBtn > 0 ? '✅' : '❌');
    if (hasMenuBtn > 0) {
      await menuBtn.first().click();
      await mPage.waitForTimeout(800);
    }

    // 2.2 检查汉堡菜单内容
    const menuItems = await mPage.evaluate(() => {
      // 找抽屉（z-[81] 且是 div）
      const drawer = document.querySelector('.fixed.top-0.right-0');
      if (!drawer) return { found: false };
      const links = Array.from(drawer.querySelectorAll('a, button')).map(el => ({
        tag: el.tagName,
        href: el.getAttribute('href') || '',
        text: (el.textContent || '').trim().substring(0, 50),
      }));
      return { found: true, items: links };
    });
    log(`[T2] 汉堡菜单项: ${JSON.stringify(menuItems.items, null, 2)}`);

    if (menuItems.found) {
      const hasStudyMobile = menuItems.items.some(i => i.text.includes('学习中心') || i.text.includes('📚'));
      const hasPartnerMobile = menuItems.items.some(i => i.text.includes('城市主理人') || i.text.includes('💼'));
      const hasPersonalMobile = menuItems.items.some(i => i.text.includes('个人中心'));
      const hasWorkspaceMobile = menuItems.items.some(i => i.text.includes('我的工作台'));

      check('移动端汉堡 · 学习中心已移除', !hasStudyMobile, hasStudyMobile ? '仍在菜单中' : '✅ 已移除');
      check('移动端汉堡 · 城市主理人已移除', !hasPartnerMobile, hasPartnerMobile ? '仍在菜单中' : '✅ 已移除');
      check('移动端汉堡 · 个人中心已添加', hasPersonalMobile, hasPersonalMobile ? '✅' : '❌');
      check('移动端汉堡 · 我的工作台仍存在', hasWorkspaceMobile, hasWorkspaceMobile ? '✅' : '❌');
    }

    log(`[T2] 截屏: ${SCREEN_MOBILE_MENU}`);
    await mPage.screenshot({ path: SCREEN_MOBILE_MENU, fullPage: false });

    // 2.3 点击个人中心，验证跳转
    log('[T2] 点击汉堡菜单中的"个人中心"');
    const personalLink = mPage.locator('a[href="/member"]').first();
    const personalCount = await mPage.locator('a[href="/member"]').count();
    check('移动端 · 个人中心链接可定位', personalCount > 0, `找到 ${personalCount} 个 /member 链接`);

    if (personalCount > 0) {
      await personalLink.click();
      await mPage.waitForTimeout(2000);
      const url = mPage.url();
      const pass = url.includes('/member');
      check('移动端 · 点击个人中心跳转到 /member', pass, `url=${url}`);
    }

    // ══════════════════════════════════════════════════════════
    // T3 — /member 页面缺口卡
    // ══════════════════════════════════════════════════════════
    log('');
    log('=== T3: /member 页面缺口卡 ===');

    // 3.1 未达标场景: learning_score=0
    log('[T3-1] 设置未达标状态: learning_score=0, opc_level=FLOW');
    await mPage.evaluate(() => {
      try {
        localStorage.setItem('opc_level', 'FLOW');
        localStorage.setItem('learning_score', '0');
        localStorage.setItem('can_unlock_practice', 'false');
        localStorage.removeItem('step_learning_done');
      } catch (e) {}
    });
    await mPage.goto(MEMBER_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await mPage.waitForTimeout(2000);

    const gap0 = await mPage.evaluate(() => {
      const text = document.body.innerText || '';
      return {
        hasGap: text.includes('你目前还差') && text.includes('分解锁运营实操'),
        has80: text.includes('80') || text.includes('80 分'),
        hasScore: text.includes('0 / 80'),
        hasProgressBar: !!document.querySelector('div[style*="width: 0%"]') || text.includes('0 / 80'),
        hasContinueBtn: text.includes('继续学习任务'),
        has3Tasks:
          text.includes('浏览入门') && text.includes('注册先锋') && text.includes('下载 SOP'),
      };
    });
    check('/member · 缺口卡显示"你目前还差 X 分解锁"', gap0.hasGap, gap0.hasGap ? '✅' : '❌');
    check('/member · 显示 "0 / 80" 进度', gap0.hasScore, gap0.hasScore ? '✅' : '❌');
    check('/member · 进度条渲染', gap0.hasProgressBar, gap0.hasProgressBar ? '✅' : '❌');
    check('/member · 显示"继续学习任务"按钮', gap0.hasContinueBtn, gap0.hasContinueBtn ? '✅' : '❌');
    check('/member · 3 个任务列表渲染', gap0.has3Tasks, gap0.has3Tasks ? '✅' : '❌');

    log(`[T3-1] 截屏: ${SCREEN_MEMBER_GAP}`);
    await mPage.screenshot({ path: SCREEN_MEMBER_GAP, fullPage: true });

    // 3.2 中间状态: learning_score=50
    log('[T3-2] 设置中间状态: learning_score=50');
    await mPage.evaluate(() => {
      try {
        localStorage.setItem('learning_score', '50');
      } catch (e) {}
    });
    await mPage.reload({ waitUntil: 'networkidle', timeout: 30000 });
    await mPage.waitForTimeout(2000);
    const gap50 = await mPage.evaluate(() => {
      const text = document.body.innerText || '';
      return {
        hasGap30: text.includes('还差 30') || text.includes('还差30'),
        hasScore50: text.includes('50 / 80'),
      };
    });
    check('/member · score=50 时显示"还差 30 分"', gap50.hasGap30, gap50.hasGap30 ? '✅' : '❌');
    check('/member · score=50 时显示"50 / 80"', gap50.hasScore50, gap50.hasScore50 ? '✅' : '❌');

    // 3.3 已达标场景: learning_score=100
    log('[T3-3] 设置已达标状态: learning_score=100, unlock=true');
    await mPage.evaluate(() => {
      try {
        localStorage.setItem('learning_score', '100');
        localStorage.setItem('can_unlock_practice', 'true');
        localStorage.setItem('step_learning_done', 'true');
      } catch (e) {}
    });
    await mPage.reload({ waitUntil: 'networkidle', timeout: 30000 });
    await mPage.waitForTimeout(2000);
    const gap100 = await mPage.evaluate(() => {
      const text = document.body.innerText || '';
      return {
        hasDone: text.includes('学习阶段已达标') || text.includes('已解锁运营实操'),
        hasGap: text.includes('你目前还差'),
      };
    });
    check('/member · score=100 时显示"已达标"', gap100.hasDone, gap100.hasDone ? '✅' : '❌');
    check('/member · score=100 时隐藏"还差"提示', !gap100.hasGap, !gap100.hasGap ? '✅ 已隐藏' : '❌ 仍显示');

    log(`[T3-3] 截屏: ${SCREEN_MEMBER_DONE}`);
    await mPage.screenshot({ path: SCREEN_MEMBER_DONE, fullPage: true });

    // 3.4 未诊断场景: 无 opc_level
    log('[T3-4] 清除 opc_level（未诊断）');
    await mPage.evaluate(() => {
      try {
        localStorage.removeItem('opc_level');
        localStorage.setItem('learning_score', '0');
        localStorage.setItem('can_unlock_practice', 'false');
        localStorage.removeItem('step_learning_done');
      } catch (e) {}
    });
    await mPage.reload({ waitUntil: 'networkidle', timeout: 30000 });
    await mPage.waitForTimeout(2000);
    const gapNoLevel = await mPage.evaluate(() => {
      const text = document.body.innerText || '';
      return {
        hasGap: text.includes('你目前还差'),
      };
    });
    check('/member · 未诊断时缺口卡不显示', !gapNoLevel.hasGap, !gapNoLevel.hasGap ? '✅ 未显示' : '❌ 仍显示');

    // ══════════════════════════════════════════════════════════
    // 汇总
    // ══════════════════════════════════════════════════════════
    log('');
    log('═══════════════════════════════════════════════');
    log('           测试结果汇总');
    log('═══════════════════════════════════════════════');
    const passed = report.checks.filter(c => c.pass).length;
    const total = report.checks.length;
    log(`通过: ${passed} / ${total}`);
    if (passed < total) {
      log('❌ 失败项:');
      report.checks.filter(c => !c.pass).forEach((c, i) => log(`  ${i + 1}. ${c.label}: ${c.detail}`));
    } else {
      log('🎉 全部通过！');
    }
    log('═══════════════════════════════════════════════');
  } catch (err) {
    log(`[FATAL] ${err.message}`);
    console.error(err.stack);
    report.fatal = err.message;
  } finally {
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
    log(`[报告] ${REPORT_PATH}`);
    log(`[截屏] PC=${SCREEN_PC}`);
    log(`[截屏] Mobile Menu=${SCREEN_MOBILE_MENU}`);
    log(`[截屏] Member Gap=${SCREEN_MEMBER_GAP}`);
    log(`[截屏] Member Done=${SCREEN_MEMBER_DONE}`);
    await browser.close();
  }
})();
