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

        res.json({
            success: true,
            data: {
                users,
                associations,
                adherents
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

module.exports = router;
