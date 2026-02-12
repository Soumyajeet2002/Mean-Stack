# 🚀 Angular Project Setup

A modern Angular application built with a scalable, production-ready foundation.

---

## 📦 Tech Stack

* **Angular 18**
* **Angular CDK**
* **RxJS**
* **Bootstrap 5**
* **Bootstrap Icons**
* **GSAP (Animations)**
* **ESLint**
* **Prettier**
* **Husky**

---

## ⚙️ Getting Started

### 1️⃣ Clone the Repository

```bash
git clone <your-repo-url>
cd <project-folder>
```

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Run Development Server

```bash
ng serve
```

Open:

```
http://localhost:4200
```

---

## 🏗️ Project Structure

```
src/app
│
├── core/        # Singleton services, interceptors
├── shared/      # Reusable components, pipes, directives
├── features/    # Feature-based modules/components
├── layout/      # Navbar, sidebar, footer
└── models/      # Interfaces & types
```

---

## 🧹 Code Quality

### Lint

```bash
ng lint
```

### Format

```bash
npx prettier --write .
```

---

## 📦 Installed Libraries

### UI & Styling

* bootstrap
* bootstrap-icons

### Angular Utilities

* @angular/cdk
* rxjs

### Animations

* gsap

### Code Quality

* @angular-eslint
* prettier
* husky

---

## 🔥 Best Practices

✅ Follow feature-based architecture
✅ Use standalone components
✅ Keep shared components reusable
✅ Avoid unnecessary dependencies
✅ Always match Angular package versions

---

## 🚀 Production Build

```bash
ng build --configuration production
```

Build output:

```
dist/
```

---

## 👨‍💻 Recommended VS Code Extensions

* Angular Language Service
* ESLint
* Prettier
* GitLens

---

## 📌 Notes

* Always install Angular packages with matching major versions.
* Prefer Angular CDK over heavy UI libraries when possible.
* Keep the dependency list minimal for better performance.

---

## 🏆 Project Status

✅ Production-ready foundation
✅ Scalable architecture
✅ Modern Angular practices

---
