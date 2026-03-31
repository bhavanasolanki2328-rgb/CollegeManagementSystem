// Display user info
function displayUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userNameElement = document.getElementById('userName');
    const userRoleElement = document.getElementById('userRole');
    
    if (userNameElement) {
        userNameElement.textContent = user.name || 'User';
    }
    
    if (userRoleElement) {
        userRoleElement.textContent = user.role ? user.role.toUpperCase() : '';
        
        // Add role-based styling
        if (user.role === 'admin') {
            userRoleElement.style.background = '#dc3545';
        } else if (user.role === 'teacher') {
            userRoleElement.style.background = '#28a745';
        } else {
            userRoleElement.style.background = '#17a2b8';
        }
    }
}

// Load dashboard stats
async function loadDashboardStats() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role;
    
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) return;
    
    try {
        if (role === 'admin') {
            // Get all students
            const studentsResponse = await fetch('http://localhost:5000/api/students', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const students = await studentsResponse.json();
            
            // Get all teachers
            const teachersResponse = await fetch('http://localhost:5000/api/teachers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const teachers = await teachersResponse.json();
            
            // Get all courses
            const coursesResponse = await fetch('http://localhost:5000/api/courses', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const courses = await coursesResponse.json();
            
            statsGrid.innerHTML = `
                <div class="stat-card">
                    <h3>Total Students</h3>
                    <div class="stat-value">${students.length || 0}</div>
                    <div style="font-size: 30px;">👨‍🎓</div>
                </div>
                <div class="stat-card">
                    <h3>Total Teachers</h3>
                    <div class="stat-value">${teachers.length || 0}</div>
                    <div style="font-size: 30px;">👨‍🏫</div>
                </div>
                <div class="stat-card">
                    <h3>Total Courses</h3>
                    <div class="stat-value">${courses.length || 0}</div>
                    <div style="font-size: 30px;">📚</div>
                </div>
            `;
        } else if (role === 'teacher') {
            // Get teacher's courses
            const coursesResponse = await fetch('http://localhost:5000/api/courses', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const courses = await coursesResponse.json();
            
            statsGrid.innerHTML = `
                <div class="stat-card">
                    <h3>My Courses</h3>
                    <div class="stat-value">${courses.length || 0}</div>
                    <div style="font-size: 30px;">📖</div>
                </div>
            `;
        } else if (role === 'student') {
            // Get student's grades
            const profile = JSON.parse(localStorage.getItem('profile') || '{}');
            if (profile._id) {
                const gradesResponse = await fetch(`http://localhost:5000/api/grades/student/${profile._id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const grades = await gradesResponse.json();
                
                statsGrid.innerHTML = `
                    <div class="stat-card">
                        <h3>SGPA</h3>
                        <div class="stat-value">${grades.summary?.sgpa || 0}</div>
                        <div style="font-size: 30px;">📊</div>
                    </div>
                    <div class="stat-card">
                        <h3>Courses Enrolled</h3>
                        <div class="stat-value">${grades.grades?.length || 0}</div>
                        <div style="font-size: 30px;">📚</div>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        statsGrid.innerHTML = '<div class="stat-card"><h3>Error loading stats</h3></div>';
    }
}

// Load recent activities
async function loadRecentActivities() {
    const activitiesDiv = document.getElementById('recentActivities');
    if (!activitiesDiv) return;
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Show welcome message
    activitiesDiv.innerHTML = `
        <div style="padding: 15px; background: #f8f9fa; border-radius: 5px;">
            <p>✅ Welcome back, ${user.name}!</p>
            <p>📅 Today is ${new Date().toLocaleDateString()}</p>
            <p>👤 You are logged in as ${user.role}</p>
        </div>
    `;
}

// Update menu based on role
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

// Handle logout
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = 'login.html';
    });
}

// Initialize dashboard when page loads
if (window.location.pathname.includes('dashboard.html')) {
    displayUserInfo();
    updateMenuByRole();
    loadDashboardStats();
    loadRecentActivities();
}