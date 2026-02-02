const { pool } = require('../config/db');

class MessageModel {
    static async findAll(filters = {}) {
        let query = `
            SELECT m.*,
                   u.first_name as sender_first_name,
                   u.last_name as sender_last_name
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE 1=1
        `;
        const params = [];

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

        query += ' ORDER BY m.sent_at DESC';

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
            `SELECT m.*,
                    u.first_name as sender_first_name,
                    u.last_name as sender_last_name
             FROM messages m
             JOIN users u ON m.sender_id = u.id
             WHERE m.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async findByRecipient(recipientType, recipientId, unreadOnly = false) {
        let query = `
            SELECT m.*,
                   u.first_name as sender_first_name,
                   u.last_name as sender_last_name
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE (m.recipient_type = ? AND m.recipient_id = ?)
               OR m.recipient_type = 'all'
        `;
        const params = [recipientType, recipientId];

        if (unreadOnly) {
            query += ' AND m.is_read = FALSE';
        }

        query += ' ORDER BY m.sent_at DESC';

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async create(data) {
        const [result] = await pool.execute(
            `INSERT INTO messages (
                sender_id, recipient_type, recipient_id, subject,
                content, message_type, channel
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
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

    static async markAsRead(id) {
        const [result] = await pool.execute(
            `UPDATE messages SET is_read = TRUE, read_at = NOW() WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }

    static async markAllAsRead(recipientType, recipientId) {
        const [result] = await pool.execute(
            `UPDATE messages
             SET is_read = TRUE, read_at = NOW()
             WHERE recipient_type = ? AND recipient_id = ? AND is_read = FALSE`,
            [recipientType, recipientId]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM messages WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    static async getUnreadCount(recipientType, recipientId) {
        const [rows] = await pool.execute(
            `SELECT COUNT(*) as count FROM messages
             WHERE ((recipient_type = ? AND recipient_id = ?) OR recipient_type = 'all')
             AND is_read = FALSE`,
            [recipientType, recipientId]
        );
        return rows[0].count;
    }

    static async sendToGroup(senderId, groupType, data) {
        let recipients = [];

        switch (groupType) {
            case 'all_adherents':
                const [adherents] = await pool.execute('SELECT id FROM adherents WHERE status = "actif"');
                recipients = adherents.map(a => ({ type: 'adherent', id: a.id }));
                break;
            case 'all_intervenants':
                const [intervenants] = await pool.execute('SELECT id FROM intervenants WHERE status = "actif"');
                recipients = intervenants.map(i => ({ type: 'intervenant', id: i.id }));
                break;
            case 'all':
                return this.create({
                    sender_id: senderId,
                    recipient_type: 'all',
                    ...data
                });
        }

        const results = [];
        for (const recipient of recipients) {
            const id = await this.create({
                sender_id: senderId,
                recipient_type: recipient.type,
                recipient_id: recipient.id,
                ...data
            });
            results.push(id);
        }

        return results;
    }

    static async getStats() {
        const [rows] = await pool.execute(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as unread,
                SUM(CASE WHEN message_type = 'alert' THEN 1 ELSE 0 END) as alerts,
                SUM(CASE WHEN message_type = 'reminder' THEN 1 ELSE 0 END) as reminders
            FROM messages
        `);
        return rows[0];
    }
}

module.exports = MessageModel;
