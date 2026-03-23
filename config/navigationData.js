// Predefined navigation structure based on website
// These are seeded once and can only be edited (not created/deleted)

const NAVIGATION_GROUPS = [
  {
    key: 'home',
    title: 'HOME',
    type: 'single',
    path: '/',
    order: 1,
    isActive: true,
  },
  {
    key: 'about',
    title: 'ABOUT',
    type: 'single',
    path: '/about',
    order: 2,
    isActive: true,
  },
  {
    key: 'services',
    title: 'SERVICES',
    type: 'dropdown',
    order: 3,
    isActive: true,
  },
  {
    key: 'pages',
    title: 'PAGES',
    type: 'dropdown',
    order: 4,
    isActive: true,
  },
  {
    key: 'news',
    title: 'NEWS',
    type: 'dropdown',
    order: 5,
    isActive: true,
  },
  {
    key: 'contact',
    title: 'CONTACT',
    type: 'single',
    path: '/contact',
    order: 6,
    isActive: true,
  },
];

const NAVIGATION_ITEMS = [
  // Services dropdown items
  {
    groupKey: 'services',
    key: 'service-list',
    title: 'Service',
    path: '/service',
    order: 1,
    isActive: true,
  },
  {
    groupKey: 'services',
    key: 'service-details',
    title: 'Service Details',
    path: '/service-details',
    order: 2,
    isActive: true,
  },
  
  // Pages dropdown items
  {
    groupKey: 'pages',
    key: 'project-page',
    title: 'Project Page',
    path: '/project',
    order: 1,
    isActive: true,
  },
  {
    groupKey: 'pages',
    key: 'project-details',
    title: 'Project Details',
    path: '/project-details',
    order: 2,
    isActive: true,
  },
  {
    groupKey: 'pages',
    key: 'team-page',
    title: 'Team Page',
    path: '/team',
    order: 3,
    isActive: true,
  },
  {
    groupKey: 'pages',
    key: 'team-details',
    title: 'Team Details',
    path: '/team-details',
    order: 4,
    isActive: true,
  },
  {
    groupKey: 'pages',
    key: 'shop-page',
    title: 'Shop Page',
    path: '/shop',
    order: 5,
    isActive: true,
  },
  {
    groupKey: 'pages',
    key: 'shop-details',
    title: 'Shop Details',
    path: '/shop-details',
    order: 6,
    isActive: true,
  },
  {
    groupKey: 'pages',
    key: 'cart',
    title: 'Cart',
    path: '/cart',
    order: 7,
    isActive: true,
  },
  {
    groupKey: 'pages',
    key: 'checkout',
    title: 'Checkout',
    path: '/checkout',
    order: 8,
    isActive: true,
  },
  {
    groupKey: 'pages',
    key: 'wishlist',
    title: 'Wishlist',
    path: '/wishlist',
    order: 9,
    isActive: true,
  },
  
  // News dropdown items
  {
    groupKey: 'news',
    key: 'news-list',
    title: 'News',
    path: '/blog',
    order: 1,
    isActive: true,
  },
  {
    groupKey: 'news',
    key: 'news-details',
    title: 'News Details',
    path: '/blog-details',
    order: 2,
    isActive: true,
  },
];

module.exports = {
  NAVIGATION_GROUPS,
  NAVIGATION_ITEMS,
};
