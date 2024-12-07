const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const productsRoutes = require('./routes/products');
const cartsRoutes = require('./routes/carts');
const usersRoutes = require('./routes/users');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Add session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use((req, res, next) => {
    res.locals.isAuthenticated = !!req.session.userId;
    next();
});

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

// Use carts routes
app.use('/carts', cartsRoutes(db));

// Use users routes
app.use('/users', usersRoutes(db));

// Signin status
app.get('/auth-status', (req, res) => {
    const isAuthenticated = !!req.session.userId;
    res.json({ isAuthenticated, userId: req.session.userId });
});

// Serve files to public folder
app.use(express.static('public'));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});