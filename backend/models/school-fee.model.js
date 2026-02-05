const pool = require('../config/db');

class SchoolFeeModel {
    static async findAll(associationId, filters = {}) {
        let query = `
            SELECT sf.*,
                   s.first_name, s.last_name, s.student_number,
                   CONCAT(a.first_name, ' ', a.last_name) as parent_name
            FROM school_fees sf
            JOIN students s ON sf.student_id = s.id
            LEFT JOIN adherents a ON s.parent_id = a.id
            WHERE sf.association_id = ?
        `;
        const params = [associationId];

        if (filters.payment_status) {
            query += ' AND sf.payment_status = ?';
            params.push(filters.payment_status);
        }

        if (filters.student_id) {
            query += ' AND sf.student_id = ?';
            params.push(filters.student_id);
        }

        if (filters.academic_year) {
            query += ' AND sf.academic_year = ?';
            params.push(filters.academic_year);
        }

        if (filters.period) {
            query += ' AND sf.period = ?';
            params.push(filters.period);
        }

        if (filters.search) {
            query += ' AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_number LIKE ? OR sf.fee_number LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY sf.due_date DESC, sf.created_at DESC';

        if (filters.limit) {
            const limit = parseInt(filters.limit, 10);
            query += ` LIMIT ${limit}`;
            if (filters.offset) {
                const offset = parseInt(filters.offset, 10);
                query += ` OFFSET ${offset}`;
            }
        }

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async findById(id, associationId) {
        const [rows] = await pool.execute(`
            SELECT sf.*,
                   s.first_name, s.last_name, s.student_number,
                   CONCAT(a.first_name, ' ', a.last_name) as parent_name,
                   a.email as parent_email, a.phone as parent_phone
            FROM school_fees sf
            JOIN students s ON sf.student_id = s.id
            LEFT JOIN adherents a ON s.parent_id = a.id
            WHERE sf.id = ? AND sf.association_id = ?
        `, [id, associationId]);
        return rows[0];
    }

    static async create(associationId, data) {
        const feeNumber = await this.generateFeeNumber(associationId);

        const [result] = await pool.execute(
            `INSERT INTO school_fees (
                association_id, student_id, fee_number, academic_year, period,
                period_label, amount, paid_amount, payment_status, due_date,
                paid_date, payment_method, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                associationId,
                data.student_id,
                feeNumber,
                data.academic_year || this.getCurrentAcademicYear(),
                data.period || 'mensuel',
                data.period_label || null,
                data.amount,
                data.paid_amount || 0,
                data.payment_status || 'pending',
                data.due_date || null,
                data.paid_date || null,
                data.payment_method || null,
                data.notes || null
            ]
        );

        return { id: result.insertId, fee_number: feeNumber };
    }

    static async update(id, associationId, data) {
        const fields = [];
        const values = [];

        const allowedFields = [
            'academic_year', 'period', 'period_label', 'amount', 'paid_amount',
            'payment_status', 'due_date', 'paid_date', 'payment_method', 'notes'
        ];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (fields.length === 0) return false;

        values.push(id, associationId);
        const [result] = await pool.execute(
            `UPDATE school_fees SET ${fields.join(', ')} WHERE id = ? AND association_id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    static async delete(id, associationId) {
        const [result] = await pool.execute(
            'DELETE FROM school_fees WHERE id = ? AND association_id = ?',
            [id, associationId]
        );
        return result.affectedRows > 0;
    }

    static async markAsPaid(id, associationId, paymentMethod = 'cash') {
        const fee = await this.findById(id, associationId);
        if (!fee) return false;

        return this.update(id, associationId, {
            paid_amount: fee.amount,
            payment_status: 'paid',
            paid_date: new Date().toISOString().split('T')[0],
            payment_method: paymentMethod
        });
    }

    static async recordPartialPayment(id, associationId, amount, paymentMethod = 'cash') {
        const fee = await this.findById(id, associationId);
        if (!fee) return false;

        const newPaidAmount = parseFloat(fee.paid_amount) + parseFloat(amount);
        const newStatus = newPaidAmount >= fee.amount ? 'paid' : 'partial';

        return this.update(id, associationId, {
            paid_amount: newPaidAmount,
            payment_status: newStatus,
            paid_date: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null,
            payment_method: paymentMethod
        });
    }

    static async getStats(associationId, academicYear = null) {
        let query = `
            SELECT
                COUNT(*) as total_fees,
                COALESCE(SUM(amount), 0) as total_amount,
                COALESCE(SUM(paid_amount), 0) as total_paid,
                SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                SUM(CASE WHEN payment_status = 'partial' THEN 1 ELSE 0 END) as partial_count,
                SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_count,
                SUM(CASE WHEN payment_status = 'overdue' THEN 1 ELSE 0 END) as overdue_count
            FROM school_fees
            WHERE association_id = ?
        `;
        const params = [associationId];

        if (academicYear) {
            query += ' AND academic_year = ?';
            params.push(academicYear);
        }

        const [rows] = await pool.execute(query, params);
        return rows[0];
    }

    static async generateBatchFees(associationId, data) {
        const { student_ids, academic_year, period, period_label, amount, due_date } = data;
        const results = [];

        for (const studentId of student_ids) {
            try {
                const result = await this.create(associationId, {
                    student_id: studentId,
                    academic_year,
                    period,
                    period_label,
                    amount,
                    due_date
                });
                results.push({ student_id: studentId, success: true, fee_id: result.id });
            } catch (error) {
                results.push({ student_id: studentId, success: false, error: error.message });
            }
        }

        return results;
    }

    static async generateFeeNumber(associationId) {
        const now = new Date();
        const yearMonth = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}`;
        const [rows] = await pool.execute(
            `SELECT COUNT(*) as count FROM school_fees WHERE association_id = ? AND fee_number LIKE ?`,
            [associationId, `SCO-${yearMonth}-%`]
        );
        const nextNumber = (rows[0].count + 1).toString().padStart(4, '0');
        return `SCO-${yearMonth}-${nextNumber}`;
    }

    static getCurrentAcademicYear() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        if (month >= 9) {
            return `${year}-${year + 1}`;
        }
        return `${year - 1}-${year}`;
    }

    static async updateOverdueStatus(associationId = null) {
        let query = `
            UPDATE school_fees
            SET payment_status = 'overdue'
            WHERE payment_status IN ('pending', 'partial')
            AND due_date < CURDATE()
        `;
        const params = [];

        if (associationId) {
            query += ' AND association_id = ?';
            params.push(associationId);
        }

        const [result] = await pool.execute(query, params);
        return result.affectedRows;
    }
}

module.exports = SchoolFeeModel;
