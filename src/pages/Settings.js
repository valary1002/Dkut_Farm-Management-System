import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import PageTitle from '../components/Typography/PageTitle'
import { Button, Input, Label } from '@windmill/react-ui'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../utils/api'

function Settings() {
  const { logout } = useAuth()
  const history = useHistory()
  const [farmName, setFarmName] = useState(() => localStorage.getItem('dkut_farm_name') || 'DKUT Farm')
  const [emailNotifications, setEmailNotifications] = useState(() => localStorage.getItem('dkut_email_notifications') !== 'false')
  const [message, setMessage] = useState('')
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordError, setPasswordError] = useState('')
  const saveSettings = (event) => {
    event.preventDefault()
    localStorage.setItem('dkut_farm_name', farmName)
    localStorage.setItem('dkut_email_notifications', emailNotifications)
    setMessage('Settings updated successfully.')
  }

  const changePassword = async (event) => {
    event.preventDefault()
    setPasswordError('')
    setMessage('')
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    try {
      await apiRequest('/users/me/password', { method: 'PATCH', body: JSON.stringify(passwordForm) })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setMessage('Password changed successfully.')
    } catch (error) {
      setPasswordError(error.message)
    }
  }

  const handleLogout = () => {
    logout()
    history.push('/login')
  }

  return (
    <>
      <PageTitle>System Settings</PageTitle>

      <div className="grid gap-6 mb-8 md:grid-cols-2">
        <div className="px-4 py-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h2 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">Account</h2>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Update your personal information or securely end your session.</p>
          <div className="flex flex-wrap gap-3">
            <Link className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-700 rounded-md hover:bg-primary-800" to="/app/profile">Edit Profile</Link>
            <Button type="button" layout="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
        <div className="px-4 py-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h2 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">About the system</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">DKUT Farm Management System supports produce sales, inventory management, customer orders and casual farm-work applications.</p>
        </div>
      </div>

      <div className="px-4 py-6 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-200">
          Configure System Settings
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Manage system configuration, set farm details, configure notification preferences, 
          and adjust application settings.
        </p>
        <form className="max-w-md" onSubmit={saveSettings}><Label className="mb-4"><span>Farm name</span><Input className="mt-1" value={farmName} onChange={(event) => setFarmName(event.target.value)} /></Label><label className="flex items-center gap-3 mb-6 text-gray-700 dark:text-gray-300"><input type="checkbox" checked={emailNotifications} onChange={(event) => setEmailNotifications(event.target.checked)} /> Email notifications</label><Button type="submit">Update Settings</Button>{message && <p className="mt-4 text-sm text-green-600">{message}</p>}</form>
      </div>

      <div className="px-4 py-6 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">Change Password</h2>
        <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">Use at least 8 characters for your new password.</p>
        {passwordError && <p className="mb-4 text-sm text-red-600" role="alert">{passwordError}</p>}
        <form className="max-w-md space-y-4" onSubmit={changePassword}>
          <Label><span>Current password</span><Input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} required /></Label>
          <Label><span>New password</span><Input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} minLength="8" required /></Label>
          <Label><span>Confirm new password</span><Input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} minLength="8" required /></Label>
          <Button type="submit">Change Password</Button>
        </form>
      </div>
    </>
  )
}

export default Settings
