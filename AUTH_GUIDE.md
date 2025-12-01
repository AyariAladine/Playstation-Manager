# 🔐 Authentication System Guide

## Overview

The PlayStation Shop now has a complete authentication system to protect your admin dashboard. Only authorized users can access the management features.

## Quick Start

### Step 1: Create the First Admin User

Run this command to create the initial admin account:

```powershell
node scripts/createAdmin.js
```

**Default Credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANT**: Change this password immediately after first login!

### Step 2: Login

1. Start the app: `npm run dev`
2. Open: http://localhost:3000
3. You'll be automatically redirected to the login page
4. Enter the credentials above
5. Click "Login"

### Step 3: Access Dashboard

After successful login, you'll be redirected to the **Dashboard** (Statistics page) where you can:
- View today's and monthly earnings
- See session statistics
- Navigate to all management pages

## Features

### 🔒 Protected Routes

All these routes require authentication:
- `/dashboard` - Main dashboard with statistics
- `/playstations` - PlayStation management
- `/players` - Player management
- `/games` - Game management
- `/sessions` - Session history
- `/settings` - User management (create/edit/delete admin users)

### 🚪 Login System

- **Login Page**: `/login`
- **Logout**: Click "Logout" in the sidebar
- **Session**: Stays active for 7 days
- **Auto-redirect**: 
  - If not logged in → redirected to `/login`
  - If already logged in → redirected to `/dashboard`

### 👥 User Management

Navigate to **Settings** in the sidebar to:
- **Create new users**: Add additional admin accounts
- **Edit users**: Update username, name, or password
- **Delete users**: Remove user accounts
- **View all users**: See all registered admins

#### Creating Additional Users

1. Go to `/settings`
2. Fill in the form:
   - **Name**: Full name (e.g., "Ahmed Manager")
   - **Username**: Login username (e.g., "ahmed")
   - **Password**: Secure password
3. Click "Create"

#### Editing Users

1. Go to `/settings`
2. Click "Edit" on any user
3. Update the fields
4. Leave password blank to keep current password
5. Click "Update"

## Security Features

### ✅ Implemented

- **Session-based authentication** using HTTP-only cookies
- **Protected routes** with Next.js middleware
- **Automatic redirects** for unauthorized access
- **Password visibility toggle** on forms
- **Secure cookie settings** (HttpOnly, SameSite)

### ⚠️ Production Recommendations

For production deployment, implement these enhancements:

1. **Password Hashing**: Use `bcrypt` instead of plain text
   ```powershell
   npm install bcrypt
   ```
   Update `authService.ts` to hash passwords:
   ```typescript
   import bcrypt from 'bcrypt';
   
   // When creating user:
   const hashedPassword = await bcrypt.hash(password, 10);
   
   // When verifying:
   const isValid = await bcrypt.compare(password, user.password);
   ```

2. **JWT Tokens**: Consider using JWT for stateless auth
   ```powershell
   npm install jsonwebtoken
   ```

3. **Environment Variables**: Store secrets in `.env.local`
   ```env
   JWT_SECRET=your-super-secret-key-here
   SESSION_SECRET=another-secret-key
   ```

4. **Rate Limiting**: Prevent brute force attacks
   ```powershell
   npm install express-rate-limit
   ```

5. **2FA (Two-Factor Authentication)**: Add extra security layer

## API Endpoints

### Authentication

- **POST** `/api/auth/login`
  ```json
  { "username": "admin", "password": "admin123" }
  ```
  Response: `{ "success": true, "user": {...} }`

- **POST** `/api/auth/logout`
  Response: `{ "success": true }`

- **GET** `/api/auth/session`
  Response: `{ "authenticated": true, "user": {...} }`

### User Management

- **GET** `/api/auth/users` - List all users (excluding passwords)
- **POST** `/api/auth/users` - Create new user
  ```json
  {
    "username": "newuser",
    "password": "password123",
    "name": "New User"
  }
  ```
- **PUT** `/api/auth/users` - Update user
  ```json
  {
    "id": "userId",
    "username": "updated",
    "name": "Updated Name",
    "password": "newpassword" // optional
  }
  ```
- **DELETE** `/api/auth/users?id=userId` - Delete user

## Flow Diagram

```
┌─────────────┐
│   Visitor   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  / (root)       │
│  Checks session │
└──────┬──────────┘
       │
       ├─── Not logged in ───► /login (Login Page)
       │                              │
       │                              ▼
       │                      Enter credentials
       │                              │
       │                              ▼
       │                      POST /api/auth/login
       │                              │
       │                              ▼
       │                      Create session cookie
       │                              │
       └─── Logged in ───────────────┘
                │
                ▼
        /dashboard (Statistics)
                │
                ├─► /playstations
                ├─► /players
                ├─► /games
                ├─► /sessions
                ├─► /settings
                │
                ▼
        Click "Logout"
                │
                ▼
        POST /api/auth/logout
                │
                ▼
        Destroy session
                │
                ▼
        Redirect to /login
```

## Troubleshooting

### Cannot Login

**Problem**: "Invalid credentials" error

**Solutions**:
1. Make sure you ran `node scripts/createAdmin.js`
2. Check MongoDB is running
3. Verify credentials are correct (default: admin/admin123)
4. Check browser console for errors

### Session Expires Too Quickly

**Solution**: Update session duration in `lib/auth.ts`:
```typescript
maxAge: 60 * 60 * 24 * 30, // 30 days instead of 7
```

### Redirect Loop

**Problem**: Page keeps redirecting

**Solutions**:
1. Clear browser cookies
2. Check middleware.ts is properly configured
3. Restart the dev server

### Cannot Access Settings

**Problem**: 404 on `/settings`

**Solution**: Make sure `app/settings/page.tsx` exists and restart server

## File Structure

```
my-playstation-app/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── login/route.ts       # Login endpoint
│   │       ├── logout/route.ts      # Logout endpoint
│   │       ├── session/route.ts     # Check session
│   │       └── users/route.ts       # User CRUD
│   ├── login/page.tsx               # Login form
│   ├── dashboard/page.tsx           # Main dashboard (stats)
│   ├── settings/page.tsx            # User management
│   └── layout.tsx                   # Conditional sidebar
├── components/
│   └── Sidebar.tsx                  # Navigation with logout
├── lib/
│   ├── auth.ts                      # Session management
│   ├── models/User.ts               # User schema
│   └── services/authService.ts      # Auth logic
├── middleware.ts                    # Route protection
└── scripts/
    └── createAdmin.js               # Initial user setup
```

## Testing Checklist

- [ ] Can create first admin user
- [ ] Can login with correct credentials
- [ ] Cannot login with wrong credentials
- [ ] Redirects to dashboard after login
- [ ] Cannot access protected routes without login
- [ ] Can access all pages after login
- [ ] Can create new users in settings
- [ ] Can edit existing users
- [ ] Can delete users
- [ ] Can logout successfully
- [ ] Redirects to login after logout
- [ ] Session persists after page refresh
- [ ] Cannot access dashboard when logged out

## Next Steps

1. **Change default password** in Settings
2. **Create additional users** if needed
3. **Implement bcrypt** for production
4. **Set up HTTPS** when deploying
5. **Add role-based permissions** (optional)
6. **Enable 2FA** for extra security (optional)

---

**Security Note**: This implementation uses plain text passwords for simplicity. For production, always use bcrypt or another secure hashing algorithm!
