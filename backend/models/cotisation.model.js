const pool = require('../config/db');

class CotisationModel {
    static async findAll(associationId, filters = {}) {
        let query = `
            SELECT c.*,
                   a.first_name, a.last_name, a.member_number, a.email
            FROM cotisations c
            JOIN adherents a ON c.adherent_id = a.id
            WHERE c.association_id = ?
        `;
        const params = [associationId];

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

    static async findById(id, associationId) {
        const [rows] = await pool.execute(
            `SELECT c.*,
                    a.first_name, a.last_name, a.member_number, a.email
             FROM cotisations c
             JOIN adherents a ON c.adherent_id = a.id
             WHERE c.id = ? AND c.association_id = ?`,
            [id, associationId]
        );
        return rows[0];
    }

    static async findByAdherent(adherentId, associationId) {
        const [rows] = await pool.execute(
            'SELECT * FROM cotisations WHERE adherent_id = ? AND association_id = ? ORDER BY season DESC',
            [adherentId, associationId]
        );
        return rows;
    }

    static async create(associationId, data) {
        const invoiceNumber = await this.generateInvoiceNumber(associationId);

        const [result] = await pool.execute(
            `INSERT INTO cotisations (
                association_id, adherent_id, season, amount, amount_paid, payment_method,
                payment_status, due_date, paid_date, invoice_number, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                associationId,
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

    static async update(id, associationId, data) {
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

        values.push(id, associationId);
        const [result] = await pool.execute(
            `UPDATE cotisations SET ${fields.join(', ')} WHERE id = ? AND association_id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    static async registerPayment(id, associationId, amount, method) {
        const cotisation = await this.findById(id, associationId);
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
             WHERE id = ? AND association_id = ?`,
            [newAmountPaid, newStatus, method, paidDate, id, associationId]
        );

        return { amount_paid: newAmountPaid, payment_status: newStatus };
    }

    static async delete(id, associationId) {
        const [result] = await pool.execute(
            'DELETE FROM cotisations WHERE id = ? AND association_id = ?',
            [id, associationId]
        );
        return result.affectedRows > 0;
    }

    static async getStats(associationId, season = null) {
        let query = `
            SELECT
                COUNT(*) as total,
                COALESCE(SUM(amount), 0) as total_amount,
                COALESCE(SUM(amount_paid), 0) as total_paid,
                SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_count,
                SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                SUM(CASE WHEN payment_status = 'partial' THEN 1 ELSE 0 END) as partial_count,
                SUM(CASE WHEN payment_status = 'overdue' THEN 1 ELSE 0 END) as overdue_count
            FROM cotisations
            WHERE association_id = ?
        `;
        const params = [associationId];

        if (season) {
            query += ' AND season = ?';
            params.push(season);
        }

        const [rows] = await pool.execute(query, params);
        return rows[0];
    }

    static async getOverdue(associationId) {
        const [rows] = await pool.execute(`
            SELECT c.*, a.first_name, a.last_name, a.email, a.phone
            FROM cotisations c
            JOIN adherents a ON c.adherent_id = a.id
            WHERE c.association_id = ?
            AND c.payment_status NOT IN ('paid', 'cancelled')
            AND c.due_date < CURDATE()
            ORDER BY c.due_date ASC
        `, [associationId]);
        return rows;
    }

    static async generateInvoiceNumber(associationId) {
        const year = new Date().getFullYear();
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const [rows] = await pool.execute(
            `SELECT COUNT(*) as count FROM cotisations WHERE association_id = ? AND invoice_number LIKE ?`,
            [associationId, `FAC-${year}${month}-%`]
        );
        const nextNumber = (rows[0].count + 1).toString().padStart(4, '0');
        return `FAC-${year}${month}-${nextNumber}`;
    }

    static async addRelance(associationId, cotisationId, type, content) {
        const [lastRelance] = await pool.execute(
            'SELECT MAX(relance_number) as max_num FROM relances WHERE cotisation_id = ? AND association_id = ?',
            [cotisationId, associationId]
        );
        const relanceNumber = (lastRelance[0].max_num || 0) + 1;

        const [result] = await pool.execute(
            `INSERT INTO relances (association_id, cotisation_id, relance_type, relance_number, content)
             VALUES (?, ?, ?, ?, ?)`,
            [associationId, cotisationId, type, relanceNumber, content]
        );
        return result.insertId;
    }

    static async getRelances(cotisationId, associationId) {
        const [rows] = await pool.execute(
            'SELECT * FROM relances WHERE cotisation_id = ? AND association_id = ? ORDER BY sent_at DESC',
            [cotisationId, associationId]
        );
        return rows;
    }
}

module.exports = CotisationModel;
