// Load dashboard stats
async function loadDashboardStats() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const role = user.role;
        
        let stats = [];
        
        if (role === 'admin') {
            const students = await api.get('/students');
            const teachers = await api.get('/teachers');
            const courses = await api.get('/courses');
            const fees = await api.get('/fees');
            
            const totalCollected = fees.reduce((sum, f) => sum + f.paidAmount, 0);
            const totalDue = fees.reduce((sum, f) => sum + f.dueAmount, 0);
            
            stats = [
                { title: 'Total Students', value: students.length, icon: '👨‍🎓' },
                { title: 'Total Teachers', value: teachers.length, icon: '👨‍🏫' },
                { title: 'Total Courses', value: courses.length, icon: '📚' },
                { title: 'Total Collection', value: formatCurrency(totalCollected), icon: '💰' },
                { title: 'Total Due', value: formatCurrency(totalDue), icon: '⚠️' }
            ];
        } else if (role === 'teacher') {
            const profile = JSON.parse(localStorage.getItem('profile') || '{}');
            const courses = await api.get('/courses');
            const myCourses = courses.filter(c => c.teacherId === profile._id);
            
            stats = [
                { title: 'My Courses', value: myCourses.length, icon: '📖' },
                { title: 'Total Students', value: 'Loading...', icon: '👨‍🎓' }
            ];
        } else if (role === 'student') {
            const profile = JSON.parse(localStorage.getItem('profile') || '{}');
            const grades = await api.get(`/grades/student/${profile._id}`);
            const attendance = await api.get(`/attendance/student/${profile._id}`);
            
            const sgpa = grades.summary?.sgpa || 0;
            const attendancePercentage = attendance.statistics?.attendancePercentage || 0;
            
            stats = [
                { title: 'SGPA', value: sgpa, icon: '📊' },
                { title: 'Attendance', value: `${attendancePercentage}%`, icon: '📅' },
                { title: 'Courses Enrolled', value: grades.grades?.length || 0, icon: '📚' }
            ];
        }
        
        const statsGrid = document.getElementById('statsGrid');
        statsGrid.innerHTML = stats.map(stat => `
            <div class="stat-card">
                <h3>${stat.title}</h3>
                <div class="stat-value">${stat.value}</div>
                <div style="font-size: 30px;">${stat.icon}</div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Display user info
function displayUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userNameElement = document.getElementById('userName');
    const userRoleElement = document.getElementById('userRole');
    
    if (userNameElement) {
        userNameElement.textContent = user.name || 'User';
    }
    
    if (userRoleElement) {
        userRoleElement.textContent = user.role?.toUpperCase() || '';
    }
}

// Load recent activities
async function loadRecentActivities() {
    try {
        const activities = [];
        const activitiesDiv = document.getElementById('recentActivities');
        
        if (activitiesDiv) {
            activitiesDiv.innerHTML = '<p>Loading activities...</p>';
            // You can fetch recent activities from your backend here
            setTimeout(() => {
                activitiesDiv.innerHTML = '<p>No recent activities</p>';
            }, 1000);
        }
    } catch (error) {
        console.error('Error loading activities:', error);
    }
}

// Initialize dashboard
if (window.location.pathname.includes('dashboard.html')) {
    displayUserInfo();
    loadDashboardStats();
    loadRecentActivities();
}