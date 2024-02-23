const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

const app = express();

const node_port = process.env.NODE_PORT || 5000; // Default to port 5000 if NODE_PORT is not specified

app.use(cors());

try {
    // Explicitly require the public directory
    const publicPath = path.join(__dirname, 'public');
    app.use(express.static(publicPath));
} catch (error) {
    console.error('Error serving static files:', error);
}

app.get('/config', (req, res) => {
    const ipAddress = process.env.IP_ADDRESS || '192.168.0.34'; // Default to 127.0.0.1 if IP_ADDRESS is not specified
    const port = process.env.PORT || 5001; // Default to port 5001 if PORT is not specified
    res.json({ ipAddress, port });
});

app.listen(node_port, () => {
    console.log(`Server is running on http://localhost:${node_port}`);
});

