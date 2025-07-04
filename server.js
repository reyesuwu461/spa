const express = require('express');
const path = require('path');
const app = express();

// Servir archivos estáticos (incluyendo la carpeta 'game')
app.use(express.static(path.join(__dirname)));
app.use('/game', express.static(path.join(__dirname, 'game')));

app.listen(3000, () => {
    console.log('Servidor en http://localhost:3000');
});
