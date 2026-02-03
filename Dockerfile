# ================================
# jama3 - Gestion d'association
# Dockerfile pour Cloud Run
# ================================

FROM node:20-alpine

LABEL maintainer="jama3"
LABEL description="jama3 - Application de gestion d'association"

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=8080

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json du backend
COPY backend/package*.json ./backend/

# Installer les dépendances de production uniquement
WORKDIR /app/backend
RUN npm ci --only=production

# Revenir au répertoire racine
WORKDIR /app

# Copier le reste du code
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY landing/ ./landing/
COPY database/ ./database/

# Exposer le port
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Démarrer l'application
WORKDIR /app/backend
CMD ["node", "server.js"]
