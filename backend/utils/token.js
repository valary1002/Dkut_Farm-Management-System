const jwt = require('jsonwebtoken')

function createToken(user) {
  const userId = user.id || user._id?.toString()
  return jwt.sign(
    { userId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  )
}

module.exports = { createToken }
