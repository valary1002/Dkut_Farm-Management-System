const express = require('express')
const controller = require('../controllers/orderController')
const { authenticate, authorize } = require('../middleware/authMiddleware')
const router = express.Router()
router.post('/', authenticate, authorize('CUSTOMER'), controller.create)
router.get('/my', authenticate, authorize('CUSTOMER'), controller.mine)
router.get('/', authenticate, authorize('ADMIN'), controller.all)
router.patch('/:id/status', authenticate, authorize('ADMIN'), controller.updateStatus)
module.exports = router
