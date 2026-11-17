import React, { useEffect, useState } from 'react'
import PageTitle from '../components/Typography/PageTitle'
import { apiRequest } from '../utils/api'

function Reports() {
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { apiRequest('/reports/dashboard').then(setReport).catch((requestError) => setError(requestError.message)) }, [])

  return (
    <>
      <PageTitle>Reports & Analytics</PageTitle>
      {error && <p className="mb-4 text-red-600">{error}</p>}
      <div className="grid gap-6 md:grid-cols-3">{report && Object.entries(report).map(([key, value]) => <div key={key} className="p-5 bg-white rounded-lg shadow-md dark:bg-gray-800"><p className="text-sm text-gray-500">{key.replace(/([A-Z])/g, ' $1')}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>)}</div>
    </>
  )
}

export default Reports
