const { pool } = require('../config/db');

class AdherentModel {
    static async findAll(filters = {}) {
        let query = 'SELECT * FROM adherents WHERE 1=1';
        const params = [];

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

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM adherents WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByMemberNumber(memberNumber) {
        const [rows] = await pool.execute(
            'SELECT * FROM adherents WHERE member_number = ?',
            [memberNumber]
        );
        return rows[0];
    }

    static async create(data) {
        const memberNumber = await this.generateMemberNumber();

        const [result] = await pool.execute(
            `INSERT INTO adherents (
                member_number, first_name, last_name, email, phone,
                birth_date, address, city, postal_code, photo_url,
                emergency_contact_name, emergency_contact_phone,
                medical_notes, status, membership_start, membership_end, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
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

    static async update(id, data) {
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

        values.push(id);
        const [result] = await pool.execute(
            `UPDATE adherents SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM adherents WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    static async archive(id) {
        return this.update(id, { status: 'archive' });
    }

    static async count(filters = {}) {
        let query = 'SELECT COUNT(*) as total FROM adherents WHERE 1=1';
        const params = [];

        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }

        const [rows] = await pool.execute(query, params);
        return rows[0].total;
    }

    static async getStats() {
        const [rows] = await pool.execute(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'actif' THEN 1 ELSE 0 END) as actifs,
                SUM(CASE WHEN status = 'inactif' THEN 1 ELSE 0 END) as inactifs,
                SUM(CASE WHEN status = 'suspendu' THEN 1 ELSE 0 END) as suspendus,
                SUM(CASE WHEN status = 'archive' THEN 1 ELSE 0 END) as archives
            FROM adherents
        `);
        return rows[0];
    }

    static async generateMemberNumber() {
        const year = new Date().getFullYear();
        const [rows] = await pool.execute(
            `SELECT COUNT(*) as count FROM adherents WHERE member_number LIKE ?`,
            [`ADH-${year}-%`]
        );
        const nextNumber = (rows[0].count + 1).toString().padStart(3, '0');
        return `ADH-${year}-${nextNumber}`;
    }

    static async getActivities(adherentId) {
        const [rows] = await pool.execute(
            'SELECT * FROM adherent_activities WHERE adherent_id = ? ORDER BY start_date DESC',
            [adherentId]
        );
        return rows;
    }

    static async addActivity(adherentId, data) {
        const [result] = await pool.execute(
            `INSERT INTO adherent_activities (adherent_id, activity_name, level, start_date, end_date, schedule, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
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
