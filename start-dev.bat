@echo off
echo Starting OMT Tournament Management System - Development Environment
echo =====================================================================
echo.

echo [1/3] Starting PostgreSQL Database...
docker compose -f docker-compose.dev.yml up -d postgres-dev
if errorlevel 1 (
    echo ERROR: Failed to start database
    pause
    exit /b 1
)

echo.
echo [2/3] Waiting for database to be ready...
timeout /t 5 /nobreak >nul

echo.
echo [3/3] Starting Next.js Development Server...
echo.
echo Application will be available at: http://localhost:3001
echo Default admin login: admin / admin123
echo.
node "C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js" next dev --turbopack
