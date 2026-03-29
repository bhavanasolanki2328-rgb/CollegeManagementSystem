// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token && !window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('index.html')) {
        window.location.href = 'login.html';
    }
}

// Handle login form
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await api.post('/auth/login', { email, password });
            
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('profile', JSON.stringify(response.profile));
            
            showMessage('Login successful!');
            
            // Redirect based on role
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } catch (error) {
            document.getElementById('errorMessage').textContent = error.message;
        }
    });
}

// Handle logout
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = 'login.html';
    });
}

// Show/hide menu items based on role
function updateMenuByRole() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role;
    
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = role === 'admin' ? 'block' : 'none';
    });
    
    document.querySelectorAll('.teacher-only').forEach(el => {
        el.style.display = role === 'teacher' ? 'block' : 'none';
    });
    
    document.querySelectorAll('.student-only').forEach(el => {
        el.style.display = role === 'student' ? 'block' : 'none';
    });
}

// Initialize auth
checkAuth();
if (window.location.pathname.includes('dashboard.html')) {
    updateMenuByRole();
}