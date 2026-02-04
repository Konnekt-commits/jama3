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
                emergency_contact VARCHAR(20),
                emergency_name VARCHAR(100),
                level ENUM('debutant', 'intermediaire', 'avance') DEFAULT 'debutant',
                enrollment_date DATE,
                status ENUM('actif', 'inactif', 'diplome', 'transfere') DEFAULT 'actif',
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

module.exports = router;
