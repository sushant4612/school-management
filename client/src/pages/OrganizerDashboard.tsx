import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AppEvent } from '../App'

type OrganizerDashboardProps = {
  events: AppEvent[]
  onCreateEvent: (eventData: any) => void
  notifications: string[]
}

export default function OrganizerDashboard({
  events,
  onCreateEvent,
  notifications,
}: OrganizerDashboardProps) {
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    city: '',
    venue: '',
    category: 'music',
    startDate: '',
    endDate: '',
    price: 99,
    totalTickets: 100,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreateEvent(form)
    setForm({
      title: '',
      description: '',
      city: '',
      venue: '',
      category: 'music',
      startDate: '',
      endDate: '',
      price: 99,
      totalTickets: 100,
    })
    setShowCreateModal(false)
  }

  const myEvents = events.slice(0, 5)
  const totalTicketsSold = myEvents.reduce((sum, e) => sum + e.ticketsSold, 0)
  const totalRevenue = myEvents.reduce(
    (sum, e) =>
      sum + e.tierPricing.reduce((s, t) => s + t.sold * t.price, 0),
    0
  )

  return (
    <div className="page">
      <header className="navbar">
        <div className="navbar-brand">
          <h1>EventHub</h1>
          <p>Organizer Dashboard</p>
        </div>
        <div className="navbar-actions">
          <button className="primary" onClick={() => setShowCreateModal(true)}>
            + Create Event
          </button>
          <button className="secondary" onClick={() => navigate('/')}>
            Browse Events
          </button>
          <button className="secondary" onClick={() => navigate('/')}>
            Logout
          </button>
        </div>
      </header>

      <section className="dashboard-hero">
        <div className="welcome-card">
          <h2>Organizer Dashboard</h2>
          <p>Manage your events and track performance</p>
        </div>
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-icon">🎪</span>
            <div>
              <span className="stat-number">{myEvents.length}</span>
              <span className="stat-label">Total Events</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🎫</span>
            <div>
              <span className="stat-number">{totalTicketsSold}</span>
              <span className="stat-label">Tickets Sold</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">💰</span>
            <div>
              <span className="stat-number">${totalRevenue.toLocaleString()}</span>
              <span className="stat-label">Total Revenue</span>
            </div>
          </div>
        </div>
      </section>

      <section className="events-management">
        <div className="section-header">
          <h3>My Events</h3>
          <button className="secondary" onClick={() => setShowCreateModal(true)}>
            + New Event
          </button>
        </div>

        {myEvents.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎭</span>
            <h3>No events yet</h3>
            <p>Create your first event to get started!</p>
            <button className="primary" onClick={() => setShowCreateModal(true)}>
              Create Event
            </button>
          </div>
        ) : (
          <div className="events-table">
            {myEvents.map((event) => {
              const totalCapacity = event.tierPricing.reduce((sum, t) => sum + t.capacity, 0)
              const soldPercentage = totalCapacity > 0 ? (event.ticketsSold / totalCapacity) * 100 : 0

              return (
                <div key={event.id} className="event-row">
                  <div className="event-main-info">
                    <h4>{event.title}</h4>
                    <p>
                      {event.city} • {event.location.venue} • {event.startDate}
                    </p>
                  </div>
                  <div className="event-stats">
                    <div className="stat-item">
                      <span className="stat-label">Sold</span>
                      <span className="stat-value">
                        {event.ticketsSold}/{totalCapacity}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Revenue</span>
                      <span className="stat-value">
                        ${event.tierPricing.reduce((sum, t) => sum + t.sold * t.price, 0)}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${soldPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="event-actions">
                    <button className="secondary">Edit</button>
                    <button className="secondary">Analytics</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {notifications.length > 0 && (
        <section className="notifications-section">
          <h3>Recent Activity</h3>
          <div className="notifications-list">
            {notifications.slice(0, 5).map((notif, idx) => (
              <div key={idx} className="notification-item">
                <span className="notif-icon">🔔</span>
                <span>{notif}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Event</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Event Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Enter event title"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="music">Music</option>
                    <option value="workshop">Workshop</option>
                    <option value="conference">Conference</option>
                    <option value="sports">Sports</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe your event"
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Event city"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Venue</label>
                  <input
                    type="text"
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    placeholder="Venue name"
                  />
                </div>
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Ticket Price ($) *</label>
                  <input
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Total Tickets *</label>
                  <input
                    type="number"
                    min={1}
                    value={form.totalTickets}
                    onChange={(e) => setForm({ ...form, totalTickets: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
