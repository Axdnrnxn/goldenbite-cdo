document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedProducts();
    updateCartCount();
    updateNav();
});

// Updates navbar links based on login status
function updateNav() {
    const user = JSON.parse(localStorage.getItem('user'));
    const navLinks = document.getElementById('nav-links');
    if (user) {
        navLinks.innerHTML = `
            <a href="dashboard.html" class="text-gray-700 mx-2 hover:text-yellow-600">Dashboard</a>
            <a href="cart.html" class="text-gray-700 mx-2 hover:text-yellow-600">Cart (<span id="cart-count">0</span>)</a>
            <button onclick="logout()" class="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600">Logout</button>
        `;
    }
}

async function logout() {
    await api.get('auth/logout.php');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}


// --- PRODUCT LOADING ---
async function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;

    try {
        const response = await api.get('products/get_featured.php');
        const products = response.data;
        
        if (products.length === 0) {
            container.innerHTML = "<p>No featured products available at the moment.</p>";
            return;
        }

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
        console.error("Failed to load featured products:", error);
        container.innerHTML = "<p class='text-red-500'>Error loading products. Please try again later.</p>";
    }
}

// --- MODAL LOGIC ---
const modal = document.getElementById('product-modal');
function openProductModal(product) {
    document.getElementById('modal-img').src = product.image_url || 'https://via.placeholder.com/300';
    document.getElementById('modal-name').innerText = product.name;
    document.getElementById('modal-category').innerText = product.category_name;
    document.getElementById('modal-desc').innerText = product.description;
    document.getElementById('modal-price').innerText = `₱${product.price}`;
    document.getElementById('modal-add-to-cart').onclick = () => addToCart(product);
    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
}

// --- CART LOGIC (using localStorage) ---
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(product) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart(cart);
    Swal.fire({
        icon: 'success',
        title: 'Added!',
        text: `${product.name} has been added to your cart.`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
    });
    closeModal();
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.innerText = count;
    }
}