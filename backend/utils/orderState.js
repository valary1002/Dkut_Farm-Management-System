const { getDatabase } = require('../config/database')
const { sendOrderSms } = require('./sms')

const ALLOWED = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
}

function normalizeStatus(status) {
  return String(status || 'PENDING').toUpperCase().replace(/-/g, '_')
}

function isAllowed(from, to) {
  return (ALLOWED[from] || []).includes(to)
}

async function notifyStatus(order, nextStatus) {
  try {
    await getDatabase().collection('notifications').insertOne({
      customerId: order.customerId,
      orderId: order._id,
      type: 'ORDER_STATUS',
      title: `Order ${order._id.toString()} updated`,
      message: `Your order is now ${nextStatus.toLower?.() || String(nextStatus).toLowerCase().replaceAll('_', ' ')}.`,
      read: false,
      createdAt: new Date(),
    })
  } catch (error) {
    console.error('In-app order notification failed:', error)
  }

  try {
    await sendOrderSms({
      phoneNumber: order.phoneNumber,
      orderId: order._id.toString(),
      totalAmount: order.totalAmount,
      deliveryAddress: order.deliveryAddress,
      messageOverride: `DKUT Farm: Order #${order._id} status changed to ${nextStatus.toLowerCase().replaceAll('_', ' ')}.`,
    })
  } catch (error) {
    console.error('SMS order status notification failed:', error)
  }
}

async function transitionOrder(orderId, nextStatus, options = {}) {
  const db = getDatabase()
  const normalized = normalizeStatus(nextStatus)
  const order = await db.collection('orders').findOne({ _id: orderId })
  if (!order) {
    const error = new Error('Order not found')
    error.statusCode = 404
    throw error
  }

  const current = normalizeStatus(order.status)
  if (current === normalized) return order

  if (normalized === 'DELIVERED' && !isAllowed(current, normalized) && options.override !== true) {
    const error = new Error(`Invalid status transition: ${current} -> ${normalized}`)
    error.statusCode = 409
    throw error
  }
  if (!options.override && !isAllowed(current, normalized)) {
    const error = new Error(`Invalid status transition: ${current} -> ${normalized}`)
    error.statusCode = 409
    throw error
  }

  const now = new Date()
  const history = Array.isArray(order.statusHistory) ? order.statusHistory : []
  const entry = {
    status: normalized,
    changedAt: now,
    changedBy: options.changedBy || 'system',
    note: options.note || '',
  }
  const changes = {
    status: normalized,
    statusHistory: [...history, entry],
    updatedAt: now,
  }
  if (normalized === 'OUT_FOR_DELIVERY') changes.outForDeliveryAt = now
  if (normalized === 'DELIVERED') changes.deliveredAt = now

  await db.collection('orders').updateOne({ _id: orderId }, { $set: changes })
  const updated = await db.collection('orders').findOne({ _id: orderId })
  await notifyStatus(updated, normalized)
  return updated
}

async function restoreStockForCancellation(order) {
  const db = getDatabase()
  for (const item of order.items || []) {
    await db.collection('produce').updateOne(
      { _id: item.produceId },
      { $inc: { 'inventory.quantityAvailable': Number(item.quantityKg || 0) }, $set: { 'inventory.updatedAt': new Date() } }
    )
  }
}

module.exports = { ALLOWED, normalizeStatus, transitionOrder, restoreStockForCancellation }
