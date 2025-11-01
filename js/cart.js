// Shopping Cart Management

// Load cart items from localStorage
function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
        updateCartSummary();
        return;
    }
    
    cartItemsContainer.innerHTML = '';
    
    cart.forEach((item, index) => {
        const cartItem = createCartItem(item, index);
        cartItemsContainer.appendChild(cartItem);
    });
    
    updateCartSummary();
}

// Create cart item HTML element
function createCartItem(item, index) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    
    div.innerHTML = `
        <img src="${item.imageUrl}" alt="${item.name}">
        <div class="cart-item-info">
            <h3>${item.name}</h3>
            <p class="product-price">₱${item.price.toFixed(2)}</p>
        </div>
        <div class="cart-item-actions">
            <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${index}, this.value)">
            <button class="btn-danger" onclick="removeFromCart(${index})">Remove</button>
        </div>
    `;
    
    return div;
}

// Update item quantity
function updateQuantity(index, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart[index].quantity = parseInt(quantity);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
}

// Remove item from cart
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
}

// Update cart summary totals
function updateCartSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.10; // 10% tax
    const total = subtotal + tax;
    
    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('tax').textContent = tax.toFixed(2);
    document.getElementById('total').textContent = total.toFixed(2);
}

// Proceed to checkout
function proceedToCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    // Check if user is logged in
    auth.onAuthStateChanged((user) => {
        if (user) {
            window.location.href = 'checkout.html';
        } else {
            alert('Please login to proceed to checkout');
            window.location.href = 'login.html';
        }
    });
}

// Update cart count in navigation
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// Initialize cart page
if (document.getElementById('cart-items')) {
    loadCart();
}

updateCartCount();