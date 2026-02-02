require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');

const { testConnection } = require('./config/db');
const PaymentStatusService = require('./services/paymentStatus.service');
const RelanceAutoService = require('./services/relanceAuto.service');

const authRoutes = require('./routes/auth.routes');
const adherentsRoutes = require('./routes/adherents.routes');
const cotisationsRoutes = require('./routes/cotisations.routes');
const eventsRoutes = require('./routes/events.routes');
const intervenantsRoutes = require('./routes/intervenants.routes');
const messagesRoutes = require('./routes/messages.routes');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API Association - En ligne',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/adherents', adherentsRoutes);
app.use('/api/cotisations', cotisationsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/intervenants', intervenantsRoutes);
app.use('/api/messages', messagesRoutes);

// ========== SERVIR LES FICHIERS STATIQUES ==========
// En production (Cloud Run), servir le frontend
if (process.env.NODE_ENV === 'production') {
    // Fichiers statiques du frontend (app de gestion)
    app.use('/app', express.static(path.join(__dirname, '../frontend')));

    // Fichiers statiques des landing pages
    app.use('/landing', express.static(path.join(__dirname, '../landing')));

    // Page Ramadan accessible à la racine /ramadan
    app.get('/ramadan', (req, res) => {
        res.sendFile(path.join(__dirname, '../landing/ramadan.html'));
    });

    // Landing page principale
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../landing/index.html'));
    });

    // Rediriger /app vers l'index du frontend
    app.get('/app', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    });

    // SPA fallback - pour les routes du frontend
    app.get('/app/*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    });
}

// Route 404 pour les API uniquement
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route API non trouvée'
    });
});

// Fallback 404 pour les autres routes
app.use((req, res) => {
    if (process.env.NODE_ENV === 'production') {
        res.sendFile(path.join(__dirname, '../landing/index.html'));
    } else {
        res.status(404).json({
            success: false,
            message: 'Route non trouvée'
        });
    }
});

app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err);
    res.status(500).json({
        success: false,
        message: 'Erreur serveur interne',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Mise à jour des statuts de paiement...');
    try {
        await PaymentStatusService.updateOverdueStatus();
    } catch (error) {
        console.error('[CRON] Erreur mise à jour statuts:', error);
    }
});

cron.schedule('0 9 * * 1', async () => {
    console.log('[CRON] Envoi des relances automatiques...');
    try {
        await RelanceAutoService.processAutoRelances();
    } catch (error) {
        console.error('[CRON] Erreur relances:', error);
    }
});

const startServer = async () => {
    const dbConnected = await testConnection();

    if (!dbConnected) {
        console.warn('⚠ Démarrage sans connexion MySQL - Certaines fonctionnalités seront indisponibles');
    }

    app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════════╗
║     API Gestion Association                ║
║     Port: ${PORT}                             ║
║     Environnement: ${process.env.NODE_ENV || 'development'}           ║
╚════════════════════════════════════════════╝
        `);
        console.log('Routes disponibles:');
        console.log('  - GET  /api/health');
        console.log('  - POST /api/auth/login');
        console.log('  - POST /api/auth/register');
        console.log('  - GET  /api/adherents');
        console.log('  - GET  /api/cotisations');
        console.log('  - GET  /api/events');
        console.log('  - GET  /api/intervenants');
        console.log('  - GET  /api/messages');
    });
};

startServer();
