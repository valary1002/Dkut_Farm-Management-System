const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('dkut_farm_token')
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) }

  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  } catch (requestError) {
    const error = new Error(
      `Unable to reach the DKUT Farm API at ${API_BASE_URL}. Start the backend with "cd backend && npm start" and try again.`
    )
    error.cause = requestError
    throw error
  }
  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    const error = new Error(body?.message || 'Request failed')
    error.status = response.status
    throw error
  }

  return body
}

export function setAuthToken(token) {
  if (token) localStorage.setItem('dkut_farm_token', token)
  else localStorage.removeItem('dkut_farm_token')
}
