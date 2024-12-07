document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form values
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Basic validation checks
        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        // Prepare data for the server
        const formData = {
            name,
            email,
            password
        };

        // Send data to the server via fetch API
        fetch('/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Registration successful!');
                    window.location.href = '/signin.html'; // Redirect after successful registration
                } else {
                    alert('Registration failed: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred. Please try again later.');
            });
    });

    // Form validation
    form.addEventListener('input', () => {
        form.classList.add('was-validated');
    });
});
