class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.beforeEach = null;
        this.afterEach = null;

        // Détecter le base path (/app en production)
        this.basePath = window.location.pathname.startsWith('/app') ? '/app' : '';

        window.addEventListener('popstate', () => this.handleRouteChange());
        document.addEventListener('click', (e) => this.handleLinkClick(e));
    }

    // Obtenir le chemin sans le basePath
    getPath() {
        let path = window.location.pathname;
        if (this.basePath && path.startsWith(this.basePath)) {
            path = path.slice(this.basePath.length) || '/';
        }
        return path;
    }

    addRoute(path, handler, options = {}) {
        this.routes.set(path, { handler, options });
    }

    setBeforeEach(callback) {
        this.beforeEach = callback;
    }

    setAfterEach(callback) {
        this.afterEach = callback;
    }

    navigate(path, replace = false) {
        if (path === this.currentRoute) return;

        // Ajouter le basePath pour la navigation
        const fullPath = this.basePath + path;

        if (replace) {
            history.replaceState(null, '', fullPath);
        } else {
            history.pushState(null, '', fullPath);
        }

        this.handleRouteChange();
    }

    async handleRouteChange() {
        const path = this.getPath();
        const route = this.matchRoute(path);

        if (this.beforeEach) {
            const canProceed = await this.beforeEach(route, this.currentRoute);
            if (!canProceed) return;
        }

        const previousRoute = this.currentRoute;
        this.currentRoute = path;

        if (route) {
            const pageContent = document.getElementById('page-content');

            pageContent.classList.add('page-exit');

            await new Promise(resolve => setTimeout(resolve, 150));

            pageContent.innerHTML = '';
            pageContent.classList.remove('page-exit');
            pageContent.classList.add('page-enter');

            await route.handler(route.params);

            requestAnimationFrame(() => {
                pageContent.classList.remove('page-enter');
                pageContent.classList.add('page-enter-active');

                setTimeout(() => {
                    pageContent.classList.remove('page-enter-active');
                }, 250);
            });
        } else {
            this.navigate('/404', true);
        }

        if (this.afterEach) {
            this.afterEach(route, previousRoute);
        }
    }

    matchRoute(path) {
        for (const [pattern, config] of this.routes) {
            const params = this.matchPattern(pattern, path);
            if (params !== null) {
                return { ...config, params, path: pattern };
            }
        }
        return null;
    }

    matchPattern(pattern, path) {
        const patternParts = pattern.split('/').filter(Boolean);
        const pathParts = path.split('/').filter(Boolean);

        if (patternParts.length !== pathParts.length) {
            return null;
        }

        const params = {};

        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i];
            const pathPart = pathParts[i];

            if (patternPart.startsWith(':')) {
                params[patternPart.slice(1)] = pathPart;
            } else if (patternPart !== pathPart) {
                return null;
            }
        }

        return params;
    }

    handleLinkClick(e) {
        const link = e.target.closest('a[data-link]');
        if (link) {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href) {
                this.navigate(href);
            }
        }
    }

    getParam(name) {
        const route = this.matchRoute(this.getPath());
        return route ? route.params[name] : null;
    }

    getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }

    start() {
        this.handleRouteChange();
    }
}

export default new Router();
