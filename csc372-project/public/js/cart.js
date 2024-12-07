document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    if (!userId) {
        document.getElementById('cart-items-container').innerHTML = '<p>No cart found for the user.</p>';
        return;
    }

    const randomFee = 1;
    const taxRate = 0.0675;

    fetch(`/carts/api/cart/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data.cart)) {
                throw new Error('Invalid cart data');
            }

            const cartContainer = document.getElementById('cart-items-container');
            let cartHTML = '';

            data.cart.forEach(item => {
                const itemTotal = (item.price * item.quantity).toFixed(2);
                cartHTML += `
                    <div class="cart-card">
                        <div class="selected-image"><img src="${item.image}" alt="${item.name}" class="card-img-top" /></div>
                        <div class="card-body">
                            <h5 class="selected-name">${item.name}</h5>
                            <div class="selected-price" data-price="${item.price}">$${item.price}</div>
                            <div class="quantity-control">
                                <button class="subtract-quantity">-</button>
                                <div class="quantity" data-quantity="${item.quantity}">${item.quantity}</div>
                                <button class="add-quantity">+</button>
                            </div>
                            <div class="item-total">Item total: <span class="item-total-price" data-item-total="${itemTotal}">$${itemTotal}</span></div>
                            <button class="delete-item" data-product-id="${item.productId}">Delete</button>
                        </div>
                    </div>
                `;
            });

            cartContainer.innerHTML = cartHTML;
            updateTotalPrice();
            setupQuantityControls();
        })
        .catch(error => {
            console.error('Error loading cart:', error);
            document.getElementById('cart-items-container').innerHTML = `<p>Error loading cart: ${error.message}</p>`;
        });

    // Event for delete buttons
    document.getElementById('cart-items-container').addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-item')) {
            const productId = e.target.dataset.productId;

            if (confirm('Are you sure you want to delete this item from the cart?')) {
                fetch('/carts/api/cart/delete', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ productId }),
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        alert(data.message);
                        location.reload();
                    })
                    .catch(error => {
                        console.error('Error deleting item:', error);
                        alert(`Error deleting item: ${error.message}`);
                    });
            }
        }
    });

    function setupQuantityControls() {
        const quantityControls = document.querySelectorAll('.quantity-control');

        quantityControls.forEach(control => {
            const subtractBtn = control.querySelector('.subtract-quantity');
            const addBtn = control.querySelector('.add-quantity');
            const quantityDisplay = control.querySelector('.quantity');
            const itemTotalDisplay = control.closest('.card-body').querySelector('.item-total-price');
            const itemPrice = parseFloat(control.closest('.card-body').querySelector('.selected-price').dataset.price);

            function updateItemTotal() {
                const quantity = parseInt(quantityDisplay.dataset.quantity);
                const itemTotal = itemPrice * quantity;
                itemTotalDisplay.dataset.itemTotal = itemTotal.toFixed(2);
                itemTotalDisplay.textContent = `$${itemTotal.toFixed(2)}`;

                updateTotalPrice(); // Update overall total price
            }

            subtractBtn.addEventListener('click', () => {
                let quantity = parseInt(quantityDisplay.dataset.quantity);
                if (quantity > 1) {
                    quantity--;
                    quantityDisplay.dataset.quantity = quantity;
                    quantityDisplay.textContent = quantity;
                    updateItemTotal();
                }
            });

            addBtn.addEventListener('click', () => {
                let quantity = parseInt(quantityDisplay.dataset.quantity);
                quantity++;
                quantityDisplay.dataset.quantity = quantity;
                quantityDisplay.textContent = quantity;
                updateItemTotal();
            });
        });
    }

    function updateTotalPrice() {
        const itemTotals = document.querySelectorAll('.item-total-price');
        let total = 0;

        itemTotals.forEach(itemTotal => {
            const itemPrice = parseFloat(itemTotal.dataset.itemTotal);
            if (!isNaN(itemPrice)) {
                total += itemPrice;
            }
        });

        const tax = total * taxRate; // Calculate tax
        const grandTotal = total + randomFee + tax; // Calculate grand total

        // Update displayed values
        document.getElementById('selected-total').textContent = `Item Total: $${total.toFixed(2)}`;
        document.getElementById('tax').textContent = `Tax: $${tax.toFixed(2)}`;
        document.getElementById('total-price').textContent = `Total: $${grandTotal.toFixed(2)}`;
    }
});
