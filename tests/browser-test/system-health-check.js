/**
 * 良朋社系统综合健康检查
 * 扫描所有页面 + API 路由，输出状态码、响应时间、错误统计
 */
const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');

const REPORT_PATH = path.join(os.tmpdir(), 'system-health-report.json');
const BASE = 'http://localhost:3001';

// 所有需要扫描的页面（按优先级分组）
const PAGES = [
  // ── 核心入口 ──
  { name: '首页', path: '/', priority: 'P0' },
  { name: '诊断', path: '/diagnosis', priority: 'P0' },
  { name: '学习引导·交易型', path: '/guide/trader', priority: 'P0' },
  { name: '学习引导·流量型', path: '/guide/flow', priority: 'P0' },
  { name: '学习引导·系统型', path: '/guide/system', priority: 'P0' },
  { name: '学习引导·资产型', path: '/guide/asset', priority: 'P0' },
  { name: '市场', path: '/market', priority: 'P0' },
  { name: '市场·工具', path: '/market/tools', priority: 'P1' },
  { name: '市场·服务', path: '/market/services', priority: 'P1' },
  { name: '市场·项目', path: '/market/projects', priority: 'P0' },
  { name: '市场·资源', path: '/market/resources', priority: 'P1' },
  { name: '项目详情', path: '/projects/ai-digital-shop', priority: 'P0' },
  { name: '主理人', path: '/partner', priority: 'P0' },
  { name: '定价', path: '/pricing', priority: 'P0' },
  { name: '个人中心', path: '/member', priority: 'P0' },
  { name: '控制台', path: '/console', priority: 'P1' },
  { name: '工作台', path: '/workspace', priority: 'P1' },
  // ── 工具页 ──
  { name: '工具广场', path: '/tools', priority: 'P1' },
  { name: '灵犀AI', path: '/tools/lingxi', priority: 'P1' },
  { name: '豹纹', path: '/tools/leopard', priority: 'P1' },
  { name: '先锋派', path: '/tools/pioneer', priority: 'P1' },
  { name: '订阅管理', path: '/tools/subscription', priority: 'P1' },
  { name: '问卷生成', path: '/tools/survey-gen', priority: 'P1' },
  { name: '工具提交', path: '/tools/submit', priority: 'P1' },
  // ── 服务/项目 ──
  { name: '服务', path: '/services', priority: 'P1' },
  { name: '服务加入', path: '/services/join', priority: 'P1' },
  { name: '项目', path: '/projects', priority: 'P1' },
  { name: '项目提交', path: '/projects/submit', priority: 'P1' },
  { name: '加入', path: '/join', priority: 'P1' },
  { name: '资源', path: '/resources', priority: 'P1' },
  // ── 城市站 ──
  { name: '东莞', path: '/dongguan', priority: 'P2' },
  { name: '乌海', path: '/wuhai', priority: 'P2' },
  { name: '柳州', path: '/liuzhou', priority: 'P2' },
  // ── 控制台子页 ──
  { name: '控制台·城市日报', path: '/console/city-daily', priority: 'P2' },
  { name: '控制台·评论', path: '/console/reviews', priority: 'P2' },
  { name: '控制台·诊断', path: '/console/diagnoses', priority: 'P2' },
  { name: '控制台·收入', path: '/console/revenue', priority: 'P2' },
  { name: '控制台·申请', path: '/console/applications', priority: 'P2' },
  { name: '控制台·项目', path: '/console/projects', priority: 'P2' },
  { name: '控制台·沙龙', path: '/console/salons', priority: 'P2' },
  // ── 其他 ──
  { name: '沙龙', path: '/salon', priority: 'P2' },
  { name: '预订', path: '/booking', priority: 'P2' },
  { name: '咨询', path: '/contact', priority: 'P2' },
  { name: 'IP 重建', path: '/ip-reconstruction', priority: 'P2' },
  { name: '规模化', path: '/scale-up', priority: 'P2' },
  { name: '登录', path: '/auth/login', priority: 'P0' },
  { name: '注册', path: '/auth/signup', priority: 'P0' },
  { name: 'Dify 测试', path: '/test-dify', priority: 'P2' },
  // ── 重定向测试 ──
  { name: '重定向 /pitch→/partner', path: '/pitch', priority: 'P0' },
];

