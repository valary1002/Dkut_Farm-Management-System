import React, { useEffect, useState } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { Button, Input, Label } from '@windmill/react-ui'
import PageTitle from '../components/Typography/PageTitle'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../utils/api'

function JobApplicationForm() {
  const { user } = useAuth()
  const history = useHistory()
  const location = useLocation()
  const { jobId } = useParams()
  const [job, setJob] = useState(location.state?.job || null)
  const [form, setForm] = useState({ fullName: user?.name || '', email: user?.email || '', phone: user?.phone || '', address: '', applicationMessage: '' })
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!job) apiRequest('/jobs').then((jobs) => setJob(jobs.find((item) => item.id === jobId))).catch((requestError) => setError(requestError.message))
  }, [job, jobId])

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.fullName || !form.email || !form.phone || !form.address || form.applicationMessage.trim().length < 20) {
      setError('Complete your personal details and write at least 20 characters explaining why you need this job.')
      return
    }
    try {
      await apiRequest(`/applications/jobs/${jobId}`, { method: 'POST', body: JSON.stringify(form) })
      setSubmitted(true)
    } catch (requestError) { setError(requestError.message) }
  }

  if (submitted) return <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800"><PageTitle>Application submitted</PageTitle><p className="mb-6 text-gray-600 dark:text-gray-400">Your application for {job?.title} has been sent for review.</p><Button onClick={() => history.push('/app/casual-jobs')}>Back to jobs</Button></div>

  return (
    <>
      <PageTitle>Apply for {job?.title || 'Casual Job'}</PageTitle>
      <form className="max-w-2xl p-6 bg-white rounded-lg shadow-md dark:bg-gray-800" onSubmit={handleSubmit}>
        <p className="mb-6 text-gray-600 dark:text-gray-400">Tell us about yourself and why you need this opportunity.</p>
        {['fullName', 'email', 'phone', 'address'].map((field) => <Label className="mb-5" key={field}><span className="text-gray-700 capitalize dark:text-gray-300">{field === 'fullName' ? 'Full name' : field}</span><Input name={field} value={form[field]} onChange={updateField} type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'} /></Label>)}
        <Label className="mb-5"><span className="text-gray-700 dark:text-gray-300">Why do you need this job?</span><textarea name="applicationMessage" value={form.applicationMessage} onChange={updateField} rows="6" className="block w-full mt-1 border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" placeholder="Write your essay here..." /></Label>
        {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div className="flex gap-3"><Button type="submit">Submit application</Button><Button type="button" layout="outline" onClick={() => history.goBack()}>Cancel</Button></div>
      </form>
    </>
  )
}

export default JobApplicationForm