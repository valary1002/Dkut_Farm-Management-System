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
const { notFound, errorHandler } = require('./middleware/errorMiddleware')
const { connectDatabase } = require('./config/database')
const { validateEnvironment } = require('./config/environment')

const app = express()
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:3000')
	.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean)
app.use(helmet())
app.use(cors({
	origin(origin, callback) {
		if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
		return callback(new Error('Origin is not allowed by CORS'))
	},
}))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', async (req, res, next) => {
	try {
		const { getDatabase } = require('./config/database')
		await getDatabase().command({ ping: 1 })
		res.json({ status: 'ok', database: 'connected' })
	} catch (error) {
		error.statusCode = 503
		next(error)
	}
})
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

app.use(notFound)
app.use(errorHandler)

const port = Number(process.env.PORT || 5000)

async function start() {
	validateEnvironment()
	await connectDatabase()
	app.listen(port, () => console.log(`DKUT Farm API listening on port ${port}`))
}

if (require.main === module) {
	start().catch((error) => {
		console.error('Unable to connect to MongoDB', error)
		process.exitCode = 1
	})
}

module.exports = app
