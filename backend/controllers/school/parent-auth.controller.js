const pool = require('../../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST /api/school/parent-auth/login
exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email/telephone et mot de passe requis'
            });
        }

        // Find adherent (parent) by email or phone
        const [adherents] = await pool.execute(`
            SELECT a.*, ass.id as association_id, ass.name as association_name
            FROM adherents a
            JOIN associations ass ON a.association_id = ass.id
            WHERE (a.email = ? OR a.phone = ?) AND a.status = 'actif'
        `, [identifier, identifier]);

        if (adherents.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Identifiants incorrects'
            });
        }

        const adherent = adherents[0];

        // Check if this adherent is a parent (has children)
        const [children] = await pool.execute(`
            SELECT id FROM students WHERE parent_id = ? AND status = 'actif'
        `, [adherent.id]);

        if (children.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Aucun enfant inscrit trouve pour ce compte'
            });
        }

        // Check password
        // First check if parent has a password set
        let hasPassword = false;
        let passwordMatch = false;

        // Check in adherents table for password
        if (adherent.password) {
            hasPassword = true;
            passwordMatch = await bcrypt.compare(password, adherent.password);
        }

        // If no password set, check if password matches phone (first time login)
        if (!hasPassword) {
            // Allow first login with phone as password
            if (password === adherent.phone || password === adherent.email) {
                passwordMatch = true;
            }
        }

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Mot de passe incorrect'
            });
        }

        // Generate token
        const token = jwt.sign(
            {
                id: adherent.id,
                type: 'parent',
                association_id: adherent.association_id
            },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            data: {
                token,
                parent: {
                    id: adherent.id,
                    first_name: adherent.first_name,
                    last_name: adherent.last_name,
                    email: adherent.email,
                    phone: adherent.phone
                },
                association: {
                    id: adherent.association_id,
                    name: adherent.association_name
                }
            }
        });
    } catch (error) {
        console.error('Parent login error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur de connexion',
            error: error.message
        });
    }
};

