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
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    
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
        const color = item.color || '#667eea';
        return `
            <div class="category-item">
                <div class="category-info">
                    <div class="category-color" style="background-color: ${color}"></div>
                    <div class="category-details">
                        <h5>${item.category}</h5>
                        <p>${item.count} transaction${item.count !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <div class="category-amount">${formatCurrency(item.total)}</div>
            </div>
        `;
    }).join('');
}

// Get icon for category
function getCategoryIcon(category) {
    const icons = {
        'Food': 'utensils',
        'Transportation': 'car',
        'Entertainment': 'film',
        'Shopping': 'shopping-bag',
        'Bills': 'file-invoice-dollar',
        'Healthcare': 'medkit',
        'Education': 'graduation-cap',
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
    
    console.log('Form data being submitted:', expenseData);
    
    // Validate form data
    if (!expenseData.amount || !expenseData.category || !expenseData.date) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (expenseData.amount <= 0 || isNaN(expenseData.amount)) {
        showToast('Amount must be a valid number greater than 0', 'error');
        return;
    }
    
    try {
        showLoading();
        
        console.log('Sending request to:', isEditing ? `${API_BASE}/${editingId}` : API_BASE);
        console.log('Request data:', JSON.stringify(expenseData));
        
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
        
        console.log('Response status:', response ? response.status : 'No response');
        
        if (!response || !response.ok) {
            const errorText = response ? await response.text() : 'No response';
            console.error('Server response:', errorText);
            throw new Error(`Failed to ${isEditing ? 'update' : 'add'} expense: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Success response:', result);
        
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
        showToast(`Failed to ${isEditing ? 'update' : 'add'} expense: ${error.message}`, 'error');
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

// ============ ENHANCED FEATURES ============

// Chart variables
let categoryChart = null;
let trendChart = null;
let monthlyBudget = 0;

// Initialize enhanced features
function initializeEnhancedFeatures() {
    loadBudget();
    setupCharts();
    setupEventListeners();
}

// Load saved budget from localStorage
function loadBudget() {
    const savedBudget = localStorage.getItem('monthlyBudget');
    if (savedBudget) {
        monthlyBudget = parseFloat(savedBudget);
        document.getElementById('monthlyBudget').value = monthlyBudget;
        document.getElementById('budgetAmount').textContent = formatCurrency(monthlyBudget);
        updateBudgetProgress();
    }
}

// Setup chart canvases
function setupCharts() {
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    
    // Category Chart (Pie Chart)
    categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#667eea', '#f093fb', '#4facfe', '#43e97b', '#f5576c',
                    '#764ba2', '#38f9d7', '#ffeaa7', '#fd79a8', '#6c5ce7'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
    
    // Trend Chart (Line Chart)
    trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Daily Spending',
                data: [],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toFixed(0);
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    updateCharts();
}

// Setup event listeners for enhanced features
function setupEventListeners() {
    // Budget setting
    document.getElementById('setBudget').addEventListener('click', setBudget);
    
    // Export buttons
    document.getElementById('exportPDF').addEventListener('click', exportToPDF);
    document.getElementById('exportCSV').addEventListener('click', exportToCSV);
    
    // Trend period selector
    document.getElementById('trendPeriod').addEventListener('change', updateTrendChart);
}

// Update charts with current data
function updateCharts() {
    updateCategoryChart();
    updateTrendChart();
}

// Update category chart
function updateCategoryChart() {
    const categoryTotals = {};
    
    expenses.forEach(expense => {
        const category = expense.category || 'Other';
        categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(expense.amount);
    });
    
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    
    categoryChart.data.labels = labels;
    categoryChart.data.datasets[0].data = data;
    categoryChart.update();
}

// Update trend chart
function updateTrendChart() {
    const period = parseInt(document.getElementById('trendPeriod').value);
    const today = new Date();
    const startDate = new Date(today.getTime() - (period * 24 * 60 * 60 * 1000));
    
    const dailyTotals = {};
    
    // Initialize all dates with 0
    for (let i = 0; i < period; i++) {
        const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
        const dateStr = date.toISOString().split('T')[0];
        dailyTotals[dateStr] = 0;
    }
    
    // Aggregate expenses by date
    expenses.forEach(expense => {
        const expenseDate = expense.date;
        if (expenseDate >= startDate.toISOString().split('T')[0]) {
            dailyTotals[expenseDate] = (dailyTotals[expenseDate] || 0) + parseFloat(expense.amount);
        }
    });
    
    const sortedDates = Object.keys(dailyTotals).sort();
    const labels = sortedDates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    });
    const data = sortedDates.map(date => dailyTotals[date]);
    
    trendChart.data.labels = labels;
    trendChart.data.datasets[0].data = data;
    trendChart.update();
}

// Set monthly budget
function setBudget() {
    const budgetInput = document.getElementById('monthlyBudget');
    const amount = parseFloat(budgetInput.value);
    
    if (!amount || amount <= 0) {
        showToast('Please enter a valid budget amount', 'error');
        return;
    }
    
    monthlyBudget = amount;
    localStorage.setItem('monthlyBudget', monthlyBudget.toString());
    
    document.getElementById('budgetAmount').textContent = formatCurrency(monthlyBudget);
    updateBudgetProgress();
    showToast('Budget set successfully!', 'success');
}

// Update budget progress and alerts
function updateBudgetProgress() {
    if (monthlyBudget <= 0) return;
    
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const monthlySpent = expenses
        .filter(expense => expense.date.startsWith(currentMonth))
        .reduce((total, expense) => total + parseFloat(expense.amount), 0);
    
    const percentage = (monthlySpent / monthlyBudget) * 100;
    const progressFill = document.getElementById('budgetProgress');
    const budgetText = document.getElementById('budgetText');
    const budgetAlerts = document.getElementById('budgetAlerts');
    
    // Update progress bar
    progressFill.style.width = Math.min(percentage, 100) + '%';
    
    // Update budget text
    const remaining = monthlyBudget - monthlySpent;
    if (remaining > 0) {
        budgetText.textContent = `₹${remaining.toFixed(2)} remaining`;
    } else {
        budgetText.textContent = `₹${Math.abs(remaining).toFixed(2)} over budget`;
    }
    
    // Update progress bar color based on percentage
    if (percentage >= 100) {
        progressFill.style.background = '#f5576c';
    } else if (percentage >= 80) {
        progressFill.style.background = '#ffeaa7';
    } else {
        progressFill.style.background = 'white';
    }
    
    // Show budget alerts
    budgetAlerts.innerHTML = '';
    
    if (percentage >= 100) {
        budgetAlerts.innerHTML = `
            <div class="budget-alert danger">
                <i class="fas fa-exclamation-triangle"></i>
                You have exceeded your monthly budget by ₹${Math.abs(remaining).toFixed(2)}!
            </div>
        `;
    } else if (percentage >= 80) {
        budgetAlerts.innerHTML = `
            <div class="budget-alert warning">
                <i class="fas fa-exclamation-circle"></i>
                Warning: You've used ${percentage.toFixed(1)}% of your monthly budget.
            </div>
        `;
    } else if (percentage >= 50) {
        budgetAlerts.innerHTML = `
            <div class="budget-alert success">
                <i class="fas fa-info-circle"></i>
                You're doing well! ${percentage.toFixed(1)}% of budget used.
            </div>
        `;
    }
}

// Export to PDF
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Expense Report', 20, 20);
    
    // Date range
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 20, 35);
    
    // Summary
    const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    doc.text(`Total Expenses: ₹${total.toFixed(2)}`, 20, 50);
    doc.text(`Number of Transactions: ${expenses.length}`, 20, 60);
    
    // Table headers
    let y = 80;
    doc.text('Date', 20, y);
    doc.text('Category', 60, y);
    doc.text('Description', 100, y);
    doc.text('Amount', 160, y);
    
    // Table content
    y += 10;
    expenses.slice(0, 30).forEach(expense => { // Limit to 30 items to fit on page
        doc.text(expense.date, 20, y);
        doc.text(expense.category, 60, y);
        doc.text(expense.description || 'N/A', 100, y);
        doc.text(`₹${parseFloat(expense.amount).toFixed(2)}`, 160, y);
        y += 10;
        
        if (y > 270) { // Start new page if needed
            doc.addPage();
            y = 20;
        }
    });
    
    doc.save('expense-report.pdf');
    showToast('PDF exported successfully!', 'success');
}

// Export to CSV
function exportToCSV() {
    const headers = ['Date', 'Category', 'Description', 'Amount'];
    const csvContent = [
        headers.join(','),
        ...expenses.map(expense => [
            expense.date,
            expense.category,
            expense.description || '',
            expense.amount
        ].map(field => `"${field}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    showToast('CSV exported successfully!', 'success');
}

// Enhanced update summary to include budget progress
const originalUpdateSummary = updateSummary;
updateSummary = function() {
    originalUpdateSummary.call(this);
    updateBudgetProgress();
    updateCharts();
};

// Initialize enhanced features when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for the original initialization to complete
    setTimeout(() => {
        initializeEnhancedFeatures();
    }, 1000);
});
