const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'very-secure-secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

const verifyToken = (token) => {
  if (!token) throw new Error('Token missing')
  return jwt.verify(token, JWT_SECRET)
}

module.exports = { generateToken, verifyToken }
