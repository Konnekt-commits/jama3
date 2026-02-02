import appState from '../store/appState.store.js';

class ApiService {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
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
        const queryString = new URLSearchParams(params).toString();
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

    async login(email, password) {
        const response = await this.post('/auth/login', { email, password });
        if (response.success) {
            appState.setAuth(response.data.user, response.data.token);
        }
        return response;
    }

    async register(userData) {
        const response = await this.post('/auth/register', userData);
        if (response.success) {
            appState.setAuth(response.data.user, response.data.token);
        }
        return response;
    }

    logout() {
        appState.clearAuth();
    }

    async getMe() {
        return this.get('/auth/me');
    }

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
}

export default new ApiService();
