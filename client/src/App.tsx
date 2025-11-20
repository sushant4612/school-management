import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import UserDashboard from './pages/UserDashboard'
import OrganizerDashboard from './pages/OrganizerDashboard'
import { fetchEvents, createBooking } from './services/api'

export type Tier = {
  name: string
  price: number
  capacity: number
  sold: number
  seatRange: string
}

export type Discount = {
  code: string
  discountPercent: number
}

export type Analytics = {
  bookings: number
  heatMap: Record<string, number>
  demographics: Record<string, number>
}

export type LocationInfo = {
  city: string
  venue: string
  address?: string
}

export type AppEvent = {
  id: string
  title: string
  description: string
  category: string
  city: string
  location: LocationInfo
  languagesSupported: string[]
  startDate: string
  endDate: string
  tags: string[]
  featured: boolean
  popularityScore: number
  tierPricing: Tier[]
  discountCodes: Discount[]
  analytics: Analytics
  ticketsSold: number
}

export type BookingHistory = {
  id: string
  event: AppEvent
  tier: string
  amount: number
  date: string
  status: string
}

type RawEvent = Partial<AppEvent> & {
  _id?: string
  tierPricing?: Tier[]
  location?: {
    city?: string
    venue?: string
    address?: string
    title?: string
  }
  analytics?: Partial<Analytics>
}

const normalizeEvent = (raw: RawEvent): AppEvent => {
  const tierPricing: Tier[] = (raw.tierPricing ?? []).map((tier) => ({
    name: tier?.name ?? 'General',
    price: tier?.price ?? 0,
    capacity: tier?.capacity ?? 0,
    sold: tier?.sold ?? 0,
    seatRange: tier?.seatRange ?? '',
  }))
  const analytics = {
    bookings: raw.analytics?.bookings ?? 0,
    heatMap: raw.analytics?.heatMap ?? {},
    demographics: raw.analytics?.demographics ?? {},
  }
  const resolvedLocation: LocationInfo = {
    city: raw.location?.city ?? raw.city ?? 'Remote',
    venue:
      (raw.location?.venue ?? raw.location?.address ?? raw.location?.title ??
        (typeof raw.location === 'string' ? raw.location : '')) ||
      'Virtual Hall',
  }
  return {
    id: raw._id ?? raw.id ?? `evt-${Date.now()}`,
    title: raw.title ?? 'Untitled event',
    description: raw.description ?? 'Details will be available soon.',
    category: raw.category ?? 'general',
    city: resolvedLocation.city,
    location: resolvedLocation,
    languagesSupported: raw.languagesSupported ?? ['en'],
    startDate: raw.startDate ? new Date(raw.startDate).toISOString().split('T')[0] : raw.startDate ?? 'TBD',
    endDate: raw.endDate ? new Date(raw.endDate).toISOString().split('T')[0] : raw.endDate ?? 'TBD',
    tags: raw.tags ?? [],
    featured: raw.featured ?? false,
    popularityScore: raw.popularityScore ?? analytics.bookings ?? 0,
    tierPricing,
    discountCodes: (raw.discountCodes ?? []).map((discount) => ({
      code: discount?.code ?? 'DISC',
      discountPercent: discount?.discountPercent ?? 0,
    })),
    analytics,
    ticketsSold:
      raw.ticketsSold ?? tierPricing.reduce((sum, tier) => sum + (tier.sold ?? 0), 0) ?? 0,
  }
}

const initialEvents: AppEvent[] = [
  {
    id: 'e1',
    title: 'Synthwave Soirée',
    description: 'Immersive synthwave concert with neon visuals, live visuals, and retro gaming lounges.',
    category: 'music',
    city: 'San Francisco',
    location: { city: 'San Francisco', venue: 'Neon Arena' },
    languagesSupported: ['en', 'es'],
    startDate: '2025-12-14',
    endDate: '2025-12-15',
    tags: ['live', 'nightlife', 'vip'],
    featured: true,
    popularityScore: 94,
    tierPricing: [
      { name: 'General', price: 79, capacity: 120, sold: 92, seatRange: 'Floor' },
      { name: 'VIP', price: 149, capacity: 40, sold: 27, seatRange: 'Balcony' },
    ],
    discountCodes: [{ code: 'NEON20', discountPercent: 20 }],
    ticketsSold: 119,
    analytics: { bookings: 350, heatMap: { 'san francisco': 180 }, demographics: { adults: 210 } },
  },
  {
    id: 'e2',
    title: 'Carbon Neutral Design Workshop',
    description: 'Hands-on workshop for sustainable product designers with prototype clinics and feedback pods.',
    category: 'workshop',
    city: 'Portland',
    location: { city: 'Portland', venue: 'Green Foundry' },
    languagesSupported: ['en'],
    startDate: '2026-01-11',
    endDate: '2026-01-11',
    tags: ['design', 'sustainability'],
    featured: false,
    popularityScore: 81,
    tierPricing: [
      { name: 'Standard', price: 129, capacity: 60, sold: 38, seatRange: 'Row A-D' },
      { name: 'Studio', price: 219, capacity: 20, sold: 12, seatRange: 'Studio 2' },
    ],
    discountCodes: [{ code: 'ECO15', discountPercent: 15 }],
    ticketsSold: 50,
    analytics: { bookings: 120, heatMap: { portland: 85 }, demographics: { professionals: 90 } },
  },
  {
    id: 'e3',
    title: 'Future Leaders Summit',
    description: 'Conference uniting student entrepreneurs, investors, and mentors for two days.',
    category: 'conference',
    city: 'New York',
    location: { city: 'New York', venue: 'Harbor Convention Centre' },
    languagesSupported: ['en', 'fr'],
    startDate: '2026-02-05',
    endDate: '2026-02-07',
    tags: ['networking', 'mentorship'],
    featured: true,
    popularityScore: 88,
    tierPricing: [
      { name: 'Early Bird', price: 199, capacity: 160, sold: 135, seatRange: 'Hall 1' },
      { name: 'Executive', price: 349, capacity: 60, sold: 26, seatRange: 'Platinum Lounge' },
    ],
    discountCodes: [{ code: 'REFLECT10', discountPercent: 10 }],
    ticketsSold: 161,
    analytics: { bookings: 480, heatMap: { 'new york': 330 }, demographics: { students: 310 } },
  },
]

