# 🚀 NGO CONNECT - Installation & Running Guide

## Quick Start Commands

### Prerequisites Installation

1. **Install Node.js**
   - Download from: https://nodejs.org/ (LTS version recommended)
   - Verify: `node --version` and `npm --version`

2. **Install MongoDB**
   - Download from: https://www.mongodb.com/try/download/community
   - Verify: `mongod --version`

---

## 📥 Installation Steps

### Step 1: Navigate to Project
```powershell
cd "d:\Projects\NGO CONNECT APP"
```

### Step 2: Install Backend Dependencies
```powershell
npm install
```

Expected packages to be installed:
- express (Web framework)
- mongoose (MongoDB ODM)
- jsonwebtoken (JWT auth)
- bcryptjs (Password hashing)
- socket.io (Real-time communication)
- cors (Cross-origin requests)
- dotenv (Environment variables)
- express-validator (Input validation)
- multer (File upload)
- node-cron (Scheduled tasks)

### Step 3: Install Frontend Dependencies
```powershell
cd client
npm install
cd ..
```

Expected packages to be installed:
- react & react-dom (UI library)
- react-router-dom (Routing)
- axios (HTTP client)
- socket.io-client (Real-time)
- leaflet & react-leaflet (Maps)
- recharts (Charts)

---

## 🗄️ Database Setup

### Option 1: Local MongoDB

**Start MongoDB Service (Windows)**:
```powershell
# As Administrator
net start MongoDB
```

**Create Database Directory (if needed)**:
```powershell
mkdir C:\data\db
```

