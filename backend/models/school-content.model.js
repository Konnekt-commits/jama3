const pool = require('../config/db');

class SchoolContentModel {
    static async findAll(associationId, filters = {}) {
        let query = `
            SELECT sc_content.*,
                   sc.name as class_name,
                   sp.title as program_title
            FROM school_content sc_content
            LEFT JOIN school_classes sc ON sc_content.class_id = sc.id
            LEFT JOIN school_programs sp ON sc_content.program_id = sp.id
            WHERE sc_content.association_id = ?
        `;
        const params = [associationId];

        if (filters.class_id) {
            query += ' AND sc_content.class_id = ?';
            params.push(filters.class_id);
        }

        if (filters.program_id) {
            query += ' AND sc_content.program_id = ?';
            params.push(filters.program_id);
        }

        if (filters.content_type) {
            query += ' AND sc_content.content_type = ?';
            params.push(filters.content_type);
        }

        query += ' ORDER BY sc_content.created_at DESC';

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async findById(id, associationId) {
        const [rows] = await pool.execute(`
            SELECT * FROM school_content WHERE id = ? AND association_id = ?
        `, [id, associationId]);
        return rows[0];
    }

    static async create(associationId, data) {
        const [result] = await pool.execute(
            `INSERT INTO school_content (association_id, class_id, program_id, title, description, content_type, url, file_name, file_size, is_public, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                associationId,
                data.class_id || null,
                data.program_id || null,
                data.title,
                data.description || null,
                data.content_type || 'pdf',
                data.url || null,
                data.file_name || null,
                data.file_size || null,
                data.is_public || false,
                data.created_by || null
            ]
        );
        return { id: result.insertId };
    }

    static async delete(id, associationId) {
        const [result] = await pool.execute(
            'DELETE FROM school_content WHERE id = ? AND association_id = ?',
            [id, associationId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = SchoolContentModel;
