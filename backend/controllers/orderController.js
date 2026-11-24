const { getDatabase, getClient } = require('../config/database')
const { toObjectId, withIds } = require('../utils/mongo')
const { sendOrderSms } = require('../utils/sms')
const { transitionOrder, restoreStockForCancellation, normalizeStatus } = require('../utils/orderState')

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
      const now = new Date()
      const order = { customerId: toObjectId(req.user.userId), totalAmount: total, status: 'PENDING', paymentStatus: 'PENDING', statusHistory: [{ status: 'PENDING', changedAt: now, changedBy: 'system', note: 'Order placed' }], paymentMethod: 'CASH_ON_DELIVERY', phoneNumber, deliveryAddress: deliveryAddress.trim(), items: prepared, createdAt: now, updatedAt: now }
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
async function detail(req, res, next) {
  try {
    const db = getDatabase()
    const orderId = toObjectId(req.params.id)
    if (!orderId) return res.status(400).json({ message: 'Invalid order id' })
    const order = await db.collection('orders').findOne({ _id: orderId })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (req.user.role === 'CUSTOMER' && order.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You cannot view this order' })
    }
    const [customer, payment] = await Promise.all([
      db.collection('users').findOne({ _id: order.customerId }),
      db.collection('payments').findOne({ orderId }, { sort: { createdAt: -1 } }),
    ])
    res.json({
      ...withIds([order])[0],
      customerName: customer?.fullName,
      paymentStatus: order.paymentStatus || (payment?.status === 'SUCCESS' ? 'PAID' : payment?.status || 'PENDING'),
      statusHistory: Array.isArray(order.statusHistory) ? order.statusHistory : [{
        status: normalizeStatus(order.status),
        changedAt: order.createdAt,
        changedBy: 'system',
        note: 'Order placed',
      }],
    })
  } catch (error) { next(error) }
}
async function all(req, res, next) {
  try {
    const db = getDatabase()
    const rows = await db.collection('orders').find().sort({ createdAt: -1 }).toArray()
    const orders = await Promise.all(rows.map(async (row) => {
      const [customer, payment] = await Promise.all([
        db.collection('users').findOne({ _id: row.customerId }),
        db.collection('payments').findOne({ orderId: row._id }, { sort: { createdAt: -1 } }),
      ])
      return {
        ...withIds([row])[0],
        customerName: customer?.fullName,
        paymentStatus: row.paymentStatus || (payment?.status === 'SUCCESS' ? 'PAID' : payment?.status || 'PENDING'),
        paymentMethod: row.paymentMethod || payment?.paymentMethod,
      }
    }))
    res.json(orders)
  } catch (error) { next(error) }
}
async function updateStatus(req, res, next) {
  try {
    const changedBy = req.user.role === 'ADMIN' ? `admin:${req.user.userId}` : `staff:${req.user.userId}`
    const updated = await transitionOrder(toObjectId(req.params.id), req.body.status, {
      changedBy,
      note: req.body.note || '',
      override: req.user.role === 'ADMIN',
    })
    res.json({ message: 'Order status updated', order: withIds([updated])[0] })
  } catch (error) { next(error) }
}
async function confirmOrder(req, res, next) {
  const useTransactions = process.env.MONGODB_TRANSACTIONS === 'true'
  const session = useTransactions ? getClient().startSession() : null
  try {
    const db = getDatabase()
    const orderId = toObjectId(req.params.id)
    if (!orderId) return res.status(400).json({ message: 'Invalid order id' })
    let result
    const execute = async (activeSession) => {
      const options = activeSession ? { session: activeSession } : {}
      const order = await db.collection('orders').findOne({ _id: orderId }, options)
      if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 })
      if (String(order.status).toUpperCase() === 'CANCELLED') throw Object.assign(new Error('Cancelled orders cannot be confirmed'), { statusCode: 409 })
      await db.collection('orders').updateOne({ _id: orderId }, { $set: { paymentStatus: 'PAID', confirmedAt: new Date(), confirmedBy: toObjectId(req.user.userId), updatedAt: new Date() } }, options)
      await db.collection('payments').updateMany({ orderId }, { $set: { status: 'SUCCESS', paidAt: new Date(), confirmedBy: toObjectId(req.user.userId), updatedAt: new Date() } }, options)
      await transitionOrder(orderId, 'CONFIRMED', { changedBy: `admin:${req.user.userId}`, note: 'Order confirmed and payment marked paid' })
      result = await db.collection('orders').findOne({ _id: orderId }, options)
    }
    if (useTransactions) await session.withTransaction(() => execute(session))
    else await execute(null)
    res.json({ message: 'Order confirmed', order: withIds([result])[0] })
  } catch (error) { next(error) } finally { if (session) await session.endSession() }
}

