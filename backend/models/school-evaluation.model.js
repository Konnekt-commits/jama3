const pool = require('../config/db');

class SchoolEvaluationModel {
    static async findAll(associationId, filters = {}) {
        let query = `
            SELECT se.*,
                   s.first_name, s.last_name, s.student_number,
                   sc.name as class_name, sc.subject,
                   CONCAT(i.first_name, ' ', i.last_name) as evaluator_name
            FROM school_evaluations se
            JOIN students s ON se.student_id = s.id
            JOIN school_classes sc ON se.class_id = sc.id
            LEFT JOIN intervenants i ON se.evaluated_by = i.id
            WHERE se.association_id = ?
        `;
        const params = [associationId];

        if (filters.student_id) {
            query += ' AND se.student_id = ?';
            params.push(filters.student_id);
        }

        if (filters.class_id) {
            query += ' AND se.class_id = ?';
            params.push(filters.class_id);
        }

        if (filters.type) {
            query += ' AND se.type = ?';
            params.push(filters.type);
        }

        if (filters.from_date) {
            query += ' AND se.evaluation_date >= ?';
            params.push(filters.from_date);
        }

        if (filters.to_date) {
            query += ' AND se.evaluation_date <= ?';
            params.push(filters.to_date);
        }

        query += ' ORDER BY se.evaluation_date DESC, se.created_at DESC';

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
        const [rows] = await pool.execute(`
            SELECT se.*,
                   s.first_name, s.last_name, s.student_number,
                   sc.name as class_name, sc.subject,
                   CONCAT(i.first_name, ' ', i.last_name) as evaluator_name
            FROM school_evaluations se
            JOIN students s ON se.student_id = s.id
            JOIN school_classes sc ON se.class_id = sc.id
            LEFT JOIN intervenants i ON se.evaluated_by = i.id
            WHERE se.id = ? AND se.association_id = ?
        `, [id, associationId]);
        return rows[0];
    }

    static async create(associationId, data) {
        const [result] = await pool.execute(
            `INSERT INTO school_evaluations (
                association_id, student_id, class_id, evaluation_date, type,
                subject_detail, score, max_score, level_achieved, comments, evaluated_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                associationId,
                data.student_id,
                data.class_id,
                data.evaluation_date,
                data.type || 'controle',
                data.subject_detail || null,
                data.score || null,
                data.max_score || 20,
                data.level_achieved || null,
                data.comments || null,
                data.evaluated_by || null
            ]
        );

        return { id: result.insertId };
    }

    static async update(id, associationId, data) {
        const fields = [];
        const values = [];

        const allowedFields = [
            'evaluation_date', 'type', 'subject_detail', 'score', 'max_score',
            'level_achieved', 'comments', 'evaluated_by'
        ];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (fields.length === 0) return false;

        values.push(id, associationId);
        const [result] = await pool.execute(
            `UPDATE school_evaluations SET ${fields.join(', ')} WHERE id = ? AND association_id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    static async delete(id, associationId) {
        const [result] = await pool.execute(
            'DELETE FROM school_evaluations WHERE id = ? AND association_id = ?',
            [id, associationId]
        );
        return result.affectedRows > 0;
    }

    static async getStudentStats(studentId, associationId, classId = null) {
        let query = `
            SELECT
                COUNT(*) as total_evaluations,
                AVG(score / max_score * 100) as average_percentage,
                MAX(score / max_score * 100) as best_percentage,
                MIN(score / max_score * 100) as worst_percentage,
                SUM(CASE WHEN type = 'examen' THEN 1 ELSE 0 END) as exams_count,
                SUM(CASE WHEN type = 'memorisation' THEN 1 ELSE 0 END) as memorisation_count
            FROM school_evaluations
            WHERE student_id = ? AND association_id = ?
        `;
        const params = [studentId, associationId];

        if (classId) {
            query += ' AND class_id = ?';
            params.push(classId);
        }

        const [rows] = await pool.execute(query, params);
        return rows[0];
    }

    static async getClassStats(classId, associationId) {
        const [rows] = await pool.execute(`
            SELECT
                COUNT(*) as total_evaluations,
                COUNT(DISTINCT student_id) as students_evaluated,
                AVG(score / max_score * 100) as class_average,
                MAX(score / max_score * 100) as best_score,
                MIN(score / max_score * 100) as worst_score
            FROM school_evaluations
            WHERE class_id = ? AND association_id = ?
        `, [classId, associationId]);
        return rows[0];
    }

    static async getRecentByStudent(studentId, associationId, limit = 5) {
        const [rows] = await pool.execute(`
            SELECT se.*, sc.name as class_name, sc.subject
            FROM school_evaluations se
            JOIN school_classes sc ON se.class_id = sc.id
            WHERE se.student_id = ? AND se.association_id = ?
            ORDER BY se.evaluation_date DESC
            LIMIT ?
        `, [studentId, associationId, limit]);
        return rows;
    }
}

module.exports = SchoolEvaluationModel;
