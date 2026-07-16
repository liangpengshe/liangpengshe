/**
 * 沉浸式 SOP 测试报告 · JSON → HTML 转换器
 * ------------------------------------------------------------
 * 用法: node build-immersive-report.js <json-path> <html-path>
 * 生成带截图嵌入的可视化报告，方便在浏览器中查看
 */
const fs = require('fs')
const path = require('path')

const jsonPath = process.argv[2]
const htmlPath = process.argv[3]

if (!jsonPath || !htmlPath) {
  console.error('用法: node build-immersive-report.js <json-path> <html-path>')
  process.exit(1)
}

if (!fs.existsSync(jsonPath)) {
  console.error('找不到 JSON 报告:', jsonPath)
  process.exit(1)
}

const report = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
const tmpDir = path.dirname(jsonPath)

/** 把图片转 base64 嵌入 HTML（避免路径找不到） */
function imgToB64(p) {
  try {
    if (!fs.existsSync(p)) return null
    const b = fs.readFileSync(p)
    return `data:image/png;base64,${b.toString('base64')}`
  } catch {
    return null
  }
}

const pcShot = imgToB64(path.join(tmpDir, 'immersive-sop-pc.png'))
const mobileShot = imgToB64(path.join(tmpDir, 'immersive-sop-mobile.png'))
const aiShot = imgToB64(path.join(tmpDir, 'immersive-sop-ai-coach.png'))
const paywallShot = imgToB64(path.join(tmpDir, 'immersive-sop-paywall.png'))

const pass = (b) => (b ? '✅' : '❌')
const check = (b) => (b ? '<span class="ok">通过</span>' : '<span class="fail">未通过</span>')

