import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'

import { Input, Label, Button, HelperText, Select } from '@windmill/react-ui'
import { useAuth } from '../context/AuthContext'
import uploadedCreate from '../assets/img/uploaded-create.jpg'
import Header from '../components/Header'

function CreateAccount() {
  const history = useHistory()
  const { register, isLoading, error } = useAuth()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'Customer',
    agreeToTerms: false
  })

  const [formErrors, setFormErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const validateForm = () => {
    const errors = {}

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 3) {
      errors.fullName = 'Name must be at least 3 characters'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email'
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required'
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s|-/g, ''))) {
      errors.phone = 'Please enter a valid phone number'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the terms'
    }

    return errors
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setSubmitError('')
    const errors = validateForm()

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})

    const result = await register({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
      agreeToTerms: formData.agreeToTerms
    })

    if (result && result.success) {
      history.push('/app/dashboard')
    } else {
      setSubmitError(result?.error || 'Registration failed')
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' })
    }
  }

  return (
    <div>
      <Header />
      <div className="flex items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
        <div className="flex-1 h-full max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-800">
          <div className="flex flex-col overflow-y-auto md:flex-row">
            <div
              aria-hidden="true"
              role="img"
              aria-label="Farm crops"
              className="relative h-32 md:h-auto md:w-1/2 bg-cover bg-center"
              style={{ backgroundImage: `url(${uploadedCreate})` }}
            >
              <div className="absolute inset-0" aria-hidden="true" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} />
            </div>

            <main className="flex items-center justify-center p-6 sm:p-12 md:w-1/2 overflow-y-auto">
              <div className="w-full">
                <h1 className="mb-2 text-xl font-semibold text-gray-700 dark:text-gray-200">Create Account</h1>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Join DKUT Farm Management System</p>

                {(error || submitError) && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded">
                    <p className="text-sm text-red-700 dark:text-red-300">{error || submitError}</p>
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label>
                      <span className="text-gray-700 dark:text-gray-200">Full Name *</span>
                    </Label>
                    <Input
                      className="mt-1 dark:bg-gray-700 dark:text-gray-200"
                      type="text"
                      name="fullName"
                      placeholder="John Kipchoge"
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                    {formErrors.fullName && <HelperText valid={false}>{formErrors.fullName}</HelperText>}
                  </div>

                  <div>
                    <Label>
                      <span className="text-gray-700 dark:text-gray-200">Email Address *</span>
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
                      <span className="text-gray-700 dark:text-gray-200">Phone Number *</span>
                    </Label>
                    <Input
                      className="mt-1 dark:bg-gray-700 dark:text-gray-200"
                      type="tel"
                      name="phone"
                      placeholder="+254712345678"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                    {formErrors.phone && <HelperText valid={false}>{formErrors.phone}</HelperText>}
                  </div>

                  <div>
                    <Label>
                      <span className="text-gray-700 dark:text-gray-200">Account Type *</span>
                    </Label>
                    <Select name="role" value={formData.role} onChange={handleInputChange} className="mt-1 dark:bg-gray-700 dark:text-gray-200">
                      <option value="Customer">Customer (Buy Produce and Apply for Jobs)</option>
                      <option value="Admin" disabled>Admin (provisioned by an authorized administrator)</option>
                    </Select>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Browse and purchase farm produce or apply for casual jobs on the farm
                    </p>
                  </div>

                  <div>
                    <Label>
                      <span className="text-gray-700 dark:text-gray-200">Password *</span>
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        className="dark:bg-gray-700 dark:text-gray-200"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="At least 8 characters"
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                        {showPassword ? '✓' : '○'}
                      </button>
                    </div>
                    {formErrors.password && <HelperText valid={false}>{formErrors.password}</HelperText>}
                  </div>

                  <div>
                    <Label>
                      <span className="text-gray-700 dark:text-gray-200">Confirm Password *</span>
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        className="dark:bg-gray-700 dark:text-gray-200"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                        {showConfirmPassword ? '✓' : '○'}
                      </button>
                    </div>
                    {formErrors.confirmPassword && <HelperText valid={false}>{formErrors.confirmPassword}</HelperText>}
                  </div>

                  <div>
                    <Label check>
                      <Input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange} />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">I agree to the <span className="underline cursor-pointer">privacy policy</span> and <span className="underline cursor-pointer">terms of service</span> *</span>
                    </Label>
                    {formErrors.agreeToTerms && <HelperText valid={false}>{formErrors.agreeToTerms}</HelperText>}
                  </div>

                  <Button type="submit" block className="mt-6" disabled={isLoading}>{isLoading ? 'Creating Account...' : 'Create Account'}</Button>
                </form>

                <hr className="my-6" />

                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link className="font-medium text-primary-600 dark:text-primary-400 hover:underline" to="/login">Log in here</Link>
                </p>

              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateAccount
