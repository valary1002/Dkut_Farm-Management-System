const express = require('express')
const controller = require('../controllers/applicationController')
const { authenticate, authorize } = require('../middleware/authMiddleware')
const router = express.Router()
router.post('/jobs/:jobId', authenticate, authorize('CUSTOMER'), controller.apply)
router.get('/my', authenticate, authorize('CUSTOMER'), controller.mine)
router.get('/', authenticate, authorize('ADMIN'), controller.all)
router.patch('/:id/review', authenticate, authorize('ADMIN'), controller.review)
module.exports = router
