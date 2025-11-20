import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AppEvent } from '../App'

type HomePageProps = {
  events: AppEvent[]
  onBook: (eventId: string, tierName: string, quantity: number, discountCode?: string) => void
  userRole: 'user' | 'organizer' | null
  onRoleChange: (role: 'user' | 'organizer' | null) => void
}

export default function HomePage({ events, onBook, userRole, onRoleChange }: HomePageProps) {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ category: 'all', city: 'all', search: '' })
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null)
  const [bookingForm, setBookingForm] = useState({
    tier: '',
    quantity: 1,
    discountCode: '',
  })

  const categories = useMemo(() => ['all', ...new Set(events.map((e) => e.category))], [events])
  const cities = useMemo(() => ['all', ...new Set(events.map((e) => e.city))], [events])

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesCategory = filters.category === 'all' || event.category === filters.category
      const matchesCity = filters.city === 'all' || event.city === filters.city
      const matchesSearch =
        !filters.search ||
        event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.description.toLowerCase().includes(filters.search.toLowerCase())
      return matchesCategory && matchesCity && matchesSearch
    })
  }, [events, filters])

  const handleBookNow = (event: AppEvent) => {
    setSelectedEvent(event)
    setBookingForm({ tier: event.tierPricing[0]?.name || '', quantity: 1, discountCode: '' })
  }

  const handleSubmitBooking = () => {
    if (!selectedEvent) return
    onBook(selectedEvent.id, bookingForm.tier, bookingForm.quantity, bookingForm.discountCode)
    setSelectedEvent(null)
  }

  const selectedTier = selectedEvent?.tierPricing.find((t) => t.name === bookingForm.tier)
  const available = selectedTier ? selectedTier.capacity - selectedTier.sold : 0
  const discount = selectedEvent?.discountCodes.find(
    (d) => d.code === bookingForm.discountCode.toUpperCase()
  )
  const baseAmount = selectedTier ? selectedTier.price * bookingForm.quantity : 0
  const totalAmount = discount
    ? Number((baseAmount * (1 - discount.discountPercent / 100)).toFixed(2))
    : baseAmount

  return (
    <div className="page">
      <header className="navbar">
        <div className="navbar-brand">
          <h1>EventHub</h1>
          <p>Discover & Book Amazing Events</p>
        </div>
        <div className="navbar-actions">
          {!userRole ? (
            <>
              <button
                className="secondary"
                onClick={() => {
                  onRoleChange('user')
                  navigate('/user-dashboard')
                }}
              >
                User Login
              </button>
              <button
                className="primary"
                onClick={() => {
                  onRoleChange('organizer')
                  navigate('/organizer-dashboard')
                }}
              >
                Organizer Login
              </button>
            </>
          ) : (
            <>
              <button
                className="secondary"
                onClick={() => {
                  navigate(userRole === 'user' ? '/user-dashboard' : '/organizer-dashboard')
                }}
              >
                Dashboard
              </button>
              <button
                className="secondary"
                onClick={() => {
                  onRoleChange(null)
                  navigate('/')
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <h2>Experience Events Like Never Before</h2>
          <p>Browse thousands of concerts, workshops, conferences, and more</p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <span className="stat-number">{events.length}</span>
            <span className="stat-label">Live Events</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {events.reduce(
                (sum, e) =>
                  sum + e.tierPricing.reduce((s, t) => s + Math.max(t.capacity - t.sold, 0), 0),
                0
              )}
            </span>
            <span className="stat-label">Available Tickets</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{cities.length - 1}</span>
            <span className="stat-label">Cities</span>
          </div>
        </div>
      </section>

      <section className="filters-section">
        <input
          type="text"
          placeholder="Search events..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="search-input"
        />
        <div className="filter-group">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
          <select
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city === 'all' ? 'All Cities' : city}
              </option>
            ))}
          </select>
        </div>
        <span className="filter-result">{filteredEvents.length} events found</span>
      </section>

      <section className="events-section">
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <article key={event.id} className={`event-card ${event.featured ? 'featured' : ''}`}>
              <div className="event-badge">{event.category}</div>
              {event.featured && <div className="featured-badge">Featured</div>}
              <h3>{event.title}</h3>
              <p className="event-description">{event.description}</p>
              <div className="event-info">
                <div className="info-item">
                  <span className="icon">📍</span>
                  <span>
                    {event.city}, {event.location.venue}
                  </span>
                </div>
                <div className="info-item">
                  <span className="icon">📅</span>
                  <span>{event.startDate}</span>
                </div>
              </div>
              <div className="event-tags">
                {event.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="event-pricing">
                {event.tierPricing.map((tier) => (
                  <div key={tier.name} className="price-tier">
                    <span className="tier-name">{tier.name}</span>
                    <span className="tier-price">${tier.price}</span>
                    <span className="tier-available">
                      {Math.max(tier.capacity - tier.sold, 0)} left
                    </span>
                  </div>
                ))}
              </div>
              <button className="primary btn-block" onClick={() => handleBookNow(event)}>
                Book Now
              </button>
            </article>
          ))}
        </div>
      </section>

      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Book Tickets</h2>
              <button className="modal-close" onClick={() => setSelectedEvent(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <h3>{selectedEvent.title}</h3>
              <p className="modal-event-info">
                {selectedEvent.city} • {selectedEvent.startDate}
              </p>

              <div className="form-group">
                <label>Select Tier</label>
                <select
                  value={bookingForm.tier}
                  onChange={(e) => setBookingForm({ ...bookingForm, tier: e.target.value })}
                >
                  {selectedEvent.tierPricing.map((tier) => (
                    <option key={tier.name} value={tier.name}>
                      {tier.name} - ${tier.price} ({Math.max(tier.capacity - tier.sold, 0)}{' '}
                      available)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={available}
                  value={bookingForm.quantity}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, quantity: Number(e.target.value) })
                  }
                />
              </div>

              <div className="form-group">
                <label>Discount Code (Optional)</label>
                <input
                  type="text"
                  placeholder="Enter code"
                  value={bookingForm.discountCode}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, discountCode: e.target.value })
                  }
                />
                {discount && (
                  <span className="discount-applied">
                    ✓ {discount.discountPercent}% discount applied
                  </span>
                )}
              </div>

              <div className="booking-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>${baseAmount.toFixed(2)}</span>
                </div>
                {discount && (
                  <div className="summary-row discount">
                    <span>Discount:</span>
                    <span>-${(baseAmount - totalAmount).toFixed(2)}</span>
                  </div>
                )}
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button className="primary btn-block" onClick={handleSubmitBooking}>
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
