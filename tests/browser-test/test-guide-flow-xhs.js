// 验证 flow 任务 2 改为"小红书"，trader 不受影响
const { chromium } = require('playwright');
const path = require('path');
const os = require('os');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1200 } });
  let pass = 0, total = 0;
  const log = (m) => console.log(m);

  // 1. flow 路由任务 2
  log('═══ 阶段 1: /guide/flow 任务 2 ═══');
  await page.goto('http://localhost:3001/guide/flow', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(os.tmpdir(), 'guide-flow-xhs.png'), fullPage: true });

  const flowTask2 = await page.evaluate(() => {
    const text = document.body.textContent || '';
    return {
      hasNewTitle: text.includes('注册你的第一个小红书账号'),
      hasNewDesc: text.includes('AI 自媒体图文运营统一从小红书起步'),
      hasOldTitle: text.includes('注册你的第一个微信公众号'),
      hasOldDesc: text.includes('AI 自媒体图文运营统一从公众号起步'),
      hasOldUrl: text.includes('mp.weixin.qq.com'),
      // 找任务 2 按钮
      task2Button: (() => {
        const links = [...document.querySelectorAll('a')];
        const btn = links.find((a) => a.textContent?.includes('小红书创作者中心'));
        return btn ? { text: btn.textContent?.trim(), href: btn.getAttribute('href') } : null;
      })(),
    };
  });

  total++; if (flowTask2.hasNewTitle) pass++;
  log(`  新标题"小红书账号": ${flowTask2.hasNewTitle ? '✅' : '❌'}`);
  total++; if (flowTask2.hasNewDesc) pass++;
  log(`  新描述"从小红书起步": ${flowTask2.hasNewDesc ? '✅' : '❌'}`);
  total++; if (!flowTask2.hasOldTitle) pass++;
  log(`  旧标题已清除: ${!flowTask2.hasOldTitle ? '✅' : '❌'}`);
  total++; if (!flowTask2.hasOldDesc) pass++;
  log(`  旧描述已清除: ${!flowTask2.hasOldDesc ? '✅' : '❌'}`);
  total++; if (!flowTask2.hasOldUrl) pass++;
  log(`  旧 URL mp.weixin 已清除: ${!flowTask2.hasOldUrl ? '✅' : '❌'}`);

  log(`  任务 2 按钮: ${JSON.stringify(flowTask2.task2Button)}`);
  total++; if (flowTask2.task2Button?.text?.includes('小红书创作者中心')) pass++;
  total++; if (flowTask2.task2Button?.href === 'https://creator.xiaohongshu.com/') pass++;

  // 2. trader 路由不能受影响
  log('\n═══ 阶段 2: /guide/trader 任务 2（不应受影响）═══');
  await page.goto('http://localhost:3001/guide/trader', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(os.tmpdir(), 'guide-trader.png'), fullPage: true });

  const traderTask2 = await page.evaluate(() => {
    const text = document.body.textContent || '';
    const links = [...document.querySelectorAll('a')];
    return {
      hasTaobaoTitle: text.includes('注册你的第一家淘宝店或抖音店'),
      hasTaobaoBtn: links.some((a) => a.textContent?.includes('淘宝开店') && a.href?.includes('ishop.taobao.com')),
      hasDouyinBtn: links.some((a) => a.textContent?.includes('抖店入驻')),
      hasXiaohongshuContam: text.includes('注册你的第一个小红书账号'),
    };
  });

  total++; if (traderTask2.hasTaobaoTitle) pass++;
  log(`  trader 标题"淘宝店或抖音店": ${traderTask2.hasTaobaoTitle ? '✅' : '❌'}`);
  total++; if (traderTask2.hasTaobaoBtn) pass++;
  log(`  trader 淘宝开店按钮: ${traderTask2.hasTaobaoBtn ? '✅' : '❌'}`);
  total++; if (traderTask2.hasDouyinBtn) pass++;
  log(`  trader 抖店入驻按钮: ${traderTask2.hasDouyinBtn ? '✅' : '❌'}`);
  total++; if (!traderTask2.hasXiaohongshuContam) pass++;
  log(`  trader 无小红书污染: ${!traderTask2.hasXiaohongshuContam ? '✅' : '❌'}`);

  await browser.close();
  log(`\n========== 测试结果 ═══`);
  log(`  通过: ${pass}/${total}`);
  const ok = pass === total;
  log(`  整体: ${ok ? '✅ ALL PASS' : '❌ FAIL'}`);
  process.exit(ok ? 0 : 1);
})();
