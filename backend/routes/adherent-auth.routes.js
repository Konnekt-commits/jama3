const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth.middleware');
const tenantMiddleware = require('../middleware/tenant.middleware');

const JWT_SECRET = process.env.JWT_SECRET || 'jama3_jwt_secret';

// POST /api/adherent-auth/send-invite - Envoyer invitation à un adhérent (admin)
router.post('/send-invite', authMiddleware, tenantMiddleware, async (req, res) => {
    try {
        const { adherent_id } = req.body;

        if (!adherent_id) {
            return res.status(400).json({ success: false, message: 'ID adhérent requis' });
        }

        // Vérifier que l'adhérent existe
        const [adherents] = await pool.execute(
            'SELECT id, first_name, last_name, email FROM adherents WHERE id = ? AND association_id = ?',
            [adherent_id, req.associationId]
        );

        if (adherents.length === 0) {
            return res.status(404).json({ success: false, message: 'Adhérent non trouvé' });
        }

        const adherent = adherents[0];

        if (!adherent.email) {
            return res.status(400).json({ success: false, message: 'L\'adhérent n\'a pas d\'email' });
        }

        // Générer token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

        // Supprimer anciens tokens
        await pool.execute('DELETE FROM adherent_password_tokens WHERE adherent_id = ?', [adherent_id]);

        // Créer nouveau token
        await pool.execute(
            'INSERT INTO adherent_password_tokens (adherent_id, token, expires_at) VALUES (?, ?, ?)',
            [adherent_id, token, expiresAt]
        );

        const baseUrl = process.env.FRONTEND_URL || 'https://jama3-828246236461.europe-west1.run.app';
        const setupLink = `${baseUrl}/app/setup-password/${token}`;

        // TODO: Envoyer email ici (pour l'instant on retourne le lien)
        res.json({
            success: true,
            message: 'Invitation envoyée',
            data: {
                adherent: {
                    id: adherent.id,
                    name: `${adherent.first_name} ${adherent.last_name}`,
                    email: adherent.email
                },
                setup_link: setupLink,
                expires_at: expiresAt
            }
        });
    } catch (error) {
        console.error('Send invite error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// GET /api/adherent-auth/verify-token/:token - Vérifier un token de setup
router.get('/verify-token/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const [tokens] = await pool.execute(
            `SELECT t.*, a.first_name, a.last_name, a.email, assoc.name as association_name
             FROM adherent_password_tokens t
             JOIN adherents a ON t.adherent_id = a.id
             JOIN associations assoc ON a.association_id = assoc.id
             WHERE t.token = ? AND t.expires_at > NOW() AND t.used_at IS NULL`,
            [token]
        );

        if (tokens.length === 0) {
            return res.status(400).json({ success: false, message: 'Lien invalide ou expiré' });
        }

        const data = tokens[0];

        res.json({
            success: true,
            data: {
                adherent: {
                    first_name: data.first_name,
                    last_name: data.last_name,
                    email: data.email
                },
                association: data.association_name
            }
        });
    } catch (error) {
        console.error('Verify token error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// POST /api/adherent-auth/set-password - Définir le mot de passe
router.post('/set-password', async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ success: false, message: 'Token et mot de passe requis' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Mot de passe trop court (min 6 caractères)' });
        }

        // Vérifier token
        const [tokens] = await pool.execute(
            `SELECT t.*, a.id as adherent_id, a.email
             FROM adherent_password_tokens t
             JOIN adherents a ON t.adherent_id = a.id
             WHERE t.token = ? AND t.expires_at > NOW() AND t.used_at IS NULL`,
            [token]
        );

        if (tokens.length === 0) {
            return res.status(400).json({ success: false, message: 'Lien invalide ou expiré' });
        }

        const tokenData = tokens[0];

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Mettre à jour l'adhérent
        await pool.execute(
            'UPDATE adherents SET password = ?, password_set_at = NOW() WHERE id = ?',
            [hashedPassword, tokenData.adherent_id]
        );

        // Marquer le token comme utilisé
        await pool.execute(
            'UPDATE adherent_password_tokens SET used_at = NOW() WHERE id = ?',
            [tokenData.id]
        );

        res.json({
            success: true,
            message: 'Mot de passe créé avec succès',
            data: { email: tokenData.email }
        });
    } catch (error) {
        console.error('Set password error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// POST /api/adherent-auth/login - Connexion adhérent
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
        }

        // Chercher l'adhérent
        const [adherents] = await pool.execute(
            `SELECT a.*, assoc.name as association_name, assoc.id as association_id
             FROM adherents a
             JOIN associations assoc ON a.association_id = assoc.id
             WHERE a.email = ? AND a.password IS NOT NULL`,
            [email]
        );

        if (adherents.length === 0) {
            return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
        }

        const adherent = adherents[0];

        // Vérifier le mot de passe
        const validPassword = await bcrypt.compare(password, adherent.password);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
        }

        // Mettre à jour last_login
        await pool.execute('UPDATE adherents SET last_login = NOW() WHERE id = ?', [adherent.id]);

        // Générer JWT
        const token = jwt.sign(
            {
                adherentId: adherent.id,
                associationId: adherent.association_id,
                type: 'adherent'
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            data: {
                token,
                adherent: {
                    id: adherent.id,
                    first_name: adherent.first_name,
                    last_name: adherent.last_name,
                    email: adherent.email,
                    member_number: adherent.member_number,
                    status: adherent.status
                },
                association: {
                    id: adherent.association_id,
                    name: adherent.association_name
                }
            }
        });
    } catch (error) {
        console.error('Adherent login error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// GET /api/adherent-auth/me - Info adhérent connecté
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Non authentifié' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.type !== 'adherent') {
            return res.status(401).json({ success: false, message: 'Token invalide' });
        }

        // Récupérer adhérent avec cotisations
        const [adherents] = await pool.execute(
            `SELECT a.*, assoc.name as association_name
             FROM adherents a
             JOIN associations assoc ON a.association_id = assoc.id
             WHERE a.id = ?`,
            [decoded.adherentId]
        );

        if (adherents.length === 0) {
            return res.status(404).json({ success: false, message: 'Adhérent non trouvé' });
        }

        const adherent = adherents[0];

        // Cotisations
        const [cotisations] = await pool.execute(
            `SELECT id, season, amount, amount_paid, payment_status, due_date, paid_date
             FROM cotisations WHERE adherent_id = ? ORDER BY season DESC`,
            [adherent.id]
        );

        // Calculer summary
        let totalDue = 0, totalPaid = 0;
        cotisations.forEach(c => {
            totalDue += parseFloat(c.amount) || 0;
            totalPaid += parseFloat(c.amount_paid) || 0;
        });

        res.json({
            success: true,
            data: {
                adherent: {
                    id: adherent.id,
                    first_name: adherent.first_name,
                    last_name: adherent.last_name,
                    email: adherent.email,
                    phone: adherent.phone,
                    member_number: adherent.member_number,
                    status: adherent.status
                },
                association: {
                    id: adherent.association_id,
                    name: adherent.association_name
                },
                cotisations,
                summary: {
                    total_due: totalDue,
                    total_paid: totalPaid,
                    balance: totalDue - totalPaid
                }
            }
        });
    } catch (error) {
        console.error('Get adherent me error:', error);
        res.status(401).json({ success: false, message: 'Token invalide' });
    }
});

module.exports = router;
