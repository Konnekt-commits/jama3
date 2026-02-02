const { pool } = require('../config/db');

class EventModel {
    static async findAll(filters = {}) {
        let query = `
            SELECT e.*,
                   i.first_name as intervenant_first_name,
                   i.last_name as intervenant_last_name
            FROM events e
            LEFT JOIN intervenants i ON e.intervenant_id = i.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.status) {
            query += ' AND e.status = ?';
            params.push(filters.status);
        }

        if (filters.event_type) {
            query += ' AND e.event_type = ?';
            params.push(filters.event_type);
        }

        if (filters.intervenant_id) {
            query += ' AND e.intervenant_id = ?';
            params.push(filters.intervenant_id);
        }

        if (filters.start_date) {
            query += ' AND DATE(e.start_datetime) >= ?';
            params.push(filters.start_date);
        }

        if (filters.end_date) {
            query += ' AND DATE(e.end_datetime) <= ?';
            params.push(filters.end_date);
        }

        if (filters.upcoming) {
            query += ' AND e.start_datetime >= NOW()';
        }

        query += ' ORDER BY e.start_datetime ASC';

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
            `SELECT e.*,
                    i.first_name as intervenant_first_name,
                    i.last_name as intervenant_last_name
             FROM events e
             LEFT JOIN intervenants i ON e.intervenant_id = i.id
             WHERE e.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async create(data) {
        const [result] = await pool.execute(
            `INSERT INTO events (
                title, description, event_type, start_datetime, end_datetime,
                location, max_participants, intervenant_id, is_recurring,
                recurrence_rule, color, status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.title,
                data.description || null,
                data.event_type || 'cours',
                data.start_datetime,
                data.end_datetime,
                data.location || null,
                data.max_participants || null,
                data.intervenant_id || null,
                data.is_recurring || false,
                data.recurrence_rule || null,
                data.color || '#3B82F6',
                data.status || 'scheduled',
                data.notes || null
            ]
        );

        return result.insertId;
    }

    static async update(id, data) {
        const fields = [];
        const values = [];

        const allowedFields = [
            'title', 'description', 'event_type', 'start_datetime', 'end_datetime',
            'location', 'max_participants', 'intervenant_id', 'is_recurring',
            'recurrence_rule', 'color', 'status', 'notes'
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
            `UPDATE events SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM events WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    static async cancel(id) {
        return this.update(id, { status: 'cancelled' });
    }

    static async getParticipants(eventId) {
        const [rows] = await pool.execute(
            `SELECT ep.*, a.first_name, a.last_name, a.email, a.phone, a.member_number
             FROM event_participants ep
             JOIN adherents a ON ep.adherent_id = a.id
             WHERE ep.event_id = ?
             ORDER BY ep.registration_date`,
            [eventId]
        );
        return rows;
    }

    static async addParticipant(eventId, adherentId) {
        const event = await this.findById(eventId);
        if (!event) return { error: 'Event not found' };

        if (event.max_participants && event.current_participants >= event.max_participants) {
            return { error: 'Event is full' };
        }

        try {
            await pool.execute(
                `INSERT INTO event_participants (event_id, adherent_id) VALUES (?, ?)`,
                [eventId, adherentId]
            );

            await pool.execute(
                `UPDATE events SET current_participants = current_participants + 1 WHERE id = ?`,
                [eventId]
            );

            return { success: true };
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return { error: 'Already registered' };
            }
            throw error;
        }
    }

    static async removeParticipant(eventId, adherentId) {
        const [result] = await pool.execute(
            `DELETE FROM event_participants WHERE event_id = ? AND adherent_id = ?`,
            [eventId, adherentId]
        );

        if (result.affectedRows > 0) {
            await pool.execute(
                `UPDATE events SET current_participants = GREATEST(0, current_participants - 1) WHERE id = ?`,
                [eventId]
            );
            return true;
        }
        return false;
    }

    static async updateAttendance(eventId, adherentId, status) {
        const [result] = await pool.execute(
            `UPDATE event_participants SET attendance_status = ? WHERE event_id = ? AND adherent_id = ?`,
            [status, eventId, adherentId]
        );
        return result.affectedRows > 0;
    }

    static async getUpcoming(limit = 5) {
        const safeLimit = parseInt(limit) || 5;
        const [rows] = await pool.query(
            `SELECT e.*, i.first_name as intervenant_first_name, i.last_name as intervenant_last_name
             FROM events e
             LEFT JOIN intervenants i ON e.intervenant_id = i.id
             WHERE e.start_datetime >= NOW() AND e.status = 'scheduled'
             ORDER BY e.start_datetime ASC
             LIMIT ${safeLimit}`
        );
        return rows;
    }

    static async getByDateRange(startDate, endDate) {
        const [rows] = await pool.execute(
            `SELECT e.*, i.first_name as intervenant_first_name, i.last_name as intervenant_last_name
             FROM events e
             LEFT JOIN intervenants i ON e.intervenant_id = i.id
             WHERE DATE(e.start_datetime) >= ? AND DATE(e.end_datetime) <= ?
             ORDER BY e.start_datetime ASC`,
            [startDate, endDate]
        );
        return rows;
    }

    static async getStats() {
        const [rows] = await pool.execute(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
                SUM(current_participants) as total_participants
            FROM events
        `);
        return rows[0];
    }
}

module.exports = EventModel;
