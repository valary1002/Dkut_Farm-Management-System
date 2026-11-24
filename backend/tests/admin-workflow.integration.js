const assert = require('node:assert/strict')
const { randomUUID } = require('node:crypto')
const base = 'http://localhost:5000/api'

async function request(path, options = {}) {
  const response = await fetch(base + path, { method: options.method || 'GET', headers: { 'Content-Type': 'application/json', ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}) }, body: options.body ? JSON.stringify(options.body) : undefined })
  return { status: response.status, body: response.status === 204 ? null : await response.json() }
}

async function main() {
  const login = await request('/auth/login', { method: 'POST', body: { email: 'admin@example.com', password: 'Systemadmin123!' } })
  assert.equal(login.status, 200)
  const token = login.body.token

  const dashboard = await request('/reports/dashboard', { token })
  assert.equal(dashboard.status, 200)
  for (const key of ['totalCustomers', 'totalProduce', 'availableStock', 'lowStockItems', 'totalSales', 'pendingOrders', 'availableJobs', 'pendingApplications']) assert.equal(typeof dashboard.body[key], 'number')

  const customers = await request('/users', { token })
  assert.equal(customers.status, 200)
  const customer = customers.body.find((item) => item.role === 'CUSTOMER')
  assert.ok(customer)
  const changedStatus = await request(`/users/${customer.id}/status`, { method: 'PATCH', token, body: { status: 'DISABLED' } })
  assert.equal(changedStatus.status, 200)
  const restoredStatus = await request(`/users/${customer.id}/status`, { method: 'PATCH', token, body: { status: 'ACTIVE' } })
  assert.equal(restoredStatus.status, 200)

  const name = `Step 15 Produce ${randomUUID()}`
  const createdProduce = await request('/produce', { method: 'POST', token, body: { name, category: 'Testing', description: 'Admin workflow test', sellingPrice: 10, unit: 'kg', quantity: 5, lowStockThreshold: 2 } })
  assert.equal(createdProduce.status, 201)
  const produceId = createdProduce.body.id
  const inventory = await request('/inventory', { token })
  assert.equal(inventory.status, 200)
  assert.equal(inventory.body.find((item) => item.id === produceId).quantityAvailable, 5)
  const stockUpdate = await request(`/inventory/${produceId}`, { method: 'PATCH', token, body: { quantityAvailable: 1 } })
  assert.equal(stockUpdate.status, 200)
  const lowStock = await request('/inventory/low-stock', { token })
  assert.equal(lowStock.status, 200)
  assert.ok(lowStock.body.some((item) => item.id === produceId))
  const editedProduce = await request(`/produce/${produceId}`, { method: 'PATCH', token, body: { sellingPrice: 12 } })
  assert.equal(editedProduce.status, 200)
  const deletedProduce = await request(`/produce/${produceId}`, { method: 'DELETE', token })
  assert.equal(deletedProduce.status, 204)

  const title = `Step 15 Job ${randomUUID()}`
  const createdJob = await request('/jobs', { method: 'POST', token, body: { title, description: 'Admin workflow job', activity: 'Testing', workersRequired: 1, dailyWage: 100, deadline: '2099-01-01', startDate: '2099-01-02', status: 'OPEN' } })
  assert.equal(createdJob.status, 201)
  const allJobs = await request('/jobs/all', { token })
  assert.equal(allJobs.status, 200)
  assert.equal(typeof allJobs.body.find((job) => job.id === createdJob.body.id).applicants, 'number')
  const closedJob = await request(`/jobs/${createdJob.body.id}`, { method: 'PATCH', token, body: { status: 'CLOSED' } })
  assert.equal(closedJob.status, 200)
  const deletedJob = await request(`/jobs/${createdJob.body.id}`, { method: 'DELETE', token })
  assert.equal(deletedJob.status, 204)

  const orders = await request('/orders', { token })
  assert.equal(orders.status, 200)
  if (orders.body.length) {
    const orderStatus = await request(`/orders/${orders.body[0].id}/status`, { method: 'PATCH', token, body: { status: 'PROCESSING' } })
    assert.equal(orderStatus.status, 200)
  }
  const payments = await request('/payments', { token })
  assert.equal(payments.status, 200)
  const deliveries = await request('/deliveries', { token })
  assert.equal(deliveries.status, 200)
  const sales = await request('/reports/sales', { token })
  assert.equal(sales.status, 200)
  console.log(JSON.stringify({ dashboard: dashboard.body, customers: customers.body.length, orders: orders.body.length, payments: payments.body.length, deliveries: deliveries.body.length, sales: sales.body.length }))
}

main().catch((error) => { console.error(error); process.exit(1) })
