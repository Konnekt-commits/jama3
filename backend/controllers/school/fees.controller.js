const SchoolFeeModel = require('../../models/school-fee.model');

const feesController = {
    async getAll(req, res) {
        try {
            const filters = {
                payment_status: req.query.payment_status,
                student_id: req.query.student_id,
                academic_year: req.query.academic_year,
                period: req.query.period,
                search: req.query.search,
                limit: req.query.limit,
                offset: req.query.offset
            };

            const fees = await SchoolFeeModel.findAll(req.associationId, filters);

            res.json({
                success: true,
                data: fees
            });
        } catch (error) {
            console.error('Get fees error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur récupération frais',
                error: error.message
            });
        }
    },

    async getById(req, res) {
        try {
            const fee = await SchoolFeeModel.findById(req.params.id, req.associationId);
            if (!fee) {
                return res.status(404).json({
                    success: false,
                    message: 'Frais non trouvé'
                });
            }

            res.json({
                success: true,
                data: fee
            });
        } catch (error) {
            console.error('Get fee error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur récupération frais',
                error: error.message
            });
        }
    },

    async create(req, res) {
        try {
            const { student_id, amount } = req.body;

            if (!student_id || !amount) {
                return res.status(400).json({
                    success: false,
                    message: 'ID élève et montant requis'
                });
            }

            const result = await SchoolFeeModel.create(req.associationId, req.body);
            const fee = await SchoolFeeModel.findById(result.id, req.associationId);

            res.status(201).json({
                success: true,
                message: 'Frais créé',
                data: fee
            });
        } catch (error) {
            console.error('Create fee error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur création frais',
                error: error.message
            });
        }
    },

    async update(req, res) {
        try {
            const fee = await SchoolFeeModel.findById(req.params.id, req.associationId);
            if (!fee) {
                return res.status(404).json({
                    success: false,
                    message: 'Frais non trouvé'
                });
            }

            await SchoolFeeModel.update(req.params.id, req.associationId, req.body);
            const updated = await SchoolFeeModel.findById(req.params.id, req.associationId);

            res.json({
                success: true,
                message: 'Frais mis à jour',
                data: updated
            });
        } catch (error) {
            console.error('Update fee error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur mise à jour frais',
                error: error.message
            });
        }
    },

    async delete(req, res) {
        try {
            const fee = await SchoolFeeModel.findById(req.params.id, req.associationId);
            if (!fee) {
                return res.status(404).json({
                    success: false,
                    message: 'Frais non trouvé'
                });
            }

            await SchoolFeeModel.delete(req.params.id, req.associationId);

            res.json({
                success: true,
                message: 'Frais supprimé'
            });
        } catch (error) {
            console.error('Delete fee error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur suppression frais',
                error: error.message
            });
        }
    },

    async markAsPaid(req, res) {
        try {
            const { payment_method } = req.body;

            const success = await SchoolFeeModel.markAsPaid(
                req.params.id,
                req.associationId,
                payment_method || 'cash'
            );

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'Frais non trouvé'
                });
            }

            const updated = await SchoolFeeModel.findById(req.params.id, req.associationId);

            res.json({
                success: true,
                message: 'Paiement enregistré',
                data: updated
            });
        } catch (error) {
            console.error('Mark as paid error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur enregistrement paiement',
                error: error.message
            });
        }
    },

    async recordPartialPayment(req, res) {
        try {
            const { amount, payment_method } = req.body;

            if (!amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Montant requis'
                });
            }

            const success = await SchoolFeeModel.recordPartialPayment(
                req.params.id,
                req.associationId,
                amount,
                payment_method || 'cash'
            );

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'Frais non trouvé'
                });
            }

            const updated = await SchoolFeeModel.findById(req.params.id, req.associationId);

            res.json({
                success: true,
                message: 'Paiement partiel enregistré',
                data: updated
            });
        } catch (error) {
            console.error('Record partial payment error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur enregistrement paiement',
                error: error.message
            });
        }
    },

    async generateBatch(req, res) {
        try {
            const { student_ids, academic_year, period, period_label, amount, due_date } = req.body;

            if (!student_ids || !Array.isArray(student_ids) || !amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Liste élèves et montant requis'
                });
            }

            const results = await SchoolFeeModel.generateBatchFees(req.associationId, {
                student_ids,
                academic_year,
                period,
                period_label,
                amount,
                due_date
            });

            res.json({
                success: true,
                message: 'Frais générés',
                data: results
            });
        } catch (error) {
            console.error('Generate batch fees error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur génération frais',
                error: error.message
            });
        }
    },

    async getStats(req, res) {
        try {
            const stats = await SchoolFeeModel.getStats(
                req.associationId,
                req.query.academic_year
            );

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Get fee stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur statistiques frais',
                error: error.message
            });
        }
    }
};

module.exports = feesController;
