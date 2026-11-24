const mongoose = require('mongoose')

const timestamps = { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['ADMIN', 'STAFF', 'CUSTOMER'], default: 'CUSTOMER' },
  status: { type: String, enum: ['ACTIVE', 'DISABLED'], default: 'ACTIVE' },
}, { ...timestamps, collection: 'users' })

const produceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  description: String,
  imageUrl: String,
  sellingPrice: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  inventory: {
    quantityAvailable: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    updatedAt: Date,
  },
}, { ...timestamps, collection: 'produce' })

const casualJobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  activity: { type: String, required: true },
  workersRequired: { type: Number, required: true },
  dailyWage: { type: Number, required: true },
  deadline: { type: String, required: true },
  startDate: { type: String, required: true },
  status: { type: String, enum: ['DRAFT', 'OPEN', 'CLOSED'], default: 'DRAFT' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { ...timestamps, collection: 'casual_jobs' })

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'CasualJob', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicationMessage: String,
  status: { type: String, enum: ['PENDING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'], default: 'PENDING' },
  reviewNotes: String,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  appliedAt: { type: Date, default: Date.now },
}, { collection: 'job_applications' })
applicationSchema.index({ jobId: 1, customerId: 1 }, { unique: true })

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'], default: 'PENDING' },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'SUCCESS', 'FAILED', 'REFUND_PENDING', 'REFUNDED'], default: 'PENDING' },
  statusHistory: [{
    status: { type: String, enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'] },
    changedAt: { type: Date, default: Date.now },
    changedBy: String,
    note: String,
  }],
  problemReported: { type: Boolean, default: false },
  problemNote: String,
  problemReportedAt: Date,
  confirmedAt: Date,
  confirmedBy: mongoose.Schema.Types.ObjectId,
  outForDeliveryAt: Date,
  deliveredAt: Date,
  deliveryAddress: String,
  items: [{ produceId: mongoose.Schema.Types.ObjectId, produceName: String, unit: String, quantityKg: Number, unitPrice: Number, subtotal: Number }],
}, { ...timestamps, collection: 'orders' })

const paymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'MPESA' },
  status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'], default: 'PENDING' },
  providerReference: String,
  paidAt: Date,
}, { ...timestamps, collection: 'payments' })
paymentSchema.index({ orderId: 1, createdAt: -1 })

const deliverySchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  deliveryAddress: { type: String, required: true },
  deliveryStatus: { type: String, enum: ['PENDING', 'SCHEDULED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'], default: 'PENDING' },
  assignedTo: String,
  scheduledAt: Date,
  deliveredAt: Date,
}, { ...timestamps, collection: 'deliveries' })

module.exports = {
  User: mongoose.models.User || mongoose.model('User', userSchema),
  Produce: mongoose.models.Produce || mongoose.model('Produce', produceSchema),
  CasualJob: mongoose.models.CasualJob || mongoose.model('CasualJob', casualJobSchema),
  Application: mongoose.models.Application || mongoose.model('Application', applicationSchema),
  Order: mongoose.models.Order || mongoose.model('Order', orderSchema),
  Payment: mongoose.models.Payment || mongoose.model('Payment', paymentSchema),
  Delivery: mongoose.models.Delivery || mongoose.model('Delivery', deliverySchema),
}
