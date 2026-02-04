const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth.middleware');

// Middleware superadmin
const superadminMiddleware = (req, res, next) => {
    if (req.user.role !== 'super_admin') {
        return res.status(403).json({
            success: false,
            message: 'Accès réservé aux super administrateurs'
        });
    }
    next();
};

// GET /api/superadmin/stats - Statistiques globales
router.get('/stats', authMiddleware, superadminMiddleware, async (req, res) => {
    try {
        const [associations] = await pool.execute('SELECT COUNT(*) as count FROM associations');
        const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
        const [adherents] = await pool.execute('SELECT COUNT(*) as count FROM adherents');
        const [cotisations] = await pool.execute('SELECT COUNT(*) as count FROM cotisations');

        res.json({
            success: true,
            data: {
                associations: associations[0].count,
                users: users[0].count,
                adherents: adherents[0].count,
                cotisations: cotisations[0].count
            }
        });
    } catch (error) {
        console.error('Superadmin stats error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// GET /api/superadmin/associations - Liste toutes les associations
router.get('/associations', authMiddleware, superadminMiddleware, async (req, res) => {
    try {
        const [associations] = await pool.execute(`
            SELECT
                a.*,
                (SELECT COUNT(*) FROM users WHERE association_id = a.id) as users_count,
                (SELECT COUNT(*) FROM adherents WHERE association_id = a.id) as adherents_count,
                (SELECT COUNT(*) FROM cotisations WHERE association_id = a.id) as cotisations_count,
                (SELECT SUM(amount_paid) FROM cotisations WHERE association_id = a.id) as total_collected
            FROM associations a
            ORDER BY a.created_at DESC
        `);

        res.json({
            success: true,
            data: associations
        });
    } catch (error) {
        console.error('Superadmin associations error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// GET /api/superadmin/associations/:id - Détails d'une association
router.get('/associations/:id', authMiddleware, superadminMiddleware, async (req, res) => {
    try {
        const [associations] = await pool.execute('SELECT * FROM associations WHERE id = ?', [req.params.id]);

        if (associations.length === 0) {
            return res.status(404).json({ success: false, message: 'Association non trouvée' });
        }

        const [users] = await pool.execute(
            'SELECT id, email, role, first_name, last_name, is_active, is_owner, last_login, created_at FROM users WHERE association_id = ?',
            [req.params.id]
        );

        res.json({
            success: true,
            data: {
                association: associations[0],
                users
            }
        });
    } catch (error) {
        console.error('Superadmin association detail error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// GET /api/superadmin/associations/:id/adherents - Liste les adhérents d'une association
router.get('/associations/:id/adherents', authMiddleware, superadminMiddleware, async (req, res) => {
    try {
        const [adherents] = await pool.execute(`
            SELECT
                a.*,
                (SELECT SUM(amount_paid) FROM cotisations WHERE adherent_id = a.id) as total_paid,
                (SELECT COUNT(*) FROM cotisations WHERE adherent_id = a.id AND payment_status = 'paid') as paid_count,
                (SELECT COUNT(*) FROM cotisations WHERE adherent_id = a.id AND payment_status IN ('pending', 'overdue')) as unpaid_count
            FROM adherents a
            WHERE a.association_id = ?
            ORDER BY a.created_at DESC
        `, [req.params.id]);

        res.json({
            success: true,
            data: adherents
        });
    } catch (error) {
        console.error('Superadmin adherents error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// PUT /api/superadmin/associations/:id - Mettre à jour une association
router.put('/associations/:id', authMiddleware, superadminMiddleware, async (req, res) => {
    try {
        const allowedFields = [
            'name', 'slug', 'description', 'logo_url', 'email', 'phone',
            'address', 'city', 'postal_code', 'country', 'website',
            'siret', 'rna_number', 'subscription_plan', 'subscription_expires_at', 'is_active'
        ];

        const fields = [];
        const values = [];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(req.body[field]);
            }
        }

        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: 'Aucun champ à mettre à jour' });
        }

        values.push(req.params.id);

        const [result] = await pool.execute(
            `UPDATE associations SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Association non trouvée' });
        }

        // Récupérer l'association mise à jour
        const [updated] = await pool.execute('SELECT * FROM associations WHERE id = ?', [req.params.id]);

        res.json({ success: true, message: 'Association mise à jour', data: updated[0] });
    } catch (error) {
        console.error('Superadmin update association error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// PUT /api/superadmin/associations/:id/toggle - Activer/désactiver une association
router.put('/associations/:id/toggle', authMiddleware, superadminMiddleware, async (req, res) => {
    try {
        const [result] = await pool.execute(
            'UPDATE associations SET is_active = NOT is_active WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Association non trouvée' });
        }

        res.json({ success: true, message: 'Statut mis à jour' });
    } catch (error) {
        console.error('Superadmin toggle error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

module.exports = router;
