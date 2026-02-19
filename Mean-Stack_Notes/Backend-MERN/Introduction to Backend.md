# First: Why Do We Need Login & Tokens?
So we need:
1. User logs in
2. Server verifies user
3. Server gives a token
4. User sends token with every request
5. Server checks token before allowing access
That’s authentication.
## What Is a Token?
Most modern apps use:
👉 JWT (JSON Web Token)
A JWT has 3 parts:
`HEADER.PAYLOAD.SIGNATURE`
Example:
`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
It contains:
- user id
- email
- expiration time
- digital signature
## 🧠 Why Token Instead of Session?
Old way:
- Store session in server memory
Modern way:
- Token is stored on client
- Server stays stateless
- Better for scaling
- Works well with mobile apps
That’s why JWT is popular.


# 🚀 Now Let’s Build Login + Token in Your Project
We will:
1. Install JWT packages
2. Create User entity
3. Create Auth module
4. Hash password
5. Generate token on login
6. 