**Start MongoDB Manually** (if service doesn't exist):
```powershell
mongod --dbpath "C:\data\db"
```

**Verify MongoDB is Running**:
```powershell
mongo
# You should see MongoDB shell
```

### Option 2: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get connection string
5. Update `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ngo_connect
   ```

---

## ▶️ Running the Application

### Method 1: Two Separate Terminals (Recommended)

**Terminal 1 - Backend**:
```powershell
# In project root directory
npm run dev
```

Expected output:
```
[nodemon] starting `node backend/server.js`
Server running on port 5000
Environment: development
MongoDB Connected: localhost
```

**Terminal 2 - Frontend**:
```powershell
# In project root directory
cd client
npm start
```

Expected output:
```
Compiled successfully!

You can now view ngo-connect-client in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

### Method 2: Using Concurrently (Both at Once)

First, install concurrently:
```powershell
npm install concurrently --save-dev
```

Then run both servers:
```powershell
npm run dev:all
```

---

## ✅ Verification Steps

### 1. Check Backend is Running
Open browser: http://localhost:5000/api/health

Should see:
```json
{
  "status": "OK",
  "message": "NGO Connect API is running",
  "timestamp": "2024-..."
}
```

### 2. Check Frontend is Running
Open browser: http://localhost:3000

Should see the NGO Connect home page.

### 3. Test Database Connection
Check backend terminal for:
```
MongoDB Connected: localhost (or your connection host)
```

---

## 🧪 Testing the Application

### Create Your First User

1. Go to http://localhost:3000
2. Click "Register"
3. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
4. Click "Register"

### Browse NGOs

1. Click "Find NGOs" in navigation
2. You'll see an empty list initially
3. Create NGOs via API or MongoDB

### Create Sample Data via MongoDB

Open MongoDB shell or Compass and run:

```javascript
use ngo_connect

// Create a sample NGO
db.ngos.insertOne({
  name: "Help Foundation",
  description: "Providing quality education to underprivileged children across India",
  registrationNumber: "REG2024001",
  email: "contact@helpfoundation.org",
  phone: "9876543210",
  website: "https://helpfoundation.org",
  location: {
    type: "Point",
    coordinates: [72.8777, 19.0760],
    address: "123 Main Street, Andheri West",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    pincode: "400058"
  },
  serviceCategories: ["Education", "Child Welfare"],
  foundedYear: 2015,
  teamSize: 50,
  members: [],
  achievements: [],
  activities: [],
  statistics: {
    peopleHelped: 5000,
    projectsCompleted: 100,
    donationsReceived: 1000000,
    volunteersEngaged: 200
  },
  rating: {
    average: 4.5,
    count: 150
  },
  socialMedia: {
    facebook: "helpfoundation",
    twitter: "helpfoundation",
    instagram: "helpfoundation"
  },
  isVerified: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

// Create more NGOs with different categories
db.ngos.insertMany([
  {
    name: "Health First NGO",
    description: "Free medical camps and healthcare services",
    registrationNumber: "REG2024002",
    email: "info@healthfirst.org",
    phone: "9988776655",
    location: {
      type: "Point",
      coordinates: [77.5946, 12.9716],
      address: "45 Health Street",
      city: "Bangalore",
      state: "Karnataka",
      country: "India"
    },
    serviceCategories: ["Healthcare", "Elderly Care"],
    foundedYear: 2018,
    teamSize: 30,
    statistics: {
      peopleHelped: 2000,
      projectsCompleted: 50,
      donationsReceived: 500000,
      volunteersEngaged: 80
    },
    rating: { average: 4.3, count: 80 },
    isVerified: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Green Earth Foundation",
    description: "Environmental conservation and sustainability",
    registrationNumber: "REG2024003",
    email: "contact@greenearth.org",
    phone: "9123456789",
    location: {
      type: "Point",
      coordinates: [88.3639, 22.5726],
      address: "Green Park, Sector 5",
      city: "Kolkata",
      state: "West Bengal",
      country: "India"
    },
    serviceCategories: ["Environmental", "Disaster Relief"],
    foundedYear: 2020,
    teamSize: 25,
    statistics: {
      peopleHelped: 1500,
      projectsCompleted: 30,
      donationsReceived: 300000,
      volunteersEngaged: 60
    },
    rating: { average: 4.7, count: 45 },
    isVerified: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
```

---

## 🔍 Common Commands Reference

### Backend Commands
```powershell
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Install a new package
npm install package-name

# Check for errors
npm run test
```

### Frontend Commands
```powershell
# Start development server
cd client && npm start

# Build for production
cd client && npm run build

# Install a new package
cd client && npm install package-name
```

### MongoDB Commands
```powershell
# Start MongoDB service
net start MongoDB

# Stop MongoDB service
net stop MongoDB

# Open MongoDB shell
mongo

# Show databases
show dbs

# Use specific database
use ngo_connect

# Show collections
show collections

# View users
db.users.find().pretty()

# View NGOs
db.ngos.find().pretty()
```

---

## 🐛 Troubleshooting Commands

### Check if ports are in use
```powershell
# Check port 5000 (backend)
netstat -ano | findstr :5000

# Check port 3000 (frontend)
netstat -ano | findstr :3000
```

### Kill process on port
```powershell
# Find PID from above command, then:
taskkill /PID <PID_NUMBER> /F
```

### Clear npm cache
```powershell
npm cache clean --force
```

### Reinstall dependencies
```powershell
# Backend
rm -r node_modules
npm install

# Frontend
cd client
rm -r node_modules
npm install
```

### Reset database
```powershell
# In MongoDB shell
use ngo_connect
db.dropDatabase()
```

---

## 🎯 Feature Testing Checklist

After installation, test these features:

### Authentication
- [ ] Register new user
- [ ] Login with credentials
- [ ] View profile
- [ ] Update profile
- [ ] Logout

### NGO Features
- [ ] Browse all NGOs
- [ ] Filter by category
- [ ] Filter by location
- [ ] View NGO details
- [ ] Apply to join NGO

### Service Requests
- [ ] Create service request
- [ ] View your requests
- [ ] Check request status

### Donations
- [ ] Make a donation
- [ ] View donation history

### Dashboard
- [ ] View user dashboard
- [ ] Check statistics
- [ ] View recent activities

---

## 📊 Access URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Main application |
| Backend API | http://localhost:5000/api | REST API |
| API Health | http://localhost:5000/api/health | Health check |
| MongoDB | mongodb://localhost:27017 | Database |

---

## 🔐 Default Configuration

### Environment Variables (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ngo_connect
JWT_SECRET=ngo_connect_super_secret_key_2024_change_in_production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

### Database
- **Name**: ngo_connect
- **Collections**: users, ngos, servicerequests, donations, chats, ngoapplications

### Roles
- **user**: Normal user (default)
- **ngo_member**: NGO member/volunteer
- **admin**: System administrator

---

## 📝 Next Steps After Installation

1. **Create Sample Data**
   - Add NGOs via MongoDB
   - Register multiple users
   - Create service requests

2. **Test All Features**
   - Go through the testing checklist
   - Test different user roles

3. **Explore API**
   - Use Postman or similar tool
   - Test all endpoints
   - Check API_DOCUMENTATION.md

4. **Customize**
   - Modify UI components
   - Add new features
   - Customize styling

5. **Deploy**
   - Follow deployment guide
   - Set up production database
   - Configure production environment

---

## 🎓 Learning Resources

- **Node.js**: https://nodejs.org/docs
- **Express**: https://expressjs.com/
- **MongoDB**: https://docs.mongodb.com/
- **Mongoose**: https://mongoosejs.com/docs/
- **React**: https://react.dev/
- **Socket.IO**: https://socket.io/docs/

---

## ✨ Success!

If you see:
- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ✅ MongoDB connected
- ✅ Home page loads in browser

**You're all set! Start building amazing features! 🎉**

---

## 📞 Getting Help

If you encounter issues:
1. Check error messages in terminal
2. Review SETUP.md for detailed troubleshooting
3. Check MongoDB connection
4. Verify all environment variables
5. Ensure all ports are available

**Happy Coding! 🚀**
