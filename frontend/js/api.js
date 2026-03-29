const API_BASE_URL = 'http://localhost:5000/api';

let authToken = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user') || '{}');

const api = {
    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        if (response.status === 401) {
            localStorage.clear();
            window.location.href = 'login.html';
            throw new Error('Session expired');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong');
        }
        
        return data;
    },
    
    get(endpoint) {
        return this.request(endpoint);
    },
    
    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
};

// Helper functions
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        border-radius: 5px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        z-index: 1000;
        animation: slideIn 0.3s;
    `;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 3000);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}