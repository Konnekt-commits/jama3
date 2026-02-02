const { pool } = require('../config/db');
const NotificationService = require('./notification.service');

class RelanceAutoService {
    static async processAutoRelances() {
        try {
            const cotisationsToRelance = await this.getCotisationsForRelance();

            console.log(`[RelanceAuto] ${cotisationsToRelance.length} cotisation(s) à relancer`);

            for (const cotisation of cotisationsToRelance) {
                await this.sendRelance(cotisation);
            }

            return cotisationsToRelance.length;
        } catch (error) {
            console.error('[RelanceAuto] Erreur:', error);
            throw error;
        }
    }

    static async getCotisationsForRelance() {
        const [rows] = await pool.execute(`
            SELECT
                c.*,
                a.first_name,
                a.last_name,
                a.email,
                a.phone,
                (SELECT MAX(sent_at) FROM relances WHERE cotisation_id = c.id) as last_relance_date,
                (SELECT COUNT(*) FROM relances WHERE cotisation_id = c.id) as relance_count
            FROM cotisations c
            JOIN adherents a ON c.adherent_id = a.id
            WHERE c.payment_status IN ('pending', 'partial', 'overdue')
            AND c.due_date < CURDATE()
            AND a.status = 'actif'
            HAVING last_relance_date IS NULL OR last_relance_date < DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY c.due_date ASC
        `);

        return rows;
    }

    static async sendRelance(cotisation) {
        try {
            const relanceNumber = (cotisation.relance_count || 0) + 1;
            const remainingAmount = parseFloat(cotisation.amount) - parseFloat(cotisation.amount_paid);

            const content = this.generateRelanceContent(cotisation, relanceNumber, remainingAmount);

            await pool.execute(
                `INSERT INTO relances (cotisation_id, relance_type, relance_number, content)
                 VALUES (?, 'email', ?, ?)`,
                [cotisation.id, relanceNumber, content]
            );

            if (cotisation.email) {
                await NotificationService.sendEmail(
                    cotisation.email,
                    `Rappel cotisation - Relance n°${relanceNumber}`,
                    content
                );
            }

            console.log(`[RelanceAuto] Relance n°${relanceNumber} envoyée pour cotisation #${cotisation.id}`);

            return true;
        } catch (error) {
            console.error(`[RelanceAuto] Erreur envoi relance cotisation #${cotisation.id}:`, error);
            return false;
        }
    }

    static generateRelanceContent(cotisation, relanceNumber, remainingAmount) {
        const urgencyLevel = relanceNumber >= 3 ? 'URGENT' : '';

        return `
${urgencyLevel ? `[${urgencyLevel}] ` : ''}Rappel de cotisation - Relance n°${relanceNumber}

Bonjour ${cotisation.first_name} ${cotisation.last_name},

Nous vous rappelons que votre cotisation pour la saison ${cotisation.season} n'est pas encore réglée.

Montant restant dû : ${remainingAmount.toFixed(2)} €
Date d'échéance initiale : ${new Date(cotisation.due_date).toLocaleDateString('fr-FR')}

Nous vous remercions de bien vouloir régulariser votre situation dans les meilleurs délais.

${relanceNumber >= 3 ? 'En l\'absence de règlement, nous serons contraints de suspendre votre adhésion.' : ''}

Cordialement,
L'équipe de l'association
        `.trim();
    }

    static async getRelanceHistory(cotisationId) {
        const [rows] = await pool.execute(
            `SELECT * FROM relances WHERE cotisation_id = ? ORDER BY sent_at DESC`,
            [cotisationId]
        );
        return rows;
    }

    static async getRelanceStats() {
        const [rows] = await pool.execute(`
            SELECT
                DATE_FORMAT(sent_at, '%Y-%m') as month,
                COUNT(*) as total_relances,
                COUNT(DISTINCT cotisation_id) as unique_cotisations
            FROM relances
            WHERE sent_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(sent_at, '%Y-%m')
            ORDER BY month DESC
        `);

        return rows;
    }
}

module.exports = RelanceAutoService;
