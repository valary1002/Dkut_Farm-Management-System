const express = require('express')
const { getDatabase } = require('../config/database')
const { toObjectId, withId, withIds } = require('../utils/mongo')
const { authenticate, authorize } = require('../middleware/authMiddleware')
const { hashPassword, comparePassword } = require('../utils/password')

const router = express.Router()
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await getDatabase().collection('users').findOne({ _id: toObjectId(req.user.userId) }, { projection: { passwordHash: 0 } })
    res.json(user ? withId(user) : null)
  } catch (error) { next(error) }
})
router.patch('/me', authenticate, async (req, res, next) => {
  try {
    const { fullName, phone } = req.body
    await getDatabase().collection('users').updateOne({ _id: toObjectId(req.user.userId) }, { $set: { ...(fullName === undefined ? {} : { fullName }), ...(phone === undefined ? {} : { phone }), updatedAt: new Date() } })
    res.json({ message: 'Profile updated' })
  } catch (error) { next(error) }
})
router.patch('/me/password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword || String(newPassword).length < 8) return res.status(400).json({ message: 'Current password and a new password of at least 8 characters are required' })
    const user = await getDatabase().collection('users').findOne({ _id: toObjectId(req.user.userId) })
    if (!user || !(await comparePassword(currentPassword, user.passwordHash))) return res.status(401).json({ message: 'Current password is incorrect' })
    await getDatabase().collection('users').updateOne({ _id: user._id }, { $set: { passwordHash: await hashPassword(newPassword), updatedAt: new Date() } })
    res.json({ message: 'Password changed successfully' })
  } catch (error) { next(error) }
})
router.get('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try { const rows = await getDatabase().collection('users').find({}, { projection: { passwordHash: 0 } }).toArray(); res.json(withIds(rows)) } catch (error) { next(error) }
})
router.patch('/:id/status', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try { await getDatabase().collection('users').updateOne({ _id: toObjectId(req.params.id) }, { $set: { status: req.body.status, updatedAt: new Date() } }); res.json({ message: 'User status updated' }) } catch (error) { next(error) }
})
module.exports = router
