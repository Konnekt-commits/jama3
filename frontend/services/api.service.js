import appState from '../store/appState.store.js';

class ApiService {
    constructor() {
        // En production, utiliser une URL relative
        this.baseUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:3000/api'
            : '/api';
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;

        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);

            if (response.status === 401) {
                appState.clearAuth();
                window.location.href = '/login';
                throw new Error('Session expirée');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur serveur');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    get(endpoint, params = {}) {
        // Filter out undefined/null values
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
        );
        const queryString = new URLSearchParams(cleanParams).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // ========== AUTHENTICATION ==========

    async login(email, password, associationSlug = null) {
        const payload = { email, password };
        if (associationSlug) {
            payload.association_slug = associationSlug;
        }

        const response = await this.post('/auth/login', payload);

        // Handle multi-association selection
        if (response.requireAssociationSelection) {
            return response;
        }

        if (response.success) {
            appState.setAuth(response.data.user, response.data.token, response.data.association);
        }
        return response;
    }

    async register(userData) {
        const response = await this.post('/auth/register', userData);
        if (response.success) {
            appState.setAuth(response.data.user, response.data.token, response.data.association);
        }
        return response;
    }

    logout() {
        appState.clearAuth();
    }

    async getMe() {
        const response = await this.get('/auth/me');
        if (response.success && response.data.association) {
            appState.set('association', response.data.association);
        }
        return response;
    }

    // ========== ASSOCIATIONS ==========

    async createAssociation(data) {
        const response = await this.post('/associations', data);
        if (response.success) {
            appState.setAuth(response.data.user, response.data.token, response.data.association);
        }
        return response;
    }

    async getAssociation() {
        return this.get('/associations/current');
    }

    async updateAssociation(data) {
        return this.put('/associations/current', data);
    }

    async getAssociationStats() {
        return this.get('/associations/stats');
    }

    async checkSlugAvailability(slug) {
        return this.get(`/associations/check-slug/${slug}`);
    }

    // ========== ADHERENTS ==========

    async getAdherents(params = {}) {
        return this.get('/adherents', params);
    }

    async getAdherent(id) {
        return this.get(`/adherents/${id}`);
    }

    async createAdherent(data) {
        return this.post('/adherents', data);
    }

    async updateAdherent(id, data) {
        return this.put(`/adherents/${id}`, data);
    }

    async deleteAdherent(id) {
        return this.delete(`/adherents/${id}`);
    }

    async getAdherentStats() {
        return this.get('/adherents/stats');
    }

    // ========== COTISATIONS ==========

    async getCotisations(params = {}) {
        return this.get('/cotisations', params);
    }

    async getCotisation(id) {
        return this.get(`/cotisations/${id}`);
    }

    async createCotisation(data) {
        return this.post('/cotisations', data);
    }

    async updateCotisation(id, data) {
        return this.put(`/cotisations/${id}`, data);
    }

    async registerPayment(id, amount, method) {
        return this.post(`/cotisations/${id}/payment`, { amount, method });
    }

    async getCotisationStats(season) {
        return this.get('/cotisations/stats', season ? { season } : {});
    }

    async getOverdueCotisations() {
        return this.get('/cotisations/overdue');
    }

    // ========== EVENTS ==========

    async getEvents(params = {}) {
        return this.get('/events', params);
    }

    async getEvent(id) {
        return this.get(`/events/${id}`);
    }

    async createEvent(data) {
        return this.post('/events', data);
    }

    async updateEvent(id, data) {
        return this.put(`/events/${id}`, data);
    }

    async deleteEvent(id) {
        return this.delete(`/events/${id}`);
    }

    async getUpcomingEvents(limit = 5) {
        return this.get('/events/upcoming', { limit });
    }

    async getEventParticipants(eventId) {
        return this.get(`/events/${eventId}/participants`);
    }

    async addEventParticipant(eventId, adherentId) {
        return this.post(`/events/${eventId}/participants`, { adherent_id: adherentId });
    }

    // ========== INTERVENANTS ==========

    async getIntervenants(params = {}) {
        return this.get('/intervenants', params);
    }

    async getIntervenant(id) {
        return this.get(`/intervenants/${id}`);
    }

    async createIntervenant(data) {
        return this.post('/intervenants', data);
    }

    async updateIntervenant(id, data) {
        return this.put(`/intervenants/${id}`, data);
    }

    async deleteIntervenant(id) {
        return this.delete(`/intervenants/${id}`);
    }

    // ========== MESSAGES ==========

    async getMessages(params = {}) {
        return this.get('/messages', params);
    }

