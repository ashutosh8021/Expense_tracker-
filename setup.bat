@echo off
echo 🚀 Setting up Expense Tracker...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% == 0 (
    docker-compose --version >nul 2>&1
    if %errorlevel% == 0 (
        echo ✅ Docker and Docker Compose found
        
        echo Choose setup method:
        echo 1^) Docker ^(Recommended - Isolated environment^)
        echo 2^) Local development
        set /p choice="Enter your choice (1 or 2): "
        
        if "%choice%"=="1" (
            echo 🐳 Setting up with Docker...
            
            REM Create .env file for Docker
            if not exist .env (
                echo 📝 Creating environment file...
                (
                echo DB_HOST=database
                echo DB_USER=expense_user
                echo DB_PASSWORD=expense_password
                echo DB_NAME=expense_tracker
                echo DB_PORT=3306
                echo PORT=3000
                ) > .env
            )
            
            echo 🏗️  Building and starting containers...
            docker-compose up --build -d
            
            echo ⏳ Waiting for services to be ready...
            timeout /t 10 /nobreak > nul
            
            echo ✅ Setup complete!
            echo 🌐 Application is running at: http://localhost:3000
            echo.
            echo Useful commands:
            echo   npm run docker:logs    - View application logs
            echo   npm run docker:down    - Stop the application
            echo   npm run docker:dev     - Run in development mode
        ) else if "%choice%"=="2" (
            echo 💻 Setting up for local development...
            
            REM Check if Node.js is installed
            node --version >nul 2>&1
            if %errorlevel% neq 0 (
                echo ❌ Node.js is not installed. Please install Node.js v14 or higher.
                pause
                exit /b 1
            )
            
            REM Check if MySQL is installed
            mysql --version >nul 2>&1
            if %errorlevel% neq 0 (
                echo ⚠️  MySQL not found. Please install MySQL Server.
                echo    You can also use Docker for the database only:
                echo    docker run --name mysql-expense -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 -d mysql:8.0
            )
            
            REM Create .env file for local development
            if not exist .env (
                echo 📝 Creating environment file...
                copy .env.example .env >nul
                echo ⚠️  Please edit .env file with your MySQL credentials
            )
            
            echo 📦 Installing dependencies...
            npm install
            
            echo 🗄️  Initializing database...
            npm run init-db
            
            echo ✅ Setup complete!
            echo 🚀 Start the application with: npm start
            echo 🔧 For development with auto-reload: npm run dev
        ) else (
            echo ❌ Invalid choice
            pause
            exit /b 1
        )
    ) else (
        echo 🐳 Docker Compose not found. Installing Docker Desktop is recommended.
        goto local_setup
    )
) else (
    echo 🐳 Docker not found. Setting up for local development...
    :local_setup
    
    REM Check if Node.js is installed
    node --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Node.js is not installed. Please install Node.js v14 or higher.
        pause
        exit /b 1
    )
    
    REM Create .env file
    if not exist .env (
        echo 📝 Creating environment file...
        copy .env.example .env >nul
        echo ⚠️  Please edit .env file with your MySQL credentials
    )
    
    echo 📦 Installing dependencies...
    npm install
    
    echo ✅ Setup complete!
    echo 🗄️  Don't forget to run: npm run init-db ^(after setting up MySQL^)
    echo 🚀 Start the application with: npm start
)

pause
