const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const json = async (input: RequestInfo, init?: RequestInit) => {
  const response = await fetch(input, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('eventSuiteToken') || ''}`,
    },
    ...init,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }
  return data
}

export const fetchEvents = async () => {
  const source = `${API_BASE}/api/events`
  return json(source)
}

export const createBooking = async (payload: {
  eventId: string
  tierName: string
  quantity: number
  discountCode?: string
}) => {
  const source = `${API_BASE}/api/bookings`
  return json(source, { method: 'POST', body: JSON.stringify(payload) })
}

export const authenticate = async (type: 'login' | 'register', payload: Record<string, unknown>) => {
  const source = `${API_BASE}/api/auth/${type}`
  return json(source, { method: 'POST', body: JSON.stringify(payload) })
}

export const createEvent = async (payload: Record<string, unknown>) => {
  const source = `${API_BASE}/api/events`
  return json(source, { method: 'POST', body: JSON.stringify(payload) })
}
