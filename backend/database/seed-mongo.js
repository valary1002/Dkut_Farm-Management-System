require('dotenv').config()
const { connectDatabase, getDatabase, closeDatabase } = require('../config/database')
const { hashPassword } = require('../utils/password')

async function seed() {
  await connectDatabase()
  const db = getDatabase()
  for (const collectionName of ['users', 'produce', 'casual_jobs', 'job_applications', 'orders', 'payments', 'deliveries']) {
    try { await db.createCollection(collectionName) } catch (error) { if (error.codeName !== 'NamespaceExists') throw error }
  }
  const admin = await db.collection('users').findOneAndUpdate(
    { email: 'admin@example.com' },
    { $set: { fullName: 'System Admin', phone: '+254700000000', role: 'ADMIN', status: 'ACTIVE', updatedAt: new Date() }, $setOnInsert: { email: 'admin@example.com', passwordHash: await hashPassword('ChangeMe123!'), createdAt: new Date() } },
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