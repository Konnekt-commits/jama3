const pool = require('../config/db');

class SchoolMessageModel {
    static async findAll(associationId, filters = {}) {
        let query = `
            SELECT sm.*,
                   s.first_name as student_first_name, s.last_name as student_last_name
            FROM school_messages sm
            LEFT JOIN students s ON sm.student_id = s.id
            WHERE sm.association_id = ?
        `;
        const params = [associationId];

        if (filters.student_id) {
            query += ' AND sm.student_id = ?';
            params.push(filters.student_id);
        }

        if (filters.sender_type && filters.sender_id) {
            query += ' AND sm.sender_type = ? AND sm.sender_id = ?';
            params.push(filters.sender_type, filters.sender_id);
        }

        if (filters.recipient_type && filters.recipient_id) {
            query += ' AND sm.recipient_type = ? AND sm.recipient_id = ?';
            params.push(filters.recipient_type, filters.recipient_id);
        }

        if (filters.unread_only) {
            query += ' AND sm.is_read = FALSE';
        }

        query += ' ORDER BY sm.created_at DESC';

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(parseInt(filters.limit));
        }

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async findById(id, associationId) {
        const [rows] = await pool.execute(`
            SELECT * FROM school_messages WHERE id = ? AND association_id = ?
        `, [id, associationId]);
        return rows[0];
    }

    static async create(associationId, data) {
        const [result] = await pool.execute(
            `INSERT INTO school_messages (association_id, sender_type, sender_id, recipient_type, recipient_id, student_id, subject, content, parent_message_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                associationId,
                data.sender_type,
                data.sender_id,
                data.recipient_type,
                data.recipient_id,
                data.student_id || null,
                data.subject || null,
                data.content,
                data.parent_message_id || null
            ]
        );
        return { id: result.insertId };
    }

    static async markAsRead(id, associationId) {
        const [result] = await pool.execute(
            `UPDATE school_messages SET is_read = TRUE, read_at = NOW() WHERE id = ? AND association_id = ?`,
            [id, associationId]
        );
        return result.affectedRows > 0;
    }

    static async getConversation(studentId, associationId) {
        const [rows] = await pool.execute(`
            SELECT * FROM school_messages
            WHERE association_id = ? AND student_id = ?
            ORDER BY created_at ASC
        `, [associationId, studentId]);
        return rows;
    }

    static async getUnreadCount(recipientType, recipientId, associationId) {
        const [rows] = await pool.execute(`
            SELECT COUNT(*) as count FROM school_messages
            WHERE association_id = ? AND recipient_type = ? AND recipient_id = ? AND is_read = FALSE
        `, [associationId, recipientType, recipientId]);
        return rows[0].count;
    }
}

module.exports = SchoolMessageModel;
