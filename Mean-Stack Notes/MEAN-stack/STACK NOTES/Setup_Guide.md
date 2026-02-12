# MERN Auth Project - Complete Setup & Execution Guide

## 📋 Prerequisites

Make sure you have installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (Community Edition) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)
- **Angular CLI** - `npm install -g @angular/cli`

Verify installations:
```bash
node --version      # Should show v18+
npm --version       # Should show 9+
mongod --version    # Should show version
ng version          # Should show Angular CLI version
```

---

## 🚀 Step-by-Step Setup

### Phase 1: Backend Setup (Express + MongoDB)

#### Step 1.1: Create Project Structure

```bash
mkdir mern-auth-project
cd mern-auth-project

# Create backend folder
mkdir backend
cd backend
```

#### Step 1.2: Initialize Node Project

```bash
npm init -y
```

**Update `package.json` scripts section:**

```json
{
  "name": "mern-auth-backend",
  "version": "1.0.0",
  "description": "MERN Stack Auth API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {},
  "devDependencies": {}
}
```

#### Step 1.3: Install Backend Dependencies

```bash
npm install express mongoose dotenv cors bcryptjs jsonwebtoken
npm install --save-dev nodemon
```

**Your package.json will now look like:**

```json
{
  "name": "mern-auth-backend",
  "version": "1.0.0",
  "description": "MERN Stack Auth API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

#### Step 1.4: Create Folder Structure

```bash
mkdir config routes models middleware controllers
```

#### Step 1.5: Create Configuration File

**File: `config/db.js`**

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

#### Step 1.6: Create User Model

**File: `models/User.js`**

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please provide a full name'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [50, 'Full name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
```

#### Step 1.7: Create Authentication Middleware

**File: `middleware/authMiddleware.js`**

```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.email = decoded.email;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

module.exports = authMiddleware;
```

#### Step 1.8: Create Auth Controller

**File: `controllers/authController.js`**

```javascript
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @route POST /api/auth/register
// @desc Register new user
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create new user
    const user = new User({
      fullName,
      email,
      password,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id, user.email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
};

// @route POST /api/auth/login
// @desc Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user and check password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated',
      });
    }

    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user._id, user.email);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

// @route GET /api/auth/me
// @desc Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
};
```

#### Step 1.9: Create Auth Routes

**File: `routes/auth.js`**

```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;
```

#### Step 1.10: Create .env File

**File: `.env`**

```
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/mern-auth

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345

# Server Port
PORT=5000

# Environment
NODE_ENV=development
```

#### Step 1.11: Create Main Server File

**File: `server.js`**

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '✅ MERN Auth API is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   MERN Auth Server Started Successfully    ║
║   🔗 http://localhost:${PORT}                   ║
║   📊 MongoDB Connected                      ║
╚════════════════════════════════════════════╝
  `);
});
```

---

### Phase 2: Frontend Setup (Angular v18)

#### Step 2.1: Create Angular Project

From the parent directory:

```bash
cd ..
ng new frontend --routing --style=scss --skip-git
cd frontend
```

**When prompted:**
- ✓ Routing: Yes
- ✓ Stylesheet: SCSS
- ✓ Package manager: npm

#### Step 2.2: Install Frontend Dependencies

```bash
npm install axios
```

#### Step 2.3: Generate Services & Components

```bash
# Service
ng generate service services/auth --skip-tests

# Components
ng generate component components/login --skip-tests
ng generate component components/register --skip-tests
ng generate component components/dashboard --skip-tests
```

#### Step 2.4: Copy the Angular Files

Copy all the TypeScript and HTML files from the `Angular_Frontend.md` file:

1. **Service**: `src/app/services/auth.service.ts`
2. **Login Component**: 
   - `src/app/components/login/login.component.ts`
   - `src/app/components/login/login.component.html`
   - `src/app/components/login/login.component.scss`
3. **Register Component**:
   - `src/app/components/register/register.component.ts`
   - `src/app/components/register/register.component.html`
   - `src/app/components/register/register.component.scss`
4. **Dashboard Component**:
   - `src/app/components/dashboard/dashboard.component.ts`
   - `src/app/components/dashboard/dashboard.component.html`
   - `src/app/components/dashboard/dashboard.component.scss`
5. **Routes**: `src/app/app.routes.ts`
6. **App Component**: `src/app/app.component.ts` and `app.component.html`
7. **Global Styles**: `src/styles.scss`
8. **Main File**: `src/main.ts`

---

## 🛠️ Running the Project

### Prerequisites for Running

**Make sure MongoDB is running:**

**On Windows:**
```bash
mongod
```

