const AdherentModel = require('../../models/adherent.model');

const getAll = async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            search: req.query.search,
            limit: req.query.limit,
            offset: req.query.offset
        };

        const adherents = await AdherentModel.findAll(req.associationId, filters);
        const total = await AdherentModel.count(req.associationId, { status: filters.status });

        res.json({
            success: true,
            data: {
                adherents,
                total,
                limit: filters.limit ? parseInt(filters.limit) : null,
                offset: filters.offset ? parseInt(filters.offset) : 0
            }
        });
    } catch (error) {
        console.error('Get adherents error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const getById = async (req, res) => {
    try {
        const adherent = await AdherentModel.findById(req.params.id, req.associationId);

        if (!adherent) {
            return res.status(404).json({
                success: false,
                message: 'Adhérent non trouvé'
            });
        }

        res.json({
            success: true,
            data: { adherent }
        });
    } catch (error) {
        console.error('Get adherent error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const create = async (req, res) => {
    try {
        const { first_name, last_name } = req.body;

        if (!first_name || !last_name) {
            return res.status(400).json({
                success: false,
                message: 'Prénom et nom requis'
            });
        }

        const result = await AdherentModel.create(req.associationId, req.body);
        const adherent = await AdherentModel.findById(result.id, req.associationId);

        res.status(201).json({
            success: true,
            data: { adherent }
        });
    } catch (error) {
        console.error('Create adherent error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const update = async (req, res) => {
    try {
        const adherent = await AdherentModel.findById(req.params.id, req.associationId);

        if (!adherent) {
            return res.status(404).json({
                success: false,
                message: 'Adhérent non trouvé'
            });
        }

        const updated = await AdherentModel.update(req.params.id, req.associationId, req.body);

        if (!updated) {
            return res.status(400).json({
                success: false,
                message: 'Aucune modification effectuée'
            });
        }

        const updatedAdherent = await AdherentModel.findById(req.params.id, req.associationId);

        res.json({
            success: true,
            data: { adherent: updatedAdherent }
        });
    } catch (error) {
        console.error('Update adherent error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const remove = async (req, res) => {
    try {
        const adherent = await AdherentModel.findById(req.params.id, req.associationId);

        if (!adherent) {
            return res.status(404).json({
                success: false,
                message: 'Adhérent non trouvé'
            });
        }

        await AdherentModel.delete(req.params.id, req.associationId);

        res.json({
            success: true,
            message: 'Adhérent supprimé'
        });
    } catch (error) {
        console.error('Delete adherent error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const archive = async (req, res) => {
    try {
        const adherent = await AdherentModel.findById(req.params.id, req.associationId);

        if (!adherent) {
            return res.status(404).json({
                success: false,
                message: 'Adhérent non trouvé'
            });
        }

        await AdherentModel.archive(req.params.id, req.associationId);

        res.json({
            success: true,
            message: 'Adhérent archivé'
        });
    } catch (error) {
        console.error('Archive adherent error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const getStats = async (req, res) => {
    try {
        const stats = await AdherentModel.getStats(req.associationId);

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

const getActivities = async (req, res) => {
    try {
        const adherent = await AdherentModel.findById(req.params.id, req.associationId);

        if (!adherent) {
            return res.status(404).json({
                success: false,
                message: 'Adhérent non trouvé'
            });
        }

        const activities = await AdherentModel.getActivities(req.params.id, req.associationId);

        res.json({
            success: true,
            data: { activities }
        });
    } catch (error) {
        console.error('Get activities error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const addActivity = async (req, res) => {
    try {
        const adherent = await AdherentModel.findById(req.params.id, req.associationId);

        if (!adherent) {
            return res.status(404).json({
                success: false,
                message: 'Adhérent non trouvé'
            });
        }

        const { activity_name } = req.body;

        if (!activity_name) {
            return res.status(400).json({
                success: false,
                message: 'Nom de l\'activité requis'
            });
        }

        const activityId = await AdherentModel.addActivity(req.associationId, req.params.id, req.body);

        res.status(201).json({
            success: true,
            data: { id: activityId }
        });
    } catch (error) {
        console.error('Add activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    archive,
    getStats,
    getActivities,
    addActivity
};
