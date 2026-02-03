const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT = __dirname;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
    let filePath = path.join(ROOT, req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath);

    // Si c'est un fichier statique qui existe, le servir
    if (ext && fs.existsSync(filePath)) {
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Erreur serveur');
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            }
        });
    } else {
        // SPA fallback: retourner index.html pour toutes les autres routes
        fs.readFile(path.join(ROOT, 'index.html'), (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Erreur serveur');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            }
        });
    }
});

server.listen(PORT, () => {
    console.log(`Frontend SPA: http://localhost:${PORT}`);
});
