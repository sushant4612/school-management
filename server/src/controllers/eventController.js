const Event = require('../models/Event')
const Booking = require('../models/Booking')

const buildFilter = (query) => {
  const filter = { status: 'published' }
  if (query.category) filter.category = query.category
  if (query.city) filter['location.city'] = query.city
  if (query.language) filter.languagesSupported = query.language
  if (query.startDate) filter.startDate = { $gte: new Date(query.startDate) }
  if (query.endDate) filter.endDate = { $lte: new Date(query.endDate) }
  return filter
}

const createEvent = async (req, res) => {
  try {
    // For demo: create a guest organizer if not authenticated
    let organizerId = req.user?._id
    if (!organizerId) {
      const User = require('../models/User')
      const orgEmail = `organizer-${Date.now()}@demo.com`
      const orgUser = await User.create({
        name: 'Demo Organizer',
        email: orgEmail,
        password: 'demo123456',
        role: 'organizer',
      })
      organizerId = orgUser._id
    }

    const payload = { ...req.body, organizer: organizerId, status: 'published' }
    const event = await Event.create(payload)
    res.status(201).json(event)
  } catch (error) {
    console.error('createEvent', error)
    res.status(500).json({ message: 'Failed to create event' })
  }
}

const publishEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, organizer: req.user._id })
    if (!event) return res.status(404).json({ message: 'Event not found' })
    event.status = 'published'
    await event.save()
    res.json(event)
  } catch (error) {
    console.error('publishEvent', error)
    res.status(500).json({ message: 'Unable to publish event' })
  }
}

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, organizer: req.user._id },
      { $set: req.body },
      { new: true },
    )
    if (!event) return res.status(404).json({ message: 'Event not found' })
    res.json(event)
  } catch (error) {
    console.error('updateEvent', error)
    res.status(500).json({ message: 'Unable to update event' })
  }
}

const getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 12, search } = req.query
    const filter = buildFilter(req.query)
    if (search) filter.$text = { $search: search }
    const events = await Event.find(filter)
      .sort({ startDate: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
    const total = await Event.countDocuments(filter)
    res.json({ events, pagination: { total, page, limit } })
  } catch (error) {
    console.error('getEvents', error)
    res.status(500).json({ message: 'Unable to load events' })
  }
}

const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email')
    if (!event || event.status !== 'published') {
      return res.status(404).json({ message: 'Event not found' })
    }
    res.json(event)
  } catch (error) {
    console.error('getEvent', error)
    res.status(500).json({ message: 'Unable to find event' })
  }
}

const getOrganizerEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort({ createdAt: -1 })
    res.json(events)
  } catch (error) {
    console.error('getOrganizerEvents', error)
    res.status(500).json({ message: 'Unable to load your events' })
  }
}

const getTrendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'published' })
      .sort({ 'analytics.popularityScore': -1 })
      .limit(6)
    res.json(events)
  } catch (error) {
    console.error('getTrendingEvents', error)
    res.status(500).json({ message: 'Unable to fetch trending events' })
  }
}

const getRecommendations = async (req, res) => {
  try {
    const prefer = req.user?.preferredLanguage || 'en'
    const events = await Event.find({
      status: 'published',
      languagesSupported: prefer,
    })
      .sort({ startDate: 1 })
      .limit(6)
    res.json(events)
  } catch (error) {
    console.error('getRecommendations', error)
    res.status(500).json({ message: 'Unable to compute recommendations' })
  }
}

const getAnalytics = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, organizer: req.user._id })
    if (!event) return res.status(404).json({ message: 'Event not found' })
    const bookings = await Booking.find({ event: event._id })
    const salesByTier = event.tierPricing.reduce((acc, tier) => {
      acc[tier.name] = tier.sold || 0
      return acc
    }, {})
    const demographics = Array.from(event.analytics.demographics.entries()).map(([key, value]) => ({ key, value }))
    res.json({ event, bookings, stats: { salesByTier, popularity: event.analytics.popularityScore, demographics } })
  } catch (error) {
    console.error('getAnalytics', error)
    res.status(500).json({ message: 'Unable to load analytics' })
  }
}

module.exports = {
  createEvent,
  publishEvent,
  updateEvent,
  getEvents,
  getEvent,
  getOrganizerEvents,
  getTrendingEvents,
  getRecommendations,
  getAnalytics,
}
