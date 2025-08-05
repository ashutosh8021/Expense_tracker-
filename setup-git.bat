@echo off
echo.
echo ========================================
echo   GitHub Repository Setup for 
echo   Expense Tracker Application
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed or not in PATH
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo Git is installed. Proceeding with repository setup...
echo.

REM Get user's GitHub username
set /p GITHUB_USERNAME="Enter your GitHub username: "
if "%GITHUB_USERNAME%"=="" (
    echo ERROR: GitHub username is required
    pause
    exit /b 1
)

echo.
echo Setting up local Git repository...

REM Initialize git repository
git init
if errorlevel 1 (
    echo ERROR: Failed to initialize git repository
    pause
    exit /b 1
)

REM Configure git user (optional, but recommended)
echo.
set /p GIT_NAME="Enter your name for git commits (optional): "
set /p GIT_EMAIL="Enter your email for git commits (optional): "

if not "%GIT_NAME%"=="" (
    git config user.name "%GIT_NAME%"
)
if not "%GIT_EMAIL%"=="" (
    git config user.email "%GIT_EMAIL%"
)

REM Add all files
echo.
echo Adding all files to git...
git add .
if errorlevel 1 (
    echo ERROR: Failed to add files to git
    pause
    exit /b 1
)

REM Create initial commit
echo.
echo Creating initial commit...
git commit -m "Initial commit: Complete expense tracker application

- Full-stack web application with Node.js/Express.js backend
- MySQL database with expense and category tables  
- Responsive frontend with modern UI/UX design
- Indian Rupee currency formatting and localization
- Real-time analytics and category-wise summaries
- Complete CRUD operations for expense management
- Date filtering and search functionality
- Comprehensive documentation and setup guides"

if errorlevel 1 (
    echo ERROR: Failed to create initial commit
    pause
    exit /b 1
)

REM Set up remote repository
echo.
echo Setting up remote repository...
set REPO_URL=https://github.com/%GITHUB_USERNAME%/expense-tracker.git
git remote add origin %REPO_URL%
if errorlevel 1 (
    echo ERROR: Failed to add remote repository
    pause
    exit /b 1
)

REM Rename branch to main
git branch -M main

echo.
echo ========================================
echo   Repository Setup Complete!
echo ========================================
echo.
echo Your repository is ready to push to GitHub.
echo.
echo Next steps:
echo 1. Create a repository on GitHub.com:
echo    - Repository name: expense-tracker
echo    - Make it PUBLIC
echo    - Don't initialize with README (we have our own)
echo.
echo 2. Push your code:
echo    git push -u origin main
echo.
echo 3. Your repository URL will be:
echo    %REPO_URL%
echo.
echo 4. See GITHUB_SETUP.md for detailed instructions
echo.

pause
