const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/migrate - Créer/mettre à jour les tables
router.get('/', async (req, res) => {
    const results = [];

    try {
        // Table associations
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS associations (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                logo_url VARCHAR(500),
                email VARCHAR(255),
                phone VARCHAR(20),
                address VARCHAR(255),
                city VARCHAR(100),
                postal_code VARCHAR(10),
                country VARCHAR(100) DEFAULT 'France',
                website VARCHAR(255),
                siret VARCHAR(20),
                rna_number VARCHAR(20),
                settings JSON,
                subscription_plan ENUM('free', 'starter', 'pro', 'enterprise') DEFAULT 'free',
                subscription_expires_at DATE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        results.push('✓ Table associations');

        // Table users
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                association_id INT,
                email VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('super_admin', 'admin', 'gestionnaire', 'intervenant') DEFAULT 'gestionnaire',
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                avatar_url VARCHAR(500),
                is_active BOOLEAN DEFAULT TRUE,
                is_owner BOOLEAN DEFAULT FALSE,
                last_login DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        results.push('✓ Table users');

        // Table adherents
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS adherents (
                id INT PRIMARY KEY AUTO_INCREMENT,
                association_id INT,
                member_number VARCHAR(20),
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(20),
                birth_date DATE,
                address VARCHAR(255),
                city VARCHAR(100),
                postal_code VARCHAR(10),
                photo_url VARCHAR(500),
                emergency_contact_name VARCHAR(200),
                emergency_contact_phone VARCHAR(20),
                medical_notes TEXT,
                status ENUM('actif', 'inactif', 'suspendu', 'archive') DEFAULT 'actif',
                membership_start DATE,
                membership_end DATE,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        results.push('✓ Table adherents');

        // Table cotisations
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS cotisations (
                id INT PRIMARY KEY AUTO_INCREMENT,
                association_id INT,
                adherent_id INT,
                season VARCHAR(20) NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                amount_paid DECIMAL(10,2) DEFAULT 0,
                payment_status ENUM('pending', 'partial', 'paid', 'overdue') DEFAULT 'pending',
                payment_method ENUM('cash', 'check', 'card', 'transfer', 'other') DEFAULT NULL,
                due_date DATE,
                paid_date DATE,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        results.push('✓ Table cotisations');

        // Table events
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS events (
                id INT PRIMARY KEY AUTO_INCREMENT,
                association_id INT,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                event_type ENUM('meeting', 'activity', 'course', 'ceremony', 'other') DEFAULT 'other',
                start_datetime DATETIME NOT NULL,
                end_datetime DATETIME,
                location VARCHAR(255),
                max_participants INT,
                is_public BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        results.push('✓ Table events');

        // Table event_participants
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS event_participants (
                id INT PRIMARY KEY AUTO_INCREMENT,
                event_id INT,
                adherent_id INT,
                status ENUM('registered', 'attended', 'absent', 'cancelled') DEFAULT 'registered',
                registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_participation (event_id, adherent_id)
            )
        `);
        results.push('✓ Table event_participants');

        // Table intervenants
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS intervenants (
                id INT PRIMARY KEY AUTO_INCREMENT,
                association_id INT,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(20),
                specialty VARCHAR(100),
                bio TEXT,
                photo_url VARCHAR(500),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        results.push('✓ Table intervenants');

        // Table messages
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS messages (
                id INT PRIMARY KEY AUTO_INCREMENT,
                association_id INT,
                sender_id INT,
                recipient_type ENUM('all', 'group', 'individual') DEFAULT 'all',
                recipient_id INT,
                subject VARCHAR(255),
                content TEXT,
                is_read BOOLEAN DEFAULT FALSE,
                read_at DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        results.push('✓ Table messages');

        // Table relances
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS relances (
                id INT PRIMARY KEY AUTO_INCREMENT,
                association_id INT,
                cotisation_id INT,
                adherent_id INT,
                type ENUM('email', 'sms', 'manual') DEFAULT 'email',
                message TEXT,
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status ENUM('sent', 'failed', 'pending') DEFAULT 'sent'
            )
        `);
        results.push('✓ Table relances');

        res.json({
            success: true,
            message: 'Migration terminée',
            results
        });

    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur migration',
            error: error.message,
            results
        });
    }
});

// GET /api/migrate/seed - Créer des données de test
router.get('/seed', async (req, res) => {
    const bcrypt = require('bcryptjs');

    try {
        // Créer association test
        const [assocResult] = await pool.execute(`
            INSERT INTO associations (name, slug, email, city)
            VALUES ('Mosquée Test Paris', 'mosquee-test-paris', 'contact@mosquee-test.fr', 'Paris')
            ON DUPLICATE KEY UPDATE name = name
        `);

        const associationId = assocResult.insertId || 1;

        // Créer admin test
        const hashedPassword = await bcrypt.hash('Test123!', 10);
        await pool.execute(`
            INSERT INTO users (association_id, email, password, role, first_name, last_name, is_owner)
            VALUES (?, 'admin@test.com', ?, 'admin', 'Admin', 'Test', TRUE)
            ON DUPLICATE KEY UPDATE email = email
        `, [associationId, hashedPassword]);

        // Créer quelques adhérents test
        const adherents = [
            ['Mohamed', 'Ali', 'mohamed.ali@test.com', '0612345678'],
            ['Fatima', 'Hassan', 'fatima.hassan@test.com', '0623456789'],
            ['Ahmed', 'Benali', 'ahmed.benali@test.com', '0634567890']
        ];

        for (const [first, last, email, phone] of adherents) {
            await pool.execute(`
                INSERT INTO adherents (association_id, first_name, last_name, email, phone, status)
                VALUES (?, ?, ?, ?, ?, 'actif')
                ON DUPLICATE KEY UPDATE first_name = first_name
            `, [associationId, first, last, email, phone]);
        }

        res.json({
            success: true,
            message: 'Données de test créées',
            data: {
                association_id: associationId,
                admin_email: 'admin@test.com',
                admin_password: 'Test123!'
            }
        });

    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur seed',
            error: error.message
        });
    }
});

// GET /api/migrate/create-superadmin - Créer le compte superadmin
router.get('/create-superadmin', async (req, res) => {
    const bcrypt = require('bcryptjs');

    try {
        const hashedPassword = await bcrypt.hash('SuperAdmin2026!', 10);

        // Créer le superadmin sans association
        await pool.execute(`
            INSERT INTO users (association_id, email, password, role, first_name, last_name, is_owner, is_active)
            VALUES (NULL, 'superadmin@jama3.fr', ?, 'super_admin', 'Super', 'Admin', FALSE, TRUE)
            ON DUPLICATE KEY UPDATE password = ?
        `, [hashedPassword, hashedPassword]);

        res.json({
            success: true,
            message: 'Superadmin créé',
            data: {
                email: 'superadmin@jama3.fr',
                password: 'SuperAdmin2026!'
            }
        });
    } catch (error) {
        console.error('Create superadmin error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur création superadmin',
            error: error.message
        });
    }
});

// GET /api/migrate/create-user - Créer un utilisateur spécifique (temporaire)
router.get('/create-user', async (req, res) => {
    const bcrypt = require('bcryptjs');

    try {
        // Créer l'association
        const [assocResult] = await pool.execute(`
            INSERT INTO associations (name, slug, email, city)
            VALUES ('Association Rachid', 'association-rachid', 'r.gountiti@gmail.com', 'Paris')
            ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)
        `);

        const associationId = assocResult.insertId || 2;

        // Créer l'utilisateur
        const hashedPassword = await bcrypt.hash('Altair01', 10);
        await pool.execute(`
            INSERT INTO users (association_id, email, password, role, first_name, last_name, is_owner)
            VALUES (?, 'r.gountiti@gmail.com', ?, 'admin', 'Rachid', 'Gountiti', TRUE)
            ON DUPLICATE KEY UPDATE password = ?
        `, [associationId, hashedPassword, hashedPassword]);

        res.json({
            success: true,
            message: 'Utilisateur créé',
            data: {
                email: 'r.gountiti@gmail.com',
                password: 'Altair01',
                association_id: associationId
            }
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur création utilisateur',
            error: error.message
        });
    }
});

// GET /api/migrate/debug - Lister les utilisateurs et associations (temporaire)
router.get('/debug', async (req, res) => {
    try {
        const [users] = await pool.execute('SELECT id, association_id, email, role, first_name, last_name, is_active, is_owner FROM users');
        const [associations] = await pool.execute('SELECT id, name, slug, is_active FROM associations');
        const [adherents] = await pool.execute('SELECT id, association_id, first_name, last_name, email, phone, status FROM adherents');
        const [programs] = await pool.execute('SELECT id, association_id, class_id, title, status FROM school_programs');
        const [classes] = await pool.execute('SELECT id, association_id, name FROM school_classes');

        res.json({
            success: true,
            data: {
                users,
                associations,
                adherents,
                programs,
                classes
            }
        });
    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur debug',
            error: error.message
        });
    }
});

// GET /api/migrate/test-programs/:assocId - Tester l'API programmes
router.get('/test-programs/:assocId', async (req, res) => {
    try {
        const associationId = parseInt(req.params.assocId);
        const [programs] = await pool.execute(`
            SELECT sp.*,
                   sc.name as class_name, sc.subject
            FROM school_programs sp
            LEFT JOIN school_classes sc ON sp.class_id = sc.id
            WHERE sp.association_id = ?
            ORDER BY sp.created_at DESC
        `, [associationId]);

        res.json({
            success: true,
            count: programs.length,
            data: programs
        });
    } catch (error) {
        console.error('Test programs error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur test programmes',
            error: error.message
        });
    }
});

// GET /api/migrate/add-adherent-auth - Ajouter les colonnes auth aux adhérents
router.get('/add-adherent-auth', async (req, res) => {
    try {
        // Ajouter colonne password aux adhérents
        await pool.execute(`
            ALTER TABLE adherents
            ADD COLUMN IF NOT EXISTS password VARCHAR(255) DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS password_set_at DATETIME DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS last_login DATETIME DEFAULT NULL
        `).catch(() => {});

        // Table pour les tokens de setup password
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS adherent_password_tokens (
                id INT PRIMARY KEY AUTO_INCREMENT,
                adherent_id INT NOT NULL,
                token VARCHAR(64) NOT NULL UNIQUE,
                expires_at DATETIME NOT NULL,
                used_at DATETIME DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_token (token),
                INDEX idx_adherent (adherent_id)
            )
        `);

        res.json({
            success: true,
            message: 'Colonnes auth adhérents ajoutées'
        });
    } catch (error) {
        console.error('Add adherent auth error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur',
            error: error.message
        });
    }
});

// GET /api/migrate/add-tokens-table - Ajouter la table adherent_tokens
router.get('/add-tokens-table', async (req, res) => {
    try {
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS adherent_tokens (
                id INT PRIMARY KEY AUTO_INCREMENT,
                adherent_id INT NOT NULL,
                token VARCHAR(64) NOT NULL UNIQUE,
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                used_at DATETIME,
                INDEX idx_token (token),
                INDEX idx_adherent (adherent_id),
                INDEX idx_expires (expires_at)
            )
        `);

        res.json({
            success: true,
            message: 'Table adherent_tokens créée'
        });
    } catch (error) {
        console.error('Add tokens table error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur création table',
            error: error.message
        });
    }
});