**On macOS/Linux:**
```bash
brew services start mongodb-community
# or
sudo systemctl start mongod
```

### Terminal 1: Start Backend

```bash
cd backend
npm run dev
```

**Expected output:**
```
╔════════════════════════════════════════════╗
║   MERN Auth Server Started Successfully    ║
║   🔗 http://localhost:5000                 ║
║   📊 MongoDB Connected                      ║
╚════════════════════════════════════════════╝
```

### Terminal 2: Start Frontend

```bash
cd frontend
ng serve
```

**Expected output:**
```
⠋ Building...
✔ Compiled successfully.

✔ Compiled successfully.

Application bundle generated successfully. 123.34 kB

Initial Chunk Files | Names         |      Size
main.js             | main          | 123.34 kB

Build at: 2024-01-15T10:30:00.000Z - Hash: abc123
Watch mode enabled. Ready to listen on port 4200.
```

### Visit the Application

Open your browser and go to:

```
http://localhost:4200
```

---

## 🧪 Testing the Application

### Test 1: Register New User

1. Click on "Create one here" link to go to Register page
2. Fill in the form:
   - Full Name: `John Doe`
   - Email: `john@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
3. Click "Register"
4. You should be redirected to Dashboard with user info displayed

### Test 2: Login

1. From Dashboard, click "Logout"
2. On Login page, enter:
   - Email: `john@example.com`
   - Password: `password123`
3. Click "Login"
4. You should see your user information on Dashboard

### Test 3: Try Invalid Credentials

1. Try login with wrong password
2. You should see error message: "Invalid email or password"

### Test 4: Try Duplicate Registration

1. Try to register with same email again
2. You should see error message: "Email already registered"

### Test 5: API Testing with Postman

**Register API:**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Login API:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "password123"
}
```

**Get Current User (Protected):**
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer <your-token-here>
```

---

## 📁 Final Project Structure

```
mern-auth-project/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── authController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── auth.js
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── dashboard.component.ts
│   │   │   │   │   ├── dashboard.component.html
│   │   │   │   │   └── dashboard.component.scss
│   │   │   │   ├── login/
│   │   │   │   │   ├── login.component.ts
│   │   │   │   │   ├── login.component.html
│   │   │   │   │   └── login.component.scss
│   │   │   │   └── register/
│   │   │   │       ├── register.component.ts
│   │   │   │       ├── register.component.html
│   │   │   │       └── register.component.scss
│   │   │   ├── services/
│   │   │   │   └── auth.service.ts
│   │   │   ├── app.component.ts
│   │   │   ├── app.component.html
│   │   │   ├── app.component.scss
│   │   │   ├── app.routes.ts
│   │   │   └── app.config.ts
│   │   ├── main.ts
│   │   ├── styles.scss
│   │   └── index.html
│   ├── angular.json
│   ├── package.json
│   ├── tsconfig.json
│   └── .gitignore
│
└── README.md
```

---

## 🔐 Security Enhancements (Optional)

### Add Rate Limiting (Backend)

```bash
npm install express-rate-limit
```

**File: `middleware/rateLimiter.js`**

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

module.exports = limiter;
```

Add to `server.js`:
```javascript
const rateLimiter = require('./middleware/rateLimiter');
app.use(rateLimiter);
```

### Add Input Validation (Backend)

```bash
npm install joi
```

---

## 🐛 Common Issues & Solutions

### Issue: MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running:
- Windows: Run `mongod`
- macOS: `brew services start mongodb-community`

### Issue: Port 5000 Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:** 
- Kill process: `lsof -ti:5000 | xargs kill -9`
- Or change port in `.env`

### Issue: CORS Error in Frontend
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution:** Check that Angular app URL matches CORS origin in `server.js`

### Issue: Token Not Persisting After Refresh
**Solution:** Token is stored in localStorage, check if it's accessible in DevTools

---

## ✅ Checklist

- [ ] Node.js installed
- [ ] MongoDB running
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] `.env` file created with correct values
- [ ] All component files created
- [ ] Backend running on port 5000
- [ ] Frontend running on port 4200
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can view dashboard with user info
- [ ] Can logout successfully
- [ ] Token persists in localStorage

---

## 📚 Next Steps

1. **Add Forgot Password Feature**
2. **Add Email Verification**
3. **Add Role-Based Access Control (RBAC)**
4. **Add User Profile Update**
5. **Add Refresh Token Rotation**
6. **Deploy to Production (Vercel, Heroku, AWS)**

---

## 🆘 Need Help?

Check the console for errors:
- **Backend**: Check terminal output
- **Frontend**: Check browser DevTools (F12) > Console tab
- **API**: Test with Postman before testing in Angular

Happy Coding! 🚀

