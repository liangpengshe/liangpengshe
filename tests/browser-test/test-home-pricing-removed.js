// 验证定价横幅已删除
const { chromium } = require('playwright');
const path = require('path');
const os = require('os');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1200 } });
  let pass = 0, total = 0;

  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const r = await page.evaluate(() => {
    const text = document.body.textContent || '';
    return {
      hasPricingBanner: !!document.querySelector('[data-testid="home-pricing-cta"]'),
      hasText: text.includes('只需 1 分钟') || text.includes('查看落地方案'),
      // 找 OPC 学习智富路径 和 OPC 四层智富阶梯
      stepPath: [...document.querySelectorAll('h2, h3, div, span')].find((el) => el.textContent?.includes('OPC 学习智富路径'))?.getBoundingClientRect(),
      ladder: [...document.querySelectorAll('h2, h3, div, span')].find((el) => el.textContent?.includes('OPC 四层智富阶梯'))?.getBoundingClientRect(),
    };
  });

  total++; if (!r.hasPricingBanner) pass++;
  console.log(`定价横幅已删除: ${!r.hasPricingBanner ? '✅' : '❌'}`);
  total++; if (!r.hasText) pass++;
  console.log(`无残留文案: ${!r.hasText ? '✅' : '❌'}`);

  // 计算间距
  if (r.stepPath && r.ladder) {
    const gap = r.ladder.top - r.stepPath.bottom;
    console.log(`OPC 学习路径 bottom: ${Math.round(r.stepPath.bottom)}px`);
    console.log(`OPC 四层阶梯 top: ${Math.round(r.ladder.top)}px`);
    console.log(`两者间距: ${Math.round(gap)}px ${gap < 100 ? '✅ 自然衔接' : '⚠️ 较大间距'}`);
  } else {
    console.log('未找到 section 元素');
  }

  await page.screenshot({ path: path.join(os.tmpdir(), 'home-no-pricing-cta.png'), fullPage: true });
  await browser.close();
  console.log(`\n通过: ${pass}/${total}`);
  process.exit(pass === total ? 0 : 1);
})();