// GET /api/migrate/seed-school - Créer des données de démo École Arabe
router.get('/seed-school', async (req, res) => {
    try {
        // Récupérer l'association de test (Mosquée Test Paris)
        const [assocs] = await pool.execute('SELECT id FROM associations WHERE slug = ? LIMIT 1', ['mosquee-test-paris']);
        let associationId = assocs[0]?.id;

        if (!associationId) {
            // Créer l'association si elle n'existe pas
            const [result] = await pool.execute(`
                INSERT INTO associations (name, slug, email, city)
                VALUES ('Mosquée Test Paris', 'mosquee-test-paris', 'contact@mosquee-test.fr', 'Paris')
            `);
            associationId = result.insertId;
        }

        // Récupérer les adhérents existants pour les lier comme parents
        const [adherents] = await pool.execute(
            'SELECT id, first_name, last_name FROM adherents WHERE association_id = ? LIMIT 10',
            [associationId]
        );

        // Créer quelques intervenants/enseignants s'il n'en existe pas
        const [existingTeachers] = await pool.execute(
            'SELECT id FROM intervenants WHERE association_id = ?',
            [associationId]
        );

        let teacherIds = existingTeachers.map(t => t.id);

        if (teacherIds.length === 0) {
            const teachers = [
                ['Sheikh', 'Ahmed', 'sheikh.ahmed@test.com', 'Coran'],
                ['Ustadh', 'Karim', 'ustadh.karim@test.com', 'Arabe'],
                ['Imam', 'Youssef', 'imam.youssef@test.com', 'Fiqh']
            ];

            for (const [first, last, email, specialty] of teachers) {
                const [result] = await pool.execute(`
                    INSERT INTO intervenants (association_id, first_name, last_name, email, specialty, is_active)
                    VALUES (?, ?, ?, ?, ?, TRUE)
                `, [associationId, first, last, email, specialty]);
                teacherIds.push(result.insertId);
            }
        }

        // Créer des classes
        const classesData = [
            { name: 'Coran - Niveau 1 (Débutants)', subject: 'coran', level: 'debutant', schedule: { jour: 'Samedi', heure_debut: '10:00', heure_fin: '12:00' }, room: 'Salle 1', max: 15 },
            { name: 'Coran - Niveau 2 (Intermédiaire)', subject: 'coran', level: 'intermediaire', schedule: { jour: 'Samedi', heure_debut: '14:00', heure_fin: '16:00' }, room: 'Salle 1', max: 12 },
            { name: 'Coran - Niveau 3 (Avancé)', subject: 'coran', level: 'avance', schedule: { jour: 'Dimanche', heure_debut: '10:00', heure_fin: '12:00' }, room: 'Salle 1', max: 10 },
            { name: 'Arabe - Alphabet & Lecture', subject: 'arabe', level: 'debutant', schedule: { jour: 'Mercredi', heure_debut: '14:00', heure_fin: '16:00' }, room: 'Salle 2', max: 20 },
            { name: 'Arabe - Grammaire', subject: 'arabe', level: 'intermediaire', schedule: { jour: 'Samedi', heure_debut: '10:00', heure_fin: '12:00' }, room: 'Salle 2', max: 15 },
            { name: 'Fiqh - Les bases', subject: 'fiqh', level: 'debutant', schedule: { jour: 'Dimanche', heure_debut: '14:00', heure_fin: '15:30' }, room: 'Salle 3', max: 25 },
            { name: 'Sira du Prophète ﷺ', subject: 'sira', level: 'debutant', schedule: { jour: 'Dimanche', heure_debut: '16:00', heure_fin: '17:30' }, room: 'Salle 3', max: 30 }
        ];

        const classIds = [];
        for (let i = 0; i < classesData.length; i++) {
            const c = classesData[i];
            const teacherId = teacherIds[i % teacherIds.length];
            const [existing] = await pool.execute(
                'SELECT id FROM school_classes WHERE association_id = ? AND name = ?',
                [associationId, c.name]
            );

            if (existing.length === 0) {
                const [result] = await pool.execute(`
                    INSERT INTO school_classes (association_id, name, subject, level, teacher_id, max_capacity, schedule, room, academic_year, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, '2024-2025', 'active')
                `, [associationId, c.name, c.subject, c.level, teacherId, c.max, JSON.stringify(c.schedule), c.room]);
                classIds.push(result.insertId);
            } else {
                classIds.push(existing[0].id);
            }
        }

        // Créer des élèves
        const studentsData = [
            { first: 'Adam', last: 'Benali', birth: '2015-03-15', gender: 'M', level: 'debutant' },
            { first: 'Yasmine', last: 'Kaddouri', birth: '2014-07-22', gender: 'F', level: 'debutant' },
            { first: 'Mohammed', last: 'El Amrani', birth: '2013-11-08', gender: 'M', level: 'intermediaire' },
            { first: 'Fatima', last: 'Bouaziz', birth: '2012-05-30', gender: 'F', level: 'intermediaire' },
            { first: 'Youssef', last: 'Tazi', birth: '2016-01-18', gender: 'M', level: 'debutant' },
            { first: 'Aicha', last: 'Mansouri', birth: '2011-09-25', gender: 'F', level: 'avance' },
            { first: 'Ibrahim', last: 'Fassi', birth: '2014-12-03', gender: 'M', level: 'intermediaire' },
            { first: 'Khadija', last: 'Alaoui', birth: '2015-06-14', gender: 'F', level: 'debutant' },
            { first: 'Omar', last: 'Benjelloun', birth: '2013-02-28', gender: 'M', level: 'intermediaire' },
            { first: 'Meryem', last: 'Chraibi', birth: '2012-08-17', gender: 'F', level: 'avance' },
            { first: 'Hamza', last: 'Kettani', birth: '2016-04-09', gender: 'M', level: 'debutant' },
            { first: 'Sara', last: 'Bennani', birth: '2014-10-21', gender: 'F', level: 'debutant' },
            { first: 'Anas', last: 'Idrissi', birth: '2011-07-06', gender: 'M', level: 'avance' },
            { first: 'Nour', last: 'Slimani', birth: '2015-11-30', gender: 'F', level: 'debutant' },
            { first: 'Bilal', last: 'Ouazzani', birth: '2013-09-12', gender: 'M', level: 'intermediaire' }
        ];

        const studentIds = [];
        const year = new Date().getFullYear();

        for (let i = 0; i < studentsData.length; i++) {
            const s = studentsData[i];
            const studentNumber = `ELV-${year}-${(i + 1).toString().padStart(3, '0')}`;
            const parentId = adherents[i % adherents.length]?.id || null;

            const [existing] = await pool.execute(
                'SELECT id FROM students WHERE association_id = ? AND student_number = ?',
                [associationId, studentNumber]
            );

            if (existing.length === 0) {
                const [result] = await pool.execute(`
                    INSERT INTO students (association_id, student_number, first_name, last_name, birth_date, gender, parent_id, parent_relation, level, enrollment_date, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'pere', ?, CURDATE(), 'actif')
                `, [associationId, studentNumber, s.first, s.last, s.birth, s.gender, parentId, s.level]);
                studentIds.push(result.insertId);
            } else {
                studentIds.push(existing[0].id);
            }
        }

        // Inscrire les élèves aux classes
        for (const studentId of studentIds) {
            // Chaque élève inscrit à 2-3 classes aléatoires
            const numClasses = 2 + Math.floor(Math.random() * 2);
            const shuffled = [...classIds].sort(() => Math.random() - 0.5);

            for (let i = 0; i < numClasses && i < shuffled.length; i++) {
                await pool.execute(`
                    INSERT INTO class_enrollments (association_id, student_id, class_id, enrollment_date, status)
                    VALUES (?, ?, ?, CURDATE(), 'active')
                    ON DUPLICATE KEY UPDATE status = 'active'
                `, [associationId, studentId, shuffled[i]]);
            }
        }

        // Créer des présences pour les 4 dernières semaines
        const today = new Date();
        for (let week = 0; week < 4; week++) {
            for (const classId of classIds) {
                const sessionDate = new Date(today);
                sessionDate.setDate(sessionDate.getDate() - (week * 7));
                const dateStr = sessionDate.toISOString().split('T')[0];

                // Récupérer les élèves de cette classe
                const [enrolled] = await pool.execute(
                    'SELECT student_id FROM class_enrollments WHERE class_id = ? AND status = "active"',
                    [classId]
                );

                for (const { student_id } of enrolled) {
                    const rand = Math.random();
                    let status = 'present';
                    if (rand < 0.1) status = 'absent';
                    else if (rand < 0.15) status = 'excuse';
                    else if (rand < 0.2) status = 'retard';

                    await pool.execute(`
                        INSERT INTO school_attendance (association_id, class_id, student_id, session_date, status)
                        VALUES (?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE status = VALUES(status)
                    `, [associationId, classId, student_id, dateStr, status]);
                }
            }
        }

        // Créer des frais de scolarité
        const months = ['Septembre', 'Octobre', 'Novembre', 'Décembre', 'Janvier'];
        let feeCounter = 1;

        for (const studentId of studentIds) {
            for (const month of months) {
                const feeNumber = `SCO-2024${months.indexOf(month) + 9}-${feeCounter.toString().padStart(4, '0')}`;
                const isPaid = Math.random() > 0.3;
                const isPartial = !isPaid && Math.random() > 0.5;

                const amount = 50;
                const paidAmount = isPaid ? amount : (isPartial ? 25 : 0);
                const status = isPaid ? 'paid' : (isPartial ? 'partial' : (Math.random() > 0.5 ? 'pending' : 'overdue'));

                await pool.execute(`
                    INSERT INTO school_fees (association_id, student_id, fee_number, academic_year, period, period_label, amount, paid_amount, payment_status, due_date, payment_method)
                    VALUES (?, ?, ?, '2024-2025', 'mensuel', ?, ?, ?, ?, DATE_SUB(CURDATE(), INTERVAL ? MONTH), ?)
                    ON DUPLICATE KEY UPDATE payment_status = VALUES(payment_status)
                `, [
                    associationId, studentId, feeNumber, `${month} 2024`, amount, paidAmount, status,
                    months.length - months.indexOf(month),
                    isPaid ? 'cash' : null
                ]);

                feeCounter++;
            }
        }

        // Créer quelques évaluations
        const evalTypes = ['controle', 'oral', 'memorisation'];
        const subjects = ['Sourate Al-Fatiha', 'Sourate Al-Ikhlas', 'Sourate An-Nas', 'Alphabet arabe', 'Vocabulaire', 'Ablutions'];

        for (const studentId of studentIds) {
            const numEvals = 2 + Math.floor(Math.random() * 3);

            for (let i = 0; i < numEvals; i++) {
                const classId = classIds[Math.floor(Math.random() * classIds.length)];
                const evalDate = new Date();
                evalDate.setDate(evalDate.getDate() - Math.floor(Math.random() * 60));
                const dateStr = evalDate.toISOString().split('T')[0];

                const score = 10 + Math.floor(Math.random() * 11); // 10-20
                const type = evalTypes[Math.floor(Math.random() * evalTypes.length)];
                const subject = subjects[Math.floor(Math.random() * subjects.length)];
                const teacherId = teacherIds[Math.floor(Math.random() * teacherIds.length)];

                await pool.execute(`
                    INSERT INTO school_evaluations (association_id, student_id, class_id, evaluation_date, type, subject_detail, score, max_score, evaluated_by)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 20, ?)
                `, [associationId, studentId, classId, dateStr, type, subject, score, teacherId]);
            }
        }

        res.json({
            success: true,
            message: 'Données de démo École Arabe créées',
            data: {
                association_id: associationId,
                classes_created: classIds.length,
                students_created: studentIds.length,
                teachers: teacherIds.length
            }
        });

    } catch (error) {
        console.error('Seed school error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur création données école',
            error: error.message
        });
    }
});

