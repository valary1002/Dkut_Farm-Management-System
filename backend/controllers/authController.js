const { getDatabase } = require('../config/database')
const { User } = require('../models')
const { hashPassword, comparePassword } = require('../utils/password')
const { createToken } = require('../utils/token')
const { toObjectId, withId } = require('../utils/mongo')

const loginAttempts = new Map()
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000

function normalizedEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function validPhone(phone) {
  return /^\+?[0-9]{10,15}$/.test(String(phone || '').replace(/[\s-]/g, ''))
}

async function register(req, res, next) {
  try {
    const { fullName, email, phone, password, termsAccepted } = req.body
    const normalized = normalizedEmail(email)
    if (!String(fullName || '').trim() || !normalized || !phone || !password || termsAccepted !== true) {
      return res.status(400).json({ message: 'Full name, email, phone, password and accepted terms are required' })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return res.status(400).json({ message: 'A valid email address is required' })
    if (!validPhone(phone)) return res.status(400).json({ message: 'A valid phone number is required' })
    if (String(password).length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' })
    const passwordHash = await hashPassword(password)
    const user = await User.create({ fullName: fullName.trim(), email: normalized, phone: String(phone).trim(), passwordHash, role: 'CUSTOMER', status: 'ACTIVE' })
    const safeUser = { id: user._id.toString(), fullName: user.fullName, email: user.email, phone: user.phone, role: user.role }
    res.status(201).json({ user: safeUser, token: createToken({ ...safeUser, role: 'CUSTOMER' }) })
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Email is already registered' })
    next(error)
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body
    const normalized = normalizedEmail(email)
    const attemptKey = normalized
    const attempt = loginAttempts.get(attemptKey)
    if (attempt && attempt.lockedUntil > Date.now()) {
      return res.status(429).json({ message: 'Too many failed login attempts. Try again later.' })
    }
    const user = await User.findOne({ email: normalized, status: 'ACTIVE' }).select('+passwordHash').lean()
    if (!user || !(await comparePassword(password, user.passwordHash))) {
      const failures = attempt
        ? (attempt.lockedUntil > 0 && attempt.lockedUntil <= Date.now() ? 1 : attempt.failures + 1)
        : 1
      loginAttempts.set(attemptKey, {
        failures,
        lockedUntil: failures >= MAX_LOGIN_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0,
      })
      return res.status(failures >= MAX_LOGIN_ATTEMPTS ? 429 : 401).json({
        message: failures >= MAX_LOGIN_ATTEMPTS
          ? 'Too many failed login attempts. Try again later.'
          : 'Invalid email or password',
      })
    }
    loginAttempts.delete(attemptKey)
    const safeUser = withId({ ...user, passwordHash: undefined })
    delete safeUser.passwordHash
    res.json({ user: safeUser, token: createToken(user) })
  } catch (error) { next(error) }
}

async function me(req, res, next) {
  try {
    const userId = toObjectId(req.user.userId)
    const user = userId && await getDatabase().collection('users').findOne({ _id: userId }, { projection: { passwordHash: 0 } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(withId(user))
  } catch (error) { next(error) }
}

module.exports = { register, login, me }
