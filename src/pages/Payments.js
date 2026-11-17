import React, { useEffect, useState } from 'react'
import PageTitle from '../components/Typography/PageTitle'
import { apiRequest } from '../utils/api'

function Payments() {
  const [payments, setPayments] = useState([])
  const [error, setError] = useState('')
  useEffect(() => { apiRequest('/payments').then(setPayments).catch((requestError) => setError(requestError.message)) }, [])
  const updateStatus = async (id, status) => { try { await apiRequest(`/payments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); setPayments((items) => items.map((payment) => payment.id === id ? { ...payment, status } : payment)) } catch (requestError) { setError(requestError.message) } }

  return (
    <>
      <PageTitle>Payments Management</PageTitle>
      {error && <p className="mb-4 text-red-600">{error}</p>}
      <div className="overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800"><table className="w-full"><thead><tr className="text-xs text-left uppercase border-b"><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Order</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id} className="border-b dark:border-gray-700"><td className="px-4 py-3">#{payment.id}</td><td className="px-4 py-3">#{payment.orderId}</td><td className="px-4 py-3">KES {payment.amount}</td><td className="px-4 py-3"><select value={payment.status} onChange={(event) => updateStatus(payment.id, event.target.value)}><option>PENDING</option><option>SUCCESS</option><option>FAILED</option><option>REFUNDED</option></select></td></tr>)}</tbody></table></div>
    </>
  )
}

export default Payments
