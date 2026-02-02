const jwt = require('jsonwebtoken');
const UserModel = require('../../models/user.model');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email et mot de passe requis'
            });
        }

        const user = await UserModel.findByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Identifiants incorrects'
            });
        }

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Compte désactivé'
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
            { userId: user.id, role: user.role },
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
                    avatar_url: user.avatar_url
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

const register = async (req, res) => {
    try {
        const { email, password, first_name, last_name, role } = req.body;

        if (!email || !password || !first_name || !last_name) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont requis'
            });
        }

        const existingUser = await UserModel.findByEmail(email);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Cet email est déjà utilisé'
            });
        }

        const userId = await UserModel.create({
            email,
            password,
            first_name,
            last_name,
            role: role || 'gestionnaire'
        });

        const token = jwt.sign(
            { userId, role: role || 'gestionnaire' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            success: true,
            data: {
                token,
                user: {
                    id: userId,
                    email,
                    role: role || 'gestionnaire',
                    first_name,
                    last_name
                }
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const me = async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                user: req.user
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
        });

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

        const user = await UserModel.findByEmail(req.user.email);
        const isValidPassword = await UserModel.verifyPassword(user, current_password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Mot de passe actuel incorrect'
            });
        }

        await UserModel.updatePassword(req.user.id, new_password);

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
