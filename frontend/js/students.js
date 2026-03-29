// Load all students
async function loadStudents() {
    try {
        const students = await api.get('/students');
        displayStudents(students);
    } catch (error) {
        console.error('Error loading students:', error);
        showMessage('Failed to load students', 'error');
    }
}

// Display students in table
function displayStudents(students) {
    const tbody = document.getElementById('studentsList');
    if (!tbody) return;
    
    tbody.innerHTML = students.map(student => `
        <tr>
            <td>${student.rollNumber}</td>
            <td>${student.userId?.name || 'N/A'}</td>
            <td>${student.userId?.email || 'N/A'}</td>
            <td>${student.department}</td>
            <td>${student.semester}</td>
            <td>${student.batch}</td>
            <td>
                <button class="btn btn-sm" onclick="editStudent('${student._id}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteStudent('${student._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Search students
function searchStudents() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#studentsList tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Filter students
function filterStudents() {
    const department = document.getElementById('departmentFilter').value;
    const semester = document.getElementById('semesterFilter').value;
    
    const rows = document.querySelectorAll('#studentsList tr');
    
    rows.forEach(row => {
        const rowDepartment = row.cells[3]?.textContent;
        const rowSemester = row.cells[4]?.textContent;
        
        let show = true;
        if (department && rowDepartment !== department) show = false;
        if (semester && rowSemester !== semester) show = false;
        
        row.style.display = show ? '' : 'none';
    });
}

// Show add student modal
function showAddStudentModal() {
    document.getElementById('modalTitle').textContent = 'Add New Student';
    document.getElementById('studentForm').reset();
    document.getElementById('studentId').value = '';
    document.getElementById('studentModal').style.display = 'block';
}

// Edit student
async function editStudent(id) {
    try {
        const student = await api.get(`/students/${id}`);
        document.getElementById('modalTitle').textContent = 'Edit Student';
        document.getElementById('studentId').value = student._id;
        document.getElementById('name').value = student.userId?.name || '';
        document.getElementById('email').value = student.userId?.email || '';
        document.getElementById('rollNumber').value = student.rollNumber;
        document.getElementById('department').value = student.department;
        document.getElementById('semester').value = student.semester;
        document.getElementById('phone').value = student.phone || '';
        document.getElementById('address').value = student.address || '';
        document.getElementById('password').required = false;
        document.getElementById('studentModal').style.display = 'block';
    } catch (error) {
        showMessage('Error loading student data', 'error');
    }
}

// Delete student
async function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        try {
            await api.delete(`/students/${id}`);
            showMessage('Student deleted successfully');
            loadStudents();
        } catch (error) {
            showMessage('Error deleting student', 'error');
        }
    }
}

// Handle student form submission
if (document.getElementById('studentForm')) {
    document.getElementById('studentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('studentId').value;
        const studentData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            rollNumber: document.getElementById('rollNumber').value,
            department: document.getElementById('department').value,
            semester: parseInt(document.getElementById('semester').value),
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value
        };
        
        try {
            if (id) {
                await api.put(`/students/${id}`, studentData);
                showMessage('Student updated successfully');
            } else {
                await api.post('/students', studentData);
                showMessage('Student added successfully');
            }
            closeModal();
            loadStudents();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });
}

// Close modal
function closeModal() {
    document.getElementById('studentModal').style.display = 'none';
}

// Initialize students page
if (window.location.pathname.includes('students.html')) {
    loadStudents();
}