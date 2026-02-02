import apiService from './api.service.js';
import appState from '../store/appState.store.js';
import router from '../router/router.js';

class AuthService {
    async login(email, password) {
        try {
            const response = await apiService.login(email, password);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async register(userData) {
        try {
            const response = await apiService.register(userData);
            return response;
        } catch (error) {
            throw error;
        }
    }

    logout() {
        apiService.logout();
        router.navigate('/login');
    }

    isAuthenticated() {
        return appState.get('isAuthenticated');
    }

    getUser() {
        return appState.get('user');
    }

    hasRole(roles) {
        const user = this.getUser();
        if (!user) return false;

        if (Array.isArray(roles)) {
            return roles.includes(user.role);
        }
        return user.role === roles;
    }

    async checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            return false;
        }

        try {
            const response = await apiService.getMe();
            if (response.success) {
                appState.set('user', response.data.user);
                appState.set('isAuthenticated', true);
                return true;
            }
            return false;
        } catch (error) {
            this.logout();
            return false;
        }
    }

    async updateProfile(data) {
        try {
            const response = await apiService.put('/auth/profile', data);
            if (response.success) {
                appState.set('user', response.data.user);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response;
        } catch (error) {
            throw error;
        }
    }

    async changePassword(currentPassword, newPassword) {
        try {
            const response = await apiService.put('/auth/password', {
                current_password: currentPassword,
                new_password: newPassword
            });
            return response;
        } catch (error) {
            throw error;
        }
    }
}

export default new AuthService();
