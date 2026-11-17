import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLocation } from 'react-router-dom'
import PageTitle from '../components/Typography/PageTitle'
import { apiRequest } from '../utils/api'
import StatusBadge from '../components/StatusBadge'

const orderStatuses = [
  ['PENDING', 'Pending'],
  ['CONFIRMED', 'Confirmed'],
  ['PROCESSING', 'Processing'],
  ['OUT_FOR_DELIVERY', 'Out for Delivery'],
  ['DELIVERED', 'Delivered'],
  ['CANCELLED', 'Cancelled'],
]

const orderStatusLabels = orderStatuses.reduce((labels, [value, label]) => ({ ...labels, [value]: label }), {})

function Orders() {
  const { user } = useAuth()
  return user?.role === 'Customer' ? <CustomerOrders /> : <AdminOrders />
}

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiRequest('/orders')
      .then(setOrders)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsLoading(false))
  }, [])
  const updateStatus = async (id, status) => {
    try { await apiRequest(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); setOrders((items) => items.map((order) => order.id === id ? { ...order, status } : order)) } catch (requestError) { setError(requestError.message) }
  }

  return (
    <>
      <PageTitle>Orders Management</PageTitle>
      {error && <div className="dkut-alert mb-5 border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200" role="alert">{error}</div>}
      {isLoading ? (
        <div className="dkut-empty" role="status">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="dkut-empty">
          <p className="font-semibold text-gray-800 dark:text-gray-100">No orders yet</p>
          <p className="mt-1 text-sm text-gray-500">Orders will appear here when customers place them.</p>
        </div>
      ) : (
        <div className="dkut-table">
          <table className="w-full min-w-[680px]">
            <thead><tr className="text-left"><th className="px-5 py-4">Order</th><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Total</th><th className="px-5 py-4">Status</th></tr></thead>
            <tbody>{orders.map((order) => <tr key={order.id}><td className="px-5 py-4 text-sm font-semibold text-gray-800 dark:text-gray-100">#{order.id}</td><td className="px-5 py-4 text-sm">{order.customerName}</td><td className="px-5 py-4 text-sm font-semibold">KES {order.totalAmount}</td><td className="px-5 py-4"><div className="flex items-center gap-3"><StatusBadge status={orderStatusLabels[order.status] || order.status} /><label className="sr-only" htmlFor={`order-status-${order.id}`}>Update status for order {order.id}</label><select id={`order-status-${order.id}`} className="dkut-field px-2 py-1 text-xs" value={order.status} onChange={(event) => updateStatus(order.id, event.target.value)}>{orderStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></td></tr>)}</tbody>
          </table>
        </div>
      )}
    </>
  )
}

function CustomerOrders() {
  const location = useLocation()
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [success, setSuccess] = useState('')
  const confirmation = location.state?.confirmation

  useEffect(() => {
    apiRequest('/orders/my')
      .then(setOrders)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <>
      <PageTitle>My Orders</PageTitle>
      {confirmation && (
        <div className="mb-6 rounded-lg bg-green-600 px-5 py-4 text-sm text-white shadow-md" role="status">
          <p className="font-semibold">Your order has been received successfully!</p>
          <p className="mt-1 text-gray-200">{confirmation}</p>
        </div>
      )}
      {success && <div className="mb-6 rounded-lg bg-green-600 px-5 py-4 text-sm text-white shadow-md" role="status">{success}</div>}
      {error && <div className="dkut-alert mb-5 border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200" role="alert">{error}</div>}
      {isLoading ? (
        <div className="dkut-empty" role="status">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="dkut-empty">
          <p className="font-semibold text-gray-800 dark:text-gray-100">You have no orders yet</p>
          <p className="mt-1 text-sm text-gray-500">Browse fresh produce to place your first order.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <article key={order.id} className="dkut-panel p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-4 dark:border-gray-700">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Order</p>
                  <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">#{order.id}</h2>
                  <p className="mt-1 text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={orderStatusLabels[order.status] || order.status} />
                  <p className="mt-2 text-lg font-bold text-primary-700 dark:text-primary-300">KES {order.totalAmount}</p>
                </div>
                {order.paymentStatus !== 'SUCCESS' && (
                  <button
                    type="button"
                    className="mt-4 rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
                    onClick={async () => {
                      try {
                        await apiRequest(`/payments/orders/${order.id}/confirm`, { method: 'POST' })
                        setOrders((items) => items.map((item) => item.id === order.id ? { ...item, paymentStatus: 'SUCCESS', status: item.status === 'PENDING' ? 'CONFIRMED' : item.status } : item))
                        setSuccess('Your order has been received successfully! Thank you for shopping with DKUT Farm.')
                      } catch (requestError) {
                        setError(requestError.message)
                      }
                    }}
                  >
                    Confirm Payment
                  </button>
                )}
              </div>
              <div className="grid gap-4 pt-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">Delivery address</p>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">{order.deliveryAddress}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">Payment</p>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">{order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on delivery' : order.paymentMethod}</p>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Items</p>
                <ul className="space-y-2">
                  {(order.items || []).map((item, index) => (
                    <li key={`${order.id}-${index}`} className="flex justify-between gap-4 text-sm">
                      <span className="text-gray-700 dark:text-gray-200">{item.produceName} × {item.quantityKg} {item.unit}</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-100">KES {item.subtotal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}

export default Orders
