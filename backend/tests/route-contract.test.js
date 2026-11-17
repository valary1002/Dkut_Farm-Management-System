const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const backendRoot = path.resolve(__dirname, '..')
const read = (relativePath) => fs.readFileSync(path.join(backendRoot, relativePath), 'utf8')

test('all requested API route groups are registered', () => {
  const server = read('server.js')
  for (const route of ['auth', 'produce', 'inventory', 'jobs', 'applications', 'orders', 'payments', 'deliveries', 'reports']) {
    assert.match(server, new RegExp(`app\\.use\\('/api/${route}`))
  }
})

test('protected resources require authentication and role authorization', () => {
  const expectations = [
    ['routes/produceRoutes.js', "router.post('/', authenticate, authorize('ADMIN')"],
    ['routes/produceRoutes.js', "router.patch('/:id', authenticate, authorize('ADMIN')"],
    ['routes/produceRoutes.js', "router.delete('/:id', authenticate, authorize('ADMIN')"],
    ['routes/inventoryRoutes.js', "router.get('/', authenticate, authorize('ADMIN')"],
    ['routes/jobRoutes.js', "router.post('/', authenticate, authorize('ADMIN')"],
    ['routes/applicationRoutes.js', "router.post('/jobs/:jobId', authenticate, authorize('CUSTOMER')"],
    ['routes/orderRoutes.js', "router.post('/', authenticate, authorize('CUSTOMER')"],
    ['routes/reportRoutes.js', "router.get('/dashboard', authenticate, authorize('ADMIN')"],
  ]

  for (const [file, fragment] of expectations) assert.match(read(file), new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
})

test('customer-owned payment and delivery reads enforce order ownership', () => {
  assert.match(read('controllers/paymentController.js'), /order\.customerId\.toString\(\) !== req\.user\.userId/)
  assert.match(read('controllers/deliveryController.js'), /customerId: toObjectId\(req\.user\.userId\)/)
})

test('order creation reduces inventory inside a MongoDB transaction', () => {
  const controller = read('controllers/orderController.js')
  assert.match(controller, /getClient\(\)\.startSession\(\)/)
  assert.match(controller, /session\.withTransaction\(/)
  assert.match(controller, /\$inc: \{ 'inventory\.quantityAvailable': -item\.quantityKg \}/)
})

test('Mongo seed script contains the documented admin credential', () => {
  const seed = read('database/seed-mongo.js')
  assert.match(seed, /admin@example\.com/)
  assert.match(seed, /ChangeMe123!/) 
})

test('Mongo connection config defines the required collections and indexes', () => {
  const config = read('config/database.js')
  assert.match(config, /mongoose\.connect\(/)
  assert.match(config, /models\.User\.init\(\)/)
  assert.match(read('models/index.js'), /mongoose\.model\('User'/)
  assert.match(read('models/index.js'), /mongoose\.model\('Application'/)
})

test('seeded admin password helper remains available', async () => {
  const bcrypt = require('bcryptjs')
  const hash = await bcrypt.hash('ChangeMe123!', 12)
  assert.equal(await bcrypt.compare('ChangeMe123!', hash), true)
})