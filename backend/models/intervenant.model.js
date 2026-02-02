const { pool } = require('../config/db');

class IntervenantModel {
    static async findAll(filters = {}) {
        let query = 'SELECT * FROM intervenants WHERE 1=1';
        const params = [];

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

        query += ' ORDER BY last_name, first_name';

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM intervenants WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByUserId(userId) {
        const [rows] = await pool.execute(
            'SELECT * FROM intervenants WHERE user_id = ?',
            [userId]
        );
        return rows[0];
    }

    static async create(data) {
        const [result] = await pool.execute(
            `INSERT INTO intervenants (
                user_id, first_name, last_name, email, phone,
                speciality, bio, photo_url, hourly_rate, contract_type,
                status, availability
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
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

    static async update(id, data) {
        const fields = [];
        const values = [];

        const allowedFields = [
            'first_name', 'last_name', 'email', 'phone', 'speciality',
            'bio', 'photo_url', 'hourly_rate', 'contract_type', 'status'
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

        values.push(id);
        const [result] = await pool.execute(
            `UPDATE intervenants SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM intervenants WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    static async getEvents(intervenantId, filters = {}) {
        let query = `
            SELECT * FROM events
            WHERE intervenant_id = ?
        `;
        const params = [intervenantId];

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

    static async getStats(intervenantId) {
        const [rows] = await pool.execute(`
            SELECT
                COUNT(*) as total_events,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_events,
                SUM(current_participants) as total_participants
            FROM events
            WHERE intervenant_id = ?
        `, [intervenantId]);
        return rows[0];
    }

    static async count(filters = {}) {
        let query = 'SELECT COUNT(*) as total FROM intervenants WHERE 1=1';
        const params = [];

        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }

        const [rows] = await pool.execute(query, params);
        return rows[0].total;
    }
}

module.exports = IntervenantModel;
