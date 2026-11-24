const configuredApiUrl = String(process.env.REACT_APP_API_URL || '').trim()
const rawApiUrl = configuredApiUrl ||
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000/api')

const normalizedApiUrl = rawApiUrl.replace(/\/+$/, '')
  .replace(/\/api\/health$/, '/api')
  .replace(/\/health$/, '/api')
  .replace(/\/api\/api$/, '/api')
const API_BASE_URL = normalizedApiUrl && !normalizedApiUrl.endsWith('/api')
  ? `${normalizedApiUrl}/api`
  : normalizedApiUrl

export async function apiRequest(path, options = {}) {
  if (!configuredApiUrl && process.env.NODE_ENV === 'production') {
    const error = new Error('REACT_APP_API_URL is not configured for this production build.')
    console.error('API configuration error:', error)
    throw error
  }

  const token = localStorage.getItem('dkut_farm_token')
  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  }

  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  } catch (requestError) {
    console.error('Network or CORS error while calling', `${API_BASE_URL}${path}`, requestError)
    const error = new Error(
      `Unable to reach the DKUT Farm API at ${API_BASE_URL}. Check the network, CORS settings, and backend status.`
    )
    error.isNetworkError = true
    error.cause = requestError
    throw error
  }
  const contentType = response.headers.get('content-type') || ''
  let body = null
  try {
    body = contentType.includes('application/json') ? await response.json() : null
  } catch (parseError) {
    console.error('Failed to parse API response:', parseError)
  }

  if (!response.ok) {
    const serverMessage = body?.message || `The server returned HTTP ${response.status}`
    console.error('API server error:', {
      url: `${API_BASE_URL}${path}`,
      status: response.status,
      response: body,
    })
    const error = new Error(response.status === 401
      ? serverMessage
      : response.status >= 500
        ? `Server error (${response.status}): ${serverMessage}`
        : `Request failed (${response.status}): ${serverMessage}`)
    error.status = response.status
    throw error
  }

  return body
}

export function setAuthToken(token) {
  if (token) localStorage.setItem('dkut_farm_token', token)
  else localStorage.removeItem('dkut_farm_token')
}
