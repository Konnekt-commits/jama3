const pool = require('../config/db');

class SchoolAttendanceModel {
    static async findByClassAndDate(classId, sessionDate, associationId) {
        const [rows] = await pool.execute(`
            SELECT sa.*, s.first_name, s.last_name, s.student_number, s.photo_url
            FROM school_attendance sa
            JOIN students s ON sa.student_id = s.id
            WHERE sa.class_id = ? AND sa.session_date = ? AND sa.association_id = ?
            ORDER BY s.last_name, s.first_name
        `, [classId, sessionDate, associationId]);
        return rows;
    }

    static async getStudentsForSession(classId, sessionDate, associationId) {
        const [rows] = await pool.execute(`
            SELECT
                s.id, s.first_name, s.last_name, s.student_number, s.photo_url,
                COALESCE(sa.status, 'not_recorded') as attendance_status,
                sa.notes as attendance_notes,
                sa.id as attendance_id
            FROM class_enrollments ce
            JOIN students s ON ce.student_id = s.id
            LEFT JOIN school_attendance sa ON sa.student_id = s.id
                AND sa.class_id = ? AND sa.session_date = ?
            WHERE ce.class_id = ? AND ce.status = 'active' AND ce.association_id = ?
            ORDER BY s.last_name, s.first_name
        `, [classId, sessionDate, classId, associationId]);
        return rows;
    }

    static async recordAttendance(associationId, classId, studentId, sessionDate, status, notes = null) {
        const [result] = await pool.execute(
            `INSERT INTO school_attendance (association_id, class_id, student_id, session_date, status, notes)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE status = VALUES(status), notes = VALUES(notes)`,
            [associationId, classId, studentId, sessionDate, status, notes]
        );
        return result.insertId || result.affectedRows > 0;
    }

    static async recordBatchAttendance(associationId, classId, sessionDate, attendances) {
        const results = [];
        for (const att of attendances) {
            const success = await this.recordAttendance(
                associationId, classId, att.student_id, sessionDate, att.status, att.notes
            );
            results.push({ student_id: att.student_id, success });
        }
        return results;
    }

    static async update(id, associationId, data) {
        const fields = [];
        const values = [];

        if (data.status !== undefined) {
            fields.push('status = ?');
            values.push(data.status);
        }
        if (data.notes !== undefined) {
            fields.push('notes = ?');
            values.push(data.notes);
        }

        if (fields.length === 0) return false;

        values.push(id, associationId);
        const [result] = await pool.execute(
            `UPDATE school_attendance SET ${fields.join(', ')} WHERE id = ? AND association_id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    static async getStudentAttendance(studentId, associationId, filters = {}) {
        let query = `
            SELECT sa.*, sc.name as class_name, sc.subject
            FROM school_attendance sa
            JOIN school_classes sc ON sa.class_id = sc.id
            WHERE sa.student_id = ? AND sa.association_id = ?
        `;
        const params = [studentId, associationId];

        if (filters.class_id) {
            query += ' AND sa.class_id = ?';
            params.push(filters.class_id);
        }

        if (filters.from_date) {
            query += ' AND sa.session_date >= ?';
            params.push(filters.from_date);
        }

        if (filters.to_date) {
            query += ' AND sa.session_date <= ?';
            params.push(filters.to_date);
        }

        query += ' ORDER BY sa.session_date DESC';

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(parseInt(filters.limit));
        }

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async getClassAttendanceStats(classId, associationId, fromDate = null, toDate = null) {
        let query = `
            SELECT
                COUNT(*) as total_records,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
                SUM(CASE WHEN status = 'excuse' THEN 1 ELSE 0 END) as excuse_count,
                SUM(CASE WHEN status = 'retard' THEN 1 ELSE 0 END) as retard_count,
                COUNT(DISTINCT session_date) as sessions_count
            FROM school_attendance
            WHERE class_id = ? AND association_id = ?
        `;
        const params = [classId, associationId];

        if (fromDate) {
            query += ' AND session_date >= ?';
            params.push(fromDate);
        }
        if (toDate) {
            query += ' AND session_date <= ?';
            params.push(toDate);
        }

        const [rows] = await pool.execute(query, params);
        return rows[0];
    }

    static async getRecentSessions(classId, associationId, limit = 10) {
        const [rows] = await pool.execute(`
            SELECT DISTINCT session_date,
                   (SELECT COUNT(*) FROM school_attendance WHERE class_id = ? AND session_date = sa.session_date AND status = 'present') as present_count,
                   (SELECT COUNT(*) FROM school_attendance WHERE class_id = ? AND session_date = sa.session_date) as total_count
            FROM school_attendance sa
            WHERE class_id = ? AND association_id = ?
            ORDER BY session_date DESC
            LIMIT ?
        `, [classId, classId, classId, associationId, limit]);
        return rows;
    }
}

module.exports = SchoolAttendanceModel;
