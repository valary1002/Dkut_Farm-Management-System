const express = require('express')
const { authenticate } = require('../middleware/authMiddleware')
const { sendTestSms } = require('../utils/sms')

const router = express.Router()

router.post('/test', authenticate, async (req, res, next) => {
  try {
    const result = await sendTestSms(req.body.phoneNumber)
    res.json(result)
  } catch (error) {
    error.statusCode = 400
    next(error)
  }
})

module.exports = router
