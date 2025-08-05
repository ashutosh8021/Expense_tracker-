# Quick Heroku Deployment (Alternative)

## Step 1: Install Heroku CLI
Download: https://devcenter.heroku.com/articles/heroku-cli

## Step 2: Login and Deploy
```bash
# Login to Heroku
heroku login

# Create Heroku app
heroku create your-expense-tracker

# Add MySQL database
heroku addons:create jawsdb:kitefin

# Deploy from GitHub
# OR push directly:
git push heroku main

# Initialize database
heroku run npm run init-db
```

## Step 3: Your app is live!
- URL: https://your-expense-tracker.herokuapp.com
- Auto-deploys from GitHub (if connected)
