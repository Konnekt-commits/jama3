const pool = require('../config/db');

class EventModel {
    static async findAll(associationId, filters = {}) {
        let query = `
            SELECT e.*,
                   i.first_name as intervenant_first_name,
                   i.last_name as intervenant_last_name
            FROM events e
            LEFT JOIN intervenants i ON e.intervenant_id = i.id
            WHERE e.association_id = ?
        `;
        const params = [associationId];

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

    static async findById(id, associationId) {
        const [rows] = await pool.execute(
            `SELECT e.*,
                    i.first_name as intervenant_first_name,
                    i.last_name as intervenant_last_name
             FROM events e
             LEFT JOIN intervenants i ON e.intervenant_id = i.id
             WHERE e.id = ? AND e.association_id = ?`,
            [id, associationId]
        );
        return rows[0];
    }

    static async create(associationId, data) {
        const [result] = await pool.execute(
            `INSERT INTO events (
                association_id, title, description, event_type, start_datetime, end_datetime,
                location, max_participants, intervenant_id, is_recurring,
                recurrence_rule, color, status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                associationId,
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

    static async update(id, associationId, data) {
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

        values.push(id, associationId);
        const [result] = await pool.execute(
            `UPDATE events SET ${fields.join(', ')} WHERE id = ? AND association_id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    static async delete(id, associationId) {
        const [result] = await pool.execute(
            'DELETE FROM events WHERE id = ? AND association_id = ?',
            [id, associationId]
        );
        return result.affectedRows > 0;
    }

    static async cancel(id, associationId) {
        return this.update(id, associationId, { status: 'cancelled' });
    }

    static async getParticipants(eventId, associationId) {
        const [rows] = await pool.execute(
            `SELECT ep.*, a.first_name, a.last_name, a.email, a.phone, a.member_number
             FROM event_participants ep
             JOIN adherents a ON ep.adherent_id = a.id
             WHERE ep.event_id = ? AND ep.association_id = ?
             ORDER BY ep.registration_date`,
            [eventId, associationId]
        );
        return rows;
    }

    static async addParticipant(associationId, eventId, adherentId) {
        const event = await this.findById(eventId, associationId);
        if (!event) return { error: 'Event not found' };

        if (event.max_participants && event.current_participants >= event.max_participants) {
            return { error: 'Event is full' };
        }

        try {
            await pool.execute(
                `INSERT INTO event_participants (association_id, event_id, adherent_id) VALUES (?, ?, ?)`,
                [associationId, eventId, adherentId]
            );

            await pool.execute(
                `UPDATE events SET current_participants = current_participants + 1 WHERE id = ? AND association_id = ?`,
                [eventId, associationId]
            );

            return { success: true };
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return { error: 'Already registered' };
            }
            throw error;
        }
    }

    static async removeParticipant(associationId, eventId, adherentId) {
        const [result] = await pool.execute(
            `DELETE FROM event_participants WHERE event_id = ? AND adherent_id = ? AND association_id = ?`,
            [eventId, adherentId, associationId]
        );

        if (result.affectedRows > 0) {
            await pool.execute(
                `UPDATE events SET current_participants = GREATEST(0, current_participants - 1) WHERE id = ? AND association_id = ?`,
                [eventId, associationId]
            );
            return true;
        }
        return false;
    }

    static async updateAttendance(associationId, eventId, adherentId, status) {
        const [result] = await pool.execute(
            `UPDATE event_participants SET attendance_status = ? WHERE event_id = ? AND adherent_id = ? AND association_id = ?`,
            [status, eventId, adherentId, associationId]
        );
        return result.affectedRows > 0;
    }

    static async getUpcoming(associationId, limit = 5) {
        const safeLimit = parseInt(limit) || 5;
        const [rows] = await pool.query(
            `SELECT e.*, i.first_name as intervenant_first_name, i.last_name as intervenant_last_name
             FROM events e
             LEFT JOIN intervenants i ON e.intervenant_id = i.id
             WHERE e.association_id = ? AND e.start_datetime >= NOW() AND e.status = 'scheduled'
             ORDER BY e.start_datetime ASC
             LIMIT ${safeLimit}`,
            [associationId]
        );
        return rows;
    }

    static async getByDateRange(associationId, startDate, endDate) {
        const [rows] = await pool.execute(
            `SELECT e.*, i.first_name as intervenant_first_name, i.last_name as intervenant_last_name
             FROM events e
             LEFT JOIN intervenants i ON e.intervenant_id = i.id
             WHERE e.association_id = ? AND DATE(e.start_datetime) >= ? AND DATE(e.end_datetime) <= ?
             ORDER BY e.start_datetime ASC`,
            [associationId, startDate, endDate]
        );
        return rows;
    }

    static async getStats(associationId) {
        const [rows] = await pool.execute(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
                SUM(current_participants) as total_participants
            FROM events
            WHERE association_id = ?
        `, [associationId]);
        return rows[0];
    }
}

module.exports = EventModel;
