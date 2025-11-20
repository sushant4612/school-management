const mongoose = require('mongoose')

const TierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    capacity: { type: Number, required: true },
    sold: { type: Number, default: 0 },
    seatRange: String,
  },
  { _id: false },
)

const DiscountSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, uppercase: true, trim: true },
    description: String,
    discountPercent: { type: Number, min: 1, max: 100, default: 10 },
    active: { type: Boolean, default: true },
    usageLimit: { type: Number, default: 250 },
    usedCount: { type: Number, default: 0 },
    validFrom: Date,
    validUntil: Date,
  },
  { _id: false },
)

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: 'general' },
    location: {
      city: { type: String, required: true },
      venue: { type: String, required: true },
      address: String,
    },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    languagesSupported: { type: [String], default: ['en'] },
    tags: { type: [String], default: [] },
    notificationTemplate: {
      subject: { type: String, default: 'Your event booking is confirmed' },
      body: { type: String, default: 'Thank you for booking with us. See you at the event!' },
    },
    tierPricing: { type: [TierSchema], default: [] },
    totalTickets: { type: Number, default: 0 },
    ticketsSold: { type: Number, default: 0 },
    discountCodes: { type: [DiscountSchema], default: [] },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    streamingLink: String,
    status: { type: String, enum: ['draft', 'published', 'cancelled'], default: 'draft' },
    featured: { type: Boolean, default: false },
    analytics: {
      popularityScore: { type: Number, default: 0 },
      heatMap: {
        type: Map,
        of: Number,
        default: {},
      },
      demographics: {
        type: Map,
        of: Number,
        default: {},
      },
    },
  },
  { timestamps: true },
)

eventSchema.virtual('availableTickets').get(function () {
  return Math.max(this.totalTickets - this.ticketsSold, 0)
})

eventSchema.methods.getTier = function (tierName) {
  return this.tierPricing.find((tier) => tier.name.toLowerCase() === tierName.toLowerCase())
}

eventSchema.methods.hasAvailability = function (tierName, quantity = 1) {
  const tier = this.getTier(tierName)
  if (!tier) return false
  const tierAvailable = tier.capacity - tier.sold
  return tierAvailable >= quantity && this.availableTickets >= quantity
}

eventSchema.methods.incrementSales = function (tierName, quantity = 1) {
  const tier = this.getTier(tierName)
  if (tier) {
    tier.sold += quantity
  }
  this.ticketsSold += quantity
  this.analytics.popularityScore += Math.round(quantity * 1.5)
}

eventSchema.methods.applyDiscount = function (code) {
  const normalized = code?.trim()?.toUpperCase()
  if (!normalized) return null
  const coupon = this.discountCodes.find((discount) => discount.code === normalized && discount.active)
  if (!coupon) return null
  const now = new Date()
  if ((coupon.validFrom && coupon.validFrom > now) || (coupon.validUntil && coupon.validUntil < now)) {
    return null
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return null
  }
  coupon.usedCount += 1
  return coupon
}

eventSchema.methods.recordHeatMap = function (city, quantity) {
  if (!city) return
  const existing = this.analytics.heatMap.get(city.toLowerCase()) || 0
  this.analytics.heatMap.set(city.toLowerCase(), existing + quantity)
}

module.exports = mongoose.model('Event', eventSchema)
