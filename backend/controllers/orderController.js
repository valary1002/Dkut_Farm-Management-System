const { getDatabase, getClient } = require('../config/database')
const { toObjectId, withIds } = require('../utils/mongo')
const { sendOrderSms } = require('../utils/sms')

async function create(req, res, next) {
  const useTransactions = process.env.MONGODB_TRANSACTIONS === 'true'
  const session = useTransactions ? getClient().startSession() : null
  try {
    const { items, deliveryAddress, phoneNumber } = req.body
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'At least one order item is required' })
    if (!String(deliveryAddress || '').trim()) return res.status(400).json({ message: 'A delivery address is required' })
    const db = getDatabase()
    let createdOrder
    let total = 0
    const executeOrder = async (activeSession) => {
      const options = activeSession ? { session: activeSession } : {}
      const prepared = []
      for (const item of items) {
        const productId = toObjectId(item.produceId)
        const quantityKg = Number(item.quantityKg)
        if (!productId || !Number.isFinite(quantityKg) || quantityKg <= 0) throw Object.assign(new Error('Each order quantity must be greater than zero'), { statusCode: 400 })
        const product = productId && await db.collection('produce').findOne({ _id: productId, status: 'ACTIVE' }, options)
        if (!product || Number(product.inventory?.quantityAvailable) < quantityKg) throw Object.assign(new Error('Produce unavailable or insufficient stock'), { statusCode: 400 })
        const subtotal = Number(product.sellingPrice) * quantityKg
        total += subtotal
        prepared.push({ produceId: productId, produceName: product.name, unit: product.unit, quantityKg, unitPrice: Number(product.sellingPrice), subtotal })
      }
      const order = { customerId: toObjectId(req.user.userId), totalAmount: total, status: 'PENDING', paymentMethod: 'CASH_ON_DELIVERY', phoneNumber, deliveryAddress: deliveryAddress.trim(), items: prepared, createdAt: new Date(), updatedAt: new Date() }
      const result = await db.collection('orders').insertOne(order, options)
      createdOrder = result.insertedId
      await db.collection('payments').insertOne({ orderId: createdOrder, amount: total, paymentMethod: 'CASH_ON_DELIVERY', phoneNumber, status: 'PENDING', createdAt: new Date() }, options)
      for (const item of prepared) {
        const stockFilter = { _id: item.produceId, 'inventory.quantityAvailable': { $gte: item.quantityKg } }
        const stockUpdate = await db.collection('produce').updateOne(stockFilter, { $inc: { 'inventory.quantityAvailable': -item.quantityKg }, $set: { 'inventory.updatedAt': new Date() } }, options)
        if (stockUpdate.matchedCount !== 1) throw Object.assign(new Error('Produce unavailable or insufficient stock'), { statusCode: 400 })
      }
    }
    if (useTransactions) await session.withTransaction(() => executeOrder(session))
    else await executeOrder(null)
    let notification
    try {
      notification = await sendOrderSms({ phoneNumber, orderId: createdOrder.toString(), totalAmount: total, deliveryAddress: deliveryAddress.trim() })
    } catch (error) {
      notification = { sent: false, message: `Order received, but the SMS could not be sent: ${error.message}` }
    }
    res.status(201).json({ orderId: createdOrder.toString(), totalAmount: total, status: 'PENDING', paymentMethod: 'CASH_ON_DELIVERY', notification })
  } catch (error) { next(error) } finally { if (session) await session.endSession() }
}
async function mine(req, res, next) {
  try {
    const db = getDatabase()
    const rows = await db.collection('orders').find({ customerId: toObjectId(req.user.userId) }).sort({ createdAt: -1 }).toArray()
    const orders = await Promise.all(rows.map(async (row) => {
      const payment = await db.collection('payments').findOne({ orderId: row._id }, { projection: { status: 1, paymentMethod: 1 } })
      return { ...withIds([row])[0], paymentStatus: payment?.status || 'PENDING', paymentMethod: payment?.paymentMethod || row.paymentMethod || 'CASH_ON_DELIVERY' }
    }))
    res.json(orders)
  } catch (error) { next(error) }
}
async function all(req, res, next) { try { const rows = await getDatabase().collection('orders').find().sort({ createdAt: -1 }).toArray(); const db = getDatabase(); res.json(await Promise.all(rows.map(async (row) => ({ ...withIds([row])[0], customerName: (await db.collection('users').findOne({ _id: row.customerId }))?.fullName })))) } catch (error) { next(error) } }
async function updateStatus(req, res, next) { try { await getDatabase().collection('orders').updateOne({ _id: toObjectId(req.params.id) }, { $set: { status: req.body.status, updatedAt: new Date() } }); res.json({ message: 'Order status updated' }) } catch (error) { next(error) } }
module.exports = { create, mine, all, updateStatus }
