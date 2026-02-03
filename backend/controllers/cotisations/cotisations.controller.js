const CotisationModel = require('../../models/cotisation.model');

const getAll = async (req, res) => {
    try {
        const filters = {
            adherent_id: req.query.adherent_id,
            season: req.query.season,
            payment_status: req.query.payment_status,
            overdue: req.query.overdue === 'true',
            limit: req.query.limit,
            offset: req.query.offset
        };

        const cotisations = await CotisationModel.findAll(req.associationId, filters);

        res.json({
            success: true,
            data: { cotisations }
        });
    } catch (error) {
        console.error('Get cotisations error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const getById = async (req, res) => {
    try {
        const cotisation = await CotisationModel.findById(req.params.id, req.associationId);

        if (!cotisation) {
            return res.status(404).json({
                success: false,
                message: 'Cotisation non trouvée'
            });
        }

        res.json({
            success: true,
            data: { cotisation }
        });
    } catch (error) {
        console.error('Get cotisation error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const create = async (req, res) => {
    try {
        const { adherent_id, season, amount } = req.body;

        if (!adherent_id || !season || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Adhérent, saison et montant requis'
            });
        }

        const result = await CotisationModel.create(req.associationId, req.body);
        const cotisation = await CotisationModel.findById(result.id, req.associationId);

        res.status(201).json({
            success: true,
            data: { cotisation }
        });
    } catch (error) {
        console.error('Create cotisation error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const update = async (req, res) => {
    try {
        const cotisation = await CotisationModel.findById(req.params.id, req.associationId);

        if (!cotisation) {
            return res.status(404).json({
                success: false,
                message: 'Cotisation non trouvée'
            });
        }

        const updated = await CotisationModel.update(req.params.id, req.associationId, req.body);

        if (!updated) {
            return res.status(400).json({
                success: false,
                message: 'Aucune modification effectuée'
            });
        }

        const updatedCotisation = await CotisationModel.findById(req.params.id, req.associationId);

        res.json({
            success: true,
            data: { cotisation: updatedCotisation }
        });
    } catch (error) {
        console.error('Update cotisation error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const remove = async (req, res) => {
    try {
        const cotisation = await CotisationModel.findById(req.params.id, req.associationId);

        if (!cotisation) {
            return res.status(404).json({
                success: false,
                message: 'Cotisation non trouvée'
            });
        }

        await CotisationModel.delete(req.params.id, req.associationId);

        res.json({
            success: true,
            message: 'Cotisation supprimée'
        });
    } catch (error) {
        console.error('Delete cotisation error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const registerPayment = async (req, res) => {
    try {
        const { amount, method } = req.body;

        if (!amount || !method) {
            return res.status(400).json({
                success: false,
                message: 'Montant et méthode de paiement requis'
            });
        }

        const result = await CotisationModel.registerPayment(req.params.id, req.associationId, amount, method);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Cotisation non trouvée'
            });
        }

        const cotisation = await CotisationModel.findById(req.params.id, req.associationId);

        res.json({
            success: true,
            data: { cotisation }
        });
    } catch (error) {
        console.error('Register payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const getStats = async (req, res) => {
    try {
        const stats = await CotisationModel.getStats(req.associationId, req.query.season);

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

const getOverdue = async (req, res) => {
    try {
        const cotisations = await CotisationModel.getOverdue(req.associationId);

        res.json({
            success: true,
            data: { cotisations }
        });
    } catch (error) {
        console.error('Get overdue error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const getRelances = async (req, res) => {
    try {
        const cotisation = await CotisationModel.findById(req.params.id, req.associationId);

        if (!cotisation) {
            return res.status(404).json({
                success: false,
                message: 'Cotisation non trouvée'
            });
        }

        const relances = await CotisationModel.getRelances(req.params.id, req.associationId);

        res.json({
            success: true,
            data: { relances }
        });
    } catch (error) {
        console.error('Get relances error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const addRelance = async (req, res) => {
    try {
        const cotisation = await CotisationModel.findById(req.params.id, req.associationId);

        if (!cotisation) {
            return res.status(404).json({
                success: false,
                message: 'Cotisation non trouvée'
            });
        }

        const { type, content } = req.body;

        const relanceId = await CotisationModel.addRelance(
            req.associationId,
            req.params.id,
            type || 'email',
            content
        );

        res.status(201).json({
            success: true,
            data: { id: relanceId }
        });
    } catch (error) {
        console.error('Add relance error:', error);
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
    registerPayment,
    getStats,
    getOverdue,
    getRelances,
    addRelance
};
