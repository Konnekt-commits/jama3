const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/events/events.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const tenantMiddleware = require('../middleware/tenant.middleware');

// Auth + Tenant middleware pour toutes les routes
router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', eventsController.getAll);
router.get('/upcoming', eventsController.getUpcoming);
router.get('/calendar', eventsController.getByDateRange);
router.get('/stats', eventsController.getStats);
router.get('/:id', eventsController.getById);
router.post('/', eventsController.create);
router.put('/:id', eventsController.update);
router.delete('/:id', eventsController.remove);
router.post('/:id/cancel', eventsController.cancel);
router.get('/:id/participants', eventsController.getParticipants);
router.post('/:id/participants', eventsController.addParticipant);
router.delete('/:id/participants/:adherentId', eventsController.removeParticipant);
router.put('/:id/participants/:adherentId/attendance', eventsController.updateAttendance);

module.exports = router;
