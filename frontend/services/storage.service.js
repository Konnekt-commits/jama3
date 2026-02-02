class StorageService {
    constructor(prefix = 'assos_') {
        this.prefix = prefix;
    }

    getKey(key) {
        return `${this.prefix}${key}`;
    }

    set(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(this.getKey(key), serialized);
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    }

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.getKey(key));
            if (item === null) return defaultValue;
            return JSON.parse(item);
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    }

    remove(key) {
        try {
            localStorage.removeItem(this.getKey(key));
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }

    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }

    has(key) {
        return localStorage.getItem(this.getKey(key)) !== null;
    }

    setWithExpiry(key, value, ttlMs) {
        const item = {
            value,
            expiry: Date.now() + ttlMs
        };
        return this.set(key, item);
    }

    getWithExpiry(key, defaultValue = null) {
        const item = this.get(key);

        if (!item) return defaultValue;

        if (Date.now() > item.expiry) {
            this.remove(key);
            return defaultValue;
        }

        return item.value;
    }
}

export default new StorageService();
