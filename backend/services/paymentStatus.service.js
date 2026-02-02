const { pool } = require('../config/db');

class PaymentStatusService {
    static async updateOverdueStatus() {
        try {
            const [result] = await pool.execute(`
                UPDATE cotisations
                SET payment_status = 'overdue'
                WHERE payment_status IN ('pending', 'partial')
                AND due_date < CURDATE()
            `);

            console.log(`[PaymentStatus] ${result.affectedRows} cotisation(s) marquée(s) en retard`);
            return result.affectedRows;
        } catch (error) {
            console.error('[PaymentStatus] Erreur:', error);
            throw error;
        }
    }

    static async getPaymentSummary() {
        try {
            const [rows] = await pool.execute(`
                SELECT
                    c.payment_status,
                    COUNT(*) as count,
                    SUM(c.amount) as total_amount,
                    SUM(c.amount_paid) as total_paid,
                    SUM(c.amount - c.amount_paid) as total_remaining
                FROM cotisations c
                GROUP BY c.payment_status
            `);

            return rows;
        } catch (error) {
            console.error('[PaymentStatus] Erreur getSummary:', error);
            throw error;
        }
    }

    static async getAdherentsWithOverdue() {
        try {
            const [rows] = await pool.execute(`
                SELECT
                    a.id,
                    a.first_name,
                    a.last_name,
                    a.email,
                    a.phone,
                    COUNT(c.id) as overdue_count,
                    SUM(c.amount - c.amount_paid) as total_overdue
                FROM adherents a
                JOIN cotisations c ON a.id = c.adherent_id
                WHERE c.payment_status = 'overdue'
                GROUP BY a.id
                ORDER BY total_overdue DESC
            `);

            return rows;
        } catch (error) {
            console.error('[PaymentStatus] Erreur getAdherentsWithOverdue:', error);
            throw error;
        }
    }

    static async calculatePaymentRate(season = null) {
        try {
            let query = `
                SELECT
                    COUNT(*) as total,
                    SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid,
                    SUM(amount) as total_amount,
                    SUM(amount_paid) as collected_amount
                FROM cotisations
            `;

            const params = [];
            if (season) {
                query += ' WHERE season = ?';
                params.push(season);
            }

            const [rows] = await pool.execute(query, params);
            const data = rows[0];

            return {
                total_cotisations: data.total,
                paid_cotisations: data.paid,
                payment_rate: data.total > 0 ? ((data.paid / data.total) * 100).toFixed(2) : 0,
                collection_rate: data.total_amount > 0 ? ((data.collected_amount / data.total_amount) * 100).toFixed(2) : 0,
                total_amount: data.total_amount,
                collected_amount: data.collected_amount,
                remaining_amount: data.total_amount - data.collected_amount
            };
        } catch (error) {
            console.error('[PaymentStatus] Erreur calculatePaymentRate:', error);
            throw error;
        }
    }
}

module.exports = PaymentStatusService;
