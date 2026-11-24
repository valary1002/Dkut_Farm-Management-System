const { getDatabase } = require('../config/database')
const { toObjectId, withIds } = require('../utils/mongo')
const { transitionOrder } = require('../utils/orderState')

function normalizePhone(phone) {
  const value = String(phone || '').replace(/\s+/g, '')
  if (value.startsWith('+254')) return value.slice(1)
  if (value.startsWith('0')) return `254${value.slice(1)}`
  return value
}

async function requestStkPush({ amount, phone, accountReference }) {
  const { MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, MPESA_PASSKEY, MPESA_CALLBACK_URL } = process.env
  if (![MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, MPESA_PASSKEY, MPESA_CALLBACK_URL].every(Boolean)) return { sent: false, message: 'Payment recorded. Add Daraja M-Pesa settings to enable the STK prompt.' }
  const baseUrl = process.env.MPESA_ENV === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke'
  const credentials = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64')
  const tokenResponse = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, { headers: { Authorization: `Basic ${credentials}` } })
  const token = await tokenResponse.json()
  if (!tokenResponse.ok || !token.access_token) throw new Error(token.errorMessage || 'Unable to authenticate with M-Pesa')
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)
  const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64')
  const stkResponse = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, { method: 'POST', headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ BusinessShortCode: MPESA_SHORTCODE, Password: password, Timestamp: timestamp, TransactionType: 'CustomerPayBillOnline', Amount: Math.max(1, Math.round(amount)), PartyA: normalizePhone(phone), PartyB: MPESA_SHORTCODE, PhoneNumber: normalizePhone(phone), CallBackURL: MPESA_CALLBACK_URL, AccountReference: accountReference, TransactionDesc: 'DKUT Farm produce purchase' }) })
  const result = await stkResponse.json()
  if (!stkResponse.ok || result.ResponseCode !== '0') throw new Error(result.errorMessage || result.ResponseDescription || 'M-Pesa STK request failed')
  return { sent: true, checkoutRequestId: result.CheckoutRequestID, message: 'An M-Pesa STK prompt has been sent to your phone.' }
}

async function create(req, res, next) {
  try {
    const { amount, phoneNumber, paymentMethod = 'MPESA' } = req.body
    const orderId = toObjectId(req.params.orderId)
    const order = orderId && await getDatabase().collection('orders').findOne({ _id: orderId })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (req.user.role === 'CUSTOMER' && order.customerId.toString() !== req.user.userId) return res.status(403).json({ message: 'You cannot pay for this order' })
    if (paymentMethod === 'MPESA' && phoneNumber && !normalizePhone(phoneNumber).match(/^2547\d{8}$/)) return res.status(400).json({ message: 'A valid M-Pesa phone number is required' })
    const db = getDatabase()
    const existingPayment = await db.collection('payments').findOne({ orderId })
    let paymentId
    if (existingPayment) {
      paymentId = existingPayment._id
      await db.collection('payments').updateOne(
        { _id: paymentId },
        { $set: { amount: Number(amount), paymentMethod, phoneNumber, status: 'PENDING', providerReference: null, failureReason: null, updatedAt: new Date() } }
      )
    } else {
      const result = await db.collection('payments').insertOne({ orderId, amount: Number(amount), paymentMethod, phoneNumber, status: 'PENDING', createdAt: new Date() })
      paymentId = result.insertedId
    }
    let stk
    try { stk = await requestStkPush({ amount, phone: phoneNumber, accountReference: orderId.toString() }) } catch (error) { await db.collection('payments').updateOne({ _id: paymentId }, { $set: { status: 'FAILED', failureReason: error.message } }); return res.status(502).json({ message: error.message }) }
    await db.collection('payments').updateOne({ _id: paymentId }, { $set: { providerReference: stk.checkoutRequestId, stkPromptSent: stk.sent } })
    res.status(201).json({ id: paymentId.toString(), status: 'PENDING', stkPromptSent: stk.sent, message: stk.message })
  } catch (error) { next(error) }
}
async function confirm(req, res, next) {
  try {
    const orderId = toObjectId(req.params.orderId)
    const db = getDatabase()
    const order = orderId && await db.collection('orders').findOne({ _id: orderId, customerId: toObjectId(req.user.userId) })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    const payment = await db.collection('payments').findOne({ orderId })
    if (!payment) return res.status(404).json({ message: 'Payment record not found for this order' })
    await db.collection('payments').updateOne(
      { _id: payment._id },
      { $set: { status: 'SUCCESS', paidAt: new Date(), confirmedBy: toObjectId(req.user.userId) } }
    )
    await db.collection('orders').updateOne(
      { _id: orderId },
      { $set: { paymentStatus: 'PAID', confirmedAt: new Date(), confirmedBy: toObjectId(req.user.userId), updatedAt: new Date() } }
    )
    await transitionOrder(orderId, 'CONFIRMED', { changedBy: `customer:${req.user.userId}`, note: 'Payment confirmed' })
    res.json({ message: 'Payment confirmed', orderId: orderId.toString(), status: 'SUCCESS' })
  } catch (error) { next(error) }
}
async function listForOrder(req, res, next) {
  try {
    const orderId = toObjectId(req.params.orderId)
    const order = orderId && await getDatabase().collection('orders').findOne({ _id: orderId })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (req.user.role === 'CUSTOMER' && order.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You cannot view payments for this order' })
    }
    const rows = await getDatabase().collection('payments').find({ orderId }).sort({ createdAt: -1 }).toArray()
    res.json(withIds(rows))
  } catch (error) { next(error) }
}
async function all(req, res, next) { try { const rows = await getDatabase().collection('payments').find().sort({ createdAt: -1 }).toArray(); res.json(withIds(rows)) } catch (error) { next(error) } }
async function updateStatus(req, res, next) { try { const changes = { status: req.body.status, providerReference: req.body.providerReference }; if (req.body.status === 'SUCCESS') changes.paidAt = new Date(); await getDatabase().collection('payments').updateOne({ _id: toObjectId(req.params.id) }, { $set: changes }); res.json({ message: 'Payment status updated' }) } catch (error) { next(error) } }
async function callback(req, res) {
  const callback = req.body?.Body?.stkCallback
  if (callback?.CheckoutRequestID) {
    const resultCode = callback.ResultCode
    const db = getDatabase()
    const payment = await db.collection('payments').findOneAndUpdate(
      { providerReference: callback.CheckoutRequestID },
      { $set: { status: resultCode === 0 ? 'SUCCESS' : 'FAILED', providerResultCode: resultCode, providerResultDescription: callback.ResultDesc, ...(resultCode === 0 ? { paidAt: new Date() } : {}) } },
      { includeResultMetadata: false, returnDocument: 'after' }
    )
    if (resultCode === 0 && payment?.orderId) {
      await db.collection('orders').updateOne(
        { _id: payment.orderId },
        { $set: { paymentStatus: 'PAID', confirmedAt: new Date(), updatedAt: new Date() } }
      )
      await transitionOrder(payment.orderId, 'CONFIRMED', { changedBy: 'system', note: 'M-Pesa payment confirmed by callback' })
    } else if (resultCode !== 0 && payment?.orderId) {
      await db.collection('orders').updateOne(
        { _id: payment.orderId },
        { $set: { paymentStatus: 'FAILED', updatedAt: new Date() } }
      )
    }
  }
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' })
}
module.exports = { create, confirm, listForOrder, all, updateStatus, callback }
