// product-edit.js
$(document).ready(function () {
    // Get the product id from the query parameters
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    // Fetch the product details from the server using the product ID
    $.get(`/products/api/products/${productId}`, function (product) {
        // Pre-fill the form with the product data
        $('#product-id').val(product.id);
        $('#product-name').val(product.name);
        $('#product-description').val(product.description);
        $('#product-price').val(product.price);
        $('#product-condition').val(product.condition);
        $('#product-edition').val(product.edition);
        $('#product-image').val(product.image);
        $('#product-rarity').val(product.rarity);
    });

    // Handle form submission to update the product
    $('#edit-product-form').submit(function (e) {
        e.preventDefault();

        const updatedProduct = {
            id: $('#product-id').val(),
            name: $('#product-name').val(),
            description: $('#product-description').val(),
            price: $('#product-price').val(),
            condition: $('#product-condition').val(),
            edition: $('#product-edition').val(),
            image: $('#product-image').val(),
            rarity: $('#product-rarity').val()
        };

        // Send the updated product data to the server
        $.ajax({
            url: `/products/api/products/${productId}`,
            method: 'PUT',
            data: updatedProduct,
            success: function () {
                alert('Product updated successfully!');
                window.location.href = 'admin-products.html';
            },
            error: function () {
                alert('Failed to update product.');
            }
        });
    });
});
