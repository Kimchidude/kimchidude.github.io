$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        $('.product-details-container').html('<p>Product not found.</p>');
        return;
    }

    // Fetch the product details
    $.get(`/products/api/products/${productId}`, function (data) {
        const fetchedProduct = data;

        if (!fetchedProduct) {
            $('.product-details-container').html('<p>Product not found.</p>');
            return;
        }

        const productHTML = `
        <div class="product-details">
            <h2 class="details-name">${fetchedProduct.name}</h2>
            <img src="${fetchedProduct.image}" class="details-image" alt="${fetchedProduct.name}">
            <p class="details-description">${fetchedProduct.description}</p>
            <button class="btn btn-success details-price" data-product-id="${fetchedProduct.id}">Add to cart: $${fetchedProduct.price}</button>
            <p class="details-condition">Condition: ${fetchedProduct.condition}</p>
            <p class="details-edition">Edition: ${fetchedProduct.edition}</p>
            <p class="details-rarity">Rarity: ${fetchedProduct.rarity}</p>
        </div>
        `;

        $('.product-details-container').html(productHTML);

        // Add to Cart functionality
        $('.details-price').on('click', function () {
            const productId = $(this).data('product-id');

            $.post('carts/api/cart/add', { productId }, function (response) {
                alert(response.message); // Display success message
            }).fail(function (xhr) {
                const errorMessage = xhr.responseJSON?.error || 'Error adding product to cart.';
                alert(errorMessage);
            });
        });
    }).fail(function () {
        $('.product-details-container').html('<p>Error loading product details.</p>');
    });
});
