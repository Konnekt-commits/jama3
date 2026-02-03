const express = require('express');
const router = express.Router();
const associationsController = require('../controllers/associations/associations.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const tenantMiddleware = require('../middleware/tenant.middleware');

// Routes publiques (pas besoin d'auth)
// POST /api/associations - Créer une nouvelle association (onboarding)
router.post('/', associationsController.create);

// GET /api/associations/check-slug/:slug - Vérifier disponibilité d'un slug
router.get('/check-slug/:slug', associationsController.checkSlug);

// Routes protégées (auth + tenant)
// GET /api/associations/current - Infos association courante
router.get('/current', authMiddleware, tenantMiddleware, associationsController.getCurrent);

// PUT /api/associations/current - Mise à jour association courante
router.put('/current', authMiddleware, tenantMiddleware, associationsController.update);

// GET /api/associations/stats - Statistiques de l'association
router.get('/stats', authMiddleware, tenantMiddleware, associationsController.getStats);

module.exports = router;
