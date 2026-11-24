require('dotenv').config()
const { connectDatabase, getDatabase, closeDatabase } = require('../config/database')
const { hashPassword } = require('../utils/password')

async function seed() {
  await connectDatabase()
  const db = getDatabase()
  const seedAdmin = {
    email: String(process.env.SEED_ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase(),
    password: process.env.SEED_ADMIN_PASSWORD || 'Systemadmin123!',
    fullName: String(process.env.SEED_ADMIN_FULL_NAME || 'System Admin').trim(),
    phone: String(process.env.SEED_ADMIN_PHONE || '+254700000000').trim(),
  }
  if (seedAdmin.password.length < 8) throw new Error('SEED_ADMIN_PASSWORD must be at least 8 characters')
  for (const collectionName of ['users', 'produce', 'casual_jobs', 'job_applications', 'orders', 'payments', 'deliveries']) {
    try { await db.createCollection(collectionName) } catch (error) { if (error.codeName !== 'NamespaceExists') throw error }
  }
  const admin = await db.collection('users').findOneAndUpdate(
    { email: seedAdmin.email },
    { $set: { fullName: seedAdmin.fullName, phone: seedAdmin.phone, passwordHash: await hashPassword(seedAdmin.password), role: 'ADMIN', status: 'ACTIVE', updatedAt: new Date() }, $setOnInsert: { email: seedAdmin.email, createdAt: new Date() } },
    { upsert: true, returnDocument: 'after' }
  )
  const produce = [
    ['Tomatoes', 'Vegetables', 'Fresh farm tomatoes', 50, 120],
    ['Maize', 'Cereals', 'Dry farm maize', 45, 450],
    ['Beans', 'Legumes', 'Fresh beans', 120, 320],
    ['Potatoes', 'Tubers', 'Fresh farm potatoes', 40, 300],
    ['Onions', 'Vegetables', 'Fresh farm onions', 35, 250],
  ]
  for (const [name, category, description, sellingPrice, quantityAvailable] of produce) {
    await db.collection('produce').updateOne({ name }, { $set: { category, description, sellingPrice, unit: 'kg', status: 'ACTIVE', 'inventory.quantityAvailable': quantityAvailable, 'inventory.lowStockThreshold': 25, 'inventory.updatedAt': new Date(), updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } }, { upsert: true })
  }
  await db.collection('casual_jobs').updateOne({ title: 'Tomato Harvesting' }, { $setOnInsert: { title: 'Tomato Harvesting', description: 'Harvest mature tomatoes from the main field.', activity: 'Harvesting', workersRequired: 5, dailyWage: 300, deadline: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10), startDate: new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10), status: 'OPEN', createdBy: admin._id, createdAt: new Date(), updatedAt: new Date() } }, { upsert: true })
  await db.collection('casual_jobs').updateOne({ title: 'Maize Field Weeding' }, { $setOnInsert: { title: 'Maize Field Weeding', description: 'Weed and maintain the maize demonstration field.', activity: 'Weeding', workersRequired: 3, dailyWage: 350, deadline: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10), startDate: new Date(Date.now() + 16 * 86400000).toISOString().slice(0, 10), status: 'OPEN', createdBy: admin._id, createdAt: new Date(), updatedAt: new Date() } }, { upsert: true })
  await db.collection('casual_jobs').updateOne({ title: 'Onion Sorting' }, { $setOnInsert: { title: 'Onion Sorting', description: 'Grade and sort harvested onions for market delivery.', activity: 'Sorting', workersRequired: 4, dailyWage: 280, deadline: new Date(Date.now() + 12 * 86400000).toISOString().slice(0, 10), startDate: new Date(Date.now() + 18 * 86400000).toISOString().slice(0, 10), status: 'OPEN', createdBy: admin._id, createdAt: new Date(), updatedAt: new Date() } }, { upsert: true })
  console.log('MongoDB seed completed')
}

seed().catch((error) => { console.error(error); process.exitCode = 1 }).finally(closeDatabase)