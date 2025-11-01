// Authentication State Observer
// This runs on every page to check if user is logged in

auth.onAuthStateChanged((user) => {
    const authLink = document.getElementById('auth-link');
    const adminLink = document.getElementById('admin-link');
    
    if (user) {
        // User is signed in
        authLink.textContent = 'Logout';
        authLink.href = '#';
        authLink.onclick = (e) => {
            e.preventDefault();
            auth.signOut().then(() => {
                window.location.href = 'index.html';
            });
        };
        
        // Check if user is admin
        db.collection('users').doc(user.uid).get()
            .then((doc) => {
                if (doc.exists && doc.data().role === 'admin') {
                    if (adminLink) {
                        adminLink.style.display = 'inline';
                    }
                }
            })
            .catch((error) => {
                console.error('Error checking user role:', error);
            });
    } else {
        // User is signed out
        authLink.textContent = 'Login';
        authLink.href = 'login.html';
        
        if (adminLink) {
            adminLink.style.display = 'none';
        }
    }
});

// Protect pages that require authentication
function requireAuth(redirectTo = 'login.html') {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = redirectTo;
        }
    });
}

// Protect admin pages
function requireAdmin() {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        
        db.collection('users').doc(user.uid).get()
            .then((doc) => {
                if (!doc.exists || doc.data().role !== 'admin') {
                    alert('Access denied. Admin privileges required.');
                    window.location.href = 'index.html';
                }
            })
            .catch((error) => {
                console.error('Error verifying admin:', error);
                window.location.href = 'index.html';
            });
    });
}