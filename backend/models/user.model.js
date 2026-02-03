const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class UserModel {
    // Récupérer tous les utilisateurs d'une association
    static async findAll(associationId) {
        const [rows] = await pool.execute(
            `SELECT id, association_id, email, role, first_name, last_name, avatar_url, is_active, is_owner, last_login, created_at
             FROM users
             WHERE association_id = ?
             ORDER BY last_name, first_name`,
            [associationId]
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT id, association_id, email, role, first_name, last_name, avatar_url, is_active, is_owner, last_login, created_at
             FROM users WHERE id = ?`,
            [id]
        );
        return rows[0];
    }

    // Trouver par email dans une association spécifique
    static async findByEmailInAssociation(email, associationId) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ? AND association_id = ?',
            [email, associationId]
        );
        return rows[0];
    }

    // Trouver par email globalement (pour vérifier les doublons cross-association)
    static async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows;
    }

    // Trouver un utilisateur par email avec son association (pour le login)
    static async findByEmailWithAssociation(email) {
        const [rows] = await pool.execute(
            `SELECT u.*, a.name as association_name, a.slug as association_slug, a.is_active as association_active
             FROM users u
             JOIN associations a ON u.association_id = a.id
             WHERE u.email = ?`,
            [email]
        );
        return rows;
    }

    static async create(data) {
        // Si le password est déjà hashé (passé depuis le controller), ne pas re-hasher
        const password = data.password.startsWith('$2a$') || data.password.startsWith('$2b$')
            ? data.password
            : await bcrypt.hash(data.password, 10);

        const [result] = await pool.execute(
            `INSERT INTO users (association_id, email, password, role, first_name, last_name, avatar_url, is_active, is_owner)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.association_id,
                data.email,
                password,
                data.role || 'gestionnaire',
                data.first_name,
                data.last_name,
                data.avatar_url || null,
                data.is_active !== undefined ? data.is_active : true,
                data.is_owner || false
            ]
        );

        return result.insertId;
    }

    static async update(id, data, associationId = null) {
        const fields = [];
        const values = [];

        const allowedFields = ['email', 'role', 'first_name', 'last_name', 'avatar_url', 'is_active'];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (fields.length === 0) {
            return false;
        }

        values.push(id);

        // Si associationId fourni, vérifier que l'utilisateur appartient à cette association
        let query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        if (associationId) {
            query += ' AND association_id = ?';
            values.push(associationId);
        }

        const [result] = await pool.execute(query, values);
        return result.affectedRows > 0;
    }

    static async updatePassword(id, newPassword, associationId = null) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        let query = 'UPDATE users SET password = ? WHERE id = ?';
        const values = [hashedPassword, id];

        if (associationId) {
            query += ' AND association_id = ?';
            values.push(associationId);
        }

        const [result] = await pool.execute(query, values);
        return result.affectedRows > 0;
    }

    static async updateLastLogin(id) {
        await pool.execute(
            'UPDATE users SET last_login = NOW() WHERE id = ?',
            [id]
        );
    }

    static async verifyPassword(user, password) {
        return bcrypt.compare(password, user.password);
    }

    static async delete(id, associationId = null) {
        let query = 'DELETE FROM users WHERE id = ?';
        const values = [id];

        if (associationId) {
            query += ' AND association_id = ?';
            values.push(associationId);
        }

        const [result] = await pool.execute(query, values);
        return result.affectedRows > 0;
    }

    static async deactivate(id, associationId = null) {
        return this.update(id, { is_active: false }, associationId);
    }

    static async activate(id, associationId = null) {
        return this.update(id, { is_active: true }, associationId);
    }

    // Compter les utilisateurs d'une association
    static async countByAssociation(associationId) {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as count FROM users WHERE association_id = ? AND is_active = TRUE',
            [associationId]
        );
        return rows[0].count;
    }
}

module.exports = UserModel;
