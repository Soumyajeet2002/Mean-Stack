# Angular v18 Frontend Complete Implementation

## Services

### File: `src/app/services/auth.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import axios, { AxiosInstance } from 'axios';

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

interface User {
  userId: string;
  fullName: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private api: AxiosInstance;
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(!!this.getToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.api = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  register(
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<AuthResponse> {
    return this.api
      .post<AuthResponse>('/register', {
        fullName,
        email,
        password,
        confirmPassword,
      })
      .then((response) => {
        if (response.data.success) {
          this.setToken(response.data.data.token);
          this.setUser(response.data.data);
          this.currentUserSubject.next(response.data.data);
          this.isAuthenticatedSubject.next(true);
        }
        return response.data;
      });
  }

  login(email: string, password: string): Promise<AuthResponse> {
    return this.api
      .post<AuthResponse>('/login', { email, password })
      .then((response) => {
        if (response.data.success) {
          this.setToken(response.data.data.token);
          this.setUser(response.data.data);
          this.currentUserSubject.next(response.data.data);
          this.isAuthenticatedSubject.next(true);
        }
        return response.data;
      });
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getCurrentUser(): Promise<{ success: boolean; data: User }> {
    return this.api.get('/me').then((response) => response.data);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  private setUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  private getUserFromStorage(): User | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  getStoredUser(): User | null {
    return this.getUserFromStorage();
  }
}
```

---

## Components

### File: `src/app/components/login/login.component.ts`

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit() {
    if (!this.validateForm()) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const response = await this.authService.login(this.email, this.password);

      if (response.success) {
        this.successMessage = response.message;
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      } else {
        this.errorMessage = response.message || 'Login failed';
      }
    } catch (error: any) {
      this.errorMessage =
        error.response?.data?.message || 'An error occurred during login';
    } finally {
      this.isLoading = false;
    }
  }

  validateForm(): boolean {
    if (!this.email.trim()) {
      this.errorMessage = 'Email is required';
      return false;
    }
    if (!this.password) {
      this.errorMessage = 'Password is required';
      return false;
    }
    return true;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
```

### File: `src/app/components/login/login.component.html`

```html
<div class="login-container">
  <div class="login-card">
    <h1>Welcome Back</h1>
    <p class="subtitle">Login to your account</p>

    <form (ngSubmit)="onSubmit()">
      <!-- Email Input -->
      <div class="form-group">
        <label for="email">Email Address</label>
        <input
          type="email"
          id="email"
          placeholder="Enter your email"
          [(ngModel)]="email"
          name="email"
          required
        />
      </div>

      <!-- Password Input -->
      <div class="form-group">
        <label for="password">Password</label>
        <div class="password-wrapper">
          <input
            [type]="showPassword ? 'text' : 'password'"
            id="password"
            placeholder="Enter your password"
            [(ngModel)]="password"
            name="password"
            required
          />
          <button
            type="button"
            class="toggle-password"
            (click)="togglePasswordVisibility()"
          >
            {{ showPassword ? '👁️' : '👁️‍🗨️' }}
          </button>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" class="alert alert-error">
        {{ errorMessage }}
      </div>

      <!-- Success Message -->
      <div *ngIf="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>

      <!-- Submit Button -->
      <button type="submit" [disabled]="isLoading" class="btn btn-primary">
        {{ isLoading ? 'Logging in...' : 'Login' }}
      </button>
    </form>

    <!-- Register Link -->
    <p class="register-link">
      Don't have an account?
      <a routerLink="/register">Create one here</a>
    </p>
  </div>
</div>
```

### File: `src/app/components/login/login.component.scss`

```scss
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 40px;
  width: 100%;
  max-width: 400px;

  h1 {
    text-align: center;
    color: #333;
    margin-bottom: 10px;
    font-size: 28px;
  }

  .subtitle {
    text-align: center;
    color: #666;
    margin-bottom: 30px;
    font-size: 14px;
  }

  .form-group {
    margin-bottom: 20px;

    label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: 500;
      font-size: 14px;
    }

    input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.3s;

      &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
    }
  }

  .password-wrapper {
    position: relative;

    .toggle-password {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      padding: 0;
    }

    input {
      padding-right: 40px;
    }
  }

  .alert {
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 20px;
    font-size: 14px;

    &.alert-error {
      background-color: #fee;
      color: #c33;
      border: 1px solid #fcc;
    }

    &.alert-success {
      background-color: #efe;
      color: #3c3;
      border: 1px solid #cfc;
    }
  }

  .btn {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;

    &.btn-primary {
      background-color: #667eea;
      color: white;

      &:hover:not(:disabled) {
        background-color: #5568d3;
        transform: translateY(-2px);
        box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }

  .register-link {
    text-align: center;
    margin-top: 20px;
    color: #666;
    font-size: 14px;

    a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;

    h1 {
      font-size: 24px;
    }
  }
}
```

---

### File: `src/app/components/register/register.component.ts`

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  fullName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit() {
    if (!this.validateForm()) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const response = await this.authService.register(
        this.fullName,
        this.email,
        this.password,
        this.confirmPassword
      );

      if (response.success) {
        this.successMessage = response.message;
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      } else {
        this.errorMessage = response.message || 'Registration failed';
      }
    } catch (error: any) {
      this.errorMessage =
        error.response?.data?.message ||
        'An error occurred during registration';
    } finally {
      this.isLoading = false;
    }
  }

  validateForm(): boolean {
    if (!this.fullName.trim()) {
      this.errorMessage = 'Full name is required';
      return false;
    }
    if (this.fullName.trim().length < 2) {
      this.errorMessage = 'Full name must be at least 2 characters';
      return false;
    }
    if (!this.email.trim()) {
      this.errorMessage = 'Email is required';
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email';
      return false;
    }
    if (!this.password) {
      this.errorMessage = 'Password is required';
      return false;
    }
    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return false;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return false;
    }
    return true;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
```

### File: `src/app/components/register/register.component.html`

```html
<div class="register-container">
  <div class="register-card">
    <h1>Create Account</h1>
    <p class="subtitle">Join us today</p>

    <form (ngSubmit)="onSubmit()">
      <!-- Full Name Input -->
      <div class="form-group">
        <label for="fullName">Full Name</label>
        <input
          type="text"
          id="fullName"
          placeholder="Enter your full name"
          [(ngModel)]="fullName"
          name="fullName"
          required
        />
      </div>

      <!-- Email Input -->
      <div class="form-group">
        <label for="email">Email Address</label>
        <input
          type="email"
          id="email"
          placeholder="Enter your email"
          [(ngModel)]="email"
          name="email"
          required
        />
      </div>

      <!-- Password Input -->
      <div class="form-group">
        <label for="password">Password</label>
        <div class="password-wrapper">
          <input
            [type]="showPassword ? 'text' : 'password'"
            id="password"
            placeholder="Enter password (min 6 characters)"
            [(ngModel)]="password"
            name="password"
            required
          />
          <button
            type="button"
            class="toggle-password"
            (click)="togglePasswordVisibility()"
          >
            {{ showPassword ? '👁️' : '👁️‍🗨️' }}
          </button>
        </div>
      </div>

      <!-- Confirm Password Input -->
      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <div class="password-wrapper">
          <input
            [type]="showConfirmPassword ? 'text' : 'password'"
            id="confirmPassword"
            placeholder="Confirm password"
            [(ngModel)]="confirmPassword"
            name="confirmPassword"
            required
          />
          <button
            type="button"
            class="toggle-password"
            (click)="toggleConfirmPasswordVisibility()"
          >
            {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
          </button>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" class="alert alert-error">
        {{ errorMessage }}
      </div>

      <!-- Success Message -->
      <div *ngIf="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>

      <!-- Submit Button -->
      <button type="submit" [disabled]="isLoading" class="btn btn-primary">
        {{ isLoading ? 'Creating Account...' : 'Register' }}
      </button>
    </form>

    <!-- Login Link -->
    <p class="login-link">
      Already have an account?
      <a routerLink="/login">Sign in here</a>
    </p>
  </div>
</div>
```

### File: `src/app/components/register/register.component.scss`

```scss
.register-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 20px;
}

.register-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 40px;
  width: 100%;
  max-width: 450px;

  h1 {
    text-align: center;
    color: #333;
    margin-bottom: 10px;
    font-size: 28px;
  }

  .subtitle {
    text-align: center;
    color: #666;
    margin-bottom: 30px;
    font-size: 14px;
  }

  .form-group {
    margin-bottom: 20px;

    label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: 500;
      font-size: 14px;
    }

    input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.3s;

      &:focus {
        outline: none;
        border-color: #f5576c;
        box-shadow: 0 0 0 3px rgba(245, 87, 108, 0.1);
      }
    }
  }

