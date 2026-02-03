const AssociationModel = require('../models/association.model');

/**
 * Middleware Tenant - Isolation des données par association
 *
 * Ce middleware injecte l'association_id dans toutes les requêtes
 * à partir du token JWT de l'utilisateur authentifié.
 *
 * Doit être utilisé APRÈS le middleware d'authentification.
 */
const tenantMiddleware = async (req, res, next) => {
    try {
        // L'association_id vient du token JWT (set par authMiddleware)
        const associationId = req.user?.associationId;

        if (!associationId) {
            return res.status(401).json({
                success: false,
                message: 'Association non identifiée'
            });
        }

        // Vérifier que l'association existe et est active
        const association = await AssociationModel.findById(associationId);

        if (!association) {
            return res.status(404).json({
                success: false,
                message: 'Association introuvable'
            });
        }

        if (!association.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Association désactivée'
            });
        }

        // Injecter les infos dans la requête
        req.associationId = associationId;
        req.association = association;
        req.userRole = req.user.role;
        req.isOwner = req.user.isOwner || false;

        next();
    } catch (error) {
        console.error('Erreur middleware tenant:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur d\'authentification tenant'
        });
    }
};

module.exports = tenantMiddleware;
