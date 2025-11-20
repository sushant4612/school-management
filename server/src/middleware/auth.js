const { verifyToken } = require('../utils/jwt')
const User = require('../models/User')

const authenticate = async (req, res, next) => {
  try {
    const raw = req.headers.authorization
    if (!raw || !raw.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' })
    }
    const token = raw.split(' ')[1]
    const payload = verifyToken(token)
    const user = await User.findById(payload.id)
    if (!user) return res.status(401).json({ message: 'User not found' })
    req.user = user
    next()
  } catch (error) {
    console.error('auth middleware', error.message)
    return res.status(401).json({ message: 'Invalid token' })
  }
}

const authorize = (roles = []) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' })
  }
  next()
}

const optionalAuthenticate = async (req, res, next) => {
  try {
    const raw = req.headers.authorization
    if (!raw || !raw.startsWith('Bearer ')) return next()
    const token = raw.split(' ')[1]
    const payload = verifyToken(token)
    const user = await User.findById(payload.id)
    if (user) {
      req.user = user
    }
  } catch (error) {
    console.warn('optional auth failed', error.message)
  }
  next()
}

module.exports = { authenticate, authorize }
