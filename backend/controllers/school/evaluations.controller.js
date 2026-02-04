const SchoolEvaluationModel = require('../../models/school-evaluation.model');

const evaluationsController = {
    async getAll(req, res) {
        try {
            const filters = {
                student_id: req.query.student_id,
                class_id: req.query.class_id,
                type: req.query.type,
                from_date: req.query.from_date,
                to_date: req.query.to_date,
                limit: req.query.limit,
                offset: req.query.offset
            };

            const evaluations = await SchoolEvaluationModel.findAll(req.associationId, filters);

            res.json({
                success: true,
                data: evaluations
            });
        } catch (error) {
            console.error('Get evaluations error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur récupération évaluations',
                error: error.message
            });
        }
    },

    async getById(req, res) {
        try {
            const evaluation = await SchoolEvaluationModel.findById(req.params.id, req.associationId);
            if (!evaluation) {
                return res.status(404).json({
                    success: false,
                    message: 'Évaluation non trouvée'
                });
            }

            res.json({
                success: true,
                data: evaluation
            });
        } catch (error) {
            console.error('Get evaluation error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur récupération évaluation',
                error: error.message
            });
        }
    },

    async create(req, res) {
        try {
            const { student_id, class_id, evaluation_date } = req.body;

            if (!student_id || !class_id || !evaluation_date) {
                return res.status(400).json({
                    success: false,
                    message: 'ID élève, ID classe et date requis'
                });
            }

            const result = await SchoolEvaluationModel.create(req.associationId, req.body);
            const evaluation = await SchoolEvaluationModel.findById(result.id, req.associationId);

            res.status(201).json({
                success: true,
                message: 'Évaluation créée',
                data: evaluation
            });
        } catch (error) {
            console.error('Create evaluation error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur création évaluation',
                error: error.message
            });
        }
    },

    async update(req, res) {
        try {
            const evaluation = await SchoolEvaluationModel.findById(req.params.id, req.associationId);
            if (!evaluation) {
                return res.status(404).json({
                    success: false,
                    message: 'Évaluation non trouvée'
                });
            }

            await SchoolEvaluationModel.update(req.params.id, req.associationId, req.body);
            const updated = await SchoolEvaluationModel.findById(req.params.id, req.associationId);

            res.json({
                success: true,
                message: 'Évaluation mise à jour',
                data: updated
            });
        } catch (error) {
            console.error('Update evaluation error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur mise à jour évaluation',
                error: error.message
            });
        }
    },

    async delete(req, res) {
        try {
            const evaluation = await SchoolEvaluationModel.findById(req.params.id, req.associationId);
            if (!evaluation) {
                return res.status(404).json({
                    success: false,
                    message: 'Évaluation non trouvée'
                });
            }

            await SchoolEvaluationModel.delete(req.params.id, req.associationId);

            res.json({
                success: true,
                message: 'Évaluation supprimée'
            });
        } catch (error) {
            console.error('Delete evaluation error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur suppression évaluation',
                error: error.message
            });
        }
    },

    async getStudentStats(req, res) {
        try {
            const stats = await SchoolEvaluationModel.getStudentStats(
                req.params.studentId,
                req.associationId,
                req.query.class_id
            );

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Get student evaluation stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur statistiques évaluations',
                error: error.message
            });
        }
    },

    async getClassStats(req, res) {
        try {
            const stats = await SchoolEvaluationModel.getClassStats(
                req.params.classId,
                req.associationId
            );

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Get class evaluation stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur statistiques classe',
                error: error.message
            });
        }
    }
};

module.exports = evaluationsController;
