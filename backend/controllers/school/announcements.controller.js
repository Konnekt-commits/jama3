const SchoolAnnouncementModel = require('../../models/school-announcement.model');

const announcementsController = {
    async getAll(req, res) {
        try {
            const filters = {
                class_id: req.query.class_id,
                is_published: req.query.is_published,
                target_audience: req.query.target_audience,
                active_only: req.query.active_only === 'true',
                limit: req.query.limit
            };
            const announcements = await SchoolAnnouncementModel.findAllWithClassNames(req.associationId, filters);
            res.json({ success: true, data: announcements });
        } catch (error) {
            console.error('Get announcements error:', error);
            res.status(500).json({ success: false, message: 'Erreur récupération annonces', error: error.message });
        }
    },

    async getById(req, res) {
        try {
            const announcement = await SchoolAnnouncementModel.findById(req.params.id, req.associationId);
            if (!announcement) {
                return res.status(404).json({ success: false, message: 'Annonce non trouvée' });
            }
            res.json({ success: true, data: announcement });
        } catch (error) {
            console.error('Get announcement error:', error);
            res.status(500).json({ success: false, message: 'Erreur récupération annonce', error: error.message });
        }
    },

    async create(req, res) {
        try {
            const { title, content } = req.body;
            if (!title || !content) {
                return res.status(400).json({ success: false, message: 'Titre et contenu requis' });
            }

            req.body.created_by = req.user.id;
            const result = await SchoolAnnouncementModel.create(req.associationId, req.body);
            const announcement = await SchoolAnnouncementModel.findById(result.id, req.associationId);

            res.status(201).json({ success: true, message: 'Annonce créée', data: announcement });
        } catch (error) {
            console.error('Create announcement error:', error);
            res.status(500).json({ success: false, message: 'Erreur création annonce', error: error.message });
        }
    },

    async update(req, res) {
        try {
            const announcement = await SchoolAnnouncementModel.findById(req.params.id, req.associationId);
            if (!announcement) {
                return res.status(404).json({ success: false, message: 'Annonce non trouvée' });
            }

            await SchoolAnnouncementModel.update(req.params.id, req.associationId, req.body);
            const updated = await SchoolAnnouncementModel.findById(req.params.id, req.associationId);

            res.json({ success: true, message: 'Annonce mise à jour', data: updated });
        } catch (error) {
            console.error('Update announcement error:', error);
            res.status(500).json({ success: false, message: 'Erreur mise à jour annonce', error: error.message });
        }
    },

    async delete(req, res) {
        try {
            const deleted = await SchoolAnnouncementModel.delete(req.params.id, req.associationId);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Annonce non trouvée' });
            }
            res.json({ success: true, message: 'Annonce supprimée' });
        } catch (error) {
            console.error('Delete announcement error:', error);
            res.status(500).json({ success: false, message: 'Erreur suppression annonce', error: error.message });
        }
    },

    async publish(req, res) {
        try {
            await SchoolAnnouncementModel.update(req.params.id, req.associationId, { is_published: true });
            res.json({ success: true, message: 'Annonce publiée' });
        } catch (error) {
            console.error('Publish announcement error:', error);
            res.status(500).json({ success: false, message: 'Erreur publication annonce', error: error.message });
        }
    }
};

module.exports = announcementsController;
