const Stripe = require('stripe')

const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null

const chargeCustomer = async ({ amount, currency = 'usd', metadata = {} }) => {
  const normalizedAmount = Math.round(amount * 100)
  if (!stripe) {
    return {
      provider: 'manual',
      transactionId: `manual-${Date.now()}`,
      amount,
      currency,
      metadata,
    }
  }
  const paymentIntent = await stripe.paymentIntents.create({
    amount: normalizedAmount,
    currency,
    metadata,
  })
  return {
    provider: 'stripe',
    transactionId: paymentIntent.id,
    amount,
    currency,
    metadata,
  }
}

module.exports = { chargeCustomer }
