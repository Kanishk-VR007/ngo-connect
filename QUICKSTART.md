# NGO Connect - Quick Start Guide

## Get Started in 5 Minutes

### 1. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Setup Environment
```bash
# Copy example env file
cp .env.example .env
```

Edit `.env` and set your MongoDB URI (or use local MongoDB):
```
MONGODB_URI=mongodb://localhost:27017/ngo_connect
```

### 3. Start MongoDB
Make sure MongoDB is running on your system.

### 4. Run the Application

**Backend** (Terminal 1):
```bash
npm run dev
```

**Frontend** (Terminal 2):
```bash
cd client
npm start
```

### 5. Access the App
Open browser: http://localhost:3000

## Default Test Accounts

Create accounts via the registration page or use MongoDB to insert test data.

### Create Admin User
```javascript
// In MongoDB shell
use ngo_connect

db.users.insertOne({
  name: "Admin",
  email: "admin@ngo.com",
  password: "$2a$10$X/YourHashedPassword", // Hash "admin123"
  role: "admin",
  isActive: true,
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## Common Issues

**MongoDB not connecting?**
- Check if MongoDB service is running
- Verify MONGODB_URI in .env

**Port 5000 already in use?**
- Change PORT in .env file
- Or stop the process using port 5000

**Frontend not loading?**
- Ensure backend is running on port 5000
- Check proxy setting in client/package.json

## Key Features to Test

1. **Register & Login**: Create account and login
2. **Browse NGOs**: Go to "Find NGOs" page
3. **View NGO Details**: Click on any NGO card
4. **Request Service**: Click "Request Service" on NGO detail page
5. **View Dashboard**: Check your dashboard for analytics
6. **Profile**: Update your profile information

## API Endpoints

Base URL: `http://localhost:5000/api`

- POST `/auth/register` - Register new user
- POST `/auth/login` - Login user
- GET `/ngos` - Get all NGOs
- GET `/ngos/:id` - Get single NGO
- POST `/requests` - Create service request
- POST `/donations` - Make donation

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, Socket.IO
- **Frontend**: React, React Router, Axios
- **Auth**: JWT tokens

## Need Help?

Check the full README.md for detailed documentation.

---

Happy Coding! 🚀
