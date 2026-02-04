const SchoolAttendanceModel = require('../../models/school-attendance.model');

const attendanceController = {
    async getByClassAndDate(req, res) {
        try {
            const { class_id, date } = req.query;

            if (!class_id || !date) {
                return res.status(400).json({
                    success: false,
                    message: 'ID classe et date requis'
                });
            }

            const students = await SchoolAttendanceModel.getStudentsForSession(
                class_id,
                date,
                req.associationId
            );

            res.json({
                success: true,
                data: students
            });
        } catch (error) {
            console.error('Get attendance error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur récupération présences',
                error: error.message
            });
        }
    },

    async recordBatch(req, res) {
        try {
            const { class_id, session_date, attendances } = req.body;

            if (!class_id || !session_date || !attendances || !Array.isArray(attendances)) {
                return res.status(400).json({
                    success: false,
                    message: 'Données invalides'
                });
            }

            const results = await SchoolAttendanceModel.recordBatchAttendance(
                req.associationId,
                class_id,
                session_date,
                attendances
            );

            res.json({
                success: true,
                message: 'Présences enregistrées',
                data: results
            });
        } catch (error) {
            console.error('Record batch attendance error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur enregistrement présences',
                error: error.message
            });
        }
    },

    async update(req, res) {
        try {
            const updated = await SchoolAttendanceModel.update(
                req.params.id,
                req.associationId,
                req.body
            );

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Présence non trouvée'
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
                message: 'Erreur mise à jour présence',
                error: error.message
            });
        }
    },

    async getClassStats(req, res) {
        try {
            const { class_id, from_date, to_date } = req.query;

            if (!class_id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID classe requis'
                });
            }

            const stats = await SchoolAttendanceModel.getClassAttendanceStats(
                class_id,
                req.associationId,
                from_date,
                to_date
            );

            const recentSessions = await SchoolAttendanceModel.getRecentSessions(
                class_id,
                req.associationId
            );

            res.json({
                success: true,
                data: {
                    stats,
                    recentSessions
                }
            });
        } catch (error) {
            console.error('Get class attendance stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur statistiques présences',
                error: error.message
            });
        }
    }
};

module.exports = attendanceController;
