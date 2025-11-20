const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-booking'
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('✅ MongoDB connected')
  } catch (error) {
    console.error('❌ MongoDB connection error', error)
    process.exit(1)
  }
}

module.exports = connectDB
