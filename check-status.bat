@echo off
echo OMT Tournament System - Status Check
echo =====================================
echo.

echo Checking Docker containers...
docker ps --filter "name=omt-postgres-dev" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo.

echo Checking database connection...
node "C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js" prisma db execute --stdin < NUL 2>NUL
if errorlevel 1 (
    echo [WARNING] Database connection issue
) else (
    echo [OK] Database is accessible
)
echo.

echo Checking Next.js process...
netstat -ano | findstr ":3001" >NUL
if errorlevel 1 (
    echo [INFO] Next.js is not running on port 3001
) else (
    echo [OK] Next.js is running on port 3001
)
echo.

echo Application URLs:
echo - Development Server: http://localhost:3001
echo - Admin Login: http://localhost:3001/admin/login
echo - Application Form: http://localhost:3001/basvuru
echo - Teams Page: http://localhost:3001/teams
echo - Health Check: http://localhost:3001/api/health
echo.

echo Default Credentials:
echo - Email: admin
echo - Password: admin123
echo.

pause
