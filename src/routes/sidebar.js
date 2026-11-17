/**
 * ⚠ These are used just to render the Sidebar!
 * You can include any link here, local or external.
 *
 * If you're looking to actual Router routes, go to
 * `routes/index.js`
 *
 * ROLE-BASED NAVIGATION:
 * - Administrator: All menu items visible
 * - Customer: Dashboard, Produce (Shopping), Orders, Profile
 * - Customer: Produce, Casual Jobs, Job Applications, Profile
 */
const routes = [
  {
    path: '/app/dashboard',
    icon: 'HomeIcon',
    name: 'Dashboard',
    roles: ['Administrator', 'Customer'],
  },
  {
    icon: 'CartIcon',
    name: 'Farm Management',
    roles: ['Administrator'],
    routes: [
      {
        path: '/app/produce',
        name: 'Produce',
        roles: ['Administrator'],
      },
      {
        path: '/app/inventory',
        name: 'Inventory',
        roles: ['Administrator'],
      },
      {
        path: '/app/sales',
        name: 'Sales',
        roles: ['Administrator'],
      },
    ],
  },
  {
    icon: 'CartIcon',
    name: 'Shop',
    roles: ['Customer'],
    routes: [
      {
        path: '/app/produce',
        name: 'Browse Produce',
        roles: ['Customer'],
      },
      {
        path: '/app/orders',
        name: 'My Orders',
        roles: ['Customer'],
      },
    ],
  },
  {
    icon: 'PeopleIcon',
    name: 'Recruitment',
    roles: ['Administrator'],
    routes: [
      {
        path: '/app/casual-jobs',
        name: 'Casual Jobs',
        roles: ['Administrator'],
      },
      {
        path: '/app/job-applications',
        name: 'Job Applications',
        roles: ['Administrator'],
      },
      {
        path: '/app/shortlisted-workers',
        name: 'Shortlisted Workers',
        roles: ['Administrator'],
      },
    ],
  },
  {
    icon: 'PeopleIcon',
    name: 'Jobs',
    roles: ['Customer'],
    routes: [
      {
        path: '/app/casual-jobs',
        name: 'Available Jobs',
        roles: ['Customer'],
      },
      {
        path: '/app/job-applications',
        name: 'My Applications',
        roles: ['Customer'],
      },
    ],
  },
  {
    icon: 'MailIcon',
    name: 'Customer Management',
    roles: ['Administrator'],
    routes: [
      {
        path: '/app/customers',
        name: 'Customers',
        roles: ['Administrator'],
      },
      {
        path: '/app/orders',
        name: 'Orders',
        roles: ['Administrator'],
      },
      {
        path: '/app/payments',
        name: 'Payments',
        roles: ['Administrator'],
      },
      {
        path: '/app/deliveries',
        name: 'Deliveries',
        roles: ['Administrator'],
      },
    ],
  },
  {
    icon: 'ChartsIcon',
    name: 'System',
    roles: ['Administrator'],
    routes: [
      {
        path: '/app/reports',
        name: 'Reports',
        roles: ['Administrator'],
      },
    ],
  },
  {
    icon: 'OutlinePersonIcon',
    name: 'Account',
    roles: ['Administrator', 'Customer'],
    routes: [
      {
        path: '/app/profile',
        name: 'Profile',
        roles: ['Administrator', 'Customer'],
      },
      {
        path: '/app/settings',
        name: 'Settings',
        roles: ['Administrator', 'Customer'],
      },
    ],
  },
]

export default routes
