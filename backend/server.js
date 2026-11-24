require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const produceRoutes = require('./routes/produceRoutes')
const inventoryRoutes = require('./routes/inventoryRoutes')
const jobRoutes = require('./routes/jobRoutes')
const applicationRoutes = require('./routes/applicationRoutes')
const orderRoutes = require('./routes/orderRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const deliveryRoutes = require('./routes/deliveryRoutes')
const reportRoutes = require('./routes/reportRoutes')
const smsRoutes = require('./routes/smsRoutes')
const cartRoutes = require('./routes/cartRoutes')
const cron = require('node-cron')
const { runOrderMaintenance } = require('./utils/orderMaintenance')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')
const { connectDatabase } = require('./config/database')
const { validateEnvironment } = require('./config/environment')

const app = express()
const allowedOrigins = [
  "https://dkutfarmmanagement.vercel.app",
  "https://dkutfarmmanagement-git-main-vcc21.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(helmet());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/produce', produceRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/deliveries', deliveryRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/sms', smsRoutes)
app.use('/api/cart', cartRoutes)

app.post('/api/jobs/run-order-maintenance', async (req, res) => {
  if (!process.env.ORDER_MAINTENANCE_SECRET || req.headers['x-maintenance-secret'] !== process.env.ORDER_MAINTENANCE_SECRET) {
    return res.status(401).json({ message: 'Unauthorized maintenance request' })
  }
  try {
    const result = await runOrderMaintenance()
    res.json({ message: 'Order maintenance completed', ...result })
  } catch (error) {
    console.error('Order maintenance endpoint failed:', error)
    res.status(500).json({ message: 'Order maintenance failed' })
  }
})

app.use(notFound)
app.use(errorHandler)

const port = Number(process.env.PORT || 5000)

async function start() {
	validateEnvironment()
	await connectDatabase()
	try {
		await runOrderMaintenance()
		cron.schedule('*/20 * * * *', () => {
			runOrderMaintenance().catch((error) => console.error('Scheduled order maintenance failed:', error))
		})
	} catch (error) {
		console.error('Initial order maintenance failed:', error)
	}
	app.listen(port, () => console.log(`DKUT Farm API listening on port ${port}`))
}

if (require.main === module) {
	start().catch((error) => {
		console.error('Unable to connect to MongoDB', error)
		process.exitCode = 1
	})
}

module.exports = app
