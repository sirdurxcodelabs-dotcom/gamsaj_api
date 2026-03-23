// Permission Constants for GAMSAJ Admin Dashboard

const PERMISSIONS = {
  // MAIN
  VIEW_DASHBOARD: 'view_dashboard',
  
  // APP
  VIEW_CALENDAR: 'view_calendar',
  MANAGE_CALENDAR: 'manage_calendar',
  VIEW_EMAIL: 'view_email',
  MANAGE_EMAIL: 'manage_email',
  VIEW_INVOICES: 'view_invoices',
  CREATE_INVOICES: 'create_invoices',
  UPDATE_INVOICES: 'update_invoices',
  DELETE_INVOICES: 'delete_invoices',
  MANAGE_INVOICES: 'manage_invoices',
  
  // CONTENT
  VIEW_PROJECTS: 'view_projects',
  CREATE_PROJECTS: 'create_projects',
  UPDATE_PROJECTS: 'update_projects',
  DELETE_PROJECTS: 'delete_projects',
  MANAGE_PROJECTS: 'manage_projects',
  VIEW_BLOGS: 'view_blogs',
  CREATE_BLOGS: 'create_blogs',
  UPDATE_BLOGS: 'update_blogs',
  DELETE_BLOGS: 'delete_blogs',
  MANAGE_BLOGS: 'manage_blogs',
  VIEW_COMPANY_INFO: 'view_company_info',
  UPDATE_COMPANY_INFO: 'update_company_info',
  MANAGE_COMPANY_INFO: 'manage_company_info',
  
  // PAGES
  VIEW_PROFILE: 'view_profile',
  UPDATE_PROFILE: 'update_profile',
  VIEW_STARTER: 'view_starter',
  VIEW_MAINTENANCE: 'view_maintenance',
  VIEW_ERROR_PAGES: 'view_error_pages',
  
  // ADMIN
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  UPDATE_USERS: 'update_users',
  DELETE_USERS: 'delete_users',
  MANAGE_USERS: 'manage_users',
  VIEW_ROLES: 'view_roles',
  CREATE_ROLES: 'create_roles',
  UPDATE_ROLES: 'update_roles',
  DELETE_ROLES: 'delete_roles',
  MANAGE_ROLES: 'manage_roles',
  
  // NAVIGATION (Website Navigation Management)
  VIEW_NAVIGATION: 'view_navigation',
  EDIT_NAVIGATION: 'edit_navigation',
  
  // CONNECTIONS (Contact & Newsletter)
  VIEW_CONNECTIONS: 'connections.view',
  MANAGE_CONNECTIONS: 'connections.manage',
  DELETE_CONNECTIONS: 'connections.delete',
  EXPORT_CONNECTIONS: 'connections.export',
  
  // CALENDAR (Construction Projects & Legal Matters)
  VIEW_CALENDAR_EVENTS: 'calendar.view',
  CREATE_CALENDAR_EVENTS: 'calendar.create',
  UPDATE_CALENDAR_EVENTS: 'calendar.update',
  DELETE_CALENDAR_EVENTS: 'calendar.delete',
  MANAGE_CALENDAR_EVENTS: 'calendar.manage',
};

