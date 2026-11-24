const { getDatabase } = require('../config/database')

async function dashboard(req, res, next) {
  try {
    const db = getDatabase()
    const now = new Date()
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startWeek = new Date(startToday)
    startWeek.setDate(startToday.getDate() - startToday.getDay())
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const salesMatch = { status: 'CONFIRMED', paymentStatus: 'PAID' }
    const [todaySales, weekSales, monthSales, recentRows] = await Promise.all([
      db.collection('orders').aggregate([{ $match: { ...salesMatch, confirmedAt: { $gte: startToday } } }, { $group: { _id: null, value: { $sum: '$totalAmount' } } }]).toArray(),
      db.collection('orders').aggregate([{ $match: { ...salesMatch, confirmedAt: { $gte: startWeek } } }, { $group: { _id: null, value: { $sum: '$totalAmount' } } }]).toArray(),
      db.collection('orders').aggregate([{ $match: { ...salesMatch, confirmedAt: { $gte: startMonth } } }, { $group: { _id: null, value: { $sum: '$totalAmount' } } }]).toArray(),
      db.collection('orders').aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'users', localField: 'customerId', foreignField: '_id', as: 'customer' } },
        { $project: { id: { $toString: '$_id' }, customerName: { $arrayElemAt: ['$customer.fullName', 0] }, items: 1, totalAmount: 1, status: 1, paymentStatus: 1, createdAt: 1, confirmedAt: 1 } }
      ]).toArray()
    ])
    const [totalCustomers, totalProduce, stock, lowStockItems, sales, confirmedOrders, pendingOrders, availableJobs, pendingApplications, totalOrders] = await Promise.all([
      db.collection('users').countDocuments({ role: 'CUSTOMER' }), db.collection('produce').countDocuments({ status: 'ACTIVE' }), db.collection('produce').aggregate([{ $group: { _id: null, value: { $sum: '$inventory.quantityAvailable' } } }]).toArray(), db.collection('produce').countDocuments({ $expr: { $lte: ['$inventory.quantityAvailable', '$inventory.lowStockThreshold'] } }), db.collection('orders').aggregate([{ $match: salesMatch }, { $group: { _id: null, value: { $sum: '$totalAmount' } } }]).toArray(), db.collection('orders').countDocuments(salesMatch), db.collection('orders').countDocuments({ status: 'PENDING' }), db.collection('casual_jobs').countDocuments({ status: 'OPEN' }), db.collection('job_applications').countDocuments({ status: 'PENDING' }), db.collection('orders').countDocuments({}),
    ])
    const values = [totalCustomers, totalProduce, stock[0]?.value || 0, lowStockItems, sales[0]?.value || 0, confirmedOrders, pendingOrders, availableJobs, pendingApplications, totalOrders].map(Number)
    res.json({
      totalCustomers: values[0], totalProduce: values[1], availableStock: values[2], lowStockItems: values[3],
      totalSales: values[4], confirmedOrders: values[5], pendingOrders: values[6], availableJobs: values[7],
      pendingApplications: values[8], totalOrders: values[9],
      salesToday: Number(todaySales[0]?.value || 0),
      salesThisWeek: Number(weekSales[0]?.value || 0),
      salesThisMonth: Number(monthSales[0]?.value || 0),
      recentOrders: recentRows,
    })
  } catch (error) { next(error) }
}

async function sales(req, res, next) {
  try {
    const rows = await getDatabase().collection('orders').aggregate([{ $match: { status: 'CONFIRMED', paymentStatus: 'PAID' } }, { $unwind: '$items' }, { $lookup: { from: 'users', localField: 'customerId', foreignField: '_id', as: 'customerRecord' } }, { $project: { orderId: { $toString: '$_id' }, produceId: { $toString: '$items.produceId' }, produceName: '$items.produceName', quantitySold: '$items.quantityKg', unit: '$items.unit', unitPrice: '$items.unitPrice', totalAmount: '$items.subtotal', status: 1, paymentStatus: 1, createdAt: 1, customer: { $arrayElemAt: ['$customerRecord.fullName', 0] } } }, { $sort: { createdAt: -1 } }]).toArray()
    res.json(rows)
  } catch (error) { next(error) }
}

module.exports = { dashboard, sales }
