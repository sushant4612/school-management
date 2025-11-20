const Joi = require('joi')
const User = require('../models/User')
const { generateToken } = require('../utils/jwt')
const sendNotification = require('../utils/notifications')

const registerSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user', 'organizer').default('user'),
  preferredLanguage: Joi.string().default('en'),
  phone: Joi.string().optional(),
})

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
})

const sanitizeUser = (user) => {
  const { password, ...rest } = user.toObject()
  return rest
}

const register = async (req, res) => {
  const { error, value } = registerSchema.validate(req.body)
  if (error) return res.status(400).json({ message: error.message })

  try {
    const existing = await User.findOne({ email: value.email })
    if (existing) return res.status(409).json({ message: 'Email already registered' })

    const user = await User.create(value)
    sendNotification({
      email: user.email,
      title: 'Welcome to EventSuite',
      message: `Hi ${user.name}, you are now part of EventSuite. Enjoy booking!`,
    }).catch(() => null)

    const token = generateToken({ id: user._id, role: user.role })
    res.status(201).json({ user: sanitizeUser(user), token })
  } catch (err) {
    console.error('register', err.message)
    res.status(500).json({ message: 'Registration failed' })
  }
}

const login = async (req, res) => {
  const { error, value } = loginSchema.validate(req.body)
  if (error) return res.status(400).json({ message: error.message })

  try {
    const user = await User.findOne({ email: value.email }).select('+password')
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })
    const valid = await user.comparePassword(value.password)
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

    user.lastLoginAt = new Date()
    await user.save()

    const token = generateToken({ id: user._id, role: user.role })
    res.json({ user: sanitizeUser(user), token })
  } catch (err) {
    console.error('login', err)
    res.status(500).json({ message: 'Login failed' })
  }
}

const profile = async (req, res) => {
  res.json({ user: sanitizeUser(req.user) })
}

module.exports = { register, login, profile }