// Permission Definitions with metadata
const PERMISSION_DEFINITIONS = [
  // MAIN
  { name: 'View Dashboard', slug: PERMISSIONS.VIEW_DASHBOARD, category: 'main', resource: 'dashboard', action: 'view', description: 'Access to main dashboard' },
  
  // APP
  { name: 'View Calendar', slug: PERMISSIONS.VIEW_CALENDAR, category: 'app', resource: 'calendar', action: 'view', description: 'View calendar events' },
  { name: 'Manage Calendar', slug: PERMISSIONS.MANAGE_CALENDAR, category: 'app', resource: 'calendar', action: 'manage', description: 'Full calendar management' },
  { name: 'View Email', slug: PERMISSIONS.VIEW_EMAIL, category: 'app', resource: 'email', action: 'view', description: 'Access email inbox' },
  { name: 'Manage Email', slug: PERMISSIONS.MANAGE_EMAIL, category: 'app', resource: 'email', action: 'manage', description: 'Send and manage emails' },
  { name: 'View Invoices', slug: PERMISSIONS.VIEW_INVOICES, category: 'app', resource: 'invoices', action: 'view', description: 'View invoice reports and details' },
  { name: 'Create Invoices', slug: PERMISSIONS.CREATE_INVOICES, category: 'app', resource: 'invoices', action: 'create', description: 'Create new invoices' },
  { name: 'Update Invoices', slug: PERMISSIONS.UPDATE_INVOICES, category: 'app', resource: 'invoices', action: 'update', description: 'Edit existing invoices' },
  { name: 'Delete Invoices', slug: PERMISSIONS.DELETE_INVOICES, category: 'app', resource: 'invoices', action: 'delete', description: 'Delete invoices' },
  { name: 'Manage Invoices', slug: PERMISSIONS.MANAGE_INVOICES, category: 'app', resource: 'invoices', action: 'manage', description: 'Full invoice management' },
  
  // CONTENT
  { name: 'View Projects', slug: PERMISSIONS.VIEW_PROJECTS, category: 'content', resource: 'projects', action: 'view', description: 'View project listings' },
  { name: 'Create Projects', slug: PERMISSIONS.CREATE_PROJECTS, category: 'content', resource: 'projects', action: 'create', description: 'Create new projects' },
  { name: 'Update Projects', slug: PERMISSIONS.UPDATE_PROJECTS, category: 'content', resource: 'projects', action: 'update', description: 'Edit project details' },
  { name: 'Delete Projects', slug: PERMISSIONS.DELETE_PROJECTS, category: 'content', resource: 'projects', action: 'delete', description: 'Delete projects' },
  { name: 'Manage Projects', slug: PERMISSIONS.MANAGE_PROJECTS, category: 'content', resource: 'projects', action: 'manage', description: 'Full project management' },
  { name: 'View Blogs', slug: PERMISSIONS.VIEW_BLOGS, category: 'content', resource: 'blogs', action: 'view', description: 'View blog posts' },
  { name: 'Create Blogs', slug: PERMISSIONS.CREATE_BLOGS, category: 'content', resource: 'blogs', action: 'create', description: 'Create blog posts' },
  { name: 'Update Blogs', slug: PERMISSIONS.UPDATE_BLOGS, category: 'content', resource: 'blogs', action: 'update', description: 'Edit blog posts' },
  { name: 'Delete Blogs', slug: PERMISSIONS.DELETE_BLOGS, category: 'content', resource: 'blogs', action: 'delete', description: 'Delete blog posts' },
  { name: 'Manage Blogs', slug: PERMISSIONS.MANAGE_BLOGS, category: 'content', resource: 'blogs', action: 'manage', description: 'Full blog management' },
  { name: 'View Company Info', slug: PERMISSIONS.VIEW_COMPANY_INFO, category: 'content', resource: 'company_info', action: 'view', description: 'View company information' },
  { name: 'Update Company Info', slug: PERMISSIONS.UPDATE_COMPANY_INFO, category: 'content', resource: 'company_info', action: 'update', description: 'Edit company information' },
  { name: 'Manage Company Info', slug: PERMISSIONS.MANAGE_COMPANY_INFO, category: 'content', resource: 'company_info', action: 'manage', description: 'Full company info management' },
  
  // PAGES
  { name: 'View Profile', slug: PERMISSIONS.VIEW_PROFILE, category: 'pages', resource: 'profile', action: 'view', description: 'View own profile' },
  { name: 'Update Profile', slug: PERMISSIONS.UPDATE_PROFILE, category: 'pages', resource: 'profile', action: 'update', description: 'Edit own profile' },
  { name: 'View Starter', slug: PERMISSIONS.VIEW_STARTER, category: 'pages', resource: 'starter', action: 'view', description: 'Access starter page' },
  { name: 'View Maintenance', slug: PERMISSIONS.VIEW_MAINTENANCE, category: 'pages', resource: 'maintenance', action: 'view', description: 'View maintenance page' },
  { name: 'View Error Pages', slug: PERMISSIONS.VIEW_ERROR_PAGES, category: 'pages', resource: 'errors', action: 'view', description: 'Access error pages' },
  
  // ADMIN
  { name: 'View Users', slug: PERMISSIONS.VIEW_USERS, category: 'admin', resource: 'users', action: 'view', description: 'View user list' },
  { name: 'Create Users', slug: PERMISSIONS.CREATE_USERS, category: 'admin', resource: 'users', action: 'create', description: 'Create new users' },
  { name: 'Update Users', slug: PERMISSIONS.UPDATE_USERS, category: 'admin', resource: 'users', action: 'update', description: 'Edit user details' },
  { name: 'Delete Users', slug: PERMISSIONS.DELETE_USERS, category: 'admin', resource: 'users', action: 'delete', description: 'Delete users' },
  { name: 'Manage Users', slug: PERMISSIONS.MANAGE_USERS, category: 'admin', resource: 'users', action: 'manage', description: 'Full user management' },
  { name: 'View Roles', slug: PERMISSIONS.VIEW_ROLES, category: 'admin', resource: 'roles', action: 'view', description: 'View roles and permissions' },
  { name: 'Create Roles', slug: PERMISSIONS.CREATE_ROLES, category: 'admin', resource: 'roles', action: 'create', description: 'Create new roles' },
  { name: 'Update Roles', slug: PERMISSIONS.UPDATE_ROLES, category: 'admin', resource: 'roles', action: 'update', description: 'Edit role permissions' },
  { name: 'Delete Roles', slug: PERMISSIONS.DELETE_ROLES, category: 'admin', resource: 'roles', action: 'delete', description: 'Delete roles' },
  { name: 'Manage Roles', slug: PERMISSIONS.MANAGE_ROLES, category: 'admin', resource: 'roles', action: 'manage', description: 'Full role management' },
  
  // NAVIGATION
  { name: 'View Navigation', slug: PERMISSIONS.VIEW_NAVIGATION, category: 'admin', resource: 'navigation', action: 'view', description: 'View website navigation structure' },
  { name: 'Edit Navigation', slug: PERMISSIONS.EDIT_NAVIGATION, category: 'admin', resource: 'navigation', action: 'edit', description: 'Edit navigation titles, order, and visibility' },
  
  // CONNECTIONS
  { name: 'View Connections', slug: PERMISSIONS.VIEW_CONNECTIONS, category: 'admin', resource: 'connections', action: 'view', description: 'View contact forms and newsletter subscribers' },
  { name: 'Manage Connections', slug: PERMISSIONS.MANAGE_CONNECTIONS, category: 'admin', resource: 'connections', action: 'manage', description: 'Update connection status and add notes' },
  { name: 'Delete Connections', slug: PERMISSIONS.DELETE_CONNECTIONS, category: 'admin', resource: 'connections', action: 'delete', description: 'Delete connections' },
  { name: 'Export Connections', slug: PERMISSIONS.EXPORT_CONNECTIONS, category: 'admin', resource: 'connections', action: 'export', description: 'Export connections to CSV' },
  
  // CALENDAR
  { name: 'View Calendar Events', slug: PERMISSIONS.VIEW_CALENDAR_EVENTS, category: 'app', resource: 'calendar', action: 'view', description: 'View calendar events for construction projects and legal matters' },
  { name: 'Create Calendar Events', slug: PERMISSIONS.CREATE_CALENDAR_EVENTS, category: 'app', resource: 'calendar', action: 'create', description: 'Create new calendar events' },
  { name: 'Update Calendar Events', slug: PERMISSIONS.UPDATE_CALENDAR_EVENTS, category: 'app', resource: 'calendar', action: 'update', description: 'Edit and update calendar events' },
  { name: 'Delete Calendar Events', slug: PERMISSIONS.DELETE_CALENDAR_EVENTS, category: 'app', resource: 'calendar', action: 'delete', description: 'Delete calendar events' },
  { name: 'Manage Calendar Events', slug: PERMISSIONS.MANAGE_CALENDAR_EVENTS, category: 'app', resource: 'calendar', action: 'manage', description: 'Full calendar event management including status updates and snooze' },
];

module.exports = {
  PERMISSIONS,
  PERMISSION_DEFINITIONS,
};
