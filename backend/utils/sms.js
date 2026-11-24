function normalizePhone(phone) {
  let value = String(phone || '').trim().replace(/[\s()-]/g, '')
  if (value.startsWith('0')) value = `+254${value.slice(1)}`
  else if (value.startsWith('254')) value = `+${value}`
  else if (!value.startsWith('+')) value = `+${value}`
  return /^\+[1-9]\d{7,14}$/.test(value) ? value : null
}

async function sendOrderSms({ phoneNumber, orderId, totalAmount, deliveryAddress }) {
  const username = process.env.AT_USERNAME
  const apiKey = process.env.AT_API_KEY
  if (!username || !apiKey) {
    return { sent: false, message: 'SMS not sent: configure AT_USERNAME and AT_API_KEY in backend/.env.' }
  }
  const recipient = normalizePhone(phoneNumber)
  if (!recipient) throw new Error('SMS recipient must be a valid international phone number')

  const message = `DKUT Farm: Order #${orderId} received. Total KES ${totalAmount}. Delivery: ${deliveryAddress}. Payment is on delivery.`
  const form = new URLSearchParams({
    username,
    to: recipient,
    message,
  })
  if (process.env.AT_SENDER_ID) form.set('from', process.env.AT_SENDER_ID)

  const baseUrl = 'https://api.sandbox.africastalking.com'
  const response = await fetch(`${baseUrl}/version1/messaging`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  })
  const responseText = await response.text()
  let result
  try {
    result = responseText ? JSON.parse(responseText) : {}
  } catch {
    result = { message: responseText }
  }
  if (!response.ok) {
    const providerMessage = result.message || result.error || 'SMS provider rejected the order notification'
    console.error('Africa\'s Talking sandbox SMS failed:', { status: response.status, recipient, result })
    throw new Error(`SMS provider rejected the order notification (${response.status}): ${providerMessage}`)
  }
  console.info('Africa\'s Talking sandbox SMS response:', { recipient, result })
  return { sent: true, message: 'Order confirmation SMS sent.' }
}

async function sendTestSms(phoneNumber) {
  const username = process.env.AT_USERNAME
  const apiKey = process.env.AT_API_KEY
  if (!username || !apiKey) throw new Error('Configure AT_USERNAME and AT_API_KEY')
  const recipient = normalizePhone(phoneNumber)
  if (!recipient) throw new Error('Phone number must use international format, for example +2547XXXXXXXX')

  const form = new URLSearchParams({
    username,
    to: recipient,
    message: 'DKUT Farm SMS sandbox test.',
  })
  const baseUrl = 'https://api.sandbox.africastalking.com'
  const response = await fetch(`${baseUrl}/version1/messaging`, {
    method: 'POST',
    headers: { Accept: 'application/json', apiKey, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })
  const text = await response.text()
  let result
  try { result = text ? JSON.parse(text) : {} } catch { result = { message: text } }
  if (!response.ok) {
    console.error('Africa\'s Talking sandbox test failed:', { status: response.status, recipient, result })
    throw new Error(`SMS provider error (${response.status}): ${result.message || result.error || 'Request rejected'}`)
  }
  console.info('Africa\'s Talking sandbox test response:', { recipient, result })
  return { sent: true, recipient, provider: result }
}

module.exports = { normalizePhone, sendOrderSms, sendTestSms }
