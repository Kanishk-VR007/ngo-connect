# NGO Connect - Setup Instructions

## Complete Setup Guide

Follow these steps to set up and run the NGO Connect application:

### 1. Prerequisites Check

Make sure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** (comes with Node.js)

Verify installations:
```bash
node --version
npm --version
mongod --version
```

### 2. Install Dependencies

Open PowerShell or Command Prompt in the project directory:

```powershell
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Start MongoDB

**Windows (PowerShell as Administrator)**:
```powershell
net start MongoDB
```

**Alternative**: Run MongoDB manually
```powershell
mongod --dbpath "C:\data\db"
```

**Verify MongoDB is running**:
Open MongoDB Compass or run:
```powershell
mongo
```

### 4. Environment Configuration

The `.env` file has been created with default settings. No changes needed for local development.

If you want to use MongoDB Atlas (cloud database):
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ngo_connect
   ```

### 5. Run the Application

You need TWO terminal windows:

**Terminal 1 - Backend**:
```powershell
npm run dev
```

You should see:
```
Server running on port 5000
Environment: development
MongoDB Connected: localhost
```

**Terminal 2 - Frontend**:
```powershell
cd client
npm start
```

Browser will automatically open at `http://localhost:3000`

### 6. Create Test Data (Optional)

#### Option A: Via Application
1. Register a new user at http://localhost:3000/register
2. Login and explore features

#### Option B: Via MongoDB Shell
```javascript
// Open MongoDB shell
mongo

// Use the database
use ngo_connect

// Create an admin user
db.users.insertOne({
  name: "Admin User",
  email: "admin@ngo.com",
  password: "$2a$10$8eJ0qZF7mXYpXrVE5xT8ZOWJxqF7pZWDqGxYqF7pZWDqGxYqF7pZW", // password: admin123
  role: "admin",
  isActive: true,
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

// Create a sample NGO
db.ngos.insertOne({
  name: "Help Foundation",
  description: "Providing quality education to underprivileged children",
  registrationNumber: "REG123456789",
  email: "help@foundation.org",
  phone: "9876543210",
  location: {
    type: "Point",
    coordinates: [72.8777, 19.0760],
    address: "123 Main Street, Andheri",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    pincode: "400001"
  },
  serviceCategories: ["Education", "Child Welfare"],
  foundedYear: 2015,
  teamSize: 25,
  statistics: {
    peopleHelped: 1000,
    projectsCompleted: 50,
    donationsReceived: 500000,
    volunteersEngaged: 100
  },
  rating: {
    average: 4.5,
    count: 20
  },
  isVerified: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 7. Test the Application

1. **Home Page**: Navigate to http://localhost:3000
2. **Register**: Create a new account
3. **Login**: Sign in with your credentials
4. **Browse NGOs**: Go to "Find NGOs" page
5. **View Details**: Click on an NGO to see details
6. **Request Service**: Submit a service request
7. **Dashboard**: Check your dashboard

### 8. Verify Everything Works

Check these endpoints:

1. **Backend Health**: http://localhost:5000/api/health
   - Should return: `{"status":"OK","message":"NGO Connect API is running"}`

2. **Get NGOs**: http://localhost:5000/api/ngos
   - Should return list of NGOs (or empty array)

3. **Frontend**: http://localhost:3000
   - Should show the home page

## Troubleshooting

### Problem: MongoDB Connection Failed
**Error**: `Error: connect ECONNREFUSED 127.0.0.1:27017`

**Solutions**:
1. Start MongoDB service:
   ```powershell
   net start MongoDB
   ```

2. Or run MongoDB manually:
   ```powershell
   mongod --dbpath "C:\data\db"
   ```

3. Create data directory if it doesn't exist:
   ```powershell
   mkdir C:\data\db
   ```

### Problem: Port 5000 Already in Use
**Error**: `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions**:
1. Change port in `.env`:
   ```
   PORT=5001
   ```

2. Or kill the process:
   ```powershell
   # Find process using port 5000
   netstat -ano | findstr :5000
   
   # Kill the process (replace PID with actual process ID)
   taskkill /PID <PID> /F
   ```

### Problem: Frontend Can't Connect to Backend
**Error**: Network error or API calls failing

**Solutions**:
1. Verify backend is running on port 5000
2. Check `proxy` in `client/package.json`:
   ```json
   "proxy": "http://localhost:5000"
   ```

### Problem: npm install fails
**Error**: Various npm errors

**Solutions**:
1. Clear npm cache:
   ```powershell
   npm cache clean --force
   ```

2. Delete node_modules and reinstall:
   ```powershell
   rm -r node_modules
   npm install
   ```

### Problem: React App Won't Start
**Error**: Cannot find module or compilation errors

**Solutions**:
1. Make sure you're in the client directory:
   ```powershell
   cd client
   npm start
   ```

2. Reinstall dependencies:
   ```powershell
   rm -r node_modules
   npm install
   npm start
   ```

## Stopping the Application

1. Press `Ctrl + C` in both terminal windows
2. Stop MongoDB (if running as service):
   ```powershell
   net stop MongoDB
   ```

## Next Steps

After successful setup:

1. **Explore Features**: Test all pages and features
2. **Read Documentation**: Check README.md for detailed info
3. **API Testing**: Use Postman with API_DOCUMENTATION.md
4. **Customize**: Modify code to add your own features
5. **Deploy**: Follow deployment guide for production

## Quick Commands Reference

```powershell
# Start backend development server
npm run dev

# Start frontend development server
cd client && npm start

# Install new backend package
npm install package-name

# Install new frontend package
cd client && npm install package-name

# Build frontend for production
cd client && npm run build

# Run both servers concurrently (if concurrently installed)
npm run dev:all
```

## Project Structure Overview

```
NGO CONNECT APP/
├── backend/              # Backend API
│   ├── controllers/      # Request handlers
│   ├── models/          # Database schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & error handling
│   └── server.js        # Entry point
├── client/              # Frontend React app
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   └── context/     # React context (auth)
│   └── public/          # Static files
├── .env                 # Environment variables
├── package.json         # Backend dependencies
└── README.md           # Full documentation
```

## Support Resources

- **Full Documentation**: See README.md
- **API Reference**: See API_DOCUMENTATION.md
- **Quick Start**: See QUICKSTART.md
- **MongoDB Docs**: https://docs.mongodb.com/
- **React Docs**: https://react.dev/
- **Express Docs**: https://expressjs.com/

## Success Indicators

You'll know setup is successful when:
- ✅ Backend shows "MongoDB Connected" message
- ✅ Frontend opens automatically in browser
- ✅ You can register and login
- ✅ Dashboard loads without errors
- ✅ You can browse NGOs

---

**Need help?** Check the Troubleshooting section above or review the error messages carefully.

Happy Developing! 🎉
