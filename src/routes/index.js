import { lazy } from 'react'

// use lazy for better code splitting, a.k.a. load faster
const Dashboard = lazy(() => import('../pages/Dashboard'))
const Produce = lazy(() => import('../pages/Produce'))
const Purchase = lazy(() => import('../pages/Purchase'))
const Inventory = lazy(() => import('../pages/Inventory'))
const Sales = lazy(() => import('../pages/Sales'))
const CasualJobs = lazy(() => import('../pages/CasualJobs'))
const JobApplications = lazy(() => import('../pages/JobApplications'))
const JobApplicationForm = lazy(() => import('../pages/JobApplicationForm'))
const ShortlistedWorkers = lazy(() => import('../pages/ShortlistedWorkers'))
const Customers = lazy(() => import('../pages/Customers'))
const Orders = lazy(() => import('../pages/Orders'))
const Payments = lazy(() => import('../pages/Payments'))
const Deliveries = lazy(() => import('../pages/Deliveries'))
const Reports = lazy(() => import('../pages/Reports'))
const Profile = lazy(() => import('../pages/Profile'))
const Settings = lazy(() => import('../pages/Settings'))
const Page404 = lazy(() => import('../pages/404'))
const Blank = lazy(() => import('../pages/Blank'))

/**
 * ⚠ These are internal routes!
 * They will be rendered inside the app, using the default `containers/Layout`.
 * If you want to add a route to, let's say, a landing page, you should add
 * it to the `App`'s router, exactly like `Login`, `CreateAccount` and other pages
 * are routed.
 *
 * If you're looking for the links rendered in the SidebarContent, go to
 * `routes/sidebar.js`
 */
const routes = [
  {
    path: '/dashboard',
    roles: ['Administrator', 'Customer'],
    component: Dashboard,
  },
  {
    path: '/produce',
    roles: ['Administrator', 'Customer'],
    component: Produce,
  },
  {
    path: '/purchase',
    roles: ['Customer'],
    component: Purchase,
  },
  {
    path: '/inventory',
    roles: ['Administrator'],
    component: Inventory,
  },
  {
    path: '/sales',
    roles: ['Administrator'],
    component: Sales,
  },
  {
    path: '/casual-jobs',
    roles: ['Administrator', 'Customer'],
    component: CasualJobs,
  },
  {
    path: '/job-applications',
    roles: ['Administrator', 'Customer'],
    component: JobApplications,
  },
  {
    path: '/job-application/:jobId',
    roles: ['Customer'],
    component: JobApplicationForm,
  },
  {
    path: '/shortlisted-workers',
    roles: ['Administrator'],
    component: ShortlistedWorkers,
  },
  {
    path: '/customers',
    roles: ['Administrator'],
    component: Customers,
  },
  {
    path: '/orders',
    roles: ['Administrator'],
    component: Orders,
  },
  {
    path: '/payments',
    roles: ['Administrator'],
    component: Payments,
  },
  {
    path: '/deliveries',
    roles: ['Administrator'],
    component: Deliveries,
  },
  {
    path: '/reports',
    roles: ['Administrator'],
    component: Reports,
  },
  {
    path: '/profile',
    roles: ['Administrator', 'Customer'],
    component: Profile,
  },
  {
    path: '/settings',
    roles: ['Administrator', 'Customer'],
    component: Settings,
  },
  {
    path: '/404',
    component: Page404,
  },
  {
    path: '/blank',
    component: Blank,
  },
]

export default routes
