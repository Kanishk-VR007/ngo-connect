# MongoDB Atlas Connection Troubleshooting Guide

## Current Status
Your `.env` file is configured with MongoDB Atlas credentials:
```
MONGODB_URI=mongodb+srv://akkan:SKCT%4024%4028@cluster0.rfuelsp.mongodb.net/ngo_connect?appName=Cluster0
```

**Connection Status**: Currently timing out or unreachable.

---

## Quick Diagnosis Steps

### Step 1: Test Connection
Run the connection diagnostic tool:
```bash
node test-db-connection.js
```

This will show:
- ✓ Connection successful → Database is working
- ✗ Connection failed → Follow the specific error diagnosis below

---

## Common Issues & Solutions

### Issue 1: DNS/Network Error (ENOTFOUND)
**Error Message**: `ENOTFOUND` or `getaddrinfo` error

**Cause**: Cannot reach MongoDB Atlas cluster server

**Solutions**:
1. **Check Internet Connection**
   ```bash
   ping cluster0.rfuelsp.mongodb.net
   ```
   
2. **Verify Cluster Exists**
   - Go to: https://cloud.mongodb.com
   - Login to your account
   - Check if cluster "cluster0" exists and is running
   - If paused, resume the cluster

3. **Check Firewall**
   - Ensure port 27017 is not blocked
   - Check Windows Firewall settings
   - Whitelist MongoDB ports if needed

### Issue 2: Authentication Failed
**Error Message**: `Authentication failed` or `auth error`

**Cause**: Wrong username, password, or user permissions

**Solutions**:
1. **Verify Credentials**
   ```
   Current credentials in .env:
   - Username: akkan
   - Password (encoded): SKCT%4024%4028
   - Decoded password: SKCT@$24@28
   ```

2. **Check User in MongoDB Atlas**
   - Go to: https://cloud.mongodb.com → Database Access
   - Verify user "akkan" exists
   - Check if user has "readWriteAnyDatabase" role
   - If not, create new user with proper permissions

3. **Update .env with correct credentials**
   ```bash
   # Get connection string from MongoDB Atlas:
   # 1. Click "Connect" button on cluster
   # 2. Select "Connect your application"
   # 3. Copy the connection string
   # 4. Replace username:password with correct values
   ```

### Issue 3: IP Whitelist Blocking
**Error Message**: `IP` related error or connection timeout

**Cause**: Your current IP address is not whitelisted

**Solutions**:
1. **Add Your IP to Whitelist**
   - Go to: https://cloud.mongodb.com → Network Access
   - Click "Add IP Address"
   - Enter your current IP address
   - Or click "Add Current IP Address" for quick setup

2. **Find Your Current IP**
   ```bash
   # Windows PowerShell
   (Invoke-WebRequest -Uri "https://api.ipify.org").Content
   
   # Or visit: https://whatismyipaddress.com
   ```

3. **Allow All IPs (Not Recommended)**
   - Go to: Network Access
   - Add `0.0.0.0/0` (allows all IPs)
   - ⚠️ Only for development/testing, not for production

### Issue 4: Cluster Paused or Not Running
**Error Message**: Connection timeout (hanging without error)

**Cause**: Cluster is paused or hibernated

**Solutions**:
1. **Resume Cluster**
   - Go to: https://cloud.mongodb.com → Clusters
   - Click on "cluster0"
   - Look for "Resume" button if paused
   - Wait 5-10 minutes for startup

2. **Check Cluster Status**
   - Verify cluster is in "Available" state
   - Check free tier limits (M0 has restrictions)

### Issue 5: Invalid Connection String
**Error Message**: `Invalid connection string` or `Invalid URI`

**Cause**: Connection string format is incorrect

**Solutions**:
```
CORRECT FORMAT:
mongodb+srv://username:password@host/database?appName=value

EXAMPLES:
✓ mongodb+srv://akkan:SKCT%4024%4028@cluster0.rfuelsp.mongodb.net/ngo_connect?appName=Cluster0
✗ mongodb+srv://akkan:password@cluster0.rfuelsp.mongodb.net/?appName=Cluster0  (missing database)
✗ mongodb://localhost:27017/ngo_connect  (local connection)
```

