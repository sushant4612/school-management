const Booking = require('../models/Booking')
const Event = require('../models/Event')
const { chargeCustomer } = require('../utils/payment')
const sendNotification = require('../utils/notifications')

const createBooking = async (req, res) => {
  try {
    const { eventId, tierName, quantity = 1, discountCode } = req.body
    const event = await Event.findById(eventId)
    if (!event || event.status !== 'published') {
      return res.status(404).json({ message: 'Event not found' })
    }

    if (!event.hasAvailability(tierName, quantity)) {
      return res.status(400).json({ message: 'Selected tier is sold out or insufficient tickets' })
    }

    const tier = event.getTier(tierName)
    if (!tier) {
      return res.status(400).json({ message: 'Invalid tier selection' })
    }

    let coupon = null
    if (discountCode) {
      coupon = event.applyDiscount(discountCode)
      if (!coupon) {
        return res.status(400).json({ message: 'Invalid or expired discount code' })
      }
    }

    const baseAmount = tier.price * quantity
    const discountAmount = coupon ? ((baseAmount * coupon.discountPercent) / 100) : 0
    const totalAmount = Number((baseAmount - discountAmount).toFixed(2))

    // For demo: create a guest user if not authenticated
    let userId = req.user?._id
    if (!userId) {
      const User = require('../models/User')
      const guestEmail = `guest-${Date.now()}@demo.com`
      const guestUser = await User.create({
        name: 'Guest User',
        email: guestEmail,
        password: 'demo123456',
        role: 'user',
      })
      userId = guestUser._id
    }

    const transaction = await chargeCustomer({
      amount: totalAmount,
      metadata: { user: userId.toString(), event: event._id.toString(), tier: tierName },
    })

    event.incrementSales(tierName, quantity)
    event.recordHeatMap(event.location.city, quantity)
    await event.save()

    const booking = await Booking.create({
      user: userId,
      event: event._id,
      tierName,
      quantity,
      discountCode: coupon?.code,
      totalPrice: totalAmount,
      transaction,
    })

    if (req.user?.email) {
      await sendNotification({
        email: req.user.email,
        title: event.notificationTemplate?.subject || 'Your booking is confirmed',
        message:
          event.notificationTemplate?.body ||
          `You have successfully booked ${quantity} tickets for ${event.title}. Thank you!`,
      }).catch(() => null)
    }

    res.status(201).json({ booking, event })
  } catch (error) {
    console.error('createBooking', error)
    res.status(500).json({ message: 'Unable to complete booking' })
  }
}

const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event', 'title startDate location tierPricing')
      .sort({ createdAt: -1 })
    res.json(bookings)
  } catch (error) {
    console.error('getUserBookings', error)
    res.status(500).json({ message: 'Unable to load your bookings' })
  }
}

const getBookingsForOrganizer = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).select('_id')
    const bookings = await Booking.find({
      event: { $in: events.map((evt) => evt._id) },
    })
      .populate('user', 'name email phone')
      .populate('event', 'title startDate location')
      .sort({ createdAt: -1 })
    res.json(bookings)
  } catch (error) {
    console.error('getOrganizerBookings', error)
    res.status(500).json({ message: 'Unable to load bookings for your events' })
  }
}

module.exports = { createBooking, getUserBookings, getBookingsForOrganizer }
