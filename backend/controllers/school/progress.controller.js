const StudentProgressModel = require('../../models/student-progress.model');

const progressController = {
    async getByStudent(req, res) {
        try {
            const progress = await StudentProgressModel.findByStudent(req.params.studentId, req.associationId);
            res.json({ success: true, data: progress });
        } catch (error) {
            console.error('Get progress error:', error);
            res.status(500).json({ success: false, message: 'Erreur récupération progression', error: error.message });
        }
    },

    async getBadges(req, res) {
        try {
            const badges = await StudentProgressModel.getStudentBadges(req.params.studentId, req.associationId);
            res.json({ success: true, data: badges });
        } catch (error) {
            console.error('Get badges error:', error);
            res.status(500).json({ success: false, message: 'Erreur récupération badges', error: error.message });
        }
    },

    async create(req, res) {
        try {
            const { student_id, milestone_name } = req.body;
            if (!student_id || !milestone_name) {
                return res.status(400).json({ success: false, message: 'Élève et nom du jalon requis' });
            }

            req.body.awarded_by = req.user.id;
            const result = await StudentProgressModel.create(req.associationId, req.body);

            res.status(201).json({ success: true, message: 'Progression ajoutée', data: { id: result.id } });
        } catch (error) {
            console.error('Create progress error:', error);
            res.status(500).json({ success: false, message: 'Erreur création progression', error: error.message });
        }
    },

    async delete(req, res) {
        try {
            const deleted = await StudentProgressModel.delete(req.params.id, req.associationId);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Progression non trouvée' });
            }
            res.json({ success: true, message: 'Progression supprimée' });
        } catch (error) {
            console.error('Delete progress error:', error);
            res.status(500).json({ success: false, message: 'Erreur suppression progression', error: error.message });
        }
    },

    // Predefined badges for easy assignment
    async getAvailableBadges(req, res) {
        const badges = [
            { name: 'Sourate Al-Fatiha', icon: '📖', type: 'badge', description: 'Mémorisation de Sourate Al-Fatiha' },
            { name: 'Sourate Al-Ikhlas', icon: '⭐', type: 'badge', description: 'Mémorisation de Sourate Al-Ikhlas' },
            { name: 'Sourate An-Nas', icon: '🌟', type: 'badge', description: 'Mémorisation de Sourate An-Nas' },
            { name: 'Sourate Al-Falaq', icon: '✨', type: 'badge', description: 'Mémorisation de Sourate Al-Falaq' },
            { name: 'Juz Amma', icon: '🏆', type: 'certificate', description: 'Mémorisation complète du Juz Amma' },
            { name: 'Alphabet Arabe', icon: '🔤', type: 'badge', description: 'Maîtrise de l\'alphabet arabe' },
            { name: 'Lecture Niveau 1', icon: '📚', type: 'level', description: 'Lecture niveau débutant validé' },
            { name: 'Lecture Niveau 2', icon: '📗', type: 'level', description: 'Lecture niveau intermédiaire validé' },
            { name: 'Lecture Niveau 3', icon: '📘', type: 'level', description: 'Lecture niveau avancé validé' },
            { name: 'Tajwid Bases', icon: '🎯', type: 'badge', description: 'Règles de base du Tajwid' },
            { name: 'Assidu', icon: '🌙', type: 'achievement', description: 'Présence régulière pendant 3 mois' },
            { name: 'Excellence', icon: '🥇', type: 'achievement', description: 'Résultats excellents' },
            { name: 'Progrès Remarquable', icon: '📈', type: 'achievement', description: 'Progression remarquable' }
        ];

        res.json({ success: true, data: badges });
    }
};

module.exports = progressController;
