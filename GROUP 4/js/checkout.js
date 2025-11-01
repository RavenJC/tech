// Checkout Page Logic

// Load order summary on checkout page
function loadOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orderItemsContainer = document.getElementById('order-items');
    
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    orderItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'order-item';
        div.innerHTML = `
            <p>${item.name} x ${item.quantity}</p>
            <p>$${(item.price * item.quantity).toFixed(2)}</p>
        `;
        orderItemsContainer.appendChild(div);
    });
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.10;
    const shipping = 10.00;
    const total = subtotal + tax + shipping;
    
    document.getElementById('summary-subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('summary-tax').textContent = tax.toFixed(2);
    document.getElementById('summary-shipping').textContent = shipping.toFixed(2);
    document.getElementById('summary-total').textContent = total.toFixed(2);
}

// Handle checkout form submission
document.getElementById('checkout-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) {
        alert('Please login to complete your order');
        window.location.href = 'login.html';
        return;
    }
    
    // Get form data
    const shippingInfo = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        postalCode: document.getElementById('postalCode').value
    };
    
    const paymentInfo = {
        cardNumber: document.getElementById('cardNumber').value.replace(/\s/g, ''),
        expiryDate: document.getElementById('expiryDate').value,
        cvv: document.getElementById('cvv').value
    };
    
    // Get cart items
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.10;
    const shipping = 10.00;
    const totalAmount = subtotal + tax + shipping;
    
    try {
        // Create order in Firestore
        const orderRef = await db.collection('orders').add({
            userId: user.uid,
            userEmail: user.email,
            items: cart,
            shippingInfo: shippingInfo,
            subtotal: subtotal,
            tax: tax,
            shipping: shipping,
            totalAmount: totalAmount,
            status: 'pending',
            orderDate: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: new Date().toISOString()
        });
        
        // Simulate payment (in real app, integrate with payment gateway like Stripe)
        await db.collection('payments').add({
            orderId: orderRef.id,
            userId: user.uid,
            amount: totalAmount,
            paymentMethod: 'credit_card',
            cardLast4: paymentInfo.cardNumber.slice(-4),
            status: 'completed',
            transactionDate: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Clear cart
        localStorage.removeItem('cart');
        
        // Redirect to confirmation page
        window.location.href = `order-confirmation.html?orderId=${orderRef.id}`;
        
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Error placing order. Please try again.');
    }
});

// Initialize checkout page
if (document.getElementById('checkout-form')) {
    requireAuth('login.html');
    loadOrderSummary();
}