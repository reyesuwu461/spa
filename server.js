const express = require('express');
const path = require('path');
const app = express();

// Serve static files (including the 'game' folder)
app.use(express.static(path.join(__dirname)));
app.use('/game', express.static(path.join(__dirname, 'game')));

// Start the server
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
