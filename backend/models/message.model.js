const pool = require('../config/db');

class MessageModel {
    static async findAll(associationId, filters = {}) {
        let query = `
            SELECT m.*,
                   u.first_name as sender_first_name,
                   u.last_name as sender_last_name
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.association_id = ?
        `;
        const params = [associationId];

        if (filters.recipient_type) {
            query += ' AND m.recipient_type = ?';
            params.push(filters.recipient_type);
        }

        if (filters.recipient_id) {
            query += ' AND m.recipient_id = ?';
            params.push(filters.recipient_id);
        }

        if (filters.is_read !== undefined) {
            query += ' AND m.is_read = ?';
            params.push(filters.is_read);
        }

        if (filters.message_type) {
            query += ' AND m.message_type = ?';
            params.push(filters.message_type);
        }

        query += ' ORDER BY m.id DESC';

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
            `SELECT m.*,
                    u.first_name as sender_first_name,
                    u.last_name as sender_last_name
             FROM messages m
             JOIN users u ON m.sender_id = u.id
             WHERE m.id = ? AND m.association_id = ?`,
            [id, associationId]
        );
        return rows[0];
    }

    static async findByRecipient(associationId, recipientType, recipientId, unreadOnly = false) {
        let query = `
            SELECT m.*,
                   u.first_name as sender_first_name,
                   u.last_name as sender_last_name
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.association_id = ?
              AND ((m.recipient_type = ? AND m.recipient_id = ?)
                   OR m.recipient_type = 'all')
        `;
        const params = [associationId, recipientType, recipientId];

        if (unreadOnly) {
            query += ' AND m.is_read = FALSE';
        }

        query += ' ORDER BY m.id DESC';

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async create(associationId, data) {
        const [result] = await pool.execute(
            `INSERT INTO messages (
                association_id, sender_id, recipient_type, recipient_id, subject,
                content, message_type, channel
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                associationId,
                data.sender_id,
                data.recipient_type,
                data.recipient_id || null,
                data.subject || null,
                data.content,
                data.message_type || 'info',
                data.channel || 'app'
            ]
        );

        return result.insertId;
    }

    static async markAsRead(id, associationId) {
        const [result] = await pool.execute(
            `UPDATE messages SET is_read = TRUE, read_at = NOW() WHERE id = ? AND association_id = ?`,
            [id, associationId]
        );
        return result.affectedRows > 0;
    }

    static async markAllAsRead(associationId, recipientType, recipientId) {
        const [result] = await pool.execute(
            `UPDATE messages
             SET is_read = TRUE, read_at = NOW()
             WHERE association_id = ? AND recipient_type = ? AND recipient_id = ? AND is_read = FALSE`,
            [associationId, recipientType, recipientId]
        );
        return result.affectedRows;
    }

    static async delete(id, associationId) {
        const [result] = await pool.execute(
            'DELETE FROM messages WHERE id = ? AND association_id = ?',
            [id, associationId]
        );
        return result.affectedRows > 0;
    }

    static async getUnreadCount(associationId, recipientType, recipientId) {
        const [rows] = await pool.execute(
            `SELECT COUNT(*) as count FROM messages
             WHERE association_id = ?
             AND ((recipient_type = ? AND recipient_id = ?) OR recipient_type = 'all')
             AND is_read = FALSE`,
            [associationId, recipientType, recipientId]
        );
        return rows[0].count;
    }

    static async sendToGroup(associationId, senderId, groupType, data) {
        let recipients = [];

        switch (groupType) {
            case 'all_adherents':
                const [adherents] = await pool.execute(
                    'SELECT id FROM adherents WHERE association_id = ? AND status = "actif"',
                    [associationId]
                );
                recipients = adherents.map(a => ({ type: 'adherent', id: a.id }));
                break;
            case 'all_intervenants':
                const [intervenants] = await pool.execute(
                    'SELECT id FROM intervenants WHERE association_id = ? AND status = "actif"',
                    [associationId]
                );
                recipients = intervenants.map(i => ({ type: 'intervenant', id: i.id }));
                break;
            case 'all':
                return this.create(associationId, {
                    sender_id: senderId,
                    recipient_type: 'all',
                    ...data
                });
        }

        const results = [];
        for (const recipient of recipients) {
            const id = await this.create(associationId, {
                sender_id: senderId,
                recipient_type: recipient.type,
                recipient_id: recipient.id,
                ...data
            });
            results.push(id);
        }

        return results;
    }

    static async getStats(associationId) {
        const [rows] = await pool.execute(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as unread,
                SUM(CASE WHEN message_type = 'alert' THEN 1 ELSE 0 END) as alerts,
                SUM(CASE WHEN message_type = 'reminder' THEN 1 ELSE 0 END) as reminders
            FROM messages
            WHERE association_id = ?
        `, [associationId]);
        return rows[0];
    }
}

module.exports = MessageModel;
