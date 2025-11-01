// Load and display products on the home page

// Load all products from Firestore
function loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    
    db.collection('products')
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                productsGrid.innerHTML = '<p>No products available at the moment.</p>';
                return;
            }
            
            productsGrid.innerHTML = '';
            
            querySnapshot.forEach((doc) => {
                const product = { id: doc.id, ...doc.data() };
                const productCard = createProductCard(product);
                productsGrid.appendChild(productCard);
            });
        })
        .catch((error) => {
            console.error('Error loading products:', error);
            productsGrid.innerHTML = '<p>Error loading products. Please try again later.</p>';
        });
}

// Create product card HTML element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <h3>${product.name}</h3>
            <p class="product-price">₱${product.price.toFixed(2)}</p>
            <p class="product-description">${product.description.substring(0, 100)}...</p>
            <button class="btn-primary" onclick="addToCart('${product.id}', '${escapeHtml(product.name)}', ${product.price}, '${product.imageUrl}')">
                Add to Cart
            </button>
            <button class="btn-secondary" onclick="window.location.href='product-details.html?id=${product.id}'">
                View Details
            </button>
        </div>
    `;
    
    return card;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add product to cart (stored in localStorage)
function addToCart(id, name, price, imageUrl) {
    // Get existing cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already exists in cart
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            imageUrl: imageUrl,
            quantity: 1
        });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count in navigation
    updateCartCount();
    
    alert('Product added to cart!');
}

// Update cart count in navigation bar
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// Initialize page
if (document.getElementById('products-grid')) {
    loadProducts();
}

updateCartCount();