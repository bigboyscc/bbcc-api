# Quick Start Guide

Get the BBCC API up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
cd /Users/vivek/dev/bbcc/api
npm install
```

## Step 2: Start MongoDB

### Option A: Local MongoDB
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Option B: MongoDB Atlas (Cloud)
1. Create free cluster at https://cloud.mongodb.com
2. Get connection string
3. Update `DATABASE_URL` in `.env.development`

## Step 3: Configure Environment

The `.env.development` file is already created with default values. You can use it as-is for local development.

**Optional**: Generate secure JWT secrets for production:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Step 4: Start the Server

```bash
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
📚 API Docs available at http://localhost:5000/api-docs
❤️  Health check at http://localhost:5000/health
```

## Step 5: Create Admin User

In a new terminal:

```bash
npm run create-admin
```

This creates:
- Email: `admin@bbcc.com`
- Password: `admin123456`

## Step 6: Test the API

### 1. Check Health
```bash
curl http://localhost:5000/health
```

### 2. Login as Admin
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bbcc.com",
    "password": "admin123456"
  }'
```

Save the `accessToken` from the response.

### 3. Create a Player (Admin Only)
```bash
curl -X POST http://localhost:5000/api/v1/players \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Virat Kohli",
    "phone": "+91-9876543210",
    "primarySkill": "Batting",
    "battingStyle": "Right-hand",
    "source": "manual"
  }'
```

### 4. Get All Players
```bash
curl http://localhost:5000/api/v1/players \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Step 7: Explore Swagger Docs

Open in browser: http://localhost:5000/api-docs

You can test all endpoints directly from the Swagger UI!

## Common Commands

```bash
# Development server (hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format

# Create admin user
npm run create-admin
```

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check `DATABASE_URL` in `.env.development`
- For Atlas, whitelist your IP address

### Port 5000 Already in Use
Change the port in `.env.development`:
```env
PORT=5001
```

### JWT Secret Errors
Make sure JWT secrets are at least 32 characters in `.env.development`

## Next Steps

1. Read [AUTH_SETUP.md](./AUTH_SETUP.md) for authentication details
2. Read [README.md](./README.md) for complete documentation
3. Start building additional routes (matches, grounds, etc.)
4. Integrate with your frontend

## Need Help?

- Check the Swagger docs: http://localhost:5000/api-docs
- Review the auth guide: [AUTH_SETUP.md](./AUTH_SETUP.md)
- Check the logs in the terminal for detailed error messages
