class AppState {
    constructor() {
        this.state = {
            user: null,
            association: null,
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
        const savedAssociation = localStorage.getItem('association');

        if (savedToken && savedUser) {
            try {
                this.set('user', JSON.parse(savedUser));
                this.set('isAuthenticated', true);

                if (savedAssociation) {
                    this.set('association', JSON.parse(savedAssociation));
                }
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

    setAuth(user, token, association = null) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this.set('user', user);
        this.set('isAuthenticated', true);

        if (association) {
            localStorage.setItem('association', JSON.stringify(association));
            this.set('association', association);
        }
    }

    clearAuth() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('association');
        this.set('user', null);
        this.set('association', null);
        this.set('isAuthenticated', false);
    }

    getAssociation() {
        return this.state.association;
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
