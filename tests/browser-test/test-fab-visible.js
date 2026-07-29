// 良朋社 · AI 专家悬浮球可见性测试
// 验证：项目页 /projects/ai-digital-shop-group 右下角应显示呼吸光晕悬浮球

const { chromium } = require('playwright');
const path = require('path');
const os = require('os');

const BASE_URL = 'http://localhost:3001';
const PROJECT_URL = `${BASE_URL}/projects/ai-digital-shop-group`;
const TMP_DIR = process.platform === 'win32' ? path.join(os.tmpdir()) : '/tmp';

const SCREEN = {
  DESKTOP: path.join(TMP_DIR, 'fab-desktop.png'),
  MOBILE: path.join(TMP_DIR, 'fab-mobile.png'),
};
const REPORT_PATH = path.join(TMP_DIR, 'fab-test-report.json');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const report = { startedAt: new Date().toISOString(), scenarios: [] };
  const log = (msg) => {
    console.log(msg);
    report.scenarios.push({ t: new Date().toISOString(), msg });
  };

  try {
    // ============ 桌面端测试 ============
    log('[桌面端] 打开 /projects/ai-digital-shop-group (1280x900)');
    const ctxDesktop = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctxDesktop.newPage();
    await page.goto(PROJECT_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: SCREEN.DESKTOP, fullPage: false });

    // 找到悬浮球（外层 div fixed bottom-6/24 + 内部 button）
    const fabDiv = page.locator('div.fixed.bottom-6, div.fixed.bottom-24').first();
    const fabCount = await fabDiv.count();
    const fabVisible = fabCount > 0 ? await fabDiv.isVisible() : false;
    const fabBox = fabCount > 0 ? await fabDiv.boundingBox() : null;
    log(`  悬浮球div: count=${fabCount}, visible=${fabVisible}, box=${JSON.stringify(fabBox)}`);

    // 验证位置在右下角
    let positionOk = false;
    if (fabBox) {
      const inBottom = fabBox.y > 700;
      const inRight = fabBox.x > 1100;
      positionOk = inBottom && inRight;
      log(`  位置: x=${fabBox.x}, y=${fabBox.y}, inRight=${inRight}, inBottom=${inBottom}`);
    }

    await ctxDesktop.close();

    // ============ 移动端测试 ============
    log('[移动端] 打开 /projects/ai-digital-shop-group (375x812)');
    const ctxMobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true });
    const page2 = await ctxMobile.newPage();
    await page2.goto(PROJECT_URL, { waitUntil: 'networkidle' });
    await page2.waitForTimeout(2500);
    await page2.screenshot({ path: SCREEN.MOBILE, fullPage: false });

    const fabBtn2 = page2.locator('div.fixed.bottom-6, div.fixed.bottom-24').first();
    const fab2Count = await fabBtn2.count();
    const fab2Visible = fab2Count > 0 ? await fabBtn2.isVisible() : false;
    const fab2Box = fab2Count > 0 ? await fabBtn2.boundingBox() : null;
    log(`  移动端悬浮球div: count=${fab2Count}, visible=${fab2Visible}, box=${JSON.stringify(fab2Box)}`);

    let mobilePositionOk = false;
    if (fab2Box) {
      // 移动端 bottom-24 (96px)，应在 y=716 附近
      const inBottom = fab2Box.y > 600 && fab2Box.y < 800;
      const inRight = fab2Box.x > 200;
      mobilePositionOk = inBottom && inRight;
      log(`  移动端位置: x=${fab2Box.x}, y=${fab2Box.y}, inRight=${inRight}, inBottom=${inBottom}`);
    }

    await ctxMobile.close();

    // ============ 结果汇总 ============
    const desktopPass = fabVisible && positionOk;
    const mobilePass = fab2Visible && mobilePositionOk;

    report.finalResult = {
      desktopVisible: desktopPass ? '✅ PASS' : '❌ FAIL',
      mobileVisible: mobilePass ? '✅ PASS' : '❌ FAIL',
      allPass: desktopPass && mobilePass,
    };
    log('\n========== 测试结果 ==========');
    log(`  桌面端悬浮球可见 + 位置正确: ${report.finalResult.desktopVisible}`);
    log(`  移动端悬浮球可见 + 位置正确: ${report.finalResult.mobileVisible}`);
    log(`  整体: ${report.finalResult.allPass ? '✅ ALL PASS' : '❌ FAILED'}`);
  } catch (err) {
    log(`❌ 测试异常：${err.message}`);
    report.finalResult = { error: err.message };
  } finally {
    report.endedAt = new Date().toISOString();
    require('fs').writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    console.log(`\n报告: ${REPORT_PATH}`);
    await browser.close();
    process.exit(report.finalResult?.allPass ? 0 : 1);
  }
})();
