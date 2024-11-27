const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5001; // Change to a different port


// Middleware
app.use(bodyParser.json());

// Test route
app.get('/', (req, res) => {
    res.send('Study-Buddy Finder Backend Running!');
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
