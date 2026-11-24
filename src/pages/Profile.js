import React, { useState } from 'react'
import PageTitle from '../components/Typography/PageTitle'
import { Button, Input, Label } from '@windmill/react-ui'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ fullName: user?.name || '', email: user?.email || '', phone: user?.phone || '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const saveProfile = async (event) => {
    event.preventDefault()
    setError('')
    try {
      await updateUser(form)
      setEditing(false)
      setMessage('Profile updated successfully.')
    } catch (requestError) {
      console.error('Unable to update profile:', requestError)
      setError(requestError.message)
    }
  }

  return (
    <>
      <PageTitle>User Profile</PageTitle>

      <div className="px-4 py-6 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-200">
          Manage Your Profile
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Update your personal information, change profile picture, view your role and permissions, 
          and manage account details.
        </p>
        {!editing && <Button onClick={() => setEditing(true)}>Edit Profile</Button>}
        {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
        {error && <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>}
        {editing && (
          <form className="max-w-md mt-6" onSubmit={saveProfile}>
            <Label className="mb-4"><span>Full name</span><Input className="mt-1" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /></Label>
            <Label className="mb-4"><span>Email</span><Input type="email" className="mt-1" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Label>
            <Label className="mb-4"><span>Phone</span><Input className="mt-1" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Label>
            <div className="flex gap-3"><Button type="submit">Save changes</Button><Button type="button" layout="outline" onClick={() => setEditing(false)}>Cancel</Button></div>
          </form>
        )}
      </div>
    </>
  )
}

export default Profile
