-- =============================================
-- Schema Base de Données - Gestion Adhérents Association
-- =============================================

CREATE DATABASE IF NOT EXISTS association_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE association_db;

-- =============================================
-- Table: users (Authentification)
-- =============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'gestionnaire', 'intervenant') DEFAULT 'gestionnaire',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- Table: adherents (Fiches adhérents)
-- =============================================
CREATE TABLE adherents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    member_number VARCHAR(20) UNIQUE,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_name (last_name, first_name)
);

-- =============================================
-- Table: cotisations (Cotisations et paiements)
-- =============================================
CREATE TABLE cotisations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    adherent_id INT NOT NULL,
    season VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    payment_method ENUM('especes', 'cheque', 'cb', 'virement', 'prelevement') DEFAULT NULL,
    payment_status ENUM('pending', 'partial', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
    due_date DATE,
    paid_date DATE,
    invoice_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (adherent_id) REFERENCES adherents(id) ON DELETE CASCADE,
    INDEX idx_adherent (adherent_id),
    INDEX idx_status (payment_status),
    INDEX idx_season (season)
);

-- =============================================
-- Table: intervenants (Profils intervenants)
-- =============================================
CREATE TABLE intervenants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    speciality VARCHAR(200),
    bio TEXT,
    photo_url VARCHAR(500),
    hourly_rate DECIMAL(10,2),
    contract_type ENUM('salarie', 'benevole', 'freelance', 'stagiaire') DEFAULT 'benevole',
    status ENUM('actif', 'inactif') DEFAULT 'actif',
    availability JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status)
);

-- =============================================
-- Table: events (Événements/Agenda)
-- =============================================
CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type ENUM('cours', 'atelier', 'reunion', 'sortie', 'competition', 'autre') DEFAULT 'cours',
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    location VARCHAR(255),
    max_participants INT,
    current_participants INT DEFAULT 0,
    intervenant_id INT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule VARCHAR(100),
    color VARCHAR(7) DEFAULT '#3B82F6',
    status ENUM('scheduled', 'cancelled', 'completed') DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (intervenant_id) REFERENCES intervenants(id) ON DELETE SET NULL,
    INDEX idx_datetime (start_datetime, end_datetime),
    INDEX idx_status (status)
);

-- =============================================
-- Table: event_participants (Inscriptions événements)
-- =============================================
CREATE TABLE event_participants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    adherent_id INT NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attendance_status ENUM('registered', 'present', 'absent', 'excused') DEFAULT 'registered',
    notes TEXT,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (adherent_id) REFERENCES adherents(id) ON DELETE CASCADE,
    UNIQUE KEY unique_participation (event_id, adherent_id),
    INDEX idx_event (event_id),
    INDEX idx_adherent (adherent_id)
);

-- =============================================
-- Table: adherent_activities (Suivi programmes)
-- =============================================
CREATE TABLE adherent_activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    adherent_id INT NOT NULL,
    activity_name VARCHAR(200) NOT NULL,
    level ENUM('debutant', 'intermediaire', 'avance', 'expert') DEFAULT 'debutant',
    start_date DATE,
    end_date DATE,
    schedule JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (adherent_id) REFERENCES adherents(id) ON DELETE CASCADE,
    INDEX idx_adherent (adherent_id)
);

-- =============================================
-- Table: messages (Messagerie interne)
-- =============================================
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    recipient_type ENUM('user', 'adherent', 'group', 'all') NOT NULL,
    recipient_id INT,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    message_type ENUM('info', 'reminder', 'alert', 'newsletter') DEFAULT 'info',
    channel ENUM('app', 'email', 'sms') DEFAULT 'app',
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_recipient (recipient_type, recipient_id),
    INDEX idx_read (is_read)
);

-- =============================================
-- Table: relances (Historique relances)
-- =============================================
CREATE TABLE relances (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cotisation_id INT NOT NULL,
    relance_type ENUM('email', 'sms', 'courrier') DEFAULT 'email',
    relance_number INT DEFAULT 1,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    content TEXT,
    FOREIGN KEY (cotisation_id) REFERENCES cotisations(id) ON DELETE CASCADE,
    INDEX idx_cotisation (cotisation_id)
);

-- =============================================
-- Données initiales
-- =============================================

-- Admin par défaut (password: admin123)
INSERT INTO users (email, password, role, first_name, last_name) VALUES
('admin@association.fr', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Admin', 'Association');

-- Quelques adhérents de test
INSERT INTO adherents (member_number, first_name, last_name, email, phone, birth_date, address, city, postal_code, status, membership_start) VALUES
('ADH-2024-001', 'Marie', 'Dupont', 'marie.dupont@email.com', '0612345678', '1990-05-15', '12 Rue des Lilas', 'Paris', '75001', 'actif', '2024-09-01'),
('ADH-2024-002', 'Jean', 'Martin', 'jean.martin@email.com', '0623456789', '1985-08-22', '45 Avenue Victor Hugo', 'Lyon', '69001', 'actif', '2024-09-01'),
('ADH-2024-003', 'Sophie', 'Bernard', 'sophie.bernard@email.com', '0634567890', '1995-12-03', '8 Boulevard Gambetta', 'Marseille', '13001', 'actif', '2024-09-15');

-- Intervenants de test
INSERT INTO intervenants (first_name, last_name, email, phone, speciality, contract_type, status) VALUES
('Pierre', 'Durand', 'pierre.durand@email.com', '0645678901', 'Yoga & Méditation', 'freelance', 'actif'),
('Claire', 'Moreau', 'claire.moreau@email.com', '0656789012', 'Arts plastiques', 'benevole', 'actif');

-- Cotisations de test
INSERT INTO cotisations (adherent_id, season, amount, amount_paid, payment_status, due_date) VALUES
(1, '2024-2025', 150.00, 150.00, 'paid', '2024-10-01'),
(2, '2024-2025', 150.00, 75.00, 'partial', '2024-10-01'),
(3, '2024-2025', 150.00, 0, 'pending', '2024-10-15');

-- Événements de test
INSERT INTO events (title, description, event_type, start_datetime, end_datetime, location, max_participants, intervenant_id, color) VALUES
('Cours de Yoga', 'Séance hebdomadaire de yoga tous niveaux', 'cours', '2024-10-07 10:00:00', '2024-10-07 11:30:00', 'Salle A', 15, 1, '#10B981'),
('Atelier Peinture', 'Initiation à l\'aquarelle', 'atelier', '2024-10-09 14:00:00', '2024-10-09 17:00:00', 'Salle B', 10, 2, '#8B5CF6'),
('Réunion Bureau', 'Réunion mensuelle du bureau', 'reunion', '2024-10-12 18:00:00', '2024-10-12 20:00:00', 'Salle de réunion', 8, NULL, '#F59E0B');
