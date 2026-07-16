// 良朋社 /market/projects?recommend=flow 项目库前两张卡片 HTML 检测
const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');

const BASE_URL = 'http://localhost:3007/market/projects?recommend=flow';
const TMP_DIR = process.platform === 'win32' ? path.join(os.tmpdir()) : '/tmp';
const REPORT_PATH = path.join(TMP_DIR, 'market-projects-flow-report.json');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 1600 } });
  const page = await context.newPage();

  try {
    console.log('='.repeat(80));
    console.log('[步骤 1] 打开 URL:', BASE_URL);
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('[步骤 1] 完成');

    console.log('[步骤 2] 等待 3 秒');
    await page.waitForTimeout(3000);
    console.log('[步骤 2] 完成');

    // 截图存档
    const shotPath = path.join(TMP_DIR, 'market-projects-flow.png');
    await page.screenshot({ path: shotPath, fullPage: true });
    console.log('[截图] 全页截图保存到:', shotPath);

    // 通过 console.log 在浏览器中执行检测脚本，结果回传到 node 端
    const result = await page.evaluate(() => {
      const out = {};

      // 找到"项目库"区域
      // 在 MarketContent.tsx 中，"📁 AI 智富项目库" 这个标题所在的 TabsContent (value="projects")
      // 项目卡片：div.border + flex flex-col + h3 标题
      // 项目卡片是 grid > div，每个卡片都包含 h3
      // 先定位到"AI 智富项目库"那个标题，然后找同 scope 内的 grid

      // 用 querySelectorAll 找所有包含"AI 智富项目库"或"项目库"标题的容器
      // 简单做法：找所有 TabsContent (在 Radix UI 中是 [role="tabpanel"][data-state="active"])
      const activePanel = document.querySelector('[role="tabpanel"][data-state="active"]');
      out.activePanelFound = !!activePanel;
      out.activePanelClass = activePanel ? activePanel.className : null;
      out.activePanelId = activePanel ? activePanel.id : null;

      // 项目卡片的容器：grid grid-cols-1 md:grid-cols-2 gap-4
      // 它是 TabsContent 内的直接子 div
      // 找所有 h3 标题
      const allH3s = Array.from(document.querySelectorAll('h3'));
      out.allH3Count = allH3s.length;
      out.allH3Texts = allH3s.map((h) => h.textContent.trim());

      // 找所有 div (项目卡片的 outer 容器)
      // 卡片特征：包含 h3，且其祖父是 grid grid-cols-1 md:grid-cols-2
      // 直接从 active panel 往下找
      let cards = [];
      if (activePanel) {
        // 项目库 grid 容器
        const grid = activePanel.querySelector('div.grid.grid-cols-1.md\\:grid-cols-2');
        if (grid) {
          out.gridFound = true;
          out.gridClass = grid.className;
          // 直接子 div
          cards = Array.from(grid.children).filter(
            (el) => el.tagName === 'DIV' && el.querySelector('h3')
          );
        } else {
          out.gridFound = false;
          // 退而求其次：找所有 panel 内的包含 h3 的直接卡片
          cards = Array.from(activePanel.querySelectorAll('div.relative.bg-white')).filter((c) =>
            c.querySelector('h3')
          );
        }
      }

      out.totalCards = cards.length;

      // 取前两张卡片
      const first2 = cards.slice(0, 2).map((card, idx) => {
        const cardData = {};
        cardData.index = idx;
        cardData.outerHTML = card.outerHTML;
        cardData.className = card.className;
        // 标题
        const h3 = card.querySelector('h3');
        cardData.title = h3 ? h3.textContent.trim() : null;
        // 用 querySelectorAll 搜索 "优先推荐" 是否在卡片内
        const allInCard = card.querySelectorAll('*');
        const innerText = card.textContent;
        cardData.containsYouxianTuijian_text = innerText.includes('优先推荐');
        // 是否包含 "优先推荐" 元素的 querySelectorAll
        cardData.youxianTuijianMatchCount_inCard = Array.from(allInCard).filter(
          (n) => n.textContent && n.textContent.trim() === '优先推荐'
        ).length;
        cardData.hasRing2 = card.className.includes('ring-2');
        cardData.hasBorderBlue400 = card.className.includes('border-blue-400');
        return cardData;
      });

      out.first2Cards = first2;

      // 全局统计
      out.globalRingBlueCount = document.querySelectorAll('[class*="ring-blue"]').length;
      out.globalDivsWithYouxianTuijian = Array.from(
        document.querySelectorAll('div')
      ).filter((d) => d.textContent.includes('优先推荐')).length;

      return out;
    });

    console.log('\n' + '='.repeat(80));
    console.log('[步骤 3] 浏览器内检测结果');
    console.log('='.repeat(80));
    console.log(JSON.stringify(result, null, 2));

    // 保存到 JSON 文件
    fs.writeFileSync(REPORT_PATH, JSON.stringify(result, null, 2), 'utf8');
    console.log('\n[报告] 完整 JSON 保存到:', REPORT_PATH);

  } catch (err) {
    console.error('[错误]', err.message);
    console.error(err.stack);
  } finally {
    await browser.close();
  }
})();
