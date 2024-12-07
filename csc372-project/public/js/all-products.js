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

        // Loop through the products and create HTML for each product
        products.forEach(product => {
            productHTML += `
            <div class="col-md-4 mb-4">
                <div class="card bg-secondary text-light">
                    <a href="details.html?id=${product.id}">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}"></a>
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">$${product.price}</p>
                        <p class="card-text">Condition: ${product.condition}</p>
                        <p class="card-text">Edition: ${product.edition}</p>
                        <p class="card-text">Rarity: ${product.rarity}</p>
                        <a href="details.html?id=${product.id}" class="btn btn-info">View Details</a>
                    </div>
                </div>
            </div>
            `;
        });

        // Insert the generated HTML into the #product-list div
        $('#product-list').html(productHTML);
    });
});
