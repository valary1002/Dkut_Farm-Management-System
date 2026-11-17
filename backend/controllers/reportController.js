const { getDatabase } = require('../config/database')

async function dashboard(req, res, next) {
  try {
    const db = getDatabase()
    const [totalCustomers, totalProduce, stock, lowStockItems, sales, pendingOrders, availableJobs, pendingApplications] = await Promise.all([
      db.collection('users').countDocuments({ role: 'CUSTOMER' }), db.collection('produce').countDocuments({ status: 'ACTIVE' }), db.collection('produce').aggregate([{ $group: { _id: null, value: { $sum: '$inventory.quantityAvailable' } } }]).toArray(), db.collection('produce').countDocuments({ $expr: { $lte: ['$inventory.quantityAvailable', '$inventory.lowStockThreshold'] } }), db.collection('orders').aggregate([{ $match: { status: { $in: ['PROCESSING', 'COMPLETED'] } } }, { $group: { _id: null, value: { $sum: '$totalAmount' } } }]).toArray(), db.collection('orders').countDocuments({ status: 'PENDING' }), db.collection('casual_jobs').countDocuments({ status: 'OPEN' }), db.collection('job_applications').countDocuments({ status: 'PENDING' }),
    ])
    const values = [totalCustomers, totalProduce, stock[0]?.value || 0, lowStockItems, sales[0]?.value || 0, pendingOrders, availableJobs, pendingApplications].map(Number)
    res.json({ totalCustomers: values[0], totalProduce: values[1], availableStock: values[2], lowStockItems: values[3], totalSales: values[4], pendingOrders: values[5], availableJobs: values[6], pendingApplications: values[7] })
  } catch (error) { next(error) }
}

async function sales(req, res, next) {
  try {
    const rows = await getDatabase().collection('orders').aggregate([{ $match: { status: { $in: ['PROCESSING', 'COMPLETED'] } } }, { $unwind: '$items' }, { $lookup: { from: 'users', localField: 'customerId', foreignField: '_id', as: 'customerRecord' } }, { $project: { orderId: { $toString: '$_id' }, produceId: { $toString: '$items.produceId' }, produceName: '$items.produceName', quantitySold: '$items.quantityKg', unit: '$items.unit', unitPrice: '$items.unitPrice', totalAmount: '$items.subtotal', status: 1, createdAt: 1, customer: { $arrayElemAt: ['$customerRecord.fullName', 0] } } }, { $sort: { createdAt: -1 } }]).toArray()
    res.json(rows)
  } catch (error) { next(error) }
}

module.exports = { dashboard, sales }
