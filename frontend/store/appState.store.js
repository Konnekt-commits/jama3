class AppState {
    constructor() {
        this.state = {
            user: null,
            isAuthenticated: false,
            theme: 'light',
            sidebarCollapsed: false,
            adherents: [],
            cotisations: [],
            events: [],
            intervenants: [],
            messages: [],
            unreadMessages: 0,
            loading: {
                global: false,
                adherents: false,
                cotisations: false,
                events: false
            },
            error: null
        };

        this.listeners = new Map();
        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.set('theme', savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);

        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
            try {
                this.set('user', JSON.parse(savedUser));
                this.set('isAuthenticated', true);
            } catch (e) {
                this.clearAuth();
            }
        }

        const sidebarState = localStorage.getItem('sidebarCollapsed');
        if (sidebarState) {
            this.set('sidebarCollapsed', sidebarState === 'true');
        }
    }

    get(key) {
        return this.state[key];
    }

    set(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;

        if (key === 'theme') {
            localStorage.setItem('theme', value);
            document.documentElement.setAttribute('data-theme', value);
        }

        if (key === 'sidebarCollapsed') {
            localStorage.setItem('sidebarCollapsed', value);
        }

        this.notify(key, value, oldValue);
    }

    setAuth(user, token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this.set('user', user);
        this.set('isAuthenticated', true);
    }

    clearAuth() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.set('user', null);
        this.set('isAuthenticated', false);
    }

    toggleTheme() {
        const newTheme = this.state.theme === 'light' ? 'dark' : 'light';
        this.set('theme', newTheme);
    }

    toggleSidebar() {
        this.set('sidebarCollapsed', !this.state.sidebarCollapsed);
    }

    setLoading(key, value) {
        this.set('loading', {
            ...this.state.loading,
            [key]: value
        });
    }

    setError(error) {
        this.set('error', error);
    }

    clearError() {
        this.set('error', null);
    }

    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);

        return () => {
            this.listeners.get(key).delete(callback);
        };
    }

    notify(key, newValue, oldValue) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(callback => {
                callback(newValue, oldValue);
            });
        }
    }

    getState() {
        return { ...this.state };
    }
}

export default new AppState();
