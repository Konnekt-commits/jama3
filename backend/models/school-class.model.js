const pool = require('../config/db');

class SchoolClassModel {
    static async findAll(associationId, filters = {}) {
        let query = `
            SELECT sc.*,
                   CONCAT(i.first_name, ' ', i.last_name) as teacher_name,
                   (SELECT COUNT(*) FROM class_enrollments ce WHERE ce.class_id = sc.id AND ce.status = 'active') as enrolled_count
            FROM school_classes sc
            LEFT JOIN intervenants i ON sc.teacher_id = i.id
            WHERE sc.association_id = ?
        `;
        const params = [associationId];

        if (filters.status) {
            query += ' AND sc.status = ?';
            params.push(filters.status);
        }

        if (filters.subject) {
            query += ' AND sc.subject = ?';
            params.push(filters.subject);
        }

        if (filters.level) {
            query += ' AND sc.level = ?';
            params.push(filters.level);
        }

        if (filters.teacher_id) {
            query += ' AND sc.teacher_id = ?';
            params.push(filters.teacher_id);
        }

        if (filters.academic_year) {
            query += ' AND sc.academic_year = ?';
            params.push(filters.academic_year);
        }

        if (filters.search) {
            query += ' AND (sc.name LIKE ? OR sc.room LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm);
        }

        query += ' ORDER BY sc.name';

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async findById(id, associationId) {
        const [rows] = await pool.execute(`
            SELECT sc.*,
                   CONCAT(i.first_name, ' ', i.last_name) as teacher_name,
                   i.email as teacher_email,
                   i.phone as teacher_phone
            FROM school_classes sc
            LEFT JOIN intervenants i ON sc.teacher_id = i.id
            WHERE sc.id = ? AND sc.association_id = ?
        `, [id, associationId]);
        return rows[0];
    }

    static async create(associationId, data) {
        const [result] = await pool.execute(
            `INSERT INTO school_classes (
                association_id, name, subject, level, teacher_id,
                max_capacity, schedule, room, academic_year, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                associationId,
                data.name,
                data.subject,
                data.level || 'debutant',
                data.teacher_id || null,
                data.max_capacity || 20,
                data.schedule ? JSON.stringify(data.schedule) : null,
                data.room || null,
                data.academic_year || this.getCurrentAcademicYear(),
                data.status || 'active'
            ]
        );

        return { id: result.insertId };
    }

    static async update(id, associationId, data) {
        const fields = [];
        const values = [];

        const allowedFields = [
            'name', 'subject', 'level', 'teacher_id', 'max_capacity',
            'schedule', 'room', 'academic_year', 'status'
        ];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                if (field === 'schedule') {
                    values.push(JSON.stringify(data[field]));
                } else {
                    values.push(data[field]);
                }
            }
        }

        if (fields.length === 0) return false;

        values.push(id, associationId);
        const [result] = await pool.execute(
            `UPDATE school_classes SET ${fields.join(', ')} WHERE id = ? AND association_id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    static async delete(id, associationId) {
        const [result] = await pool.execute(
            'DELETE FROM school_classes WHERE id = ? AND association_id = ?',
            [id, associationId]
        );
        return result.affectedRows > 0;
    }

    static async getStudents(classId, associationId) {
        const [rows] = await pool.execute(`
            SELECT s.*, ce.enrollment_date, ce.status as enrollment_status
            FROM class_enrollments ce
            JOIN students s ON ce.student_id = s.id
            WHERE ce.class_id = ? AND ce.association_id = ?
            ORDER BY s.last_name, s.first_name
        `, [classId, associationId]);
        return rows;
    }

    static async enrollStudent(associationId, classId, studentId) {
        const [result] = await pool.execute(
            `INSERT INTO class_enrollments (association_id, class_id, student_id, enrollment_date, status)
             VALUES (?, ?, ?, CURDATE(), 'active')
             ON DUPLICATE KEY UPDATE status = 'active', enrollment_date = CURDATE()`,
            [associationId, classId, studentId]
        );
        return result.insertId || result.affectedRows > 0;
    }

    static async unenrollStudent(associationId, classId, studentId) {
        const [result] = await pool.execute(
            `UPDATE class_enrollments SET status = 'withdrawn'
             WHERE class_id = ? AND student_id = ? AND association_id = ?`,
            [classId, studentId, associationId]
        );
        return result.affectedRows > 0;
    }

    static async getStats(associationId) {
        const [rows] = await pool.execute(`
            SELECT
                COUNT(*) as total_classes,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_classes,
                SUM(CASE WHEN subject = 'coran' THEN 1 ELSE 0 END) as coran_classes,
                SUM(CASE WHEN subject = 'arabe' THEN 1 ELSE 0 END) as arabe_classes,
                SUM(CASE WHEN subject = 'fiqh' THEN 1 ELSE 0 END) as fiqh_classes,
                (SELECT COUNT(*) FROM class_enrollments WHERE association_id = ? AND status = 'active') as total_enrollments
            FROM school_classes
            WHERE association_id = ?
        `, [associationId, associationId]);
        return rows[0];
    }

    static getCurrentAcademicYear() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        if (month >= 9) {
            return `${year}-${year + 1}`;
        }
        return `${year - 1}-${year}`;
    }
}

module.exports = SchoolClassModel;
