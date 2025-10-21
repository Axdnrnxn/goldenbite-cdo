document.addEventListener('DOMContentLoaded', () => {
    // We will reuse logic from app.js. For a larger app, you'd move these
    // into a shared file, but for simplicity, we'll redefine them here.
    const getCart = () => JSON.parse(localStorage.getItem('cart')) || [];
    const saveCart = (cart) => {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    };

    const updateCartCount = () => {
        const cart = getCart();
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            cartCountElement.innerText = count;
        }
    };
    
    const addToCart = (product) => {
        const cart = getCart();
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCart(cart);
        Swal.fire({
            icon: 'success', title: 'Added!', text: `${product.name} added to cart.`,
            toast: true, position: 'top-end', showConfirmButton: false, timer: 2000
        });
        closeModal();
    };

    const modal = document.getElementById('product-modal');
    const openProductModal = (product) => {
        document.getElementById('modal-img').src = product.image_url || 'https://via.placeholder.com/300';
        document.getElementById('modal-name').innerText = product.name;
        document.getElementById('modal-category').innerText = product.category_name;
        document.getElementById('modal-desc').innerText = product.description;
        document.getElementById('modal-price').innerText = `₱${product.price}`;
        document.getElementById('modal-add-to-cart').onclick = () => addToCart(product);
        modal.classList.remove('hidden');
    };
    window.openProductModal = openProductModal; // Make it globally accessible from HTML onclick

    const closeModal = () => modal.classList.add('hidden');
    window.closeModal = closeModal; // Make it globally accessible

    // --- Load All Products ---
    async function loadAllProducts() {
        const container = document.getElementById('all-products-grid');
        try {
            const response = await api.get('products/get_all.php');
            const products = response.data;
            container.innerHTML = products.map(product => `
                <div class="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300" 
                     onclick='openProductModal(${JSON.stringify(product)})'>
                    <img src="${product.image_url || 'https://via.placeholder.com/300'}" alt="${product.name}" class="w-full h-48 object-cover">
                    <div class="p-4">
                        <h3 class="font-bold text-lg">${product.name}</h3>
                        <p class="text-gray-500 text-sm">${product.category_name}</p>
                        <p class="font-semibold text-xl text-yellow-700 mt-2">₱${product.price}</p>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            container.innerHTML = "<p class='text-red-500'>Error loading products.</p>";
        }
    }
    
    // Initial calls
    loadAllProducts();
    updateCartCount();
});