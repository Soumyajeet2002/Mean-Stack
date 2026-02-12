# 📱 MERN Auth Project - Visual Guide & Component Flow

## 🎨 UI Component Layouts

### Login Page

```
┌────────────────────────────────────┐
│                                    │
│     ╔════════════════════════╗    │
│     ║   Welcome Back         ║    │
│     ║  Login to your account ║    │
│     ║ ┌──────────────────────┐║    │
│     ║ │ Email Address:       │║    │
│     ║ │ [____________________]║    │
│     ║ │                      │║    │
│     ║ │ Password:            │║    │
│     ║ │ [____________________] 👁  ║    │
│     ║ │                      │║    │
│     ║ │ ⚠ Error Message      │║    │
│     ║ │                      │║    │
│     ║ │ [    LOGIN BUTTON    ]║    │
│     ║ │                      │║    │
│     ║ │ Don't have account?  │║    │
│     ║ │ Create one here  →   │║    │
│     ║ └──────────────────────┘║    │
│     ╚════════════════════════╝    │
│                                    │
│ Gradient Background (Purple)       │
└────────────────────────────────────┘
```

### Register Page

```
┌────────────────────────────────────┐
│                                    │
│     ╔════════════════════════╗    │
│     ║   Create Account       ║    │
│     ║   Join us today        ║    │
│     ║ ┌──────────────────────┐║    │
│     ║ │ Full Name:           │║    │
│     ║ │ [____________________]║    │
│     ║ │                      │║    │
│     ║ │ Email Address:       │║    │
│     ║ │ [____________________]║    │
│     ║ │                      │║    │
│     ║ │ Password:            │║    │
│     ║ │ [____________________] 👁  ║    │
│     ║ │                      │║    │
│     ║ │ Confirm Password:    │║    │
│     ║ │ [____________________] 👁  ║    │
│     ║ │                      │║    │
│     ║ │ ⚠ Error Message      │║    │
│     ║ │ ✓ Success Message    │║    │
│     ║ │                      │║    │
│     ║ │ [   REGISTER BUTTON  ]║    │
│     ║ │                      │║    │
│     ║ │ Already have account?│║    │
│     ║ │ Sign in here  →      │║    │
│     ║ └──────────────────────┘║    │
│     ╚════════════════════════╝    │
│                                    │
│ Gradient Background (Pink/Red)     │
└────────────────────────────────────┘
```

### Dashboard Page

```
┌────────────────────────────────────┐
│ Dashboard              [LOGOUT]    │
│ ╔════════════════════════════════╗ │
│ ║  Welcome to Dashboard          ║ │
│ ║                                ║ │
│ ║ ╔──────────────────────────╗  ║ │
│ ║ ║ User Information         ║  ║ │
│ ║ ║                          ║  ║ │
│ ║ ║ Full Name:  John Doe     ║  ║ │
│ ║ ║ Email:      john@ex.com  ║  ║ │
│ ║ ║ User ID:    507f1f77...  ║  ║ │
│ ║ ║                          ║  ║ │
│ ║ ╚──────────────────────────╝  ║ │
│ ║                                ║ │
│ ╚════════════════════════════════╝ │
│                                    │
└────────────────────────────────────┘
```

---

## 🔄 Component Interaction Flow

### Detailed Component Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   App Router (app.routes.ts)                    │
│  • '' → /login                                                   │
│  • /login → LoginComponent                                      │
│  • /register → RegisterComponent                                │
│  • /dashboard → DashboardComponent                              │
│  • ** → /login (wildcard)                                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│              AuthService (Core Business Logic)                   │
├──────────────────────────────────────────────────────────────────┤
│ Private State:                                                   │
│  • currentUserSubject$ - Observable<User | null>               │
│  • isAuthenticatedSubject$ - Observable<boolean>               │
│  • authToken - Stored in localStorage                           │
│  • currentUser - Stored in localStorage                         │
│                                                                  │
│ Public Methods:                                                 │
│  • register(name, email, pass, confirmPass) → Promise          │
│  • login(email, password) → Promise                            │
│  • logout() → void                                             │
│  • getCurrentUser() → Promise                                  │
│  • isAuthenticated() → boolean                                 │
│  • getStoredUser() → User | null                              │
└──────────────────────────────────────────────────────────────────┘

        ↑             ↑              ↑
        |             |              |
        |             |              |
        ↓             ↓              ↓

┌────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  LoginComp     │ │ RegisterComp     │ │ DashboardComp    │
├────────────────┤ ├──────────────────┤ ├──────────────────┤
│ Properties:    │ │ Properties:      │ │ Properties:      │
│  • email       │ │  • fullName      │ │  • user          │
│  • password    │ │  • email         │ │  • isLoading     │
│  • isLoading   │ │  • password      │ │  • errorMsg      │
│  • errorMsg    │ │  • confirmPass   │ │                  │
│  • successMsg  │ │  • isLoading     │ │ Methods:         │
│  • showPass    │ │  • errorMsg      │ │  • ngOnInit()    │
│                │ │  • successMsg    │ │  • logout()      │
│ Methods:       │ │  • showPass      │ │  • loadUser()    │
│  • onSubmit()  │ │  • showConfirm   │ │                  │
│  • validate()  │ │                  │ │                  │
│  • togglePass()│ │ Methods:         │ │                  │
│                │ │  • onSubmit()    │ │                  │
│                │ │  • validate()    │ │                  │
│                │ │  • togglePass()  │ │                  │
│                │ │  • toggleConfirm()                    │
└────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## 🔐 Authentication Flow Detailed

