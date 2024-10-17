const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const productsRoutes = require('./routes/products'); // Import products route
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Set up body-parser for form handling
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public')); // Assuming your JS file is in a public directory


// Set the path to the database file
const dbPath = path.join(__dirname, 'db', 'products.db');

// Create a new database instance
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Database path:', dbPath);
        console.log('Connected to the SQLite database.');
    }
});

// Use products routes
app.use('/products', productsRoutes(db)); // Pass the db instance to the products router

// Serve static files from the 'public' directory (make sure your index.html is in there)
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve index.html as the default page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
