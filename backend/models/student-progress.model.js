const pool = require('../config/db');

class StudentProgressModel {
    static async findByStudent(studentId, associationId) {
        const [rows] = await pool.execute(`
            SELECT sp.*,
                   sc.name as class_name,
                   CONCAT(i.first_name, ' ', i.last_name) as awarded_by_name
            FROM student_progress sp
            LEFT JOIN school_classes sc ON sp.class_id = sc.id
            LEFT JOIN intervenants i ON sp.awarded_by = i.id
            WHERE sp.student_id = ? AND sp.association_id = ?
            ORDER BY sp.achieved_at DESC
        `, [studentId, associationId]);
        return rows;
    }

    static async create(associationId, data) {
        const [result] = await pool.execute(
            `INSERT INTO student_progress (association_id, student_id, class_id, milestone_type, milestone_name, milestone_description, milestone_icon, achieved_at, awarded_by, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                associationId,
                data.student_id,
                data.class_id || null,
                data.milestone_type || 'badge',
                data.milestone_name,
                data.milestone_description || null,
                data.milestone_icon || null,
                data.achieved_at || new Date().toISOString().split('T')[0],
                data.awarded_by || null,
                data.notes || null
            ]
        );
        return { id: result.insertId };
    }

    static async delete(id, associationId) {
        const [result] = await pool.execute(
            'DELETE FROM student_progress WHERE id = ? AND association_id = ?',
            [id, associationId]
        );
        return result.affectedRows > 0;
    }

    static async getStudentBadges(studentId, associationId) {
        const [rows] = await pool.execute(`
            SELECT milestone_name, milestone_icon, milestone_type, achieved_at
            FROM student_progress
            WHERE student_id = ? AND association_id = ? AND milestone_type = 'badge'
            ORDER BY achieved_at DESC
        `, [studentId, associationId]);
        return rows;
    }

    static async getStudentCertificates(studentId, associationId) {
        const [rows] = await pool.execute(`
            SELECT * FROM student_progress
            WHERE student_id = ? AND association_id = ? AND milestone_type = 'certificate'
            ORDER BY achieved_at DESC
        `, [studentId, associationId]);
        return rows;
    }
}

module.exports = StudentProgressModel;
