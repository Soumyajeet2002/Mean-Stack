# MERN Auth Project - Quick Reference & Troubleshooting

## ⚡ Quick Start Commands

### One-Time Setup

```bash
# 1. Clone or create project
mkdir mern-auth-project
cd mern-auth-project

# 2. Setup Backend
mkdir backend
cd backend
npm init -y
npm install express mongoose dotenv cors bcryptjs jsonwebtoken
npm install --save-dev nodemon

# Create backend folder structure
mkdir config routes models middleware controllers

# 3. Setup Frontend (back to parent directory)
cd ..
ng new frontend --routing --style=scss --skip-git
cd frontend
npm install axios

# Generate services and components
ng generate service services/auth --skip-tests
ng generate component components/login --skip-tests
ng generate component components/register --skip-tests
ng generate component components/dashboard --skip-tests
```

### Every Time You Want to Run the Project

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Should show: MERN Auth Server Started Successfully on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
ng serve
# Should show: Application running on http://localhost:4200
```

---

## 📋 Files Checklist

### Backend Files to Create

```
backend/
├── config/db.js                          ✓ Database connection
├── models/User.js                        ✓ User schema and methods
├── middleware/authMiddleware.js          ✓ JWT verification middleware
├── controllers/authController.js         ✓ Auth logic (register, login, getCurrentUser)
├── routes/auth.js                        ✓ Auth routes
├── server.js                             ✓ Main server file
├── .env                                  ✓ Environment variables
├── .gitignore                            ✓ (optional) Ignore node_modules
└── package.json                          ✓ Dependencies (auto-generated)
```

### Frontend Files to Create/Modify

```
frontend/src/app/
├── services/auth.service.ts              ✓ Authentication service with Axios
├── components/
│   ├── login/
│   │   ├── login.component.ts            ✓ Login logic
│   │   ├── login.component.html          ✓ Login form
│   │   └── login.component.scss          ✓ Login styles
│   ├── register/
│   │   ├── register.component.ts         ✓ Register logic
│   │   ├── register.component.html       ✓ Register form
│   │   └── register.component.scss       ✓ Register styles
│   └── dashboard/
│       ├── dashboard.component.ts        ✓ Dashboard logic
│       ├── dashboard.component.html      ✓ Dashboard template
│       └── dashboard.component.scss      ✓ Dashboard styles
├── app.routes.ts                         ✓ Application routing
├── app.component.ts                      ✓ Root component
├── app.component.html                    ✓ Root template
└── app.component.scss                    ✓ Root styles
```

---

## 🔧 Environment Variables

### Backend `.env` File

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/mern-auth

# JWT Secret (Change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345

# Server Configuration
PORT=5000
NODE_ENV=development

# Optional
LOG_LEVEL=info
```

### Frontend `environment.ts` File

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
};
```

---

## 🧪 API Endpoints Reference

### Public Endpoints

**1. Register User**
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**2. Login User**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Protected Endpoints

**3. Get Current User** (Requires token in Authorization header)
```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response:
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "MongoDB connection failed"

**Error Message:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
MongooseError: Cannot connect to MongoDB at mongodb://localhost:27017/mern-auth
```

**Solutions:**
```bash
# Windows - Check if mongod is running
mongod

# macOS - Start MongoDB service
brew services start mongodb-community

# Linux - Start MongoDB service
sudo systemctl start mongod

# Verify MongoDB is running
mongo --version
mongosh --version
```

---

### Issue 2: "Port 5000 already in use"

**Error Message:**
```
Error: listen EADDRINUSE :::5000
```

**Solutions:**
```bash
# Windows - Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux - Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Alternative: Change port in .env
PORT=5001  # Change to a different port
```

---

### Issue 3: "CORS error in browser"

**Error Message:**
```
Access to XMLHttpRequest at 'http://localhost:5000/...' 
from origin 'http://localhost:4200' has been blocked by CORS policy
```

**Solution:** Make sure `server.js` has correct CORS configuration:
```javascript
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
}));
```

---

### Issue 4: "Cannot find module 'express'"

**Error Message:**
```
Error: Cannot find module 'express'
```

**Solution:**
```bash
# Make sure you're in the backend directory
cd backend

