const express = require('express')
const controller = require('../controllers/cartController')
const { authenticate } = require('../middleware/authMiddleware')

const router = express.Router()
router.use(authenticate)
router.get('/', controller.list)
router.post('/items', controller.add)
router.patch('/items/:produceId', controller.update)
router.delete('/items/:produceId', controller.remove)
router.delete('/', controller.clear)

module.exports = router
