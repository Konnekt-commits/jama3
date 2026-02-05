const pool = require('../config/db');

class StudentModel {
    static async findAll(associationId, filters = {}) {
        let query = `
            SELECT s.*,
                   CONCAT(a.first_name, ' ', a.last_name) as parent_name,
                   a.phone as parent_phone,
                   a.email as parent_email
            FROM students s
            LEFT JOIN adherents a ON s.parent_id = a.id
            WHERE s.association_id = ?
        `;
        const params = [associationId];

        if (filters.status) {
            query += ' AND s.status = ?';
            params.push(filters.status);
        }

        if (filters.level) {
            query += ' AND s.level = ?';
            params.push(filters.level);
        }

        if (filters.class_id) {
            query += ' AND s.id IN (SELECT student_id FROM class_enrollments WHERE class_id = ? AND status = "active")';
            params.push(filters.class_id);
        }

        if (filters.parent_id) {
            query += ' AND s.parent_id = ?';
            params.push(filters.parent_id);
        }

        if (filters.search) {
            query += ' AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_number LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY s.last_name, s.first_name';

        if (filters.limit) {
            const limit = parseInt(filters.limit, 10);
            query += ` LIMIT ${limit}`;
            if (filters.offset) {
                const offset = parseInt(filters.offset, 10);
                query += ` OFFSET ${offset}`;
            }
        }

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async findById(id, associationId) {
        const [rows] = await pool.execute(`
            SELECT s.*,
                   CONCAT(a.first_name, ' ', a.last_name) as parent_name,
                   a.phone as parent_phone,
                   a.email as parent_email,
                   a.id as parent_adherent_id
            FROM students s
            LEFT JOIN adherents a ON s.parent_id = a.id
            WHERE s.id = ? AND s.association_id = ?
        `, [id, associationId]);
        return rows[0];
    }

    static async create(associationId, data) {
        const studentNumber = await this.generateStudentNumber(associationId);

        const [result] = await pool.execute(
            `INSERT INTO students (
                association_id, student_number, first_name, last_name, birth_date,
                gender, photo_url, parent_id, parent_relation, emergency_contact,
                emergency_name, level, enrollment_date, status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                associationId,
                studentNumber,
                data.first_name,
                data.last_name,
                data.birth_date || null,
                data.gender || 'M',
                data.photo_url || null,
                data.parent_id || null,
                data.parent_relation || 'pere',
                data.emergency_contact || null,
                data.emergency_name || null,
                data.level || 'debutant',
                data.enrollment_date || new Date().toISOString().split('T')[0],
                data.status || 'actif',
                data.notes || null
            ]
        );

        return { id: result.insertId, student_number: studentNumber };
    }

    static async update(id, associationId, data) {
        const fields = [];
        const values = [];

        const allowedFields = [
            'first_name', 'last_name', 'birth_date', 'gender', 'photo_url',
            'parent_id', 'parent_relation', 'emergency_contact', 'emergency_name',
            'level', 'enrollment_date', 'status', 'notes'
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
            `UPDATE students SET ${fields.join(', ')} WHERE id = ? AND association_id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    static async delete(id, associationId) {
        const [result] = await pool.execute(
            'DELETE FROM students WHERE id = ? AND association_id = ?',
            [id, associationId]
        );
        return result.affectedRows > 0;
    }

    static async count(associationId, filters = {}) {
        let query = 'SELECT COUNT(*) as total FROM students WHERE association_id = ?';
        const params = [associationId];

        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }

        const [rows] = await pool.execute(query, params);
        return rows[0].total;
    }

    static async getStats(associationId) {
        const [rows] = await pool.execute(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'actif' THEN 1 ELSE 0 END) as actifs,
                SUM(CASE WHEN status = 'inactif' THEN 1 ELSE 0 END) as inactifs,
                SUM(CASE WHEN status = 'diplome' THEN 1 ELSE 0 END) as diplomes,
                SUM(CASE WHEN level = 'debutant' THEN 1 ELSE 0 END) as debutants,
                SUM(CASE WHEN level = 'intermediaire' THEN 1 ELSE 0 END) as intermediaires,
                SUM(CASE WHEN level = 'avance' THEN 1 ELSE 0 END) as avances
            FROM students
            WHERE association_id = ?
        `, [associationId]);
        return rows[0];
    }

    static async generateStudentNumber(associationId) {
        const year = new Date().getFullYear();
        const [rows] = await pool.execute(
            `SELECT COUNT(*) as count FROM students WHERE association_id = ? AND student_number LIKE ?`,
            [associationId, `ELV-${year}-%`]
        );
        const nextNumber = (rows[0].count + 1).toString().padStart(3, '0');
        return `ELV-${year}-${nextNumber}`;
    }

    static async getClasses(studentId, associationId) {
        const [rows] = await pool.execute(`
            SELECT sc.*, ce.enrollment_date, ce.status as enrollment_status,
                   CONCAT(i.first_name, ' ', i.last_name) as teacher_name
            FROM class_enrollments ce
            JOIN school_classes sc ON ce.class_id = sc.id
            LEFT JOIN intervenants i ON sc.teacher_id = i.id
            WHERE ce.student_id = ? AND ce.association_id = ?
            ORDER BY sc.name
        `, [studentId, associationId]);
        return rows;
    }

    static async getAttendance(studentId, associationId, limit = 20) {
        const [rows] = await pool.execute(`
            SELECT sa.*, sc.name as class_name, sc.subject
            FROM school_attendance sa
            JOIN school_classes sc ON sa.class_id = sc.id
            WHERE sa.student_id = ? AND sa.association_id = ?
            ORDER BY sa.session_date DESC
            LIMIT ${parseInt(limit, 10)}
        `, [studentId, associationId]);
        return rows;
    }

    static async getEvaluations(studentId, associationId, limit = 10) {
        const [rows] = await pool.execute(`
            SELECT se.*, sc.name as class_name, sc.subject,
                   CONCAT(i.first_name, ' ', i.last_name) as evaluator_name
            FROM school_evaluations se
            JOIN school_classes sc ON se.class_id = sc.id
            LEFT JOIN intervenants i ON se.evaluated_by = i.id
            WHERE se.student_id = ? AND se.association_id = ?
            ORDER BY se.evaluation_date DESC
            LIMIT ${parseInt(limit, 10)}
        `, [studentId, associationId]);
        return rows;
    }
}

module.exports = StudentModel;
