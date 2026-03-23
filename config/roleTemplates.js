const { PERMISSIONS } = require('./permissions');

// Role Templates based on GAMSAJ Organizational Structure

const ROLE_TEMPLATES = {
  // SUPER ADMIN - Full system access
  SUPER_ADMIN: {
    name: 'Super Admin',
    slug: 'super-admin',
    description: 'Full system access with all permissions',
    isSystem: true,
    permissions: Object.values(PERMISSIONS),
  },

  // EXECUTIVE LEVEL - Strategic, Read-Only Access
  CHAIRMAN: {
    name: 'Chairman',
    slug: 'chairman',
    description: 'Executive level - Strategic oversight',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_PROJECTS,
      PERMISSIONS.VIEW_COMPANY_INFO,
      PERMISSIONS.VIEW_INVOICES,
      PERMISSIONS.VIEW_PROFILE,
      PERMISSIONS.UPDATE_PROFILE,
    ],
  },

  MANAGING_DIRECTOR: {
    name: 'Managing Director / CEO',
    slug: 'managing-director',
    description: 'Executive level - Overall corporate strategy',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_PROJECTS,
      PERMISSIONS.VIEW_COMPANY_INFO,
      PERMISSIONS.VIEW_INVOICES,
      PERMISSIONS.VIEW_PROFILE,
      PERMISSIONS.UPDATE_PROFILE,
      PERMISSIONS.VIEW_USERS,
    ],
  },

  TECHNICAL_DIRECTOR: {
    name: 'Technical Director',
    slug: 'technical-director',
    description: 'Executive level - Technical operations oversight',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_PROJECTS,
      PERMISSIONS.VIEW_COMPANY_INFO,
      PERMISSIONS.VIEW_INVOICES,
      PERMISSIONS.VIEW_PROFILE,
      PERMISSIONS.UPDATE_PROFILE,
    ],
  },

  // MANAGEMENT LEVEL
  BUSINESS_DEVELOPMENT_MANAGER: {
    name: 'Business Development Manager',
    slug: 'business-development-manager',
    description: 'Management level - Business growth and partnerships',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_PROJECTS,
      PERMISSIONS.UPDATE_PROJECTS,
      PERMISSIONS.VIEW_BLOGS,
      PERMISSIONS.MANAGE_BLOGS,
      PERMISSIONS.VIEW_EMAIL,
      PERMISSIONS.MANAGE_EMAIL,
      PERMISSIONS.VIEW_CALENDAR,
      PERMISSIONS.MANAGE_CALENDAR,
      PERMISSIONS.VIEW_INVOICES,
      PERMISSIONS.VIEW_PROFILE,
      PERMISSIONS.UPDATE_PROFILE,
      PERMISSIONS.VIEW_NAVIGATION,
    ],
  },

  HEAD_OF_FINANCE: {
    name: 'Head of Finance',
    slug: 'head-of-finance',
    description: 'Management level - Financial oversight',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.MANAGE_INVOICES,
      PERMISSIONS.VIEW_EMAIL,
      PERMISSIONS.MANAGE_EMAIL,
      PERMISSIONS.VIEW_PROFILE,
      PERMISSIONS.UPDATE_PROFILE,
    ],
  },

  ADMINISTRATION_MANAGER: {
    name: 'Administration Manager',
    slug: 'administration-manager',
    description: 'Management level - Administration and HR',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_USERS,
      PERMISSIONS.UPDATE_USERS,
      PERMISSIONS.VIEW_CALENDAR,
      PERMISSIONS.MANAGE_CALENDAR,
      PERMISSIONS.VIEW_EMAIL,
      PERMISSIONS.MANAGE_EMAIL,
      PERMISSIONS.VIEW_COMPANY_INFO,
      PERMISSIONS.UPDATE_COMPANY_INFO,
      PERMISSIONS.VIEW_PROFILE,
      PERMISSIONS.UPDATE_PROFILE,
      PERMISSIONS.VIEW_NAVIGATION,
      PERMISSIONS.EDIT_NAVIGATION,
    ],
  },

  // TECHNICAL / ENGINEERING LEVEL
  CHIEF_ENGINEER: {
    name: 'Chief Engineer',
    slug: 'chief-engineer',
    description: 'Technical level - Engineering leadership',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_PROJECTS,
      PERMISSIONS.UPDATE_PROJECTS,
      PERMISSIONS.VIEW_CALENDAR,
      PERMISSIONS.MANAGE_CALENDAR,
      PERMISSIONS.VIEW_EMAIL,
      PERMISSIONS.MANAGE_EMAIL,
      PERMISSIONS.VIEW_PROFILE,
      PERMISSIONS.UPDATE_PROFILE,
    ],
  },

  PROJECT_MANAGER: {
    name: 'Project Manager',
    slug: 'project-manager',
    description: 'Technical level - Project execution',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.MANAGE_PROJECTS,
      PERMISSIONS.VIEW_CALENDAR,
      PERMISSIONS.MANAGE_CALENDAR,
      PERMISSIONS.VIEW_EMAIL,
      PERMISSIONS.MANAGE_EMAIL,
      PERMISSIONS.VIEW_PROFILE,
      PERMISSIONS.UPDATE_PROFILE,
    ],
  },

  RESIDENT_ENGINEER: {
    name: 'Resident Engineer',
    slug: 'resident-engineer',
    description: 'Technical level - On-site supervision',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_PROJECTS,
      PERMISSIONS.UPDATE_PROJECTS,
      PERMISSIONS.VIEW_CALENDAR,
      PERMISSIONS.VIEW_PROFILE,
      PERMISSIONS.UPDATE_PROFILE,
    ],
  },

  ARCHITECT: {
    name: 'Architect',
    slug: 'architect',
    description: 'Technical level - Architectural design',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_PROJECTS,
      PERMISSIONS.VIEW_CALENDAR,
      PERMISSIONS.VIEW_PROFILE,
      PERMISSIONS.UPDATE_PROFILE,
    ],
  },

  PLANNER: {
    name: 'Planner',
    slug: 'planner',
    description: 'Technical level - Project planning',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_PROJECTS,
      PERMISSIONS.VIEW_CALENDAR,
      PERMISSIONS.VIEW_PROFILE,
      PERMISSIONS.UPDATE_PROFILE,
    ],
  },

  ENVIRONMENTALIST: {
    name: 'Environmentalist',
    slug: 'environmentalist',
    description: 'Technical level - Environmental compliance',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_PROJECTS,
      PERMISSIONS.VIEW_CALENDAR,
      PERMISSIONS.VIEW_PROFILE,
      PERMISSIONS.UPDATE_PROFILE,
    ],
  },

  ELECTRICAL_ENGINEER: {
    name: 'Electrical Engineer',
    slug: 'electrical-engineer',
    description: 'Technical level - Electrical systems',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_PROJECTS,
      PERMISSIONS.VIEW_CALENDAR,
      PERMISSIONS.VIEW_PROFILE,
      PERMISSIONS.UPDATE_PROFILE,
    ],
  },

  LAND_SURVEYOR: {
    name: 'Land Surveyor',
    slug: 'land-surveyor',
    description: 'Technical level - Land surveys',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_PROJECTS,
      PERMISSIONS.VIEW_CALENDAR,
      PERMISSIONS.VIEW_PROFILE,
      PERMISSIONS.UPDATE_PROFILE,
    ],
  },

  // SUPPORT STAFF
  QUANTITY_SURVEYOR: {
    name: 'Quantity Surveyor',
    slug: 'quantity-surveyor',
    description: 'Support staff - Cost management',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_PROJECTS,
      PERMISSIONS.VIEW_INVOICES,
      PERMISSIONS.VIEW_PROFILE,
      PERMISSIONS.UPDATE_PROFILE,
    ],
  },

  TECHNICIAN: {
    name: 'Technician',
    slug: 'technician',
    description: 'Support staff - Technical support',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_PROJECTS,
      PERMISSIONS.VIEW_CALENDAR,
      PERMISSIONS.VIEW_PROFILE,
      PERMISSIONS.UPDATE_PROFILE,
    ],
  },

  ARTISAN: {
    name: 'Artisan',
    slug: 'artisan',
    description: 'Support staff - Skilled labor',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_PROJECTS,
      PERMISSIONS.VIEW_CALENDAR,
      PERMISSIONS.VIEW_PROFILE,
      PERMISSIONS.UPDATE_PROFILE,
    ],
  },

  SUBCONTRACTOR: {
    name: 'Subcontractor',
    slug: 'subcontractor',
    description: 'External - Assigned projects only',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_PROJECTS,
      PERMISSIONS.VIEW_PROFILE,
      PERMISSIONS.UPDATE_PROFILE,
    ],
  },
};

module.exports = {
  ROLE_TEMPLATES,
};
