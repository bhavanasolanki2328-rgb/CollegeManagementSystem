// Load all fees
async function loadFees() {
    try {
        const fees = await api.get('/fees');
        const students = await api.get('/students');
        displayFees(fees, students);
        calculateSummary(fees);
    } catch (error) {
        console.error('Error loading fees:', error);
        showMessage('Failed to load fees', 'error');
    }
}

// Display fees in table
function displayFees(fees, students) {
    const tbody = document.getElementById('feesList');
    if (!tbody) return;
    
    tbody.innerHTML = fees.map(fee => {
        const student = students.find(s => s._id === fee.studentId);
        const statusClass = fee.status === 'paid' ? 'status-present' : fee.status === 'partial' ? 'status-late' : 'status-absent';
        const statusText = fee.status.toUpperCase();
        
        return `
            <tr>
                <td>${student?.rollNumber || 'N/A'}</td>
                <td>${student?.userId?.name || 'N/A'}</td>
                <td>${fee.semester}</td>
                <td>${formatCurrency(fee.totalFee)}</td>
                <td>${formatCurrency(fee.paidAmount)}</td>
                <td>${formatCurrency(fee.dueAmount)}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn btn-sm" onclick="recordPayment('${fee.studentId}', ${fee.semester})">Pay</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Calculate summary
function calculateSummary(fees) {
    const totalCollected = fees.reduce((sum, f) => sum + f.paidAmount, 0);
    const totalDue = fees.reduce((sum, f) => sum + f.dueAmount, 0);
    const totalFee = totalCollected + totalDue;
    const collectionRate = totalFee ? ((totalCollected / totalFee) * 100).toFixed(2) : 0;
    
    document.getElementById('totalCollected').textContent = formatCurrency(totalCollected);
    document.getElementById('totalDue').textContent = formatCurrency(totalDue);
    document.getElementById('collectionRate').textContent = `${collectionRate}%`;
}

// Search fees
function searchFees() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#feesList tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Filter fees
function filterFees() {
    const status = document.getElementById('statusFilter').value;
    const rows = document.querySelectorAll('#feesList tr');
    
    rows.forEach(row => {
        const statusCell = row.cells[6]?.textContent.toLowerCase();
        row.style.display = !status || statusCell === status ? '' : 'none';
    });
}

// Load students for fee modal
async function loadStudentsForFee() {
    try {
        const students = await api.get('/students');
        const studentSelect = document.getElementById('studentId');
        if (studentSelect) {
            studentSelect.innerHTML = '<option value="">Select Student</option>' +
                students.map(s => `<option value="${s._id}">${s.rollNumber} - ${s.userId?.name}</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

// Show add fee modal
async function showAddFeeModal() {
    await loadStudentsForFee();
    document.getElementById('feeForm').reset();
    document.getElementById('feeModal').style.display = 'block';
}

// Record payment
function recordPayment(studentId, semester) {
    document.getElementById('paymentStudentId').value = studentId;
    document.getElementById('paymentSemester').value = semester;
    document.getElementById('paymentForm').reset();
    document.getElementById('paymentModal').style.display = 'block';
}

// Handle fee form submission
if (document.getElementById('feeForm')) {
    document.getElementById('feeForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const feeData = {
            studentId: document.getElementById('studentId').value,
            semester: parseInt(document.getElementById('semester').value),
            totalFee: parseFloat(document.getElementById('totalFee').value)
        };
        
        try {
            await api.post('/fees', feeData);
            showMessage('Fee structure added successfully');
            closeModal();
            loadFees();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });
}

// Handle payment form submission
if (document.getElementById('paymentForm')) {
    document.getElementById('paymentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const paymentData = {
            studentId: document.getElementById('paymentStudentId').value,
            semester: parseInt(document.getElementById('paymentSemester').value),
            amount: parseFloat(document.getElementById('amount').value),
            mode: document.getElementById('mode').value,
            transactionId: document.getElementById('transactionId').value
        };
        
        try {
            await api.post('/fees/payment', paymentData);
            showMessage('Payment recorded successfully');
            closePaymentModal();
            loadFees();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });
}

// Close modals
function closeModal() {
    document.getElementById('feeModal').style.display = 'none';
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

// Initialize fees page
if (window.location.pathname.includes('fees.html')) {
    loadFees();
}