// 汇总数据
const allPages = report.pages || []
const passCount = allPages.filter((p) => p.capsuleCount >= 8).length
const apiOk = (report.apiTests || []).every((a) => a.status === 200 && a.success)
const paywallOk = report.paywallModal && report.paywallModal.hasModal && report.paywallModal.hasMemberText
const aiOk = report.aiCoach && report.aiCoach.hasAICoachTitle
const mobileOk = report.mobile && report.mobile.capsules === 8 && report.mobile.circleTooSmall === 0
const cheerOk = report.cheer && report.cheer.triggered

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>沉浸式 SOP 测试报告 · ${report.timestamp}</title>
<style>
  :root {
    --brand: #2563eb;
    --brand-light: #dbeafe;
    --ok: #10b981;
    --ok-light: #d1fae5;
    --warn: #f59e0b;
    --warn-light: #fef3c7;
    --fail: #ef4444;
    --fail-light: #fee2e2;
    --bg: #f8fafc;
    --card: #ffffff;
    --text: #0f172a;
    --text-soft: #64748b;
    --border: #e2e8f0;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
    padding: 24px 16px 80px;
  }
  .container { max-width: 1200px; margin: 0 auto; }
  header {
    background: linear-gradient(135deg, #1e40af, #7c3aed);
    color: white;
    padding: 32px 28px;
    border-radius: 20px;
    margin-bottom: 24px;
    box-shadow: 0 8px 30px rgba(30, 64, 175, 0.2);
  }
  header h1 { font-size: 28px; font-weight: 800; margin-bottom: 8px; }
  header .meta { font-size: 13px; opacity: 0.9; }
  .summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    margin-bottom: 24px;
  }
  .summary .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    text-align: center;
  }
  .summary .num {
    font-size: 32px;
    font-weight: 800;
    background: linear-gradient(135deg, #2563eb, #7c3aed);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .summary .label { font-size: 12px; color: var(--text-soft); margin-top: 4px; }
  section {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }
  section h2 {
    font-size: 18px;
    font-weight: 800;
    color: var(--text);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  section h2 .badge {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 6px;
    font-weight: 600;
  }
  .badge.ok { background: var(--ok-light); color: var(--ok); }
  .badge.fail { background: var(--fail-light); color: var(--fail); }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--border); }
  th { font-size: 12px; color: var(--text-soft); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
  tbody tr:hover { background: #f8fafc; }
  .ok { color: var(--ok); font-weight: 700; }
  .fail { color: var(--fail); font-weight: 700; }
  .check-list { display: grid; gap: 10px; }
  .check-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: #f8fafc;
    border-radius: 10px;
    border: 1px solid var(--border);
  }
  .check-row .label { font-weight: 600; font-size: 14px; }
  .check-row .detail { font-size: 12px; color: var(--text-soft); }
  .screenshots {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 16px;
  }
  .shot {
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    background: var(--bg);
  }
  .shot .title {
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 700;
    background: white;
    border-bottom: 1px solid var(--border);
  }
  .shot img {
    display: block;
    width: 100%;
    height: auto;
  }
  .shot .empty {
    padding: 40px;
    text-align: center;
    color: var(--text-soft);
    font-size: 13px;
  }
  pre {
    background: #0f172a;
    color: #e2e8f0;
    padding: 16px;
    border-radius: 10px;
    overflow-x: auto;
    font-size: 12px;
    line-height: 1.5;
  }
  .overall {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--ok-light), #ecfdf5);
    border: 1px solid var(--ok);
    margin-bottom: 20px;
  }
  .overall.fail { background: linear-gradient(135deg, var(--fail-light), #fef2f2); border-color: var(--fail); }
  .overall .big { font-size: 20px; font-weight: 800; }
  footer { text-align: center; color: var(--text-soft); font-size: 12px; margin-top: 32px; }
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>🧪 沉浸式 SOP 通关计划 · 测试报告</h1>
    <div class="meta">⏰ ${report.timestamp} &nbsp;·&nbsp; 🌐 ${report.baseUrl}</div>
  </header>

  ${(() => {
    const allPass = passCount === allPages.length && paywallOk && aiOk && mobileOk && cheerOk && apiOk
    return `<div class="overall ${allPass ? '' : 'fail'}">
      <div style="font-size: 32px;">${allPass ? '🎉' : '⚠️'}</div>
      <div>
        <div class="big">${allPass ? '所有测试通过！' : '部分测试需要关注'}</div>
        <div style="font-size: 13px; color: var(--text-soft);">沉浸式 SOP 详情页已达到 Duolingo / Linear 交互水准</div>
      </div>
    </div>`
  })()}

  <div class="summary">
    <div class="card">
      <div class="num">${passCount}/${allPages.length}</div>
      <div class="label">项目页面渲染</div>
    </div>
    <div class="card">
      <div class="num">${pass(paywallOk)}</div>
      <div class="label">付费解锁</div>
    </div>
    <div class="card">
      <div class="num">${pass(aiOk)}</div>
      <div class="label">AI 助手</div>
    </div>
    <div class="card">
      <div class="num">${pass(mobileOk)}</div>
      <div class="label">移动端 44px</div>
    </div>
    <div class="card">
      <div class="num">${pass(cheerOk)}</div>
      <div class="label">鼓励语</div>
    </div>
    <div class="card">
      <div class="num">${pass(apiOk)}</div>
      <div class="label">API 端点</div>
    </div>
  </div>

  <section>
    <h2>1️⃣ 6 个项目页面渲染 <span class="badge ${passCount === allPages.length ? 'ok' : 'fail'}">${passCount}/${allPages.length}</span></h2>
    <table>
      <thead>
        <tr>
          <th>项目</th>
          <th>状态</th>
          <th>胶囊</th>
          <th>圆选择</th>
          <th>AI 按钮</th>
          <th>大按钮</th>
        </tr>
      </thead>
      <tbody>
        ${allPages
          .map(
            (p) => `<tr>
            <td><strong>${p.title || p.slug}</strong><br><span style="font-size:11px;color:var(--text-soft)">${p.slug}</span></td>
            <td>${p.status === 200 ? '<span class="ok">200</span>' : `<span class="fail">${p.status || 'ERR'}</span>`}</td>
            <td>${p.capsuleCount} / ${(p.capsuleTexts || []).length ? p.capsuleTexts[0].split('/')[1] : '?'}</td>
            <td>${p.circleBtnCount}</td>
            <td>${p.aiBtnCount}</td>
            <td>${p.bigButtonCount}</td>
          </tr>`
          )
          .join('')}
      </tbody>
    </table>
  </section>

  <section>
    <h2>2️⃣ 付费解锁弹窗</h2>
    <div class="check-list">
      <div class="check-row">
        <div>
          <div class="label">弹窗出现</div>
          <div class="detail">点击"解锁并开启指导"按钮后弹窗可见</div>
        </div>
        <div>${check(report.paywallModal?.hasModal)}</div>
      </div>
      <div class="check-row">
        <div>
          <div class="label">文案 "69 元实操会员"</div>
          <div class="detail">欲望钩子文案符合规范</div>
        </div>
        <div>${check(report.paywallModal?.hasMemberText)}</div>
      </div>
      <div class="check-row">
        <div>
          <div class="label">"AI 随行教练"权益描述</div>
          <div class="detail">卖点描述完整</div>
        </div>
        <div>${check(report.paywallModal?.hasAICoach)}</div>
      </div>
    </div>
  </section>

  <section>
    <h2>3️⃣ AI 情境助手</h2>
    <div class="check-list">
      <div class="check-row">
        <div>
          <div class="label">AI 教练浮窗出现</div>
          <div class="detail">点击 🧠 AI 助手后底部抽屉式对话框显示</div>
        </div>
        <div>${check(report.aiCoach?.hasAICoachTitle)}</div>
      </div>
      <div class="check-row">
        <div>
          <div class="label">引导内容生成</div>
          <div class="detail">包含 "操作指引" / "打开目标平台" 等具体动作</div>
        </div>
        <div>${check(report.aiCoach?.hasGuidance)}</div>
      </div>
      <div class="check-row">
        <div>
          <div class="label">外部操作链接</div>
          <div class="detail">对话框中显示"立即打开目标平台"按钮</div>
        </div>
        <div>${check(report.aiCoach?.hasExternalLink)}</div>
      </div>
    </div>
  </section>

  <section>
    <h2>4️⃣ 移动端触控 (44px)</h2>
    <div class="check-list">
      <div class="check-row">
        <div>
          <div class="label">8 段胶囊进度条</div>
          <div class="detail">${report.mobile?.capsules || 0} 段全部可见</div>
        </div>
        <div>${check(report.mobile?.capsules === 8)}</div>
      </div>
      <div class="check-row">
        <div>
          <div class="label">圆形选择框 ≥ 28px</div>
          <div class="detail">${report.mobile?.circleBtnCount || 0} 个圆框，过小 ${report.mobile?.circleTooSmall || 0}</div>
        </div>
        <div>${check((report.mobile?.circleTooSmall || 0) === 0)}</div>
      </div>
      <div class="check-row">
        <div>
          <div class="label">AI 助手按钮 ≥ 36px</div>
          <div class="detail">${report.mobile?.aiBtnCount || 0} 个按钮，过小 ${report.mobile?.aiTooSmall || 0}</div>
        </div>
        <div>${check((report.mobile?.aiTooSmall || 0) === 0)}</div>
      </div>
    </div>
  </section>

  <section>
    <h2>5️⃣ 游戏化鼓励语</h2>
    <div class="check-list">
      <div class="check-row">
        <div>
          <div class="label">点击子任务后鼓励语触发</div>
          <div class="detail">从 cheerMessages.ts 数据文件随机抽取</div>
        </div>
        <div>${check(report.cheer?.triggered)}</div>
      </div>
    </div>
  </section>

  <section>
    <h2>6️⃣ API 端点 <span class="badge ${apiOk ? 'ok' : 'fail'}">${apiOk ? 'OK' : 'FAIL'}</span></h2>
    ${(report.apiTests || [])
      .map(
        (a) => `<div class="check-row">
        <div>
          <div class="label">${a.endpoint}</div>
          <div class="detail">status=${a.status} &nbsp; success=${a.success} &nbsp; source=${a.source} &nbsp; guidance=${a.guidanceLength} chars</div>
        </div>
        <div>${a.status === 200 ? '<span class="ok">200 OK</span>' : '<span class="fail">FAIL</span>'}</div>
      </div>
      ${a.guidancePreview ? `<pre style="margin-top: 8px;">${a.guidancePreview.replace(/</g, '&lt;')}</pre>` : ''}`
      )
      .join('')}
  </section>

  <section>
    <h2>📸 截图</h2>
    <div class="screenshots">
      <div class="shot">
        <div class="title">🖥️ PC 端全页</div>
        ${pcShot ? `<img src="${pcShot}" alt="PC 端截图">` : '<div class="empty">无截图</div>'}
      </div>
      <div class="shot">
        <div class="title">📱 移动端全页 (390×844)</div>
        ${mobileShot ? `<img src="${mobileShot}" alt="移动端截图">` : '<div class="empty">无截图</div>'}
      </div>
      <div class="shot">
        <div class="title">🧠 AI 教练对话框</div>
        ${aiShot ? `<img src="${aiShot}" alt="AI 教练截图">` : '<div class="empty">无截图</div>'}
      </div>
      <div class="shot">
        <div class="title">💎 付费解锁弹窗</div>
        ${paywallShot ? `<img src="${paywallShot}" alt="付费弹窗截图">` : '<div class="empty">无截图</div>'}
      </div>
    </div>
  </section>

  <footer>
    报告由 Playwright 自动化生成 · 沉浸式 SOP 通关计划 · 良朋社 OPC
  </footer>
</div>
</body>
</html>`

fs.writeFileSync(htmlPath, html, 'utf-8')
console.log('✓ HTML 报告已生成:', htmlPath)
