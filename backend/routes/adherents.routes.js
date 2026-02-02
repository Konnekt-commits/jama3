const express = require('express');
const router = express.Router();
const adherentsController = require('../controllers/adherents/adherents.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', adherentsController.getAll);
router.get('/stats', adherentsController.getStats);
router.get('/:id', adherentsController.getById);
router.post('/', adherentsController.create);
router.put('/:id', adherentsController.update);
router.delete('/:id', adherentsController.remove);
router.post('/:id/archive', adherentsController.archive);
router.get('/:id/activities', adherentsController.getActivities);
router.post('/:id/activities', adherentsController.addActivity);

module.exports = router;
