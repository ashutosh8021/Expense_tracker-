# Expense Tracker - Virtual Environment Setup

This guide will help you set up the Expense Tracker application in an isolated environment.

## Option 1: Using Docker (Recommended)

### Prerequisites
- Docker and Docker Compose installed on your system

### Setup
1. **Clone or download the project**
2. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```
3. **Access the application**
   - Open your browser and go to `http://localhost:3000`

The Docker setup includes:
- Node.js application container
- MySQL database container
- Automatic database initialization
- Volume persistence for data

## Option 2: Using Node.js with Local Environment

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server

### Setup
1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your MySQL credentials

3. **Set up database**
   ```bash
   npm run init-db
   ```

4. **Start the application**
   ```bash
   npm start
   ```
   Or for development:
   ```bash
   npm run dev
   ```

## Option 3: Using Docker for Development

### Development with hot reload
```bash
docker-compose -f docker-compose.dev.yml up
```

This setup includes:
- Volume mounting for live code changes
- Nodemon for automatic restarts
- Debug port exposed

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | localhost |
| `DB_USER` | MySQL username | root |
| `DB_PASSWORD` | MySQL password | (empty) |
| `DB_NAME` | Database name | expense_tracker |
| `DB_PORT` | MySQL port | 3306 |
| `PORT` | Application port | 3000 |

## Troubleshooting

### Database Connection Issues
1. Ensure MySQL is running
2. Check credentials in `.env` file
3. Run database initialization: `npm run init-db`

### Port Already in Use
Change the `PORT` variable in `.env` file

### Docker Issues
- Make sure Docker is running
- Check if ports 3000 and 3306 are available
- Use `docker-compose down` to stop containers
