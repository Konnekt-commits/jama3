const express = require('express');
const router = express.Router();
const intervenantsController = require('../controllers/intervenants/intervenants.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const tenantMiddleware = require('../middleware/tenant.middleware');

// Auth + Tenant middleware pour toutes les routes
router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', intervenantsController.getAll);
router.get('/:id', intervenantsController.getById);
router.post('/', intervenantsController.create);
router.put('/:id', intervenantsController.update);
router.delete('/:id', intervenantsController.remove);
router.get('/:id/events', intervenantsController.getEvents);
router.get('/:id/stats', intervenantsController.getStats);

module.exports = router;
