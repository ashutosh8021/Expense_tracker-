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

// Update weekly trends
function updateWeeklyTrends() {
    const weeklyChart = document.getElementById('weeklyChart');
    const weeklySummary = document.getElementById('weeklySummary');
    
    if (!weeklyChart || !weeklySummary) return;
    
    // Calculate last 7 days
    const today = new Date();
    const weekData = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Initialize week data
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateKey = date.toDateString();
        weekData[dateKey] = {
            amount: 0,
            count: 0,
            day: dayNames[date.getDay()],
            date: date.getDate()
        };
    }
    
    // Populate with expense data
    expenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        const dateKey = expenseDate.toDateString();
        if (weekData[dateKey]) {
            weekData[dateKey].amount += parseFloat(expense.amount);
            weekData[dateKey].count += 1;
        }
    });
    
    const weekArray = Object.values(weekData);
    const maxAmount = Math.max(...weekArray.map(day => day.amount), 1);
    
    // Render weekly chart
    weeklyChart.innerHTML = weekArray.map(day => {
        const height = (day.amount / maxAmount) * 120; // Scale to max 120px
        return `
            <div class="week-day">
                <div 
                    class="week-bar" 
                    style="height: ${height}px;"
                    data-amount="${formatCurrency(day.amount)}"
                    title="${day.day}: ${formatCurrency(day.amount)} (${day.count} transactions)"
                ></div>
                <div class="week-label">${day.day}</div>
            </div>
        `;
    }).join('');
    
    // Calculate weekly stats
    const totalWeekly = weekArray.reduce((sum, day) => sum + day.amount, 0);
    const avgDaily = totalWeekly / 7;
    const mostExpensiveDay = weekArray.reduce((max, day) => day.amount > max.amount ? day : max, weekArray[0]);
    const totalTransactions = weekArray.reduce((sum, day) => sum + day.count, 0);
    
    // Render weekly summary
    weeklySummary.innerHTML = `
        <div class="weekly-stat">
            <div class="weekly-stat-label">Week Total</div>
            <div class="weekly-stat-value">${formatCurrency(totalWeekly)}</div>
        </div>
        <div class="weekly-stat">
            <div class="weekly-stat-label">Daily Average</div>
            <div class="weekly-stat-value">${formatCurrency(avgDaily)}</div>
        </div>
        <div class="weekly-stat">
            <div class="weekly-stat-label">Highest Day</div>
            <div class="weekly-stat-value">${mostExpensiveDay.day} - ${formatCurrency(mostExpensiveDay.amount)}</div>
        </div>
        <div class="weekly-stat">
            <div class="weekly-stat-label">Transactions</div>
            <div class="weekly-stat-value">${totalTransactions}</div>
        </div>
    `;
}

