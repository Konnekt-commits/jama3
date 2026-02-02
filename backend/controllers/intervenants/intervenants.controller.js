const IntervenantModel = require('../../models/intervenant.model');

const getAll = async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            contract_type: req.query.contract_type,
            search: req.query.search
        };

        const intervenants = await IntervenantModel.findAll(filters);

        res.json({
            success: true,
            data: { intervenants }
        });
    } catch (error) {
        console.error('Get intervenants error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const getById = async (req, res) => {
    try {
        const intervenant = await IntervenantModel.findById(req.params.id);

        if (!intervenant) {
            return res.status(404).json({
                success: false,
                message: 'Intervenant non trouvé'
            });
        }

        res.json({
            success: true,
            data: { intervenant }
        });
    } catch (error) {
        console.error('Get intervenant error:', error);
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

        const intervenantId = await IntervenantModel.create(req.body);
        const intervenant = await IntervenantModel.findById(intervenantId);

        res.status(201).json({
            success: true,
            data: { intervenant }
        });
    } catch (error) {
        console.error('Create intervenant error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const update = async (req, res) => {
    try {
        const intervenant = await IntervenantModel.findById(req.params.id);

        if (!intervenant) {
            return res.status(404).json({
                success: false,
                message: 'Intervenant non trouvé'
            });
        }

        const updated = await IntervenantModel.update(req.params.id, req.body);

        if (!updated) {
            return res.status(400).json({
                success: false,
                message: 'Aucune modification effectuée'
            });
        }

        const updatedIntervenant = await IntervenantModel.findById(req.params.id);

        res.json({
            success: true,
            data: { intervenant: updatedIntervenant }
        });
    } catch (error) {
        console.error('Update intervenant error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const remove = async (req, res) => {
    try {
        const intervenant = await IntervenantModel.findById(req.params.id);

        if (!intervenant) {
            return res.status(404).json({
                success: false,
                message: 'Intervenant non trouvé'
            });
        }

        await IntervenantModel.delete(req.params.id);

        res.json({
            success: true,
            message: 'Intervenant supprimé'
        });
    } catch (error) {
        console.error('Delete intervenant error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const getEvents = async (req, res) => {
    try {
        const intervenant = await IntervenantModel.findById(req.params.id);

        if (!intervenant) {
            return res.status(404).json({
                success: false,
                message: 'Intervenant non trouvé'
            });
        }

        const filters = {
            upcoming: req.query.upcoming === 'true',
            status: req.query.status
        };

        const events = await IntervenantModel.getEvents(req.params.id, filters);

        res.json({
            success: true,
            data: { events }
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const getStats = async (req, res) => {
    try {
        const intervenant = await IntervenantModel.findById(req.params.id);

        if (!intervenant) {
            return res.status(404).json({
                success: false,
                message: 'Intervenant non trouvé'
            });
        }

        const stats = await IntervenantModel.getStats(req.params.id);

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
    create,
    update,
    remove,
    getEvents,
    getStats
};
