// Load all courses
async function loadCourses() {
    try {
        const courses = await api.get('/courses');
        const teachers = await api.get('/teachers');
        displayCourses(courses, teachers);
    } catch (error) {
        console.error('Error loading courses:', error);
        showMessage('Failed to load courses', 'error');
    }
}

// Display courses in table
function displayCourses(courses, teachers) {
    const tbody = document.getElementById('coursesList');
    if (!tbody) return;
    
    tbody.innerHTML = courses.map(course => {
        const teacher = teachers.find(t => t._id === course.teacherId);
        return `
            <tr>
                <td>${course.courseCode}</td>
                <td>${course.courseName}</td>
                <td>${course.department}</td>
                <td>${course.semester}</td>
                <td>${course.credits}</td>
                <td>${teacher?.userId?.name || 'Not Assigned'}</td>
                <td>${course.schedule?.day || 'N/A'} ${course.schedule?.startTime || ''}</td>
                <td>
                    <button class="btn btn-sm" onclick="editCourse('${course._id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCourse('${course._id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Search courses
function searchCourses() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#coursesList tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Filter courses
function filterCourses() {
    const department = document.getElementById('departmentFilter').value;
    const semester = document.getElementById('semesterFilter').value;
    
    const rows = document.querySelectorAll('#coursesList tr');
    
    rows.forEach(row => {
        const rowDepartment = row.cells[2]?.textContent;
        const rowSemester = row.cells[3]?.textContent;
        
        let show = true;
        if (department && rowDepartment !== department) show = false;
        if (semester && rowSemester !== semester) show = false;
        
        row.style.display = show ? '' : 'none';
    });
}

// Load teachers for dropdown
async function loadTeachersForDropdown() {
    try {
        const teachers = await api.get('/teachers');
        const teacherSelect = document.getElementById('teacherId');
        if (teacherSelect) {
            teacherSelect.innerHTML = '<option value="">Select Teacher</option>' +
                teachers.map(t => `<option value="${t._id}">${t.userId?.name}</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading teachers:', error);
    }
}

// Show add course modal
async function showAddCourseModal() {
    document.getElementById('modalTitle').textContent = 'Add New Course';
    document.getElementById('courseForm').reset();
    document.getElementById('courseId').value = '';
    await loadTeachersForDropdown();
    document.getElementById('courseModal').style.display = 'block';
}

// Edit course
async function editCourse(id) {
    try {
        const course = await api.get(`/courses/${id}`);
        await loadTeachersForDropdown();
        
        document.getElementById('modalTitle').textContent = 'Edit Course';
        document.getElementById('courseId').value = course._id;
        document.getElementById('courseCode').value = course.courseCode;
        document.getElementById('courseName').value = course.courseName;
        document.getElementById('department').value = course.department;
        document.getElementById('semester').value = course.semester;
        document.getElementById('credits').value = course.credits;
        document.getElementById('teacherId').value = course.teacherId || '';
        document.getElementById('description').value = course.description || '';
        document.getElementById('scheduleDay').value = course.schedule?.day || '';
        document.getElementById('startTime').value = course.schedule?.startTime || '';
        document.getElementById('endTime').value = course.schedule?.endTime || '';
        document.getElementById('room').value = course.schedule?.room || '';
        
        document.getElementById('courseModal').style.display = 'block';
    } catch (error) {
        showMessage('Error loading course data', 'error');
    }
}

// Delete course
async function deleteCourse(id) {
    if (confirm('Are you sure you want to delete this course?')) {
        try {
            await api.delete(`/courses/${id}`);
            showMessage('Course deleted successfully');
            loadCourses();
        } catch (error) {
            showMessage('Error deleting course', 'error');
        }
    }
}

// Handle course form submission
if (document.getElementById('courseForm')) {
    document.getElementById('courseForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('courseId').value;
        const courseData = {
            courseCode: document.getElementById('courseCode').value,
            courseName: document.getElementById('courseName').value,
            department: document.getElementById('department').value,
            semester: parseInt(document.getElementById('semester').value),
            credits: parseInt(document.getElementById('credits').value),
            teacherId: document.getElementById('teacherId').value,
            description: document.getElementById('description').value,
            schedule: {
                day: document.getElementById('scheduleDay').value,
                startTime: document.getElementById('startTime').value,
                endTime: document.getElementById('endTime').value,
                room: document.getElementById('room').value
            }
        };
        
        try {
            if (id) {
                await api.put(`/courses/${id}`, courseData);
                showMessage('Course updated successfully');
            } else {
                await api.post('/courses', courseData);
                showMessage('Course added successfully');
            }
            closeModal();
            loadCourses();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });
}

// Close modal
function closeModal() {
    document.getElementById('courseModal').style.display = 'none';
}

// Initialize courses page
if (window.location.pathname.includes('courses.html')) {
    loadCourses();
}