// Update pie chart
function updatePieChart() {
    const pieChart = document.getElementById('pieChart');
    const pieLegend = document.getElementById('pieLegend');
    const pieTotalAmount = document.getElementById('pieTotalAmount');
    
    if (!pieChart || !pieLegend || !pieTotalAmount) return;
    
    if (expenses.length === 0) {
        pieChart.parentElement.parentElement.innerHTML = `
            <div class="pie-empty">
                <i class="fas fa-chart-pie"></i>
                <h4>No expenses to visualize</h4>
                <p>Add some expenses to see the pie chart</p>
            </div>
        `;
        return;
    }
    
    // Calculate category totals
    const categoryTotals = {};
    let totalAmount = 0;
    
    expenses.forEach(expense => {
        const category = expense.category;
        const amount = parseFloat(expense.amount);
        
        if (!categoryTotals[category]) {
            categoryTotals[category] = {
                total: 0,
                color: expense.category_color || getRandomColor(),
                count: 0
            };
        }
        
        categoryTotals[category].total += amount;
        categoryTotals[category].count += 1;
        totalAmount += amount;
    });
    
    // Convert to array and sort by amount
    const categoryArray = Object.entries(categoryTotals)
        .map(([category, data]) => ({
            category,
            total: data.total,
            color: data.color,
            count: data.count,
            percentage: (data.total / totalAmount) * 100
        }))
        .sort((a, b) => b.total - a.total);
    
    // Update total amount
    pieTotalAmount.textContent = formatCurrency(totalAmount);
    
    // Generate pie chart using conic-gradient
    let currentAngle = 0;
    const gradientStops = [];
    
    categoryArray.forEach((item, index) => {
        const angle = (item.percentage / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        
        gradientStops.push(`${item.color} ${startAngle}deg ${endAngle}deg`);
        currentAngle = endAngle;
    });
    
    // Apply the gradient to pie chart
    const gradientString = `conic-gradient(from 0deg, ${gradientStops.join(', ')})`;
    pieChart.style.background = gradientString;
    
    // Generate legend
    pieLegend.innerHTML = categoryArray.map(item => `
        <div class="pie-legend-item" data-category="${item.category}">
            <div class="pie-legend-left">
                <div class="pie-legend-color" style="background-color: ${item.color}"></div>
                <div class="pie-legend-info">
                    <div class="pie-legend-category">${item.category}</div>
                    <div class="pie-legend-percentage">${item.percentage.toFixed(1)}% • ${item.count} transaction${item.count !== 1 ? 's' : ''}</div>
                </div>
            </div>
            <div class="pie-legend-amount">${formatCurrency(item.total)}</div>
        </div>
    `).join('');
    
    // Add hover effects
    const legendItems = pieLegend.querySelectorAll('.pie-legend-item');
    legendItems.forEach((item, index) => {
        item.addEventListener('mouseenter', () => {
            pieChart.style.transform = 'scale(1.05)';
            pieChart.style.filter = 'brightness(1.1)';
        });
        
        item.addEventListener('mouseleave', () => {
            pieChart.style.transform = 'scale(1)';
            pieChart.style.filter = 'brightness(1)';
        });
    });
}

// Generate random color for categories
function getRandomColor() {
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b',
        '#fa709a', '#fee140', '#96deda', '#ffecd2', '#fcb69f',
        '#ffeaa7', '#fd79a8', '#fdcb6e', '#6c5ce7', '#a29bfe'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
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
        updateWeeklyTrends();
        updatePieChart();
        
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
        renderSpendingChart([]);
        return;
    }
    
    // Render the visual chart
    renderSpendingChart(summary);
    
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

// Render spending chart with CSS bars
function renderSpendingChart(summary) {
    const chartContainer = document.getElementById('spendingChart');
    const legendContainer = document.getElementById('chartLegend');
    
    if (!chartContainer || !legendContainer) return;
    
    if (summary.length === 0) {
        chartContainer.innerHTML = `
            <div class="chart-empty">
                <i class="fas fa-chart-bar"></i>
                <p>No data to display</p>
            </div>
        `;
        legendContainer.innerHTML = '';
        return;
    }
    
    // Find the maximum amount for scaling
    const maxAmount = Math.max(...summary.map(item => item.total));
    
    // Create chart bars
    chartContainer.innerHTML = summary.slice(0, 6).map(item => {
        const height = (item.total / maxAmount) * 150; // Scale to max 150px
        const color = item.color || '#667eea';
        
        return `
            <div 
                class="chart-bar" 
                style="height: ${height}px; --bar-color: ${color};"
                data-amount="${formatCurrency(item.total)}"
                data-category="${item.category.substring(0, 8)}"
                title="${item.category}: ${formatCurrency(item.total)}"
            ></div>
        `;
    }).join('');
    
    // Create legend
    legendContainer.innerHTML = summary.slice(0, 6).map(item => {
        const color = item.color || '#667eea';
        const percentage = ((item.total / summary.reduce((sum, s) => sum + s.total, 0)) * 100).toFixed(1);
        
        return `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${color}"></div>
                <span class="legend-text">${item.category} (${percentage}%)</span>
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
        'Travel': 'plane',
        'Groceries': 'shopping-cart',
        'Utilities': 'lightbulb',
        'Rent': 'home',
        'Insurance': 'shield-alt',
        'Dining': 'coffee',
        'Fuel': 'gas-pump',
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

// Delete expense with enhanced confirmation
async function deleteExpense(id) {
    const expense = expenses.find(exp => exp.id === id);
    if (!expense) return;
    
    // Create custom confirmation modal
    const confirmDelete = await showDeleteConfirmation(expense);
    if (!confirmDelete) return;
    
    try {
        // Add visual feedback - fade out the expense item
        const expenseElement = document.querySelector(`[data-expense-id="${id}"]`);
        if (expenseElement) {
            expenseElement.style.opacity = '0.5';
            expenseElement.style.transform = 'translateX(-20px)';
        }
        
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
        updateWeeklyTrends();
        
        showToast(`Expense deleted successfully: ${formatCurrency(expense.amount)} from ${expense.category}`, 'success');
        
    } catch (error) {
        console.error('Error deleting expense:', error);
        showToast('Failed to delete expense', 'error');
        
        // Restore visual state on error
        const expenseElement = document.querySelector(`[data-expense-id="${id}"]`);
        if (expenseElement) {
            expenseElement.style.opacity = '1';
            expenseElement.style.transform = 'translateX(0)';
        }
    } finally {
        hideLoading();
    }
}

// Custom delete confirmation modal
function showDeleteConfirmation(expense) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'delete-modal-overlay';
        modal.innerHTML = `
            <div class="delete-modal">
                <div class="delete-modal-header">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Confirm Delete</h3>
                </div>
                <div class="delete-modal-body">
                    <p>Are you sure you want to delete this expense?</p>
                    <div class="expense-preview">
                        <div class="expense-preview-amount">${formatCurrency(expense.amount)}</div>
                        <div class="expense-preview-category">${expense.category}</div>
                        <div class="expense-preview-description">${expense.description || 'No description'}</div>
                        <div class="expense-preview-date">${new Date(expense.date).toLocaleDateString()}</div>
                    </div>
                    <p class="warning-text">This action cannot be undone.</p>
                </div>
                <div class="delete-modal-actions">
                    <button class="btn btn-secondary cancel-btn">Cancel</button>
                    <button class="btn btn-danger confirm-btn">
                        <i class="fas fa-trash"></i> Delete Expense
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.cancel-btn').onclick = () => {
            document.body.removeChild(modal);
            resolve(false);
        };
        
        modal.querySelector('.confirm-btn').onclick = () => {
            document.body.removeChild(modal);
            resolve(true);
        };
        
        // Close on overlay click
        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                resolve(false);
            }
        };
        
        // Add animation
        setTimeout(() => modal.classList.add('show'), 10);
    });
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

