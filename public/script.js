// Application state
let expenses = [];
let categories = [];
let isEditing = false;
let editingId = null;

// Authentication helper function
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return {};
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// Authenticated fetch wrapper
async function authenticatedFetch(url, options = {}) {
    const headers = getAuthHeaders();
    const config = {
        ...options,
        headers: {
            ...headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(url, config);
        
        if (response.status === 401 || response.status === 403) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login.html';
            return null;
        }
        
        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

// Currency formatting function for Indian Rupees
function formatCurrency(amount) {
    const num = parseFloat(amount);
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// DOM elements
const expenseForm = document.getElementById('expenseForm');
const expensesList = document.getElementById('expensesList');
const emptyState = document.getElementById('emptyState');
const totalExpensesEl = document.getElementById('totalExpenses');
const monthlyExpensesEl = document.getElementById('monthlyExpenses');
const totalTransactionsEl = document.getElementById('totalTransactions');
const expenseCountEl = document.getElementById('expenseCount');
const categorySummaryEl = document.getElementById('categorySummary');
const categorySelect = document.getElementById('category');
const loadingOverlay = document.getElementById('loadingOverlay');
const toastContainer = document.getElementById('toastContainer');
const cancelEditBtn = document.getElementById('cancelEdit');
const applyFiltersBtn = document.getElementById('applyFilters');
const clearFiltersBtn = document.getElementById('clearFilters');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');

// API endpoints
const API_BASE = '/api/expenses';

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    // Set default date to today
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    
    // Load initial data
    await loadCategories();
    await loadExpenses();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update summary
    updateSummary();
});

// Set up event listeners
function setupEventListeners() {
    expenseForm.addEventListener('submit', handleFormSubmit);
    cancelEditBtn.addEventListener('click', cancelEdit);
    applyFiltersBtn.addEventListener('click', applyFilters);
    clearFiltersBtn.addEventListener('click', clearFilters);
}

// Show loading overlay
function showLoading() {
    loadingOverlay.classList.add('show');
}

// Hide loading overlay
function hideLoading() {
    loadingOverlay.classList.remove('show');
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 
                 'info-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove toast after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Load categories from API
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/categories`);
        if (!response.ok) throw new Error('Failed to load categories');
        
        categories = await response.json();
        populateCategorySelect();
    } catch (error) {
        console.error('Error loading categories:', error);
        showToast('Failed to load categories', 'error');
    }
}

// Populate category select dropdown
function populateCategorySelect() {
    categorySelect.innerHTML = '<option value="">Select a category</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

// Load expenses from API
async function loadExpenses(startDate = null, endDate = null) {
    try {
        showLoading();
        
        let url = API_BASE;
        if (startDate || endDate) {
            url += '/range?';
            if (startDate) url += `startDate=${startDate}&`;
            if (endDate) url += `endDate=${endDate}&`;
        }
        
        const response = await authenticatedFetch(url);
        if (!response || !response.ok) throw new Error('Failed to load expenses');
        
        expenses = await response.json();
        renderExpenses();
        updateSummary();
        await loadCategorySummary(startDate, endDate);
        
    } catch (error) {
        console.error('Error loading expenses:', error);
        showToast('Failed to load expenses', 'error');
    } finally {
        hideLoading();
    }
}

// Load category summary
async function loadCategorySummary(startDate = null, endDate = null) {
    try {
        // Calculate category summary from existing expenses data
        let filteredExpenses = expenses;
        
        if (startDate || endDate) {
            filteredExpenses = expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;
                
                if (start && expenseDate < start) return false;
                if (end && expenseDate > end) return false;
                return true;
            });
        }
        
        const summary = {};
        filteredExpenses.forEach(expense => {
            if (!summary[expense.category]) {
                summary[expense.category] = {
                    category: expense.category,
                    total: 0,
                    count: 0,
                    color: expense.category_color || '#666'
                };
            }
            summary[expense.category].total += parseFloat(expense.amount);
            summary[expense.category].count += 1;
        });
        
        const summaryArray = Object.values(summary).sort((a, b) => b.total - a.total);
        renderCategorySummary(summaryArray);
        
    } catch (error) {
        console.error('Error loading category summary:', error);
    }
}

// Render expenses list
function renderExpenses() {
    if (expenses.length === 0) {
        expensesList.style.display = 'none';
        emptyState.style.display = 'block';
        expenseCountEl.textContent = '0 expenses';
        return;
    }
    
    expensesList.style.display = 'block';
    emptyState.style.display = 'none';
    expenseCountEl.textContent = `${expenses.length} expense${expenses.length !== 1 ? 's' : ''}`;
    
    expensesList.innerHTML = expenses.map(expense => {
        const categoryColor = expense.category_color || '#667eea';
        const expenseDate = new Date(expense.date).toLocaleDateString();
        
        return `
            <div class="expense-item">
                <div class="expense-main">
                    <div class="expense-icon" style="background-color: ${categoryColor}">
                        <i class="fas fa-${getCategoryIcon(expense.category)}"></i>
                    </div>
                    <div class="expense-details">
                        <h4>${expense.category}</h4>
                        <p>${expense.description || 'No description'}</p>
                    </div>
                </div>
                <div class="expense-meta">
                    <div class="expense-amount">${formatCurrency(expense.amount)}</div>
                    <div class="expense-date">${expenseDate}</div>
                </div>
                <div class="expense-actions">
                    <button class="btn btn-edit" onclick="editExpense(${expense.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteExpense(${expense.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Render category summary
function renderCategorySummary(summary) {
    if (summary.length === 0) {
        categorySummaryEl.innerHTML = '<p class="text-muted">No expenses in the selected period</p>';
        return;
    }
    
    categorySummaryEl.innerHTML = summary.map(item => {
        const color = item.category_color || '#667eea';
        return `
            <div class="category-item">
                <div class="category-info">
                    <div class="category-color" style="background-color: ${color}"></div>
                    <div class="category-details">
                        <h5>${item.category}</h5>
                        <p>${item.transaction_count} transaction${item.transaction_count !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <div class="category-amount">${formatCurrency(item.total_amount)}</div>
            </div>
        `;
    }).join('');
}

// Get icon for category
function getCategoryIcon(category) {
    const icons = {
        'Food & Dining': 'utensils',
        'Transportation': 'car',
        'Shopping': 'shopping-bag',
        'Entertainment': 'film',
        'Bills & Utilities': 'file-invoice-dollar',
        'Healthcare': 'medkit',
        'Education': 'graduation-cap',
        'Travel': 'plane',
        'Other': 'ellipsis-h'
    };
    return icons[category] || 'money-bill-wave';
}

// Update summary cards
function updateSummary() {
    const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTotal = expenses
        .filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        })
        .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    totalExpensesEl.textContent = formatCurrency(total);
    monthlyExpensesEl.textContent = formatCurrency(monthlyTotal);
    totalTransactionsEl.textContent = expenses.length.toString();
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(expenseForm);
    const expenseData = {
        amount: parseFloat(formData.get('amount')),
        category: formData.get('category'),
        description: formData.get('description'),
        date: formData.get('date')
    };
    
    // Validate form data
    if (!expenseData.amount || !expenseData.category || !expenseData.date) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (expenseData.amount <= 0) {
        showToast('Amount must be greater than 0', 'error');
        return;
    }
    
    try {
        showLoading();
        
        let response;
        if (isEditing) {
            response = await authenticatedFetch(`${API_BASE}/${editingId}`, {
                method: 'PUT',
                body: JSON.stringify(expenseData),
            });
        } else {
            response = await authenticatedFetch(API_BASE, {
                method: 'POST',
                body: JSON.stringify(expenseData),
            });
        }
        
        if (!response || !response.ok) {
            throw new Error(`Failed to ${isEditing ? 'update' : 'add'} expense`);
        }
        
        const result = await response.json();
        
        if (isEditing) {
            const index = expenses.findIndex(exp => exp.id === editingId);
            if (index !== -1) {
                expenses[index] = result;
            }
            showToast('Expense updated successfully', 'success');
            cancelEdit();
        } else {
            expenses.unshift(result);
            showToast('Expense added successfully', 'success');
        }
        
        expenseForm.reset();
        document.getElementById('date').value = new Date().toISOString().split('T')[0];
        renderExpenses();
        updateSummary();
        await loadCategorySummary();
        
    } catch (error) {
        console.error('Error saving expense:', error);
        showToast(`Failed to ${isEditing ? 'update' : 'add'} expense`, 'error');
    } finally {
        hideLoading();
    }
}