// GET /api/school/parent-auth/me
exports.getMe = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token requis'
            });
        }

        const token = authHeader.split(' ')[1];
        let decoded;

        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Token invalide ou expire'
            });
        }

        if (decoded.type !== 'parent') {
            return res.status(401).json({
                success: false,
                message: 'Token invalide'
            });
        }

        const parentId = decoded.id;
        const associationId = decoded.association_id;

        // Get parent info
        const [parents] = await pool.execute(`
            SELECT a.*, ass.name as association_name
            FROM adherents a
            JOIN associations ass ON a.association_id = ass.id
            WHERE a.id = ?
        `, [parentId]);

        if (parents.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Parent non trouve'
            });
        }

        const parent = parents[0];

        // Get children with details
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
                    sc.schedule,
                    sc.room,
                    CONCAT(i.first_name, ' ', i.last_name) as teacher_name
                FROM class_enrollments ce
                JOIN school_classes sc ON ce.class_id = sc.id
                LEFT JOIN intervenants i ON sc.teacher_id = i.id
                WHERE ce.student_id = ? AND ce.status = 'active'
                ORDER BY sc.name
            `, [child.id]);
            // Parse schedule JSON
            child.classes = classes.map(c => ({
                ...c,
                schedule: c.schedule ? (typeof c.schedule === 'string' ? JSON.parse(c.schedule) : c.schedule) : null
            }));

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
            const academicYear = getCurrentAcademicYear();
            const [paymentStats] = await pool.execute(`
                SELECT
                    SUM(amount) as total_due,
                    SUM(paid_amount) as total_paid,
                    SUM(amount - paid_amount) as pending_amount
                FROM school_fees
                WHERE student_id = ? AND academic_year = ?
            `, [child.id, academicYear]);

            const pending = parseFloat(paymentStats[0].pending_amount || 0);
            if (pending <= 0) {
                child.payment_status = 'paid';
                child.pending_amount = 0;
            } else {
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

            activities.sort((a, b) => new Date(b.date) - new Date(a.date));
            child.recent_activity = activities.slice(0, 5);
        }

        // Get announcements for parent
        const [announcements] = await pool.execute(`
            SELECT id, title, content, published_at, created_at
            FROM school_announcements
            WHERE association_id = ?
            AND is_published = TRUE
            AND (target_audience IN ('all', 'parents') OR target_audience IS NULL)
            AND (expires_at IS NULL OR expires_at > NOW())
            ORDER BY published_at DESC
            LIMIT 5
        `, [associationId]);

        // Get messages for parent's children
        const childIds = children.map(c => c.id);
        let messages = [];
        let unreadCount = 0;

        if (childIds.length > 0) {
            const [msgs] = await pool.execute(`
                SELECT
                    m.id,
                    m.student_id,
                    m.sender_type,
                    m.content,
                    m.is_read,
                    m.created_at,
                    s.first_name as student_first_name,
                    s.last_name as student_last_name,
                    CASE
                        WHEN m.sender_type = 'teacher' THEN CONCAT(i.first_name, ' ', i.last_name)
                        ELSE CONCAT(a.first_name, ' ', a.last_name)
                    END as sender_name
                FROM school_messages m
                JOIN students s ON m.student_id = s.id
                LEFT JOIN intervenants i ON m.sender_type = 'teacher' AND m.sender_id = i.id
                LEFT JOIN adherents a ON m.sender_type = 'parent' AND m.sender_id = a.id
                WHERE m.student_id IN (${childIds.join(',')})
                ORDER BY m.created_at DESC
                LIMIT 20
            `);
            messages = msgs;

            // Count unread messages from teachers
            const [unread] = await pool.execute(`
                SELECT COUNT(*) as count
                FROM school_messages
                WHERE student_id IN (${childIds.join(',')})
                AND sender_type = 'teacher'
                AND is_read = FALSE
            `);
            unreadCount = unread[0].count;
        }

        // Get teachers for messaging
        const [teachers] = await pool.execute(`
            SELECT DISTINCT i.id, i.first_name, i.last_name
            FROM intervenants i
            JOIN school_classes sc ON i.id = sc.teacher_id
            JOIN class_enrollments ce ON sc.id = ce.class_id
            WHERE ce.student_id IN (${childIds.length > 0 ? childIds.join(',') : '0'})
            AND i.is_teacher = TRUE
        `);

        res.json({
            success: true,
            data: {
                parent: {
                    id: parent.id,
                    first_name: parent.first_name,
                    last_name: parent.last_name,
                    email: parent.email,
                    phone: parent.phone
                },
                children,
                association: {
                    id: associationId,
                    name: parent.association_name
                },
                announcements,
                messages,
                unreadCount,
                teachers
            }
        });
    } catch (error) {
        console.error('Get parent data error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur de chargement',
            error: error.message
        });
    }
};

// POST /api/school/parent-auth/send-message
exports.sendMessage = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Token requis' });
        }

        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Token invalide' });
        }

        if (decoded.type !== 'parent') {
            return res.status(401).json({ success: false, message: 'Acces non autorise' });
        }

        const { student_id, content } = req.body;
        if (!student_id || !content) {
            return res.status(400).json({ success: false, message: 'student_id et content requis' });
        }

        // Verify parent owns this student
        const [students] = await pool.execute(`
            SELECT id FROM students WHERE id = ? AND parent_id = ?
        `, [student_id, decoded.id]);

        if (students.length === 0) {
            return res.status(403).json({ success: false, message: 'Acces non autorise a cet eleve' });
        }

        await pool.execute(`
            INSERT INTO school_messages (association_id, student_id, sender_type, sender_id, content, is_read)
            VALUES (?, ?, 'parent', ?, ?, FALSE)
        `, [decoded.association_id, student_id, decoded.id, content]);

        res.json({ success: true, message: 'Message envoye' });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ success: false, message: 'Erreur envoi message', error: error.message });
    }
};

// PUT /api/school/parent-auth/mark-read
exports.markMessagesRead = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Token requis' });
        }

        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Token invalide' });
        }

        // Get parent's children
        const [children] = await pool.execute(`
            SELECT id FROM students WHERE parent_id = ?
        `, [decoded.id]);

        if (children.length > 0) {
            const childIds = children.map(c => c.id).join(',');
            await pool.execute(`
                UPDATE school_messages
                SET is_read = TRUE
                WHERE student_id IN (${childIds}) AND sender_type = 'teacher'
            `);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ success: false, message: 'Erreur' });
    }
};

function getCurrentAcademicYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    if (month >= 9) {
        return `${year}-${year + 1}`;
    } else {
        return `${year - 1}-${year}`;
    }
}
