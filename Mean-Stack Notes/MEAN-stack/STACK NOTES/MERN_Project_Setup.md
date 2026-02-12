# Complete MERN Stack Login/Register Project with Angular v18

## Project Structure

```
mern-auth-project/
├── backend/
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── auth.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── controllers/
│   │   └── authController.js
│   ├── config/
│   │   └── db.js
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   └── [Angular v18 Project]
└── README.md
```

---

## BACKEND SETUP

### Step 1: Initialize Backend

```bash
mkdir mern-auth-project
cd mern-auth-project

# Create backend folder
mkdir backend
cd backend
npm init -y
```

### Step 2: Install Dependencies

```bash
npm install express mongoose dotenv cors bcryptjs jsonwebtoken
npm install --save-dev nodemon
```

### Step 3: Backend Files

**File: `package.json` (update scripts)**

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

**File: `.env`**

```
MONGODB_URI=mongodb://localhost:27017/mern-auth
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=5000
NODE_ENV=development
```

**File: `config/db.js`**

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

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
      select: false, // Don't return password by default
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
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

**File: `middleware/authMiddleware.js`**

```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.email = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

module.exports = authMiddleware;
```

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

    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
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
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'MERN Auth API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## FRONTEND SETUP (Angular v18)

### Step 1: Create Angular Project

```bash
cd ..
ng new frontend --routing --style=scss --skip-git
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install axios
```

### Step 3: Generate Components & Services

```bash
ng generate service services/auth --skip-tests
ng generate component components/login --skip-tests
ng generate component components/register --skip-tests
ng generate component components/dashboard --skip-tests
```

---

## Running the Project

### Backend (Terminal 1)

```bash
cd backend
npm install
# Make sure MongoDB is running
npm run dev
```

### Frontend (Terminal 2)

```bash
cd frontend
ng serve
```

Visit: `http://localhost:4200`

---

## Testing the API

Use Postman to test:

1. **Register**: POST http://localhost:5000/api/auth/register
   ```json
   {
     "fullName": "John Doe",
     "email": "john@example.com",
     "password": "password123",
     "confirmPassword": "password123"
   }
   ```

2. **Login**: POST http://localhost:5000/api/auth/login
   ```json
   {
     "email": "john@example.com",
     "password": "password123"
   }
   ```

3. **Get Current User**: GET http://localhost:5000/api/auth/me
   - Header: `Authorization: Bearer <token>`

---

## Key Features

✅ User Registration with validation  
✅ User Login with JWT authentication  
✅ Password hashing with bcryptjs  
✅ Protected routes with middleware  
✅ MongoDB database integration  
✅ Angular v18 standalone components  
✅ Responsive UI  
✅ Error handling  
✅ CORS enabled  
✅ Security best practices  

