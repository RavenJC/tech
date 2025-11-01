// User Orders Page

// Load user's orders from Firestore
function loadUserOrders() {
    const user = auth.currentUser;
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    const ordersListContainer = document.getElementById('orders-list');
    
    db.collection('orders')
        .where('userId', '==', user.uid)
        .orderBy('orderDate', 'desc')
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                ordersListContainer.innerHTML = '<p>You have no orders yet.</p>';
                return;
            }
            
            ordersListContainer.innerHTML = '';
            
            querySnapshot.forEach((doc) => {
                const order = { id: doc.id, ...doc.data() };
                const orderCard = createOrderCard(order);
                ordersListContainer.appendChild(orderCard);
            });
        })
        .catch((error) => {
            console.error('Error loading orders:', error);
            ordersListContainer.innerHTML = '<p>Error loading orders. Please try again.</p>';
        });
}

// Create order card HTML element
function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';
    
    const orderDate = order.orderDate ? new Date(order.orderDate.seconds * 1000).toLocaleDateString() : 'N/A';
    const statusClass = `status-${order.status}`;
    
    let itemsHTML = '';
    order.items.forEach(item => {
        itemsHTML += `
            <div class="order-item">
                <img src="${item.imageUrl}" alt="${item.name}">
                <div>
                    <p><strong>${item.name}</strong></p>
                    <p>Quantity: ${item.quantity} | Price: ₱${item.price.toFixed(2)}</p>
                </div>
            </div>
        `;
    });
    
    card.innerHTML = `
        <div class="order-header">
            <div>
                <p><strong>Order #${order.id.substring(0, 8).toUpperCase()}</strong></p>
                <p>Date: ${orderDate}</p>
            </div>
            <span class="order-status ${statusClass}">${order.status.toUpperCase()}</span>
        </div>
        <div class="order-items">
            ${itemsHTML}
        </div>
        <div class="order-footer">
            <p><strong>Total: ₱${order.totalAmount.toFixed(2)}</strong></p>
        </div>
    `;
    
    return card;
}

// Initialize orders page
if (document.getElementById('orders-list')) {
    requireAuth('login.html');
    auth.onAuthStateChanged((user) => {
        if (user) {
            loadUserOrders();
        }
    });
}