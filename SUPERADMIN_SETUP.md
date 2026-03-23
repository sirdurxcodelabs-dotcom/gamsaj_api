# Super Admin Setup Guide

## Overview
This guide explains how to seed the database with permissions, roles, and a Super Admin user.

## What Gets Seeded

### 1. Permissions (38 total)
All system permissions across 5 categories:
- Main (Dashboard, Calendar, Email, Invoices)
- App (Projects, Blogs, Company Info)
- Content Management
- Pages (Profile, Starter, Maintenance, Error)
- Admin (Users, Roles & Permissions)

### 2. Roles (18 total)
Based on GAMSAJ organizational structure:
- **Super Admin** - Full system access
- Executive Level (Chairman, Managing Director, Technical Director)
- Management Level (Business Dev Manager, Head of Finance, Admin Manager)
- Technical Level (Chief Engineer, Project Manager, Engineers, etc.)
- Support Staff (Quantity Surveyor, Technician, Artisan, Subcontractor)

### 3. Super Admin User
A default Super Admin account with full permissions.

## How to Seed

### Option 1: Seed Everything (Recommended)
Seeds permissions, roles, AND Super Admin user:

```bash
cd backend
npm run seed:superadmin
```

### Option 2: Seed Only Permissions & Roles
If you want to create users manually:

```bash
cd backend
npm run seed 
```

## Super Admin Credentials

After running `npm run seed:superadmin`, you can login with:

```
Email: superadmin@gamsaj.com
Password: SuperAdmin@123
```

**⚠️ IMPORTANT: Change this password immediately after first login!**

## What the Script Does

1. **Connects to MongoDB** using `MONGODB_URI` from `.env`
2. **Clears existing data** (permissions, roles, users with superadmin email)
3. **Seeds 38 permissions** from `config/permissions.js`
4. **Seeds 18 roles** from `config/roleTemplates.js`
5. **Finds Super Admin role** (slug: `super-admin`)
6. **Creates Super Admin user** with:
   - Name: Super Admin
   - Email: superadmin@gamsaj.com
   - Password: SuperAdmin@123 (hashed)
   - Role: Super Admin (with all permissions)
   - Verified: true
   - Active: true

## Expected Output

```
✅ MongoDB Connected
✅ Seeded 38 permissions
✅ Seeded 18 roles

🔍 Found Super Admin Role:
   ID: 65f8a1b2c3d4e5f6g7h8i9j0
   Name: Super Admin
   Permissions: 38

✅ Super Admin User Created Successfully!
   Name: Super Admin
   Email: superadmin@gamsaj.com
   Password: SuperAdmin@123
   Role: Super Admin
   Permissions: 38

📊 Seeding Summary:
   ✅ Permissions: 38
   ✅ Roles: 18
   ✅ Super Admin User: Created/Updated

🎉 Database seeding completed successfully!

🔐 Login Credentials:
   Email: superadmin@gamsaj.com
   Password: SuperAdmin@123

⚠️  IMPORTANT: Change the password after first login!
```

## Super Admin Capabilities

The Super Admin user has ALL permissions and can:

### User Management
- ✅ View all users
- ✅ Create new users (admins, sub-admins, staff)
- ✅ Update user details
- ✅ Delete users
- ✅ Assign roles to users
- ✅ Activate/deactivate users

### Role & Permission Management
- ✅ View all roles
- ✅ Create new roles
- ✅ Update role permissions
- ✅ Delete roles (except system roles)
- ✅ Assign permissions to roles

### Full System Access
- ✅ Dashboard
- ✅ Calendar
- ✅ Email
- ✅ Invoices (full CRUD)
- ✅ Projects (full CRUD)
- ✅ Blogs (full CRUD)
- ✅ Company Information (full CRUD)
- ✅ All pages and features

## Verification

After seeding, verify the Super Admin user:

### 1. Check MongoDB
```javascript
// In MongoDB Compass or Shell
db.users.findOne({ email: 'superadmin@gamsaj.com' })
```

You should see:
- `roleId`: ObjectId reference to Super Admin role
- `permissions`: Array of 38 permission strings
- `isVerified`: true
- `isActive`: true

### 2. Test Login
1. Start the backend: `npm start`
2. Start the frontend: `cd ../admin-dashboard && npm run dev`
3. Navigate to `http://localhost:5173/auth/login`
4. Login with:
   - Email: `superadmin@gamsaj.com`
   - Password: `SuperAdmin@123`
5. Verify you can access all sidebar items

### 3. Check Permissions
After login, check the browser console:
```javascript
// Should show user object with 38 permissions
console.log(user.permissions)
```

## Troubleshooting

### Error: "Super Admin role not found!"
- Make sure `config/roleTemplates.js` has `SUPER_ADMIN` with slug `super-admin`
- Check that the role was created in the database

### Error: "User validation failed: roleId"
- Ensure the Super Admin role exists before creating the user
- Check MongoDB connection

### Error: "E11000 duplicate key error"
- Super Admin user already exists
- The script will update the existing user instead of creating a new one

### Password Not Working
- Password is hashed using bcrypt
- Make sure you're using: `SuperAdmin@123` (case-sensitive)
- If you changed it, reset it by running the seed script again

## Re-running the Seed Script

You can safely re-run the seed script multiple times:

```bash
npm run seed:superadmin
```

It will:
- ✅ Clear and recreate all permissions
- ✅ Clear and recreate all roles
- ✅ Update existing Super Admin user (if exists)
- ✅ Create new Super Admin user (if doesn't exist)

## Security Best Practices

1. **Change Default Password**
   - Login immediately after seeding
   - Go to Profile → Settings
   - Change password to something secure

2. **Use Strong Passwords**
   - Minimum 8 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Example: `MyS3cur3P@ssw0rd!`

3. **Limit Super Admin Access**
   - Only create Super Admin accounts for trusted personnel
   - Use lower-level roles for regular staff
   - Audit Super Admin actions regularly

4. **Environment Variables**
   - Never commit `.env` file
   - Use different credentials for production
   - Rotate passwords regularly

## Next Steps

After seeding the Super Admin:

1. ✅ Login with Super Admin credentials
2. ✅ Change the default password
3. ✅ Create additional admin users
4. ✅ Assign appropriate roles to staff
5. ✅ Test permission-based access control
6. ✅ Configure email settings for user notifications

## Files Involved

- `backend/scripts/seedSuperAdmin.js` - Main seed script
- `backend/config/permissions.js` - Permission definitions
- `backend/config/roleTemplates.js` - Role templates
- `backend/models/User.js` - User model
- `backend/models/Role.js` - Role model
- `backend/models/Permission.js` - Permission model

## Support

If you encounter issues:
1. Check MongoDB connection in `.env`
2. Verify all dependencies are installed: `npm install`
3. Check the console output for specific errors
4. Review the error messages and stack traces
