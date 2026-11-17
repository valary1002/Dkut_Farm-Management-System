import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import AccessibleNavigationAnnouncer from './components/AccessibleNavigationAnnouncer'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, PublicRoute, UnauthorizedPage } from './components/ProtectedRoute'

const Layout = lazy(() => import('./containers/Layout'))
const Login = lazy(() => import('./pages/Login'))
const CreateAccount = lazy(() => import('./pages/CreateAccount'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))

// Loading fallback component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900" role="status" aria-live="polite">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary-200 border-t-primary-700">
        </div>
        <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">Loading DKUT Farm Management System...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AccessibleNavigationAnnouncer />
        <Suspense fallback={<LoadingSpinner />}>
          <Switch>
            {/* Public Routes - redirect to dashboard if already authenticated */}
            <PublicRoute path="/login" component={Login} />
            <PublicRoute path="/create-account" component={CreateAccount} />
            <PublicRoute path="/forgot-password" component={ForgotPassword} />

            {/* Unauthorized Page */}
            <Route path="/unauthorized" component={UnauthorizedPage} />

            {/* Protected Dashboard and Farm Management Routes */}
            {/* Wraps /app paths to require authentication */}
            <ProtectedRoute path="/app" component={Layout} />

            {/* Fallback redirects */}
            <Redirect exact from="/" to="/login" />
            <Redirect to="/login" />
          </Switch>
        </Suspense>
      </Router>
    </AuthProvider>
  )
}

export default App
