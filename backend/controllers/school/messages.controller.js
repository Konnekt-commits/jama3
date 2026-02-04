const SchoolMessageModel = require('../../models/school-message.model');

const messagesController = {
    async getAll(req, res) {
        try {
            const filters = {
                student_id: req.query.student_id,
                unread_only: req.query.unread_only === 'true',
                limit: req.query.limit
            };
            const messages = await SchoolMessageModel.findAll(req.associationId, filters);
            res.json({ success: true, data: messages });
        } catch (error) {
            console.error('Get messages error:', error);
            res.status(500).json({ success: false, message: 'Erreur récupération messages', error: error.message });
        }
    },

    async getConversation(req, res) {
        try {
            const messages = await SchoolMessageModel.getConversation(req.params.studentId, req.associationId);
            res.json({ success: true, data: messages });
        } catch (error) {
            console.error('Get conversation error:', error);
            res.status(500).json({ success: false, message: 'Erreur récupération conversation', error: error.message });
        }
    },

    async create(req, res) {
        try {
            const { recipient_type, recipient_id, content } = req.body;
            if (!recipient_type || !recipient_id || !content) {
                return res.status(400).json({ success: false, message: 'Destinataire et contenu requis' });
            }

            // Set sender info
            req.body.sender_type = req.user.role === 'intervenant' ? 'teacher' : 'admin';
            req.body.sender_id = req.user.id;

            const result = await SchoolMessageModel.create(req.associationId, req.body);
            const message = await SchoolMessageModel.findById(result.id, req.associationId);

            res.status(201).json({ success: true, message: 'Message envoyé', data: message });
        } catch (error) {
            console.error('Create message error:', error);
            res.status(500).json({ success: false, message: 'Erreur envoi message', error: error.message });
        }
    },

    async markAsRead(req, res) {
        try {
            await SchoolMessageModel.markAsRead(req.params.id, req.associationId);
            res.json({ success: true, message: 'Message marqué comme lu' });
        } catch (error) {
            console.error('Mark as read error:', error);
            res.status(500).json({ success: false, message: 'Erreur', error: error.message });
        }
    },

    async getUnreadCount(req, res) {
        try {
            const senderType = req.user.role === 'intervenant' ? 'teacher' : 'admin';
            const count = await SchoolMessageModel.getUnreadCount(senderType, req.user.id, req.associationId);
            res.json({ success: true, data: { count } });
        } catch (error) {
            console.error('Get unread count error:', error);
            res.status(500).json({ success: false, message: 'Erreur', error: error.message });
        }
    }
};

module.exports = messagesController;
