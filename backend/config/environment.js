function isProduction() {
  return process.env.NODE_ENV === 'production'
}

function validateEnvironment() {
  const required = ['JWT_SECRET', 'MONGODB_URI', 'MONGODB_DB', 'FRONTEND_ORIGIN']
  const missing = required.filter((name) => !String(process.env[name] || '').trim())

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  if (!/^mongodb(?:\+srv)?:\/\//i.test(process.env.MONGODB_URI)) {
    throw new Error('MONGODB_URI must start with mongodb:// or mongodb+srv://')
  }

  if (/<[^>]+>/.test(process.env.MONGODB_URI)) {
    throw new Error('MONGODB_URI still contains placeholder credentials')
  }

  if (isProduction()) {
    if (process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.includes('change-before-sharing')) {
      throw new Error('JWT_SECRET must be a unique production secret of at least 32 characters')
    }
    if (/localhost|127\.0\.0\.1/i.test(process.env.MONGODB_URI)) {
      throw new Error('MONGODB_URI must point to a hosted production database')
    }
    if (/localhost|127\.0\.0\.1/i.test(process.env.FRONTEND_ORIGIN)) {
      throw new Error('FRONTEND_ORIGIN must point to the deployed frontend')
    }
    if (process.env.MONGODB_TRANSACTIONS !== 'true') {
      throw new Error('MONGODB_TRANSACTIONS must be true in production')
    }
  }
}

module.exports = { validateEnvironment }
