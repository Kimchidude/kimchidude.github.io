const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const path = require('path');

let db;

// Function to initialize the router
function initializeRoutes(database) {
    db = database;

    // Sign-in route
    router.post('/signin', async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        try {
            // Query to find the user by email
            const user = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                });
            });

            if (!user) {
                return res.status(401).json({ error: 'User not found or invalid credentials.' });
            }

            // Compare password with hashed password in the database
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials.' });
            }

            // If credentials are valid, start a session and redirect
            req.session.userId = user.id;
            res.redirect('/'); // Redirect to the home page or dashboard
        } catch (error) {
            console.error('Error during sign-in:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // User registration route
    router.post('/register', async (req, res) => {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        try {
            // Check if the email already exists
            const existingUser = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                });
            });

            if (existingUser) {
                return res.status(400).json({ error: 'Email already exists.' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert the new user into the database
            const result = await new Promise((resolve, reject) => {
                db.run(
                    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                    [name, email, hashedPassword],
                    function (err) {
                        if (err) reject(err);
                        resolve({ id: this.lastID });
                    }
                );
            });

            res.status(201).json({ success: true, userId: result.id });
        } catch (error) {
            console.error('Error during registration:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Auth status route
    router.get('/auth-status', (req, res) => {
        const isAuthenticated = !!req.session.userId;

        if (isAuthenticated) {
            // Fetch user type from the database
            const userId = req.session.userId;
            db.get('SELECT user_type FROM users WHERE id = ?', [userId], (err, row) => {
                if (err) {
                    console.error('Error fetching user type:', err.message);
                    return res.status(500).json({ isAuthenticated, userType: 'error' });
                }

                if (row) {
                    // Send the authentication status and user type
                    res.json({ isAuthenticated, userId, userType: row.user_type });
                } else {
                    // Fallback if user not found
                    res.json({ isAuthenticated, userId, userType: 'user' });
                }
            });
        } else {
            // If not authenticated
            res.json({ isAuthenticated, userId: null, userType: 'user' });
        }
    });

    // Logout
    router.post('/logout', (req, res) => {
        console.log('Logout route hit');
        req.session.destroy((err) => {
            if (err) {
                console.error('Error during logout:', err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                console.log('Session destroyed successfully');
                res.redirect('/'); // Redirect to the home page or login page
            }
        });
    });

}
// Initialize routes with the db instance
module.exports = (database) => {
    db = database;
    initializeRoutes(db);
    return router;
};
