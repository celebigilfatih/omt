@echo off
echo OMT Tournament System - Database Reset
echo ========================================
echo.
echo WARNING: This will delete ALL teams and applications!
echo.
pause
echo.

echo Running database reset...
node "C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js" tsx scripts/reset-teams.ts

echo.
echo Verifying reset...
node "C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js" tsx scripts/check-db-status.ts

echo.
pause