### Registration Process

```
1. User fills form on RegisterComponent
   ├─ fullName: "John Doe"
   ├─ email: "john@example.com"
   ├─ password: "password123"
   └─ confirmPassword: "password123"

2. User clicks Register button
   └─ onSubmit() triggers

3. Client-side validation in RegisterComponent
   ├─ Check all fields filled
   ├─ Validate email format
   ├─ Check password length (>= 6)
   ├─ Check passwords match
   └─ If any fail → Show error message → Stop

4. If validation passes:
   └─ Call authService.register()

5. AuthService calls Axios to POST /api/auth/register
   ├─ Headers: { Content-Type: application/json }
   ├─ Body: { fullName, email, password, confirmPassword }
   └─ Waiting for response...

6. Backend receives request in authController.register()
   ├─ Validate input again (server-side)
   ├─ Check if email already exists
   │  ├─ If exists → Return 409: "Email already registered"
   │  └─ Stop
   ├─ Validate password format
   ├─ Create new User document
   ├─ Pre-save hook hashes password with bcryptjs
   ├─ Save to MongoDB
   ├─ Generate JWT token (7 day expiry)
   ├─ Return 201: { success: true, data: { userId, fullName, email, token } }
   └─ Wait for frontend response...

7. Frontend receives response in AuthService
   ├─ Check if response.success === true
   ├─ Save token to localStorage['authToken']
   ├─ Save user to localStorage['currentUser']
   ├─ Update BehaviorSubjects (currentUser$, isAuthenticated$)
   └─ Return promise to RegisterComponent

8. RegisterComponent receives promise
   ├─ Show success message: "User registered successfully"
   ├─ Wait 1.5 seconds
   └─ Redirect to /dashboard using router.navigate()

9. DashboardComponent initializes (ngOnInit)
   ├─ Check if authenticated using authService.isAuthenticated()
   ├─ If not authenticated → Redirect to /login
   ├─ If authenticated → Load user data
   └─ Display user information

✓ Registration Complete!
```

### Login Process

```
1. User fills form on LoginComponent
   ├─ email: "john@example.com"
   └─ password: "password123"

2. User clicks Login button
   └─ onSubmit() triggers

3. Client-side validation in LoginComponent
   ├─ Check email filled and valid format
   ├─ Check password filled
   └─ If any fail → Show error message → Stop

4. If validation passes:
   └─ Call authService.login(email, password)

5. AuthService calls Axios to POST /api/auth/login
   ├─ Headers: { Content-Type: application/json }
   ├─ Body: { email, password }
   └─ Waiting for response...

6. Backend receives request in authController.login()
   ├─ Validate input
   ├─ Find user by email in MongoDB
   │  ├─ If not found → Return 401: "Invalid email or password"
   │  └─ Stop
   ├─ Compare provided password with hashed password using bcryptjs
   │  ├─ If doesn't match → Return 401: "Invalid email or password"
   │  └─ Stop
   ├─ Check if user isActive === true
   │  ├─ If false → Return 403: "Account deactivated"
   │  └─ Stop
   ├─ Generate JWT token (7 day expiry)
   ├─ Return 200: { success: true, data: { userId, fullName, email, token } }
   └─ Wait for frontend response...

7. Frontend receives response in AuthService
   ├─ Check if response.success === true
   ├─ Save token to localStorage['authToken']
   ├─ Save user to localStorage['currentUser']
   ├─ Update BehaviorSubjects (currentUser$, isAuthenticated$)
   └─ Return promise to LoginComponent

8. LoginComponent receives promise
   ├─ Show success message: "Login successful"
   ├─ Wait 1.5 seconds
   └─ Redirect to /dashboard using router.navigate()

9. DashboardComponent initializes (ngOnInit)
   ├─ Check if authenticated
   ├─ Load user data from authService
   └─ Display user information

✓ Login Complete!
```

### Protected Route Access

```
DashboardComponent → GET /api/auth/me

1. Axios interceptor adds token to request
   ├─ Get token from localStorage
   ├─ Add header: Authorization: Bearer <token>
   └─ Send request with token

2. Backend receives request in authMiddleware
   ├─ Extract token from Authorization header
   ├─ Verify token using jwt.verify()
   │  ├─ If invalid → Return 401: "Invalid token"
   │  ├─ If expired → Return 401: "Token expired"
   │  └─ Stop
   ├─ Decode token → Get userId & email
   ├─ Add userId and email to req object
   └─ Call next() to proceed to controller

3. Backend in authController.getCurrentUser()
   ├─ Get userId from req (set by middleware)
   ├─ Find user by userId in MongoDB
   ├─ Return 200: { success: true, data: { userId, fullName, email, createdAt } }
   └─ Send to frontend

4. Frontend receives protected user data
   ├─ Update user component properties
   └─ Display user information

✓ Protected Route Access Complete!
```

