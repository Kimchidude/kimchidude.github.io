// Wait for the DOM to load
$(document).ready(function () {
    // Modify the fetch URL in admin-products.js to match the new route
    $.get('/products/api/products', function (data) {
        const products = data.products;
        let productHTML = '';

        // Loop through products and create HTML for each product
        products.forEach(product => {
            productHTML += `
            <div class="col-md-4 mb-4">
                <div class="card bg-secondary text-light">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">$${product.price}</p>
                        <p class="card-text">Condition: ${product.condition}</p>
                        <p class="card-text">Edition: ${product.edition}</p>
                        <p class="card-text">Rarity: ${product.rarity}</p>
                        <a href="product-edit.html?id=${product.id}" class="btn btn-warning">Edit</a>
                        <button class="btn btn-danger" onclick="confirmDelete(${product.id})">Delete</button>
                    </div>
                </div>
            </div>
        `;
        });

        // Insert the generated HTML into the product-list div
        $('#product-list').html(productHTML);
    });
});

// Function to confirm deletion
function confirmDelete(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        // If confirmed, submit the form using AJAX
        $.ajax({
            url: `/products/delete/${productId}`,
            type: 'POST',
            success: function (data) {
                alert(data.message);
                window.location.href = 'admin-products.html'; // Redirect back to the admin products page after successful deletion
            },
            error: function (err) {
                console.error('Error deleting product:', err);
                alert('Failed to delete product.');
            }
        });
    }
}
