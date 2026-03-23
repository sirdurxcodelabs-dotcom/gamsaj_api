# Dynamic Website Navigation System

## Overview
Production-safe navigation management system where routes are immutable and controlled by the frontend, while the backend manages display names, visibility, ordering, and grouping.

## Key Features
✅ **Edit-Only Mode** - No creation or deletion of navigation items
✅ **Immutable Routes** - Frontend routes cannot be changed from backend
✅ **Safe Updates** - Only titles, order, and visibility can be edited
✅ **RBAC Protected** - Permission-based access control
✅ **Dual API** - Public API for website, Admin API for dashboard

## Database Models

### NavigationGroup
Represents top-level menu items (HOME, ABOUT, SERVICES, etc.)

**Fields:**
- `key` (immutable) - Unique identifier (e.g., 'home', 'services')
- `title` (editable) - Display name (e.g., 'HOME', 'SERVICES')
- `type` (immutable) - 'single' or 'dropdown'
- `path` (immutable) - Route for single type groups
- `order` (editable) - Display order
- `isActive` (editable) - Visibility toggle

**Rules:**
- HOME must be type='single'
- Single type must have a path
- Cannot be created or deleted via API

### NavigationItem
Represents sub-menu items under dropdown groups

**Fields:**
- `groupKey` (immutable) - Parent group reference
- `key` (immutable) - Unique identifier
- `title` (editable) - Display name
- `path` (immutable) - Frontend route (CANNOT BE CHANGED)
- `order` (editable) - Display order within group
- `isActive` (editable) - Visibility toggle

**Rules:**
- HOME group cannot have items
- Cannot be created or deleted via API
- Path is immutable - frontend contract

## Navigation Structure

### Seeded Groups
1. **HOME** (single) → `/`
2. **ABOUT** (single) → `/about`
3. **SERVICES** (dropdown)
   - Service → `/service`
   - Service Details → `/service-details`
4. **PAGES** (dropdown)
   - Project Page → `/project`
   - Project Details → `/project-details`
   - Team Page → `/team`
   - Team Details → `/team-details`
   - Shop Page → `/shop`
   - Shop Details → `/shop-details`
   - Cart → `/cart`
   - Checkout → `/checkout`
   - Wishlist → `/wishlist`
5. **NEWS** (dropdown)
   - News → `/blog`
   - News Details → `/blog-details`
6. **CONTACT** (single) → `/contact`

## API Endpoints

### Public API (Website)

#### GET /api/navigation
Returns active navigation for website consumption

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "title": "HOME",
      "type": "single",
      "path": "/"
    },
    {
      "title": "SERVICES",
      "type": "dropdown",
      "items": [
        {
          "title": "Service",
          "path": "/service"
        }
      ]
    }
  ]
}
```

**Features:**
- Only returns active groups and items
- Sorted by order
- No authentication required
- Used by website headers and mobile menu

### Admin API (Dashboard)

#### GET /api/navigation/admin
Get all navigation (including inactive)

**Auth:** Required
**Permission:** `view_navigation`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "key": "home",
      "title": "HOME",
      "type": "single",
      "path": "/",
      "order": 1,
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

#### PUT /api/navigation/admin/group/:id
Update navigation group

**Auth:** Required
**Permission:** `edit_navigation`

**Allowed Updates:**
- `title` - Display name
- `order` - Display order
- `isActive` - Visibility

**Forbidden Updates:**
- `key` - Returns 403
- `type` - Returns 403
- `path` - Returns 403

**Request:**
```json
{
  "title": "OUR SERVICES",
  "order": 3,
  "isActive": true
}
```

#### PUT /api/navigation/admin/item/:id
Update navigation item

**Auth:** Required
**Permission:** `edit_navigation`

**Allowed Updates:**
- `title` - Display name
- `order` - Display order
- `isActive` - Visibility

**Forbidden Updates:**
- `key` - Returns 403
- `path` - Returns 403 (CRITICAL - Frontend contract)
- `groupKey` - Returns 403

**Request:**
```json
{
  "title": "Our Services",
  "order": 1,
  "isActive": true
}
```

#### PUT /api/navigation/admin/reorder
Reorder navigation groups or items

**Auth:** Required
**Permission:** `edit_navigation`

**Request:**
```json
{
  "type": "groups",
  "items": [
    { "id": "...", "order": 1 },
    { "id": "...", "order": 2 }
  ]
}
```

Or for items:
```json
{
  "type": "items",
  "items": [
    { "id": "...", "order": 1 },
    { "id": "...", "order": 2 }
  ]
}
```

#### POST /api/navigation/admin/* (FORBIDDEN)
Attempting to create navigation returns 403

**Response:**
```json
{
  "success": false,
  "message": "Creating navigation items is not allowed. Navigation structure is predefined and can only be edited."
}
```

#### DELETE /api/navigation/admin/* (FORBIDDEN)
Attempting to delete navigation returns 403

**Response:**
```json
{
  "success": false,
  "message": "Deleting navigation items is not allowed. Use isActive field to hide items instead."
}
```

## Permissions

### Navigation Permissions
- `view_navigation` - View navigation structure
- `edit_navigation` - Edit titles, order, visibility

### Role Assignment
- **Super Admin** - Full access (view + edit)
- **Admin** - Full access (view + edit)
- **Content Manager** - View + Edit
- **Editor** - View only
- **Others** - No access

## Setup Instructions

### 1. Seed Navigation Data
```bash
cd backend
npm run seed:navigation
```

This will:
- Clear existing navigation data
- Seed 6 navigation groups
- Seed 13 navigation items
- Display navigation structure

### 2. Update Permissions
Run the permission seeder to include navigation permissions:
```bash
npm run seed:superadmin
```

### 3. Verify Setup
Check MongoDB to ensure:
- NavigationGroup collection has 6 documents
- NavigationItem collection has 13 documents
- All groups have correct type and order
- HOME is type='single'

### 4. Test API
```bash
# Public API (no auth)
curl http://localhost:5000/api/navigation

