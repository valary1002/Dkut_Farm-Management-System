const { Produce } = require('../models')
const { toObjectId, withId, withIds } = require('../utils/mongo')

async function list(req, res, next) {
  try {
    const rows = await Produce.find({ status: 'ACTIVE' }).sort({ name: 1 }).lean()
    res.json(withIds(rows).map(({ inventory, ...produce }) => ({ ...produce, quantityAvailable: inventory?.quantityAvailable ?? 0, lowStockThreshold: inventory?.lowStockThreshold ?? 10 })))
  } catch (error) { next(error) }
}

async function create(req, res, next) {
  try {
    const { name, category, description, imageUrl, sellingPrice, unit = 'kg', quantity = 0, lowStockThreshold = 10 } = req.body
    const quantityNumber = Number(quantity)
    const thresholdNumber = Number(lowStockThreshold)
    if (!Number.isFinite(quantityNumber) || quantityNumber < 0 || !Number.isFinite(thresholdNumber) || thresholdNumber < 0) return res.status(400).json({ message: 'Inventory quantities must be non-negative numbers' })
    const produce = await Produce.create({ name, category, description, imageUrl, sellingPrice, unit, status: 'ACTIVE', inventory: { quantityAvailable: quantityNumber, lowStockThreshold: thresholdNumber, updatedAt: new Date() } })
    res.status(201).json({ id: produce._id.toString(), message: 'Produce created' })
  } catch (error) { next(error) }
}

async function update(req, res, next) {
  try {
    const { name, category, description, imageUrl, sellingPrice, unit, status } = req.body
    const changes = Object.fromEntries(Object.entries({ name, category, description, imageUrl, sellingPrice, unit, status }).filter(([, value]) => value !== undefined))
    changes.updatedAt = new Date()
    await Produce.updateOne({ _id: toObjectId(req.params.id) }, { $set: changes })
    res.json({ message: 'Produce updated' })
  } catch (error) { next(error) }
}

async function remove(req, res, next) {
  try {
    const id = toObjectId(req.params.id)
    if (!id) return res.status(400).json({ message: 'Invalid produce id' })
    const referenced = await require('../config/database').getDatabase().collection('orders').findOne({ 'items.produceId': id }, { projection: { _id: 1 } })
    if (referenced) return res.status(409).json({ message: 'Produce cannot be deleted because it is referenced by an order' })
    const result = await Produce.deleteOne({ _id: id })
    if (result.deletedCount !== 1) return res.status(404).json({ message: 'Produce not found' })
    res.status(204).send()
  } catch (error) { next(error) }
}

module.exports = { list, create, update, remove }
