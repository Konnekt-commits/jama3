const pool = require('../config/db');

class SchoolProgramModel {
    static async findAll(associationId, filters = {}) {
        let query = `
            SELECT sp.*,
                   sc.name as class_name, sc.subject,
                   CONCAT(u.first_name, ' ', u.last_name) as created_by_name
            FROM school_programs sp
            JOIN school_classes sc ON sp.class_id = sc.id
            LEFT JOIN users u ON sp.created_by = u.id
            WHERE sp.association_id = ?
        `;
        const params = [associationId];

        if (filters.class_id) {
            query += ' AND sp.class_id = ?';
            params.push(filters.class_id);
        }

        if (filters.status) {
            query += ' AND sp.status = ?';
            params.push(filters.status);
        }

        query += ' ORDER BY sp.start_date DESC, sp.created_at DESC';

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async findById(id, associationId) {
        const [rows] = await pool.execute(`
            SELECT sp.*,
                   sc.name as class_name, sc.subject
            FROM school_programs sp
            JOIN school_classes sc ON sp.class_id = sc.id
            WHERE sp.id = ? AND sp.association_id = ?
        `, [id, associationId]);
        return rows[0];
    }

    static async create(associationId, data) {
        const [result] = await pool.execute(
            `INSERT INTO school_programs (association_id, class_id, title, description, period, objectives, start_date, end_date, status, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                associationId,
                data.class_id,
                data.title,
                data.description || null,
                data.period || null,
                data.objectives ? JSON.stringify(data.objectives) : null,
                data.start_date || null,
                data.end_date || null,
                data.status || 'draft',
                data.created_by || null
            ]
        );
        return { id: result.insertId };
    }

    static async update(id, associationId, data) {
        const fields = [];
        const values = [];

        const allowedFields = ['class_id', 'title', 'description', 'period', 'objectives', 'start_date', 'end_date', 'status'];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(field === 'objectives' ? JSON.stringify(data[field]) : data[field]);
            }
        }

        if (fields.length === 0) return false;

        values.push(id, associationId);
        const [result] = await pool.execute(
            `UPDATE school_programs SET ${fields.join(', ')} WHERE id = ? AND association_id = ?`,
            values
        );
        return result.affectedRows > 0;
    }

    static async delete(id, associationId) {
        const [result] = await pool.execute(
            'DELETE FROM school_programs WHERE id = ? AND association_id = ?',
            [id, associationId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = SchoolProgramModel;
