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

module.exports = router;
