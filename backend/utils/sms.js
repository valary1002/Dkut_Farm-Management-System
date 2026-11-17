function normalizePhone(phone) {
  const value = String(phone || '').replace(/\s+/g, '')
  if (value.startsWith('+254')) return value
  if (value.startsWith('254')) return `+${value}`
  if (value.startsWith('0')) return `+254${value.slice(1)}`
  return value
}

async function sendOrderSms({ phoneNumber, orderId, totalAmount, deliveryAddress }) {
  const username = process.env.AT_USERNAME
  const apiKey = process.env.AT_API_KEY
  if (!username || !apiKey) {
    return { sent: false, message: 'SMS not sent: configure AT_USERNAME and AT_API_KEY in backend/.env.' }
  }

  const message = `DKUT Farm: Order #${orderId} received. Total KES ${totalAmount}. Delivery: ${deliveryAddress}. Payment is on delivery.`
  const form = new URLSearchParams({
    username,
    to: normalizePhone(phoneNumber),
    message,
  })
  if (process.env.AT_SENDER_ID) form.set('from', process.env.AT_SENDER_ID)

  const response = await fetch('https://api.africastalking.com/version1/messaging', {
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
    throw new Error(`SMS provider rejected the order notification (${response.status}): ${providerMessage}`)
  }
  return { sent: true, message: 'Order confirmation SMS sent.' }
}

module.exports = { sendOrderSms }