# Install dependencies
npm install

# Or reinstall all
rm -rf node_modules package-lock.json
npm install
```

---

### Issue 5: "Angular compilation errors"

**Error Message:**
```
Error: Component not found
```

**Solutions:**
```bash
# Make sure you're in frontend directory
cd frontend

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clean Angular cache
ng cache clean

# Rebuild
ng serve
```

---

### Issue 6: "Token not working / Unauthorized (401)"

**Error Message:**
```
{
  "success": false,
  "message": "No token provided" or "Invalid token"
}
```

**Troubleshooting Steps:**
1. Check if token is saved in browser localStorage
   - Open DevTools (F12) → Application → Local Storage
   - Look for `authToken` key

2. Verify token format in Authorization header:
   ```
   Authorization: Bearer <your-token-here>
   ```

3. Check if JWT_SECRET matches in backend `.env`

4. Verify token expiration (tokens expire after 7 days by default)

---

### Issue 7: "Cannot read property of undefined"

**Common causes:**
- Trying to access user data before it loads
- Missing null checks in template

**Fix in component:**
```typescript
// Add null checks
<div *ngIf="user">
  <p>{{ user.fullName }}</p>
</div>
```

---

## 🔍 Debugging Tips

### Backend Debugging

**Enable detailed logging in `server.js`:**
```javascript
// Add at top
const morgan = require('morgan');
app.use(morgan('dev')); // Install: npm install morgan

// Or manual logging
console.log('Request:', req.method, req.path, req.body);
```

**Test API with Postman or cURL:**
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Frontend Debugging

**Check Network Requests:**
1. Open DevTools (F12)
2. Go to Network tab
3. Perform an action (login, register)
4. Check request/response details

**Check Console for Errors:**
1. DevTools (F12) → Console tab
2. Look for red errors or warnings

**Check LocalStorage:**
1. DevTools (F12) → Application tab
2. Local Storage → http://localhost:4200
3. Look for `authToken` and `currentUser`

---

## 📊 MongoDB Queries for Testing

### Connect to MongoDB and test manually

```bash
# Open MongoDB shell
mongosh

# Or older versions
mongo
```

**In MongoDB shell:**
```javascript
// Use database
use mern-auth

// See all users
db.users.find()

// See specific user
db.users.findOne({ email: "john@example.com" })

// Count users
db.users.countDocuments()

// Delete a user (testing)
db.users.deleteOne({ email: "test@example.com" })

// Delete all users (caution!)
db.users.deleteMany({})
```

---

## 🚀 Performance Tips

### Backend Optimization
```javascript
// Use indexes for faster queries
userSchema.index({ email: 1 });

// Limit field selection
User.findOne({ email }, '-password');

// Use lean() for read-only queries
User.findById(id).lean();
```

### Frontend Optimization
```typescript
// Unsubscribe from observables
ngOnDestroy() {
  this.subscription?.unsubscribe();
}

// Use OnPush change detection
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

---

## 📚 File Templates Quick Copy

### Backend template files (copy-paste ready)

**User Model:**
```javascript
// Copy from MERN_Project_Setup.md -> models/User.js
```

**Auth Controller:**
```javascript
// Copy from MERN_Project_Setup.md -> controllers/authController.js
```

**Auth Routes:**
```javascript
// Copy from MERN_Project_Setup.md -> routes/auth.js
```

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Change JWT_SECRET in `.env`
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Add rate limiting
- [ ] Add request validation
- [ ] Add error logging service
- [ ] Use environment-specific configs
- [ ] Minify and optimize frontend build
- [ ] Set up CI/CD pipeline
- [ ] Add monitoring and alerts

---

## 📞 Quick Support

**Check these first:**
1. Is MongoDB running? → `mongod` or `brew services start mongodb-community`
2. Are both servers running? → Check two terminals
3. Check browser console for errors → F12 → Console
4. Check server logs → Look at terminal output
5. Verify all files are created → Compare with Files Checklist

---

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Angular Documentation](https://angular.io/docs)
- [JWT Introduction](https://jwt.io/introduction)
- [Axios Documentation](https://axios-http.com/)

---

**Last Updated:** January 2025
**Version:** 1.0
**Status:** Production Ready ✅

