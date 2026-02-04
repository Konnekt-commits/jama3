const StudentModel = require('../../models/student.model');

const studentsController = {
    async getAll(req, res) {
        try {
            const associationId = req.associationId;
            const filters = {
                status: req.query.status,
                level: req.query.level,
                class_id: req.query.class_id,
                parent_id: req.query.parent_id,
                search: req.query.search,
                limit: req.query.limit,
                offset: req.query.offset
            };

            const students = await StudentModel.findAll(associationId, filters);
            const total = await StudentModel.count(associationId, filters);

            res.json({
                success: true,
                data: {
                    students,
                    total,
                    limit: filters.limit ? parseInt(filters.limit) : null,
                    offset: filters.offset ? parseInt(filters.offset) : 0
                }
            });
        } catch (error) {
            console.error('Get students error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur récupération élèves',
                error: error.message
            });
        }
    },

    async getById(req, res) {
        try {
            const student = await StudentModel.findById(req.params.id, req.associationId);
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Élève non trouvé'
                });
            }

            const classes = await StudentModel.getClasses(student.id, req.associationId);
            const recentAttendance = await StudentModel.getAttendance(student.id, req.associationId, 10);
            const recentEvaluations = await StudentModel.getEvaluations(student.id, req.associationId, 5);

            res.json({
                success: true,
                data: {
                    ...student,
                    classes,
                    recentAttendance,
                    recentEvaluations
                }
            });
        } catch (error) {
            console.error('Get student error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur récupération élève',
                error: error.message
            });
        }
    },

    async create(req, res) {
        try {
            const { first_name, last_name } = req.body;

            if (!first_name || !last_name) {
                return res.status(400).json({
                    success: false,
                    message: 'Prénom et nom requis'
                });
            }

            const result = await StudentModel.create(req.associationId, req.body);
            const student = await StudentModel.findById(result.id, req.associationId);

            res.status(201).json({
                success: true,
                message: 'Élève créé',
                data: student
            });
        } catch (error) {
            console.error('Create student error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur création élève',
                error: error.message
            });
        }
    },

    async update(req, res) {
        try {
            const student = await StudentModel.findById(req.params.id, req.associationId);
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Élève non trouvé'
                });
            }

            await StudentModel.update(req.params.id, req.associationId, req.body);
            const updated = await StudentModel.findById(req.params.id, req.associationId);

            res.json({
                success: true,
                message: 'Élève mis à jour',
                data: updated
            });
        } catch (error) {
            console.error('Update student error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur mise à jour élève',
                error: error.message
            });
        }
    },

    async delete(req, res) {
        try {
            const student = await StudentModel.findById(req.params.id, req.associationId);
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Élève non trouvé'
                });
            }

            await StudentModel.delete(req.params.id, req.associationId);

            res.json({
                success: true,
                message: 'Élève supprimé'
            });
        } catch (error) {
            console.error('Delete student error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur suppression élève',
                error: error.message
            });
        }
    },

    async getStats(req, res) {
        try {
            const stats = await StudentModel.getStats(req.associationId);
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Get student stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur statistiques élèves',
                error: error.message
            });
        }
    },

    async getAttendance(req, res) {
        try {
            const attendance = await StudentModel.getAttendance(
                req.params.id,
                req.associationId,
                req.query.limit || 50
            );
            res.json({
                success: true,
                data: attendance
            });
        } catch (error) {
            console.error('Get student attendance error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur récupération présences',
                error: error.message
            });
        }
    },

    async getEvaluations(req, res) {
        try {
            const evaluations = await StudentModel.getEvaluations(
                req.params.id,
                req.associationId,
                req.query.limit || 20
            );
            res.json({
                success: true,
                data: evaluations
            });
        } catch (error) {
            console.error('Get student evaluations error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur récupération évaluations',
                error: error.message
            });
        }
    }
};

module.exports = studentsController;
