const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const productsRoutes = require('./routes/products'); // Import products route

const app = express();
const PORT = process.env.PORT || 3000;

// Set up body-parser for form handling
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files

// Set the path to the database file
const dbPath = path.join(__dirname, 'db', 'luckys.db');

// Create a new database instance
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Database path:', dbPath);
        console.log('Connected to the SQLite database.');

        // Run create_tables.sql to initialize tables
        const createTablesSQL = fs.readFileSync(path.join(__dirname, 'db', 'create_tables.sql')).toString();
        db.exec(createTablesSQL, (err) => {
            if (err) {
                console.error('Error executing create_tables.sql:', err.message);
            } else {
                console.log('Tables created or already exist.');

                // Run insert_categories.sql to populate initial categories
                const insertCategoriesSQL = fs.readFileSync(path.join(__dirname, 'db', 'insert_categories.sql')).toString();
                db.exec(insertCategoriesSQL, (err) => {
                    if (err) {
                        console.error('Error executing insert_categories.sql:', err.message);
                    } else {
                        console.log('Initial categories inserted.');
                    }
                });

                // Run insert_products.sql to populate initial products
                const insertProductsSQL = fs.readFileSync(path.join(__dirname, 'db', 'insert_products.sql')).toString();
                db.exec(insertProductsSQL, (err) => {
                    if (err) {
                        console.error('Error executing insert_products.sql:', err.message);
                    } else {
                        console.log('Initial products inserted.');
                    }
                });
            }
        });
    }
});

// Use products routes
app.use('/products', productsRoutes(db));

// Serve static files from the 'public' directory on index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});