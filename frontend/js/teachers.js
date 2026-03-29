// Load all teachers
async function loadTeachers() {
    try {
        const teachers = await api.get('/teachers');
        displayTeachers(teachers);
    } catch (error) {
        console.error('Error loading teachers:', error);
        showMessage('Failed to load teachers', 'error');
    }
}

// Display teachers in table
function displayTeachers(teachers) {
    const tbody = document.getElementById('teachersList');
    if (!tbody) return;
    
    tbody.innerHTML = teachers.map(teacher => `
        <tr>
            <td>${teacher.employeeId}</td>
            <td>${teacher.userId?.name || 'N/A'}</td>
            <td>${teacher.userId?.email || 'N/A'}</td>
            <td>${teacher.department}</td>
            <td>${teacher.designation || 'N/A'}</td>
            <td>${teacher.qualification || 'N/A'}</td>
            <td>
                <button class="btn btn-sm" onclick="editTeacher('${teacher._id}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteTeacher('${teacher._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Search teachers
function searchTeachers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#teachersList tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Filter teachers
function filterTeachers() {
    const department = document.getElementById('departmentFilter').value;
    const rows = document.querySelectorAll('#teachersList tr');
    
    rows.forEach(row => {
        const rowDepartment = row.cells[3]?.textContent;
        row.style.display = !department || rowDepartment === department ? '' : 'none';
    });
}

// Show add teacher modal
function showAddTeacherModal() {
    document.getElementById('modalTitle').textContent = 'Add New Teacher';
    document.getElementById('teacherForm').reset();
    document.getElementById('teacherId').value = '';
    document.getElementById('teacherModal').style.display = 'block';
}

// Edit teacher
async function editTeacher(id) {
    try {
        const teacher = await api.get(`/teachers/${id}`);
        document.getElementById('modalTitle').textContent = 'Edit Teacher';
        document.getElementById('teacherId').value = teacher._id;
        document.getElementById('name').value = teacher.userId?.name || '';
        document.getElementById('email').value = teacher.userId?.email || '';
        document.getElementById('employeeId').value = teacher.employeeId;
        document.getElementById('department').value = teacher.department;
        document.getElementById('designation').value = teacher.designation || '';
        document.getElementById('qualification').value = teacher.qualification || '';
        document.getElementById('specialization').value = teacher.specialization || '';
        document.getElementById('phone').value = teacher.phone || '';
        document.getElementById('password').required = false;
        document.getElementById('teacherModal').style.display = 'block';
    } catch (error) {
        showMessage('Error loading teacher data', 'error');
    }
}

// Delete teacher
async function deleteTeacher(id) {
    if (confirm('Are you sure you want to delete this teacher?')) {
        try {
            await api.delete(`/teachers/${id}`);
            showMessage('Teacher deleted successfully');
            loadTeachers();
        } catch (error) {
            showMessage('Error deleting teacher', 'error');
        }
    }
}

// Handle teacher form submission
if (document.getElementById('teacherForm')) {
    document.getElementById('teacherForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('teacherId').value;
        const teacherData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            employeeId: document.getElementById('employeeId').value,
            department: document.getElementById('department').value,
            designation: document.getElementById('designation').value,
            qualification: document.getElementById('qualification').value,
            specialization: document.getElementById('specialization').value,
            phone: document.getElementById('phone').value
        };
        
        try {
            if (id) {
                await api.put(`/teachers/${id}`, teacherData);
                showMessage('Teacher updated successfully');
            } else {
                await api.post('/teachers', teacherData);
                showMessage('Teacher added successfully');
            }
            closeModal();
            loadTeachers();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });
}

// Close modal
function closeModal() {
    document.getElementById('teacherModal').style.display = 'none';
}

// Initialize teachers page
if (window.location.pathname.includes('teachers.html')) {
    loadTeachers();
}