// GET /api/migrate/school-tables - Créer les tables École Arabe
router.get('/school-tables', async (req, res) => {
    const results = [];

    try {
        // Table students (élèves - distinct des adhérents)
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS students (
                id INT PRIMARY KEY AUTO_INCREMENT,
                association_id INT NOT NULL,
                student_number VARCHAR(20) NOT NULL,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                birth_date DATE,
                gender ENUM('M', 'F') DEFAULT 'M',
                photo_url VARCHAR(255),
                parent_id INT,
                parent_relation ENUM('pere', 'mere', 'tuteur', 'autre') DEFAULT 'pere',
                parent_email VARCHAR(255),
                parent_phone VARCHAR(20),
                parent_name VARCHAR(200),
                emergency_contact VARCHAR(20),
                emergency_name VARCHAR(100),
                level ENUM('debutant', 'intermediaire', 'avance') DEFAULT 'debutant',
                enrollment_date DATE,
                status ENUM('actif', 'inactif', 'diplome', 'transfere', 'absent_longue_duree') DEFAULT 'actif',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_student_number (association_id, student_number),
                INDEX idx_association (association_id),
                INDEX idx_parent (parent_id),
                INDEX idx_status (status)
            )
        `);
        results.push('✓ Table students');

        // Table school_classes (classes/groupes)
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS school_classes (
                id INT PRIMARY KEY AUTO_INCREMENT,
                association_id INT NOT NULL,
                name VARCHAR(100) NOT NULL,
                subject ENUM('coran', 'arabe', 'fiqh', 'sira', 'doua', 'autre') NOT NULL,
                level ENUM('debutant', 'intermediaire', 'avance') DEFAULT 'debutant',
                teacher_id INT,
                max_capacity INT DEFAULT 20,
                schedule JSON,
                room VARCHAR(50),
                academic_year VARCHAR(9),
                status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_association (association_id),
                INDEX idx_teacher (teacher_id),
                INDEX idx_status (status)
            )
        `);
        results.push('✓ Table school_classes');

        // Table class_enrollments (inscriptions aux classes)
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS class_enrollments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                association_id INT NOT NULL,
                student_id INT NOT NULL,
                class_id INT NOT NULL,
                enrollment_date DATE NOT NULL,
                status ENUM('active', 'suspended', 'completed', 'withdrawn') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_enrollment (student_id, class_id),
                INDEX idx_association (association_id),
                INDEX idx_student (student_id),
                INDEX idx_class (class_id)
            )
        `);
        results.push('✓ Table class_enrollments');

        // Table school_attendance (présences)
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS school_attendance (
                id INT PRIMARY KEY AUTO_INCREMENT,
                association_id INT NOT NULL,
                class_id INT NOT NULL,
                student_id INT NOT NULL,
                session_date DATE NOT NULL,
                status ENUM('present', 'absent', 'excuse', 'retard') DEFAULT 'present',
                notes VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_attendance (class_id, student_id, session_date),
                INDEX idx_association (association_id),
                INDEX idx_class_date (class_id, session_date)
            )
        `);
        results.push('✓ Table school_attendance');

        // Table school_fees (frais de scolarité)
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS school_fees (
                id INT PRIMARY KEY AUTO_INCREMENT,
                association_id INT NOT NULL,
                student_id INT NOT NULL,
                fee_number VARCHAR(20) NOT NULL,
                academic_year VARCHAR(9) NOT NULL,
                period ENUM('mensuel', 'trimestriel', 'annuel') DEFAULT 'mensuel',
                period_label VARCHAR(50),
                amount DECIMAL(10,2) NOT NULL,
                paid_amount DECIMAL(10,2) DEFAULT 0,
                payment_status ENUM('pending', 'partial', 'paid', 'overdue') DEFAULT 'pending',
                due_date DATE,
                paid_date DATE,
                payment_method ENUM('cash', 'cheque', 'virement', 'carte', 'autre'),
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_association (association_id),
                INDEX idx_student (student_id),
                INDEX idx_status (payment_status)
            )
        `);
        results.push('✓ Table school_fees');

        // Table school_evaluations (évaluations/progression)
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS school_evaluations (
                id INT PRIMARY KEY AUTO_INCREMENT,
                association_id INT NOT NULL,
                student_id INT NOT NULL,
                class_id INT NOT NULL,
                evaluation_date DATE NOT NULL,
                type ENUM('examen', 'controle', 'oral', 'memorisation') DEFAULT 'controle',
                subject_detail VARCHAR(100),
                score DECIMAL(5,2),
                max_score DECIMAL(5,2) DEFAULT 20,
                level_achieved ENUM('debutant', 'intermediaire', 'avance'),
                comments TEXT,
                evaluated_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_association (association_id),
                INDEX idx_student (student_id),
                INDEX idx_class (class_id)
            )
        `);
        results.push('✓ Table school_evaluations');

        // Table school_programs (programmes pédagogiques)
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS school_programs (
                id INT PRIMARY KEY AUTO_INCREMENT,
                association_id INT NOT NULL,
                class_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                period VARCHAR(50),
                objectives JSON,
                start_date DATE,
                end_date DATE,
                status ENUM('draft', 'active', 'completed') DEFAULT 'draft',
                created_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_association (association_id),
                INDEX idx_class (class_id)
            )
        `);
        results.push('✓ Table school_programs');

        // Table school_content (contenus pédagogiques - PDF, vidéos, etc.)
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS school_content (
                id INT PRIMARY KEY AUTO_INCREMENT,
                association_id INT NOT NULL,
                class_id INT,
                program_id INT,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                content_type ENUM('pdf', 'video', 'audio', 'text', 'link', 'image') DEFAULT 'pdf',
                url VARCHAR(500),
                file_name VARCHAR(255),
                file_size INT,
                is_public BOOLEAN DEFAULT FALSE,
                created_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_association (association_id),
                INDEX idx_class (class_id),
                INDEX idx_program (program_id)
            )
        `);
        results.push('✓ Table school_content');

        // Table student_progress (progression et badges)
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS student_progress (
                id INT PRIMARY KEY AUTO_INCREMENT,
                association_id INT NOT NULL,
                student_id INT NOT NULL,
                class_id INT,
                milestone_type ENUM('badge', 'level', 'certificate', 'achievement') DEFAULT 'badge',
                milestone_name VARCHAR(100) NOT NULL,
                milestone_description TEXT,
                milestone_icon VARCHAR(50),
                achieved_at DATE NOT NULL,
                awarded_by INT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_association (association_id),
                INDEX idx_student (student_id)
            )
        `);
        results.push('✓ Table student_progress');

        // Table school_announcements (annonces parents/élèves)
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS school_announcements (
                id INT PRIMARY KEY AUTO_INCREMENT,
                association_id INT NOT NULL,
                class_id INT,
                class_ids JSON,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
                target_audience ENUM('all', 'parents', 'students', 'teachers', 'class') DEFAULT 'all',
                published_at DATETIME,
                expires_at DATETIME,
                is_published BOOLEAN DEFAULT FALSE,
                created_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_association (association_id),
                INDEX idx_class (class_id),
                INDEX idx_published (is_published, published_at)
            )
        `);

        // Add class_ids column if not exists (migration for existing tables)
        try {
            await pool.execute(`
                ALTER TABLE school_announcements
                ADD COLUMN IF NOT EXISTS class_ids JSON AFTER class_id
            `);
        } catch (e) {
            // Column might already exist or syntax not supported
            console.log('Note: class_ids column migration:', e.message);
        }
        results.push('✓ Table school_announcements');

        // Table school_messages (messagerie prof-parents)
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS school_messages (
                id INT PRIMARY KEY AUTO_INCREMENT,
                association_id INT NOT NULL,
                sender_type ENUM('teacher', 'admin', 'parent') NOT NULL,
                sender_id INT NOT NULL,
                recipient_type ENUM('teacher', 'admin', 'parent', 'student') NOT NULL,
                recipient_id INT NOT NULL,
                student_id INT,
                subject VARCHAR(255),
                content TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                read_at DATETIME,
                parent_message_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_association (association_id),
                INDEX idx_sender (sender_type, sender_id),
                INDEX idx_recipient (recipient_type, recipient_id),
                INDEX idx_student (student_id)
            )
        `);
        results.push('✓ Table school_messages');

        // Table school_documents (documents scolaires)
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS school_documents (
                id INT PRIMARY KEY AUTO_INCREMENT,
                association_id INT NOT NULL,
                student_id INT NOT NULL,
                document_type ENUM('bulletin', 'certificat', 'attestation', 'facture', 'recu', 'autre') DEFAULT 'autre',
                title VARCHAR(255) NOT NULL,
                description TEXT,
                file_url VARCHAR(500),
                file_name VARCHAR(255),
                academic_year VARCHAR(9),
                period VARCHAR(50),
                generated_at DATETIME,
                created_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_association (association_id),
                INDEX idx_student (student_id),
                INDEX idx_type (document_type)
            )
        `);
        results.push('✓ Table school_documents');

        // Table absence_alerts (alertes absences parents)
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS absence_alerts (
                id INT PRIMARY KEY AUTO_INCREMENT,
                association_id INT NOT NULL,
                student_id INT NOT NULL,
                attendance_id INT NOT NULL,
                alert_type ENUM('email', 'sms', 'app') DEFAULT 'email',
                sent_at DATETIME,
                status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
                error_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_association (association_id),
                INDEX idx_student (student_id)
            )
        `);
        results.push('✓ Table absence_alerts');

        res.json({
            success: true,
            message: 'Tables École Arabe créées',
            results
        });

    } catch (error) {
        console.error('School tables migration error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur migration tables école',
            error: error.message,
            results
        });
    }
});

// GET /api/migrate/seed-all-for-association/:assocId - Créer TOUTES les données de démo pour une association spécifique
router.get('/seed-all-for-association/:assocId', async (req, res) => {
    const associationId = parseInt(req.params.assocId);
    const results = [];

    try {
        // ========== CRÉER DES ADHÉRENTS ==========
        const adherentsData = [
            ['Mohamed', 'Ali', 'mohamed.ali@test.com', '0612345678'],
            ['Fatima', 'Hassan', 'fatima.hassan@test.com', '0623456789'],
            ['Ahmed', 'Benali', 'ahmed.benali@test.com', '0634567890'],
            ['Khadija', 'Mansouri', 'khadija.mansouri@test.com', '0645678901'],
            ['Youssef', 'Tazi', 'youssef.tazi@test.com', '0656789012'],
            ['Aicha', 'Kaddouri', 'aicha.kaddouri@test.com', '0667890123'],
            ['Omar', 'Fassi', 'omar.fassi@test.com', '0678901234'],
            ['Meryem', 'Alaoui', 'meryem.alaoui@test.com', '0689012345']
        ];

        let adherentCount = 0;
        for (const [first, last, email, phone] of adherentsData) {
            const [existing] = await pool.execute(
                'SELECT id FROM adherents WHERE association_id = ? AND email = ?',
                [associationId, email]
            );
            if (existing.length === 0) {
                const memberNumber = 'ADH-' + new Date().getFullYear() + '-' + String(adherentCount + 1).padStart(3, '0');
                await pool.execute(
                    'INSERT INTO adherents (association_id, member_number, first_name, last_name, email, phone, status, membership_start) VALUES (?, ?, ?, ?, ?, ?, "actif", CURDATE())',
                    [associationId, memberNumber, first, last, email, phone]
                );
                adherentCount++;
            }
        }
        results.push('✓ ' + adherentCount + ' adhérents créés');

        // Récupérer les adhérents
        const [adherents] = await pool.execute(
            'SELECT id, first_name, last_name FROM adherents WHERE association_id = ?',
            [associationId]
        );

        // ========== CRÉER DES ENSEIGNANTS (intervenants) ==========
        const teachersData = [
            ['Sheikh', 'Ahmed', 'sheikh.ahmed@school.com', 'Coran'],
            ['Ustadh', 'Karim', 'ustadh.karim@school.com', 'Arabe'],
            ['Imam', 'Youssef', 'imam.youssef@school.com', 'Fiqh']
        ];

        let teacherCount = 0;
        for (const [first, last, email, specialty] of teachersData) {
            const [existing] = await pool.execute(
                'SELECT id FROM intervenants WHERE association_id = ? AND email = ?',
                [associationId, email]
            );
            if (existing.length === 0) {
                await pool.execute(
                    'INSERT INTO intervenants (association_id, first_name, last_name, email, specialty, is_active) VALUES (?, ?, ?, ?, ?, TRUE)',
                    [associationId, first, last, email, specialty]
                );
                teacherCount++;
            }
        }
        results.push('✓ ' + teacherCount + ' enseignants créés');

        const [teachers] = await pool.execute(
            'SELECT id FROM intervenants WHERE association_id = ?',
            [associationId]
        );

        // ========== CRÉER DES CLASSES ==========
        const classesData = [
            { name: 'Coran - Niveau 1 (Débutants)', subject: 'coran', level: 'debutant', schedule: { jour: 'Samedi', heure_debut: '10:00', heure_fin: '12:00' }, room: 'Salle 1', max: 15 },
            { name: 'Coran - Niveau 2 (Intermédiaire)', subject: 'coran', level: 'intermediaire', schedule: { jour: 'Samedi', heure_debut: '14:00', heure_fin: '16:00' }, room: 'Salle 1', max: 12 },
            { name: 'Coran - Niveau 3 (Avancé)', subject: 'coran', level: 'avance', schedule: { jour: 'Dimanche', heure_debut: '10:00', heure_fin: '12:00' }, room: 'Salle 1', max: 10 },
            { name: 'Arabe - Alphabet & Lecture', subject: 'arabe', level: 'debutant', schedule: { jour: 'Mercredi', heure_debut: '14:00', heure_fin: '16:00' }, room: 'Salle 2', max: 20 },
            { name: 'Arabe - Grammaire', subject: 'arabe', level: 'intermediaire', schedule: { jour: 'Samedi', heure_debut: '10:00', heure_fin: '12:00' }, room: 'Salle 2', max: 15 },
            { name: 'Fiqh - Les bases', subject: 'fiqh', level: 'debutant', schedule: { jour: 'Dimanche', heure_debut: '14:00', heure_fin: '15:30' }, room: 'Salle 3', max: 25 },
            { name: 'Sira du Prophète ﷺ', subject: 'sira', level: 'debutant', schedule: { jour: 'Dimanche', heure_debut: '16:00', heure_fin: '17:30' }, room: 'Salle 3', max: 30 }
        ];

        const classIds = [];
        for (let i = 0; i < classesData.length; i++) {
            const c = classesData[i];
            const teacherId = teachers[i % teachers.length]?.id;
            const [existing] = await pool.execute(
                'SELECT id FROM school_classes WHERE association_id = ? AND name = ?',
                [associationId, c.name]
            );
            if (existing.length === 0) {
                const [result] = await pool.execute(
                    'INSERT INTO school_classes (association_id, name, subject, level, teacher_id, max_capacity, schedule, room, academic_year, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "2024-2025", "active")',
                    [associationId, c.name, c.subject, c.level, teacherId, c.max, JSON.stringify(c.schedule), c.room]
                );
                classIds.push(result.insertId);
            } else {
                classIds.push(existing[0].id);
            }
        }
        results.push('✓ ' + classIds.length + ' classes créées');

        // ========== CRÉER DES ÉLÈVES ==========
        const studentsData = [
            { first: 'Adam', last: 'Benali', birth: '2015-03-15', gender: 'M', level: 'debutant' },
            { first: 'Yasmine', last: 'Kaddouri', birth: '2014-07-22', gender: 'F', level: 'debutant' },
            { first: 'Mohammed', last: 'El Amrani', birth: '2013-11-08', gender: 'M', level: 'intermediaire' },
            { first: 'Fatima', last: 'Bouaziz', birth: '2012-05-30', gender: 'F', level: 'intermediaire' },
            { first: 'Youssef', last: 'Tazi', birth: '2016-01-18', gender: 'M', level: 'debutant' },
            { first: 'Aicha', last: 'Mansouri', birth: '2011-09-25', gender: 'F', level: 'avance' },
            { first: 'Ibrahim', last: 'Fassi', birth: '2014-12-03', gender: 'M', level: 'intermediaire' },
            { first: 'Khadija', last: 'Alaoui', birth: '2015-06-14', gender: 'F', level: 'debutant' },
            { first: 'Omar', last: 'Benjelloun', birth: '2013-02-28', gender: 'M', level: 'intermediaire' },
            { first: 'Meryem', last: 'Chraibi', birth: '2012-08-17', gender: 'F', level: 'avance' },
            { first: 'Hamza', last: 'Kettani', birth: '2016-04-09', gender: 'M', level: 'debutant' },
            { first: 'Sara', last: 'Bennani', birth: '2014-10-21', gender: 'F', level: 'debutant' },
            { first: 'Anas', last: 'Idrissi', birth: '2011-07-06', gender: 'M', level: 'avance' },
            { first: 'Nour', last: 'Slimani', birth: '2015-11-30', gender: 'F', level: 'debutant' },
            { first: 'Bilal', last: 'Ouazzani', birth: '2013-09-12', gender: 'M', level: 'intermediaire' }
        ];

        const studentIds = [];
        const year = new Date().getFullYear();
        for (let i = 0; i < studentsData.length; i++) {
            const s = studentsData[i];
            const studentNumber = 'ELV-' + year + '-' + String(i + 1).padStart(3, '0');
            const parentId = adherents[i % adherents.length]?.id || null;

            const [existing] = await pool.execute(
                'SELECT id FROM students WHERE association_id = ? AND student_number = ?',
                [associationId, studentNumber]
            );
            if (existing.length === 0) {
                const [result] = await pool.execute(
                    'INSERT INTO students (association_id, student_number, first_name, last_name, birth_date, gender, parent_id, parent_relation, level, enrollment_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, "pere", ?, CURDATE(), "actif")',
                    [associationId, studentNumber, s.first, s.last, s.birth, s.gender, parentId, s.level]
                );
                studentIds.push(result.insertId);
            } else {
                studentIds.push(existing[0].id);
            }
        }
        results.push('✓ ' + studentIds.length + ' élèves créés');

        // ========== INSCRIPTIONS AUX CLASSES ==========
        let enrollmentCount = 0;
        for (const studentId of studentIds) {
            const numClasses = 2 + Math.floor(Math.random() * 2);
            const shuffled = [...classIds].sort(() => Math.random() - 0.5);
            for (let i = 0; i < numClasses && i < shuffled.length; i++) {
                try {
                    await pool.execute(
                        'INSERT INTO class_enrollments (association_id, student_id, class_id, enrollment_date, status) VALUES (?, ?, ?, CURDATE(), "active") ON DUPLICATE KEY UPDATE status = "active"',
                        [associationId, studentId, shuffled[i]]
                    );
                    enrollmentCount++;
                } catch (e) {}
            }
        }
        results.push('✓ ' + enrollmentCount + ' inscriptions aux classes');

        // ========== PRÉSENCES (4 dernières semaines) ==========
        let attendanceCount = 0;
        const today = new Date();
        for (let week = 0; week < 4; week++) {
            for (const classId of classIds) {
                const sessionDate = new Date(today);
                sessionDate.setDate(sessionDate.getDate() - (week * 7));
                const dateStr = sessionDate.toISOString().split('T')[0];

                const [enrolled] = await pool.execute(
                    'SELECT student_id FROM class_enrollments WHERE class_id = ? AND status = "active"',
                    [classId]
                );

                for (const { student_id } of enrolled) {
                    const rand = Math.random();
                    let status = 'present';
                    if (rand < 0.1) status = 'absent';
                    else if (rand < 0.15) status = 'excuse';
                    else if (rand < 0.2) status = 'retard';

                    try {
                        await pool.execute(
                            'INSERT INTO school_attendance (association_id, class_id, student_id, session_date, status) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status)',
                            [associationId, classId, student_id, dateStr, status]
                        );
                        attendanceCount++;
                    } catch (e) {}
                }
            }
        }
        results.push('✓ ' + attendanceCount + ' présences enregistrées');

        // ========== FRAIS DE SCOLARITÉ ==========
        const months = ['Septembre', 'Octobre', 'Novembre', 'Décembre', 'Janvier'];
        let feeCount = 0;
        for (const studentId of studentIds) {
            for (let m = 0; m < months.length; m++) {
                const feeNumber = 'SCO-2024' + String(m + 9).padStart(2, '0') + '-' + String(feeCount + 1).padStart(4, '0');
                const isPaid = Math.random() > 0.3;
                const isPartial = !isPaid && Math.random() > 0.5;
                const amount = 50;
                const paidAmount = isPaid ? amount : (isPartial ? 25 : 0);
                const status = isPaid ? 'paid' : (isPartial ? 'partial' : (Math.random() > 0.5 ? 'pending' : 'overdue'));

                try {
                    await pool.execute(
                        'INSERT INTO school_fees (association_id, student_id, fee_number, academic_year, period, period_label, amount, paid_amount, payment_status, due_date, payment_method) VALUES (?, ?, ?, "2024-2025", "mensuel", ?, ?, ?, ?, DATE_SUB(CURDATE(), INTERVAL ? MONTH), ?) ON DUPLICATE KEY UPDATE payment_status = VALUES(payment_status)',
                        [associationId, studentId, feeNumber, months[m] + ' 2024', amount, paidAmount, status, months.length - m, isPaid ? 'cash' : null]
                    );
                    feeCount++;
                } catch (e) {}
            }
        }
        results.push('✓ ' + feeCount + ' frais de scolarité créés');

        // ========== ÉVALUATIONS ==========
        const evalTypes = ['controle', 'oral', 'memorisation'];
        const subjects = ['Sourate Al-Fatiha', 'Sourate Al-Ikhlas', 'Alphabet arabe', 'Vocabulaire', 'Ablutions'];
        let evalCount = 0;
        for (const studentId of studentIds) {
            const numEvals = 2 + Math.floor(Math.random() * 3);
            for (let i = 0; i < numEvals; i++) {
                const classId = classIds[Math.floor(Math.random() * classIds.length)];
                const evalDate = new Date();
                evalDate.setDate(evalDate.getDate() - Math.floor(Math.random() * 60));
                const score = 10 + Math.floor(Math.random() * 11);
                const type = evalTypes[Math.floor(Math.random() * evalTypes.length)];
                const subject = subjects[Math.floor(Math.random() * subjects.length)];
                const teacherId = teachers[Math.floor(Math.random() * teachers.length)]?.id;

                await pool.execute(
                    'INSERT INTO school_evaluations (association_id, student_id, class_id, evaluation_date, type, subject_detail, score, max_score, evaluated_by) VALUES (?, ?, ?, ?, ?, ?, ?, 20, ?)',
                    [associationId, studentId, classId, evalDate.toISOString().split('T')[0], type, subject, score, teacherId]
                );
                evalCount++;
            }
        }
        results.push('✓ ' + evalCount + ' évaluations créées');

        // Get admin for created_by
        const [admins] = await pool.execute(
            'SELECT id FROM users WHERE association_id = ? LIMIT 1',
            [associationId]
        );
        const adminId = admins[0]?.id || 1;

        // ========== PROGRAMMES PÉDAGOGIQUES ==========
        const [classes] = await pool.execute('SELECT id, name, subject FROM school_classes WHERE association_id = ?', [associationId]);
        const programsData = [
            { subjectMatch: 'coran', levelMatch: 'Niveau 1', title: 'Programme Coran Débutant - T1', description: 'Mémorisation des sourates courtes', objectives: ['Mémoriser Al-Fatiha', 'Apprendre les 5 dernières sourates'], status: 'active' },
            { subjectMatch: 'coran', levelMatch: 'Niveau 2', title: 'Programme Coran Intermédiaire', description: 'Juz Amma et Tajwid avancé', objectives: ['Compléter Juz Amma', 'Maîtriser le Tajwid'], status: 'active' },
            { subjectMatch: 'arabe', levelMatch: 'Alphabet', title: 'Programme Arabe Débutant', description: 'Alphabet et lecture de base', objectives: ['Reconnaître les lettres', 'Lire les voyelles'], status: 'active' },
            { subjectMatch: 'fiqh', levelMatch: '', title: 'Programme Fiqh - Bases', description: 'Les piliers de l\'Islam', objectives: ['Les 5 piliers', 'Les ablutions', 'La prière'], status: 'active' },
            { subjectMatch: 'sira', levelMatch: '', title: 'Programme Sira', description: 'Vie du Prophète ﷺ', objectives: ['Naissance', 'Révélation', 'Hégire'], status: 'draft' }
        ];

        const programIds = [];
        for (const prog of programsData) {
            const matchClass = classes.find(c => c.subject === prog.subjectMatch || c.name.includes(prog.levelMatch));
            if (matchClass) {
                const [existing] = await pool.execute('SELECT id FROM school_programs WHERE association_id = ? AND title = ?', [associationId, prog.title]);
                if (existing.length === 0) {
                    const [result] = await pool.execute(
                        'INSERT INTO school_programs (association_id, class_id, title, description, objectives, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [associationId, matchClass.id, prog.title, prog.description, JSON.stringify(prog.objectives), prog.status, adminId]
                    );
                    programIds.push(result.insertId);
                }
            }
        }
        results.push('✓ ' + programIds.length + ' programmes créés');

        // ========== CONTENUS ==========
        let contentCount = 0;
        for (let i = 0; i < programIds.length && i < 3; i++) {
            const contents = [
                { title: 'Audio récitation', type: 'audio', url: 'https://example.com/audio.mp3' },
                { title: 'Support PDF', type: 'pdf', url: 'https://example.com/support.pdf' },
                { title: 'Vidéo explicative', type: 'video', url: 'https://youtube.com/watch?v=example' }
            ];
            for (const c of contents) {
                await pool.execute(
                    'INSERT INTO school_content (association_id, program_id, title, content_type, url, created_by) VALUES (?, ?, ?, ?, ?, ?)',
                    [associationId, programIds[i], c.title, c.type, c.url, adminId]
                );
                contentCount++;
            }
        }
        results.push('✓ ' + contentCount + ' contenus créés');

        // ========== ANNONCES ==========
        const announcements = [
            { title: 'Rentrée des classes', content: 'La rentrée de l\'école arabe aura lieu le samedi 7 septembre. Merci d\'accompagner vos enfants.', priority: 'high', published: true },
            { title: 'Vacances de Toussaint', content: 'L\'école sera fermée du 26 octobre au 3 novembre.', priority: 'normal', published: true },
            { title: 'Concours de récitation', content: 'Concours de récitation du Coran le 15 décembre. Inscriptions ouvertes!', priority: 'normal', published: true },
            { title: 'Rappel paiement', content: 'Les frais de scolarité de novembre sont à régler avant le 15.', priority: 'high', published: true },
            { title: 'Journée portes ouvertes', content: 'Journée portes ouvertes prévue en février 2025.', priority: 'low', published: false }
        ];

        let annCount = 0;
        for (const ann of announcements) {
            const [existing] = await pool.execute('SELECT id FROM school_announcements WHERE association_id = ? AND title = ?', [associationId, ann.title]);
            if (existing.length === 0) {
                await pool.execute(
                    'INSERT INTO school_announcements (association_id, title, content, priority, is_published, published_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [associationId, ann.title, ann.content, ann.priority, ann.published, ann.published ? new Date() : null, adminId]
                );
                annCount++;
            }
        }
        results.push('✓ ' + annCount + ' annonces créées');

        // ========== MESSAGES ==========
        const [students] = await pool.execute('SELECT id, first_name FROM students WHERE association_id = ? LIMIT 5', [associationId]);
        let msgCount = 0;
        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            const teacherId = teachers[i % teachers.length]?.id || 1;

            await pool.execute(
                'INSERT INTO school_messages (association_id, sender_type, sender_id, recipient_type, recipient_id, student_id, subject, content, is_read) VALUES (?, "teacher", ?, "parent", ?, ?, ?, ?, TRUE)',
                [associationId, teacherId, student.id, student.id, 'Progrès de ' + student.first_name, student.first_name + ' fait de bons progrès en mémorisation. Félicitations!']
            );
            msgCount++;

            await pool.execute(
                'INSERT INTO school_messages (association_id, sender_type, sender_id, recipient_type, recipient_id, student_id, subject, content, is_read) VALUES (?, "parent", ?, "teacher", ?, ?, ?, ?, TRUE)',
                [associationId, student.id, teacherId, student.id, 'Re: Progrès', 'Merci pour ce retour positif. Nous continuons à l\'encourager.']
            );
            msgCount++;
        }
        results.push('✓ ' + msgCount + ' messages créés');

        // ========== BADGES ==========
        const badges = [
            { name: 'Sourate Al-Fatiha', icon: '📖', type: 'badge' },
            { name: 'Sourate Al-Ikhlas', icon: '⭐', type: 'badge' },
            { name: 'Alphabet Arabe', icon: '🔤', type: 'badge' },
            { name: 'Lecture Niveau 1', icon: '📚', type: 'level' },
            { name: 'Assidu', icon: '🌙', type: 'achievement' }
        ];

        let badgeCount = 0;
        for (const studentId of studentIds) {
            const numBadges = 1 + Math.floor(Math.random() * 4);
            const shuffled = [...badges].sort(() => Math.random() - 0.5);
            for (let j = 0; j < numBadges; j++) {
                const badge = shuffled[j];
                const achievedDate = new Date();
                achievedDate.setDate(achievedDate.getDate() - Math.floor(Math.random() * 90));
                const teacherId = teachers[Math.floor(Math.random() * teachers.length)]?.id;

                const [existing] = await pool.execute(
                    'SELECT id FROM student_progress WHERE association_id = ? AND student_id = ? AND milestone_name = ?',
                    [associationId, studentId, badge.name]
                );
                if (existing.length === 0) {
                    await pool.execute(
                        'INSERT INTO student_progress (association_id, student_id, milestone_type, milestone_name, milestone_icon, achieved_at, awarded_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [associationId, studentId, badge.type, badge.name, badge.icon, achievedDate.toISOString().split('T')[0], teacherId]
                    );
                    badgeCount++;
                }
            }
        }
        results.push('✓ ' + badgeCount + ' badges attribués');

        res.json({
            success: true,
            message: 'Toutes les données de démo créées pour l\'association ' + associationId,
            results
        });

    } catch (error) {
        console.error('Seed all error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur création données',
            error: error.message,
            results
        });
    }
});

// GET /api/migrate/seed-school-ent - Créer des données de démo ENT (programmes, contenus, annonces, messages, badges)
router.get('/seed-school-ent', async (req, res) => {
    try {
        // Récupérer l'association
        const [assocs] = await pool.execute('SELECT id FROM associations WHERE slug = ? LIMIT 1', ['mosquee-test-paris']);
        const associationId = assocs[0]?.id || 1;

        // Récupérer les classes existantes
        const [classes] = await pool.execute(
            'SELECT id, name, subject, teacher_id FROM school_classes WHERE association_id = ?',
            [associationId]
        );

        // Récupérer les élèves
        const [students] = await pool.execute(
            'SELECT id, first_name, last_name FROM students WHERE association_id = ?',
            [associationId]
        );

        // Récupérer les enseignants
        const [teachers] = await pool.execute(
            'SELECT id, first_name, last_name FROM intervenants WHERE association_id = ?',
            [associationId]
        );

        // Récupérer l'admin
        const [admins] = await pool.execute(
            'SELECT id FROM users WHERE association_id = ? AND role IN ("admin", "gestionnaire") LIMIT 1',
            [associationId]
        );
        const adminId = admins[0]?.id || 1;

        const results = [];

        // ========== 1. PROGRAMMES PÉDAGOGIQUES ==========
        const programsData = [
            {
                class_id: classes.find(c => c.subject === 'coran' && c.name.includes('Niveau 1'))?.id || classes[0]?.id,
                title: 'Programme Coran Débutant - Trimestre 1',
                description: 'Programme de mémorisation et récitation pour les débutants. Apprentissage des sourates courtes du Juz Amma.',
                period: 'Trimestre 1 - 2024-2025',
                objectives: JSON.stringify(['Mémoriser Sourate Al-Fatiha', 'Mémoriser les 5 dernières sourates', 'Apprendre les règles de base du Tajwid', 'Réciter avec une prononciation correcte']),
                status: 'active'
            },
            {
                class_id: classes.find(c => c.subject === 'coran' && c.name.includes('Niveau 2'))?.id || classes[1]?.id,
                title: 'Programme Coran Intermédiaire - Trimestre 1',
                description: 'Continuation de la mémorisation du Juz Amma et introduction aux règles avancées du Tajwid.',
                period: 'Trimestre 1 - 2024-2025',
                objectives: JSON.stringify(['Compléter la mémorisation du Juz Amma', 'Maîtriser les règles de Noon Sakinah', 'Apprendre les règles de Meem Sakinah', 'Récitation fluide et mélodieuse']),
                status: 'active'
            },
            {
                class_id: classes.find(c => c.subject === 'arabe')?.id || classes[3]?.id,
                title: 'Programme Arabe - Alphabet et Lecture',
                description: 'Apprentissage de l\'alphabet arabe, lecture et écriture des lettres avec les voyelles.',
                period: 'Année 2024-2025',
                objectives: JSON.stringify(['Reconnaître toutes les lettres', 'Écrire les lettres en début/milieu/fin', 'Lire les voyelles courtes et longues', 'Former des mots simples']),
                status: 'active'
            },
            {
                class_id: classes.find(c => c.subject === 'fiqh')?.id || classes[5]?.id,
                title: 'Programme Fiqh - Les Bases de l\'Islam',
                description: 'Introduction aux piliers de l\'Islam et aux actes d\'adoration fondamentaux.',
                period: 'Année 2024-2025',
                objectives: JSON.stringify(['Connaître les 5 piliers de l\'Islam', 'Apprendre les étapes des ablutions', 'Connaître les conditions de la prière', 'Mémoriser les invocations de base']),
                status: 'active'
            },
            {
                class_id: classes.find(c => c.subject === 'sira')?.id || classes[6]?.id,
                title: 'Programme Sira - Vie du Prophète ﷺ',
                description: 'Étude de la vie du Prophète Muhammad ﷺ de sa naissance à l\'Hégire.',
                period: 'Semestre 1 - 2024-2025',
                objectives: JSON.stringify(['La naissance et l\'enfance du Prophète ﷺ', 'La révélation et le début de la mission', 'Les premiers compagnons', 'L\'émigration vers Médine']),
                status: 'draft'
            }
        ];

        const programIds = [];
        for (const prog of programsData) {
            if (prog.class_id) {
                const [existing] = await pool.execute(
                    'SELECT id FROM school_programs WHERE association_id = ? AND title = ?',
                    [associationId, prog.title]
                );
                if (existing.length === 0) {
                    const [result] = await pool.execute(
                        'INSERT INTO school_programs (association_id, class_id, title, description, period, objectives, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [associationId, prog.class_id, prog.title, prog.description, prog.period, prog.objectives, prog.status, adminId]
                    );
                    programIds.push(result.insertId);
                } else {
                    programIds.push(existing[0].id);
                }
            }
        }
        results.push('✓ ' + programIds.length + ' programmes créés');

        // ========== 2. CONTENUS PÉDAGOGIQUES ==========
        const contentsData = [
            { program_idx: 0, title: 'Sourate Al-Fatiha - Audio récitation', content_type: 'audio', url: 'https://example.com/fatiha.mp3' },
            { program_idx: 0, title: 'Sourate Al-Fatiha - Traduction et Tafsir', content_type: 'pdf', url: 'https://example.com/fatiha-tafsir.pdf' },
            { program_idx: 0, title: 'Les règles de base du Tajwid', content_type: 'video', url: 'https://youtube.com/watch?v=example1' },
            { program_idx: 0, title: 'Exercices de prononciation', content_type: 'pdf', url: 'https://example.com/exercices-prononciation.pdf' },
            { program_idx: 1, title: 'Juz Amma complet - Audio', content_type: 'audio', url: 'https://example.com/juz-amma.mp3' },
            { program_idx: 1, title: 'Règles de Noon Sakinah - Vidéo', content_type: 'video', url: 'https://youtube.com/watch?v=example2' },
            { program_idx: 1, title: 'Tableau des règles du Tajwid', content_type: 'pdf', url: 'https://example.com/tajwid-rules.pdf' },
            { program_idx: 2, title: 'Alphabet arabe - Poster', content_type: 'image', url: 'https://example.com/alphabet.jpg' },
            { program_idx: 2, title: 'Cahier d\'écriture arabe', content_type: 'pdf', url: 'https://example.com/cahier-ecriture.pdf' },
            { program_idx: 2, title: 'Vocabulaire de base - Flashcards', content_type: 'link', url: 'https://quizlet.com/arabic-basics' },
            { program_idx: 3, title: 'Les ablutions étape par étape', content_type: 'video', url: 'https://youtube.com/watch?v=example3' },
            { program_idx: 3, title: 'Invocations quotidiennes - Audio', content_type: 'audio', url: 'https://example.com/douas.mp3' },
            { program_idx: 3, title: 'Fiche récapitulative - Les 5 piliers', content_type: 'pdf', url: 'https://example.com/5-piliers.pdf' },
            { program_idx: 4, title: 'Frise chronologique de la Sira', content_type: 'pdf', url: 'https://example.com/sira-timeline.pdf' },
            { program_idx: 4, title: 'Documentaire - La vie du Prophète ﷺ', content_type: 'video', url: 'https://youtube.com/watch?v=example4' }
        ];

        let contentCount = 0;
        for (const content of contentsData) {
            const programId = programIds[content.program_idx];
            if (programId) {
                const [existing] = await pool.execute(
                    'SELECT id FROM school_content WHERE association_id = ? AND title = ?',
                    [associationId, content.title]
                );
                if (existing.length === 0) {
                    await pool.execute(
                        'INSERT INTO school_content (association_id, program_id, title, content_type, url, created_by) VALUES (?, ?, ?, ?, ?, ?)',
                        [associationId, programId, content.title, content.content_type, content.url, adminId]
                    );
                    contentCount++;
                }
            }
        }
        results.push('✓ ' + contentCount + ' contenus pédagogiques créés');

        // ========== 3. ANNONCES ==========
        const announcementsData = [
            {
                title: 'Rentrée des classes - Septembre 2024',
                content: 'Chers parents, nous avons le plaisir de vous informer que la rentrée de l\'école arabe aura lieu le samedi 7 septembre 2024 à 10h00. Merci de bien vouloir accompagner vos enfants pour cette première journée. Une réunion d\'information avec les enseignants suivra à 11h30.',
                priority: 'high',
                target_audience: 'all',
                is_published: true
            },
            {
                title: 'Vacances de Toussaint',
                content: 'L\'école sera fermée du 26 octobre au 3 novembre 2024 pour les vacances de Toussaint. Les cours reprendront le samedi 9 novembre. Bon repos à tous !',
                priority: 'normal',
                target_audience: 'parents',
                is_published: true
            },
            {
                title: 'Concours de récitation du Coran',
                content: 'Nous organisons un concours de récitation du Coran le dimanche 15 décembre 2024. Les inscriptions sont ouvertes jusqu\'au 1er décembre. Des prix seront remis aux meilleurs récitants de chaque niveau. Encouragez vos enfants à participer !',
                priority: 'normal',
                target_audience: 'all',
                is_published: true
            },
            {
                title: 'Rappel : Paiement des frais de scolarité',
                content: 'Chers parents, nous vous rappelons que les frais de scolarité du mois de novembre sont à régler avant le 15 du mois. Merci de régulariser votre situation si ce n\'est pas encore fait.',
                priority: 'high',
                target_audience: 'parents',
                is_published: true
            },
            {
                title: 'Journée portes ouvertes - Février 2025',
                content: 'Nous prévoyons une journée portes ouvertes le samedi 8 février 2025 pour présenter notre école aux nouvelles familles. N\'hésitez pas à en parler autour de vous !',
                priority: 'low',
                target_audience: 'all',
                is_published: false
            },
            {
                title: 'Nouveau : Cours de Tajwid avancé',
                content: 'À partir de janvier 2025, nous proposerons un nouveau cours de Tajwid avancé pour les élèves ayant terminé le Juz Amma. Les inscriptions ouvriront bientôt.',
                priority: 'normal',
                target_audience: 'parents',
                is_published: false
            }
        ];

        let announcementCount = 0;
        for (const ann of announcementsData) {
            const [existing] = await pool.execute(
                'SELECT id FROM school_announcements WHERE association_id = ? AND title = ?',
                [associationId, ann.title]
            );
            if (existing.length === 0) {
                await pool.execute(
                    'INSERT INTO school_announcements (association_id, title, content, priority, target_audience, is_published, published_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [associationId, ann.title, ann.content, ann.priority, ann.target_audience, ann.is_published, ann.is_published ? new Date() : null, adminId]
                );
                announcementCount++;
            }
        }
        results.push('✓ ' + announcementCount + ' annonces créées');

        // ========== 4. MESSAGES (Conversations prof-parents) ==========
        const messagesData = [];

        // Créer quelques conversations pour différents élèves
        for (let i = 0; i < Math.min(5, students.length); i++) {
            const student = students[i];
            const teacher = teachers[i % teachers.length];

            // Message du professeur
            messagesData.push({
                sender_type: 'teacher',
                sender_id: teacher?.id || 1,
                recipient_type: 'parent',
                recipient_id: student.id,
                student_id: student.id,
                subject: 'Progrès de ' + student.first_name,
                content: 'Assalam alaykoum, je tenais à vous informer que ' + student.first_name + ' fait de très bons progrès en mémorisation. Il/Elle a réussi à mémoriser Sourate Al-Fatiha cette semaine. Continuez à l\'encourager à la maison. Barakallahu fikum.',
                is_read: true
            });

            // Réponse du parent
            messagesData.push({
                sender_type: 'parent',
                sender_id: student.id,
                recipient_type: 'teacher',
                recipient_id: teacher?.id || 1,
                student_id: student.id,
                subject: 'Re: Progrès de ' + student.first_name,
                content: 'Wa alaykoum assalam wa rahmatullah, jazakAllahu khayran pour ce retour positif. Nous sommes très contents des progrès de ' + student.first_name + '. Nous continuerons à l\'accompagner dans sa mémorisation in sha Allah.',
                is_read: true
            });

            // Message de suivi
            if (i < 2) {
                messagesData.push({
                    sender_type: 'teacher',
                    sender_id: teacher?.id || 1,
                    recipient_type: 'parent',
                    recipient_id: student.id,
                    student_id: student.id,
                    subject: 'Absence du ' + new Date().toLocaleDateString('fr-FR'),
                    content: 'Assalam alaykoum, ' + student.first_name + ' était absent(e) au dernier cours. Est-ce que tout va bien ? Merci de nous informer de la raison de cette absence.',
                    is_read: false
                });
            }
        }

        let messageCount = 0;
        for (const msg of messagesData) {
            await pool.execute(
                'INSERT INTO school_messages (association_id, sender_type, sender_id, recipient_type, recipient_id, student_id, subject, content, is_read, read_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [associationId, msg.sender_type, msg.sender_id, msg.recipient_type, msg.recipient_id, msg.student_id, msg.subject, msg.content, msg.is_read, msg.is_read ? new Date() : null]
            );
            messageCount++;
        }
        results.push('✓ ' + messageCount + ' messages créés');

        // ========== 5. BADGES ET PROGRESSION ==========
        const badgesData = [
            { name: 'Sourate Al-Fatiha', icon: '📖', type: 'badge' },
            { name: 'Sourate Al-Ikhlas', icon: '⭐', type: 'badge' },
            { name: 'Sourate An-Nas', icon: '🌟', type: 'badge' },
            { name: 'Sourate Al-Falaq', icon: '✨', type: 'badge' },
            { name: 'Alphabet Arabe', icon: '🔤', type: 'badge' },
            { name: 'Lecture Niveau 1', icon: '📚', type: 'level' },
            { name: 'Tajwid Bases', icon: '🎯', type: 'badge' },
            { name: 'Assidu', icon: '🌙', type: 'achievement' },
            { name: 'Progrès Remarquable', icon: '📈', type: 'achievement' }
        ];

        let progressCount = 0;
        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            // Chaque élève reçoit 2-5 badges aléatoires
            const numBadges = 2 + Math.floor(Math.random() * 4);
            const shuffledBadges = [...badgesData].sort(() => Math.random() - 0.5);

            for (let j = 0; j < numBadges && j < shuffledBadges.length; j++) {
                const badge = shuffledBadges[j];
                const achievedDate = new Date();
                achievedDate.setDate(achievedDate.getDate() - Math.floor(Math.random() * 90));

                const [existing] = await pool.execute(
                    'SELECT id FROM student_progress WHERE association_id = ? AND student_id = ? AND milestone_name = ?',
                    [associationId, student.id, badge.name]
                );

                if (existing.length === 0) {
                    const teacherId = teachers[Math.floor(Math.random() * teachers.length)]?.id || null;
                    await pool.execute(
                        'INSERT INTO student_progress (association_id, student_id, milestone_type, milestone_name, milestone_icon, achieved_at, awarded_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [associationId, student.id, badge.type, badge.name, badge.icon, achievedDate.toISOString().split('T')[0], teacherId]
                    );
                    progressCount++;
                }
            }
        }
        results.push('✓ ' + progressCount + ' badges/progression créés');

        res.json({
            success: true,
            message: 'Données de démo ENT créées',
            results
        });

    } catch (error) {
        console.error('Seed ENT error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur création données ENT',
            error: error.message
        });
    }
});

// GET /api/migrate/add-topics - Ajouter les tables pour les thèmes/tags de cours
router.get('/add-topics', async (req, res) => {
    try {
        // Table des thèmes prédéfinis
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS school_topics (
                id INT PRIMARY KEY AUTO_INCREMENT,
                association_id INT,
                name_fr VARCHAR(100) NOT NULL,
                name_ar VARCHAR(100),
                color VARCHAR(20) DEFAULT '#6B8E23',
                icon VARCHAR(50),
                category ENUM('langue', 'religion', 'activite', 'autre') DEFAULT 'autre',
                is_default BOOLEAN DEFAULT FALSE,
                sort_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_association (association_id)
            )
        `);

        // Table de liaison classe-thèmes
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS class_topics (
                id INT PRIMARY KEY AUTO_INCREMENT,
                class_id INT NOT NULL,
                topic_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_class_topic (class_id, topic_id),
                INDEX idx_class (class_id),
                INDEX idx_topic (topic_id)
            )
        `);

        // Insérer les thèmes par défaut (globaux, association_id = NULL)
        const defaultTopics = [
            { name_fr: 'Alphabet arabe', name_ar: 'الأبجدية', color: '#3b82f6', category: 'langue', icon: 'alphabet' },
            { name_fr: 'Vocabulaire', name_ar: 'مفردات', color: '#8b5cf6', category: 'langue', icon: 'vocabulary' },
            { name_fr: 'Grammaire', name_ar: 'قواعد', color: '#ec4899', category: 'langue', icon: 'grammar' },
            { name_fr: 'Conjugaison', name_ar: 'تصريف أفعال', color: '#f59e0b', category: 'langue', icon: 'conjugation' },
            { name_fr: 'Compréhension écrite', name_ar: 'فهم المقروء', color: '#10b981', category: 'langue', icon: 'reading' },
            { name_fr: 'Compréhension orale', name_ar: 'فهم المسموع', color: '#14b8a6', category: 'langue', icon: 'listening' },
            { name_fr: 'Discrimination phonétique', name_ar: 'التمييز الصوتي', color: '#6366f1', category: 'langue', icon: 'phonetic' },
            { name_fr: 'Expression écrite', name_ar: 'التعبير الكتابي', color: '#0ea5e9', category: 'langue', icon: 'writing' },
            { name_fr: 'Expression orale', name_ar: 'التعبير الشفوي', color: '#06b6d4', category: 'langue', icon: 'speaking' },
            { name_fr: 'Lecture', name_ar: 'قراءة', color: '#84cc16', category: 'langue', icon: 'book' },
            { name_fr: 'Écriture', name_ar: 'كتابة', color: '#22c55e', category: 'langue', icon: 'pen' },
            { name_fr: 'Mémorisation Coran', name_ar: 'حفظ القرآن', color: '#6B8E23', category: 'religion', icon: 'quran' },
            { name_fr: 'Tajwid', name_ar: 'تجويد', color: '#4A6318', category: 'religion', icon: 'tajwid' },
            { name_fr: 'Fiqh', name_ar: 'فقه', color: '#78716c', category: 'religion', icon: 'fiqh' },
            { name_fr: 'Sira', name_ar: 'سيرة', color: '#a3a3a3', category: 'religion', icon: 'sira' },
            { name_fr: 'Douas', name_ar: 'أدعية', color: '#fbbf24', category: 'religion', icon: 'doua' },
            { name_fr: 'Jeux éducatifs', name_ar: 'ألعاب تعليمية', color: '#f472b6', category: 'activite', icon: 'games' },
            { name_fr: 'Livres numériques', name_ar: 'كتب رقمية', color: '#a78bfa', category: 'activite', icon: 'ebook' },
            { name_fr: 'Chants / Anasheed', name_ar: 'أناشيد', color: '#fb923c', category: 'activite', icon: 'music' },
            { name_fr: 'Révision', name_ar: 'مراجعة', color: '#64748b', category: 'autre', icon: 'revision' },
            { name_fr: 'Évaluation', name_ar: 'تقييم', color: '#ef4444', category: 'autre', icon: 'evaluation' }
        ];

        for (let i = 0; i < defaultTopics.length; i++) {
            const t = defaultTopics[i];
            await pool.execute(`
                INSERT INTO school_topics (association_id, name_fr, name_ar, color, category, icon, is_default, sort_order)
                VALUES (NULL, ?, ?, ?, ?, ?, TRUE, ?)
                ON DUPLICATE KEY UPDATE name_fr = VALUES(name_fr)
            `, [t.name_fr, t.name_ar, t.color, t.category, t.icon, i]);
        }

        res.json({
            success: true,
            message: 'Tables topics créées avec ' + defaultTopics.length + ' thèmes par défaut'
        });
    } catch (error) {
        console.error('Add topics error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur',
            error: error.message
        });
    }
});

// GET /api/migrate/add-teacher-flag - Ajouter le flag is_teacher aux intervenants
router.get('/add-teacher-flag', async (req, res) => {
    try {
        // Ajouter colonne is_teacher aux intervenants
        await pool.execute(`
            ALTER TABLE intervenants
            ADD COLUMN IF NOT EXISTS is_teacher BOOLEAN DEFAULT FALSE
        `).catch(() => {});

        // Mettre à jour les intervenants qui sont déjà enseignants dans des classes
        await pool.execute(`
            UPDATE intervenants i
            SET is_teacher = TRUE
            WHERE i.id IN (
                SELECT DISTINCT teacher_id FROM school_classes WHERE teacher_id IS NOT NULL
            )
        `).catch(() => {});

        res.json({
            success: true,
            message: 'Colonne is_teacher ajoutée aux intervenants'
        });
    } catch (error) {
        console.error('Add teacher flag error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur',
            error: error.message
        });
    }
});

// Route pour créer un parent test avec 2 enfants
router.get('/create-test-parent', async (req, res) => {
    try {
        const results = [];

        // Trouver une association existante
        const [associations] = await pool.execute('SELECT id, name FROM associations LIMIT 1');
        if (associations.length === 0) {
            return res.status(400).json({ success: false, message: 'Aucune association trouvée' });
        }
        const associationId = associations[0].id;
        results.push(`Association: ${associations[0].name}`);

        // Créer le parent (adhérent)
        const parentPhone = '0612345678';
        const parentEmail = 'parent.test@example.com';

        // Vérifier si le parent existe déjà
        const [existingParent] = await pool.execute(
            'SELECT id FROM adherents WHERE association_id = ? AND (email = ? OR phone = ?)',
            [associationId, parentEmail, parentPhone]
        );

        let parentId;
        if (existingParent.length > 0) {
            parentId = existingParent[0].id;
            results.push(`Parent existant trouve (ID: ${parentId})`);
        } else {
            const [parentResult] = await pool.execute(
                `INSERT INTO adherents (association_id, member_number, first_name, last_name, email, phone, status, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, 'actif', NOW())`,
                [associationId, 'PAR-TEST-001', 'Mohamed', 'Benali', parentEmail, parentPhone]
            );
            parentId = parentResult.insertId;
            results.push(`Parent cree: Mohamed Benali (ID: ${parentId})`);
        }

        // Créer les 2 enfants
        const enfants = [
            { first_name: 'Youssef', last_name: 'Benali', birth_date: '2015-03-15', level: 'intermediaire' },
            { first_name: 'Fatima', last_name: 'Benali', birth_date: '2018-07-22', level: 'debutant' }
        ];

        for (const enfant of enfants) {
            // Vérifier si l'enfant existe déjà
            const [existingChild] = await pool.execute(
                'SELECT id FROM students WHERE association_id = ? AND first_name = ? AND last_name = ? AND parent_id = ?',
                [associationId, enfant.first_name, enfant.last_name, parentId]
            );

            if (existingChild.length === 0) {
                // Générer un numéro d'élève
                const studentNumber = `ELV-TEST-${Date.now().toString().slice(-4)}`;

                await pool.execute(
                    `INSERT INTO students (association_id, student_number, first_name, last_name, birth_date, gender, parent_id, parent_relation, level, status, enrollment_date, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, 'pere', ?, 'actif', CURDATE(), NOW())`,
                    [associationId, studentNumber, enfant.first_name, enfant.last_name, enfant.birth_date, enfant.first_name === 'Fatima' ? 'F' : 'M', parentId, enfant.level]
                );
                results.push(`Enfant cree: ${enfant.first_name} ${enfant.last_name}`);
            } else {
                results.push(`Enfant existant: ${enfant.first_name} ${enfant.last_name}`);
            }
        }

        // Récupérer les enfants créés
        const [children] = await pool.execute(
            'SELECT id, first_name, last_name FROM students WHERE parent_id = ?',
            [parentId]
        );

        // Inscrire les enfants dans une classe si elle existe
        const [classes] = await pool.execute(
            'SELECT id, name FROM school_classes WHERE association_id = ? AND status = "active" LIMIT 2',
            [associationId]
        );

        for (let i = 0; i < Math.min(children.length, classes.length); i++) {
            const [existingEnrollment] = await pool.execute(
                'SELECT id FROM class_enrollments WHERE student_id = ? AND class_id = ?',
                [children[i].id, classes[i].id]
            );

            if (existingEnrollment.length === 0) {
                await pool.execute(
                    `INSERT INTO class_enrollments (association_id, student_id, class_id, enrollment_date, status)
                     VALUES (?, ?, ?, CURDATE(), 'active')`,
                    [associationId, children[i].id, classes[i].id]
                );
                results.push(`${children[i].first_name} inscrit en ${classes[i].name}`);
            }
        }

        res.json({
            success: true,
            message: 'Parent test cree avec succes',
            credentials: {
                url: '/login-parent',
                email: parentEmail,
                phone: parentPhone,
                password: parentPhone + ' (ou ' + parentEmail + ')'
            },
            results
        });
    } catch (error) {
        console.error('Create test parent error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur creation parent test',
            error: error.message
        });
    }
});

// GET /api/migrate/populate-parent-data - Remplir données test pour portail parent
router.get('/populate-parent-data', async (req, res) => {
    try {
        const results = [];

        // Find Fatima Benali (test parent)
        const [parents] = await pool.execute(`
            SELECT id, association_id FROM adherents WHERE phone = '0612345678' LIMIT 1
        `);

        if (parents.length === 0) {
            return res.status(404).json({ success: false, message: 'Parent test non trouve. Executez /create-test-parent d\'abord.' });
        }

        const parentId = parents[0].id;
        const assocId = parents[0].association_id;

        // 1. Create a teacher (intervenant)
        const [existingTeacher] = await pool.execute(`
            SELECT id FROM intervenants WHERE association_id = ? AND email = 'prof.ahmed@madrassa.fr' LIMIT 1
        `, [assocId]);

        let teacherId;
        if (existingTeacher.length === 0) {
            // First ensure is_teacher column exists
            try {
                await pool.execute(`ALTER TABLE intervenants ADD COLUMN is_teacher BOOLEAN DEFAULT FALSE`);
            } catch (e) { /* column may already exist */ }

            const [teacherResult] = await pool.execute(`
                INSERT INTO intervenants (association_id, first_name, last_name, email, phone, specialty, is_active, is_teacher)
                VALUES (?, 'Ahmed', 'Mansouri', 'prof.ahmed@madrassa.fr', '0698765432', 'Coran et Arabe', TRUE, TRUE)
            `, [assocId]);
            teacherId = teacherResult.insertId;
            results.push('✓ Enseignant Ahmed Mansouri cree');
        } else {
            teacherId = existingTeacher[0].id;
            results.push('✓ Enseignant existe deja');
        }

        // 2. Create classes
        const classesData = [
            { name: 'Coran - Niveau 1', subject: 'coran', level: 'debutant' },
            { name: 'Arabe - Alphabet', subject: 'arabe', level: 'debutant' },
            { name: 'Education Islamique', subject: 'fiqh', level: 'debutant' }
        ];

        const classIds = [];
        for (const cls of classesData) {
            const [existing] = await pool.execute(`
                SELECT id FROM school_classes WHERE association_id = ? AND name = ? LIMIT 1
            `, [assocId, cls.name]);

            if (existing.length === 0) {
                const [result] = await pool.execute(`
                    INSERT INTO school_classes (association_id, name, subject, level, teacher_id, max_capacity, academic_year, status)
                    VALUES (?, ?, ?, ?, ?, 20, '2024-2025', 'active')
                `, [assocId, cls.name, cls.subject, cls.level, teacherId]);
                classIds.push(result.insertId);
            } else {
                classIds.push(existing[0].id);
            }
        }
        results.push('✓ 3 classes creees');

        // 3. Create students (children)
        const studentsData = [
            { first_name: 'Youssef', last_name: 'Benali', birth_date: '2015-03-15', gender: 'M', level: 'debutant' },
            { first_name: 'Meryem', last_name: 'Benali', birth_date: '2017-07-22', gender: 'F', level: 'debutant' }
        ];

        const studentIds = [];
        for (let i = 0; i < studentsData.length; i++) {
            const s = studentsData[i];
            const [existing] = await pool.execute(`
                SELECT id FROM students WHERE association_id = ? AND first_name = ? AND last_name = ? LIMIT 1
            `, [assocId, s.first_name, s.last_name]);

            if (existing.length === 0) {
                const studentNumber = `ELV-2024-${String(i + 1).padStart(3, '0')}`;
                const [result] = await pool.execute(`
                    INSERT INTO students (association_id, student_number, first_name, last_name, birth_date, gender, parent_id, parent_relation, level, enrollment_date, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'mere', ?, CURDATE(), 'actif')
                `, [assocId, studentNumber, s.first_name, s.last_name, s.birth_date, s.gender, parentId, s.level]);
                studentIds.push(result.insertId);
            } else {
                studentIds.push(existing[0].id);
            }
        }
        results.push('✓ 2 enfants crees (Youssef et Meryem)');

        // 4. Enroll students in classes
        for (const studentId of studentIds) {
            for (const classId of classIds) {
                await pool.execute(`
                    INSERT IGNORE INTO class_enrollments (association_id, student_id, class_id, enrollment_date, status)
                    VALUES (?, ?, ?, CURDATE(), 'active')
                `, [assocId, studentId, classId]);
            }
        }
        results.push('✓ Inscriptions aux classes');

        // 5. Create attendance records (last 30 days)
        const attendanceStatuses = ['present', 'present', 'present', 'present', 'absent', 'present', 'present', 'excuse'];
        for (const studentId of studentIds) {
            for (const classId of classIds) {
                for (let day = 1; day <= 10; day++) {
                    const date = new Date();
                    date.setDate(date.getDate() - (day * 3));
                    const dateStr = date.toISOString().split('T')[0];
                    const status = attendanceStatuses[Math.floor(Math.random() * attendanceStatuses.length)];

                    await pool.execute(`
                        INSERT IGNORE INTO school_attendance (association_id, class_id, student_id, session_date, status)
                        VALUES (?, ?, ?, ?, ?)
                    `, [assocId, classId, studentId, dateStr, status]);
                }
            }
        }
        results.push('✓ Historique de presence');

        // 6. Create evaluations/grades
        const evaluationTypes = ['controle', 'oral', 'memorisation'];
        for (const studentId of studentIds) {
            for (let i = 0; i < classIds.length; i++) {
                const classId = classIds[i];
                for (let e = 0; e < 3; e++) {
                    const date = new Date();
                    date.setDate(date.getDate() - (e * 10 + i * 5));
                    const dateStr = date.toISOString().split('T')[0];
                    const score = Math.floor(Math.random() * 6) + 14; // 14-20
                    const type = evaluationTypes[e % evaluationTypes.length];

                    await pool.execute(`
                        INSERT INTO school_evaluations (association_id, student_id, class_id, evaluation_date, type, score, max_score, evaluated_by)
                        VALUES (?, ?, ?, ?, ?, ?, 20, ?)
                        ON DUPLICATE KEY UPDATE score = VALUES(score)
                    `, [assocId, studentId, classId, dateStr, type, score, teacherId]);
                }
            }
        }
        results.push('✓ Notes et evaluations');

        // 7. Create school fees
        const academicYear = '2024-2025';
        const months = ['Septembre', 'Octobre', 'Novembre', 'Decembre', 'Janvier', 'Fevrier'];
        for (const studentId of studentIds) {
            for (let m = 0; m < months.length; m++) {
                const feeNumber = `SCO-${academicYear.substring(2, 4)}${String(m + 1).padStart(2, '0')}-${String(studentId).padStart(4, '0')}`;
                const isPaid = m < 4; // First 4 months paid
                const dueDate = new Date(2024, 8 + m, 5);

                await pool.execute(`
                    INSERT INTO school_fees (association_id, student_id, fee_number, academic_year, period, period_label, amount, paid_amount, payment_status, due_date, paid_date, payment_method)
                    VALUES (?, ?, ?, ?, 'mensuel', ?, 50.00, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE paid_amount = VALUES(paid_amount), payment_status = VALUES(payment_status)
                `, [
                    assocId, studentId, feeNumber, academicYear, months[m] + ' 2024',
                    isPaid ? 50.00 : 0,
                    isPaid ? 'paid' : 'pending',
                    dueDate.toISOString().split('T')[0],
                    isPaid ? dueDate.toISOString().split('T')[0] : null,
                    isPaid ? 'cash' : null
                ]);
            }
        }
        results.push('✓ Frais de scolarite (4 mois payes, 2 en attente)');

        // 8. Create announcements
        const announcements = [
            { title: 'Vacances scolaires', content: 'L\'ecole sera fermee du 20 decembre au 5 janvier. Bonnes fetes a tous!', days_ago: 2 },
            { title: 'Reunion parents-professeurs', content: 'Une reunion est prevue le samedi 15 fevrier a 14h. Votre presence est souhaitee.', days_ago: 5 },
            { title: 'Concours de recitation', content: 'Un concours de recitation du Coran aura lieu le 1er mars. Inscriptions ouvertes!', days_ago: 10 }
        ];

        for (const ann of announcements) {
            const pubDate = new Date();
            pubDate.setDate(pubDate.getDate() - ann.days_ago);
            const pubDateStr = pubDate.toISOString().slice(0, 19).replace('T', ' ');

            // Check if announcement already exists
            const [existing] = await pool.execute(`
                SELECT id FROM school_announcements WHERE association_id = ? AND title = ? LIMIT 1
            `, [assocId, ann.title]);

            if (existing.length === 0) {
                await pool.execute(`
                    INSERT INTO school_announcements (association_id, title, content, target_audience, is_published, published_at, priority)
                    VALUES (?, ?, ?, 'parents', TRUE, ?, 'normal')
                `, [assocId, ann.title, ann.content, pubDateStr]);
            }
        }
        results.push('✓ 3 annonces creees');

        // 9. Create messages between teacher and parent
        const messages = [
            { from: 'teacher', content: 'Bonjour Mme Benali, Youssef progresse tres bien en memorisation du Coran. Felicitations!', days_ago: 3 },
            { from: 'parent', content: 'Merci beaucoup pour ce retour encourageant. Il travaille dur a la maison aussi.', days_ago: 3 },
            { from: 'teacher', content: 'Meryem a eu du mal avec la derniere lecon d\'arabe. Pourriez-vous revoir avec elle les lettres solaires?', days_ago: 7 },
            { from: 'parent', content: 'D\'accord, nous allons travailler cela ce weekend. Merci de m\'avoir prevenue.', days_ago: 6 },
            { from: 'teacher', content: 'Rappel: les photos de classe seront prises samedi prochain.', days_ago: 1 }
        ];

        // Check if school_messages table exists, create if not
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS school_messages (
                id INT PRIMARY KEY AUTO_INCREMENT,
                association_id INT NOT NULL,
                student_id INT NOT NULL,
                sender_type ENUM('teacher', 'parent') NOT NULL,
                sender_id INT NOT NULL,
                content TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        for (const msg of messages) {
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - msg.days_ago);
            const createdAtStr = createdAt.toISOString().slice(0, 19).replace('T', ' ');
            const senderId = msg.from === 'teacher' ? teacherId : parentId;

            await pool.execute(`
                INSERT INTO school_messages (association_id, student_id, sender_type, sender_id, content, is_read, created_at)
                VALUES (?, ?, ?, ?, ?, TRUE, ?)
            `, [assocId, studentIds[0], msg.from, senderId, msg.content, createdAtStr]);
        }
        results.push('✓ Messages parent-professeur');

        res.json({
            success: true,
            message: 'Donnees de test creees avec succes',
            results,
            summary: {
                parent: 'Fatima Benali (0612345678)',
                children: ['Youssef Benali', 'Meryem Benali'],
                classes: classesData.map(c => c.name),
                teacher: 'Ahmed Mansouri'
            }
        });

    } catch (error) {
        console.error('Populate parent data error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur population donnees',
            error: error.message
        });
    }
});

module.exports = router;
