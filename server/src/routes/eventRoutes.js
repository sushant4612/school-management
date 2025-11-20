const { Router } = require('express')
const { authenticate, authorize } = require('../middleware/auth')
const eventController = require('../controllers/eventController')

const router = Router()

router.get('/', eventController.getEvents)
router.get('/trending', eventController.getTrendingEvents)
router.get('/recommendations', authenticate, eventController.getRecommendations)
router.get('/organizer', authenticate, authorize(['organizer', 'admin']), eventController.getOrganizerEvents)
router.get('/:id', eventController.getEvent)
// Allow event creation without auth for demo
router.post('/', eventController.createEvent)
router.put('/:id', authenticate, authorize(['organizer', 'admin']), eventController.updateEvent)
router.post('/:id/publish', authenticate, authorize(['organizer', 'admin']), eventController.publishEvent)
router.get('/:id/analytics', authenticate, authorize(['organizer', 'admin']), eventController.getAnalytics)

module.exports = router
