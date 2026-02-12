# NGO Connect - Complete Application

## Project Overview

NGO Connect is a unified digital platform that bridges the gap between NGOs and the public. It enables:
- **NGO Discovery**: Location-based search for NGOs by service category
- **Service Requests**: Users can request assistance from NGOs
- **Donations**: Secure donation system with tracking
- **Real-time Communication**: Chat between users and NGOs
- **Member Applications**: Users can apply to join NGOs as volunteers/members
- **Analytics Dashboard**: Impact metrics and performance tracking
- **Role-Based Access**: Different features for users, NGO members, and admins

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Communication**: Socket.IO
- **Security**: bcryptjs for password hashing

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Styling**: Custom CSS

## Project Structure

```
NGO CONNECT APP/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── ngoController.js     # NGO management
│   │   ├── requestController.js # Service requests
│   │   ├── donationController.js # Donations
│   │   ├── chatController.js    # Chat functionality
│   │   ├── analyticsController.js # Analytics
│   │   └── userController.js    # User management
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── authorize.js         # Role-based authorization
│   │   └── errorHandler.js      # Error handling
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── NGO.js               # NGO schema
│   │   ├── ServiceRequest.js    # Service request schema
│   │   ├── Donation.js          # Donation schema
│   │   ├── Chat.js              # Chat schema
│   │   └── NGOApplication.js    # NGO application schema
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── ngos.js              # NGO routes
│   │   ├── requests.js          # Request routes
│   │   ├── donations.js         # Donation routes
│   │   ├── chat.js              # Chat routes
│   │   ├── analytics.js         # Analytics routes
│   │   └── users.js             # User routes
│   └── server.js                # Server entry point
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Navbar.css
│   │   │   └── PrivateRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── NGOList.js
│   │   │   ├── NGODetail.js
│   │   │   ├── ServiceRequests.js
│   │   │   ├── Donations.js
│   │   │   ├── Chat.js
│   │   │   └── Profile.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Step 1: Clone or Navigate to Project
```bash
cd "d:\Projects\NGO CONNECT APP"
```

### Step 2: Install Backend Dependencies
```bash
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### Step 4: Configure Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit `.env` and update the following:
```env
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ngo_connect

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# CORS
CLIENT_URL=http://localhost:3000
```

### Step 5: Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### Step 6: Run the Application

**Option 1: Run Backend and Frontend Separately**

Terminal 1 (Backend):
```bash
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm start
```

**Option 2: Run Both Concurrently** (requires concurrently package)
```bash
npm run dev:all
```

### Step 7: Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Database Setup

The application will automatically create collections when you start using it. However, you may want to create an admin user and some NGOs manually.

### Creating Admin User (via MongoDB)
```javascript
// Connect to MongoDB shell
use ngo_connect

// Create admin user
db.users.insertOne({
  name: "Admin User",
  email: "admin@ngoconnect.com",
  password: "$2a$10$...", // Use bcrypt to hash password
  role: "admin",
  isActive: true,
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "location": {
    "city": "Mumbai",
    "state": "Maharashtra",
    "coordinates": [72.8777, 19.0760]
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>
```

### NGO Endpoints

#### Get All NGOs
```
GET /api/ngos?category=Education&city=Mumbai
```

#### Get Nearby NGOs
```
GET /api/ngos/nearby?latitude=19.0760&longitude=72.8777&maxDistance=10000
```

#### Get Single NGO
```
GET /api/ngos/:id
```

#### Create NGO (Admin Only)
```
POST /api/ngos
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Help Foundation",
  "description": "Providing education to underprivileged children",
  "registrationNumber": "REG123456",
  "email": "help@foundation.org",
  "phone": "9876543210",
  "location": {
    "coordinates": [72.8777, 19.0760],
    "address": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra"
  },
  "serviceCategories": ["Education", "Child Welfare"]
}
```

#### Apply to NGO
```
POST /api/ngos/:id/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "I want to volunteer",
  "position": "Volunteer",
  "skills": ["Teaching", "Communication"],
  "availability": "Weekends"
}
```

### Service Request Endpoints

#### Create Service Request
```
POST /api/requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "ngoId": "60abc123...",
  "serviceCategory": "Education",
  "title": "Need educational materials",
  "description": "Require textbooks for 10 students",
  "urgency": "medium"
}
```

#### Get All Requests
```
GET /api/requests
Authorization: Bearer <token>
```

