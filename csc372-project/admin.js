        // Example product data (in real implementation, load from backend/database)
        const products = [
            {id: 1, name: "Blue-Eyes White Dragon", description: "A legendary dragon with immense power.", category: "Dragons", price: 25.99, imagePath: "images/blue-eyes-dragon.jpg"},
            {id: 2, name: "Dark Magician", description: "A powerful magician skilled in dark arts.", category: "Magicians", price: 15.99, imagePath: "images/dark-magician.jpg"}
            // More products can be added here
        ];

        function filterProducts() {
            const searchQuery = document.getElementById("search").value.toLowerCase();
            const table = document.getElementById("products-table").getElementsByTagName("tbody")[0];
            const rows = table.getElementsByTagName("tr");

            for (let i = 0; i < rows.length; i++) {
                const name = rows[i].getElementsByTagName("td")[2].textContent.toLowerCase();
                const category = rows[i].getElementsByTagName("td")[4].textContent.toLowerCase();
                if (name.includes(searchQuery) || category.includes(searchQuery)) {
                    rows[i].style.display = "";
                } else {
                    rows[i].style.display = "none";
                }
            }
        }

        function editProduct(productId) {
            // Redirect to the edit page for the selected product
            window.location.href = `admin-edit-product.html?id=${productId}`;
        }

        function deleteProduct(productId) {
            if (confirm("Are you sure you want to delete this product?")) {
                // Implement the deletion logic (e.g., send a request to the server)
                alert(`Product with ID ${productId} has been deleted.`);
            }
        }

        function archiveProduct(productId) {
            if (confirm("Are you sure you want to archive this product?")) {
                // Implement the archiving logic (e.g., send a request to the server)
                alert(`Product with ID ${productId} has been archived.`);
            }
        }