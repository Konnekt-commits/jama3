const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

class UserModel {
    static async findAll() {
        const [rows] = await pool.execute(
            'SELECT id, email, role, first_name, last_name, avatar_url, is_active, last_login, created_at FROM users ORDER BY last_name, first_name'
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT id, email, role, first_name, last_name, avatar_url, is_active, last_login, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    static async create(data) {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const [result] = await pool.execute(
            `INSERT INTO users (email, password, role, first_name, last_name, avatar_url, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                data.email,
                hashedPassword,
                data.role || 'gestionnaire',
                data.first_name,
                data.last_name,
                data.avatar_url || null,
                data.is_active !== undefined ? data.is_active : true
            ]
        );

        return result.insertId;
    }

    static async update(id, data) {
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
        const [result] = await pool.execute(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    static async updatePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const [result] = await pool.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );
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

    static async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM users WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    static async deactivate(id) {
        return this.update(id, { is_active: false });
    }

    static async activate(id) {
        return this.update(id, { is_active: true });
    }
}

module.exports = UserModel;
