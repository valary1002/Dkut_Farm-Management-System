const { getDatabase } = require('../config/database')
const { transitionOrder, restoreStockForCancellation } = require('./orderState')

async function runOrderMaintenance() {
  const db = getDatabase()
  const timeoutHours = Number(process.env.ORDER_PAYMENT_TIMEOUT_HOURS || 24)
  const autoDeliverDays = Number(process.env.ORDER_AUTO_DELIVER_DAYS || 3)
  const now = new Date()
  const timeoutCutoff = new Date(now.getTime() - timeoutHours * 60 * 60 * 1000)
  const deliveryCutoff = new Date(now.getTime() - autoDeliverDays * 24 * 60 * 60 * 1000)

  const timedOut = await db.collection('orders').find({
    status: 'PENDING',
    createdAt: { $lte: timeoutCutoff },
  }).toArray()

  let cancelled = 0
  for (const order of timedOut) {
    const payment = await db.collection('payments').findOne({ orderId: order._id })
    if (payment?.status === 'SUCCESS' || ['SUCCESS', 'PAID'].includes(String(order.paymentStatus).toUpperCase())) continue
    await restoreStockForCancellation(order)
    await db.collection('orders').updateOne({ _id: order._id }, { $set: { paymentStatus: 'FAILED', updatedAt: now } })
    await transitionOrder(order._id, 'CANCELLED', { changedBy: 'system', note: `Payment timed out after ${timeoutHours} hours` })
    await db.collection('payments').updateMany({ orderId: order._id }, { $set: { status: 'FAILED', failureReason: 'Payment timeout', updatedAt: now } })
    cancelled++
  }

  const readyToDeliver = await db.collection('orders').find({
    status: 'OUT_FOR_DELIVERY',
    problemReported: { $ne: true },
    outForDeliveryAt: { $lte: deliveryCutoff },
  }).toArray()

  let delivered = 0
  for (const order of readyToDeliver) {
    await transitionOrder(order._id, 'DELIVERED', { changedBy: 'system', note: `Auto-completed after ${autoDeliverDays} days` })
    delivered++
  }

  console.log(`Order maintenance completed: cancelled=${cancelled}, delivered=${delivered}`)
  return { cancelled, delivered }
}

module.exports = { runOrderMaintenance }
