const EventModel = require('../../models/event.model');

const getAll = async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            event_type: req.query.event_type,
            intervenant_id: req.query.intervenant_id,
            start_date: req.query.start_date,
            end_date: req.query.end_date,
            upcoming: req.query.upcoming === 'true',
            limit: req.query.limit,
            offset: req.query.offset
        };

        const events = await EventModel.findAll(filters);

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

const getById = async (req, res) => {
    try {
        const event = await EventModel.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Événement non trouvé'
            });
        }

        res.json({
            success: true,
            data: { event }
        });
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const create = async (req, res) => {
    try {
        const { title, start_datetime, end_datetime } = req.body;

        if (!title || !start_datetime || !end_datetime) {
            return res.status(400).json({
                success: false,
                message: 'Titre, date de début et date de fin requis'
            });
        }

        const eventId = await EventModel.create(req.body);
        const event = await EventModel.findById(eventId);

        res.status(201).json({
            success: true,
            data: { event }
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const update = async (req, res) => {
    try {
        const event = await EventModel.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Événement non trouvé'
            });
        }

        const updated = await EventModel.update(req.params.id, req.body);

        if (!updated) {
            return res.status(400).json({
                success: false,
                message: 'Aucune modification effectuée'
            });
        }

        const updatedEvent = await EventModel.findById(req.params.id);

        res.json({
            success: true,
            data: { event: updatedEvent }
        });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const remove = async (req, res) => {
    try {
        const event = await EventModel.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Événement non trouvé'
            });
        }

        await EventModel.delete(req.params.id);

        res.json({
            success: true,
            message: 'Événement supprimé'
        });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const cancel = async (req, res) => {
    try {
        const event = await EventModel.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Événement non trouvé'
            });
        }

        await EventModel.cancel(req.params.id);

        res.json({
            success: true,
            message: 'Événement annulé'
        });
    } catch (error) {
        console.error('Cancel event error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const getParticipants = async (req, res) => {
    try {
        const event = await EventModel.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Événement non trouvé'
            });
        }

        const participants = await EventModel.getParticipants(req.params.id);

        res.json({
            success: true,
            data: { participants }
        });
    } catch (error) {
        console.error('Get participants error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const addParticipant = async (req, res) => {
    try {
        const { adherent_id } = req.body;

        if (!adherent_id) {
            return res.status(400).json({
                success: false,
                message: 'ID adhérent requis'
            });
        }

        const result = await EventModel.addParticipant(req.params.id, adherent_id);

        if (result.error) {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        res.status(201).json({
            success: true,
            message: 'Participant ajouté'
        });
    } catch (error) {
        console.error('Add participant error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const removeParticipant = async (req, res) => {
    try {
        const removed = await EventModel.removeParticipant(
            req.params.id,
            req.params.adherentId
        );

        if (!removed) {
            return res.status(404).json({
                success: false,
                message: 'Participant non trouvé'
            });
        }

        res.json({
            success: true,
            message: 'Participant retiré'
        });
    } catch (error) {
        console.error('Remove participant error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const updateAttendance = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Statut requis'
            });
        }

        const updated = await EventModel.updateAttendance(
            req.params.id,
            req.params.adherentId,
            status
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Participant non trouvé'
            });
        }

        res.json({
            success: true,
            message: 'Présence mise à jour'
        });
    } catch (error) {
        console.error('Update attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const getUpcoming = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const events = await EventModel.getUpcoming(limit);

        res.json({
            success: true,
            data: { events }
        });
    } catch (error) {
        console.error('Get upcoming error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const getByDateRange = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: 'Date de début et de fin requises'
            });
        }

        const events = await EventModel.getByDateRange(start_date, end_date);

        res.json({
            success: true,
            data: { events }
        });
    } catch (error) {
        console.error('Get by date range error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const getStats = async (req, res) => {
    try {
        const stats = await EventModel.getStats();

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
    cancel,
    getParticipants,
    addParticipant,
    removeParticipant,
    updateAttendance,
    getUpcoming,
    getByDateRange,
    getStats
};
