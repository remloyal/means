@echo off
taskkill /f /im "Frigga Data Center.exe"
timeout /T 1 /NOBREAK

set backup_file=%1
set update_file=%2
set target_file=%3
set app_path=%4

echo  %backup_file%
echo  %update_file%
echo  %target_file%
echo  %app_path%

del /f /q /a %target_file%

ren %update_file%  app.asar

start /b "Frigga Data Center.exe"  %app_path%

exit