const APIS = [
  { name: '学习进度', path: '/api/user/learning-progress?phone=dev-1784021801892-12571' },
  { name: '社区心跳', path: '/api/community/heartbeat' },
  { name: '活动流', path: '/api/activities' },
  { name: '积分', path: '/api/points' },
  { name: '积分签到', path: '/api/points?action=checkin', method: 'POST' },
  { name: '成员路线图', path: '/api/member/roadmap' },
  { name: '推荐工具', path: '/api/ai/tools-recommend', method: 'POST', body: { level: 'trader' } },
  { name: '诊断', path: '/api/ai/diagnose', method: 'POST', body: { question: '我想做电商' } },
  { name: 'AI 聊天', path: '/api/ai/chat', method: 'POST', body: { message: '你好', sessionId: 'test' } },
  { name: 'AI 匹配', path: '/api/ai/match' },
  { name: 'AI 教练', path: '/api/guide/ai-coach', method: 'POST', body: { level: 'trader' } },
  { name: '工具推荐', path: '/api/ai/recommend-tools', method: 'POST', body: { level: 'trader' } },
  { name: '城市日报', path: '/api/console/city-daily' },
  { name: '社区脉冲', path: '/api/community/pulse' },
  { name: '控制台统计', path: '/api/console/stats' },
  { name: '控制台申请', path: '/api/console/applications' },
  { name: '控制台项目', path: '/api/console/projects' },
  { name: '控制台沙龙', path: '/api/console/salons' },
  { name: '资源列表', path: '/api/resources/detail' },
  { name: '资源互动', path: '/api/resources/interact' },
  { name: '资源提交', path: '/api/resources/submit' },
  { name: '资源 SEO', path: '/api/resources/seo-description' },
  { name: '项目列表', path: '/api/projects' },
  { name: '项目查询', path: '/api/projects/find-opc' },
  { name: '项目步骤进度', path: '/api/projects/step-progress' },
  { name: '项目咨询', path: '/api/projects/inquiry', method: 'POST', body: { projectSlug: 'test', message: 'test' } },
  { name: '服务加入', path: '/api/services/join', method: 'POST', body: { serviceId: 'test' } },
  { name: '服务咨询', path: '/api/services/inquiry', method: 'POST', body: { serviceId: 'test' } },
  { name: '服务专家申请', path: '/api/services/expert-apply', method: 'POST', body: { name: 'test' } },
  { name: '服务匹配', path: '/api/services/collaboration-match' },
  { name: '订单创建', path: '/api/order/create', method: 'POST', body: { plan: 'test' } },
  { name: '订单收入', path: '/api/order/revenue' },
  { name: '收入仪表板', path: '/api/revenue/dashboard' },
  { name: '工具试用', path: '/api/tools/trial', method: 'POST', body: { toolId: 'test' } },
  { name: '工具提交', path: '/api/tools/submit', method: 'POST', body: { name: 'test' } },
  { name: '评论', path: '/api/community/comments' },
  { name: '评论查询', path: '/api/community/comments?target=guide-flow' },
  { name: '评论提交', path: '/api/community/comments', method: 'POST', body: { target: 'guide-flow', content: 'test' } },
  { name: '用户偏好', path: '/api/user/preference' },
  { name: '用户偏好查询', path: '/api/user/preference?phone=dev-1784021801892-12571' },
  { name: '用户偏好更新', path: '/api/user/preference', method: 'POST', body: { phone: 'dev-1784021801892-12571', level: 'flow' } },
  { name: '自适应提醒', path: '/api/user/adaptive-alert' },
  { name: '适应性提醒查询', path: '/api/user/adaptive-alert?phone=dev-1784021801892-12571' },
  { name: '评论列表', path: '/api/review' },
  { name: '咨询', path: '/api/consultations' },
  { name: '诊断生成', path: '/api/diagnosis/generate', method: 'POST', body: { question: 'test' } },
  { name: '支付创建', path: '/api/payment/create-checkout', method: 'POST', body: { plan: 'monthly' } },
  { name: '支付模拟', path: '/api/payment/mock-checkout', method: 'POST', body: { plan: 'monthly' } },
  { name: '支付取消', path: '/api/payment/cancel', method: 'POST', body: { orderId: 'test' } },
  { name: 'TTS', path: '/api/ai/tts', method: 'POST', body: { text: '测试' } },
  { name: 'AI 每日简报', path: '/api/ai/daily-brief', method: 'POST', body: { phone: 'dev-1784021801892-12571' } },
  { name: 'AI SOP 图片', path: '/api/ai/sop-image', method: 'POST', body: { level: 'trader' } },
  { name: 'AI 项目计划', path: '/api/ai/project-plan', method: 'POST', body: { level: 'trader' } },
  { name: 'AI 实战脚本', path: '/api/ai/practice-script', method: 'POST', body: { level: 'flow' } },
  { name: '伙伴', path: '/api/partner' },
  { name: '沙龙支付', path: '/api/pay/salon', method: 'POST', body: { salonId: 'test' } },
  { name: '伙伴咨询', path: '/api/resources/partner-inquiry', method: 'POST', body: { name: 'test' } },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
  const page = await ctx.newPage();

  const allIssues = [];
  page.on('pageerror', (err) => {
    allIssues.push({ type: 'pageerror', text: err.message.substring(0, 500), url: page.url() });
  });

  console.log('══════════════════════════════════════════════════════════');
  console.log('  良朋社系统综合健康检查');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`  Base URL: ${BASE}`);
  console.log(`  页面数: ${PAGES.length}`);
  console.log(`  API 数: ${APIS.length}`);
  console.log('══════════════════════════════════════════════════════════\n');

  // ── 第一阶段: 检查所有页面 ──
  const pageResults = [];
  console.log('┌─ 阶段 1: 页面健康检查 ─────────────────────────────┐');

  for (const p of PAGES) {
    const t0 = Date.now();
    try {
      const res = await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForTimeout(500);
      const elapsed = Date.now() - t0;
      const status = res?.status() || 0;
      const finalUrl = page.url();
      // 重定向到 /auth/login 视为 200（未登录正常跳转）
      const isRedirectToLogin = status === 200 && finalUrl.includes('/auth/login');
      pageResults.push({ name: p.name, path: p.path, status, elapsed, finalUrl, isRedirectToLogin, priority: p.priority });
      const tag = status === 200 ? '✓' : status >= 500 ? '✗' : '⚠';
      console.log(`  ${tag} [${p.priority}] ${p.path.padEnd(38)} → ${status} (${elapsed}ms) ${isRedirectToLogin ? '[→login]' : ''}`);
    } catch (e) {
      const elapsed = Date.now() - t0;
      pageResults.push({ name: p.name, path: p.path, status: 0, elapsed, error: e.message.substring(0, 200), priority: p.priority });
      console.log(`  ✗ [${p.priority}] ${p.path.padEnd(38)} → TIMEOUT (${elapsed}ms)`);
    }
  }
  console.log('└────────────────────────────────────────────────────┘\n');

  // ── 第二阶段: API 路由检测 ──
  const apiResults = [];
  console.log('┌─ 阶段 2: API 路由检查 ─────────────────────────────┐');

  for (const a of APIS) {
    const t0 = Date.now();
    try {
      const opts = {
        method: a.method || 'GET',
        headers: { 'Content-Type': 'application/json' },
        timeout: 20000,
      };
      if (a.body) opts.data = a.body;
      const res = await page.request.fetch(BASE + a.path, opts);
      const elapsed = Date.now() - t0;
      const status = res.status();
      apiResults.push({ name: a.name, path: a.path, method: a.method || 'GET', status, elapsed });
      const tag = status < 400 ? '✓' : status >= 500 ? '✗' : '⚠';
      console.log(`  ${tag} ${(a.method || 'GET').padEnd(5)} ${a.path.padEnd(58)} → ${status} (${elapsed}ms)`);
    } catch (e) {
      const elapsed = Date.now() - t0;
      apiResults.push({ name: a.name, path: a.path, method: a.method || 'GET', status: 0, elapsed, error: e.message.substring(0, 200) });
      console.log(`  ✗ ${(a.method || 'GET').padEnd(5)} ${a.path.padEnd(58)} → ERR (${elapsed}ms)`);
    }
  }
  console.log('└────────────────────────────────────────────────────┘\n');

  // ── 汇总统计 ──
  const pageOk = pageResults.filter((r) => r.status === 200).length;
  const pageRedirect = pageResults.filter((r) => r.isRedirectToLogin).length;
  const pageErr = pageResults.filter((r) => r.status >= 500).length;
  const pageWarn = pageResults.filter((r) => r.status >= 400 && r.status < 500).length;
  const pageTimeout = pageResults.filter((r) => r.status === 0).length;

  const apiOk = apiResults.filter((r) => r.status < 400).length;
  const apiOk2xx = apiResults.filter((r) => r.status >= 200 && r.status < 300).length;
  const apiOk4xx = apiResults.filter((r) => r.status >= 400 && r.status < 500).length;
  const apiErr = apiResults.filter((r) => r.status >= 500).length;
  const apiErr2 = apiResults.filter((r) => r.status === 0).length;

  const totalIssues = allIssues.length;

  console.log('══════════════════════════════════════════════════════════');
  console.log('  📊 综合统计');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`  页面:`);
  console.log(`    ✓ 200 OK:           ${pageOk}/${PAGES.length}`);
  console.log(`    ⚠ 4xx 客户端重定向: ${pageWarn} (含重定向到 login: ${pageRedirect})`);
  console.log(`    ✗ 5xx 服务端错误:   ${pageErr}`);
  console.log(`    ⏱ 超时:            ${pageTimeout}`);
  console.log(`  API:`);
  console.log(`    ✓ 2xx 成功:         ${apiOk2xx}/${APIS.length}`);
  console.log(`    ⚠ 4xx 业务异常:     ${apiOk4xx} (参数/权限/未找到，业务正常)`);
  console.log(`    ✗ 5xx 服务端错误:   ${apiErr}`);
  console.log(`    ⏱ 超时:            ${apiErr2}`);
  console.log(`  JS 运行时错误 (pageerror): ${totalIssues}`);
  console.log('══════════════════════════════════════════════════════════\n');

  if (pageErr + pageTimeout + apiErr + apiErr2 > 0) {
    console.log('⚠️  失败项详情:');
    for (const r of pageResults.filter((r) => r.status === 0 || r.status >= 500)) {
      console.log(`  - 页面 ${r.path}: ${r.error || 'HTTP ' + r.status}`);
    }
    for (const r of apiResults.filter((r) => r.status === 0 || r.status >= 500)) {
      console.log(`  - API ${r.path}: ${r.error || 'HTTP ' + r.status}`);
    }
    console.log('');
  }

  // 保存报告
  fs.writeFileSync(
    REPORT_PATH,
    JSON.stringify(
      { pageResults, apiResults, allIssues, summary: { pageOk, pageRedirect, pageErr, pageWarn, pageTimeout, apiOk2xx, apiOk4xx, apiErr, apiErr2, totalIssues } },
      null,
      2
    )
  );

  await browser.close();
  console.log(`📄 报告: ${REPORT_PATH}`);
})();
