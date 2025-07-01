const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const app = express();

// Iniciar JSON Server automáticamente
const jsonServer = spawn('npx', ['json-server', '--watch', 'db.json', '--port', '3001']);

jsonServer.stdout.on('data', (data) => {
  console.log(`JSON Server: ${data}`);
});

jsonServer.stderr.on('data', (data) => {
  console.error(`JSON Server error: ${data}`);
});

jsonServer.on('close', (code) => {
  console.log(`JSON Server process exited with code ${code}`);
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Proxy para las API requests
app.use('/api', (req, res) => {
  fetch(`http://localhost:3001${req.url}`)
    .then(apiRes => apiRes.json())
    .then(data => res.json(data))
    .catch(err => res.status(500).json({ error: 'Error al conectar con la API' }));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor principal corriendo en http://localhost:${PORT}`);
  console.log(`JSON Server debería estar en http://localhost:3001`);
});