async function checkout(req, res, next) {
  const useTransactions = process.env.MONGODB_TRANSACTIONS === 'true'
  const session = useTransactions ? getClient().startSession() : null
  try {
    const db = getDatabase()
    const customerId = toObjectId(req.user.userId)
    const cart = await db.collection('carts').findOne({ customerId })
    if (!cart?.items?.length) return res.status(400).json({ message: 'Cart is empty' })
    const { deliveryAddress = '', phoneNumber = '' } = req.body
    let createdOrder
    let total = 0
    const execute = async (activeSession) => {
      const options = activeSession ? { session: activeSession } : {}
      const prepared = []
      for (const cartItem of cart.items) {
        const quantity = Number(cartItem.quantity)
        if (!Number.isInteger(quantity) || quantity < 1) throw Object.assign(new Error('Cart quantities must be positive whole numbers'), { statusCode: 400 })
        const produceId = toObjectId(cartItem.produceId)
        const produce = produceId && await db.collection('produce').findOne({ _id: produceId, status: 'ACTIVE' }, options)
        if (!produce) throw Object.assign(new Error('One or more cart items are no longer available'), { statusCode: 409 })
        if (Number(produce.inventory?.quantityAvailable || 0) < quantity) throw Object.assign(new Error(`${produce.name} has only ${produce.inventory.quantityAvailable} ${produce.unit} available`), { statusCode: 409 })
        const unitPrice = Number(produce.sellingPrice)
        const subtotal = unitPrice * quantity
        total += subtotal
        prepared.push({ produceId, produceName: produce.name, unit: produce.unit, quantityKg: quantity, unitPrice, subtotal })
      }
      const order = {
        customerId,
        totalAmount: Math.round(total * 100) / 100,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        statusHistory: [{ status: 'PENDING', changedAt: new Date(), changedBy: 'system', note: 'Order placed' }],
        paymentMethod: req.body.paymentMethod === 'MPESA' ? 'MPESA' : 'CASH_ON_DELIVERY',
        deliveryAddress: String(deliveryAddress).trim(),
        phoneNumber: String(phoneNumber).trim(),
        items: prepared,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const inserted = await db.collection('orders').insertOne(order, options)
      createdOrder = inserted.insertedId
      await db.collection('payments').insertOne({ orderId: createdOrder, amount: order.totalAmount, paymentMethod: order.paymentMethod, phoneNumber: order.phoneNumber, status: 'PENDING', createdAt: new Date() }, options)
      for (const item of prepared) {
        const stockUpdate = await db.collection('produce').updateOne({ _id: item.produceId, 'inventory.quantityAvailable': { $gte: item.quantityKg } }, { $inc: { 'inventory.quantityAvailable': -item.quantityKg }, $set: { 'inventory.updatedAt': new Date() } }, options)
        if (stockUpdate.matchedCount !== 1) throw Object.assign(new Error('Produce stock changed during checkout'), { statusCode: 409 })
      }
      await db.collection('carts').updateOne({ customerId }, { $set: { items: [], updatedAt: new Date() } }, options)
    }
    if (useTransactions) await session.withTransaction(() => execute(session))
    else await execute(null)
    res.status(201).json({ orderId: createdOrder.toString(), totalAmount: Math.round(total * 100) / 100, status: 'PENDING', paymentStatus: 'PENDING' })
  } catch (error) { next(error) } finally { if (session) await session.endSession() }
}

async function cancelForCustomer(req, res, next) {
  try {
    const db = getDatabase()
    const orderId = toObjectId(req.params.id)
    const order = orderId && await db.collection('orders').findOne({ _id: orderId, customerId: toObjectId(req.user.userId) })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (!['PENDING', 'CONFIRMED'].includes(normalizedStatus(order.status))) {
      return res.status(409).json({ message: 'This order can no longer be cancelled' })
    }
    await restoreStockForCancellation(order)
    const paid = ['SUCCESS', 'PAID'].includes(String(order.paymentStatus).toUpperCase())
    await db.collection('orders').updateOne({ _id: orderId }, { $set: { paymentStatus: paid ? 'REFUND_PENDING' : order.paymentStatus || 'PENDING', updatedAt: new Date() } })
    const updated = await transitionOrder(orderId, 'CANCELLED', { changedBy: `customer:${req.user.userId}`, note: 'Cancelled by customer' })
    res.json({ message: 'Order cancelled', order: withIds([updated])[0] })
  } catch (error) { next(error) }
}

async function receiveOrder(req, res, next) {
  try {
    const orderId = toObjectId(req.params.id)
    const order = orderId && await getDatabase().collection('orders').findOne({ _id: orderId, customerId: toObjectId(req.user.userId) })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (normalizedStatus(order.status) !== 'OUT_FOR_DELIVERY') return res.status(409).json({ message: 'You can confirm receipt only while the order is out for delivery' })
    const updated = await transitionOrder(orderId, 'DELIVERED', { changedBy: `customer:${req.user.userId}`, note: 'Customer confirmed receipt' })
    res.json({ message: 'Order received', order: withIds([updated])[0] })
  } catch (error) { next(error) }
}

async function reportProblem(req, res, next) {
  try {
    const orderId = toObjectId(req.params.id)
    const db = getDatabase()
    const order = orderId && await db.collection('orders').findOne({ _id: orderId, customerId: toObjectId(req.user.userId) })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    await db.collection('orders').updateOne({ _id: orderId }, { $set: { problemReported: true, problemNote: String(req.body.note || '').trim(), problemReportedAt: new Date(), updatedAt: new Date() } })
    res.json({ message: 'Problem reported to the administrator' })
  } catch (error) { next(error) }
}

async function staffStatus(req, res, next) {
  try {
    const orderId = toObjectId(req.params.id)
    const target = normalizedStatus(req.body.status)
    const changedBy = `admin:${req.user.userId}`
    const updated = await transitionOrder(orderId, target, { changedBy, note: req.body.note || '', override: req.user.role === 'ADMIN' })
    res.json({ message: `Order status changed to ${target}`, order: withIds([updated])[0] })
  } catch (error) { next(error) }
}

async function attention(req, res, next) {
  try {
    const db = getDatabase()
    const cutoff = new Date(Date.now() - Number(process.env.ORDER_AUTO_DELIVER_DAYS || 3) * 24 * 60 * 60 * 1000)
    const rows = await db.collection('orders').find({
      $or: [
        { problemReported: true },
        { paymentStatus: 'REFUND_PENDING' },
        { status: 'OUT_FOR_DELIVERY', outForDeliveryAt: { $lte: cutoff } },
      ],
    }).sort({ updatedAt: -1 }).toArray()
    res.json(withIds(rows))
  } catch (error) { next(error) }
}

module.exports = { create, mine, detail, all, updateStatus, confirmOrder, checkout, cancelForCustomer, receiveOrder, reportProblem, staffStatus, attention }
