const pool = require('../../config/db');

// GET /api/school/parents - Liste des parents (adherents avec enfants inscrits)
exports.getAll = async (req, res) => {
    try {
        const associationId = req.associationId;

        // Get all parents (adherents who have students linked to them)
        const [parents] = await pool.execute(`
            SELECT DISTINCT
                a.id,
                a.first_name,
                a.last_name,
                a.email,
                a.phone,
                COUNT(DISTINCT s.id) as children_count
            FROM adherents a
            INNER JOIN students s ON s.parent_id = a.id AND s.association_id = a.association_id
            WHERE a.association_id = ? AND s.status = 'actif'
            GROUP BY a.id
            ORDER BY a.last_name, a.first_name
        `, [associationId]);

        res.json({
            success: true,
            data: parents
        });
    } catch (error) {
        console.error('Get parents error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la recuperation des parents',
            error: error.message
        });
    }
};

// GET /api/school/parents/:id/children - Enfants d'un parent avec details
exports.getChildren = async (req, res) => {
    try {
        const associationId = req.associationId;
        const parentId = parseInt(req.params.id);

        // Get all children of this parent
        const [children] = await pool.execute(`
            SELECT
                s.id,
                s.student_number,
                s.first_name,
                s.last_name,
                s.birth_date,
                s.level,
                s.status,
                s.photo_url
            FROM students s
            WHERE s.parent_id = ? AND s.association_id = ? AND s.status = 'actif'
            ORDER BY s.first_name
        `, [parentId, associationId]);

        // For each child, get additional data
        for (const child of children) {
            // Get classes
            const [classes] = await pool.execute(`
                SELECT
                    sc.id,
                    sc.name,
                    sc.subject,
                    CONCAT(i.first_name, ' ', i.last_name) as teacher_name
                FROM class_enrollments ce
                JOIN school_classes sc ON ce.class_id = sc.id
                LEFT JOIN intervenants i ON sc.teacher_id = i.id
                WHERE ce.student_id = ? AND ce.status = 'active'
                ORDER BY sc.name
            `, [child.id]);
            child.classes = classes;

            // Get attendance rate (last 30 days)
            const [attendanceStats] = await pool.execute(`
                SELECT
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
                FROM school_attendance
                WHERE student_id = ? AND session_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            `, [child.id]);

            if (attendanceStats[0].total > 0) {
                child.attendance_rate = Math.round((attendanceStats[0].present / attendanceStats[0].total) * 100);
            } else {
                child.attendance_rate = 100;
            }

            // Get average grade
            const [gradeStats] = await pool.execute(`
                SELECT AVG(score / max_score * 20) as avg_grade
                FROM school_evaluations
                WHERE student_id = ? AND score IS NOT NULL
            `, [child.id]);

            child.average_grade = gradeStats[0].avg_grade
                ? parseFloat(gradeStats[0].avg_grade).toFixed(1)
                : '-';

            // Get payment status
            const [paymentStats] = await pool.execute(`
                SELECT
                    SUM(amount) as total_due,
                    SUM(paid_amount) as total_paid,
                    SUM(amount - paid_amount) as pending_amount
                FROM school_fees
                WHERE student_id = ? AND academic_year = ?
            `, [child.id, getCurrentAcademicYear()]);

            const pending = parseFloat(paymentStats[0].pending_amount || 0);
            if (pending <= 0) {
                child.payment_status = 'paid';
                child.pending_amount = 0;
            } else {
                // Check if any payment is overdue
                const [overdue] = await pool.execute(`
                    SELECT COUNT(*) as count FROM school_fees
                    WHERE student_id = ? AND payment_status IN ('pending', 'partial')
                    AND due_date < CURDATE()
                `, [child.id]);

                child.payment_status = overdue[0].count > 0 ? 'overdue' : 'pending';
                child.pending_amount = pending;
            }

            // Get recent activity
            const activities = [];

            // Recent attendance
            const [recentAttendance] = await pool.execute(`
                SELECT
                    sa.session_date as date,
                    sa.status,
                    sc.name as class_name
                FROM school_attendance sa
                JOIN school_classes sc ON sa.class_id = sc.id
                WHERE sa.student_id = ?
                ORDER BY sa.session_date DESC
                LIMIT 5
            `, [child.id]);

            recentAttendance.forEach(att => {
                activities.push({
                    type: att.status === 'present' ? 'presence' : 'absence',
                    description: att.status === 'present'
                        ? `Present en ${att.class_name}`
                        : `Absent en ${att.class_name}`,
                    date: att.date
                });
            });

            // Recent evaluations
            const [recentGrades] = await pool.execute(`
                SELECT
                    se.evaluation_date as date,
                    se.score,
                    se.max_score,
                    sc.name as class_name
                FROM school_evaluations se
                JOIN school_classes sc ON se.class_id = sc.id
                WHERE se.student_id = ? AND se.score IS NOT NULL
                ORDER BY se.evaluation_date DESC
                LIMIT 3
            `, [child.id]);

            recentGrades.forEach(grade => {
                activities.push({
                    type: 'grade',
                    description: `Note: ${grade.score}/${grade.max_score} en ${grade.class_name}`,
                    date: grade.date
                });
            });

            // Sort by date
            activities.sort((a, b) => new Date(b.date) - new Date(a.date));
            child.recent_activity = activities.slice(0, 5);
        }

        res.json({
            success: true,
            data: children
        });
    } catch (error) {
        console.error('Get children error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la recuperation des enfants',
            error: error.message
        });
    }
};

function getCurrentAcademicYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Academic year starts in September
    if (month >= 9) {
        return `${year}-${year + 1}`;
    } else {
        return `${year - 1}-${year}`;
    }
}
