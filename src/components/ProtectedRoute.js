import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * ProtectedRoute Component
 * Redirects to login if user is not authenticated
 * Optionally checks for specific roles
 */
export function ProtectedRoute({ component: Component, requiredRoles, ...rest }) {
  const { isAuthenticated, hasAnyRole } = useAuth()

  return (
    <Route
      {...rest}
      render={(props) => {
        // Not authenticated - redirect to login
        if (!isAuthenticated) {
          return <Redirect to="/login" />
        }

        // Check role requirements if specified
        if (requiredRoles && !hasAnyRole(requiredRoles)) {
          return <Redirect to="/unauthorized" />
        }

        // Authenticated and authorized - render component
        return <Component {...props} />
      }}
    />
  )
}

/**
 * PublicRoute Component
 * Redirects to dashboard if already authenticated
 * Allows unauthenticated access
 */
export function PublicRoute({ component: Component, ...rest }) {
  const { isAuthenticated } = useAuth()

  return (
    <Route
      {...rest}
      render={(props) => {
        // Already authenticated - redirect to dashboard
        if (isAuthenticated) {
          return <Redirect to="/app/dashboard" />
        }

        // Not authenticated - render component
        return <Component {...props} />
      }}
    />
  )
}

/**
 * AdminRoute Component
 * Only administrators can access
 */
export function AdminRoute({ component: Component, ...rest }) {
  const { isAuthenticated, user } = useAuth()

  return (
    <Route
      {...rest}
      render={(props) => {
        // Not authenticated - redirect to login
        if (!isAuthenticated) {
          return <Redirect to="/login" />
        }

        // Not admin - redirect to unauthorized
        if (user?.role !== 'Administrator') {
          return <Redirect to="/unauthorized" />
        }

        // Is admin - render component
        return <Component {...props} />
      }}
    />
  )
}

/**
 * Unauthorized Page Component
 */
export function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-700 dark:text-gray-200">403</h1>
        <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">
          Access Denied
        </p>
        <p className="mb-8 text-gray-500 dark:text-gray-500">
          You don't have permission to access this page. Please check your account type
          or contact an administrator.
        </p>
        <a
          href="/app/dashboard"
          className="inline-block px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  )
}
