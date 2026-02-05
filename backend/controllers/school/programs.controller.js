const SchoolProgramModel = require('../../models/school-program.model');
const SchoolContentModel = require('../../models/school-content.model');

const programsController = {
    async getAll(req, res) {
        try {
            const filters = {};
            if (req.query.class_id && req.query.class_id !== 'undefined') {
                filters.class_id = req.query.class_id;
            }
            if (req.query.status && req.query.status !== 'undefined') {
                filters.status = req.query.status;
            }
            const programs = await SchoolProgramModel.findAll(req.associationId, filters);
            res.json({ success: true, data: programs });
        } catch (error) {
            console.error('Get programs error:', error);
            res.status(500).json({ success: false, message: 'Erreur récupération programmes', error: error.message });
        }
    },

    async getById(req, res) {
        try {
            const program = await SchoolProgramModel.findById(req.params.id, req.associationId);
            if (!program) {
                return res.status(404).json({ success: false, message: 'Programme non trouvé' });
            }

            // Get associated content
            const content = await SchoolContentModel.findAll(req.associationId, { program_id: program.id });

            res.json({ success: true, data: { ...program, content } });
        } catch (error) {
            console.error('Get program error:', error);
            res.status(500).json({ success: false, message: 'Erreur récupération programme', error: error.message });
        }
    },

    async create(req, res) {
        try {
            const { class_id, title } = req.body;
            if (!class_id || !title) {
                return res.status(400).json({ success: false, message: 'Classe et titre requis' });
            }

            req.body.created_by = req.user.id;
            const result = await SchoolProgramModel.create(req.associationId, req.body);
            const program = await SchoolProgramModel.findById(result.id, req.associationId);

            res.status(201).json({ success: true, message: 'Programme créé', data: program });
        } catch (error) {
            console.error('Create program error:', error);
            res.status(500).json({ success: false, message: 'Erreur création programme', error: error.message });
        }
    },

    async update(req, res) {
        try {
            const program = await SchoolProgramModel.findById(req.params.id, req.associationId);
            if (!program) {
                return res.status(404).json({ success: false, message: 'Programme non trouvé' });
            }

            await SchoolProgramModel.update(req.params.id, req.associationId, req.body);
            const updated = await SchoolProgramModel.findById(req.params.id, req.associationId);

            res.json({ success: true, message: 'Programme mis à jour', data: updated });
        } catch (error) {
            console.error('Update program error:', error);
            res.status(500).json({ success: false, message: 'Erreur mise à jour programme', error: error.message });
        }
    },

    async delete(req, res) {
        try {
            const deleted = await SchoolProgramModel.delete(req.params.id, req.associationId);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Programme non trouvé' });
            }
            res.json({ success: true, message: 'Programme supprimé' });
        } catch (error) {
            console.error('Delete program error:', error);
            res.status(500).json({ success: false, message: 'Erreur suppression programme', error: error.message });
        }
    },

    // Content management
    async getContent(req, res) {
        try {
            const filters = {
                class_id: req.query.class_id,
                program_id: req.query.program_id,
                content_type: req.query.content_type
            };
            const content = await SchoolContentModel.findAll(req.associationId, filters);
            res.json({ success: true, data: content });
        } catch (error) {
            console.error('Get content error:', error);
            res.status(500).json({ success: false, message: 'Erreur récupération contenus', error: error.message });
        }
    },

    async createContent(req, res) {
        try {
            const { title } = req.body;
            if (!title) {
                return res.status(400).json({ success: false, message: 'Titre requis' });
            }

            req.body.created_by = req.user.id;
            const result = await SchoolContentModel.create(req.associationId, req.body);
            const content = await SchoolContentModel.findById(result.id, req.associationId);

            res.status(201).json({ success: true, message: 'Contenu créé', data: content });
        } catch (error) {
            console.error('Create content error:', error);
            res.status(500).json({ success: false, message: 'Erreur création contenu', error: error.message });
        }
    },

    async deleteContent(req, res) {
        try {
            const deleted = await SchoolContentModel.delete(req.params.id, req.associationId);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Contenu non trouvé' });
            }
            res.json({ success: true, message: 'Contenu supprimé' });
        } catch (error) {
            console.error('Delete content error:', error);
            res.status(500).json({ success: false, message: 'Erreur suppression contenu', error: error.message });
        }
    }
};

module.exports = programsController;
