const express = require('express');
const router = express.Router();
const path = require('path');

let db;
// Function to initialize the router
function initializeRoutes(database) {
    db = database;

    // Get cart by userId
    router.get('/api/cart/:userId', (req, res) => {
        const userId = req.params.userId;

        if (!userId) {
            console.log('User ID is not provided');
            return res.status(400).json({ error: 'User ID is required to view the cart.' });
        }

        db.all(
            `SELECT cp.id AS cartProductId, cp.quantity, p.id AS productId, p.name, p.image, p.price
        FROM carts c
        JOIN cartproducts cp ON c.id = cp.cart_id
        JOIN products p ON cp.product_id = p.id
        WHERE c.user_id = ? AND c.status = 'new'`,
            [userId],
            (err, rows) => {
                if (err) {
                    console.error('Error fetching cart:', err);
                    return res.status(500).json({ error: 'Failed to fetch cart.' });
                }

                if (rows.length === 0) {
                    console.log('Cart is empty');
                    return res.json({ cart: [], message: 'Your cart is empty.' });
                }

                console.log('Fetched cart items:', rows);
                res.json({ cart: rows });
            }
        );
    });



    // Add product to cart
    router.post('/api/cart/add', (req, res) => {
        const { productId } = req.body;
        const userId = req.session.userId; // Ensure user is logged in

        if (!userId) {
            return res.status(401).json({ error: 'You must be logged in to add to cart.' });
        }

        // Find the user's active cart or create a new one
        db.get(`SELECT id FROM carts WHERE user_id = ? AND status = 'new'`, [userId], (err, cart) => {
            if (err) {
                console.error('Error finding cart:', err);
                return res.status(500).json({ error: 'Internal server error.' });
            }

            const cartId = cart?.id;
            const createCartIfNotExists = () => {
                if (!cartId) {
                    db.run(`INSERT INTO carts (user_id, status) VALUES (?, 'new')`, [userId], function (err) {
                        if (err) {
                            console.error('Error creating cart:', err);
                            return res.status(500).json({ error: 'Failed to create cart.' });
                        }
                        addProductToCart(this.lastID);
                    });
                } else {
                    addProductToCart(cartId);
                }
            };

            const addProductToCart = (cartId) => {
                // Check if product is already in cart
                db.get(
                    `SELECT id, quantity FROM cartproducts WHERE cart_id = ? AND product_id = ?`,
                    [cartId, productId],
                    (err, cartProduct) => {
                        if (err) {
                            console.error('Error checking cart product:', err);
                            return res.status(500).json({ error: 'Failed to check cart product.' });
                        }

                        if (cartProduct) {
                            // Update quantity
                            const newQuantity = cartProduct.quantity + 1;
                            db.run(
                                `UPDATE cartproducts SET quantity = ? WHERE id = ?`,
                                [newQuantity, cartProduct.id],
                                (err) => {
                                    if (err) {
                                        console.error('Error updating cart product:', err);
                                        return res.status(500).json({ error: 'Failed to update cart product.' });
                                    }
                                    res.json({ message: 'Product quantity updated in cart.' });
                                }
                            );
                        } else {
                            // Add new product to cart
                            db.run(
                                `INSERT INTO cartproducts (cart_id, product_id, quantity) VALUES (?, ?, ?)`,
                                [cartId, productId, 1],
                                (err) => {
                                    if (err) {
                                        console.error('Error adding product to cart:', err);
                                        return res.status(500).json({ error: 'Failed to add product to cart.' });
                                    }
                                    res.json({ message: 'Product added to cart.' });
                                }
                            );
                        }
                    }
                );
            };

            createCartIfNotExists();
        });
    });

    // Delete product from cart
    router.delete('/api/cart/delete', (req, res) => {
        const { productId } = req.body;
        const userId = req.session.userId; // Ensure user is logged in

        if (!userId) {
            return res.status(401).json({ error: 'You must be logged in to delete from cart.' });
        }

        // Find the user's active cart
        db.get(`SELECT id FROM carts WHERE user_id = ? AND status = 'new'`, [userId], (err, cart) => {
            if (err) {
                console.error('Error finding cart:', err);
                return res.status(500).json({ error: 'Internal server error.' });
            }

            if (!cart) {
                return res.status(404).json({ error: 'Cart not found.' });
            }

            const cartId = cart.id;

            // Delete product from the cart
            db.run(
                `DELETE FROM cartproducts WHERE cart_id = ? AND product_id = ?`,
                [cartId, productId],
                function (err) {
                    if (err) {
                        console.error('Error deleting product from cart:', err);
                        return res.status(500).json({ error: 'Failed to delete product from cart.' });
                    }

                    if (this.changes === 0) {
                        return res.status(404).json({ error: 'Product not found in the cart.' });
                    }

                    res.json({ message: 'Product deleted from cart.' });
                }
            );
        });
    });

    // Checkout route: empties the user's cart after purchase
    router.post('/api/checkout', (req, res) => {
        const userId = req.session.userId; // Ensure user is logged in

        if (!userId) {
            return res.status(401).json({ error: 'You must be logged in to checkout.' });
        }

        // Find the user's active cart and clear it
        db.run(
            `UPDATE carts SET status = 'purchased' WHERE user_id = ? AND status = 'new'`,
            [userId],
            function (err) {
                if (err) {
                    console.error('Error checking out:', err);
                    return res.status(500).json({ error: 'Failed to checkout.' });
                }

                if (this.changes === 0) {
                    return res.status(404).json({ error: 'No active cart found.' });
                }

                // Clear cart products
                db.run(
                    `DELETE FROM cartproducts WHERE cart_id = (SELECT id FROM carts WHERE user_id = ? AND status = 'new')`,
                    [userId],
                    function (err) {
                        if (err) {
                            console.error('Error clearing cart products:', err);
                            return res.status(500).json({ error: 'Failed to clear cart products.' });
                        }
                        res.json({ message: 'Checkout successful.' });
                    }
                );
            }
        );
    });

}
// Initialize routes with the db instance
module.exports = (database) => {
    db = database;
    initializeRoutes(db);
    return router;
};