**Key Requirements**:
- Username and password (URL-encoded)
- Cluster hostname
- Database name (ngo_connect)
- Query parameters

---

## Password Encoding Reference

If your password contains special characters, they must be URL-encoded:

| Character | Encoded |
|-----------|---------|
| @ | %40 |
| $ | %24 |
| : | %3A |
| / | %2F |
| ? | %3F |
| # | %23 |
| [ | %5B |
| ] | %5D |

Example:
- Original: `password@123`
- Encoded: `password%40123`

---

## Verification Steps After Fix

### 1. Test Connection
```bash
node test-db-connection.js
```

**Success Output**:
```
✓ SUCCESS: MongoDB Connected!
   - Host: cluster0.mongodb.net
   - Database: ngo_connect
   - Connection state: Connected
   - Available collections: 4
```

### 2. Test API Health
```bash
# Check API status
curl http://localhost:5000/api/health

# Expected response:
# {
#   "status": "OK",
#   "database": {
#     "connected": true,
#     "status": "Connected"
#   }
# }
```

### 3. Start Backend Server
```bash
npm run dev
```

**Success Output**:
```
✓ MongoDB Connected: cluster0.mongodb.net
✓ Database Name: ngo_connect
Server running on http://localhost:5000
```

### 4. Test API Endpoints
```bash
# Test public endpoint
curl http://localhost:5000/api/ngos?limit=5

# Test authentication endpoints
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

---

## Fallback Solutions

### Temporary: Use Local MongoDB
If MongoDB Atlas is unavailable:

1. **Install Local MongoDB**
   ```bash
   # Download: https://www.mongodb.com/try/download/community
   # Or use chocolatey: choco install mongodb-community
   ```

2. **Update .env**
   ```
   MONGODB_URI=mongodb://localhost:27017/ngo_connect
   ```

3. **Start MongoDB**
   ```bash
   net start MongoDB
   ```

4. **Test Connection**
   ```bash
   node test-db-connection.js
   ```

### Temporary: Disable Database Requirement
The app can run without database (limited functionality):
```bash
npm run dev
```

API will respond with status 503 for database-dependent endpoints.

---

## Improved Error Handling

The following errors are now properly handled:

1. **503 Service Unavailable** - Database disconnected
   - Automatic retry capability
   - Retryable after 30 seconds

2. **Database Health Check** - New endpoints
   - `GET /api/health` - Quick status check
   - `GET /api/health/info` - Detailed diagnostics

3. **Better Error Messages** - All controllers now return:
   - Clear error descriptions
   - Retry suggestions
   - Development-only stack traces

---

## Need More Help?

### MongoDB Atlas Support
- **Documentation**: https://docs.mongodb.com/atlas/
- **Support**: https://support.mongodb.com
- **Status Page**: https://status.mongodb.com

### Common Issues
- Reset password: https://cloud.mongodb.com/account/login
- Billing/Free tier limits: Check email for quota notices
- Region issues: Check cluster region matches app region

### Test Endpoints

**Health Check**:
```bash
curl http://localhost:5000/api/health
```

**Detailed Info**:
```bash
curl http://localhost:5000/api/health/info
```

**Check Database Connection**:
```bash
node test-db-connection.js
```

---

## Quick Reference

| Issue | Command | Expected Result |
|-------|---------|-----------------|
| Test DB | `node test-db-connection.js` | Connected message |
| Start Server | `npm run dev` | Server listening on 5000 |
| Check API | `curl localhost:5000/api/health` | JSON with db status |
| Check Logs | `npm run dev` | Console shows connection |
| Resume Cluster | MongoDB Atlas UI | Cluster enters "Available" state |

---

## Last Updated
February 18, 2026

**For Production Deployment**:
- Use strong, unique passwords
- Enable IP whitelist (specific IPs only)
- Use VPC + Network Peering
- Monitor connection metrics
- Set up automated backups
- Use connection pooling

