const pool = require('../../config/db');

// Helper to check if is_teacher column exists
async function hasTeacherColumn() {
    try {
        const [columns] = await pool.execute(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'intervenants' AND COLUMN_NAME = 'is_teacher'
        `);
        return columns.length > 0;
    } catch {
        return false;
    }
}

// GET /api/school/teachers - Liste des enseignants (intervenants avec is_teacher=true ou assignés à des classes)
exports.getAll = async (req, res) => {
    try {
        const associationId = req.associationId;
        const { search } = req.query;

        const hasColumn = await hasTeacherColumn();

        let query;
        let params = [associationId];

        if (hasColumn) {
            // If is_teacher column exists, use it
            query = `
                SELECT i.*,
                       COUNT(DISTINCT sc.id) as class_count,
                       GROUP_CONCAT(DISTINCT sc.name SEPARATOR ', ') as class_names
                FROM intervenants i
                LEFT JOIN school_classes sc ON sc.teacher_id = i.id AND sc.status = 'active'
                WHERE i.association_id = ? AND i.is_teacher = 1
            `;
        } else {
            // Fallback: get intervenants who are assigned to classes
            query = `
                SELECT i.*,
                       COUNT(DISTINCT sc.id) as class_count,
                       GROUP_CONCAT(DISTINCT sc.name SEPARATOR ', ') as class_names
                FROM intervenants i
                INNER JOIN school_classes sc ON sc.teacher_id = i.id AND sc.status = 'active'
                WHERE i.association_id = ?
            `;
        }

        if (search) {
            query += ' AND (i.first_name LIKE ? OR i.last_name LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' GROUP BY i.id ORDER BY i.last_name, i.first_name';

        const [teachers] = await pool.execute(query, params);

        res.json({
            success: true,
            data: teachers
        });
    } catch (error) {
        console.error('Get teachers error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des enseignants',
            error: error.message
        });
    }
};

// GET /api/school/teachers/stats - Statistiques des enseignants
exports.getStats = async (req, res) => {
    try {
        const associationId = req.associationId;
        const hasColumn = await hasTeacherColumn();

        let query;
        if (hasColumn) {
            query = `
                SELECT
                    COUNT(DISTINCT i.id) as total_teachers,
                    COUNT(DISTINCT CASE WHEN i.is_active = 1 THEN i.id END) as active_teachers,
                    COUNT(DISTINCT sc.id) as total_classes,
                    COUNT(DISTINCT ce.student_id) as total_students_taught
                FROM intervenants i
                LEFT JOIN school_classes sc ON sc.teacher_id = i.id AND sc.association_id = i.association_id AND sc.status = 'active'
                LEFT JOIN class_enrollments ce ON ce.class_id = sc.id AND ce.status = 'active'
                WHERE i.association_id = ? AND i.is_teacher = 1
            `;
        } else {
            query = `
                SELECT
                    COUNT(DISTINCT sc.teacher_id) as total_teachers,
                    COUNT(DISTINCT sc.teacher_id) as active_teachers,
                    COUNT(DISTINCT sc.id) as total_classes,
                    COUNT(DISTINCT ce.student_id) as total_students_taught
                FROM school_classes sc
                LEFT JOIN class_enrollments ce ON ce.class_id = sc.id AND ce.status = 'active'
                WHERE sc.association_id = ? AND sc.teacher_id IS NOT NULL AND sc.status = 'active'
            `;
        }

        const [stats] = await pool.execute(query, [associationId]);

        res.json({
            success: true,
            data: stats[0] || { total_teachers: 0, active_teachers: 0, total_classes: 0, total_students_taught: 0 }
        });
    } catch (error) {
        console.error('Get teachers stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques',
            error: error.message
        });
    }
};

// GET /api/school/teachers/:id - Détail d'un enseignant avec ses classes
exports.getById = async (req, res) => {
    try {
        const associationId = req.associationId;
        const teacherId = parseInt(req.params.id);

        const [teachers] = await pool.execute(
            'SELECT * FROM intervenants WHERE id = ? AND association_id = ?',
            [teacherId, associationId]
        );

        if (teachers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Enseignant non trouvé'
            });
        }

        const teacher = teachers[0];

        // Get classes taught by this teacher
        const [classes] = await pool.execute(`
            SELECT sc.*,
                   COUNT(DISTINCT ce.student_id) as enrolled_count
            FROM school_classes sc
            LEFT JOIN class_enrollments ce ON ce.class_id = sc.id AND ce.status = 'active'
            WHERE sc.teacher_id = ? AND sc.association_id = ?
            GROUP BY sc.id
            ORDER BY sc.name
        `, [teacherId, associationId]);

        // Get recent evaluations by this teacher
        const [evaluations] = await pool.execute(`
            SELECT se.*, s.first_name, s.last_name, sc.name as class_name
            FROM school_evaluations se
            JOIN students s ON se.student_id = s.id
            JOIN school_classes sc ON se.class_id = sc.id
            WHERE se.evaluated_by = ? AND se.association_id = ?
            ORDER BY se.evaluation_date DESC
            LIMIT 10
        `, [teacherId, associationId]);

        // Get students taught by this teacher
        const [students] = await pool.execute(`
            SELECT DISTINCT s.id, s.first_name, s.last_name, s.student_number, s.photo_url
            FROM students s
            JOIN class_enrollments ce ON ce.student_id = s.id AND ce.status = 'active'
            JOIN school_classes sc ON ce.class_id = sc.id
            WHERE sc.teacher_id = ? AND sc.association_id = ?
            ORDER BY s.last_name, s.first_name
        `, [teacherId, associationId]);

        res.json({
            success: true,
            data: {
                ...teacher,
                classes,
                evaluations,
                students,
                student_count: students.length
            }
        });
    } catch (error) {
        console.error('Get teacher by id error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'enseignant',
            error: error.message
        });
    }
};

// POST /api/school/teachers/:id/mark-as-teacher - Marquer un intervenant comme enseignant
exports.markAsTeacher = async (req, res) => {
    try {
        const associationId = req.associationId;
        const intervenantId = parseInt(req.params.id);

        const hasColumn = await hasTeacherColumn();

        if (hasColumn) {
            await pool.execute(
                'UPDATE intervenants SET is_teacher = 1 WHERE id = ? AND association_id = ?',
                [intervenantId, associationId]
            );
        }

        res.json({
            success: true,
            message: 'Intervenant marqué comme enseignant'
        });
    } catch (error) {
        console.error('Mark as teacher error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour',
            error: error.message
        });
    }
};

// POST /api/school/teachers/:id/remove-teacher - Retirer le statut enseignant
exports.removeTeacher = async (req, res) => {
    try {
        const associationId = req.associationId;
        const intervenantId = parseInt(req.params.id);

        // Check if teacher has active classes
        const [classes] = await pool.execute(`
            SELECT id FROM school_classes
            WHERE teacher_id = ? AND association_id = ? AND status = 'active'
        `, [intervenantId, associationId]);

        if (classes.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cet enseignant a des classes actives. Réassignez-les d\'abord.'
            });
        }

        const hasColumn = await hasTeacherColumn();

        if (hasColumn) {
            await pool.execute(
                'UPDATE intervenants SET is_teacher = 0 WHERE id = ? AND association_id = ?',
                [intervenantId, associationId]
            );
        }

        res.json({
            success: true,
            message: 'Statut enseignant retiré'
        });
    } catch (error) {
        console.error('Remove teacher error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour',
            error: error.message
        });
    }
};

// GET /api/school/teachers/available - Intervenants disponibles (non encore enseignants)
exports.getAvailable = async (req, res) => {
    try {
        const associationId = req.associationId;
        const hasColumn = await hasTeacherColumn();

        let query;
        if (hasColumn) {
            query = `
                SELECT * FROM intervenants
                WHERE association_id = ? AND (is_teacher = 0 OR is_teacher IS NULL) AND is_active = 1
                ORDER BY last_name, first_name
            `;
        } else {
            // Get intervenants not assigned to any class
            query = `
                SELECT i.* FROM intervenants i
                LEFT JOIN school_classes sc ON sc.teacher_id = i.id
                WHERE i.association_id = ? AND i.is_active = 1 AND sc.id IS NULL
                ORDER BY i.last_name, i.first_name
            `;
        }

        const [intervenants] = await pool.execute(query, [associationId]);

        res.json({
            success: true,
            data: intervenants
        });
    } catch (error) {
        console.error('Get available intervenants error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des intervenants disponibles',
            error: error.message
        });
    }
};

// POST /api/school/teachers - Créer un nouvel enseignant (directement)
exports.create = async (req, res) => {
    try {
        const associationId = req.associationId;
        const { first_name, last_name, email, phone, speciality, notes } = req.body;

        if (!first_name || !last_name) {
            return res.status(400).json({
                success: false,
                message: 'Le prénom et le nom sont requis'
            });
        }

        const hasColumn = await hasTeacherColumn();

        // Create new intervenant with is_teacher = 1
        const [result] = await pool.execute(`
            INSERT INTO intervenants (
                association_id, first_name, last_name, email, phone, speciality, notes, is_active${hasColumn ? ', is_teacher' : ''}
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?${hasColumn ? ', 1' : ''})
        `, [
            associationId,
            first_name.trim(),
            last_name.trim(),
            email || null,
            phone || null,
            speciality || null,
            notes || null,
            1 // is_active
        ]);

        const teacherId = result.insertId;

        // Fetch the created teacher
        const [teachers] = await pool.execute(
            'SELECT * FROM intervenants WHERE id = ?',
            [teacherId]
        );

        res.status(201).json({
            success: true,
            message: 'Enseignant créé avec succès',
            data: teachers[0]
        });
    } catch (error) {
        console.error('Create teacher error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'enseignant',
            error: error.message
        });
    }
};
