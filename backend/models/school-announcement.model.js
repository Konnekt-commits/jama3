const pool = require('../config/db');

class SchoolAnnouncementModel {
    static async findAll(associationId, filters = {}) {
        let query = `
            SELECT sa.*,
                   CONCAT(u.first_name, ' ', u.last_name) as created_by_name
            FROM school_announcements sa
            LEFT JOIN users u ON sa.created_by = u.id
            WHERE sa.association_id = ?
        `;
        const params = [associationId];

        if (filters.class_id) {
            // Support both old class_id field and new class_ids JSON array
            query += ' AND (sa.class_id = ? OR sa.class_id IS NULL OR JSON_CONTAINS(sa.class_ids, CAST(? AS JSON)))';
            params.push(filters.class_id, filters.class_id);
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

        // Parse class_ids JSON and fetch class names
        for (const row of rows) {
            if (row.class_ids) {
                try {
                    row.class_ids = typeof row.class_ids === 'string' ? JSON.parse(row.class_ids) : row.class_ids;
                } catch (e) {
                    row.class_ids = [];
                }
            } else {
                row.class_ids = [];
            }
        }

        return rows;
    }

    static async findAllWithClassNames(associationId, filters = {}) {
        const rows = await this.findAll(associationId, filters);

        // Get all class IDs
        const allClassIds = new Set();
        rows.forEach(row => {
            if (row.class_ids && Array.isArray(row.class_ids)) {
                row.class_ids.forEach(id => allClassIds.add(id));
            }
            if (row.class_id) allClassIds.add(row.class_id);
        });

        if (allClassIds.size > 0) {
            const [classes] = await pool.execute(
                `SELECT id, name FROM school_classes WHERE id IN (${[...allClassIds].map(() => '?').join(',')})`,
                [...allClassIds]
            );
            const classMap = {};
            classes.forEach(c => classMap[c.id] = c.name);

            // Add class names to each row
            rows.forEach(row => {
                row.class_names = [];
                if (row.class_ids && Array.isArray(row.class_ids)) {
                    row.class_names = row.class_ids.map(id => classMap[id]).filter(Boolean);
                } else if (row.class_id && classMap[row.class_id]) {
                    row.class_names = [classMap[row.class_id]];
                }
            });
        }

        return rows;
    }

    static async findById(id, associationId) {
        const [rows] = await pool.execute(`
            SELECT * FROM school_announcements WHERE id = ? AND association_id = ?
        `, [id, associationId]);

        if (rows[0]) {
            // Parse class_ids JSON
            if (rows[0].class_ids) {
                try {
                    rows[0].class_ids = typeof rows[0].class_ids === 'string' ? JSON.parse(rows[0].class_ids) : rows[0].class_ids;
                } catch (e) {
                    rows[0].class_ids = [];
                }
            } else {
                rows[0].class_ids = [];
            }
        }

        return rows[0];
    }

    static async create(associationId, data) {
        // Handle class_ids as JSON array
        let classIds = null;
        if (data.class_ids && Array.isArray(data.class_ids) && data.class_ids.length > 0) {
            classIds = JSON.stringify(data.class_ids.map(id => parseInt(id)));
        }

        const [result] = await pool.execute(
            `INSERT INTO school_announcements (association_id, class_id, class_ids, title, content, priority, target_audience, published_at, expires_at, is_published, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                associationId,
                data.class_id || null,
                classIds,
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

        // Handle class_ids as JSON array
        if (data.class_ids !== undefined) {
            fields.push('class_ids = ?');
            if (Array.isArray(data.class_ids) && data.class_ids.length > 0) {
                values.push(JSON.stringify(data.class_ids.map(id => parseInt(id))));
            } else {
                values.push(null);
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
