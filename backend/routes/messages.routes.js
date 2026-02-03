const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messages/messages.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const tenantMiddleware = require('../middleware/tenant.middleware');

// Auth + Tenant middleware pour toutes les routes
router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', messagesController.getAll);
router.get('/me', messagesController.getMyMessages);
router.get('/unread-count', messagesController.getUnreadCount);
router.get('/stats', messagesController.getStats);
router.get('/:id', messagesController.getById);
router.post('/', messagesController.create);
router.post('/group', messagesController.sendToGroup);
router.put('/:id/read', messagesController.markAsRead);
router.put('/read-all', messagesController.markAllAsRead);
router.delete('/:id', messagesController.remove);

module.exports = router;
