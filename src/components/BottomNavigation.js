import React from 'react'
import { NavLink } from 'react-router-dom'
import { CartIcon, ChartsIcon, HomeIcon, OutlineCogIcon, OutlinePersonIcon, PeopleIcon } from '../icons'
import { useAuth } from '../context/AuthContext'

const navigationByRole = {
  Administrator: [
    { path: '/app/dashboard', label: 'Home', icon: HomeIcon },
    { path: '/app/produce', label: 'Products', icon: CartIcon },
    { path: '/app/orders', label: 'Orders', icon: ChartsIcon },
    { path: '/app/job-applications', label: 'Applications', icon: PeopleIcon },
    { path: '/app/settings', label: 'Settings', icon: OutlineCogIcon },
  ],
  Customer: [
    { path: '/app/dashboard', label: 'Home', icon: HomeIcon },
    { path: '/app/orders', label: 'Orders', icon: ChartsIcon },
    { path: '/app/job-applications', label: 'Applications', icon: PeopleIcon },
    { path: '/app/profile', label: 'Profile', icon: OutlinePersonIcon },
    { path: '/app/settings', label: 'Settings', icon: OutlineCogIcon },
  ],
}

function BottomNavigation() {
  const { user } = useAuth()
  const items = navigationByRole[user?.role] || []

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 px-2 py-2 shadow-lg backdrop-blur lg:hidden dark:border-gray-700 dark:bg-gray-800/95"
      aria-label="Primary navigation"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {items.map(({ path, label, icon: Icon }) => (
          <li key={path}>
            <NavLink
              exact
              to={path}
              className="flex min-h-12 flex-col items-center justify-center rounded-lg px-1 text-[10px] font-semibold text-gray-500 hover:bg-primary-50 hover:text-primary-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
              activeClassName="bg-primary-50 text-primary-700 dark:bg-gray-700 dark:text-primary-300"
              aria-label={label}
            >
              <Icon className="mb-1 h-5 w-5" aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default BottomNavigation
