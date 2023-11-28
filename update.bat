@echo off
taskkill /f /im 鼎为数据中心.exe
timeout /T 1 /NOBREAK

set backup_file=%1\resources\app_old.asar
set update_file=%1\resources\update.asar
set target_file=%1\resources\app.asar
set app_path=%1\鼎为数据中心.exe

echo  %backup_file%
echo  %update_file%
echo  %target_file%
echo  %app_path%

del /f /q /a %target_file%

ren %update_file%  app.asar

start /b %app_path%

exit