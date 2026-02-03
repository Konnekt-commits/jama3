const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token d\'authentification manquant'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await UserModel.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Compte désactivé'
            });
        }

        // Injecter les données utilisateur et association depuis le token
        req.user = {
            ...user,
            associationId: decoded.associationId || user.association_id,
            role: decoded.role || user.role,
            isOwner: decoded.isOwner || user.is_owner || false
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token invalide'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expiré'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Erreur d\'authentification'
        });
    }
};

const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Non authentifié'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé pour ce rôle'
            });
        }

        next();
    };
};

const requireOwner = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Non authentifié'
        });
    }

    if (!req.user.isOwner && req.user.role !== 'super_admin') {
        return res.status(403).json({
            success: false,
            message: 'Accès réservé au propriétaire de l\'association'
        });
    }

    next();
};

const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await UserModel.findById(decoded.userId);
            if (user && user.is_active) {
                req.user = {
                    ...user,
                    associationId: decoded.associationId || user.association_id,
                    role: decoded.role || user.role,
                    isOwner: decoded.isOwner || user.is_owner || false
                };
            }
        }

        next();
    } catch (error) {
        next();
    }
};

module.exports = { authMiddleware, requireRole, requireOwner, optionalAuth };
