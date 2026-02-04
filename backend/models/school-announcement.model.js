const pool = require('../config/db');

class SchoolAnnouncementModel {
    static async findAll(associationId, filters = {}) {
        let query = `
            SELECT sa.*,
                   sc.name as class_name,
                   CONCAT(u.first_name, ' ', u.last_name) as created_by_name
            FROM school_announcements sa
            LEFT JOIN school_classes sc ON sa.class_id = sc.id
            LEFT JOIN users u ON sa.created_by = u.id
            WHERE sa.association_id = ?
        `;
        const params = [associationId];

        if (filters.class_id) {
            query += ' AND (sa.class_id = ? OR sa.class_id IS NULL)';
            params.push(filters.class_id);
        }

        if (filters.is_published !== undefined) {
            query += ' AND sa.is_published = ?';
            params.push(filters.is_published);
        }

        if (filters.target_audience) {
            query += ' AND (sa.target_audience = ? OR sa.target_audience = "all")';
            params.push(filters.target_audience);
        }

        if (filters.active_only) {
            query += ' AND sa.is_published = TRUE AND (sa.expires_at IS NULL OR sa.expires_at > NOW())';
        }

        query += ' ORDER BY sa.priority DESC, sa.published_at DESC, sa.created_at DESC';

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(parseInt(filters.limit));
        }

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async findById(id, associationId) {
        const [rows] = await pool.execute(`
            SELECT * FROM school_announcements WHERE id = ? AND association_id = ?
        `, [id, associationId]);
        return rows[0];
    }

    static async create(associationId, data) {
        const [result] = await pool.execute(
            `INSERT INTO school_announcements (association_id, class_id, title, content, priority, target_audience, published_at, expires_at, is_published, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                associationId,
                data.class_id || null,
                data.title,
                data.content,
                data.priority || 'normal',
                data.target_audience || 'all',
                data.is_published ? new Date() : null,
                data.expires_at || null,
                data.is_published || false,
                data.created_by || null
            ]
        );
        return { id: result.insertId };
    }

    static async update(id, associationId, data) {
        const fields = [];
        const values = [];

        const allowedFields = ['class_id', 'title', 'content', 'priority', 'target_audience', 'expires_at', 'is_published'];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        // Handle publishing
        if (data.is_published === true) {
            fields.push('published_at = NOW()');
        }

        if (fields.length === 0) return false;

        values.push(id, associationId);
        const [result] = await pool.execute(
            `UPDATE school_announcements SET ${fields.join(', ')} WHERE id = ? AND association_id = ?`,
            values
        );
        return result.affectedRows > 0;
    }

    static async delete(id, associationId) {
        const [result] = await pool.execute(
            'DELETE FROM school_announcements WHERE id = ? AND association_id = ?',
            [id, associationId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = SchoolAnnouncementModel;
