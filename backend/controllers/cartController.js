const { getDatabase } = require('../config/database')
const { toObjectId, withId } = require('../utils/mongo')

function customerId(req) {
  return toObjectId(req.user.userId)
}

async function list(req, res, next) {
  try {
    const db = getDatabase()
    const cart = await db.collection('carts').findOne({ customerId: customerId(req) })
    res.json({ items: cart?.items || [] })
  } catch (error) { next(error) }
}

async function add(req, res, next) {
  try {
    const { produceId, quantity = 1 } = req.body
    const quantityNumber = Number(quantity)
    if (!toObjectId(produceId) || !Number.isInteger(quantityNumber) || quantityNumber < 1) {
      return res.status(400).json({ message: 'A valid produce id and whole quantity of at least 1 are required' })
    }
    const db = getDatabase()
    const produce = await db.collection('produce').findOne({ _id: toObjectId(produceId), status: 'ACTIVE' })
    if (!produce) return res.status(404).json({ message: 'Produce not found or unavailable' })
    const id = customerId(req)
    const cart = await db.collection('carts').findOne({ customerId: id }) || { items: [] }
    const existing = cart.items.find((item) => item.produceId.toString() === produceId)
    const nextQuantity = (existing?.quantity || 0) + quantityNumber
    if (nextQuantity > Number(produce.inventory?.quantityAvailable || 0)) {
      return res.status(400).json({ message: `Only ${produce.inventory?.quantityAvailable || 0} ${produce.unit} available` })
    }
    const item = { produceId: produce._id, name: produce.name, unit: produce.unit, unitPrice: Number(produce.sellingPrice), quantity: nextQuantity, imageUrl: produce.imageUrl || '' }
    const items = existing
      ? cart.items.map((row) => row.produceId.toString() === produceId ? item : row)
      : [...cart.items, item]
    await db.collection('carts').updateOne({ customerId: id }, { $set: { items, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } }, { upsert: true })
    res.json({ items })
  } catch (error) { next(error) }
}

async function update(req, res, next) {
  try {
    const quantity = Number(req.body.quantity)
    if (!toObjectId(req.params.produceId) || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be a positive whole number' })
    }
    const db = getDatabase()
    const produce = await db.collection('produce').findOne({ _id: toObjectId(req.params.produceId), status: 'ACTIVE' })
    if (!produce) return res.status(404).json({ message: 'Produce not found or unavailable' })
    if (quantity > Number(produce.inventory?.quantityAvailable || 0)) {
      return res.status(400).json({ message: `Only ${produce.inventory?.quantityAvailable || 0} ${produce.unit} available` })
    }
    const id = customerId(req)
    const cart = await db.collection('carts').findOne({ customerId: id })
    if (!cart) return res.json({ items: [] })
    const items = cart.items.map((item) => item.produceId.toString() === req.params.produceId
      ? { ...item, name: produce.name, unit: produce.unit, unitPrice: Number(produce.sellingPrice), quantity, imageUrl: produce.imageUrl || item.imageUrl || '' }
      : item)
    await db.collection('carts').updateOne({ customerId: id }, { $set: { items, updatedAt: new Date() } })
    res.json({ items })
  } catch (error) { next(error) }
}

async function remove(req, res, next) {
  try {
    const id = customerId(req)
    const db = getDatabase()
    const cart = await db.collection('carts').findOne({ customerId: id })
    if (!cart) return res.json({ items: [] })
    const items = cart.items.filter((item) => item.produceId.toString() !== req.params.produceId)
    await db.collection('carts').updateOne({ customerId: id }, { $set: { items, updatedAt: new Date() } })
    res.json({ items })
  } catch (error) { next(error) }
}

async function clear(req, res, next) {
  try {
    await getDatabase().collection('carts').updateOne({ customerId: customerId(req) }, { $set: { items: [], updatedAt: new Date() } })
    res.json({ items: [] })
  } catch (error) { next(error) }
}

module.exports = { list, add, update, remove, clear }
