const { pool } = require('../config/db');

class CotisationModel {
    static async findAll(filters = {}) {
        let query = `
            SELECT c.*,
                   a.first_name, a.last_name, a.member_number, a.email
            FROM cotisations c
            JOIN adherents a ON c.adherent_id = a.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.adherent_id) {
            query += ' AND c.adherent_id = ?';
            params.push(filters.adherent_id);
        }

        if (filters.season) {
            query += ' AND c.season = ?';
            params.push(filters.season);
        }

        if (filters.payment_status) {
            query += ' AND c.payment_status = ?';
            params.push(filters.payment_status);
        }

        if (filters.overdue) {
            query += ' AND c.payment_status != "paid" AND c.due_date < CURDATE()';
        }

        query += ' ORDER BY c.created_at DESC';

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(parseInt(filters.limit));
            if (filters.offset) {
                query += ' OFFSET ?';
                params.push(parseInt(filters.offset));
            }
        }

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT c.*,
                    a.first_name, a.last_name, a.member_number, a.email
             FROM cotisations c
             JOIN adherents a ON c.adherent_id = a.id
             WHERE c.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async findByAdherent(adherentId) {
        const [rows] = await pool.execute(
            'SELECT * FROM cotisations WHERE adherent_id = ? ORDER BY season DESC',
            [adherentId]
        );
        return rows;
    }

    static async create(data) {
        const invoiceNumber = await this.generateInvoiceNumber();

        const [result] = await pool.execute(
            `INSERT INTO cotisations (
                adherent_id, season, amount, amount_paid, payment_method,
                payment_status, due_date, paid_date, invoice_number, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.adherent_id,
                data.season,
                data.amount,
                data.amount_paid || 0,
                data.payment_method || null,
                data.payment_status || 'pending',
                data.due_date || null,
                data.paid_date || null,
                invoiceNumber,
                data.notes || null
            ]
        );

        return { id: result.insertId, invoice_number: invoiceNumber };
    }

    static async update(id, data) {
        const fields = [];
        const values = [];

        const allowedFields = [
            'amount', 'amount_paid', 'payment_method', 'payment_status',
            'due_date', 'paid_date', 'notes'
        ];

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
            `UPDATE cotisations SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    static async registerPayment(id, amount, method) {
        const cotisation = await this.findById(id);
        if (!cotisation) return null;

        const newAmountPaid = parseFloat(cotisation.amount_paid) + parseFloat(amount);
        let newStatus = 'partial';
        let paidDate = null;

        if (newAmountPaid >= parseFloat(cotisation.amount)) {
            newStatus = 'paid';
            paidDate = new Date();
        }

        await pool.execute(
            `UPDATE cotisations SET
                amount_paid = ?,
                payment_status = ?,
                payment_method = ?,
                paid_date = ?
             WHERE id = ?`,
            [newAmountPaid, newStatus, method, paidDate, id]
        );

        return { amount_paid: newAmountPaid, payment_status: newStatus };
    }

    static async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM cotisations WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    static async getStats(season = null) {
        let query = `
            SELECT
                COUNT(*) as total,
                SUM(amount) as total_amount,
                SUM(amount_paid) as total_paid,
                SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_count,
                SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                SUM(CASE WHEN payment_status = 'partial' THEN 1 ELSE 0 END) as partial_count,
                SUM(CASE WHEN payment_status = 'overdue' THEN 1 ELSE 0 END) as overdue_count
            FROM cotisations
        `;
        const params = [];

        if (season) {
            query += ' WHERE season = ?';
            params.push(season);
        }

        const [rows] = await pool.execute(query, params);
        return rows[0];
    }

    static async getOverdue() {
        const [rows] = await pool.execute(`
            SELECT c.*, a.first_name, a.last_name, a.email, a.phone
            FROM cotisations c
            JOIN adherents a ON c.adherent_id = a.id
            WHERE c.payment_status NOT IN ('paid', 'cancelled')
            AND c.due_date < CURDATE()
            ORDER BY c.due_date ASC
        `);
        return rows;
    }

    static async generateInvoiceNumber() {
        const year = new Date().getFullYear();
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const [rows] = await pool.execute(
            `SELECT COUNT(*) as count FROM cotisations WHERE invoice_number LIKE ?`,
            [`FAC-${year}${month}-%`]
        );
        const nextNumber = (rows[0].count + 1).toString().padStart(4, '0');
        return `FAC-${year}${month}-${nextNumber}`;
    }

    static async addRelance(cotisationId, type, content) {
        const [lastRelance] = await pool.execute(
            'SELECT MAX(relance_number) as max_num FROM relances WHERE cotisation_id = ?',
            [cotisationId]
        );
        const relanceNumber = (lastRelance[0].max_num || 0) + 1;

        const [result] = await pool.execute(
            `INSERT INTO relances (cotisation_id, relance_type, relance_number, content)
             VALUES (?, ?, ?, ?)`,
            [cotisationId, type, relanceNumber, content]
        );
        return result.insertId;
    }

    static async getRelances(cotisationId) {
        const [rows] = await pool.execute(
            'SELECT * FROM relances WHERE cotisation_id = ? ORDER BY sent_at DESC',
            [cotisationId]
        );
        return rows;
    }
}

module.exports = CotisationModel;
