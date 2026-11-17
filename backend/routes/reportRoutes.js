const express = require('express')
const { dashboard, sales } = require('../controllers/reportController')
const { authenticate, authorize } = require('../middleware/authMiddleware')
const router = express.Router()
router.get('/dashboard', authenticate, authorize('ADMIN'), dashboard)
router.get('/sales', authenticate, authorize('ADMIN'), sales)
module.exports = router
