document.addEventListener('DOMContentLoaded', () => {
    const cartContainer = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const placeOrderBtn = document.getElementById('place-order-btn');

    // --- Helper Functions ---
    const getCart = () => JSON.parse(localStorage.getItem('cart')) || [];
    const saveCart = (cart) => {
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart(); // Re-render the cart every time it's updated
    };

    // --- Core Rendering Function ---
    const renderCart = () => {
        const cart = getCart();

        if (cart.length === 0) {
            cartContainer.innerHTML = '<p class="p-6 text-center text-gray-500">Your cart is empty.</p>';
            subtotalEl.textContent = '₱0.00';
            totalEl.textContent = '₱0.00';
            placeOrderBtn.disabled = true;
            placeOrderBtn.classList.add('opacity-50', 'cursor-not-allowed');
            return;
        }

        const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        
        cartContainer.innerHTML = cart.map(item => `
            <div class="flex items-center p-4 border-b">
                <img src="${item.image_url || 'https://via.placeholder.com/100'}" alt="${item.name}" class="w-20 h-20 object-cover rounded mr-4">
                <div class="flex-grow">
                    <h3 class="font-semibold">${item.name}</h3>
                    <p class="text-gray-500">₱${item.price}</p>
                </div>
                <div class="flex items-center">
                    <button class="quantity-change px-2 py-1 bg-gray-200 rounded" data-id="${item.id}" data-change="-1">-</button>
                    <span class="px-4">${item.quantity}</span>
                    <button class="quantity-change px-2 py-1 bg-gray-200 rounded" data-id="${item.id}" data-change="1">+</button>
                </div>
                <div class="w-24 text-right font-semibold">
                    ₱${(item.price * item.quantity).toFixed(2)}
                </div>
                <button class="remove-item ml-6 text-red-500 hover:text-red-700" data-id="${item.id}">&times;</button>
            </div>
        `).join('');

        subtotalEl.textContent = `₱${totalAmount.toFixed(2)}`;
        totalEl.textContent = `₱${totalAmount.toFixed(2)}`;
        placeOrderBtn.disabled = false;
        placeOrderBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    };

    // --- Event Handlers ---
    cartContainer.addEventListener('click', (e) => {
        const target = e.target;
        const productId = target.dataset.id;
        if (!productId) return;

        let cart = getCart();
        const itemIndex = cart.findIndex(item => item.id == productId);
        if (itemIndex === -1) return;

        if (target.classList.contains('quantity-change')) {
            const change = parseInt(target.dataset.change);
            cart[itemIndex].quantity += change;
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1); // Remove if quantity is 0 or less
            }
        } else if (target.classList.contains('remove-item')) {
            cart.splice(itemIndex, 1); // Remove item completely
        }
        
        saveCart(cart);
    });

    placeOrderBtn.addEventListener('click', async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            Swal.fire('Login Required', 'You must be logged in to place an order.', 'warning')
                .then(() => window.location.href = 'login.html');
            return;
        }

        const result = await Swal.fire({
            title: 'Confirm Your Order',
            text: "Ready to taste the best of CDO? Please confirm your order.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Place Order!'
        });
        
        if (result.isConfirmed) {
            const cart = getCart();
            const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

            try {
                const response = await api.post('orders/create.php', { cart, totalAmount });
                
                localStorage.removeItem('cart'); // Clear cart on success
                
                await Swal.fire('Order Placed!', 'Your order has been received! We will contact you shortly.', 'success');
                window.location.href = 'dashboard.html';

            } catch (error) {
                Swal.fire('Order Failed', error.response?.data?.message || 'Something went wrong. Please try again.', 'error');
            }
        }
    });

    // Initial render
    renderCart();
});