function App() {
  const [events, setEvents] = useState<AppEvent[]>(initialEvents)
  const [bookingHistory, setBookingHistory] = useState<BookingHistory[]>([])
  const [loyaltyPoints, setLoyaltyPoints] = useState(480)
  const [notifications, setNotifications] = useState<string[]>([])
  const [userRole, setUserRole] = useState<'user' | 'organizer' | null>(null)

  useEffect(() => {
    fetchEvents()
      .then((data) => {
        const payloadEvents = Array.isArray(data) ? data : data.events ?? []
        const normalized = payloadEvents.map((event: RawEvent) => normalizeEvent(event))
        if (normalized.length) {
          setEvents(normalized)
        }
      })
      .catch(() => {
        // Keep initial events on error
      })
  }, [])

  const handleBooking = async (eventId: string, tierName: string, quantity: number, discountCode?: string) => {
    const event = events.find((e) => e.id === eventId)
    if (!event) return

    const tier = event.tierPricing.find((t) => t.name === tierName)
    if (!tier) return

    const available = tier.capacity - tier.sold
    if (quantity > available) {
      setNotifications((prev) => [`Only ${available} tickets available`, ...prev])
      return
    }

    try {
      const result = await createBooking({ eventId, tierName, quantity, discountCode })
      const normalizedEvent = result.event ? normalizeEvent(result.event) : event

      const discount = event.discountCodes.find((d) => d.code === discountCode?.toUpperCase())
      const baseAmount = tier.price * quantity
      const totalAmount = discount
        ? Number((baseAmount * (1 - discount.discountPercent / 100)).toFixed(2))
        : baseAmount

      const newBooking: BookingHistory = {
        id: result.booking?.id ?? `b-${Date.now()}`,
        event: normalizedEvent,
        tier: tierName,
        amount: totalAmount,
        date: new Date().toISOString().split('T')[0],
        status: 'confirmed',
      }

      setBookingHistory((prev) => [newBooking, ...prev])
      setNotifications((prev) => [`Booking confirmed for ${event.title}`, ...prev])
      setLoyaltyPoints((points) => points + Math.round(totalAmount / 4))
      setEvents((prev) =>
        prev.map((e) => (e.id === normalizedEvent.id ? normalizedEvent : e))
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Booking failed'
      setNotifications((prev) => [message, ...prev])
    }
  }

  const handleCreateEvent = async (eventData: any) => {
    try {
      // Prepare the payload for the backend
      const payload = {
        title: eventData.title,
        description: eventData.description || 'Join us for an unforgettable experience.',
        category: eventData.category || 'general',
        location: {
          city: eventData.city,
          venue: eventData.venue || 'TBA',
        },
        languagesSupported: ['en'],
        startDate: eventData.startDate,
        endDate: eventData.endDate || eventData.startDate,
        tags: ['new'],
        featured: false,
        tierPricing: [
          {
            name: 'General',
            price: Number(eventData.price) || 99,
            capacity: Number(eventData.totalTickets) || 100,
            sold: 0,
            seatRange: 'General',
          },
        ],
        totalTickets: Number(eventData.totalTickets) || 100,
        ticketsSold: 0,
        discountCodes: [],
      }

      console.log('Creating event with payload:', payload)

      // Call the backend API
      const { createEvent: createEventAPI } = await import('./services/api')
      const createdEvent = await createEventAPI(payload)

      console.log('Event created successfully:', createdEvent)

      // Normalize the response
      const normalizedEvent = normalizeEvent(createdEvent)

      // Add to local state
      setEvents((prev) => [normalizedEvent, ...prev])
      setNotifications((prev) => [`✅ Event "${normalizedEvent.title}" created and saved to database!`, ...prev])

      // Refresh events from database to ensure sync
      fetchEvents()
        .then((data) => {
          const payloadEvents = Array.isArray(data) ? data : data.events ?? []
          const normalized = payloadEvents.map((event: RawEvent) => normalizeEvent(event))
          if (normalized.length) {
            setEvents(normalized)
          }
        })
        .catch(console.error)
    } catch (error) {
      console.error('Error creating event:', error)
      const message = error instanceof Error ? error.message : 'Failed to create event'
      setNotifications((prev) => [`❌ Error: ${message}`, ...prev])
    }
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            events={events}
            onBook={handleBooking}
            userRole={userRole}
            onRoleChange={setUserRole}
          />
        }
      />
      <Route
        path="/user-dashboard"
        element={
          <UserDashboard
            bookings={bookingHistory}
            loyaltyPoints={loyaltyPoints}
            notifications={notifications}
            events={events}
            onBook={handleBooking}
          />
        }
      />
      <Route
        path="/organizer-dashboard"
        element={
          <OrganizerDashboard
            events={events}
            onCreateEvent={handleCreateEvent}
            notifications={notifications}
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
