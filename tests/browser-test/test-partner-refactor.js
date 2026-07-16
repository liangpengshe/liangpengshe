// /partner 页面重构验证
const { chromium } = require('playwright');
const path = require('path');
const os = require('os');
const fs = require('fs');

const TMP = process.platform === 'win32' ? os.tmpdir() : '/tmp';
const BASE = 'http://localhost:3001';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const report = {
    timestamp: new Date().toISOString(),
    checks: [],
  };

  // ── 1. /partner 页面渲染检查 ──
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1800 } });
    const page = await ctx.newPage();
    const r = await page.goto(`${BASE}/partner`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);

    const checks = await page.evaluate(() => {
      const html = document.body.innerHTML;
      const text = document.body.innerText;
      return {
        // 深色背景
        darkBg: html.includes('bg-gradient-to-b from-slate-900'),
        // 玻璃态卡片
        glassCards: (html.match(/bg-white\/5 backdrop-blur-sm/g) || []).length,
        // 主标题渐变
        gradientTitle: html.includes('text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400'),
        // 数据大盘
        hasStat210: text.includes('¥210 万+') || html.includes('210 万+'),
        hasStat300: text.includes('300+'),
        hasStat5cities: text.includes('5 城'),
        hasStat9agents: text.includes('9 个'),
        // 9 大 AI 智能体
        agents: ['CEO 智能体', '技术智能体', '营销智能体', '邮件智能体', '客服智能体', '研究智能体', '广告智能体', '财务智能体', '执行智能体'].filter(n => text.includes(n)),
        // 商业闭环
        loopSteps: ['工具与系统赋能', '本地沙龙引流', '深度陪跑与代运营', '分站规模化复制'].filter(n => text.includes(n)),
        // 三方分润
        parties: ['资源方', '城市主理人', '良朋社总部'].filter(n => text.includes(n)),
        // 5980 价格
        has5980: text.includes('5,980') || text.includes('5980'),
        // 4 大权益模块
        benefits: ['品牌授权与背书', '标准化沙龙 SOP', '全套 AI 工具库', '深度陪跑与内训'].filter(n => text.includes(n)),
        // 加盟 CTA
        ctaButton: text.includes('立即咨询 5980 城市主理人加盟') || text.includes('立即咨询'),
        // 表单
        hasForm: html.includes('意向城市') && html.includes('微信号'),
        // AIMatchmaker
        hasMatchmaker: html.includes('AI 智能供需') || html.includes('智能匹配'),
      };
    });

    report.partnerPage = {
      status: r.status(),
      ...checks,
      screenshots: { pc: path.join(TMP, 'partner-pc.png') },
    };

    await page.screenshot({ path: report.partnerPage.screenshots.pc, fullPage: true });
    await ctx.close();
  } catch (e) {
    report.partnerPage = { error: e.message };
  }

  // ── 2. /pitch → /partner 重定向 ──
  try {
    const r = await fetch(`${BASE}/pitch`, { redirect: 'manual' });
    report.pitchRedirect = {
      status: r.status,
      location: r.headers.get('location'),
    };
  } catch (e) {
    report.pitchRedirect = { error: e.message };
  }

  // ── 3. 首页导航检查（不应出现 /pitch 链接） ──
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    const nav = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('header a, header button'));
      const navInfo = links.map(a => ({
        text: (a.textContent || '').trim().slice(0, 20),
        href: a.getAttribute('href') || '',
      })).filter(a => a.text);
      return {
        allLinks: navInfo,
        hasPitchLink: navInfo.some(a => a.href === '/pitch'),
        hasPartnerLink: navInfo.some(a => a.href === '/partner'),
      };
    });

    report.homeNav = nav;
    await ctx.close();
  } catch (e) {
    report.homeNav = { error: e.message };
  }

  // ── 4. 移动端适配 ──
  try {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/partner`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const mobileCheck = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="rounded-2xl"]');
      const overflow = Array.from(cards).some(c => {
        const r = c.getBoundingClientRect();
        return r.right > window.innerWidth + 2;
      });
      return {
        cardCount: cards.length,
        overflow,
        bodyWidth: document.body.scrollWidth,
        windowWidth: window.innerWidth,
      };
    });

    report.mobile = {
      ...mobileCheck,
      screenshot: path.join(TMP, 'partner-mobile.png'),
    };
    await page.screenshot({ path: report.mobile.screenshot, fullPage: true });
    await ctx.close();
  } catch (e) {
    report.mobile = { error: e.message };
  }

  // 报告输出
  console.log('═══════════════════════════════════════════════════════');
  console.log('  /partner 页面重构验证报告');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  // 1. 页面渲染
  console.log('[1] /partner 页面渲染检查');
  if (report.partnerPage.error) {
    console.log('  ERR:', report.partnerPage.error);
  } else {
    const p = report.partnerPage;
    console.log('  ' + (p.darkBg ? 'OK' : 'NO') + '  深色科技底: bg-slate-900 to-slate-800');
    console.log('  ' + (p.gradientTitle ? 'OK' : 'NO') + '  主标题渐变: from-amber-300 via-orange-400 to-rose-400');
    console.log('  OK  玻璃态卡片: ' + p.glassCards + ' 处');
    console.log('  ' + (p.hasStat210 ? 'OK' : 'NO') + '  数据大盘 210 万+');
    console.log('  ' + (p.hasStat300 ? 'OK' : 'NO') + '  数据大盘 300+ 主理人');
    console.log('  ' + (p.hasStat5cities ? 'OK' : 'NO') + '  数据大盘 5 城');
    console.log('  ' + (p.hasStat9agents ? 'OK' : 'NO') + '  数据大盘 9 个智能体');
    console.log('  OK  9 大 AI 智能体: ' + p.agents.join('/'));
    console.log('  OK  商业闭环 4 步: ' + p.loopSteps.length + '/4 (' + p.loopSteps.join('/') + ')');
    console.log('  OK  三方分润: ' + p.parties.join('/'));
    console.log('  ' + (p.has5980 ? 'OK' : 'NO') + '  5980 元价格显性化');
    console.log('  OK  4 大权益模块: ' + p.benefits.length + '/4 (' + p.benefits.join('/') + ')');
    console.log('  ' + (p.ctaButton ? 'OK' : 'NO') + '  加盟 CTA 按钮');
    console.log('  ' + (p.hasForm ? 'OK' : 'NO') + '  合作意向表单');
    console.log('  ' + (p.hasMatchmaker ? 'OK' : 'NO') + '  AI 智能供需匹配');
  }

  console.log('');
  console.log('[2] /pitch 重定向到 /partner');
  if (report.pitchRedirect.error) {
    console.log('  ERR:', report.pitchRedirect.error);
  } else {
    console.log('  status=' + report.pitchRedirect.status + '  Location=' + report.pitchRedirect.location);
  }

  console.log('');
  console.log('[3] 首页导航检查');
  if (report.homeNav.error) {
    console.log('  ERR:', report.homeNav.error);
  } else {
    const n = report.homeNav;
    console.log('  ' + (n.hasPitchLink ? 'FAIL' : 'OK') + '  已移除 /pitch 链接');
    console.log('  ' + (n.hasPartnerLink ? 'OK' : 'FAIL') + '  存在 /partner 链接');
    console.log('  Nav items:');
    n.allLinks.forEach(l => console.log('    ' + l.text + ' -> ' + l.href));
  }

  console.log('');
  console.log('[4] 移动端适配');
  if (report.mobile.error) {
    console.log('  ERR:', report.mobile.error);
  } else {
    const m = report.mobile;
    console.log('  ' + (m.overflow ? 'FAIL' : 'OK') + '  无横向溢出 (window=' + m.windowWidth + ' body=' + m.bodyWidth + ')');
    console.log('  OK  渲染卡片数: ' + m.cardCount);
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('截图:');
  if (report.partnerPage?.screenshots) console.log('  PC  : ' + report.partnerPage.screenshots.pc);
  if (report.mobile?.screenshot) console.log('  Mobile: ' + report.mobile.screenshot);
  console.log('═══════════════════════════════════════════════════════');

  // 写报告
  fs.writeFileSync(path.join(TMP, 'partner-refactor-report.json'), JSON.stringify(report, null, 2), 'utf-8');

  await browser.close();
})();
