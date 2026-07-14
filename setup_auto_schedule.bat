@echo off
:: ============================================================
:: auto_export.bat
:: Chạy file này MỘT LẦN để cài đặt lịch tự động cập nhật
:: dữ liệu MISA vào 7:00 sáng mỗi ngày.
::
:: Trước khi chạy: Cập nhật đường dẫn PROJECT_DIR bên dưới
:: ============================================================

:: ---- THAY ĐỔI ĐƯỜNG DẪN NÀY cho đúng máy của bạn ----
set PROJECT_DIR=C:\Users\TenBan\Documents\Mira dashboard
:: -------------------------------------------------------

set PYTHON_EXE=%PROJECT_DIR%\venv\Scripts\python.exe
set SCRIPT=%PROJECT_DIR%\run_all.py
set TASK_NAME=MISA_Daily_Export

echo [*] Kiem tra Python...
if not exist "%PYTHON_EXE%" (
    echo [ERROR] Khong tim thay Python tai: %PYTHON_EXE%
    echo Hay chay script nay tren may tinh co cai dat du an.
    pause
    exit /b 1
)

echo [*] Dang dang ky Task Scheduler...
schtasks /create /tn "%TASK_NAME%" /tr "\"%PYTHON_EXE%\" \"%SCRIPT%\"" /sc DAILY /st 07:00 /ru "%USERNAME%" /f

if %errorlevel% == 0 (
    echo.
    echo [OK] Da cai dat thanh cong!
    echo      Task: %TASK_NAME%
    echo      Chay luc: 07:00 sang moi ngay
    echo      Script: %SCRIPT%
    echo.
    echo Ban co the kiem tra trong: Task Scheduler ^> MISA_Daily_Export
) else (
    echo [ERROR] Cai dat that bai. Hay chay file nay voi quyen Administrator.
)

pause
