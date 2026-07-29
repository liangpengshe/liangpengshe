// 资源库页面精简验证：确认两个极简文字入口已删除，紫色/绿色横幅紧凑衔接
const { chromium } = require('playwright');
const path = require('path');
const os = require('os');

const BASE_URL = 'http://localhost:3001';
const URL = `${BASE_URL}/market/resources`;
const TMP_DIR = process.platform === 'win32' ? path.join(os.tmpdir()) : '/tmp';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1800 } });
  const page = await ctx.newPage();

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 验证两个文字入口已消失
  const hasCommunityPosts = (await page.locator('text=查看成员实战投稿').count()) > 0;
  const hasTrends = (await page.locator('text=查看本周 OPC 风向标').count()) > 0;
  console.log(`  "查看成员实战投稿" 残留: ${hasCommunityPosts ? '❌' : '✅ 已删除'}`);
  console.log(`  "查看本周 OPC 风向标" 残留: ${hasTrends ? '❌' : '✅ 已删除'}`);

  // 验证紫色横幅仍在
  const hasPurpleBanner = (await page.locator('text=你是 OPC 生态成员').count()) > 0;
  console.log(`  紫色 OPC 生态成员横幅保留: ${hasPurpleBanner ? '✅' : '❌'}`);

  // 验证绿色"OPC 内部供需广场"section 仍在
  const hasGreenSection = (await page.locator('text=OPC 内部供需广场').count()) > 0;
  console.log(`  绿色 OPC 内部供需广场保留: ${hasGreenSection ? '✅' : '❌'}`);

  // 测量紫色横幅（OPC 生态成员）正下方到绿色 section 顶部的像素距离
  // 用精确文本定位紫色 OPC 生态成员横幅（避免 .last() 选错其他 from-blue-600 元素）
  const purpleBanner = page.locator('text=你是 OPC 生态成员？点击这里').locator('xpath=ancestor::div[contains(@class, "bg-gradient-to-r")][1]');
  const purpleBox = await purpleBanner.boundingBox();
  const greenBox = await page.locator('text=OPC 内部供需广场').first().locator('..').locator('..').boundingBox();
  if (purpleBox && greenBox) {
    const gap = greenBox.y - (purpleBox.y + purpleBox.height);
    console.log(`  紫色横幅底 → 绿色 section 顶 间距: ${gap.toFixed(0)}px ${gap < 30 ? '✅ 紧凑（< 30px）' : '❌ 仍有过多留白'}`);
  } else {
    console.log(`  ⚠️ 测量失败: purpleBox=${!!purpleBox} greenBox=${!!greenBox}`);
  }

  await page.screenshot({ path: path.join(TMP_DIR, 'resources-compact-after.png'), fullPage: true });
  console.log(`  截图: ${path.join(TMP_DIR, 'resources-compact-after.png')}`);

  // 移动端
  const ctx2 = await browser.newContext({ viewport: { width: 375, height: 2000 }, isMobile: true });
  const p2 = await ctx2.newPage();
  await p2.goto(URL, { waitUntil: 'networkidle' });
  await p2.waitForTimeout(2000);
  await p2.screenshot({ path: path.join(TMP_DIR, 'resources-compact-mobile.png'), fullPage: true });
  console.log(`  移动端截图: ${path.join(TMP_DIR, 'resources-compact-mobile.png')}`);

  await browser.close();
  const pass = !hasCommunityPosts && !hasTrends && hasPurpleBanner && hasGreenSection;
  console.log(`\n  整体: ${pass ? '✅ PASS' : '❌ FAIL'}`);
  process.exit(pass ? 0 : 1);
})();
