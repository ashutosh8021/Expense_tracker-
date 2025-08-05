@echo off
cls
echo ========================================
echo   EXPENSE TRACKER SETUP WIZARD
echo ========================================
echo.

echo This wizard will help you set up the Expense Tracker application.
echo.
echo You have two options:
echo 1^) DOCKER SETUP ^(Recommended^) - Automatic MySQL + App setup
echo 2^) MANUAL SETUP - Install MySQL yourself + App setup
echo.
set /p setup_choice="Choose setup method (1 or 2): "

if "%setup_choice%"=="1" goto docker_setup
if "%setup_choice%"=="2" goto manual_setup
echo Invalid choice. Exiting...
pause
exit /b 1

:docker_setup
echo.
echo ========================================
echo   DOCKER SETUP (Recommended)
echo ========================================
echo.
echo Checking Docker installation...

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed!
    echo.
    echo Please install Docker Desktop:
    echo 1. Go to: https://www.docker.com/products/docker-desktop/
    echo 2. Download Docker Desktop for Windows
    echo 3. Install and restart your computer
    echo 4. Run this setup again
    echo.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not available!
    echo Please ensure Docker Desktop is properly installed.
    pause
    exit /b 1
)

echo ✅ Docker is installed!
echo.
echo 🐳 Setting up containers...
echo This will:
echo - Create a MySQL database container
echo - Create the application container
echo - Set up networking between them
echo - Initialize the database with tables
echo.

REM Create Docker environment file
echo 📝 Creating Docker environment configuration...
(
echo # Docker Environment Configuration
echo DB_HOST=database
echo DB_USER=expense_user
echo DB_PASSWORD=expense_password
echo DB_NAME=expense_tracker
echo DB_PORT=3306
echo PORT=3000
echo.
echo # MySQL Root Password for Container
echo MYSQL_ROOT_PASSWORD=root_password
echo MYSQL_USER=expense_user
echo MYSQL_PASSWORD=expense_password
echo MYSQL_DATABASE=expense_tracker
) > .env

echo 🏗️  Building and starting containers...
docker-compose up --build -d

if %errorlevel% neq 0 (
    echo ❌ Failed to start containers!
    echo Please check Docker Desktop is running and try again.
    pause
    exit /b 1
)

echo ⏳ Waiting for database to initialize...
timeout /t 15 /nobreak > nul

echo 🗄️  Initializing database tables...
docker-compose exec app npm run init-db

echo.
echo ✅ DOCKER SETUP COMPLETE! ✅
echo.
echo 🌐 Your Expense Tracker is running at: http://localhost:3000
echo.
echo 📋 Useful commands:
echo   npm run docker:logs    - View application logs  
echo   npm run docker:down    - Stop the application
echo   npm run docker:restart - Restart containers
echo.
goto end

:manual_setup
echo.
echo ========================================
echo   MANUAL SETUP
echo ========================================
echo.
echo This setup requires you to install MySQL manually.
echo.

REM Check Node.js
echo 🔍 Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo.
    echo Please install Node.js:
    echo 1. Go to: https://nodejs.org/
    echo 2. Download the LTS version
    echo 3. Install and restart your computer
    echo 4. Run this setup again
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js is installed: %NODE_VERSION%

REM Check MySQL
echo 🔍 Checking MySQL...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  MySQL is not installed or not in PATH!
    echo.
    echo You need to install MySQL. Choose one option:
    echo.
    echo OPTION A - MySQL Community Server:
    echo 1. Go to: https://dev.mysql.com/downloads/mysql/
    echo 2. Download MySQL Community Server
    echo 3. Run installer, choose "Developer Default"
    echo 4. Set a root password ^(remember it!^)
    echo 5. Complete installation
    echo.
    echo OPTION B - XAMPP ^(Easier^):
    echo 1. Go to: https://www.apachefriends.org/
    echo 2. Download XAMPP
    echo 3. Install XAMPP
    echo 4. Start XAMPP Control Panel
    echo 5. Start "MySQL" service
    echo.
    echo OPTION C - Use Docker for MySQL only:
    echo docker run --name mysql-expense -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 -d mysql:8.0
    echo.
    set /p mysql_choice="Have you installed MySQL? (y/n): "
    if /i "%mysql_choice%" neq "y" (
        echo Please install MySQL first, then run this setup again.
        pause
        exit /b 1
    )
)

echo ✅ MySQL appears to be available
echo.

REM Create local environment file
echo 📝 Creating environment configuration...
if not exist .env (
    (
    echo # Local Development Environment
    echo DB_HOST=localhost
    echo DB_USER=root
    echo DB_PASSWORD=
    echo DB_NAME=expense_tracker  
    echo DB_PORT=3306
    echo PORT=3000
    ) > .env
    
    echo ⚠️  IMPORTANT: Edit the .env file with your MySQL credentials!
    echo.
    echo Open .env file and set:
    echo - DB_USER: your MySQL username ^(usually 'root'^)
    echo - DB_PASSWORD: your MySQL password
    echo.
    set /p continue="Press Enter when you've updated the .env file..."
)

REM Install dependencies
echo 📦 Installing Node.js dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies!
    pause
    exit /b 1
)

echo ✅ Dependencies installed!

REM Test database connection and initialize
echo 🗄️  Testing database connection and initializing...
npm run init-db

if %errorlevel% neq 0 (
    echo ❌ Database initialization failed!
    echo.
    echo This usually means:
    echo 1. MySQL is not running
    echo 2. Wrong credentials in .env file
    echo 3. Database permissions issue
    echo.
    echo To fix:
    echo 1. Make sure MySQL service is running
    echo 2. Check your .env file credentials
    echo 3. Try connecting manually: mysql -u root -p
    echo.
    pause
    exit /b 1
)

echo ✅ Database initialized successfully!
echo.
echo ✅ MANUAL SETUP COMPLETE! ✅
echo.
echo 🚀 Start the application with:
echo   npm start        ^(production mode^)
echo   npm run dev      ^(development mode with auto-reload^)
echo.
echo 🌐 Then open: http://localhost:3000
echo.

:end
echo 📚 For detailed documentation, see: SETUP_GUIDE.md
echo.
pause
