const assert = require('node:assert/strict')
const { randomUUID } = require('node:crypto')

const base = 'http://localhost:5000/api'

async function request(path, options = {}) {
  const response = await fetch(base + path, {
    headers: { 'Content-Type': 'application/json', ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}) },
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const body = response.status === 204 ? null : await response.json()
  return { status: response.status, body }
}

async function main() {
  const admin = await request('/auth/login', { method: 'POST', body: { email: 'admin@example.com', password: 'ChangeMe123!' } })
  assert.equal(admin.status, 200)

  const email = `step14-${randomUUID()}@example.com`
  const registration = await request('/auth/register', { method: 'POST', body: { fullName: 'Step 14 Customer', email, phone: '+254712345678', password: 'Customer123!', termsAccepted: true } })
  assert.equal(registration.status, 201)
  const customerToken = registration.body.token
  const adminToken = admin.body.token
  const secondRegistration = await request('/auth/register', { method: 'POST', body: { fullName: 'Second Step 14 Customer', email: `step14-second-${randomUUID()}@example.com`, phone: '+254712345679', password: 'Customer123!', termsAccepted: true } })
  assert.equal(secondRegistration.status, 201)

  const produce = await request('/produce', { token: customerToken })
  assert.equal(produce.status, 200)
  const product = produce.body.find((item) => item.quantityAvailable > 0)
  assert.ok(product)

  const negativeOrder = await request('/orders', { method: 'POST', token: customerToken, body: { deliveryAddress: 'DKUT', items: [{ produceId: product.id, quantityKg: -1 }] } })
  assert.equal(negativeOrder.status, 400)
  const excessiveOrder = await request('/orders', { method: 'POST', token: customerToken, body: { deliveryAddress: 'DKUT', items: [{ produceId: product.id, quantityKg: product.quantityAvailable + 1 }] } })
  assert.equal(excessiveOrder.status, 400)

  const jobs = await request('/jobs', { token: customerToken })
  assert.equal(jobs.status, 200)
  assert.ok(jobs.body.length > 0)
  const openJob = jobs.body[0]
  const closedJob = await request('/jobs', { method: 'POST', token: adminToken, body: { title: `Closed Step 14 ${randomUUID()}`, description: 'Closed job', activity: 'Testing', workersRequired: 1, dailyWage: 100, deadline: '2099-01-01', startDate: '2099-01-02', status: 'CLOSED' } })
  assert.equal(closedJob.status, 201)
  const closedApplication = await request(`/applications/jobs/${closedJob.body.id}`, { method: 'POST', token: customerToken, body: { applicationMessage: 'Please consider me' } })
  assert.equal(closedApplication.status, 400)
  const application = await request(`/applications/jobs/${openJob.id}`, { method: 'POST', token: customerToken, body: { applicationMessage: 'Please consider me' } })
  assert.equal(application.status, 201)
  const myApplications = await request('/applications/my', { token: customerToken })
  assert.equal(myApplications.status, 200)
  assert.ok(myApplications.body.some((item) => item.id === application.body.id && item.status === 'PENDING'))
  const secondCustomerApplications = await request('/applications/my', { token: secondRegistration.body.token })
  assert.equal(secondCustomerApplications.status, 200)
  assert.equal(secondCustomerApplications.body.some((item) => item.id === application.body.id), false)

  const inventoryBefore = product.quantityAvailable
  const order = await request('/orders', { method: 'POST', token: customerToken, body: { deliveryAddress: 'DKUT Farm Gate', items: [{ produceId: product.id, quantityKg: 1 }] } })
  assert.equal(order.status, 201)
  const myOrders = await request('/orders/my', { token: customerToken })
  assert.equal(myOrders.status, 200)
  assert.ok(myOrders.body.some((item) => item.id === order.body.orderId && item.items[0].produceId === product.id))
  const secondCustomerOrders = await request('/orders/my', { token: secondRegistration.body.token })
  assert.equal(secondCustomerOrders.status, 200)
  assert.equal(secondCustomerOrders.body.some((item) => item.id === order.body.orderId), false)
  const refreshedProduce = await request('/produce', { token: customerToken })
  assert.equal(Number(refreshedProduce.body.find((item) => item.id === product.id).quantityAvailable), Number(inventoryBefore) - 1)

  const payment = await request(`/payments/orders/${order.body.orderId}`, { method: 'POST', token: customerToken, body: { amount: order.body.totalAmount, paymentMethod: 'MPESA' } })
  assert.equal(payment.status, 201)
  const payments = await request(`/payments/orders/${order.body.orderId}`, { token: customerToken })
  assert.equal(payments.status, 200)
  assert.ok(payments.body.some((item) => item.id === payment.body.id && item.orderId === order.body.orderId))

  const delivery = await request(`/deliveries/orders/${order.body.orderId}`, { method: 'POST', token: adminToken, body: { deliveryAddress: 'DKUT Farm Gate' } })
  assert.equal(delivery.status, 201)
  const deliveryStatus = await request(`/deliveries/orders/${order.body.orderId}`, { token: customerToken })
  assert.equal(deliveryStatus.status, 200)
  assert.equal(deliveryStatus.body.orderId, order.body.orderId)

  console.log(JSON.stringify({ customer: email, orderId: order.body.orderId, applicationId: application.body.id, paymentId: payment.body.id, deliveryId: delivery.body.id, inventoryBefore, inventoryAfter: refreshedProduce.body.find((item) => item.id === product.id).quantityAvailable }))
}

main().catch((error) => { console.error(error); process.exit(1) })
