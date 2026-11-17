import React, { createContext, useEffect, useState } from 'react'
import { apiRequest, setAuthToken } from '../utils/api'

// Create Auth Context
export const AuthContext = createContext()

function normalizeUser(user) {
  if (!user) return null
  return {
    ...user,
    name: user.name || user.fullName,
    role: user.role === 'ADMIN' ? 'Administrator' : 'Customer',
  }
}

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('dkut_farm_token')
    if (!token) {
      setIsLoading(false)
      return
    }

    apiRequest('/auth/me')
      .then((currentUser) => {
        setUser(normalizeUser(currentUser))
        setIsAuthenticated(true)
      })
      .catch(() => setAuthToken(null))
      .finally(() => setIsLoading(false))
  }, [])

  const login = async (email, password) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      const currentUser = normalizeUser(response.user)
      setAuthToken(response.token)
      setUser(currentUser)
      setIsAuthenticated(true)
      return { success: true, user: currentUser }
    } catch (requestError) {
      setError(requestError.message)
      setIsAuthenticated(false)
      return { success: false, error: requestError.message }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (formData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          termsAccepted: formData.agreeToTerms === true,
        }),
      })
      const currentUser = normalizeUser(response.user)
      setAuthToken(response.token)
      setUser(currentUser)
      setIsAuthenticated(true)
      return { success: true, user: currentUser }
    } catch (requestError) {
      setError(requestError.message)
      return { success: false, error: requestError.message }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Logout Function
   */
  const logout = () => {
    setAuthToken(null)
    setUser(null)
    setIsAuthenticated(false)
    setError(null)
  }

  const updateUser = async (changes) => {
    await apiRequest('/users/me', { method: 'PATCH', body: JSON.stringify(changes) })
    setUser((currentUser) => ({ ...currentUser, ...changes, name: changes.fullName || currentUser.name }))
  }

  /**
   * Check if user has specific role
   */
  const hasRole = (role) => {
    if (!user) return false
    return user.role === role
  }

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles) => {
    if (!user) return false
    return roles.includes(user.role)
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    hasAnyRole
  }

  if (isLoading && localStorage.getItem('dkut_farm_token')) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Custom Hook to use Auth Context
 * Usage: const { user, login, logout } = useAuth()
 */
export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
