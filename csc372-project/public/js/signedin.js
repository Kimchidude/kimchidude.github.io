document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/users/auth-status');
        const data = await response.json();

        const signInButton = document.getElementById('sign-in-btn');
        const logoutButton = document.getElementById('logout-btn');
        const cartLink = document.querySelector('a.nav-link[href="cart.html"]');

        if (data.isAuthenticated) {
            signInButton.style.display = 'none';
            logoutButton.style.display = 'block';
            window.loggedInUserId = data.userId; // Set userId if authenticated

            // Update the Cart link with the userId
            if (cartLink) {
                cartLink.href = `cart.html?id=${window.loggedInUserId}`;
            }

            // Conditionally show the admin navbar if the user is an admin
            if (data.userType === 'admin') {
                const adminNavbar = document.getElementById('admin-navbar');
                if (adminNavbar) {
                    adminNavbar.style.display = 'block';
                }
            }
        } else {
            signInButton.style.display = 'block';
            logoutButton.style.display = 'none';
            if (window.location.pathname === '/cart.html') {
                window.location.href = '/signin.html';
            }
        }
    } catch (error) {
        console.error('Error fetching authentication status:', error);
    }
});
