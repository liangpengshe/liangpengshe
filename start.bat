@echo off
chcp 65001 >nul
title 良朋社 OPC · 启动开发服务

echo ════════════════════════════════════════════════
echo   良朋社 OPC · 启动开发服务
echo   时间: %date% %time%
echo ════════════════════════════════════════════════

cd /d "%~dp0"

:: 检查 node_modules
if not exist "node_modules" (
    echo [1/3] 首次运行，正在安装依赖...
    call npm install
    if errorlevel 1 (
        echo ✗ 依赖安装失败
        pause
        exit /b 1
    )
)

:: 检查 .env
if not exist ".env" (
    echo ⚠ 未发现 .env 文件，如需 Supabase / 微信支付等请补全
)

:: 清理 3001 端口
echo [2/3] 清理 3001 端口...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 >nul

:: 启动 dev
echo [3/3] 启动 Next.js 开发服务...
echo.
echo   ➜  Local:   http://localhost:3001
echo   ➜  Pages:   / , /member , /partner , /tools , /projects , /services
echo.
echo   按 Ctrl+C 停止服务
echo ════════════════════════════════════════════════

call npx next dev -p 3001
pause
