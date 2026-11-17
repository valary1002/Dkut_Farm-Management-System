import React from 'react'
import routes from '../../routes/sidebar'
import { Link, NavLink, Route, useHistory } from 'react-router-dom'
import * as Icons from '../../icons'
import SidebarSubmenu from './SidebarSubmenu'
import { Button } from '@windmill/react-ui'
import { useAuth } from '../../context/AuthContext'
import schoolLogo from '../../assets/img/school-logo.jpg'

function Icon({ icon, ...props }) {
  const Icon = Icons[icon]
  return <Icon {...props} />
}

function SidebarContent() {
  const { user, logout } = useAuth()
  const history = useHistory()

  const handleLogout = () => {
    logout()
    history.push('/login')
  }

  /**
   * Filter routes based on user role
   * If no roles specified in route, show to everyone (backward compatibility)
   */
  const filterRoutesByRole = (routeList) => {
    return routeList.filter((route) => {
      // If no roles specified, show to everyone
      if (!route.roles) return true
      // Show if user's role is in the allowed roles
      return route.roles.includes(user?.role)
    })
  }

  const filteredRoutes = filterRoutesByRole(routes)

  return (
    <div className="min-h-full py-5 text-gray-500 dark:text-gray-400">
      <Link className="flex items-center gap-3 px-5" to="/app/dashboard">
        <img src={schoolLogo} alt="DKUT Farm Management System" className="object-cover w-10 h-10 rounded-xl ring-2 ring-primary-100 dark:ring-gray-600" />
        <span className="text-sm font-bold leading-tight text-gray-900 dark:text-gray-100">DKUT FARM<br /><span className="text-[10px] font-semibold uppercase tracking-widest text-primary-700 dark:text-primary-300">Management System</span></span>
      </Link>

      {/* Display user info and role */}
      {user && (
        <div className="px-4 py-3 mx-4 mt-6 text-sm border rounded-xl border-primary-100 bg-primary-50 dark:border-gray-600 dark:bg-gray-700">
          <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
            {user.name}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {user.role}
          </p>
        </div>
      )}

      <div className="px-5 mt-7 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Workspace</div>
      <ul className="mt-2">
        {filteredRoutes.map((route) =>
          route.routes ? (
            <SidebarSubmenu route={route} key={route.name} />
          ) : (
            <li className="relative px-4 py-1.5" key={route.name}>
              <NavLink
                exact
                to={route.path}
                className="inline-flex items-center w-full rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-150 hover:bg-primary-50 hover:text-primary-800 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                activeClassName="bg-primary-50 text-primary-800 dark:bg-gray-700 dark:text-gray-100"
              >
                <Route path={route.path} exact={route.exact}>
                  <span
                    className="absolute inset-y-0 left-0 w-1 bg-green-600 rounded-tr-lg rounded-br-lg"
                    aria-hidden="true"
                  ></span>
                </Route>
                <Icon className="w-5 h-5" aria-hidden="true" icon={route.icon} />
                <span className="ml-4">{route.name}</span>
              </NavLink>
            </li>
          )
        )}
      </ul>

      <div className="px-4 my-8">
        <Button block className="rounded-lg bg-primary-700 font-semibold hover:bg-primary-800" onClick={handleLogout}>
          Logout
          <span className="ml-2" aria-hidden="true">
            ✓
          </span>
        </Button>
      </div>
    </div>
  )
}

export default SidebarContent
