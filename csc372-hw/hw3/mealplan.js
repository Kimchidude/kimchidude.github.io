document.addEventListener('DOMContentLoaded', () => {
    let mealPlan = [];
    let totalPrice = 0;

    const dishes = document.querySelectorAll('.dish');
    const mealPlanList = document.getElementById('selected-dishes');
    const totalPriceElement = document.getElementById('total-price');

    dishes.forEach(dish => {
        dish.addEventListener('click', (event) => {
            const dishName = event.target.dataset.dish;
            const dishPrice = parseFloat(event.target.dataset.price);


            mealPlan.push({ dish: dishName, price: dishPrice });
            totalPrice += dishPrice;

            updateMealPlan();
        });
    });


    function updateMealPlan() {
        mealPlanList.innerHTML = mealPlan.map((item, index) =>
            `<p data-index="${index}" class="meal-item">${item.dish}: $${item.price.toFixed(2)}</p>`
        ).join('');
        totalPriceElement.textContent = `Total: $${totalPrice.toFixed(2)}`;

        const mealItems = document.querySelectorAll('.meal-item');
        mealItems.forEach(item => {
            item.addEventListener('click', (event) => {
                const dishIndex = event.target.dataset.index;

                const removedDish = mealPlan.splice(dishIndex, 1)[0];
                totalPrice -= removedDish.price;

                updateMealPlan();
            });
        });
    }
});
