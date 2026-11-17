import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { DropdownIcon } from '../../icons'
import * as Icons from '../../icons'
import { Transition } from '@windmill/react-ui'
import { useAuth } from '../../context/AuthContext'

function Icon({ icon, ...props }) {
  const Icon = Icons[icon]
  return <Icon {...props} />
}

function SidebarSubmenu({ route }) {
  const { user } = useAuth()
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false)

  function handleDropdownMenuClick() {
    setIsDropdownMenuOpen(!isDropdownMenuOpen)
  }

  /**
   * Filter submenu items based on user role
   * If no roles specified in route, show to everyone (backward compatibility)
   */
  const filterRoutesByRole = (routeList) => {
    return routeList.filter((r) => {
      // If no roles specified, show to everyone
      if (!r.roles) return true
      // Show if user's role is in the allowed roles
      return r.roles.includes(user?.role)
    })
  }

  const filteredRoutes = filterRoutesByRole(route.routes || [])

  // Don't show submenu if no routes are available for this role
  if (filteredRoutes.length === 0) return null

  return (
    <li className="relative px-4 py-1.5" key={route.name}>
      <button
        className="inline-flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-150 hover:bg-primary-50 hover:text-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-200"
        onClick={handleDropdownMenuClick}
        aria-haspopup="true"
      >
        <span className="inline-flex items-center">
          <Icon className="w-5 h-5" aria-hidden="true" icon={route.icon} />
          <span className="ml-4">{route.name}</span>
        </span>
        <DropdownIcon className="w-4 h-4" aria-hidden="true" />
      </button>
      <Transition
        show={isDropdownMenuOpen}
        enter="transition-all ease-in-out duration-300"
        enterFrom="opacity-25 max-h-0"
        enterTo="opacity-100 max-h-xl"
        leave="transition-all ease-in-out duration-300"
        leaveFrom="opacity-100 max-h-xl"
        leaveTo="opacity-0 max-h-0"
      >
        <ul
          className="p-2 mt-1 space-y-1 overflow-hidden text-sm font-medium text-gray-500 rounded-lg bg-gray-50 dark:text-gray-400 dark:bg-gray-900"
          aria-label="submenu"
        >
          {filteredRoutes.map((r) => (
            <li
              className="px-2 py-1 transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
              key={r.name}
            >
              <Link className="w-full" to={r.path}>
                {r.name}
              </Link>
            </li>
          ))}
        </ul>
      </Transition>
    </li>
  )
}

export default SidebarSubmenu
