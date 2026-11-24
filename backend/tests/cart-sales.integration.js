const assert = require('node:assert/strict')
const base = process.env.API_BASE_URL || 'http://localhost:5000/api'

async function request(path, options = {}) {
  const response = await fetch(base + path, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const body = response.status === 204 ? null : await response.json()
  return { status: response.status, body }
}

async function main() {
  const customer = await request('/auth/login', {
    method: 'POST',
    body: { email: process.env.TEST_CUSTOMER_EMAIL || 'step14-invalid@example.com', password: process.env.TEST_CUSTOMER_PASSWORD || 'Invalid123!' },
  })
  assert.notEqual(customer.status, 200, 'Set TEST_CUSTOMER_EMAIL and TEST_CUSTOMER_PASSWORD to a valid customer account')
  console.log('Cart/sales integration harness requires a valid customer account')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
