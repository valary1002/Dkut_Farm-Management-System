import React, { useState } from 'react'
import { useHistory, useLocation, Link } from 'react-router-dom'
import { Button, Input, Label } from '@windmill/react-ui'
import PageTitle from '../components/Typography/PageTitle'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../utils/api'

function Purchase() {
  const { user } = useAuth()
  const history = useHistory()
  const location = useLocation()
  const item = location.state?.item
  const [quantity, setQuantity] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [error, setError] = useState('')

  if (user?.role !== 'Customer') {
    return (
      <div className="p-6 text-center bg-white rounded-lg shadow-md dark:bg-gray-800">
        <p className="mb-4 text-gray-700 dark:text-gray-300">Only customers can place produce purchases.</p>
        <Link className="font-semibold text-green-600 hover:underline dark:text-green-400" to="/app/dashboard">
          Return home
        </Link>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="p-6 text-center bg-white rounded-lg shadow-md dark:bg-gray-800">
        <p className="mb-4 text-gray-700 dark:text-gray-300">Choose a produce item before starting a purchase.</p>
        <Button onClick={() => history.push('/app/produce')}>Browse produce</Button>
      </div>
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const requestedQuantity = Number(quantity)

    if (!requestedQuantity || requestedQuantity <= 0) {
      setError('Enter the number of kilograms you want to purchase.')
      return
    }

    if (requestedQuantity > item.quantity) {
      setError(`Only ${item.quantity} ${item.unit} of ${item.name} is available.`)
      return
    }

    const normalizedPhone = phoneNumber.replace(/\s+/g, '')
    if (!/^(?:\+254|254|0)7\d{8}$/.test(normalizedPhone)) {
      setError('Enter a valid Kenyan phone number for the order SMS, for example 0712345678.')
      return
    }

    if (!deliveryAddress.trim()) {
      setError('Enter a delivery address.')
      return
    }

    setError('')
    try {
      const order = await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify({
          deliveryAddress: deliveryAddress.trim(),
          phoneNumber: normalizedPhone,
          items: [{ produceId: item.id, quantityKg: requestedQuantity }],
        }),
      })
      history.push('/app/orders', {
        confirmation: `Order #${order.orderId} has been received for ${requestedQuantity} ${item.unit}. Payment will be collected on delivery. ${order.notification?.message || ''}`,
      })
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <>
      <PageTitle>Complete Your Purchase</PageTitle>
      <div className="grid gap-8 mb-8 lg:grid-cols-2">
        <div className="overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800">
          <img className="object-cover w-full h-64" src={item.image} alt={item.name} />
          <div className="p-6">
            <h2 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-gray-100">{item.name}</h2>
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">{item.category}</p>
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Available: {item.quantity} {item.unit}</p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">KES {item.sellingPrice} / {item.unit}</p>
          </div>
        </div>

        <form className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800" onSubmit={handleSubmit}>
          <h2 className="mb-6 text-lg font-semibold text-gray-800 dark:text-gray-100">Purchase details</h2>
          <Label className="mb-5">
            <span className="text-gray-700 dark:text-gray-300">How many kilograms?</span>
            <Input
              className="mt-1"
              type="number"
              min="1"
              max={item.quantity}
              step="0.1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder={`Up to ${item.quantity} ${item.unit}`}
            />
          </Label>
          <Label className="mb-5">
            <span className="text-gray-700 dark:text-gray-300">Phone number for order SMS</span>
            <Input
              className="mt-1"
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="0712345678"
              inputMode="tel"
            />
          </Label>
          <Label className="mb-5">
            <span className="text-gray-700 dark:text-gray-300">Delivery address</span>
            <Input
              className="mt-1"
              type="text"
              value={deliveryAddress}
              onChange={(event) => setDeliveryAddress(event.target.value)}
              placeholder="Farm Gate, DKUT"
            />
          </Label>
          {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <Button type="submit">Confirm purchase</Button>
            <Button type="button" layout="outline" onClick={() => history.goBack()}>Back to produce</Button>
          </div>
        </form>
      </div>
    </>
  )
}

export default Purchase