# Admin API (with auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/navigation/admin
```

## Frontend Integration

### Website (React)
```typescript
// Fetch navigation
const response = await fetch('http://localhost:5000/api/navigation');
const { data } = await response.json();

// Render navigation
data.map(item => {
  if (item.type === 'single') {
    return <Link to={item.path}>{item.title}</Link>;
  } else {
    return (
      <Dropdown>
        <DropdownToggle>{item.title}</DropdownToggle>
        <DropdownMenu>
          {item.items.map(subItem => (
            <DropdownItem href={subItem.path}>
              {subItem.title}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    );
  }
});
```

### Admin Dashboard
```typescript
// Fetch all navigation (including inactive)
const response = await fetch('http://localhost:5000/api/navigation/admin', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { data } = await response.json();

// Update navigation item
await fetch(`http://localhost:5000/api/navigation/admin/item/${itemId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'New Title',
    isActive: true
  })
});
```

## Admin UI Components

### Accordion Editor
```
┌─────────────────────────────────────┐
│ ☰ HOME                    [Toggle]  │
│   (No children - single link)       │
├─────────────────────────────────────┤
│ ☰ SERVICES ▼              [Toggle]  │
│   ☰ Service               [Toggle]  │
│      /service (read-only)           │
│   ☰ Service Details       [Toggle]  │
│      /service-details (read-only)   │
├─────────────────────────────────────┤
│ ☰ PAGES ▼                 [Toggle]  │
│   ☰ Project Page          [Toggle]  │
│      /project (read-only)           │
│   ... (9 items)                     │
└─────────────────────────────────────┘
```

**Features:**
- Drag handles (☰) for reordering
- Toggle switches for visibility
- Editable titles (click to edit)
- Read-only route display
- Accordion for dropdown groups
- No Add/Delete buttons

## Validation Rules

### Group Validation
- ✅ Can update: title, order, isActive
- ❌ Cannot update: key, type, path
- ❌ Cannot create new groups
- ❌ Cannot delete groups
- ❌ HOME cannot have children

### Item Validation
- ✅ Can update: title, order, isActive
- ❌ Cannot update: key, path, groupKey
- ❌ Cannot create new items
- ❌ Cannot delete items
- ❌ Cannot move items between groups

## Error Handling

### Attempt to Edit Path
```json
{
  "success": false,
  "message": "Cannot update key, path, or groupKey. These fields are immutable."
}
```

### Attempt to Create Navigation
```json
{
  "success": false,
  "message": "Creating navigation items is not allowed. Navigation structure is predefined and can only be edited."
}
```

### Attempt to Delete Navigation
```json
{
  "success": false,
  "message": "Deleting navigation items is not allowed. Use isActive field to hide items instead."
}
```

### HOME with Children
```json
{
  "success": false,
  "message": "HOME navigation group cannot have child items"
}
```

## Security Features

1. **Immutable Routes** - Frontend routes cannot be changed
2. **RBAC Protection** - Permission-based access
3. **Validation** - Strict field validation
4. **Audit Trail** - createdAt/updatedAt timestamps
5. **Safe Defaults** - All items active by default

## Benefits

### For Developers
- ✅ Frontend routes never break
- ✅ Type-safe navigation structure
- ✅ Clear separation of concerns
- ✅ Easy to maintain

### For Admins
- ✅ Safe to edit navigation
- ✅ Cannot break website
- ✅ Simple UI (no complex forms)
- ✅ Instant preview

### For Users
- ✅ Consistent navigation
- ✅ No broken links
- ✅ Fast loading (cached)
- ✅ Mobile-friendly

## Files Created

### Backend
- `backend/models/NavigationGroup.js` - Group model
- `backend/models/NavigationItem.js` - Item model
- `backend/config/navigationData.js` - Seed data
- `backend/scripts/seedNavigation.js` - Seed script
- `backend/controllers/navigationController.js` - API logic
- `backend/routes/navigationRoutes.js` - API routes
- `backend/NAVIGATION_SYSTEM.md` - This documentation

### Updated
- `backend/config/permissions.js` - Added navigation permissions
- `backend/server.js` - Registered navigation routes
- `backend/package.json` - Added seed script

## Next Steps

1. ✅ Seed navigation data
2. ✅ Test public API
3. ✅ Test admin API
4. ⏳ Build admin UI (accordion editor)
5. ⏳ Integrate with website
6. ⏳ Add drag-and-drop reordering
7. ⏳ Add bulk operations

## Status

✅ **Backend Complete**
✅ **API Endpoints Ready**
✅ **Permissions Configured**
✅ **Seed Script Ready**
⏳ **Admin UI Pending**
⏳ **Website Integration Pending**

---

**Created**: January 14, 2026
**Status**: Backend Complete, Ready for Frontend Integration
