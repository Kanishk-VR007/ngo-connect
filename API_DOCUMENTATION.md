# NGO Connect - API Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Auth Endpoints

### Register User
Create a new user account.

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
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

**Response** (201):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "60abc...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

---

### Login
Authenticate a user.

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "60abc...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "ngoId": null
    }
  }
}
```

---

### Get Current User
Get authenticated user's profile.

**Endpoint**: `GET /auth/me`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "60abc...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "location": {...},
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## NGO Endpoints

### Get All NGOs
Retrieve all NGOs with optional filters.

**Endpoint**: `GET /ngos`

**Query Parameters**:
- `category` (optional): Filter by service category
- `city` (optional): Filter by city
- `state` (optional): Filter by state
- `verified` (optional): Filter by verification status (true/false)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example**: `GET /ngos?category=Education&city=Mumbai&page=1`

**Response** (200):
```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "page": 1,
  "pages": 5,
  "data": [
    {
      "_id": "60abc...",
      "name": "Help Foundation",
      "description": "Providing education...",
      "location": {
        "city": "Mumbai",
        "state": "Maharashtra"
      },
      "serviceCategories": ["Education"],
      "rating": {
        "average": 4.5,
        "count": 20
      },
      "isVerified": true
    }
  ]
}
```

---

### Get Nearby NGOs
Find NGOs near a specific location.

**Endpoint**: `GET /ngos/nearby`

**Query Parameters** (Required):
- `latitude`: Location latitude
- `longitude`: Location longitude
- `maxDistance` (optional): Maximum distance in meters (default: 10000)
- `category` (optional): Filter by category

**Example**: `GET /ngos/nearby?latitude=19.0760&longitude=72.8777&maxDistance=5000`

**Response** (200):
```json
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

---

### Get Single NGO
Get detailed information about a specific NGO.

**Endpoint**: `GET /ngos/:id`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "_id": "60abc...",
    "name": "Help Foundation",
    "description": "...",
    "registrationNumber": "REG123456",
    "email": "help@foundation.org",
    "phone": "9876543210",
    "location": {...},
    "serviceCategories": ["Education", "Child Welfare"],
    "members": [...],
    "activities": [...],
    "achievements": [...],
    "statistics": {
      "peopleHelped": 1000,
      "projectsCompleted": 50,
      "donationsReceived": 500000
    },
    "rating": {
      "average": 4.5,
      "count": 20
    }
  }
}
```

---

### Create NGO
Create a new NGO (Admin only).

**Endpoint**: `POST /ngos`

**Headers**: `Authorization: Bearer <admin_token>`

**Request Body**:
```json
{
  "name": "New Foundation",
  "description": "Helping communities...",
  "registrationNumber": "REG789012",
  "email": "info@newfoundation.org",
  "phone": "9999999999",
  "location": {
    "coordinates": [72.8777, 19.0760],
    "address": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra"
  },
  "serviceCategories": ["Education", "Healthcare"],
  "foundedYear": 2020
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {...}
}
```

---

### Apply to NGO
Submit application to join an NGO as member.

**Endpoint**: `POST /ngos/:id/apply`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "message": "I would like to volunteer",
  "position": "Volunteer",
  "skills": ["Teaching", "Communication"],
  "availability": "Weekends"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "_id": "60def...",
    "applicantId": "60abc...",
    "ngoId": "60xyz...",
    "status": "pending",
    "createdAt": "..."
  }
}
```

---

## Service Request Endpoints

### Create Service Request
Submit a request for NGO services.

**Endpoint**: `POST /requests`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "ngoId": "60abc...",
  "serviceCategory": "Education",
  "title": "Need educational materials",
  "description": "Require textbooks for 10 students",
  "urgency": "medium",
  "contactInfo": {
    "phone": "1234567890",
    "email": "john@example.com"
  }
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "_id": "60req...",
    "requestedBy": {...},
    "ngoId": {...},
    "title": "Need educational materials",
    "status": "pending",
    "createdAt": "..."
  }
}
```

---

### Get Service Requests
Get all service requests (filtered by user role).

**Endpoint**: `GET /requests`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `status` (optional): Filter by status

**Response** (200):
```json
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

---

### Update Request Status
Update the status of a service request (NGO members only).

**Endpoint**: `PUT /requests/:id/status`

**Headers**: `Authorization: Bearer <ngo_member_token>`

**Request Body**:
```json
{
  "status": "in_progress",
  "responseNotes": "Working on your request",
  "assignedTo": "60user..."
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {...}
}
```

---

## Donation Endpoints

### Create Donation
Make a donation to an NGO.

**Endpoint**: `POST /donations`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "ngoId": "60abc...",
  "amount": 1000,
  "currency": "INR",
  "donationType": "one_time",
  "purpose": "Education Support",
  "paymentMethod": "upi",
  "isAnonymous": false,
  "message": "Keep up the great work!"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "_id": "60don...",
    "donorId": "60abc...",
    "ngoId": {...},
    "amount": 1000,
    "transactionId": "TXN...",
    "status": "completed",
    "createdAt": "..."
  }
}
```

---

### Get Donations
Get donation history.

**Endpoint**: `GET /donations`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "success": true,
  "count": 3,
  "data": [...]
}
```

---

## Analytics Endpoints

### Get Dashboard Analytics
Get analytics based on user role.

**Endpoint**: `GET /analytics/dashboard`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "totalRequests": 10,
    "donations": {
      "totalAmount": 5000,
      "count": 3
    },
    "recentRequests": [...]
  }
}
```

---

### Get NGO Analytics
Get detailed analytics for a specific NGO.

**Endpoint**: `GET /analytics/ngo/:ngoId`

**Headers**: `Authorization: Bearer <ngo_member_or_admin_token>`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "ngoInfo": {...},
    "requestStats": {
      "pending": 5,
      "completed": 20
    },
    "donations": {
      "totalAmount": 50000,
      "totalCount": 30,
      "averageAmount": 1666.67
    },
    "categoryBreakdown": [...],
    "monthlyRequests": [...]
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request**:
```json
{
  "success": false,
  "error": "Validation error message"
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "error": "User role 'user' is not authorized"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Server Error**:
```json
{
  "success": false,
  "error": "Server error"
}
```

---

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error
