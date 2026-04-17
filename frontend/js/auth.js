const API_URL = 'http://localhost:5000/api';

function isAuthenticated() {
    return !!localStorage.getItem('token');
}

function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function logout() {
    localStorage.clear();
    window.location.href = '../login.html';
}

async function fetchCompleteStudentProfile(email, token) {
    try {
        const res = await fetch(`${API_URL}/students/email/${email}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) return await res.json();
    } catch (e) {
        console.log('Could not fetch student profile');
    }
    return null;
}

// Handle login
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = '';
        const btn = document.querySelector('#loginForm button');
        const originalText = btn.textContent;
        btn.textContent = 'Logging in...';
        btn.disabled = true;

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');

            localStorage.setItem('token', data.token);
            let user = data.user;

            if (user.role === 'student') {
                const studentData = await fetchCompleteStudentProfile(email, data.token);
                if (studentData) {
                    user = { ...user, ...studentData };
                }
            }
            localStorage.setItem('user', JSON.stringify(user));

            if (user.role === 'admin') window.location.href = 'admin/dashboard.html';
            else if (user.role === 'teacher') window.location.href = 'teacher/dashboard.html';
            else if (user.role === 'student') window.location.href = 'student/dashboard.html';
        } catch (err) {
            errorDiv.textContent = err.message;
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
}

// Protect pages
const publicPages = ['login.html', 'index.html'];
const currentPath = window.location.pathname;
const currentFile = currentPath.split('/').pop();
if (!publicPages.includes(currentFile) && !isAuthenticated()) {
    window.location.href = '../login.html';
}

function displayUserInfo() {
    const user = getCurrentUser();
    if (user) {
        if (document.getElementById('userName')) document.getElementById('userName').textContent = user.name;
        if (document.getElementById('userRole')) document.getElementById('userRole').textContent = user.role?.toUpperCase();
    }
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); logout(); });
}

// Auto-initialize on dashboard pages
if (document.querySelector('.main-content')) {
    displayUserInfo();
    setupLogout();
}