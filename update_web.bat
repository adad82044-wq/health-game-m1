@echo off
chcp 65001 >nul
echo ========================================================
echo   กำลังอัปเดตไฟล์เกมและรูปภาพขึ้นเว็บ GitHub Pages...
echo ========================================================
set "PATH=%PATH%;%LOCALAPPDATA%\Programs\Git\cmd;C:\Program Files\GitHub CLI"
git add .
git commit -m "Update game content and assets"
git push origin main
echo.
echo ========================================================
echo   อัปเดตสำเร็จ! รอประมาณ 30-60 วินาที แล้วรีเฟรชลิงก์เกมได้เลย
echo   URL: https://adad82044-wq.github.io/health-game-m1/
echo ========================================================
pause
