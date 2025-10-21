document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            // Prevent the default form submission which causes a page reload
            event.preventDefault();

            // Get form data
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // --- Client-Side Validation ---
            if (!fullName || !email || !password) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Oops...',
                    text: 'Please fill in all fields!',
                });
                return;
            }

            if (password !== confirmPassword) {
                Swal.fire({
                    icon: 'error',
                    title: 'Passwords do not match!',
                    text: 'Please check your passwords and try again.',
                });
                return;
            }

            // --- API Call using Axios ---
            try {
                // Send a POST request to our registration API
                const response = await api.post('auth/register.php', {
                    fullName: fullName,
                    email: email,
                    password: password
                });

                // Show success message and redirect
                Swal.fire({
                    icon: 'success',
                    title: 'Registration Successful!',
                    text: 'You can now log in with your new account.',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    // Redirect to the login page
                    window.location.href = 'login.html';
                });

            } catch (error) {
                // Handle errors from the API
                Swal.fire({
                    icon: 'error',
                    title: 'Registration Failed',
                    // Use the error message from our PHP API, or a default message
                    text: error.response?.data?.message || 'An unexpected error occurred. Please try again.'
                });
            }
        });
    }

    // --- LOGIN FORM LOGIC ---
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Get form data
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // --- Client-Side Validation ---
        if (!email || !password) {
            Swal.fire('Incomplete', 'Please enter both email and password.', 'warning');
            return;
        }

        // --- API Call using Axios ---
        try {
            const response = await api.post('auth/login.php', {
                email: email,
                password: password
            });
            
            // On success, save user info to localStorage
            // This lets other pages know who is logged in.
            localStorage.setItem('user', JSON.stringify(response.data.user));

            await Swal.fire({
                icon: 'success',
                title: 'Login Successful!',
                text: `Welcome back, ${response.data.user.fullName}!`,
                timer: 2000,
                showConfirmButton: false
            });

            // Redirect to the dashboard
            window.location.href = 'dashboard.html';

        } catch (error) {
            // Handle login errors from our PHP API
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: error.response?.data?.message || 'An unexpected error occurred.'
            });
        }
    });
}

});