// Edit expense
function editExpense(id) {
    const expense = expenses.find(exp => exp.id === id);
    if (!expense) return;
    
    document.getElementById('amount').value = expense.amount;
    document.getElementById('category').value = expense.category;
    document.getElementById('description').value = expense.description || '';
    document.getElementById('date').value = expense.date;
    
    isEditing = true;
    editingId = id;
    
    // Update form button
    const submitBtn = expenseForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Expense';
    cancelEditBtn.style.display = 'inline-flex';
    
    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// Cancel edit
function cancelEdit() {
    isEditing = false;
    editingId = null;
    
    expenseForm.reset();
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    
    // Reset form button
    const submitBtn = expenseForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Expense';
    cancelEditBtn.style.display = 'none';
}

// Delete expense
async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }
    
    try {
        showLoading();
        
        const response = await authenticatedFetch(`${API_BASE}/${id}`, {
            method: 'DELETE',
        });
        
        if (!response || !response.ok) {
            throw new Error('Failed to delete expense');
        }
        
        expenses = expenses.filter(exp => exp.id !== id);
        renderExpenses();
        updateSummary();
        await loadCategorySummary();
        
        showToast('Expense deleted successfully', 'success');
        
    } catch (error) {
        console.error('Error deleting expense:', error);
        showToast('Failed to delete expense', 'error');
    } finally {
        hideLoading();
    }
}

// Apply filters
async function applyFilters() {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    
    if (startDate && endDate && startDate > endDate) {
        showToast('Start date cannot be after end date', 'error');
        return;
    }
    
    await loadExpenses(startDate, endDate);
    showToast('Filters applied successfully', 'success');
}

// Clear filters
async function clearFilters() {
    startDateInput.value = '';
    endDateInput.value = '';
    await loadExpenses();
    showToast('Filters cleared', 'info');
}

// Global functions for inline event handlers
window.editExpense = editExpense;
window.deleteExpense = deleteExpense;
