const pool = require('../config/db');

class IntervenantModel {
    static async findAll(associationId, filters = {}) {
        let query = 'SELECT * FROM intervenants WHERE association_id = ?';
        const params = [associationId];

        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }

        if (filters.contract_type) {
            query += ' AND contract_type = ?';
            params.push(filters.contract_type);
        }

        if (filters.search) {
            query += ' AND (first_name LIKE ? OR last_name LIKE ? OR speciality LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (filters.is_teacher !== undefined) {
            query += ' AND is_teacher = ?';
            params.push(filters.is_teacher ? 1 : 0);
        }

        query += ' ORDER BY last_name, first_name';

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async findById(id, associationId) {
        const [rows] = await pool.execute(
            'SELECT * FROM intervenants WHERE id = ? AND association_id = ?',
            [id, associationId]
        );
        return rows[0];
    }

    static async findByUserId(userId, associationId) {
        const [rows] = await pool.execute(
            'SELECT * FROM intervenants WHERE user_id = ? AND association_id = ?',
            [userId, associationId]
        );
        return rows[0];
    }

    static async create(associationId, data) {
        const [result] = await pool.execute(
            `INSERT INTO intervenants (
                association_id, user_id, first_name, last_name, email, phone,
                speciality, bio, photo_url, hourly_rate, contract_type,
                status, availability
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                associationId,
                data.user_id || null,
                data.first_name,
                data.last_name,
                data.email || null,
                data.phone || null,
                data.speciality || null,
                data.bio || null,
                data.photo_url || null,
                data.hourly_rate || null,
                data.contract_type || 'benevole',
                data.status || 'actif',
                JSON.stringify(data.availability) || null
            ]
        );

        return result.insertId;
    }

    static async update(id, associationId, data) {
        const fields = [];
        const values = [];

        const allowedFields = [
            'first_name', 'last_name', 'email', 'phone', 'speciality',
            'bio', 'photo_url', 'hourly_rate', 'contract_type', 'status', 'is_teacher'
        ];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (data.availability !== undefined) {
            fields.push('availability = ?');
            values.push(JSON.stringify(data.availability));
        }

        if (fields.length === 0) {
            return false;
        }

        values.push(id, associationId);
        const [result] = await pool.execute(
            `UPDATE intervenants SET ${fields.join(', ')} WHERE id = ? AND association_id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    static async delete(id, associationId) {
        const [result] = await pool.execute(
            'DELETE FROM intervenants WHERE id = ? AND association_id = ?',
            [id, associationId]
        );
        return result.affectedRows > 0;
    }

    static async getEvents(intervenantId, associationId, filters = {}) {
        let query = `
            SELECT * FROM events
            WHERE intervenant_id = ? AND association_id = ?
        `;
        const params = [intervenantId, associationId];

        if (filters.upcoming) {
            query += ' AND start_datetime >= NOW()';
        }

        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }

        query += ' ORDER BY start_datetime ASC';

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async getStats(intervenantId, associationId) {
        const [rows] = await pool.execute(`
            SELECT
                COUNT(*) as total_events,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_events,
                SUM(current_participants) as total_participants
            FROM events
            WHERE intervenant_id = ? AND association_id = ?
        `, [intervenantId, associationId]);
        return rows[0];
    }

    static async count(associationId, filters = {}) {
        let query = 'SELECT COUNT(*) as total FROM intervenants WHERE association_id = ?';
        const params = [associationId];

        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }

        const [rows] = await pool.execute(query, params);
        return rows[0].total;
    }
}

module.exports = IntervenantModel;
