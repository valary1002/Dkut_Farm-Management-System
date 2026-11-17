import React, { useContext, Suspense, useEffect, lazy } from 'react'
import { Switch, Redirect, useLocation } from 'react-router-dom'
import { Route } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import routes from '../routes'

import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Main from '../containers/Main'
import BottomNavigation from '../components/BottomNavigation'
import ThemedSuspense from '../components/ThemedSuspense'
import { SidebarContext } from '../context/SidebarContext'

const Page404 = lazy(() => import('../pages/404'))

function Layout() {
  const { isSidebarOpen, closeSidebar } = useContext(SidebarContext)
  let location = useLocation()

  useEffect(() => {
    closeSidebar()
  }, [location, closeSidebar])

  return (
    <div
      className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${isSidebarOpen && 'overflow-hidden'}`}
    >
      <Sidebar />

      <div className="flex flex-col flex-1 w-full">
        <Header />
        <Main>
          <Suspense fallback={<ThemedSuspense />}>
            <Switch>
              {routes.map((route, i) => {
                if (!route.component) return null

                // If route specifies role restrictions, pass them to ProtectedRoute
                if (route.roles) {
                  return (
                    <ProtectedRoute
                      key={i}
                      exact={true}
                      path={`/app${route.path}`}
                      component={route.component}
                      requiredRoles={route.roles}
                    />
                  )
                }

                // Default: require authentication but no role restriction
                return (
                  <ProtectedRoute
                    key={i}
                    exact={true}
                    path={`/app${route.path}`}
                    component={route.component}
                  />
                )
              })}
              <Redirect exact from="/app" to="/app/dashboard" />
              <Route component={Page404} />
            </Switch>
          </Suspense>
        </Main>
        <BottomNavigation />
      </div>
    </div>
  )
}

export default Layout
