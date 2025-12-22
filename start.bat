@echo off
chcp 65001 >nul
echo 🚀 启动 Mini Admin 后台管理系统
echo ================================
echo.

echo 📋 检查端口占用情况...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do taskkill /PID %%a /F >nul 2>&1
timeout /t 1 >nul

echo.
echo 🔧 启动后端服务器 (端口 3000)...
start /B cmd /c "cd server && npm run dev"

timeout /t 3 >nul

echo 🎨 启动前端开发服务器 (端口 5173)...
start /B cmd /c "cd packages\client && npm run dev"

echo.
echo ✅ 系统启动完成！
echo ================================
echo 📡 后端 API: http://localhost:3000
echo 🌐 前端界面: http://localhost:5173
echo.
echo 👤 默认管理员账户:
echo    用户名: admin
echo    密码: admin123
echo.
echo 🛑 按任意键退出...
pause >nul
