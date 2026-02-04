const SchoolClassModel = require('../../models/school-class.model');

const classesController = {
    async getAll(req, res) {
        try {
            const filters = {
                status: req.query.status,
                subject: req.query.subject,
                level: req.query.level,
                teacher_id: req.query.teacher_id,
                academic_year: req.query.academic_year,
                search: req.query.search
            };

            const classes = await SchoolClassModel.findAll(req.associationId, filters);

            res.json({
                success: true,
                data: classes
            });
        } catch (error) {
            console.error('Get classes error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur récupération classes',
                error: error.message
            });
        }
    },

    async getById(req, res) {
        try {
            const schoolClass = await SchoolClassModel.findById(req.params.id, req.associationId);
            if (!schoolClass) {
                return res.status(404).json({
                    success: false,
                    message: 'Classe non trouvée'
                });
            }

            const students = await SchoolClassModel.getStudents(schoolClass.id, req.associationId);

            res.json({
                success: true,
                data: {
                    ...schoolClass,
                    students
                }
            });
        } catch (error) {
            console.error('Get class error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur récupération classe',
                error: error.message
            });
        }
    },

    async create(req, res) {
        try {
            const { name, subject } = req.body;

            if (!name || !subject) {
                return res.status(400).json({
                    success: false,
                    message: 'Nom et matière requis'
                });
            }

            const result = await SchoolClassModel.create(req.associationId, req.body);
            const schoolClass = await SchoolClassModel.findById(result.id, req.associationId);

            res.status(201).json({
                success: true,
                message: 'Classe créée',
                data: schoolClass
            });
        } catch (error) {
            console.error('Create class error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur création classe',
                error: error.message
            });
        }
    },

    async update(req, res) {
        try {
            const schoolClass = await SchoolClassModel.findById(req.params.id, req.associationId);
            if (!schoolClass) {
                return res.status(404).json({
                    success: false,
                    message: 'Classe non trouvée'
                });
            }

            await SchoolClassModel.update(req.params.id, req.associationId, req.body);
            const updated = await SchoolClassModel.findById(req.params.id, req.associationId);

            res.json({
                success: true,
                message: 'Classe mise à jour',
                data: updated
            });
        } catch (error) {
            console.error('Update class error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur mise à jour classe',
                error: error.message
            });
        }
    },

    async delete(req, res) {
        try {
            const schoolClass = await SchoolClassModel.findById(req.params.id, req.associationId);
            if (!schoolClass) {
                return res.status(404).json({
                    success: false,
                    message: 'Classe non trouvée'
                });
            }

            await SchoolClassModel.delete(req.params.id, req.associationId);

            res.json({
                success: true,
                message: 'Classe supprimée'
            });
        } catch (error) {
            console.error('Delete class error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur suppression classe',
                error: error.message
            });
        }
    },

    async enrollStudent(req, res) {
        try {
            const { student_id } = req.body;
            if (!student_id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID élève requis'
                });
            }

            await SchoolClassModel.enrollStudent(req.associationId, req.params.id, student_id);

            res.json({
                success: true,
                message: 'Élève inscrit à la classe'
            });
        } catch (error) {
            console.error('Enroll student error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur inscription élève',
                error: error.message
            });
        }
    },

    async unenrollStudent(req, res) {
        try {
            await SchoolClassModel.unenrollStudent(
                req.associationId,
                req.params.id,
                req.params.studentId
            );

            res.json({
                success: true,
                message: 'Élève désinscrit de la classe'
            });
        } catch (error) {
            console.error('Unenroll student error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur désinscription élève',
                error: error.message
            });
        }
    },

    async getStats(req, res) {
        try {
            const stats = await SchoolClassModel.getStats(req.associationId);
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Get class stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur statistiques classes',
                error: error.message
            });
        }
    }
};

module.exports = classesController;
