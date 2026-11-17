const express = require('express')
const controller = require('../controllers/produceController')
const { authenticate, authorize } = require('../middleware/authMiddleware')
const router = express.Router()
router.get('/', authenticate, controller.list)
router.post('/', authenticate, authorize('ADMIN'), controller.create)
router.patch('/:id', authenticate, authorize('ADMIN'), controller.update)
router.delete('/:id', authenticate, authorize('ADMIN'), controller.remove)
module.exports = router
