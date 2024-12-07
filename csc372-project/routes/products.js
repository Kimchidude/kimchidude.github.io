const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const csv = require('csv-parser');

let db;

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /json|csv|txt/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (extname) {
            return cb(null, true);
        } else {
            return cb(new Error('Unsupported file type. Only .json, .csv, .txt files are allowed.'));
        }
    }
});

// Function to initialize the router
function initializeRoutes(database) {
    db = database;

    const parse = require('csv-parse/sync');

    // Upload route
    router.post('/upload-product-file', upload.single('file'), (req, res) => {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const fileBuffer = req.file.buffer;
        const ext = path.extname(req.file.originalname).toLowerCase();

        // Handle JSON uploads
        if (ext === '.json') {
            try {
                const data = fileBuffer.toString('utf8');
                const products = JSON.parse(data);

                console.log('Parsed products:', products); // Log the parsed products to check format

                const insertQuery = `INSERT INTO products (name, description, price, condition, edition, image, rarity) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                const stmt = db.prepare(insertQuery);

                products.forEach(product => {
                    stmt.run(
                        product.name, product.description, product.price,
                        product.condition, product.edition, product.image,
                        product.rarity, (err) => {
                            if (err) {
                                console.error("Error inserting product:", err.message);
                            } else {
                                console.log(`Inserted product: ${product.name}`);
                            }
                        }
                    );
                });

                stmt.finalize((err) => {
                    if (err) {
                        console.error('Error finalizing statement:', err.message);
                        return res.status(500).send('Error inserting products.');
                    }
                    console.log('All products inserted successfully!');
                    res.send('Products uploaded successfully!');
                });
            } catch (err) {
                console.error('Error processing JSON file:', err.message);
                return res.status(500).send('Error processing JSON file: ' + err.message);
            }
        }

        // Handle CSV uploads
        else if (ext === '.csv') {
            try {
                const fileContent = fileBuffer.toString('utf8');
                const records = parse(fileContent, {
                    columns: true,
                    skip_empty_lines: true,
                });

                console.log('Parsed CSV records:', records); // Log the parsed CSV records

                const insertQuery = `INSERT INTO products (name, description, price, condition, edition, image, rarity) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                const stmt = db.prepare(insertQuery);

                records.forEach(product => {
                    stmt.run(
                        product.name, product.description, product.price,
                        product.condition, product.edition, product.image,
                        product.rarity, (err) => {
                            if (err) {
                                console.error('Error inserting product:', err.message);
                            }
                        }
                    );
                });

                stmt.finalize((err) => {
                    if (err) {
                        console.error('Error finalizing statement:', err.message);
                        return res.status(500).send('Error inserting products.');
                    }
                    console.log('All CSV products inserted successfully!');
                    res.send('Products uploaded successfully!');
                });
            } catch (err) {
                console.error('Error processing CSV file:', err.message);
                return res.status(500).send('Error processing CSV file: ' + err.message);
            }
        }

        // Handle TXT uploads
        else if (ext === '.txt') {
            try {
                const fileContent = fileBuffer.toString('utf8');
                const lines = fileContent.split('\n').filter(line => line.trim() !== ''); // Filter out empty lines

                const products = lines.map(line => {
                    const [name, description, price, condition, edition, image, rarity] = line.split(',');
                    return { name, description, price, condition, edition, image, rarity };
                });

                console.log('Parsed TXT products:', products); // Log the parsed TXT products

                const insertQuery = `INSERT INTO products (name, description, price, condition, edition, image, rarity) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                const stmt = db.prepare(insertQuery);

                products.forEach(product => {
                    stmt.run(
                        product.name, product.description, product.price,
                        product.condition, product.edition, product.image,
                        product.rarity, (err) => {
                            if (err) {
                                console.error('Error inserting product:', err.message);
                            }
                        }
                    );
                });

                stmt.finalize((err) => {
                    if (err) {
                        console.error('Error finalizing statement:', err.message);
                        return res.status(500).send('Error inserting products.');
                    }
                    console.log('All TXT products inserted successfully!');
                    res.send('Products uploaded successfully!');
                });
            } catch (err) {
                console.error('Error processing TXT file:', err.message);
                return res.status(500).send('Error processing TXT file: ' + err.message);
            }
        } else {
            return res.status(400).send('Unsupported file type.');
        }
    });

    // Get all products
    router.get('/api/products', (req, res) => {
        const query = 'SELECT * FROM products';  // Adjust the query based on your table structure
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Error fetching products: ', err.message);
                return res.status(500).json({ error: 'Failed to fetch products' });
            }
            res.json({ products: rows });
        });
    });

    // Route to get the first 3 products
    router.get('/api/index-products', (req, res) => {
        const query = 'SELECT * FROM products LIMIT 3';
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Error fetching products for index:', err.message);
                return res.status(500).json({ error: 'Failed to fetch products' });
            }
            res.json({ products: rows });
        });
    });

    // Render edit product page
    router.get('/edit/:id', (req, res) => {
        const query = "SELECT * FROM products WHERE id = ?";
        db.get(query, [req.params.id], (err, row) => {
            if (err) {
                return res.status(500).send(err.message);
            }
            res.json(row);
        });
    });

    // Handle updating product
    router.post('/edit/:id', (req, res) => {
        const { name, description, category, image_path, price, rarity } = req.body;
        const query = `UPDATE products SET name = ?, description = ?, category = ?, image_path = ?, price = ?, rarity = ? WHERE id = ?`;
        db.run(query, [name, description, category, image_path, price, rarity, req.params.id], function (err) {
            if (err) {
                return res.status(500).send(err.message);
            }
            res.redirect('/products');
        });
    });

    // Handle deleting a product
    router.post('/delete/:id', (req, res) => {
        const query = `DELETE FROM products WHERE id = ?`;
        db.run(query, [req.params.id], function (err) {
            if (err) {
                return res.status(500).send(err.message);
            }
            res.redirect('/products');
        });
    });

    // Add a new product
    router.post('/add', (req, res) => {
        const { name, description, category, image_path, price, rarity } = req.body;
        const query = `INSERT INTO products (name, description, category, image_path, price, rarity) VALUES (?, ?, ?, ?, ?, ?)`;
        db.run(query, [name, description, category, image_path, price, rarity], function (err) {
            if (err) {
                return res.status(500).send(err.message);
            }
            res.redirect('/products');
        });
    });

    // Get product by id
    router.get('/api/products/:id', (req, res) => {
        const productId = req.params.id;
        db.get('SELECT * FROM products WHERE id = ?', [productId], (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch product.' });
            }
            if (!row) {
                return res.status(404).json({ error: 'Product not found.' });
            }
            res.json(row);
        });
    });

    // Edit product by id
    router.put('/api/products/:id', (req, res) => {
        const productId = req.params.id;
        const { name, description, price, condition, edition, image, rarity } = req.body;

        const updateQuery = `
            UPDATE products 
            SET name = ?, description = ?, price = ?, condition = ?, edition = ?, image = ?, rarity = ? 
            WHERE id = ?`;

        db.run(updateQuery, [name, description, price, condition, edition, image, rarity, productId], function (err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to update product.' });
            }
            res.json({ message: 'Product updated successfully!' });
        });
    });
}

// Initialize routes with the db instance
module.exports = (database) => {
    db = database;
    initializeRoutes(db);
    return router; 
};

