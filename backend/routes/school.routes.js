const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middleware/auth.middleware');
const tenantMiddleware = require('../middleware/tenant.middleware');
const studentsController = require('../controllers/school/students.controller');
const classesController = require('../controllers/school/classes.controller');
const attendanceController = require('../controllers/school/attendance.controller');
const feesController = require('../controllers/school/fees.controller');
const evaluationsController = require('../controllers/school/evaluations.controller');
const programsController = require('../controllers/school/programs.controller');
const progressController = require('../controllers/school/progress.controller');
const announcementsController = require('../controllers/school/announcements.controller');
const messagesController = require('../controllers/school/messages.controller');

// Auth + Tenant middleware pour toutes les routes
router.use(authMiddleware);
router.use(tenantMiddleware);

// ==================== ÉLÈVES ====================
router.get('/students', studentsController.getAll);
router.get('/students/stats', studentsController.getStats);
router.get('/students/:id', studentsController.getById);
router.get('/students/:id/attendance', studentsController.getAttendance);
router.get('/students/:id/evaluations', studentsController.getEvaluations);
router.post('/students', studentsController.create);
router.put('/students/:id', studentsController.update);
router.delete('/students/:id', studentsController.delete);

// ==================== CLASSES ====================
router.get('/classes', classesController.getAll);
router.get('/classes/stats', classesController.getStats);
router.get('/classes/:id', classesController.getById);
router.post('/classes', classesController.create);
router.put('/classes/:id', classesController.update);
router.delete('/classes/:id', classesController.delete);
router.post('/classes/:id/enroll', classesController.enrollStudent);
router.delete('/classes/:id/enroll/:studentId', classesController.unenrollStudent);

// ==================== PRÉSENCES ====================
router.get('/attendance', attendanceController.getByClassAndDate);
router.get('/attendance/stats', attendanceController.getClassStats);
router.post('/attendance', attendanceController.recordBatch);
router.put('/attendance/:id', attendanceController.update);

// ==================== FRAIS DE SCOLARITÉ ====================
router.get('/fees', feesController.getAll);
router.get('/fees/stats', feesController.getStats);
router.get('/fees/:id', feesController.getById);
router.post('/fees', feesController.create);
router.post('/fees/generate', feesController.generateBatch);
router.put('/fees/:id', feesController.update);
router.delete('/fees/:id', feesController.delete);
router.post('/fees/:id/pay', feesController.markAsPaid);
router.post('/fees/:id/partial-payment', feesController.recordPartialPayment);

// ==================== ÉVALUATIONS ====================
router.get('/evaluations', evaluationsController.getAll);
router.get('/evaluations/student/:studentId/stats', evaluationsController.getStudentStats);
router.get('/evaluations/class/:classId/stats', evaluationsController.getClassStats);
router.get('/evaluations/:id', evaluationsController.getById);
router.post('/evaluations', evaluationsController.create);
router.put('/evaluations/:id', evaluationsController.update);
router.delete('/evaluations/:id', evaluationsController.delete);

// ==================== PROGRAMMES PÉDAGOGIQUES ====================
router.get('/programs', programsController.getAll);
router.get('/programs/:id', programsController.getById);
router.post('/programs', programsController.create);
router.put('/programs/:id', programsController.update);
router.delete('/programs/:id', programsController.delete);

// Contenus pédagogiques
router.get('/content', programsController.getContent);
router.post('/content', programsController.createContent);
router.delete('/content/:id', programsController.deleteContent);

// ==================== PROGRESSION / BADGES ====================
router.get('/progress/badges/available', progressController.getAvailableBadges);
router.get('/progress/student/:studentId', progressController.getByStudent);
router.get('/progress/student/:studentId/badges', progressController.getBadges);
router.post('/progress', progressController.create);
router.delete('/progress/:id', progressController.delete);

// ==================== ANNONCES (ENT) ====================
router.get('/announcements', announcementsController.getAll);
router.get('/announcements/:id', announcementsController.getById);
router.post('/announcements', announcementsController.create);
router.put('/announcements/:id', announcementsController.update);
router.delete('/announcements/:id', announcementsController.delete);
router.post('/announcements/:id/publish', announcementsController.publish);

// ==================== MESSAGERIE PROF-PARENTS ====================
router.get('/messages', messagesController.getAll);
router.get('/messages/conversation/:studentId', messagesController.getConversation);
router.get('/messages/unread-count', messagesController.getUnreadCount);
router.post('/messages', messagesController.create);
router.put('/messages/:id/read', messagesController.markAsRead);

module.exports = router;
