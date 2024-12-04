$(document).ready(function () {
    // Get the rarity from the query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const rarityFilter = urlParams.get('rarity');

    // Fetch all products from the API
    $.get('/products/api/products', function (data) {
        let products = data.products;

        // If a rarity filter is set, filter the products by rarity
        if (rarityFilter && rarityFilter !== 'all') {
            products = products.filter(product => product.rarity === rarityFilter);
        }

        let productHTML = '';

        // Loop through the filtered products and create HTML for each product
        products.forEach(product => {
            productHTML += `
            <div class="product">
                <h2 class="details-name">${product.name}</h2>
                <div class="product-details">
                    <img src="${product.image}" class="details-image" alt="${product.name}">
                    <p class="details-description">${product.description}</p>
                </div>
            </div>
        `;
        });

        // Insert the generated HTML into the .product-list div
        $('.product-list').html(productHTML);
    });
});
