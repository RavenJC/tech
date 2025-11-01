// Admin Dashboard Logic

// Protect admin page
requireAdmin();

// Tab switching for admin dashboard
function showAdminTab(tabName) {
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.admin-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
    
    if (tabName === 'products') {
        loadAdminProducts();
    } else if (tabName === 'orders') {
        loadAdminOrders();
    }
}

// Load all products for admin
function loadAdminProducts() {
    const productsListContainer = document.getElementById('admin-products-list');
    
    db.collection('products')
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                productsListContainer.innerHTML = '<p>No products available.</p>';
                return;
            }
            
            productsListContainer.innerHTML = '';
            
            querySnapshot.forEach((doc) => {
                const product = { id: doc.id, ...doc.data() };
                const productCard = createAdminProductCard(product);
                productsListContainer.appendChild(productCard);
            });
        })
        .catch((error) => {
            console.error('Error loading products:', error);
            productsListContainer.innerHTML = '<p>Error loading products.</p>';
        });
}

// Create admin product card
function createAdminProductCard(product) {
    const card = document.createElement('div');
    card.className = 'admin-product-card';
    
    card.innerHTML = `
        <div class="admin-product-info">
            <img src="${product.imageUrl}" alt="${product.name}">
            <div>
                <h3>${product.name}</h3>
                <p>Price: ₱${product.price.toFixed(2)} | Stock: ${product.stock}</p>
                <p>Category: ${product.category}</p>
            </div>
        </div>
        <div class="admin-product-actions">
            <button class="btn-primary" onclick="editProduct('${product.id}')">Edit</button>
            <button class="btn-danger" onclick="deleteProduct('${product.id}')">Delete</button>
        </div>
    `;
    
    return card;
}

// Show product modal for adding new product
function showProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('product-form');
    
    form.reset();
    
    if (productId) {
        // Edit mode
        modalTitle.textContent = 'Edit Product';
        
        // Load product data
        db.collection('products').doc(productId).get()
            .then((doc) => {
                if (doc.exists) {
                    const product = doc.data();
                    document.getElementById('product-id').value = productId;
                    document.getElementById('product-name').value = product.name;
                    document.getElementById('product-description').value = product.description;
                    document.getElementById('product-price').value = product.price;
                    document.getElementById('product-stock').value = product.stock;
                    document.getElementById('product-category').value = product.category;
                    document.getElementById('product-image').value = product.imageUrl;
                }
            });
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Product';
        document.getElementById('product-id').value = '';
    }
    
    modal.classList.add('active');
}

// Close product modal
function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('active');
}

// Edit product
function editProduct(productId) {
    showProductModal(productId);
}

// Delete product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        db.collection('products').doc(productId).delete()
            .then(() => {
                alert('Product deleted successfully');
                loadAdminProducts();
            })
            .catch((error) => {
                console.error('Error deleting product:', error);
                alert('Error deleting product');
            });
    }
}

// Handle product form submission
document.getElementById('product-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productId = document.getElementById('product-id').value;
    const productData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value),
        category: document.getElementById('product-category').value,
        imageUrl: document.getElementById('product-image').value,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        if (productId) {
            // Update existing product
            await db.collection('products').doc(productId).update(productData);
            alert('Product updated successfully');
        } else {
            // Add new product
            productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('products').add(productData);
            alert('Product added successfully');
        }
        
        closeProductModal();
        loadAdminProducts();
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Error saving product');
    }
});

// Load all orders for admin
function loadAdminOrders() {
    const ordersListContainer = document.getElementById('admin-orders-list');
    
    db.collection('orders')
        .orderBy('orderDate', 'desc')
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                ordersListContainer.innerHTML = '<p>No orders yet.</p>';
                return;
            }
            
            ordersListContainer.innerHTML = '';
            
            querySnapshot.forEach((doc) => {
                const order = { id: doc.id, ...doc.data() };
                const orderCard = createAdminOrderCard(order);
                ordersListContainer.appendChild(orderCard);
            });
        })
        .catch((error) => {
            console.error('Error loading orders:', error);
            ordersListContainer.innerHTML = '<p>Error loading orders.</p>';
        });
}

// Create admin order card
function createAdminOrderCard(order) {
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
                <p>Customer: ${order.userEmail}</p>
                <p>Date: ${orderDate}</p>
            </div>
            <div>
                <select onchange="updateOrderStatus('${order.id}', this.value)" class="order-status ${statusClass}">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                </select>
            </div>
        </div>
        <div class="order-items">
            ${itemsHTML}
        </div>
        <div class="order-footer">
            <p><strong>Shipping Address:</strong></p>
            <p>${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.postalCode}</p>
            <p><strong>Total: ₱${order.totalAmount.toFixed(2)}</strong></p>
        </div>
    `;
    
    return card;
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    db.collection('orders').doc(orderId).update({
        status: newStatus,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        alert('Order status updated successfully');
        loadAdminOrders();
    })
    .catch((error) => {
        console.error('Error updating order status:', error);
        alert('Error updating order status');
    });
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('product-modal');
    if (event.target === modal) {
        closeProductModal();
    }
}

// Initialize admin dashboard
if (document.getElementById('admin-products-list')) {
    loadAdminProducts();
}