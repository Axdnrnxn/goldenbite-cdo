document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            // Simple validation
            if (!name || !email || !message) {
                Swal.fire('Incomplete Form', 'Please fill in all required fields.', 'warning');
                return;
            }

            try {
                // Use the global 'api' instance from main.js
                const response = await api.post('contact/send_message.php', {
                    name,
                    email,
                    subject,
                    message
                });

                // Show success message and reset the form
                Swal.fire({
                    icon: 'success',
                    title: 'Message Sent!',
                    text: response.data.message,
                });
                contactForm.reset();

            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Submission Failed',
                    text: error.response?.data?.message || 'An error occurred. Please try again.'
                });
            }
        });
    }
});