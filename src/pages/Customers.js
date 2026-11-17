import React, { useEffect, useState } from 'react'
import PageTitle from '../components/Typography/PageTitle'
import { apiRequest } from '../utils/api'

function Customers() {
  const [customers, setCustomers] = useState([])
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    apiRequest('/users')
      .then(setCustomers)
      .catch((requestError) => setError(requestError.message))
  }, [])

  const updateStatus = async (id, status) => {
    try {
      await apiRequest(`/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
      setCustomers((items) => items.map((customer) => customer.id === id ? { ...customer, status } : customer))
    } catch (requestError) { setError(requestError.message) }
  }

  const filteredCustomers = customers.filter((customer) => `${customer.fullName} ${customer.email} ${customer.phone}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      <PageTitle>Customer Management</PageTitle>
      {error && <p className="mb-4 text-red-600">{error}</p>}
      <input className="w-full p-3 mb-4 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="Search customers" value={search} onChange={(event) => setSearch(event.target.value)} />
      <div className="overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800">
        <table className="w-full whitespace-no-wrap">
          <thead><tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 dark:text-gray-400"><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Status</th></tr></thead>
          <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
            {filteredCustomers.map((customer) => <tr key={customer.id} className="text-gray-700 dark:text-gray-400"><td className="px-4 py-3 text-sm">{customer.fullName}</td><td className="px-4 py-3 text-sm">{customer.email}</td><td className="px-4 py-3 text-sm">{customer.phone}</td><td className="px-4 py-3 text-sm"><select value={customer.status} onChange={(event) => updateStatus(customer.id, event.target.value)}><option>ACTIVE</option><option>DISABLED</option></select></td></tr>)}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default Customers
