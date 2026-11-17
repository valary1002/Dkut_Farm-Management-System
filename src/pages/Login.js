import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'

import uploadedLogin from '../assets/img/uploaded-login.jpg'
import { Label, Input, Button, HelperText } from '@windmill/react-ui'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'

function Login() {
  const history = useHistory()
  const { login, isLoading, error } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const validateForm = () => {
    const errors = {}

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    return errors
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    const errors = validateForm()

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})
    const result = await login(formData.email, formData.password)

    if (result && result.success) {
      history.push('/app/dashboard')
    } else {
      setFormErrors({ submit: result?.error || 'Login failed' })
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (formErrors[name]) setFormErrors({ ...formErrors, [name]: '' })
  }

  return (
    <div>
      <Header showSearch={false} />
      <div className="flex items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
        <div className="flex-1 h-full max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-800">
          <div className="flex flex-col overflow-y-auto md:flex-row">
            <div
              aria-hidden="true"
              role="img"
              aria-label="Farm field"
              className="relative h-32 md:h-auto md:w-1/2 bg-cover bg-center"
              style={{ backgroundImage: `url(${uploadedLogin})` }}
            >
              <div className="absolute inset-0" aria-hidden="true" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} />
            </div>

            <main className="flex items-center justify-center p-6 sm:p-12 md:w-1/2">
              <div className="w-full">
                <h1 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">Login to DKUT Farm</h1>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                {formErrors.submit && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded">
                    <p className="text-sm text-red-700 dark:text-red-300">{formErrors.submit}</p>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label>
                      <span className="text-gray-700 dark:text-gray-200">Email Address</span>
                    </Label>
                    <Input
                      className="mt-1 dark:bg-gray-700 dark:text-gray-200"
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    {formErrors.email && <HelperText valid={false}>{formErrors.email}</HelperText>}
                  </div>

                  <div>
                    <Label>
                      <span className="text-gray-700 dark:text-gray-200">Password</span>
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        className="dark:bg-gray-700 dark:text-gray-200"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="***************"
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm"
                      >
                        {showPassword ? '✓' : '○'}
                      </button>
                    </div>
                    {formErrors.password && <HelperText valid={false}>{formErrors.password}</HelperText>}
                  </div>

                  <Button type="submit" block className="mt-6" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Log In'}
                  </Button>
                </form>

                <hr className="my-6" />

                <p className="text-center mb-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link className="text-sm font-medium text-green-600 dark:text-green-400 hover:underline" to="/create-account">
                      Create one now
                    </Link>
                  </span>
                </p>

                <p className="text-center">
                  <Link className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:underline" to="/forgot-password">
                    Forgot your password?
                  </Link>
                </p>

              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
