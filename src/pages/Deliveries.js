import React, { useEffect, useState } from 'react'
import PageTitle from '../components/Typography/PageTitle'
import { apiRequest } from '../utils/api'

function Deliveries() {
  const [deliveries, setDeliveries] = useState([])
  const [orders, setOrders] = useState([])
  const [orderId, setOrderId] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [error, setError] = useState('')
  useEffect(() => { Promise.all([apiRequest('/deliveries'), apiRequest('/orders')]).then(([deliveryRows, orderRows]) => { setDeliveries(deliveryRows); setOrders(orderRows) }).catch((requestError) => setError(requestError.message)) }, [])
  const createDelivery = async (event) => { event.preventDefault(); try { const created = await apiRequest(`/deliveries/orders/${orderId}`, { method: 'POST', body: JSON.stringify({ deliveryAddress, assignedTo }) }); const order = orders.find((item) => item.id === orderId); setDeliveries((items) => [...items, { id: created.id, orderId, deliveryAddress: deliveryAddress || order?.deliveryAddress, assignedTo, deliveryStatus: 'PENDING' }]); setOrderId(''); setDeliveryAddress(''); setAssignedTo('') } catch (requestError) { setError(requestError.message) } }
  const updateStatus = async (id, status) => { try { await apiRequest(`/deliveries/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); setDeliveries((items) => items.map((delivery) => delivery.id === id ? { ...delivery, deliveryStatus: status } : delivery)) } catch (requestError) { setError(requestError.message) } }

  return (
    <>
      <PageTitle>Delivery Management</PageTitle>
      {error && <p className="mb-4 text-red-600">{error}</p>}
      <form className="grid gap-3 p-4 mb-6 bg-white rounded-lg shadow-md dark:bg-gray-800 md:grid-cols-4" onSubmit={createDelivery}><select required value={orderId} onChange={(event) => setOrderId(event.target.value)}><option value="">Select order</option>{orders.map((order) => <option key={order.id} value={order.id}>#{order.id}</option>)}</select><input required className="p-2 border rounded" placeholder="Delivery address" value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} /><input className="p-2 border rounded" placeholder="Assigned to" value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} /><button className="px-4 py-2 text-white bg-green-600 rounded" type="submit">Create delivery</button></form>
      <div className="overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800"><table className="w-full"><thead><tr className="text-xs text-left uppercase border-b"><th className="px-4 py-3">Order</th><th className="px-4 py-3">Address</th><th className="px-4 py-3">Assigned to</th><th className="px-4 py-3">Status</th></tr></thead><tbody>{deliveries.map((delivery) => <tr key={delivery.id} className="border-b dark:border-gray-700"><td className="px-4 py-3">#{delivery.orderId}</td><td className="px-4 py-3">{delivery.deliveryAddress}</td><td className="px-4 py-3">{delivery.assignedTo || '-'}</td><td className="px-4 py-3"><select value={delivery.deliveryStatus} onChange={(event) => updateStatus(delivery.id, event.target.value)}><option>PENDING</option><option>SCHEDULED</option><option>OUT_FOR_DELIVERY</option><option>DELIVERED</option><option>CANCELLED</option></select></td></tr>)}</tbody></table></div>
    </>
  )
}

export default Deliveries
