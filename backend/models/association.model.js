const pool = require('../config/db');

class AssociationModel {
    // Créer une nouvelle association
    static async create(associationData) {
        const {
            name,
            slug,
            description,
            logo_url,
            email,
            phone,
            address,
            city,
            postal_code,
            country,
            website,
            siret,
            rna_number,
            settings
        } = associationData;

        const [result] = await pool.execute(
            `INSERT INTO associations
            (name, slug, description, logo_url, email, phone, address, city, postal_code, country, website, siret, rna_number, settings)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, slug, description || null, logo_url || null, email || null, phone || null,
             address || null, city || null, postal_code || null, country || 'France',
             website || null, siret || null, rna_number || null, JSON.stringify(settings || {})]
        );

        return result.insertId;
    }

    // Récupérer une association par ID
    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM associations WHERE id = ?',
            [id]
        );
        if (rows.length > 0 && rows[0].settings && typeof rows[0].settings === 'string') {
            try {
                rows[0].settings = JSON.parse(rows[0].settings);
            } catch (e) {
                rows[0].settings = {};
            }
        }
        return rows[0] || null;
    }

    // Récupérer une association par slug
    static async findBySlug(slug) {
        const [rows] = await pool.execute(
            'SELECT * FROM associations WHERE slug = ?',
            [slug]
        );
        if (rows.length > 0 && rows[0].settings && typeof rows[0].settings === 'string') {
            try {
                rows[0].settings = JSON.parse(rows[0].settings);
            } catch (e) {
                rows[0].settings = {};
            }
        }
        return rows[0] || null;
    }

    // Vérifier si un slug existe
    static async slugExists(slug) {
        const [rows] = await pool.execute(
            'SELECT id FROM associations WHERE slug = ?',
            [slug]
        );
        return rows.length > 0;
    }

    // Mettre à jour une association
    static async update(id, associationData) {
        const fields = [];
        const values = [];

        const allowedFields = [
            'name', 'description', 'logo_url', 'email', 'phone',
            'address', 'city', 'postal_code', 'country', 'website',
            'siret', 'rna_number', 'settings', 'subscription_plan',
            'subscription_expires_at', 'is_active'
        ];

        for (const [key, value] of Object.entries(associationData)) {
            if (allowedFields.includes(key)) {
                fields.push(`${key} = ?`);
                values.push(key === 'settings' ? JSON.stringify(value) : value);
            }
        }

        if (fields.length === 0) return false;

        values.push(id);

        const [result] = await pool.execute(
            `UPDATE associations SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    // Supprimer une association (soft delete via is_active)
    static async deactivate(id) {
        const [result] = await pool.execute(
            'UPDATE associations SET is_active = FALSE WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Statistiques de l'association
    static async getStats(associationId) {
        const [adherents] = await pool.execute(
            `SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'actif' THEN 1 ELSE 0 END) as actifs
            FROM adherents WHERE association_id = ?`,
            [associationId]
        );

        const [cotisations] = await pool.execute(
            `SELECT
                COALESCE(SUM(amount), 0) as total_expected,
                COALESCE(SUM(amount_paid), 0) as total_paid
            FROM cotisations WHERE association_id = ?`,
            [associationId]
        );

        const [events] = await pool.execute(
            `SELECT COUNT(*) as total
            FROM events
            WHERE association_id = ? AND start_datetime >= CURDATE()`,
            [associationId]
        );

        const [users] = await pool.execute(
            `SELECT COUNT(*) as total
            FROM users WHERE association_id = ? AND is_active = TRUE`,
            [associationId]
        );

        return {
            adherents: {
                total: adherents[0].total,
                actifs: adherents[0].actifs
            },
            cotisations: {
                total_expected: parseFloat(cotisations[0].total_expected),
                total_paid: parseFloat(cotisations[0].total_paid),
                collection_rate: cotisations[0].total_expected > 0
                    ? Math.round((cotisations[0].total_paid / cotisations[0].total_expected) * 100)
                    : 0
            },
            events_upcoming: events[0].total,
            users: users[0].total
        };
    }

    // Générer un slug unique
    static async generateUniqueSlug(name) {
        let baseSlug = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        let slug = baseSlug;
        let counter = 1;

        while (await this.slugExists(slug)) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        return slug;
    }
}

module.exports = AssociationModel;
