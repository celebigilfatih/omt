@echo off
echo Stopping OMT Tournament Management System
echo =========================================
echo.

echo Stopping Docker containers...
docker compose -f docker-compose.dev.yml down

echo.
echo All services stopped successfully!
pause
