const jwt = require('jsonwebtoken');
const UserModel = require('../../models/user.model');
const AssociationModel = require('../../models/association.model');

const login = async (req, res) => {
    try {
        const { email, password, association_slug } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email et mot de passe requis'
            });
        }

        // Chercher les utilisateurs avec cet email
        const users = await UserModel.findByEmailWithAssociation(email);

        if (!users || users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Identifiants incorrects'
            });
        }

        // Si plusieurs associations et pas de slug fourni
        if (users.length > 1 && !association_slug) {
            // Retourner la liste des associations pour que l'utilisateur choisisse
            return res.json({
                success: true,
                requireAssociationSelection: true,
                associations: users.map(u => ({
                    slug: u.association_slug,
                    name: u.association_name
                }))
            });
        }

        // Trouver le bon utilisateur (par slug ou le seul disponible)
        let user = users[0];
        if (association_slug) {
            user = users.find(u => u.association_slug === association_slug);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Association non trouvée'
                });
            }
        }

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Compte désactivé'
            });
        }

        // Vérifier l'association seulement si l'utilisateur n'est pas super_admin
        if (user.role !== 'super_admin' && !user.association_active) {
            return res.status(403).json({
                success: false,
                message: 'Association désactivée'
            });
        }

        const isValidPassword = await UserModel.verifyPassword(user, password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Identifiants incorrects'
            });
        }

        await UserModel.updateLastLogin(user.id);

        const token = jwt.sign(
            {
                userId: user.id,
                associationId: user.association_id,
                role: user.role,
                isOwner: user.is_owner || false
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    avatar_url: user.avatar_url,
                    is_owner: user.is_owner
                },
                association: {
                    id: user.association_id,
                    name: user.association_name,
                    slug: user.association_slug
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// Register n'est plus disponible en direct - utiliser l'onboarding ou les invitations
const register = async (req, res) => {
    return res.status(400).json({
        success: false,
        message: 'Inscription directe non disponible. Créez une association ou utilisez une invitation.'
    });
};

const me = async (req, res) => {
    try {
        const association = await AssociationModel.findById(req.user.associationId);

        res.json({
            success: true,
            data: {
                user: {
                    id: req.user.id,
                    email: req.user.email,
                    role: req.user.role,
                    first_name: req.user.first_name,
                    last_name: req.user.last_name,
                    avatar_url: req.user.avatar_url,
                    is_owner: req.user.is_owner
                },
                association: association ? {
                    id: association.id,
                    name: association.name,
                    slug: association.slug,
                    logo_url: association.logo_url
                } : null
            }
        });
    } catch (error) {
        console.error('Me error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { first_name, last_name, avatar_url } = req.body;

        const updated = await UserModel.update(req.user.id, {
            first_name,
            last_name,
            avatar_url
        }, req.user.associationId);

        if (!updated) {
            return res.status(400).json({
                success: false,
                message: 'Aucune modification effectuée'
            });
        }

        const user = await UserModel.findById(req.user.id);

        res.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({
                success: false,
                message: 'Mot de passe actuel et nouveau requis'
            });
        }

        const users = await UserModel.findByEmail(req.user.email);
        const user = users.find(u => u.id === req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        const isValidPassword = await UserModel.verifyPassword(user, current_password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Mot de passe actuel incorrect'
            });
        }

        await UserModel.updatePassword(req.user.id, new_password, req.user.associationId);

        res.json({
            success: true,
            message: 'Mot de passe modifié avec succès'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

module.exports = {
    login,
    register,
    me,
    updateProfile,
    changePassword
};
