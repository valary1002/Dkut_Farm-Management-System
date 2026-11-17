const express = require('express')
const { getDatabase } = require('../config/database')
const { authenticate, authorize } = require('../middleware/authMiddleware')
const { withIds, toObjectId } = require('../utils/mongo')
const router = express.Router()
router.get('/', authenticate, authorize('ADMIN'), async (req, res, next) => { try { const rows = await getDatabase().collection('produce').find({}, { projection: { name: 1, unit: 1, inventory: 1 } }).sort({ name: 1 }).toArray(); res.json(withIds(rows).map(({ id, name, unit, inventory }) => ({ id, name, unit, quantityAvailable: inventory?.quantityAvailable ?? 0, lowStockThreshold: inventory?.lowStockThreshold ?? 10, lowStock: (inventory?.quantityAvailable ?? 0) <= (inventory?.lowStockThreshold ?? 10) }))) } catch (error) { next(error) } })
router.get('/low-stock', authenticate, authorize('ADMIN'), async (req, res, next) => { try { const rows = await getDatabase().collection('produce').find({ $expr: { $lte: ['$inventory.quantityAvailable', '$inventory.lowStockThreshold'] } }, { projection: { name: 1, inventory: 1 } }).toArray(); res.json(withIds(rows).map(({ id, name, inventory }) => ({ id, name, quantityAvailable: inventory?.quantityAvailable ?? 0, lowStockThreshold: inventory?.lowStockThreshold ?? 10 }))) } catch (error) { next(error) } })
router.patch('/:produceId', authenticate, authorize('ADMIN'), async (req, res, next) => { try {
  const quantityAvailable = Number(req.body.quantityAvailable)
  const lowStockThreshold = req.body.lowStockThreshold === undefined ? undefined : Number(req.body.lowStockThreshold)
  if (!Number.isFinite(quantityAvailable) || quantityAvailable < 0 || (lowStockThreshold !== undefined && (!Number.isFinite(lowStockThreshold) || lowStockThreshold < 0))) return res.status(400).json({ message: 'Inventory quantities must be non-negative numbers' })
  const changes = { 'inventory.quantityAvailable': quantityAvailable, 'inventory.updatedAt': new Date() }
  if (lowStockThreshold !== undefined) changes['inventory.lowStockThreshold'] = lowStockThreshold
  const result = await getDatabase().collection('produce').updateOne({ _id: toObjectId(req.params.produceId) }, { $set: changes })
  if (result.matchedCount !== 1) return res.status(404).json({ message: 'Produce not found' })
  res.json({ message: 'Inventory updated' })
} catch (error) { next(error) } })
module.exports = router
