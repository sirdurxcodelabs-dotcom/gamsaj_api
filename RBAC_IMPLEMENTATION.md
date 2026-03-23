# RBAC Implementation Guide - GAMSAJ Admin Dashboard

## Overview

Complete Role-Based Access Control (RBAC) system implemented for GAMSAJ International Limited's admin dashboard with permission-driven sidebar and API access control.

## Database Schema

### Models Created:
1. **Permission** (`models/Permission.js`)
   - name, slug, description
   - category (main, app, content, pages, admin)
   - resource, action

2. **Role** (`models/Role.js`)
   - name, slug, description
   - permissions (array of permission slugs)
   - isSystem, isActive

3. **User** (Updated `models/User.js`)
   - Added: permissions array
   - Added: isActive field
   - role field now stores role slug

## Permission System

### Total Permissions: 38

**Categories:**
- **MAIN** (1): Dashboard access
- **APP** (10): Calendar, Email, Invoices
- **CONTENT** (13): Projects, Blogs, Company Info
- **PAGES** (5): Profile, Starter, Maintenance, Errors
- **ADMIN** (10): Users, Roles management

### Permission Structure:
```javascript
{
  slug: 'view_dashboard',
  category: 'main',
  resource: 'dashboard',
  action: 'view'
}
```

## Role Templates

### 18 Pre-defined Roles based on GAMSAJ Structure:

**Executive Level (3):**
1. Super Admin - Full access
2. Chairman - Strategic oversight
3. Managing Director/CEO - Corporate strategy
4. Technical Director - Technical oversight

**Management Level (3):**
5. Business Development Manager
6. Head of Finance
7. Administration Manager

**Technical/Engineering Level (8):**
8. Chief Engineer
9. Project Manager
10. Resident Engineer
11. Architect
12. Planner
13. Environmentalist
14. Electrical Engineer
15. Land Surveyor

**Support Staff (4):**
16. Quantity Surveyor
17. Technician
18. Artisan
19. Subcontractor

## Setup Instructions

### 1. Seed Database

```bash
cd backend
npm run seed
```

This will:
- Create all 38 permissions
- Create all 18 role templates
- Clear existing data first

### 2. Create Super Admin User

After seeding, register a user and manually update their role in MongoDB:

```javascript
db.users.updateOne(
  { email: "admin@gamsaj.com" },
  { $set: { role: "super-admin", isVerified: true, isActive: true } }
)
```

### 3. API Endpoints

**Roles:**
- `GET /api/roles` - Get all roles (requires view_roles)
- `POST /api/roles` - Create role (requires create_roles)
- `GET /api/roles/:id` - Get single role
- `PUT /api/roles/:id` - Update role (requires update_roles)
- `DELETE /api/roles/:id` - Delete role (requires delete_roles)
- `POST /api/roles/:id/clone` - Clone role (requires create_roles)
- `GET /api/roles/permissions/all` - Get all permissions

**Auth (Updated):**
- `POST /api/auth/login` - Returns user with permissions array
- `GET /api/auth/me` - Returns user with permissions array

## Middleware Usage

### Permission Check:

```javascript
const { hasPermission } = require('./middleware/permission');
const { PERMISSIONS } = require('./config/permissions');

// Single permission (user needs ANY of these)
router.get('/projects', 
  protect, 
  hasPermission(PERMISSIONS.VIEW_PROJECTS, PERMISSIONS.MANAGE_PROJECTS),
  getProjects
);

// All permissions (user needs ALL of these)
const { hasAllPermissions } = require('./middleware/permission');

router.post('/projects', 
  protect, 
  hasAllPermissions(PERMISSIONS.CREATE_PROJECTS),
  createProject
);
```

## Permission Logic

### How Permissions Work:

1. User has a `role` (slug) and optional `permissions` array
2. On login/auth, system:
   - Fetches role from database
   - Combines role permissions + user-specific permissions
   - Returns merged permissions array
3. Frontend stores permissions in auth context
4. Sidebar renders based on permissions
5. API routes check permissions via middleware

### Example Flow:

```
User Login
  ↓
Get Role: "project-manager"
  ↓
Role Permissions: [view_dashboard, manage_projects, view_calendar, ...]
  ↓
User Permissions: [view_invoices] (extra permission)
  ↓
Merged: [view_dashboard, manage_projects, view_calendar, view_invoices, ...]
  ↓
Return to Frontend
  ↓
Sidebar renders only items user has permission for
```

## Role-to-Sidebar Mapping

### Chairman:
- Dashboard
- Projects (view)
- Company Information (view)
- Invoice Report (view)
- Profile

### Project Manager:
- Dashboard
- Projects (full CRUD)
- Calendar (manage)
- Email (manage)
- Profile

### Head of Finance:
- Dashboard
- Invoices (full access)
- Email
- Profile

### Resident Engineer:
- Dashboard
- Projects (view/update)
- Calendar (view)
- Profile

*See `config/roleTemplates.js` for complete mappings*

## Security Features

1. **System Roles Protection**: Super Admin role cannot be deleted
2. **Permission Validation**: All API routes check permissions
3. **Token-based Auth**: JWT tokens with user permissions
4. **Role Inheritance**: Users can have role + additional permissions
5. **Audit Ready**: Timestamps on all models

## Frontend Integration (Next Steps)

1. Update auth context to store permissions
2. Create permission hook: `usePermission()`
3. Update sidebar to filter by permissions
4. Create protected route wrapper
5. Build Users & Roles management UI

## Testing

### Test Permission Check:

```bash
# Login as user
POST /api/auth/login
{
  "email": "user@gamsaj.com",
  "password": "password"
}

# Response includes permissions array
{
  "user": {
    "permissions": ["view_dashboard", "view_projects", ...]
  }
}

# Try accessing protected route
GET /api/roles
Authorization: Bearer <token>

# Should return 403 if user lacks view_roles permission
```

## Configuration Files

- `config/permissions.js` - All permission constants
- `config/roleTemplates.js` - All role definitions
- `scripts/seedPermissionsAndRoles.js` - Database seeder
- `middleware/permission.js` - Permission checking middleware
- `controllers/roleController.js` - Role CRUD operations

## Next Steps

1. Run `npm run seed` to populate database
2. Create super admin user
3. Test API endpoints
4. Implement frontend permission system
5. Build Users & Roles UI
6. Add audit logging (optional)

## Support

For questions or issues, refer to:
- Permission constants: `backend/config/permissions.js`
- Role templates: `backend/config/roleTemplates.js`
- API routes: `backend/routes/roleRoutes.js`
