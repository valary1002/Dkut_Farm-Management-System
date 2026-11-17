const express = require('express')
const controller = require('../controllers/deliveryController')
const { authenticate, authorize } = require('../middleware/authMiddleware')
const router = express.Router()
router.post('/orders/:orderId', authenticate, authorize('ADMIN'), controller.create)
router.get('/orders/:orderId', authenticate, authorize('CUSTOMER', 'ADMIN'), (req, res, next) => req.user.role === 'ADMIN' ? controller.all(req, res, next) : controller.mine(req, res, next))
router.get('/', authenticate, authorize('ADMIN'), controller.all)
router.patch('/:id/status', authenticate, authorize('ADMIN'), controller.updateStatus)
module.exports = router
