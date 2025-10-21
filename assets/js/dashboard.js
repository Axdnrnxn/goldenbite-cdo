document.addEventListener('DOMContentLoaded', () => {
    // --- Security Check ---
    // Get user info from localStorage
    const user = JSON.parse(localStorage.getItem('user'));

    // If no user is found in localStorage, redirect to login page
    if (!user) {
        window.location.href = 'login.html';
        return; // Stop script execution
    }

    // --- Logout Button Logic ---
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', async () => {
        try {
            await api.get('auth/logout.php');
            
            // Clear user data from localStorage
            localStorage.removeItem('user');

            Swal.fire('Logged Out', 'You have been successfully logged out.', 'success')
                .then(() => {
                    window.location.href = 'login.html';
                });
        } catch (error) {
            Swal.fire('Error', 'Could not log out. Please try again.', 'error');
        }
    });


    // --- Load Dashboard Data ---
    const welcomeMessage = document.getElementById('welcome-message');
    const orderHistoryBody = document.getElementById('order-history-body');

    // Display welcome message immediately
    welcomeMessage.textContent = `Welcome, ${user.fullName}!`;

    // Fetch and display order history
    async function loadOrderHistory() {
        try {
            const response = await api.get('orders/get_history.php');
            const orders = response.data;

            if (orders.length === 0) {
                orderHistoryBody.innerHTML = `<tr><td colspan="5" class="text-center py-4">You have no past orders.</td></tr>`;
                return;
            }

            // Generate table rows from the order data
            const orderRows = orders.map(order => `
                <tr class="border-b">
                    <td class="px-4 py-2 font-mono">#${order.id}</td>
                    <td class="px-4 py-2">${new Date(order.order_date).toLocaleDateString()}</td>
                    <td class="px-4 py-2">${order.products}</td>
                    <td class="px-4 py-2 font-semibold">₱${order.total_amount}</td>
                    <td class="px-4 py-2"><span class="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-sm">${order.status}</span></td>
                </tr>
            `).join('');

            orderHistoryBody.innerHTML = orderRows;

        } catch (error) {
            // If the API returns an error (e.g., session expired), redirect to login
            if(error.response.status === 401) {
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            } else {
                 orderHistoryBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-red-500">Could not load order history.</td></tr>`;
            }
        }
    }
    
    loadOrderHistory();
});