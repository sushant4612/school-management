const { Router } = require('express')
const { authenticate } = require('../middleware/auth')
const { createBooking, getUserBookings, getBookingsForOrganizer } = require('../controllers/bookingController')

const router = Router()

// Allow bookings without auth for demo (in production, use authenticate middleware)
router.post('/', createBooking)
router.get('/me', authenticate, getUserBookings)
router.get('/organizer', authenticate, getBookingsForOrganizer)

module.exports = router
