import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AppEvent, BookingHistory } from '../App'

type UserDashboardProps = {
  bookings: BookingHistory[]
  loyaltyPoints: number
  notifications: string[]
  events: AppEvent[]
  onBook: (eventId: string, tierName: string, quantity: number, discountCode?: string) => void
}

export default function UserDashboard({
  bookings,
  loyaltyPoints,
  notifications,
  events,
}: UserDashboardProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'bookings' | 'browse'>('bookings')

  const upcomingBookings = bookings.filter((b) => new Date(b.date) >= new Date())
  const pastBookings = bookings.filter((b) => new Date(b.date) < new Date())

  return (
    <div className="page">
      <header className="navbar">
        <div className="navbar-brand">
          <h1>EventHub</h1>
          <p>User Dashboard</p>
        </div>
        <div className="navbar-actions">
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
          <h2>Welcome Back!</h2>
          <p>Manage your bookings and discover new events</p>
        </div>
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-icon">🎫</span>
            <div>
              <span className="stat-number">{bookings.length}</span>
              <span className="stat-label">Total Bookings</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⭐</span>
            <div>
              <span className="stat-number">{loyaltyPoints}</span>
              <span className="stat-label">Loyalty Points</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📅</span>
            <div>
              <span className="stat-number">{upcomingBookings.length}</span>
              <span className="stat-label">Upcoming Events</span>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-tabs">
        <div className="tabs-header">
          <button
            className={activeTab === 'bookings' ? 'tab-active' : ''}
            onClick={() => setActiveTab('bookings')}
          >
            My Bookings
          </button>
          <button
            className={activeTab === 'browse' ? 'tab-active' : ''}
            onClick={() => setActiveTab('browse')}
          >
            Browse Events
          </button>
        </div>

        {activeTab === 'bookings' && (
          <div className="tab-content">
            {bookings.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🎭</span>
                <h3>No bookings yet</h3>
                <p>Start exploring events and book your first ticket!</p>
                <button className="primary" onClick={() => navigate('/')}>
                  Browse Events
                </button>
              </div>
            ) : (
              <>
                {upcomingBookings.length > 0 && (
                  <div className="bookings-section">
                    <h3>Upcoming Events</h3>
                    <div className="bookings-grid">
                      {upcomingBookings.map((booking) => (
                        <div key={booking.id} className="booking-card">
                          <div className="booking-header">
                            <h4>{booking.event.title}</h4>
                            <span className={`status-badge ${booking.status}`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="booking-details">
                            <div className="detail-row">
                              <span className="icon">📍</span>
                              <span>
                                {booking.event.city}, {booking.event.location.venue}
                              </span>
                            </div>
                            <div className="detail-row">
                              <span className="icon">📅</span>
                              <span>{booking.event.startDate}</span>
                            </div>
                            <div className="detail-row">
                              <span className="icon">🎫</span>
                              <span>{booking.tier} Tier</span>
                            </div>
                          </div>
                          <div className="booking-footer">
                            <span className="booking-price">${booking.amount}</span>
                            <button className="secondary">View Details</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pastBookings.length > 0 && (
                  <div className="bookings-section">
                    <h3>Past Events</h3>
                    <div className="bookings-list">
                      {pastBookings.map((booking) => (
                        <div key={booking.id} className="booking-item">
                          <div>
                            <h4>{booking.event.title}</h4>
                            <p>
                              {booking.event.city} • {booking.date}
                            </p>
                          </div>
                          <span className="booking-price">${booking.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'browse' && (
          <div className="tab-content">
            <div className="events-grid">
              {events.slice(0, 6).map((event) => (
                <article key={event.id} className="event-card">
                  <div className="event-badge">{event.category}</div>
                  <h3>{event.title}</h3>
                  <p className="event-description">{event.description}</p>
                  <div className="event-info">
                    <div className="info-item">
                      <span className="icon">📍</span>
                      <span>{event.city}</span>
                    </div>
                    <div className="info-item">
                      <span className="icon">📅</span>
                      <span>{event.startDate}</span>
                    </div>
                  </div>
                  <button className="primary btn-block" onClick={() => navigate('/')}>
                    View Details
                  </button>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      {notifications.length > 0 && (
        <section className="notifications-section">
          <h3>Recent Notifications</h3>
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
    </div>
  )
}
