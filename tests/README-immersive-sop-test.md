# 沉浸式 SOP 详情页 · 一键测试

## 快速开始

### 方式 1：双击运行（推荐新手）
直接双击 [run-immersive-sop-test.bat](./run-immersive-sop-test.bat)

### 方式 2：npm 脚本
```bash
npm run test:sop
```

### 方式 3：PowerShell 直接调用
```powershell
.\tests\run-immersive-sop-test.ps1
```

## 自动化流程

1. **检测 dev server** - 自动检查 `localhost:3001` 是否已启动
2. **启动 dev server** - 如未运行，自动调用 `npm run dev` 并等待就绪
3. **安装依赖** - 检查 Playwright + Chromium 是否就绪
4. **运行测试** - 执行 `test-immersive-sop.js`，覆盖 6 大验证场景
5. **生成报告** - 调用 `build-immersive-report.js`，把 JSON 转成带截图的可视化 HTML
6. **自动打开** - 在默认浏览器中打开 HTML 报告

## 测试覆盖（6 大场景）

| # | 场景 | 验证点 |
|---|------|--------|
| 1 | 6 项目页面渲染 | 8 段胶囊进度条 / 圆形选择框 / AI 按钮 / 44px 大按钮 |
| 2 | 付费解锁弹窗 | 弹窗 + 69 元文案 + AI 随行教练权益 |
| 3 | AI 情境助手 | AI 教练浮窗 + 引导内容 + 外部链接 |
| 4 | 移动端 44px 触控 | 移动端 8 段胶囊 + 圆框尺寸 + AI 按钮尺寸 |
| 5 | 游戏化鼓励语 | 子任务点击后 cheer 触发 |
| 6 | API 端点 | `/api/ai/practice-script` 200 OK + guidance 生成 |

## 输出物

测试结束后会在 **系统 Temp 目录** 生成：

```
%TEMP%\immersive-sop-report.html    # 可视化报告（自动打开）
%TEMP%\immersive-sop-report.json    # 原始数据
%TEMP%\immersive-sop-pc.png         # PC 端截图
%TEMP%\immersive-sop-mobile.png     # 移动端截图
%TEMP%\immersive-sop-ai-coach.png   # AI 教练弹窗截图
%TEMP%\immersive-sop-paywall.png    # 付费弹窗截图
```

Windows 系统中 Temp 目录通常为：`C:\Users\<用户名>\AppData\Local\Temp\`

## 文件清单

| 文件 | 用途 |
|------|------|
| `run-immersive-sop-test.ps1` | PowerShell 启动脚本（核心） |
| `run-immersive-sop-test.bat` | 批处理入口（双击运行） |
| `build-immersive-report.js` | JSON → HTML 报告生成器 |
| `../browser-test/test-immersive-sop.js` | Playwright 测试脚本 |

## 常见问题

### Q: PowerShell 提示"无法加载脚本，因为在此系统上禁止运行脚本"
```powershell
# 临时绕过（推荐）
powershell -NoProfile -ExecutionPolicy Bypass -File "tests\run-immersive-sop-test.ps1"

# 或修改当前用户策略
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Q: Playwright 浏览器下载失败
脚本会自动调用 `npx playwright install chromium`。如失败可手动：
```bash
cd tests\browser-test
npx playwright install chromium
```

### Q: 端口 3001 被占用
修改 `run-immersive-sop-test.ps1` 中的 `$Port = 3001` 为其他端口，并同步修改 `test-immersive-sop.js` 中的 `BASE_URL`。