    async getMyMessages(unreadOnly = false) {
        return this.get('/messages/me', { unread: unreadOnly });
    }

    async sendMessage(data) {
        return this.post('/messages', data);
    }

    async markMessageAsRead(id) {
        return this.put(`/messages/${id}/read`);
    }

    async getUnreadCount() {
        return this.get('/messages/unread-count');
    }

    // ========== ÉCOLE ARABE - ÉLÈVES ==========

    async getStudents(params = {}) {
        return this.get('/school/students', params);
    }

    async getStudent(id) {
        return this.get(`/school/students/${id}`);
    }

    async createStudent(data) {
        return this.post('/school/students', data);
    }

    async updateStudent(id, data) {
        return this.put(`/school/students/${id}`, data);
    }

    async deleteStudent(id) {
        return this.delete(`/school/students/${id}`);
    }

    async getStudentStats() {
        return this.get('/school/students/stats');
    }

    async getStudentAttendance(id, limit = 50) {
        return this.get(`/school/students/${id}/attendance`, { limit });
    }

    async getStudentEvaluations(id, limit = 20) {
        return this.get(`/school/students/${id}/evaluations`, { limit });
    }

    // ========== ÉCOLE ARABE - CLASSES ==========

    async getSchoolClasses(params = {}) {
        return this.get('/school/classes', params);
    }

    async getSchoolClass(id) {
        return this.get(`/school/classes/${id}`);
    }

    async createSchoolClass(data) {
        return this.post('/school/classes', data);
    }

    async updateSchoolClass(id, data) {
        return this.put(`/school/classes/${id}`, data);
    }

    async deleteSchoolClass(id) {
        return this.delete(`/school/classes/${id}`);
    }

    async getSchoolClassStats() {
        return this.get('/school/classes/stats');
    }

    async enrollStudentInClass(classId, studentId) {
        return this.post(`/school/classes/${classId}/enroll`, { student_id: studentId });
    }

    async unenrollStudentFromClass(classId, studentId) {
        return this.delete(`/school/classes/${classId}/enroll/${studentId}`);
    }

    // ========== ÉCOLE ARABE - PRÉSENCES ==========

    async getClassAttendance(classId, date) {
        return this.get('/school/attendance', { class_id: classId, date });
    }

    async recordAttendance(classId, sessionDate, attendances) {
        return this.post('/school/attendance', { class_id: classId, session_date: sessionDate, attendances });
    }

    async updateAttendance(id, data) {
        return this.put(`/school/attendance/${id}`, data);
    }

    async getAttendanceStats(classId, fromDate, toDate) {
        return this.get('/school/attendance/stats', { class_id: classId, from_date: fromDate, to_date: toDate });
    }

    // ========== ÉCOLE ARABE - FRAIS ==========

    async getSchoolFees(params = {}) {
        return this.get('/school/fees', params);
    }

    async getSchoolFee(id) {
        return this.get(`/school/fees/${id}`);
    }

    async createSchoolFee(data) {
        return this.post('/school/fees', data);
    }

    async updateSchoolFee(id, data) {
        return this.put(`/school/fees/${id}`, data);
    }

    async deleteSchoolFee(id) {
        return this.delete(`/school/fees/${id}`);
    }

    async markSchoolFeePaid(id, paymentMethod = 'cash') {
        return this.post(`/school/fees/${id}/pay`, { payment_method: paymentMethod });
    }

    async recordPartialSchoolFeePayment(id, amount, paymentMethod = 'cash') {
        return this.post(`/school/fees/${id}/partial-payment`, { amount, payment_method: paymentMethod });
    }

    async generateBatchFees(data) {
        return this.post('/school/fees/generate', data);
    }

    async getSchoolFeeStats(academicYear) {
        return this.get('/school/fees/stats', academicYear ? { academic_year: academicYear } : {});
    }

    // ========== ÉCOLE ARABE - ÉVALUATIONS ==========

    async getEvaluations(params = {}) {
        return this.get('/school/evaluations', params);
    }

    async getEvaluation(id) {
        return this.get(`/school/evaluations/${id}`);
    }

    async createEvaluation(data) {
        return this.post('/school/evaluations', data);
    }

    async updateEvaluation(id, data) {
        return this.put(`/school/evaluations/${id}`, data);
    }

    async deleteEvaluation(id) {
        return this.delete(`/school/evaluations/${id}`);
    }

    async getStudentEvaluationStats(studentId, classId) {
        return this.get(`/school/evaluations/student/${studentId}/stats`, classId ? { class_id: classId } : {});
    }

