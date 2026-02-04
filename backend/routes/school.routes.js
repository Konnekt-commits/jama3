const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const studentsController = require('../controllers/school/students.controller');
const classesController = require('../controllers/school/classes.controller');
const attendanceController = require('../controllers/school/attendance.controller');
const feesController = require('../controllers/school/fees.controller');
const evaluationsController = require('../controllers/school/evaluations.controller');

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

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

module.exports = router;
