const mongoose = require('mongoose')

const TransactionSchema = new mongoose.Schema(
  {
    provider: { type: String, enum: ['stripe', 'manual', 'offline'], default: 'stripe' },
    transactionId: String,
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    metadata: { type: Map, of: String, default: {} },
  },
  { _id: false },
)

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    tierName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    discountCode: String,
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' },
    paymentStatus: { type: String, enum: ['initiated', 'succeeded', 'failed'], default: 'succeeded' },
    reminderDates: [{ type: Date }],
    transaction: { type: TransactionSchema, default: () => ({}) },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Booking', bookingSchema)
