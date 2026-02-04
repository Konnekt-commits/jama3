const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth.middleware');
const tenantMiddleware = require('../middleware/tenant.middleware');

// POST /api/adherent-space/generate-token - Générer un token pour un adhérent (admin only)
router.post('/generate-token', authMiddleware, tenantMiddleware, async (req, res) => {
    try {
        const { adherent_id, validity_hours = 48 } = req.body;

        if (!adherent_id) {
            return res.status(400).json({
                success: false,
                message: 'ID adhérent requis'
            });
        }

        // Vérifier que l'adhérent existe et appartient à l'association
        const [adherents] = await pool.execute(
            'SELECT id, first_name, last_name, email FROM adherents WHERE id = ? AND association_id = ?',
            [adherent_id, req.associationId]
        );

        if (adherents.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Adhérent non trouvé'
            });
        }

        const adherent = adherents[0];

        // Générer un token sécurisé
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + validity_hours * 60 * 60 * 1000);

        // Supprimer les anciens tokens de cet adhérent
        await pool.execute(
            'DELETE FROM adherent_tokens WHERE adherent_id = ?',
            [adherent_id]
        );

        // Insérer le nouveau token
        await pool.execute(
            'INSERT INTO adherent_tokens (adherent_id, token, expires_at) VALUES (?, ?, ?)',
            [adherent_id, token, expiresAt]
        );

        // Construire l'URL
        const baseUrl = process.env.FRONTEND_URL || 'https://jama3-828246236461.europe-west1.run.app';
        const magicLink = `${baseUrl}/app/espace-adherent/${token}`;

        res.json({
            success: true,
            data: {
                token,
                magic_link: magicLink,
                expires_at: expiresAt,
                adherent: {
                    id: adherent.id,
                    name: `${adherent.first_name} ${adherent.last_name}`,
                    email: adherent.email
                }
            }
        });
    } catch (error) {
        console.error('Generate token error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

// GET /api/adherent-space/:token - Accéder à l'espace adhérent via token (public)
router.get('/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Vérifier le token
        const [tokens] = await pool.execute(
            `SELECT t.*, a.id as adherent_id, a.first_name, a.last_name, a.email, a.phone,
                    a.member_number, a.status, a.membership_start, a.membership_end,
                    a.association_id, assoc.name as association_name
             FROM adherent_tokens t
             JOIN adherents a ON t.adherent_id = a.id
             JOIN associations assoc ON a.association_id = assoc.id
             WHERE t.token = ? AND t.expires_at > NOW()`,
            [token]
        );

        if (tokens.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Lien invalide ou expiré'
            });
        }

        const tokenData = tokens[0];

        // Récupérer les cotisations de l'adhérent
        const [cotisations] = await pool.execute(
            `SELECT id, season, amount, amount_paid, payment_status, due_date, paid_date, notes
             FROM cotisations
             WHERE adherent_id = ? AND association_id = ?
             ORDER BY season DESC, created_at DESC`,
            [tokenData.adherent_id, tokenData.association_id]
        );

        // Calculer le solde
        let totalDue = 0;
        let totalPaid = 0;
        cotisations.forEach(c => {
            totalDue += parseFloat(c.amount) || 0;
            totalPaid += parseFloat(c.amount_paid) || 0;
        });

        // Marquer le token comme utilisé (optionnel, pour stats)
        await pool.execute(
            'UPDATE adherent_tokens SET used_at = NOW() WHERE id = ? AND used_at IS NULL',
            [tokenData.id]
        );

        res.json({
            success: true,
            data: {
                adherent: {
                    id: tokenData.adherent_id,
                    first_name: tokenData.first_name,
                    last_name: tokenData.last_name,
                    email: tokenData.email,
                    phone: tokenData.phone,
                    member_number: tokenData.member_number,
                    status: tokenData.status,
                    membership_start: tokenData.membership_start,
                    membership_end: tokenData.membership_end
                },
                association: {
                    id: tokenData.association_id,
                    name: tokenData.association_name
                },
                cotisations,
                summary: {
                    total_due: totalDue,
                    total_paid: totalPaid,
                    balance: totalDue - totalPaid
                },
                token_expires_at: tokenData.expires_at
            }
        });
    } catch (error) {
        console.error('Access adherent space error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

// POST /api/adherent-space/:token/payment-intent - Créer une intention de paiement Stripe (future)
router.post('/:token/payment-intent', async (req, res) => {
    // TODO: Intégration Stripe
    res.json({
        success: false,
        message: 'Paiement en ligne bientôt disponible'
    });
});

module.exports = router;
