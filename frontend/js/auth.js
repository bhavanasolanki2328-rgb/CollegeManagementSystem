// Check if user is logged in
function isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    window.location.href = 'login.html';
}

// Protect pages - redirect to login if not authenticated
function protectPage() {
    const publicPages = ['login.html', 'register-admin.html', 'setup.html', 'index.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!publicPages.includes(currentPage) && !isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Check first time setup
async function checkFirstTimeSetup() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/check-admin-exists');
        const data = await response.json();
        
        // No admin exists and not on setup page
        if (!data.adminExists && !window.location.pathname.includes('register-admin.html') && !window.location.pathname.includes('setup.html')) {
            window.location.href = 'register-admin.html';
            return false;
        }
        
        // Admin exists and on setup page
        if (data.adminExists && (window.location.pathname.includes('register-admin.html') || window.location.pathname.includes('setup.html'))) {
            window.location.href = 'login.html';
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

// Display user info on dashboard pages
function displayUserInfo() {
    const user = getCurrentUser();
    if (user) {
        if (document.getElementById('userName')) {
            document.getElementById('userName').textContent = user.name;
        }
        if (document.getElementById('userRole')) {
            document.getElementById('userRole').textContent = user.role.toUpperCase();
        }
    }
}

// Update menu based on role
function updateMenuByRole() {
    const user = getCurrentUser();
    if (!user) return;
    
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = user.role === 'admin' ? 'block' : 'none';
    });
    
    document.querySelectorAll('.teacher-only').forEach(el => {
        el.style.display = user.role === 'teacher' ? 'block' : 'none';
    });
    
    document.querySelectorAll('.student-only').forEach(el => {
        el.style.display = user.role === 'student' ? 'block' : 'none';
    });
}

// Handle login
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('errorMessage');
        
        errorDiv.textContent = 'Logging in...';
        errorDiv.style.color = 'blue';
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            errorDiv.textContent = 'Login successful! Redirecting...';
            errorDiv.style.color = 'green';
            
            // Redirect based on role
            setTimeout(() => {
                if (data.user.role === 'admin') {
                    window.location.href = 'dashboard.html';
                } else if (data.user.role === 'teacher') {
                    window.location.href = 'teacher-dashboard.html';
                } else if (data.user.role === 'student') {
                    window.location.href = 'student-dashboard.html';
                }
            }, 1000);
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.style.color = 'red';
        }
    });
}

// Handle logout
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
}

// Initialize on page load - ONLY protect routes, NO auto-redirects
(async function() {
    await checkFirstTimeSetup();
    protectPage();
    
    // Only show user info if on a dashboard page
    const currentPage = window.location.pathname.split('/').pop();
    const dashboardPages = ['dashboard.html', 'teacher-dashboard.html', 'student-dashboard.html'];
    
    if (isAuthenticated() && dashboardPages.includes(currentPage)) {
        displayUserInfo();
        updateMenuByRole();
    }
})();