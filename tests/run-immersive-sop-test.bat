@echo off
chcp 65001 > nul
:: 一键运行沉浸式 SOP 测试 + 自动打开浏览器报告
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-immersive-sop-test.ps1" %*
pause