### Logout Process

```
1. User clicks Logout button on DashboardComponent
   └─ logout() method triggers

2. DashboardComponent calls authService.logout()

3. AuthService.logout() executes
   ├─ Remove token from localStorage['authToken']
   ├─ Remove user from localStorage['currentUser']
   ├─ Update currentUserSubject$ → null
   ├─ Update isAuthenticatedSubject$ → false
   └─ Complete

4. DashboardComponent receives logout completion
   ├─ Router redirects to /login
   └─ Stop

✓ Logout Complete!
```

---

## 🔄 State Management Flow

### AuthService State

```
Initial State (App Load):
├─ Check localStorage for token
├─ If token exists:
│  ├─ currentUserSubject$ = parsed user from localStorage
│  └─ isAuthenticatedSubject$ = true
└─ If no token:
   ├─ currentUserSubject$ = null
   └─ isAuthenticatedSubject$ = false

After Registration/Login:
├─ Token saved to localStorage
├─ User data saved to localStorage
├─ currentUserSubject$ = new user data (emits)
└─ isAuthenticatedSubject$ = true (emits)

After Logout:
├─ Token removed from localStorage
├─ User data removed from localStorage
├─ currentUserSubject$ = null (emits)
└─ isAuthenticatedSubject$ = false (emits)

Components Subscribe to Observable:
├─ authService.currentUser$ → Get user data
├─ authService.isAuthenticated$ → Check if logged in
└─ Automatically update when state changes
```

---

## 📊 Data Flow Through Layers

```
┌─────────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER (Angular Components)                    │
│                                                             │
│ LoginComponent / RegisterComponent / DashboardComponent    │
│ ├─ Display form/data to user                               │
│ ├─ Capture user input                                       │
│ └─ Call AuthService methods                                │
└─────────────┬───────────────────────────────────────────────┘
              │ HTTP Request with JSON
              ↓
┌─────────────────────────────────────────────────────────────┐
│ COMMUNICATION LAYER (Axios Interceptor)                    │
│                                                             │
│ ├─ Attach Authorization header with token                  │
│ ├─ Serialize request body to JSON                          │
│ └─ Handle response & errors                                │
└─────────────┬───────────────────────────────────────────────┘
              │ HTTP over network
              ↓
┌─────────────────────────────────────────────────────────────┐
│ API LAYER (Express.js Routes & Middleware)                 │
│                                                             │
│ CORS Middleware → JSON Parser → Auth Middleware            │
│ ├─ Verify token (if protected route)                       │
│ └─ Add user info to request                                │
└─────────────┬───────────────────────────────────────────────┘
              │ Route matched
              ↓
┌─────────────────────────────────────────────────────────────┐
│ BUSINESS LOGIC LAYER (Controllers)                         │
│                                                             │
│ authController (register, login, getCurrentUser)           │
│ ├─ Validate input                                          │
│ ├─ Apply business rules                                    │
│ └─ Prepare response                                        │
└─────────────┬───────────────────────────────────────────────┘
              │
              ├─────────────────────┐
              ↓                     ↓
┌──────────────────────┐  ┌──────────────────────┐
│ DATABASE LAYER       │  │ UTILITY LAYER        │
│ (MongoDB)            │  │ (bcryptjs, jwt)      │
│                      │  │                      │
│ Users Collection     │  │ Password Hashing     │
│ ├─ Find             │  │ Token Generation     │
│ ├─ Create           │  │ Token Verification   │
│ └─ Update           │  │                      │
└──────────────────────┘  └──────────────────────┘
              │                     │
              └─────────────┬───────┘
                           │
                    Response Data
                           │
                           ↓
              Return to API → Axios → Component
                           │
                           ↓
              Update Component State
                           │
                           ↓
              Display to User
```

---

## 🧬 Class & Interface Definitions

### User Interface (Frontend)

```typescript
interface User {
  userId: string;
  fullName: string;
  email: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    fullName: string;
    email: string;
    token: string;
  };
}
```

### User Schema (Backend - MongoDB)

```javascript
{
  _id: ObjectId,           // MongoDB auto-generated
  fullName: String,        // Required, 2-50 chars
  email: String,           // Required, unique, valid format
  password: String,        // Required, hashed
  isActive: Boolean,       // Default: true
  createdAt: Date,         // Auto, set on creation
  updatedAt: Date          // Auto, updated on change
}
```

---

## 🎯 Key Takeaways

1. **Frontend** handles UI and user input
2. **AuthService** manages API communication and state
3. **Backend** handles business logic and database
4. **JWT tokens** maintain session without server storage
5. **BehaviorSubjects** notify components of state changes
6. **Middleware** protects routes and verifies tokens
7. **LocalStorage** persists authentication data
8. **Validators** ensure data integrity at each layer

---

**This visual guide helps understand the complete flow of the authentication system!** 🎓

