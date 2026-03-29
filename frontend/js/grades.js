// Load courses for grade dropdown
async function loadCoursesForGrades() {
    try {
        const courses = await api.get('/courses');
        const courseSelect = document.getElementById('gradeCourseSelect');
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

// Load students for grade assignment
async function loadGradeStudents() {
    const courseId = document.getElementById('gradeCourseSelect').value;
    if (!courseId) {
        document.getElementById('gradeForm').style.display = 'none';
        return;
    }
    
    try {
        const students = await api.get('/students');
        const studentSelect = document.getElementById('gradeStudentSelect');
        studentSelect.innerHTML = '<option value="">Select Student</option>' +
            students.map(s => `<option value="${s._id}">${s.rollNumber} - ${s.userId?.name}</option>`).join('');
        
        studentSelect.onchange = async () => {
            const studentId = studentSelect.value;
            if (studentId) {
                await loadExistingGrade(courseId, studentId);
                document.getElementById('gradeForm').style.display = 'block';
            } else {
                document.getElementById('gradeForm').style.display = 'none';
            }
        };
    } catch (error) {
        showMessage('Error loading students', 'error');
    }
}

// Load existing grade
async function loadExistingGrade(courseId, studentId) {
    try {
        const grades = await api.get(`/grades/student/${studentId}`);
        const grade = grades.grades.find(g => g.courseId._id === courseId);
        
        if (grade) {
            document.getElementById('internalMarks').value = grade.internalMarks || '';
            document.getElementById('externalMarks').value = grade.externalMarks || '';
            document.getElementById('gradeRemarks').value = grade.remarks || '';
        } else {
            document.getElementById('internalMarks').value = '';
            document.getElementById('externalMarks').value = '';
            document.getElementById('gradeRemarks').value = '';
        }
    } catch (error) {
        console.error('Error loading grade:', error);
    }
}

// Save grade
async function saveGrade() {
    const courseId = document.getElementById('gradeCourseSelect').value;
    const studentId = document.getElementById('gradeStudentSelect').value;
    const internalMarks = parseInt(document.getElementById('internalMarks').value) || 0;
    const externalMarks = parseInt(document.getElementById('externalMarks').value) || 0;
    const remarks = document.getElementById('gradeRemarks').value;
    
    if (!courseId || !studentId) {
        showMessage('Please select course and student', 'error');
        return;
    }
    
    try {
        await api.post('/grades', {
            studentId,
            courseId,
            semester: 1, // You can get this from student data
            internalMarks,
            externalMarks,
            remarks
        });
        showMessage('Grade saved successfully');
    } catch (error) {
        showMessage('Error saving grade', 'error');
    }
}

// Load student grades report
async function loadStudentGrades() {
    const studentId = document.getElementById('reportStudentSelect').value;
    if (!studentId) return;
    
    try {
        const grades = await api.get(`/grades/student/${studentId}`);
        
        const summaryDiv = document.getElementById('gradeSummary');
        summaryDiv.innerHTML = `
            <div class="stat-card">
                <h3>SGPA</h3>
                <div class="stat-value">${grades.summary.sgpa}</div>
            </div>
            <div class="stat-card">
                <h3>Total Credits</h3>
                <div class="stat-value">${grades.summary.totalCredits}</div>
            </div>
        `;
        
        const tbody = document.getElementById('gradesList');
        tbody.innerHTML = grades.grades.map(grade => `
            <tr>
                <td>${grade.courseId?.courseCode}</td>
                <td>${grade.courseId?.courseName}</td>
                <td>${grade.internalMarks}</td>
                <td>${grade.externalMarks}</td>
                <td>${grade.totalMarks}</td>
                <td><strong>${grade.grade}</strong></td>
            </tr>
        `).join('');
    } catch (error) {
        showMessage('Error loading grades', 'error');
    }
}

// Initialize grades page
if (window.location.pathname.includes('grades.html')) {
    loadCoursesForGrades();
}