document.addEventListener('DOMContentLoaded', () => {
    const quantityControls = document.querySelectorAll('.quantity-control');
    const randomFee = 1;
    const taxRate = 0.0675;

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

    updateTotalPrice();
});
