const { Router } = require('express')
const { register, login, profile } = require('../controllers/authController')
const { authenticate } = require('../middleware/auth')

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', authenticate, profile)

module.exports = router