// ============ BUDGET MANAGEMENT ============

let monthlyBudget = 0;

// Initialize budget functionality
function initializeBudget() {
    loadBudget();
    setupBudgetEventListeners();
}

// Load saved budget from localStorage
function loadBudget() {
    const savedBudget = localStorage.getItem('monthlyBudget');
    if (savedBudget) {
        monthlyBudget = parseFloat(savedBudget);
        const budgetInput = document.getElementById('monthlyBudget');
        if (budgetInput) {
            budgetInput.value = monthlyBudget;
        }
        document.getElementById('budgetAmount').textContent = formatCurrency(monthlyBudget);
        updateBudgetProgress();
    }
}

// Setup event listeners for budget features
function setupBudgetEventListeners() {
    const setBudgetBtn = document.getElementById('setBudget');
    if (setBudgetBtn) {
        setBudgetBtn.addEventListener('click', setBudget);
    }
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
    
    if (!progressFill || !budgetText || !budgetAlerts) return;
    
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

// Enhanced update summary to include budget progress and pie chart
const originalUpdateSummary = updateSummary;
updateSummary = function() {
    originalUpdateSummary.call(this);
    updateBudgetProgress();
    updatePieChart();
};

// Initialize budget features when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for the original initialization to complete
    setTimeout(() => {
        initializeBudget();
    }, 500);
});

// Set quick amount
function setQuickAmount(amount) {
    const amountInput = document.getElementById('amount');
    if (amountInput) {
        amountInput.value = amount;
        amountInput.focus();
        
        // Add visual feedback
        amountInput.style.background = 'rgba(102, 126, 234, 0.1)';
        setTimeout(() => {
            amountInput.style.background = '';
        }, 300);
    }
}

// Global function for quick amount buttons
window.setQuickAmount = setQuickAmount;