#### Update Request Status (NGO Member)
```
PUT /api/requests/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_progress",
  "responseNotes": "Working on your request"
}
```

### Donation Endpoints

#### Create Donation
```
POST /api/donations
Authorization: Bearer <token>
Content-Type: application/json

{
  "ngoId": "60abc123...",
  "amount": 1000,
  "purpose": "Education Support",
  "paymentMethod": "upi",
  "isAnonymous": false
}
```

#### Get Donations
```
GET /api/donations
Authorization: Bearer <token>
```

### Analytics Endpoints

#### Get Dashboard Analytics
```
GET /api/analytics/dashboard
Authorization: Bearer <token>
```

#### Get NGO Analytics
```
GET /api/analytics/ngo/:ngoId
Authorization: Bearer <token>
```

## User Roles and Permissions

### 1. User (Normal User)
- Browse and search NGOs
- View NGO details
- Submit service requests
- Make donations
- Apply to become NGO member
- Chat with NGOs
- View own requests and donations

### 2. NGO Member
- All user permissions
- View requests for their NGO
- Update request status
- View donation reports
- Manage NGO profile
- Add activities and achievements
- Review member applications

### 3. Admin
- All permissions
- Create new NGOs
- Manage all users
- View all analytics
- Delete NGOs
- System-wide access

## Features Implemented

### Core Features
- ✅ User authentication and authorization
- ✅ Role-based access control (User, NGO Member, Admin)
- ✅ NGO registration and profile management
- ✅ Location-based NGO discovery
- ✅ Service category filtering
- ✅ Service request submission and tracking
- ✅ NGO member application workflow
- ✅ Donation management
- ✅ Real-time chat infrastructure
- ✅ Analytics dashboard
- ✅ Impact metrics tracking

### Technical Features
- ✅ JWT-based authentication
- ✅ Password hashing with bcryptjs
- ✅ MongoDB with Mongoose ODM
- ✅ RESTful API architecture
- ✅ Socket.IO for real-time communication
- ✅ Geospatial queries for location-based search
- ✅ Input validation
- ✅ Error handling middleware
- ✅ CORS configuration
- ✅ Responsive React UI

## Testing

### Manual Testing Steps

1. **User Registration & Login**
   - Register a new user
   - Login with credentials
   - Verify JWT token is stored
   - Access protected routes

2. **NGO Discovery**
   - Browse all NGOs
   - Filter by category
   - Filter by location
   - View NGO details

3. **Service Requests**
   - Create a service request
   - View request status
   - (As NGO member) Update request status

4. **Donations**
   - Make a donation
   - View donation history
   - Check transaction details

5. **NGO Application**
   - Apply to join an NGO
   - (As NGO member) Review applications
   - Approve/Reject applications

## Deployment

### Backend Deployment (Example: Heroku)

1. Create Heroku app
```bash
heroku create ngo-connect-api
```

2. Set environment variables
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_secret_key
```

3. Deploy
```bash
git push heroku main
```

### Frontend Deployment (Example: Vercel/Netlify)

1. Build the production version
```bash
cd client
npm run build
```

2. Deploy to Vercel
```bash
vercel --prod
```

Or deploy to Netlify by uploading the `build` folder

### MongoDB Cloud Setup (MongoDB Atlas)

1. Create account at mongodb.com
2. Create a new cluster
3. Get connection string
4. Update MONGODB_URI in .env

## Future Enhancements

- 🔄 Complete real-time chat implementation
- 🔄 Map integration with Leaflet/Google Maps
- 🔄 Email notifications
- 🔄 Payment gateway integration
- 🔄 File upload for documents/images
- 🔄 Advanced analytics with charts
- 🔄 Mobile app (React Native)
- 🔄 AI-based NGO recommendations
- 🔄 Multilingual support
- 🔄 Social media integration

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running on your system

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Change PORT in .env or kill the process using that port

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Verify CLIENT_URL in backend .env matches your frontend URL

## Support

For issues or questions:
1. Check this documentation
2. Review error logs in terminal
3. Check MongoDB connection
4. Verify environment variables

## License

This project is built for educational and demonstration purposes.

## Contributors

Developed as part of NGO Connect startup initiative.

---

**Note**: This is an MVP (Minimum Viable Product) version. Some features like payment integration and advanced analytics are simplified for demonstration purposes.
