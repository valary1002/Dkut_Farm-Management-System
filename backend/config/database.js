const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const mongoose = require('mongoose')
const models = require('../models')

let database

function getMongoUri() {
  const uri = String(process.env.MONGODB_URI || '').trim()

  if (!uri) {
    throw new Error('MONGODB_URI is required. Set it to your MongoDB Atlas connection string.')
  }

  if (!/^mongodb(?:\+srv)?:\/\//i.test(uri)) {
    throw new Error('MONGODB_URI must start with mongodb:// or mongodb+srv://')
  }

  if (/<[^>]+>/.test(uri)) {
    throw new Error('MONGODB_URI still contains placeholder credentials. Replace them with the URL-encoded Atlas database password.')
  }

  return uri
}

async function connectDatabase() {
  if (!database) {
    const databaseName = String(process.env.MONGODB_DB || 'dkut_farm').trim()
    await mongoose.connect(getMongoUri(), { dbName: databaseName })
    database = mongoose.connection.db
    await Promise.all([
      models.User.init(), models.Produce.init(), models.Application.init(), models.Payment.init(), models.Delivery.init(),
    ])
  }
  return database
}

function getDatabase() {
  if (!database) throw new Error('MongoDB is not connected')
  return database
}

async function closeDatabase() {
  await mongoose.disconnect()
  database = undefined
}

function getClient() {
  return mongoose.connection.getClient()
}

module.exports = { connectDatabase, getDatabase, closeDatabase, getClient, models }
