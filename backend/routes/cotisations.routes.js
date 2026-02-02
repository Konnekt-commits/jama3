const express = require('express');
const router = express.Router();
const cotisationsController = require('../controllers/cotisations/cotisations.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', cotisationsController.getAll);
router.get('/stats', cotisationsController.getStats);
router.get('/overdue', cotisationsController.getOverdue);
router.get('/:id', cotisationsController.getById);
router.post('/', cotisationsController.create);
router.put('/:id', cotisationsController.update);
router.delete('/:id', cotisationsController.remove);
router.post('/:id/payment', cotisationsController.registerPayment);
router.get('/:id/relances', cotisationsController.getRelances);
router.post('/:id/relances', cotisationsController.addRelance);

module.exports = router;
