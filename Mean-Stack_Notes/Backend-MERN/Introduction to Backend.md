# Backend
## First: Why Do We Need Login & Tokens?
So we need:
1. User logs in
2. Server verifies user
3. Server gives a token
4. User sends token with every request
5. Server checks token before allowing access
That’s authentication.
### What Is a Token?
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
### 🧠 Why Token Instead of Session?
Old way:
- Store session in server memory
Modern way:
- Token is stored on client
- Server stays stateless
- Better for scaling
- Works well with mobile apps
That’s why JWT is popular.


## 🚀 Now Let’s Build Login + Token in Your Project
We will:
1. Install JWT packages
2. Create User entity
3. Create Auth module
4. Hash password
5. Generate token on login
## 🟢 STEP 1 — Install Required Packages
Inside your project:

```
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt 

npm install -D @types/bcrypt

```

##  What these do:

| Package      | Purpose                   |
| ------------ | ------------------------- |
| @nestjs/jwt  | Create JWT tokens         |
| passport     | Authentication middleware |
| passport-jwt | JWT strategy              |
| bcrypt       | Hash passwords            |

## 🟢 STEP 2 — Create Users Module

```
nest g module users
nest g service users
nest g controller users

```

## 🟢 STEP 3 — Create User Entity

`src/users/user.entity.ts`

```
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';  
@Entity() 
export class User {   
@PrimaryGeneratedColumn()   
id: number;    
@Column({ unique: true })  
 email: string;   
  @Column()  
   password: string;
    }
```


## 🟢 STEP 4 — Register User Entity

In users.module.ts:

```
imports: [TypeOrmModule.forFeature([User])]
```
Also import UsersModule in `app.module.ts.

## 🟢 STEP 5 — Create Auth Module

```
nest g module auth
nest g service auth 
nest g controller auth
```

## 🟢 STEP 6 — Configure JWT in Auth Module

Open `auth.module.ts`:

```
import { Module } from '@nestjs/common'; import { JwtModule } from '@nestjs/jwt; 
import { UsersModule } from '../users/users.module;
import { AuthService } from './auth.service; 
import { AuthController } from './auth.controller;  

@Module({   
imports: [     
UsersModule,     
JwtModule.register({       
secret: 'supersecretkey',       
signOptions: { expiresIn: '1h' },     
}),   
],   
providers: [AuthService],   
controllers: [AuthController], 
}) 
export class AuthModule {}
```

## user.module.ts
```

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]) // 🔥 THIS IS REQUIRED
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}


```



# 🟢 STEP 7 — Register User (Hash Password)

In `users.service.ts`:

```
import * as bcrypt from 'bcrypt';  
async create(email: string, password: string) {   
const hashedPassword = await bcrypt.hash(password, 10);   
const user = this.userRepository.create({     
email,     
password: hashedPassword,   
});   
return this.userRepository.save(user); 
}
```




# 🟢 STEP 8 — Login & Generate Token

In `auth.service.ts`:

```
import { Injectable, UnauthorizedException } from '@nestjs/common'; 
import { JwtService } from '@nestjs/jwt'; 
import * as bcrypt from 'bcrypt';  
@Injectable() 
export class AuthService {   
constructor(     
private jwtService: JwtService,     
private usersService: UsersService,  
 ) {}    
async login(email: string, password: string) {     
const user = await this.usersService.findByEmail(email);      
if (!user) throw new UnauthorizedException();      
const isMatch = await bcrypt.compare(password, user.password);      
if (!isMatch) throw new UnauthorizedException();      
const payload = { sub: user.id, email: user.email };      
return {       
access_token: this.jwtService.sign(payload),     
};   
} 
}
```

# 🟢 STEP 9 — Create Login API

In `auth.controller.ts`:

```
@Post('login') 
login(@Body() body: { email: string; password: string }) {   
return this.authService.login(body.email, body.password); }
```