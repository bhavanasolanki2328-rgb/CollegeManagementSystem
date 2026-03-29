// Load courses for dropdown
async function loadCoursesForAttendance() {
    try {
        const courses = await api.get('/courses');
        const courseSelect = document.getElementById('courseSelect');
        if (courseSelect) {
            courseSelect.innerHTML = '<option value="">Select Course</option>' +
                courses.map(c => `<option value="${c._id}">${c.courseName} (${c.courseCode})</option>`).join('');
        }
        
        const reportStudentSelect = document.getElementById('reportStudentSelect');
        if (reportStudentSelect) {
            const students = await api.get('/students');
            reportStudentSelect.innerHTML = '<option value="">Select Student</option>' +
                students.map(s => `<option value="${s._id}">${s.rollNumber} - ${s.userId?.name}</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

// Load students for a course
async function loadCourseStudents() {
    const courseId = document.getElementById('courseSelect').value;
    if (!courseId) {
        document.getElementById('attendanceSection').style.display = 'none';
        return;
    }
    
    try {
        const students = await api.get('/students');
        const courseStudents = students; // You can filter by course enrollment if needed
        
        const tbody = document.getElementById('attendanceList');
        tbody.innerHTML = courseStudents.map(student => `
            <tr>
                <td>${student.rollNumber}</td>
                <td>${student.userId?.name}</td>
                <td>
                    <select class="attendance-status" data-student-id="${student._id}">
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                    </select>
                </td>
            </tr>
        `).join('');
        
        document.getElementById('attendanceSection').style.display = 'block';
        document.getElementById('attendanceDate').value = new Date().toISOString().split('T')[0];
    } catch (error) {
        showMessage('Error loading students', 'error');
    }
}

// Mark attendance
async function markAttendance() {
    const courseId = document.getElementById('courseSelect').value;
    const date = document.getElementById('attendanceDate').value;
    
    if (!courseId || !date) {
        showMessage('Please select course and date', 'error');
        return;
    }
    
    const records = [];
    const rows = document.querySelectorAll('#attendanceList tr');
    
    rows.forEach(row => {
        const studentId = row.querySelector('.attendance-status').dataset.studentId;
        const status = row.querySelector('.attendance-status').value;
        records.push({ studentId, status });
    });
    
    try {
        await api.post('/attendance', { courseId, date, records });
        showMessage('Attendance saved successfully');
    } catch (error) {
        showMessage('Error saving attendance', 'error');
    }
}

// Load student attendance report
async function loadStudentAttendance() {
    const studentId = document.getElementById('reportStudentSelect').value;
    if (!studentId) return;
    
    try {
        const attendance = await api.get(`/attendance/student/${studentId}`);
        
        const statsDiv = document.getElementById('attendanceStats');
        statsDiv.innerHTML = `
            <div class="stat-card">
                <h3>Total Days</h3>
                <div class="stat-value">${attendance.statistics.totalDays}</div>
            </div>
            <div class="stat-card">
                <h3>Present Days</h3>
                <div class="stat-value">${attendance.statistics.presentDays}</div>
            </div>
            <div class="stat-card">
                <h3>Attendance Percentage</h3>
                <div class="stat-value">${attendance.statistics.attendancePercentage}%</div>
            </div>
        `;
        
        const historyDiv = document.getElementById('attendanceHistory');
        historyDiv.innerHTML = `
            <h4>Attendance History</h4>
            <div class="table-container">
                <table>
                    <thead>
                        <tr><th>Date</th><th>Course</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        ${attendance.records.map(record => `
                            <tr>
                                <td>${formatDate(record.date)}</td>
                                <td>${record.courseId?.courseName}</td>
                                <td><span class="status-badge status-${record.status}">${record.status.toUpperCase()}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        showMessage('Error loading attendance report', 'error');
    }
}

// Initialize attendance page
if (window.location.pathname.includes('attendance.html')) {
    loadCoursesForAttendance();
}