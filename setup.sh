#!/bin/bash

# Expense Tracker Setup Script
echo "🚀 Setting up Expense Tracker..."

# Check if Docker is installed
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "✅ Docker and Docker Compose found"
    
    echo "Choose setup method:"
    echo "1) Docker (Recommended - Isolated environment)"
    echo "2) Local development"
    read -p "Enter your choice (1 or 2): " choice
    
    case $choice in
        1)
            echo "🐳 Setting up with Docker..."
            
            # Create .env file for Docker
            if [ ! -f .env ]; then
                echo "📝 Creating environment file..."
                cat > .env << EOL
DB_HOST=database
DB_USER=expense_user
DB_PASSWORD=expense_password
DB_NAME=expense_tracker
DB_PORT=3306
PORT=3000
EOL
            fi
            
            echo "🏗️  Building and starting containers..."
            docker-compose up --build -d
            
            echo "⏳ Waiting for services to be ready..."
            sleep 10
            
            echo "✅ Setup complete!"
            echo "🌐 Application is running at: http://localhost:3000"
            echo ""
            echo "Useful commands:"
            echo "  npm run docker:logs    - View application logs"
            echo "  npm run docker:down    - Stop the application"
            echo "  npm run docker:dev     - Run in development mode"
            ;;
        2)
            echo "💻 Setting up for local development..."
            
            # Check if Node.js is installed
            if ! command -v node &> /dev/null; then
                echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
                exit 1
            fi
            
            # Check if MySQL is installed
            if ! command -v mysql &> /dev/null; then
                echo "⚠️  MySQL not found. Please install MySQL Server."
                echo "   You can also use Docker for the database only:"
                echo "   docker run --name mysql-expense -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 -d mysql:8.0"
            fi
            
            # Create .env file for local development
            if [ ! -f .env ]; then
                echo "📝 Creating environment file..."
                cp .env.example .env
                echo "⚠️  Please edit .env file with your MySQL credentials"
            fi
            
            echo "📦 Installing dependencies..."
            npm install
            
            echo "🗄️  Initializing database..."
            npm run init-db
            
            echo "✅ Setup complete!"
            echo "🚀 Start the application with: npm start"
            echo "🔧 For development with auto-reload: npm run dev"
            ;;
        *)
            echo "❌ Invalid choice"
            exit 1
            ;;
    esac
else
    echo "🐳 Docker not found. Setting up for local development..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
        exit 1
    fi
    
    # Create .env file
    if [ ! -f .env ]; then
        echo "📝 Creating environment file..."
        cp .env.example .env
        echo "⚠️  Please edit .env file with your MySQL credentials"
    fi
    
    echo "📦 Installing dependencies..."
    npm install
    
    echo "✅ Setup complete!"
    echo "🗄️  Don't forget to run: npm run init-db (after setting up MySQL)"
    echo "🚀 Start the application with: npm start"
fi
