$(document).ready(function () {
    // Fetch the first 3 products from the API
    $.get('products/api/index-products', function (data) {
        const products = data.products;
        let productHTML = '';

        // Loop through the products and create HTML for each product
        products.forEach(product => {
            productHTML += `
             <div class="card">
                 <img src="${product.image}" class="card-img-top" alt="${product.name}">
                 <div class="card-body">
                     <h5 class="card-title">${product.name}</h5>
                 </div>
             </div>
        `;
        });

        // Insert the generated HTML into the .home-row div
        $('.home-row').html(productHTML);
    });
});