    async getClassEvaluationStats(classId) {
        return this.get(`/school/evaluations/class/${classId}/stats`);
    }

    // ========== ÉCOLE ARABE - PROGRAMMES PÉDAGOGIQUES ==========

    async getPrograms(params = {}) {
        return this.get('/school/programs', params);
    }

    async getProgram(id) {
        return this.get(`/school/programs/${id}`);
    }

    async createProgram(data) {
        return this.post('/school/programs', data);
    }

    async updateProgram(id, data) {
        return this.put(`/school/programs/${id}`, data);
    }

    async deleteProgram(id) {
        return this.delete(`/school/programs/${id}`);
    }

    // ========== ÉCOLE ARABE - CONTENUS PÉDAGOGIQUES ==========

    async getSchoolContent(params = {}) {
        return this.get('/school/content', params);
    }

    async createSchoolContent(data) {
        return this.post('/school/content', data);
    }

    async deleteSchoolContent(id) {
        return this.delete(`/school/content/${id}`);
    }

    // ========== ÉCOLE ARABE - PROGRESSION / BADGES ==========

    async getAvailableBadges() {
        return this.get('/school/progress/badges/available');
    }

    async getStudentProgress(studentId) {
        return this.get(`/school/progress/student/${studentId}`);
    }

    async getStudentBadges(studentId) {
        return this.get(`/school/progress/student/${studentId}/badges`);
    }

    async createStudentProgress(data) {
        return this.post('/school/progress', data);
    }

    async deleteStudentProgress(id) {
        return this.delete(`/school/progress/${id}`);
    }

    // ========== ÉCOLE ARABE - ANNONCES (ENT) ==========

    async getSchoolAnnouncements(params = {}) {
        return this.get('/school/announcements', params);
    }

    async getSchoolAnnouncement(id) {
        return this.get(`/school/announcements/${id}`);
    }

    async createSchoolAnnouncement(data) {
        return this.post('/school/announcements', data);
    }

    async updateSchoolAnnouncement(id, data) {
        return this.put(`/school/announcements/${id}`, data);
    }

    async deleteSchoolAnnouncement(id) {
        return this.delete(`/school/announcements/${id}`);
    }

    async publishSchoolAnnouncement(id) {
        return this.post(`/school/announcements/${id}/publish`);
    }

    // ========== ÉCOLE ARABE - MESSAGERIE PROF-PARENTS ==========

    async getSchoolMessages(params = {}) {
        return this.get('/school/messages', params);
    }

    async getSchoolConversation(studentId) {
        return this.get(`/school/messages/conversation/${studentId}`);
    }

    async getSchoolUnreadCount() {
        return this.get('/school/messages/unread-count');
    }

    async sendSchoolMessage(data) {
        return this.post('/school/messages', data);
    }

    async markSchoolMessageAsRead(id) {
        return this.put(`/school/messages/${id}/read`);
    }

    // ========== ÉCOLE ARABE - ENSEIGNANTS ==========

    async getSchoolTeachers(params = {}) {
        return this.get('/school/teachers', params);
    }

    async getSchoolTeachersStats() {
        return this.get('/school/teachers/stats');
    }

    async getSchoolTeacher(id) {
        return this.get(`/school/teachers/${id}`);
    }

    async getAvailableIntervenants() {
        return this.get('/school/teachers/available');
    }

    async markAsTeacher(id) {
        return this.post(`/school/teachers/${id}/mark-as-teacher`);
    }

    async removeTeacherStatus(id) {
        return this.post(`/school/teachers/${id}/remove-teacher`);
    }

    async createTeacher(data) {
        return this.post('/school/teachers', data);
    }

    // ========== ÉCOLE ARABE - PARENTS ==========

    async getSchoolParents() {
        return this.get('/school/parents');
    }

    async getParentChildren(parentId) {
        return this.get(`/school/parents/${parentId}/children`);
    }

    // ========== ÉCOLE ARABE - THÈMES / TOPICS ==========

    async getSchoolTopics() {
        return this.get('/school/topics');
    }

    async getSchoolTopicsByCategory() {
        return this.get('/school/topics/by-category');
    }

    async createSchoolTopic(data) {
        return this.post('/school/topics', data);
    }

    async deleteSchoolTopic(id) {
        return this.delete(`/school/topics/${id}`);
    }

    async getClassTopics(classId) {
        return this.get(`/school/classes/${classId}/topics`);
    }

    async updateClassTopics(classId, topicIds) {
        return this.put(`/school/classes/${classId}/topics`, { topic_ids: topicIds });
    }
}

export default new ApiService();
