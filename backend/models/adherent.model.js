const pool = require('../config/db');

class AdherentModel {
    static async findAll(associationId, filters = {}) {
        let query = 'SELECT * FROM adherents WHERE association_id = ?';
        const params = [associationId];

        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }

        if (filters.search) {
            query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR member_number LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY last_name, first_name';

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(parseInt(filters.limit));
            if (filters.offset) {
                query += ' OFFSET ?';
                params.push(parseInt(filters.offset));
            }
        }

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async findById(id, associationId) {
        const [rows] = await pool.execute(
            'SELECT * FROM adherents WHERE id = ? AND association_id = ?',
            [id, associationId]
        );
        return rows[0];
    }

    static async findByMemberNumber(memberNumber, associationId) {
        const [rows] = await pool.execute(
            'SELECT * FROM adherents WHERE member_number = ? AND association_id = ?',
            [memberNumber, associationId]
        );
        return rows[0];
    }

    static async create(associationId, data) {
        const memberNumber = await this.generateMemberNumber(associationId);

        const [result] = await pool.execute(
            `INSERT INTO adherents (
                association_id, member_number, first_name, last_name, email, phone,
                birth_date, address, city, postal_code, photo_url,
                emergency_contact_name, emergency_contact_phone,
                medical_notes, status, membership_start, membership_end, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                associationId,
                memberNumber,
                data.first_name,
                data.last_name,
                data.email || null,
                data.phone || null,
                data.birth_date || null,
                data.address || null,
                data.city || null,
                data.postal_code || null,
                data.photo_url || null,
                data.emergency_contact_name || null,
                data.emergency_contact_phone || null,
                data.medical_notes || null,
                data.status || 'actif',
                data.membership_start || new Date(),
                data.membership_end || null,
                data.notes || null
            ]
        );

        return { id: result.insertId, member_number: memberNumber };
    }

    static async update(id, associationId, data) {
        const fields = [];
        const values = [];

        const allowedFields = [
            'first_name', 'last_name', 'email', 'phone', 'birth_date',
            'address', 'city', 'postal_code', 'photo_url',
            'emergency_contact_name', 'emergency_contact_phone',
            'medical_notes', 'status', 'membership_start', 'membership_end', 'notes'
        ];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (fields.length === 0) {
            return false;
        }

        values.push(id, associationId);
        const [result] = await pool.execute(
            `UPDATE adherents SET ${fields.join(', ')} WHERE id = ? AND association_id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    static async delete(id, associationId) {
        const [result] = await pool.execute(
            'DELETE FROM adherents WHERE id = ? AND association_id = ?',
            [id, associationId]
        );
        return result.affectedRows > 0;
    }

    static async archive(id, associationId) {
        return this.update(id, associationId, { status: 'archive' });
    }

    static async count(associationId, filters = {}) {
        let query = 'SELECT COUNT(*) as total FROM adherents WHERE association_id = ?';
        const params = [associationId];

        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }

        const [rows] = await pool.execute(query, params);
        return rows[0].total;
    }

    static async getStats(associationId) {
        const [rows] = await pool.execute(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'actif' THEN 1 ELSE 0 END) as actifs,
                SUM(CASE WHEN status = 'inactif' THEN 1 ELSE 0 END) as inactifs,
                SUM(CASE WHEN status = 'suspendu' THEN 1 ELSE 0 END) as suspendus,
                SUM(CASE WHEN status = 'archive' THEN 1 ELSE 0 END) as archives
            FROM adherents
            WHERE association_id = ?
        `, [associationId]);
        return rows[0];
    }

    static async generateMemberNumber(associationId) {
        const year = new Date().getFullYear();
        const [rows] = await pool.execute(
            `SELECT COUNT(*) as count FROM adherents WHERE association_id = ? AND member_number LIKE ?`,
            [associationId, `ADH-${year}-%`]
        );
        const nextNumber = (rows[0].count + 1).toString().padStart(3, '0');
        return `ADH-${year}-${nextNumber}`;
    }

    static async getActivities(adherentId, associationId) {
        const [rows] = await pool.execute(
            'SELECT * FROM adherent_activities WHERE adherent_id = ? AND association_id = ? ORDER BY start_date DESC',
            [adherentId, associationId]
        );
        return rows;
    }

    static async addActivity(associationId, adherentId, data) {
        const [result] = await pool.execute(
            `INSERT INTO adherent_activities (association_id, adherent_id, activity_name, level, start_date, end_date, schedule, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                associationId,
                adherentId,
                data.activity_name,
                data.level || 'debutant',
                data.start_date || null,
                data.end_date || null,
                JSON.stringify(data.schedule) || null,
                data.notes || null
            ]
        );
        return result.insertId;
    }
}

module.exports = AdherentModel;
