const MessageModel = require('../../models/message.model');

const getAll = async (req, res) => {
    try {
        const filters = {
            recipient_type: req.query.recipient_type,
            recipient_id: req.query.recipient_id,
            is_read: req.query.is_read !== undefined ? req.query.is_read === 'true' : undefined,
            message_type: req.query.message_type,
            limit: req.query.limit,
            offset: req.query.offset
        };

        const messages = await MessageModel.findAll(filters);

        res.json({
            success: true,
            data: { messages }
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const getById = async (req, res) => {
    try {
        const message = await MessageModel.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message non trouvé'
            });
        }

        res.json({
            success: true,
            data: { message }
        });
    } catch (error) {
        console.error('Get message error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const getMyMessages = async (req, res) => {
    try {
        const unreadOnly = req.query.unread === 'true';
        const messages = await MessageModel.findByRecipient('user', req.user.id, unreadOnly);

        res.json({
            success: true,
            data: { messages }
        });
    } catch (error) {
        console.error('Get my messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const create = async (req, res) => {
    try {
        const { recipient_type, content } = req.body;

        if (!recipient_type || !content) {
            return res.status(400).json({
                success: false,
                message: 'Type de destinataire et contenu requis'
            });
        }

        const messageId = await MessageModel.create({
            sender_id: req.user.id,
            ...req.body
        });

        const message = await MessageModel.findById(messageId);

        res.status(201).json({
            success: true,
            data: { message }
        });
    } catch (error) {
        console.error('Create message error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const sendToGroup = async (req, res) => {
    try {
        const { group_type, subject, content, message_type, channel } = req.body;

        if (!group_type || !content) {
            return res.status(400).json({
                success: false,
                message: 'Type de groupe et contenu requis'
            });
        }

        const validGroups = ['all_adherents', 'all_intervenants', 'all'];
        if (!validGroups.includes(group_type)) {
            return res.status(400).json({
                success: false,
                message: 'Type de groupe invalide'
            });
        }

        const results = await MessageModel.sendToGroup(req.user.id, group_type, {
            subject,
            content,
            message_type,
            channel
        });

        res.status(201).json({
            success: true,
            data: {
                sent_count: Array.isArray(results) ? results.length : 1
            }
        });
    } catch (error) {
        console.error('Send to group error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const markAsRead = async (req, res) => {
    try {
        const marked = await MessageModel.markAsRead(req.params.id);

        if (!marked) {
            return res.status(404).json({
                success: false,
                message: 'Message non trouvé'
            });
        }

        res.json({
            success: true,
            message: 'Message marqué comme lu'
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        const count = await MessageModel.markAllAsRead('user', req.user.id);

        res.json({
            success: true,
            data: { marked_count: count }
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const remove = async (req, res) => {
    try {
        const message = await MessageModel.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message non trouvé'
            });
        }

        await MessageModel.delete(req.params.id);

        res.json({
            success: true,
            message: 'Message supprimé'
        });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const getUnreadCount = async (req, res) => {
    try {
        const count = await MessageModel.getUnreadCount('user', req.user.id);

        res.json({
            success: true,
            data: { count }
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const getStats = async (req, res) => {
    try {
        const stats = await MessageModel.getStats();

        res.json({
            success: true,
            data: { stats }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

module.exports = {
    getAll,
    getById,
    getMyMessages,
    create,
    sendToGroup,
    markAsRead,
    markAllAsRead,
    remove,
    getUnreadCount,
    getStats
};