  .password-wrapper {
    position: relative;

    .toggle-password {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      padding: 0;
    }

    input {
      padding-right: 40px;
    }
  }

  .alert {
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 20px;
    font-size: 14px;

    &.alert-error {
      background-color: #fee;
      color: #c33;
      border: 1px solid #fcc;
    }

    &.alert-success {
      background-color: #efe;
      color: #3c3;
      border: 1px solid #cfc;
    }
  }

  .btn {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;

    &.btn-primary {
      background-color: #f5576c;
      color: white;

      &:hover:not(:disabled) {
        background-color: #e73e52;
        transform: translateY(-2px);
        box-shadow: 0 5px 20px rgba(245, 87, 108, 0.4);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }

  .login-link {
    text-align: center;
    margin-top: 20px;
    color: #666;
    font-size: 14px;

    a {
      color: #f5576c;
      text-decoration: none;
      font-weight: 600;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

@media (max-width: 480px) {
  .register-card {
    padding: 30px 20px;

    h1 {
      font-size: 24px;
    }
  }
}
```

---

### File: `src/app/components/dashboard/dashboard.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface User {
  userId: string;
  fullName: string;
  email: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.loadCurrentUser();
  }

  async loadCurrentUser() {
    try {
      if (!this.authService.isAuthenticated()) {
        this.router.navigate(['/login']);
        return;
      }

      this.user = this.authService.getStoredUser();
      const response = await this.authService.getCurrentUser();

      if (response.success) {
        this.user = response.data;
      }
    } catch (error: any) {
      this.errorMessage =
        error.response?.data?.message || 'Failed to load user data';
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } finally {
      this.isLoading = false;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
```

### File: `src/app/components/dashboard/dashboard.component.html`

```html
<div class="dashboard-container">
  <div class="dashboard-card">
    <div class="header">
      <h1>Welcome to Dashboard</h1>
      <button (click)="logout()" class="btn btn-logout">Logout</button>
    </div>

    <div *ngIf="isLoading" class="loading">
      <p>Loading user data...</p>
    </div>

    <div *ngIf="!isLoading && errorMessage" class="alert alert-error">
      {{ errorMessage }}
    </div>

    <div *ngIf="!isLoading && user" class="user-info">
      <div class="info-card">
        <h2>User Information</h2>
        <div class="info-item">
          <span class="label">Full Name:</span>
          <span class="value">{{ user.fullName }}</span>
        </div>
        <div class="info-item">
          <span class="label">Email:</span>
          <span class="value">{{ user.email }}</span>
        </div>
        <div class="info-item">
          <span class="label">User ID:</span>
          <span class="value mono">{{ user.userId }}</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

### File: `src/app/components/dashboard/dashboard.component.scss`

```scss
.dashboard-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.dashboard-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 40px;
  width: 100%;
  max-width: 500px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;

    h1 {
      color: #333;
      margin: 0;
      font-size: 28px;
    }

    .btn-logout {
      background-color: #f5576c;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;

      &:hover {
        background-color: #e73e52;
        transform: translateY(-2px);
      }
    }
  }

  .loading,
  .alert {
    padding: 20px;
    text-align: center;
    border-radius: 6px;
    margin-bottom: 20px;
    font-size: 14px;
  }

  .alert-error {
    background-color: #fee;
    color: #c33;
    border: 1px solid #fcc;
  }

  .user-info {
    .info-card {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 8px;
      border: 1px solid #eee;

      h2 {
        color: #333;
        margin-top: 0;
        margin-bottom: 20px;
        font-size: 20px;
      }

      .info-item {
        display: flex;
        justify-content: space-between;
        padding: 15px 0;
        border-bottom: 1px solid #eee;

        &:last-child {
          border-bottom: none;
        }

        .label {
          font-weight: 600;
          color: #666;
        }

        .value {
          color: #333;

          &.mono {
            font-family: monospace;
            font-size: 12px;
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .dashboard-card {
    padding: 30px 20px;

    .header {
      flex-direction: column;
      gap: 15px;

      h1 {
        font-size: 24px;
      }

      .btn-logout {
        width: 100%;
      }
    }
  }
}
```

---

## App Routing

### File: `src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: '/login' },
];
```

---

## Main App Component

### File: `src/app/app.component.ts`

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'MERN Auth App';
}
```

### File: `src/app/app.component.html`

```html
<router-outlet></router-outlet>
```

### File: `src/app/app.component.scss`

```scss
:host {
  display: block;
}
```

---

## Main CSS

### File: `src/styles.scss`

```scss
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
}

a {
  text-decoration: none;
  color: inherit;
}

button {
  font-family: inherit;
}

input, textarea, select {
  font-family: inherit;
}
```

---

## Environment Configuration

### File: `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
};
```

### File: `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-url.com/api',
};
```

