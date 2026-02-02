class NotificationService {
    static async sendEmail(to, subject, content) {
        console.log(`[Email] Envoi à ${to}: ${subject}`);
        console.log(`[Email] Contenu: ${content.substring(0, 100)}...`);

        return {
            success: true,
            message: `Email envoyé à ${to}`
        };
    }

    static async sendSMS(to, content) {
        console.log(`[SMS] Envoi à ${to}: ${content.substring(0, 50)}...`);

        return {
            success: true,
            message: `SMS envoyé à ${to}`
        };
    }

    static async sendBulkEmails(recipients, subject, content) {
        console.log(`[Email Bulk] Envoi à ${recipients.length} destinataires: ${subject}`);

        const results = [];
        for (const recipient of recipients) {
            const result = await this.sendEmail(recipient, subject, content);
            results.push({ recipient, ...result });
        }

        return {
            success: true,
            sent: results.length,
            results
        };
    }

    static async sendAppNotification(userId, title, message, type = 'info') {
        const { pool } = require('../config/db');

        try {
            const [result] = await pool.execute(
                `INSERT INTO messages (sender_id, recipient_type, recipient_id, subject, content, message_type, channel)
                 VALUES (1, 'user', ?, ?, ?, ?, 'app')`,
                [userId, title, message, type]
            );

            console.log(`[App] Notification envoyée à user #${userId}: ${title}`);

            return {
                success: true,
                messageId: result.insertId
            };
        } catch (error) {
            console.error('[App] Erreur envoi notification:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async notifyEventReminder(event, participants) {
        const subject = `Rappel: ${event.title}`;
        const content = `
N'oubliez pas votre événement !

${event.title}
Date: ${new Date(event.start_datetime).toLocaleDateString('fr-FR')} à ${new Date(event.start_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
Lieu: ${event.location || 'Non spécifié'}

À bientôt !
        `.trim();

        const emails = participants.filter(p => p.email).map(p => p.email);

        if (emails.length > 0) {
            return this.sendBulkEmails(emails, subject, content);
        }

        return { success: true, sent: 0 };
    }

    static async notifyNewEvent(event, recipients) {
        const subject = `Nouvel événement: ${event.title}`;
        const content = `
Un nouvel événement a été créé !

${event.title}
${event.description || ''}

Date: ${new Date(event.start_datetime).toLocaleDateString('fr-FR')} à ${new Date(event.start_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
Lieu: ${event.location || 'Non spécifié'}
Places disponibles: ${event.max_participants ? event.max_participants - (event.current_participants || 0) : 'Illimitées'}

Inscrivez-vous dès maintenant !
        `.trim();

        const emails = recipients.filter(r => r.email).map(r => r.email);

        if (emails.length > 0) {
            return this.sendBulkEmails(emails, subject, content);
        }

        return { success: true, sent: 0 };
    }
}

module.exports = NotificationService;
