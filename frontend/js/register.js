// Check if admin already exists
async function checkAdminExists() {
    try {
        const response = await api.get('/auth/check-admin-exists');
        if (response.adminExists) {
            // Admin already exists - show "setup closed" message
            document.getElementById('setupForm').style.display = 'none';
            document.getElementById('setupClosed').style.display = 'block';
        } else {
            // No admin - show registration form
            document.getElementById('setupForm').style.display = 'block';
            document.getElementById('setupClosed').style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
        // If can't connect to backend, show error
        document.getElementById('setupForm').style.display = 'none';
        document.getElementById('setupClosed').style.display = 'block';
        document.getElementById('setupClosed').innerHTML = '<h2>Connection Error</h2><p>Cannot connect to server. Please make sure backend is running.</p>';
    }
}

// Handle admin registration
if (document.getElementById('registerAdminForm')) {
    document.getElementById('registerAdminForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Clear previous messages
        document.getElementById('errorMessage').textContent = '';
        document.getElementById('errorMessage').style.display = 'none';
        
        // Validate passwords match
        if (password !== confirmPassword) {
            document.getElementById('errorMessage').textContent = 'Passwords do not match';
            document.getElementById('errorMessage').style.display = 'block';
            return;
        }
        
        // Validate password length
        if (password.length < 6) {
            document.getElementById('errorMessage').textContent = 'Password must be at least 6 characters';
            document.getElementById('errorMessage').style.display = 'block';
            return;
        }
        
        try {
            const response = await api.post('/auth/register-first-admin', {
                name,
                email,
                password
            });
            
            // Save token
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            // Show success message
            const successDiv = document.getElementById('successMessage');
            successDiv.textContent = 'Admin account created successfully! Redirecting to dashboard...';
            successDiv.style.display = 'block';
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
            
        } catch (error) {
            document.getElementById('errorMessage').textContent = error.message || 'Registration failed';
            document.getElementById('errorMessage').style.display = 'block';
        }
    });
}

// Check admin status when page loads
checkAdminExists();