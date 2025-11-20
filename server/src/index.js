const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const morgan = require('morgan')

const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const eventRoutes = require('./routes/eventRoutes')
const bookingRoutes = require('./routes/bookingRoutes')

dotenv.config()

connectDB()

const app = express()

app.use(cors())
app.use(express.json())
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

app.get('/health', (req, res) => res.send({ status: 'ok' }))

app.use('/api/auth', authRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/bookings', bookingRoutes)

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
